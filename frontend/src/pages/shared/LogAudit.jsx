import { useMemo } from 'react';
import { Search, ShieldCheck, Fingerprint } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Select from '../../components/Select';
import Pagination from '../../components/Pagination';
import useApi from '../../hooks/useApi';
import useUrlState from '../../hooks/useUrlState';
import { auditApi } from '../../api';
import { ErrorNotice, PageLoader } from '../../components/RequireRole';
import { useAuth } from '../../context/AuthContext';
import './log-audit.css';

const ACTION_LABEL = {
  'auth.login': 'Masuk',
  'auth.logout': 'Keluar',
  'auth.login_failed': 'Gagal masuk',
  'auth.login_locked': 'Akun dikunci',
  'auth.login_blocked': 'Masuk ditolak (terkunci)',
  'auth.password_changed': 'Kata sandi diubah',
  'tte.pin_failed': 'PIN TTE salah',
  'tte.pin_locked': 'PIN TTE dikunci',
  'tte.pin_blocked': 'PIN TTE ditolak (terkunci)',
  'tte.pin_changed': 'PIN TTE diubah',
  'tte.pin_reset': 'PIN TTE direset',
  'certificate.submit': 'Pengajuan sertifikat',
  'certificate.verify': 'Verifikasi draft',
  'certificate.sign': 'Tanda tangan elektronik',
  'certificate.issue': 'Sertifikat diterbitkan',
  'correction.proses': 'Perbaikan diproses',
  'correction.tolak': 'Perbaikan ditolak',
  'correction.selesai': 'Perbaikan selesai',
  'replacement.approve': 'Dokumen pengganti disetujui',
  'replacement.sign': 'TTE dokumen pengganti',
};
const TONE = action => (/failed|locked|blocked|tolak/.test(action) ? 'bad' : /sign|issue/.test(action) ? 'good' : /tte|password/.test(action) ? 'warn' : 'mute');

const KATEGORI = [
  { value: '', label: 'Semua aktivitas' },
  { value: 'auth', label: 'Login & akun' },
  { value: 'tte', label: 'PIN tanda tangan' },
  { value: 'certificate', label: 'Sertifikat' },
  { value: 'correction', label: 'Perbaikan sertifikat' },
  { value: 'replacement', label: 'Dokumen pengganti' },
];

/** Ringkas user-agent → "Chrome · Windows" */
function device(ua = '') {
  if (!ua) return '-';
  const browser = /Edg\//.test(ua) ? 'Edge' : /Chrome\//.test(ua) ? 'Chrome' : /Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : /curl|node|axios|Postman/i.test(ua) ? 'Klien API' : 'Lainnya';
  const os = /Windows/.test(ua) ? 'Windows' : /Android/.test(ua) ? 'Android' : /iPhone|iPad/.test(ua) ? 'iOS' : /Mac OS/.test(ua) ? 'macOS' : /Linux/.test(ua) ? 'Linux' : '';
  return [browser, os].filter(Boolean).join(' · ');
}

export default function LogAudit() {
  const { user } = useAuth();
  const isHumas = user?.role === 'humas';
  const [q, setQ] = useUrlState('q');
  const [kategori, setKategori] = useUrlState('kategori');
  const [pageParam, setPage] = useUrlState('page', '1');
  const page = Math.max(1, parseInt(pageParam, 10) || 1);
  const kategoriList = isHumas ? KATEGORI : KATEGORI.filter(k => !['auth', 'tte'].includes(k.value));

  // Pagination & pencarian dilakukan di server
  const { data, loading, error, reload } = useApi(() => auditApi.list({ q: q || undefined, action: kategori || undefined, page, limit: 20 }), [q, kategori, page]);
  const items = useMemo(() => data?.items || [], [data]);
  const meta = data?.meta || { page: 1, pages: 1, total: 0, limit: 20 };

  return (
    <div>
      <PageHeader
        title="Log Audit"
        description={isHumas
          ? 'Jejak tindakan penting: login, PIN tanda tangan, verifikasi, TTE, penerbitan, dan perbaikan sertifikat.'
          : 'Jejak tindakan pada sertifikat: pengajuan, verifikasi, tanda tangan elektronik, dan penerbitan.'}
      />

      <div className="filter-bar ui-audit-filters">
        <div className="search-wrap" style={{ flex: 1 }}>
          <Search size={15} className="search-icon" />
          <input className="search-input" placeholder="Cari deskripsi, nama pengguna, atau IP…" defaultValue={q}
            onKeyDown={e => { if (e.key === 'Enter') { setQ(e.currentTarget.value.trim()); setPage('1'); } }}
            onBlur={e => { if (e.currentTarget.value.trim() !== q) { setQ(e.currentTarget.value.trim()); setPage('1'); } }} />
        </div>
        <Select className="filter-select" value={kategori} onChange={e => { setKategori(e.target.value); setPage('1'); }} aria-label="Kategori aktivitas">
          {kategoriList.map(k => <option key={k.value} value={k.value}>{k.label}</option>)}
        </Select>
      </div>

      <ErrorNotice error={error} onRetry={reload} />
      {loading && !data ? <PageLoader /> : (
        <div className="table-container ui-audit-table">
          <table className="data-table">
            <thead>
              <tr><th>Waktu</th><th>Pengguna</th><th>Tindakan</th><th>Keterangan</th><th>IP · Perangkat</th></tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr><td colSpan={5} className="ui-empty-cell"><div className="ui-empty"><ShieldCheck size={30} aria-hidden="true" /><div className="ui-empty-text">Belum ada aktivitas yang cocok dengan filter.</div></div></td></tr>
              ) : items.map(it => (
                <tr key={it.id}>
                  <td className="ui-audit-time">{it.waktu}</td>
                  <td><strong>{it.pengguna || 'Tidak dikenal'}</strong>{it.peran && <small className="ui-audit-role">{it.peran}</small>}</td>
                  <td><span className={`ui-badge ui-audit-badge ui-audit-badge--${TONE(it.action)}`}>{ACTION_LABEL[it.action] || it.action}</span></td>
                  <td className="ui-audit-desc">
                    {it.deskripsi}
                    {it.docHash && <span className="ui-audit-hash" title={`SHA-256 dokumen: ${it.docHash}`}><Fingerprint size={13} aria-hidden="true" /> {it.docHash.slice(0, 16)}…</span>}
                  </td>
                  <td className="ui-audit-ip"><span>{it.ip || '-'}</span><small>{device(it.perangkat)}</small></td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination page={meta.page} pages={meta.pages} total={meta.total} pageSize={meta.limit} onChange={n => setPage(String(n))} />
        </div>
      )}
    </div>
  );
}
