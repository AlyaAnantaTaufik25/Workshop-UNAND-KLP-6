import { useEffect } from 'react';

/**
 * Tabel → kartu di layar kecil, untuk SEMUA tabel data tanpa mengubah tiap halaman.
 * Setiap <td> diberi data-label dari judul kolom (<th>) yang sama, lalu CSS
 * (.ui-cardable di design-language.css) menampilkan baris sebagai kartu ≤ 720px.
 * Tabel dengan kelas "no-cards" atau tanpa <thead> dibiarkan.
 */
function labelTable(table) {
  if (table.classList.contains('no-cards')) return;
  const head = table.tHead;
  if (!head || !head.rows.length) return;
  const headers = [];
  for (const th of head.rows[head.rows.length - 1].cells) {
    let text = (th.textContent || '').replace(/\s+/g, ' ').trim();
    // Judul kolom yang ditulis kapital semua → huruf kalimat agar mudah dibaca di kartu
    if (/[A-Z]/.test(text) && text === text.toUpperCase()) text = text.charAt(0) + text.slice(1).toLowerCase();
    const span = th.colSpan || 1;
    for (let i = 0; i < span; i += 1) headers.push(text);
  }
  for (const body of table.tBodies) {
    for (const row of body.rows) {
      let col = 0;
      for (const cell of row.cells) {
        const label = headers[col] || '';
        if (cell.getAttribute('data-label') !== label) cell.setAttribute('data-label', label);
        if (cell.colSpan > 1) cell.classList.add('ui-cell-span');
        col += cell.colSpan || 1;
      }
    }
  }
  table.classList.add('ui-cardable');
}

export default function ResponsiveTables() {
  useEffect(() => {
    let queued = false;
    const scan = () => {
      queued = false;
      document.querySelectorAll('main table, .content-container table, .peserta-content table').forEach(labelTable);
    };
    const queue = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(scan);
    };
    scan();
    const observer = new MutationObserver(queue);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);
  return null;
}
