export function printWeek(weekLabel: string, examCountdown: number): void {
  const styleId = "qe-print-style";
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      @media print {
        body > *:not(#qe-print-root) { display: none !important; }
        #qe-print-root { display: block !important; }
        .no-print { display: none !important; }
        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        body { background: white !important; color: black !important; }
        .dark { --background: #fff; --foreground: #0f172a; --card: #fff; --border: #e2e8f0; }
      }
      @page { margin: 16mm; }
    `;
    document.head.appendChild(style);
  }

  const calEl = document.getElementById("qe-week-calendar");
  if (!calEl) { window.print(); return; }

  // Wrap calendar in print root
  const root = document.createElement("div");
  root.id = "qe-print-root";
  root.style.display = "none";

  const header = document.createElement("div");
  header.style.cssText = "display:flex;justify-content:space-between;margin-bottom:12px;font-family:sans-serif;";
  header.innerHTML = `<strong>QE.tn — Semaine du ${weekLabel}</strong><span>J-${examCountdown} avant le résidanat · Imprimé le ${new Date().toLocaleDateString("fr-TN")}</span>`;

  const clone = calEl.cloneNode(true) as HTMLElement;
  root.appendChild(header);
  root.appendChild(clone);
  document.body.appendChild(root);

  window.print();

  document.body.removeChild(root);
}
