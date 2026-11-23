import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './ui-polish.css';

/**
 * Paginasi sisi klien untuk tabel/daftar panjang.
 *   const { pageItems, pager } = usePagination(filtered, 10);
 *   ...{pageItems.map(...)} ... {pager}
 */
// eslint-disable-next-line react-refresh/only-export-components
export function usePagination(items, pageSize = 10) {
  const [page, setPage] = useState(1);
  const total = items.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));

  // Kembali ke halaman 1 saat hasil filter berubah jumlahnya
  useEffect(() => { setPage(1); }, [total]);
  const current = Math.min(page, pages);

  const pageItems = useMemo(
    () => items.slice((current - 1) * pageSize, current * pageSize),
    [items, current, pageSize],
  );

  const pager = <Pagination page={current} pages={pages} total={total} pageSize={pageSize} onChange={setPage} />;
  return { pageItems, page: current, pages, setPage, pager };
}

export default function Pagination({ page, pages, total, pageSize, onChange }) {
  if (total <= pageSize) {
    return total > 0 ? <div className="ui-pager"><span className="ui-pager-info">{total} data</span></div> : null;
  }
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);

  // Nomor halaman ringkas: 1 … 4 5 6 … 12
  const nums = [];
  for (let i = 1; i <= pages; i += 1) {
    if (i === 1 || i === pages || Math.abs(i - page) <= 1) nums.push(i);
    else if (nums[nums.length - 1] !== '…') nums.push('…');
  }

  return (
    <nav className="ui-pager" aria-label="Navigasi halaman">
      <span className="ui-pager-info">Menampilkan {from}–{to} dari {total} data</span>
      <div className="ui-pager-buttons">
        <button type="button" className="ui-pager-btn" onClick={() => onChange(page - 1)} disabled={page <= 1} aria-label="Halaman sebelumnya">
          <ChevronLeft size={15} />
        </button>
        {nums.map((n, i) => n === '…'
          ? <span key={`gap-${i}`} className="ui-pager-gap">…</span>
          : (
            <button type="button" key={n} className={`ui-pager-btn${n === page ? ' is-active' : ''}`} onClick={() => onChange(n)} aria-current={n === page ? 'page' : undefined}>
              {n}
            </button>
          ))}
        <button type="button" className="ui-pager-btn" onClick={() => onChange(page + 1)} disabled={page >= pages} aria-label="Halaman berikutnya">
          <ChevronRight size={15} />
        </button>
      </div>
    </nav>
  );
}

/** Tombol aksi ikon ringkas untuk kolom "Tindakan" tabel */
export function IconAction({ icon: Icon, label, tone = 'default', onClick, disabled }) {
  return (
    <button type="button" className={`ui-icon-action ui-icon-action--${tone}`} onClick={onClick} disabled={disabled} title={label} aria-label={label}>
      <Icon size={15} />
    </button>
  );
}
