# Module Calendrier Intelligent — Doc dev

Point d'entrée : `OrganizePage.tsx` → rendu dans `CalendrierIntelligent.tsx` → intégré dans `src/app/page.tsx`.

## Architecture

```
organize/
├── OrganizePage.tsx          # Orchestrateur principal
├── header/                   # Barre du haut (countdown, mode, vue, recherche, cloche)
├── search/                   # Recherche 75 cours (Fuse.js) + picker de séries
├── calendar/                 # Vues Mois/Semaine/Jour + DnD (@dnd-kit)
├── panels/                   # Backlog, Agenda aujourd'hui, Config auto
├── modals/                   # AddTask, DailyRitual matin/soir, Templates, ExecuteRevision
├── views/                    # Heatmap révisions, Plan macro
├── data/                     # Types, 75 cours, séries mock, userStats, examDate
├── hooks/                    # Logique métier (store, estimation, recherche, etc.)
└── lib/                      # Utilitaires purs (dates, couleurs, algo SR, PDF)
```

## Persistance localStorage

Clé racine : `qe.organize.v1`  
Schéma : `OrganizeState` (voir `data/types.ts`)  
Hook : `useOrganizeStore.ts` — charge au mount, persiste avec debounce 200ms.

## Hooks à brancher sur Supabase

| Hook / Fichier | TODO_SUPABASE | Endpoint cible |
|---|---|---|
| `useOrganizeStore.ts` | `addEvent` | `POST /api/organize/events` |
| `useOrganizeStore.ts` | `updateEvent` | `PATCH /api/organize/events/:id` |
| `useOrganizeStore.ts` | `deleteEvent` | `DELETE /api/organize/events/:id` |
| `useOrganizeStore.ts` | `addToBacklog` | `POST /api/organize/backlog` |
| `useOrganizeStore.ts` | `removeFromBacklog` | `DELETE /api/organize/backlog/:id` |
| `useOrganizeStore.ts` | `addNotification` | `POST /api/organize/notifications` |
| `data/userStats.ts` | `MOCK_USER_STATS` | `GET /api/stats/kpi` |
| `data/series.ts` | `getSeriesForCourse` | `GET /api/courses/:id/series` |

## Algorithme de répétition espacée

`lib/spacedRepetitionAlgo.ts` :
- `generateRevisions(parent, config)` : génère les slots J2/J7/J10/J30 à partir d'un event complété
- `rescheduleOverdueRevisions(events, hour)` : décale à aujourd'hui les révisions en retard
- `computeStreak(events)` : streak de jours consécutifs avec ≥1 event `done`

Déclenché dans `useSpacedRepetition.ts` au mount + toutes les 60s.

## Estimation durée

`hooks/useEstimation.ts` → `estimateDuration(nQcm)` :
```
secondes = nQcm × avgTimePerQcmSimple
minutes  = ceil(secondes / 60)
retour   = ceil(minutes / 5) × 5   // multiple de 5 supérieur
```
Si `avgTimePerQcmSimple === null` → retourne `null` → afficher "—" (jamais de valeur par défaut).

## Données mock

- `data/courses.ts` : 75 cours réalistes (J1 : 37, J2 : 38), 20 completed / 15 in_progress / 40 not_started
- `data/series.ts` : génération déterministe 8-12 séries/cours via seed pseudo-aléatoire
- `data/mockEvents.ts` : 25 events pré-remplis (5 faits, 5 à venir, 8 sur 2 sem., 5 en retard, 2 révisions auto)
- `data/examDate.ts` : défaut 15/09/2026, modifiable via popover ExamCountdown

## Raccourcis clavier

- `⌘K` / `Ctrl+K` : ouvre CourseSearchModal
- `N` : ouvre AddTaskDialog (hors input/textarea)
