import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Clock3, FileSignature, Table2, BarChart3 } from 'lucide-react';
import './dashboard.css';

/**
 * Komponen dashboard bersama untuk semua portal.
 * Warna seri (tervalidasi CVD & kontras): Pendaftar = biru, Hadir = hijau UNAND.
 */
export const SERIES = { pendaftar: '#2a78d6', hadir: '#1a7f45' };

/** Tanggal hari ini untuk sapaan dashboard, mis. "selasa, 24 november 2026" */
// eslint-disable-next-line react-refresh/only-export-components
export const todayLabel = () => new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' }).format(new Date());

/** Sapaan di atas dashboard */
export function DashHero({ title, subtitle, children }) {
  return (
    <div className="dash-hero">
      <div>
        <p className="dash-hero-date">{todayLabel()}</p>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {children && <div className="dash-hero-actions">{children}</div>}
    </div>
  );
}

/** Kartu antrean tugas: judul, jumlah, daftar singkat, dan tautan ke halaman kerjanya */
export function TaskCard({ icon: Icon = Clock3, title, total, unit = 'item', items = [], to, actionLabel = 'Buka', renderItem, emptyText = 'Tidak ada yang perlu ditindaklanjuti.', tone = 'default' }) {
  const done = !total;
  return (
    <section className={`dash-card dash-task${done ? ' is-done' : ''} dash-task--${tone}`}>
      <header className="dash-task-head">
        <span className="dash-task-icon">{done ? <CheckCircle2 size={18} /> : <Icon size={18} />}</span>
        <div className="dash-task-title">
          <h3>{title}</h3>
          <p>{done ? 'Semua beres' : `${total} ${unit} perlu ditindaklanjuti`}</p>
        </div>
        <strong className="dash-task-count" aria-hidden="true">{total || 0}</strong>
      </header>
      {done ? (
        <p className="dash-empty">{emptyText}</p>
      ) : (
        <ul className="dash-task-list">
          {items.map((item, i) => <li key={item.id ?? i}>{renderItem ? renderItem(item) : item.nama}</li>)}
        </ul>
      )}
      {to && !done && (
        <Link to={to} className="dash-task-link">{actionLabel} <ArrowRight size={14} /></Link>
      )}
    </section>
  );
}

/**
 * Panel "Perlu tindakan": semua antrean tugas dalam satu kartu.
 * Tugas yang beres cukup satu baris ringkas, sehingga tidak ada kotak kosong besar.
 *   tasks: [{ key, icon, tone, title, unit, total, items, renderItem, to, actionLabel, doneText }]
 */
export function TaskPanel({ title = 'Perlu tindakan', subtitle, tasks = [], maxItems = 3, columns = 1 }) {
  const pending = tasks.filter(t => t.total > 0);
  const done = tasks.filter(t => !t.total);
  const totalAll = pending.reduce((a, t) => a + t.total, 0);
  return (
    <section className="dash-card dash-taskpanel">
      <header className="dash-card-head">
        <div>
          <h3>{title}</h3>
          <p>{subtitle || (totalAll ? `${totalAll} hal menunggu tindak lanjut Anda` : 'Semua tugas sudah beres')}</p>
        </div>
      </header>

      <div className={columns > 1 ? 'dash-tp-grid' : undefined}>
      {pending.map(t => {
        const Icon = t.icon || Clock3;
        return (
          <div key={t.key} className={`dash-tp-group dash-task--${t.tone || 'default'}`}>
            <div className="dash-tp-head">
              <span className="dash-task-icon"><Icon size={17} /></span>
              <div className="dash-task-title">
                <h4>{t.title}</h4>
                <p>{t.total} {t.unit || 'item'}</p>
              </div>
              {t.to && <Link to={t.to} className="dash-tp-action">{t.actionLabel || 'Buka'} <ArrowRight size={14} /></Link>}
            </div>
            <ul className="dash-task-list dash-tp-list">
              {t.items.slice(0, maxItems).map((item, i) => <li key={item.id ?? i}>{t.renderItem ? t.renderItem(item) : item.nama}</li>)}
              {t.total > Math.min(maxItems, t.items.length) && t.to && (
                <li className="dash-tp-more"><Link to={t.to}>+{t.total - Math.min(maxItems, t.items.length)} lainnya</Link></li>
              )}
            </ul>
          </div>
        );
      })}
      </div>

      {done.length > 0 && (
        <ul className="dash-tp-done">
          {done.map(t => (
            <li key={t.key}><CheckCircle2 size={15} /><span><strong>{t.title}</strong> — {t.doneText || 'tidak ada yang perlu ditindaklanjuti'}</span></li>
          ))}
        </ul>
      )}
    </section>
  );
}

/** Kartu angka utama */
export function StatTile({ label, value, hint, icon: Icon, to }) {
  const body = (
    <>
      {Icon && <span className="dash-stat-icon"><Icon size={18} /></span>}
      <div>
        <p className="dash-stat-label">{label}</p>
        <p className="dash-stat-value">{value}</p>
        {hint && <p className="dash-stat-hint">{hint}</p>}
      </div>
    </>
  );
  return to ? <Link to={to} className="dash-card dash-stat is-link">{body}</Link> : <div className="dash-card dash-stat">{body}</div>;
}

/** Alur sertifikat: tiga tahap berurutan dengan ikon + label (bukan warna saja) */
export function PipelineCard({ pipeline, to, vertical = false }) {
  const steps = [
    { key: 'menungguMitra', label: 'Menunggu TTE Mitra', icon: FileSignature, tone: 'warning' },
    { key: 'menungguRektor', label: 'Menunggu TTE Rektor', icon: Clock3, tone: 'serious' },
    { key: 'diterbitkan', label: 'Diterbitkan', icon: CheckCircle2, tone: 'good' },
  ];
  const total = steps.reduce((a, s) => a + (pipeline?.[s.key] || 0), 0);
  return (
    <section className="dash-card dash-pipeline">
      <header className="dash-card-head">
        <div>
          <h3>Alur penerbitan sertifikat</h3>
          <p>{total} pengajuan kegiatan</p>
        </div>
        {to && <Link to={to} className="dash-head-link">Lihat semua <ArrowRight size={14} /></Link>}
      </header>
      <ol className={`dash-pipeline-steps${vertical ? ' is-vertical' : ''}`}>
        {steps.map((s, i) => (
          <li key={s.key} className={`dash-pipe dash-pipe--${s.tone}`}>
            <span className="dash-pipe-icon"><s.icon size={16} /></span>
            <div>
              <strong>{pipeline?.[s.key] || 0}</strong>
              <span>{s.label}</span>
            </div>
            {i < steps.length - 1 && <ArrowRight size={16} className="dash-pipe-arrow" aria-hidden="true" />}
          </li>
        ))}
      </ol>
    </section>
  );
}

/** Pembulatan ke atas ke angka "bagus" untuk sumbu */
function niceMax(v) {
  if (v <= 0) return 10;
  const p = 10 ** Math.floor(Math.log10(v));
  const n = v / p;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p;
}

/** Grafik kolom berkelompok: pendaftar vs hadir per bulan (satu sumbu, satuan orang) */
export function TrendChart({ data = [], title = 'Tren pendaftar & kehadiran', subtitle = 'Per bulan pelaksanaan kegiatan' }) {
  const [hover, setHover] = useState(null);
  const [asTable, setAsTable] = useState(false);
  const max = niceMax(Math.max(0, ...data.map(d => d.pendaftar)));
  const ticks = [0, 0.25, 0.5, 0.75, 1].map(t => Math.round(max * t));
  const H = 180;

  return (
    <section className="dash-card dash-chart">
      <header className="dash-card-head">
        <div>
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>
        <div className="dash-chart-tools">
          <ul className="dash-legend" aria-label="Legenda">
            <li><i style={{ background: SERIES.pendaftar }} />Pendaftar</li>
            <li><i style={{ background: SERIES.hadir }} />Hadir</li>
          </ul>
          <button type="button" className="dash-toggle" onClick={() => setAsTable(v => !v)} aria-pressed={asTable} title={asTable ? 'Tampilkan grafik' : 'Tampilkan tabel'}>
            {asTable ? <BarChart3 size={15} /> : <Table2 size={15} />}
          </button>
        </div>
      </header>

      {data.length === 0 ? <p className="dash-empty">Belum ada data kegiatan.</p> : asTable ? (
        <table className="dash-table">
          <thead><tr><th>Bulan</th><th>Kegiatan</th><th>Pendaftar</th><th>Hadir</th><th>Kehadiran</th></tr></thead>
          <tbody>{data.map(d => (
            <tr key={d.bulan}><td>{d.label}</td><td>{d.kegiatan}</td><td>{d.pendaftar}</td><td>{d.hadir}</td><td>{d.pendaftar ? Math.round((d.hadir / d.pendaftar) * 100) : 0}%</td></tr>
          ))}</tbody>
        </table>
      ) : (
        <div className="dash-cols" style={{ '--plot-h': `${H}px` }}>
          <div className="dash-yaxis" aria-hidden="true">
            {[...ticks].reverse().map(t => <span key={t}>{t}</span>)}
          </div>
          <div className="dash-plot">
            {ticks.map(t => <div key={t} className="dash-grid" style={{ bottom: `${(t / max) * 100}%` }} />)}
            <div className="dash-groups">
              {data.map((d, i) => (
                <div
                  key={d.bulan}
                  className={`dash-group${hover === i ? ' is-hover' : ''}`}
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(null)}
                  onFocus={() => setHover(i)}
                  onBlur={() => setHover(null)}
                  tabIndex={0}
                  aria-label={`${d.label}: ${d.pendaftar} pendaftar, ${d.hadir} hadir`}
                >
                  <div className="dash-bars">
                    <span className="dash-bar" style={{ height: `${(d.pendaftar / max) * 100}%`, background: SERIES.pendaftar }} />
                    <span className="dash-bar" style={{ height: `${(d.hadir / max) * 100}%`, background: SERIES.hadir }} />
                  </div>
                  <span className="dash-xlabel">{d.label}</span>
                  {hover === i && (
                    <div className="dash-tooltip" role="tooltip">
                      <strong>{d.label}</strong>
                      <span><i style={{ background: SERIES.pendaftar }} />Pendaftar <b>{d.pendaftar}</b></span>
                      <span><i style={{ background: SERIES.hadir }} />Hadir <b>{d.hadir}</b></span>
                      <span className="dash-tooltip-muted">{d.kegiatan} kegiatan · kehadiran {d.pendaftar ? Math.round((d.hadir / d.pendaftar) * 100) : 0}%</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

/** Batang horizontal: persentase kehadiran per kegiatan (satu seri, tanpa legenda) */
export function RateBars({ data = [], title = 'Tingkat kehadiran per kegiatan', subtitle, limit = 8, linkTo }) {
  const [hover, setHover] = useState(null);
  const rows = data.slice(0, limit);
  return (
    <section className="dash-card dash-chart">
      <header className="dash-card-head">
        <div>
          <h3>{title}</h3>
          <p>{subtitle || `Persentase peserta hadir dari total pendaftar · ${rows.length} kegiatan`}</p>
        </div>
      </header>
      {rows.length === 0 ? <p className="dash-empty">Belum ada kegiatan yang berjalan.</p> : (
        <ul className="dash-rates">
          {rows.map((r, i) => {
            const content = (
              <>
                <span className="dash-rate-name">{r.nama}</span>
                <span className="dash-rate-track">
                  <span className="dash-rate-fill" style={{ width: `${Math.max(r.persen, 1)}%`, background: SERIES.hadir }} />
                </span>
                <span className="dash-rate-value">{r.persen}%</span>
                {hover === i && (
                  <span className="dash-tooltip dash-tooltip--inline" role="tooltip">
                    <strong>{r.nama}</strong>
                    <span>{r.hadir} hadir dari {r.pendaftar} pendaftar</span>
                  </span>
                )}
              </>
            );
            return (
              <li key={r.id} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
                {linkTo ? <Link to={linkTo(r)} className="dash-rate-row">{content}</Link> : <div className="dash-rate-row">{content}</div>}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

/** Daftar singkat dengan judul & tautan */
export function ListCard({ title, subtitle, to, linkLabel = 'Lihat semua', children, empty }) {
  return (
    <section className="dash-card dash-listcard">
      <header className="dash-card-head">
        <div>
          <h3>{title}</h3>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {to && <Link to={to} className="dash-head-link">{linkLabel} <ArrowRight size={14} /></Link>}
      </header>
      {empty ? <p className="dash-empty">{empty}</p> : <ul className="dash-list">{children}</ul>}
    </section>
  );
}

/** Badge status sertifikat (ikon + label) */
export function SertBadge({ status }) {
  const map = {
    'menunggu-mitra': ['dash-badge--warning', 'Menunggu Mitra'],
    'menunggu-ttd': ['dash-badge--warning', 'Menunggu TTE'],
    'menunggu-rektor': ['dash-badge--serious', 'Menunggu Rektor'],
    diterbitkan: ['dash-badge--good', 'Diterbitkan'],
  };
  const [cls, label] = map[status] || ['', status];
  return <span className={`dash-badge ${cls}`}>{status === 'diterbitkan' ? <CheckCircle2 size={12} /> : <Clock3 size={12} />}{label}</span>;
}
