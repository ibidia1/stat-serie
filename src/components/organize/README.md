# Module Calendrier Intelligent — Documentation développeur

Point d'entrée : `OrganizePage.tsx` → rendu par `CalendrierIntelligent.tsx` → intégré dans `src/app/page.tsx`.

> **Statut** : front complet et fonctionnel sur données locales (`localStorage`).
> Tout ce qui doit être remplacé par des appels API est marqué `TODO_SUPABASE` /
> `TODO_API` dans le code et listé au §12.

---

## Sommaire

1. [Vue d'ensemble en 30 secondes](#1-vue-densemble-en-30-secondes)
2. [Architecture des dossiers](#2-architecture-des-dossiers)
3. [Modèle de données](#3-modèle-de-données)
4. [Le store (source de vérité)](#4-le-store--source-de-vérité)
5. [Les 3 vues du calendrier](#5-les-3-vues-du-calendrier)
6. [Règle d'or : aucun chevauchement](#6-règle-dor--aucun-chevauchement)
7. [Répétition espacée](#7-répétition-espacée)
8. [Interactions souris (drag & drop, pan, resize)](#8-interactions-souris)
9. [Ajout de séances : les 4 chemins](#9-ajout-de-séances--les-4-chemins)
10. [Modules périphériques](#10-modules-périphériques)
11. [Constantes de réglage](#11-constantes-de-réglage)
12. [Branchement back-end](#12-branchement-back-end)
13. [Invariants à ne pas casser](#13-invariants-à-ne-pas-casser)

---

## 1. Vue d'ensemble en 30 secondes

Le module gère un **agenda de révision** pour un étudiant en médecine préparant le résidanat.

- L'étudiant **planifie des séances** (`qcm`, `lecture`) tirées d'un catalogue de **75 items officiels**.
- Chaque séance peut engendrer des **révisions espacées** (J2 / J7 / J10 / J30) **rattachées** à leur cours source.
- Le calendrier **empêche physiquement** deux activités au même moment et respecte des **plages bloquées** (cours à la fac, repas…).
- Tout est **manipulable à la souris** : déplacer, redimensionner, naviguer dans le temps.

Flux de données, en une ligne :

```
useOrganizeStore (état + localStorage)
        ↓ state / actions
   OrganizePage (orchestrateur : toutes les règles métier vivent ici)
        ↓ props
   CalendarView → MonthView | WeekView | DayView → EventCard
```

**Règle d'architecture importante** : les composants de vue sont « bêtes ». Ils
affichent et remontent des intentions (`onMoveEvent`, `onOpenActions`…).
**Aucune décision métier n'est prise dans les vues** — tout est arbitré dans
`OrganizePage.tsx`. C'est là qu'un dev doit chercher en priorité.

---

## 2. Architecture des dossiers

```
organize/
├── OrganizePage.tsx          # Orchestrateur : état UI + règles métier + toasts
├── calendar/                 # Rendu du calendrier et interactions
│   ├── CalendarView.tsx      # Aiguillage de vue + navigation temporelle (pan)
│   ├── WeekView.tsx          # Grille horaire 7 jours (vue principale)
│   ├── MonthView.tsx         # Grille mensuelle
│   ├── DayView.tsx           # Liste d'une journée
│   ├── EventCard.tsx         # Carte d'une séance (drag, resize, actions)
│   ├── ChainConnectors.tsx   # Lignes reliant un cours à ses révisions
│   ├── EventActionPopover.tsx# Menu « Créer une révision liée »
│   ├── DragDropContext.tsx   # Arbitrage de tous les drops (@dnd-kit)
│   └── gridConstants.ts      # Géométrie de la grille (heures, px, snap)
├── header/                   # Countdown examen, mode manuel/auto, switch de vue
├── search/                   # Recherche des 75 cours (Fuse.js) + choix de série
├── panels/                   # Backlog, agenda du jour, config du mode auto
├── modals/                   # Ajout, plages bloquées, templates, rituels, exécution
├── views/                    # Heatmap de régularité, plan macro
├── data/                     # Types + catalogue + séries + KPI + date d'examen
├── hooks/                    # Store, répétition espacée, notifications, estimation
└── lib/                      # Fonctions pures : dates, conflits, chaînes, algo SR
```

---

## 3. Modèle de données

Tout est défini dans **`data/types.ts`**. Les deux entités centrales :

### `CalendarEvent` — une séance du calendrier

| Champ | Type | Rôle |
|---|---|---|
| `id` | `string` | Identifiant unique |
| `type` | `"qcm" \| "lecture" \| "revision_slot"` | Nature de la séance (pilote la couleur) |
| `courseId` | `number` | **`Course.id`**, pas le numéro d'item |
| `seriesId` | `string?` | Série de QCM choisie |
| `title` | `string` | Libellé affiché (préfixé d'un emoji : ✍️ / 📖 / 🔁) |
| `startDate` | `string` | Jour, format `YYYY-MM-DD` |
| `startTime` | `string` | Heure de début, format `HH:mm` |
| `durationMinutes` | `number` | Durée |
| `estimatedFromKpi` | `boolean` | La durée vient-elle d'une estimation auto ? |
| `isRevision` | `boolean` | `true` pour une révision espacée |
| `revisionInterval` | `"J2" \| "J7" \| …` | Rang dans le plan de révision |
| `parentEventId` | `string?` | **Clé du rattachement** au cours source |
| `status` | `"upcoming" \| "done" \| "skipped" \| "rescheduled"` | Cycle de vie |
| `completedAt` | `string?` | Horodatage de complétion (sert au streak) |

> ⚠️ `parentEventId` est le pivot de toute la répétition espacée : c'est lui qui
> permet de dessiner les liens et de décaler une chaîne entière. Le préserver
> lors de toute mutation.

### `Course` — un item du programme

```ts
{ id: 1, number: 65, title: "SCA", shortTitle: "SCA",
  specialty: "Cardiologie-CCVT", day: "J1", status: "not_started" }
```

- **`id`** = clé technique **unique** (1→75). C'est ce que référence `CalendarEvent.courseId`.
- **`number`** = numéro d'item **officiel**, affiché (`#65`) et recherchable.
  Il **n'est pas unique** : dans le programme fourni, deux items portent le n° 37
  et deux le n° 71 (les n° 19 et 36 sont donc inutilisés). **Ne jamais utiliser
  `number` comme clé.**

Autres types : `BlockedRange` (plage non planifiable), `BacklogItem` (à planifier),
`AutoModeConfig`, `AppNotification`, `OrganizeState`.

---

## 4. Le store — source de vérité

**`hooks/useOrganizeStore.ts`**

- État complet dans un objet `OrganizeState`, persisté sous la clé
  **`qe.organize.v1`** (`localStorage`), écriture **debouncée à 200 ms**.
- Lecture au montage seulement (pas de synchronisation multi-onglets).

### Actions exposées

| Action | Effet |
|---|---|
| `addEvent(ev)` | Crée une séance, **retourne l'objet créé** (avec son `id`) |
| `addManyEvents(evs)` | Ajout en lot (génération d'un plan, templates) |
| `updateEvent(id, patch)` | Mise à jour partielle |
| `deleteEvent(id)` | Suppression |
| `markDone(id)` | Passe à `done` + horodate `completedAt` |
| `addToBacklog(item)` / `removeFromBacklog(id)` | File « À planifier » |
| `setAutoMode(patch)` | Active/configure la génération automatique |
| `addBlockedRange(r)` / `removeBlockedRange(id)` | Plages non planifiables |
| `addNotification(n)` / `markNotifRead(id)` / `markAllNotifsRead()` | Cloche |
| `setPreference(k, v)` | Vue courante, rituels effectués |
| `setExamDate(iso)` | Date du concours (countdown) |

> **Important pour le back** : ces actions sont **optimistes** (l'UI se met à jour
> immédiatement). En branchant l'API, conserver ce comportement et gérer le
> rollback en cas d'échec, sinon toutes les interactions deviendront saccadées.

---

## 5. Les 3 vues du calendrier

`CalendarView.tsx` choisit la vue et détient les curseurs temporels
(`weekStart`, `dayDate`, `yearMonth`).

### Vue Semaine (`WeekView.tsx`) — vue principale

- Grille horaire **07 h → 22 h**, une colonne par jour, **7 jours**.
- **Fenêtre glissante** : le jour de début est libre. On peut afficher
  **mercredi → mardi** pour voir la jonction entre deux semaines.
  Navigation : `«` −1 semaine · `‹` −1 jour · `›` +1 jour · `»` +1 semaine.
- Affiche : trait de l'heure courante, **plages bloquées hachurées**,
  créneaux libres suggérés pendant un drag, liens de révision, légende.
- Positionnement d'une carte :
  `top = (minutesDepuis07h / 60) × PX_PER_HOUR`, hauteur ∝ durée (min. 30 px).

### Vue Mois (`MonthView.tsx`)

- Grille 7 colonnes. Jusqu'à **3 séances par jour** puis « +N de plus ».
- Drag possible **de jour à jour** (l'heure est conservée).
- Jours passés non droppables.

### Vue Jour (`DayView.tsx`)

- Liste chronologique simple, orientée action (Fait ✅ / Lancer 🔁 / Supprimer).

---

## 6. Règle d'or : aucun chevauchement

**`lib/conflicts.ts`** — fonctions pures, testables, sans React.

| Fonction | Rôle |
|---|---|
| `eventRange(e)` | Convertit une séance en `{start, end}` (minutes depuis minuit) |
| `rangesOverlap(a, b)` | `a.start < b.end && b.start < a.end` |
| `findConflict(events, day, startMin, durMin, ignoreId?)` | **Retourne la séance en conflit** (ou `null`) — sert à nommer le coupable dans le message |
| `hasConflict(...)` | Version booléenne |
| `blockedSpansForDay(ranges, dateISO)` | Plages bloquées applicables à cette date (récurrence par jour de semaine) |
| `findBlocked(spans, startMin, durMin)` | Plage bloquée heurtée (ou `null`) |
| `findFreeSlot(events, day, desiredStartMin, durMin, opts)` | **Premier créneau libre** : balaie vers l'avant depuis l'heure souhaitée, puis reboucle au début de journée. `null` si la journée est pleine |
| `freeIntervals(events, blocked, day, durMin, ignoreId?)` | Tous les intervalles libres (surlignage vert pendant un drag) |
| `clampStart(startMin, durMin)` | Borne dans la journée 07 h–22 h |
| `snap(min, step)` | Aligne sur un pas de **15 min** |

**Cette règle s'applique à 100 % des points d'entrée** — c'est le point le plus
important à préserver :

| Point d'entrée | Comportement en cas de conflit |
|---|---|
| Glisser-déposer | **Refus** + toast nommant la séance occupante |
| Redimensionnement | **Refus** + toast |
| Ajout manuel | **Décalage** automatique au prochain créneau libre + toast |
| Drop depuis le backlog | Décalage automatique |
| Templates | Décalage automatique, séance par séance |
| Génération auto de révisions | Décalage automatique |
| Replanification des retards | Répartition dans les créneaux libres |

Les deux helpers d'`OrganizePage` qui portent cette logique :

- **`placeAndAddEvent(ev)`** — ajoute **une** séance en la déplaçant si besoin.
  Retourne `null` si la journée est pleine.
- **`addEventsResolved(batch)`** — ajoute **un lot** en réservant au fur et à
  mesure (chaque séance placée devient un obstacle pour les suivantes),
  ce qui évite qu'un plan généré s'auto-chevauche.

---

## 7. Répétition espacée

### Construction des chaînes — `lib/chains.ts`

Une **chaîne** = un cours source + toutes ses révisions.

- `chainKey(e)` → `e.parentEventId ?? e.id`. Toutes les séances d'une même chaîne partagent cette clé.
- `buildChains(events)` → regroupe, trie chronologiquement, attribue une **couleur stable** (`CHAIN_COLORS`, 8 teintes).
  Seules les chaînes contenant **au moins une révision** sont retournées (un QCM isolé n'est pas un « plan »).

### Affichage des liens — `ChainConnectors.tsx`

- Overlay SVG qui **mesure la position réelle des cartes dans le DOM**
  (attribut `data-event-id`) plutôt que de recalculer une géométrie.
  → Le même composant fonctionne en vue Semaine **et** Mois, et reste juste
  après un scroll, un resize ou une animation.
- Trace des **courbes de Bézier** entre séances consécutives.
  Nœud plein = cours source, nœud creux = révision.
- **Affichage à la demande** : par défaut aucun lien. Cliquer une séance affiche
  **uniquement sa chaîne** (`selectedKey`) et estompe les autres. Le bouton 🔗 de
  la barre active un mode « tout afficher » (`showAll`).

### Algorithmes — `lib/spacedRepetitionAlgo.ts`

| Fonction | Détail |
|---|---|
| `generateRevisions(parent, config)` | Crée une révision par intervalle de `config.intervals` (défaut `[2, 7, 10, 30]`), à `config.preferredHour`, avec `parentEventId = parent.id`. Retourne `[]` si le mode auto est désactivé |
| `rescheduleOverdueRevisions(events, hour, blocked)` | Ramène à aujourd'hui les révisions en retard, **réparties dans des créneaux libres** (et non toutes empilées à la même heure), statut → `rescheduled` |
| `computeStreak(events)` | Jours consécutifs jusqu'à aujourd'hui avec ≥ 1 séance `done` |
| `computeBestStreak(events)` | Meilleure série historique |
| `computeAdherence(events)` | `{ doneCount, onTimeCount, onTimeRate, avgDelayDays, overdueCount }` |

Déclenchement : **`hooks/useSpacedRepetition.ts`**, au montage puis toutes les **60 s**.

### Les deux façons de créer un plan

1. **Manuelle, depuis le calendrier** — clic sur un cours → `EventActionPopover`
   → boutons **J2 / J7 / J10 / J30** ou intervalle personnalisé.
   Traité par `handleCreateRevision(parent, days)` : une révision, liée, placée sans conflit, annulable.
2. **Automatique** — bascule **Manuel → Auto** (`header/ModeToggle`), réglage des
   intervalles dans `panels/AutoModeConfig`. Le plan complet est alors généré à la
   planification d'un cours ou à son passage en « fait ».

### Décalage d'une chaîne entière

Quand on déplace un **cours source** qui possède des révisions, un toast propose
**« Décaler (+N j) »** → `shiftChainRevisions(children, dayDelta)` applique le
même décalage à toutes les révisions non faites, sans conflit et jamais dans le passé.

---

## 8. Interactions souris

### Navigation temporelle — glisser le calendrier

Implémentée dans `CalendarView.tsx` (`onPanDown/Move/Up`).

- On attrape le fond du calendrier et on tire **horizontalement**.
- **Détection d'axe** : au-delà de 10 px, si le mouvement est plutôt horizontal
  → navigation ; s'il est plutôt vertical → le geste est relâché pour laisser le
  **scroll des heures** fonctionner normalement.
- **Vers la gauche = avancer** dans le temps (on « tire » la feuille).
  Pas : `PAN_STEP_PX = 150` px par unité (semaine / mois / jour selon la vue).
- Les cartes, boutons et champs sont exclus du geste (`data-event-id, button, input, a, select, [data-no-pan]`).

### Déplacer une séance (drag & drop)

- Basé sur **@dnd-kit**. `EventCard` est `useDraggable`, les colonnes de jour sont `useDroppable`.
- Tout est arbitré dans **`DragDropContext.tsx`** :
  1. Jour passé → refus.
  2. **Heure du drop** calculée depuis la position **réelle à l'écran** de la carte
     et de la colonne (`getBoundingClientRect`) — et non depuis les deltas de
     dnd-kit, qui dérivent quand la grille défile automatiquement pendant le geste.
     *(bug rencontré et corrigé : ne pas revenir aux deltas)*
  3. Alignement sur 15 min + bornage dans la journée.
  4. Plage bloquée → refus. Chevauchement → refus.
  5. Sinon `onMoveEvent(id, date, time)`.
- Vue Mois : déplacement au jour, heure conservée.

### Redimensionner une séance

Poignée en bas de `EventCard` (vue Semaine). Aperçu live de la durée pendant le
geste, validation à la relâche via `handleResizeEvent` (refus si conflit ou plage bloquée).

### Planifier depuis le backlog

Les cartes de `BacklogPanel` sont draggables (`kind: "backlog"`). Le drop sur un
créneau crée la séance (durée estimée depuis la série), retire l'élément du
backlog, et propose « Annuler ».

---

## 9. Ajout de séances : les 4 chemins

| Chemin | Déclencheur | Handler |
|---|---|---|
| **Bouton +** (flottant) ou « Ajouter » / touche `N` | `AddTaskDialog` | `placeAndAddEvent` |
| **Recherche ⌘K** → choix d'une série | `CourseSearchModal` → `SeriesPickerPopover` | `handleScheduleFromPicker` |
| **Drop du backlog** sur un créneau | drag | `handleBacklogDrop` |
| **Template** de plan | `TemplateLibraryDialog` | `handleTemplateApply` → `addEventsResolved` |

**Estimation de durée** — `hooks/useEstimation.ts` :

```
secondes = nQcm × avgTimePerQcmSimple
minutes  = ceil(secondes / 60)
retour   = ceil(minutes / 5) × 5      // arrondi au multiple de 5 supérieur
```

Si le KPI est `null` (utilisateur sans historique) → retourne `null` → l'UI doit
afficher « — ». **Ne jamais inventer une durée par défaut.**

---

## 10. Modules périphériques

| Module | Fonction |
|---|---|
| `header/ExamCountdown` | Badge `J-58`, date modifiable |
| `header/ModeToggle` | Manuel ↔ Auto (génération des révisions) |
| `header/ViewSwitcher` | Mois / Semaine / Jour |
| `search/CourseSearchModal` | Recherche floue **Fuse.js** sur les 75 items, par nom **ou numéro** (`#65`), navigation clavier |
| `panels/TodayAgendaPanel` | Séances du jour + à venir |
| `panels/BacklogPanel` | File « À planifier », source de drag |
| `panels/NotificationsBell` | Cloche + liste |
| `panels/AutoModeConfig` | Intervalles et heure préférée |
| `modals/BlockedRangesDialog` | CRUD des plages bloquées (libellé, jours L→D, horaires) |
| `modals/ExecuteTaskDialog` | Lancement d'une révision — **stub `console.log`, à brancher sur la page QCM** |
| `views/RevisionHeatmap` | Heatmap 12 mois (style GitHub) + streaks + alertes de retard |
| `views/MacroPlanView` | Vue macro jusqu'au concours |
| `lib/pdfExport` | Impression de la semaine (`printWeek`) |
| `hooks/useNotifications` | Génère : `task_due_today`, `revision_overdue`, `milestone` (streak) |
| `hooks/useDailyRitual` | Rituel matin (à l'ouverture) et soir (à partir de 18 h), une fois par jour |
| `hooks/useKeyboardShortcuts` | `⌘K`/`Ctrl+K` → recherche · `N` → ajout (désactivé dans les champs) |

---

## 11. Constantes de réglage

**`calendar/gridConstants.ts`** — modifier ici et **nulle part ailleurs** :

```ts
HOURS_START  = 7     // début de journée affichée
HOURS_END    = 22    // fin de journée affichée
PX_PER_HOUR  = 68    // hauteur d'une heure → pilote la taille des cartes
SNAP_MINUTES = 15    // pas d'alignement au drag et au resize
GRID_HEIGHT  = (HOURS_END - HOURS_START) × PX_PER_HOUR
DAY_START_MIN / DAY_END_MIN   // bornes en minutes, utilisées par les conflits
```

Autres réglages : `PAN_STEP_PX` (`CalendarView.tsx`), `CHAIN_COLORS` (`lib/chains.ts`),
`EVENT_COLORS` (`lib/colors.ts`), `DEFAULT_EXAM_DATE` (`data/examDate.ts`).

---

## 12. Branchement back-end

Persistance actuelle : `localStorage`, clé `qe.organize.v1`.
Point d'insertion unique : **`hooks/useOrganizeStore.ts`** (les composants ne
touchent jamais au stockage). Remplacer le corps des actions par des appels API
suffit — aucune vue n'est à modifier.

| Fichier | Élément | Endpoint cible |
|---|---|---|
| `useOrganizeStore.ts` | `addEvent` | `POST /api/organize/events` |
| `useOrganizeStore.ts` | `updateEvent` | `PATCH /api/organize/events/:id` |
| `useOrganizeStore.ts` | `deleteEvent` | `DELETE /api/organize/events/:id` |
| `useOrganizeStore.ts` | `addManyEvents` | `POST /api/organize/events/bulk` |
| `useOrganizeStore.ts` | `addToBacklog` / `removeFromBacklog` | `…/api/organize/backlog` |
| `useOrganizeStore.ts` | `addBlockedRange` / `removeBlockedRange` | `…/api/organize/blocked-ranges` |
| `useOrganizeStore.ts` | `addNotification` | `POST /api/organize/notifications` |
| `data/courses.ts` | `COURSES` | `GET /api/courses` |
| `data/series.ts` | `getSeriesForCourse` | `GET /api/courses/:id/series` |
| `data/userStats.ts` | `MOCK_USER_STATS` | `GET /api/stats/kpi` |
| `modals/ExecuteTaskDialog` | `onLaunch` (stub) | Navigation vers la session QCM |

**Schéma SQL suggéré** pour `organize_events` : reprendre `CalendarEvent` tel quel,
avec `parent_event_id` en auto-référence (`ON DELETE CASCADE` si l'on veut que la
suppression d'un cours emporte ses révisions) et un index sur
`(user_id, start_date)` — toutes les requêtes du calendrier filtrent par plage de dates.

---

## 13. Invariants à ne pas casser

1. **Aucun chevauchement, jamais** — tout nouveau point d'entrée doit passer par
   `findFreeSlot` (placement) ou `findConflict` + `findBlocked` (validation).
2. **`parentEventId` est sacré** — c'est le seul lien entre un cours et ses
   révisions. Le perdre casse les lignes, le décalage de chaîne et l'adhérence.
3. **`Course.id` ≠ `Course.number`** — toujours référencer `id` ; `number` est
   un libellé (non unique).
4. **Positions mesurées, pas calculées** — pour le drop et les liens, utiliser
   `getBoundingClientRect` sur les éléments `data-event-id`. Les deltas dnd-kit
   dérivent pendant l'auto-scroll.
5. **`estimateDuration` peut retourner `null`** — l'afficher comme « — », ne pas
   substituer de valeur arbitraire.
6. **Les vues restent sans logique métier** — toute nouvelle règle va dans
   `OrganizePage.tsx` ou dans `lib/` (fonctions pures).
7. **Le store écrit en debounce (200 ms)** — ne pas déclencher de rechargement
   synchrone après une action, l'UI est déjà optimiste.
