import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Briefcase, Users, Check, Plus, Eye, Pencil,
  Trash2, X, CalendarDays
} from 'lucide-react';
import TambahKegiatanModal from './components/TambahKegiatanModal';
import { IconAction } from '../../components/Pagination';
import useKegiatan from './useKegiatan';
import useApi from '../../hooks/useApi';
import { reportsApi } from '../../api';
import { PageLoader, ErrorNotice } from '../../components/RequireRole';
import { dialog } from '../../components/Dialog';
import { DashHero, StatTile, TaskPanel, TrendChart, RateBars, ListCard, PipelineCard } from '../../components/Dashboard';
import { ClipboardCheck, FilePenLine, FileSignature, UserCheck, Award } from 'lucide-react';
import { useCurrentUser } from '../../context/AuthContext';

// ─── helpers ────────────────────────────────────────────
const statusConfig = {
  berlangsung: { label: 'Berlangsung', className: 'humas-badge humas-badge-berlangsung' },
  publik:      { label: 'Publik',      className: 'humas-badge humas-badge-publik'      },
  selesai:     { label: 'Selesai',     className: 'humas-badge humas-badge-selesai'     },
  draft:       { label: 'Draft',       className: 'humas-badge humas-badge-draft'       },
  dibatalkan:  { label: 'Dibatalkan',  className: 'humas-badge humas-badge-selesai'     },
};

// ─── Main Component ──────────────────────────────────────
export default function RingkasanHumas() {
  const navigate = useNavigate();
  const { kegiatan, loading, error, reload, save, remove } = useKegiatan();
  const { data: dash } = useApi(() => reportsApi.dashboard(), [kegiatan.length]);
  const summary = dash?.summary;
  const user = useCurrentUser();
  const [showTambah, setShowTambah] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [actionError, setActionError] = useState('');

  // Hapus kegiatan dengan konfirmasi seragam
  const handleHapus = async (id) => {
    const ok = await dialog.confirm({
      title: 'Hapus kegiatan?',
      message: 'Kegiatan beserta seluruh data pendaftaran, presensi, dan sertifikatnya akan dihapus permanen.',
      confirmText: 'Hapus Kegiatan',
      tone: 'danger',
    });
    if (!ok) return;
    try { await remove(id); setActionError(''); }
    catch (err) { setActionError(err.message); }
  };

  // Tambah / Edit kegiatan (disimpan ke database)
  const handleSaveKegiatan = (payload) => save(payload);

  // Statistik
  const totalPendaftar = summary?.totalPendaftar ?? kegiatan.reduce((s, k) => s + (k.pendaftar || 0), 0);
  const totalKegiatan  = summary?.totalKegiatan ?? kegiatan.length;
  const pesertaHadir   = summary?.pesertaHadir ?? kegiatan.reduce((s, k) => s + (k.hadir || 0), 0);

  // Kegiatan terdekat: publik/berlangsung, urut tanggal terdekat
  const kegiatanTerdekat = kegiatan
    .filter(k => ['publik', 'berlangsung'].includes(k.status))
    .sort((x, y) => x.tanggalMulai.localeCompare(y.tanggalMulai))
    .slice(0, 3);
  const kegiatanTerbaru  = kegiatan.slice(0, 5);

  const getDayLabel = (tanggal) => {
    const parts = tanggal?.split(' ');
    return parts?.[0] || '-';
  };

  if (loading && !kegiatan.length) return <PageLoader />;

  return (
    <>
      <div className="humas-ringkasan-page">
        <ErrorNotice error={error} onRetry={reload} />
        {actionError && <ErrorNotice error={{ message: actionError }} />}

        <div className="dash-page">
          <DashHero
            title={`Selamat datang, ${user.nama?.split(' ')[0] || 'Humas'}`}
            subtitle="Kelola kegiatan, presensi, dan sertifikat Workshop Universitas Andalas."
          >
            <button className="humas-tambah-btn" onClick={() => { setEditTarget(null); setShowTambah(true); }}>
              <Plus size={15} /> Tambah Kegiatan
            </button>
          </DashHero>

          <div className="dash-grid-4">
            <StatTile icon={Briefcase} label="Total kegiatan" value={totalKegiatan} hint={summary ? `${summary.kegiatanBerlangsung} sedang berlangsung` : null} to="/humas/kelola-kegiatan" />
            <StatTile icon={Users} label="Total pendaftar" value={totalPendaftar} hint={summary ? `${summary.kegiatanAkanDatang} kegiatan akan datang` : null} to="/humas/laporan" />
            <StatTile icon={UserCheck} label="Tingkat kehadiran" value={`${summary?.persentaseHadir ?? 0}%`} hint={`${pesertaHadir} peserta hadir`} to="/humas/laporan" />
            <StatTile icon={Award} label="Sertifikat terbit" value={summary?.sertifikatTerbit ?? 0} hint={summary ? `${summary.menungguTtd} pengajuan menunggu TTE` : null} />
          </div>

          {dash && (
            <div className="dash-layout">
              <div className="dash-col">
                <TaskPanel
                  tasks={[
                    {
                      key: 'presensi', icon: ClipboardCheck, title: 'Presensi menunggu verifikasi', unit: 'bukti presensi',
                      total: dash.tasks.presensiMenunggu.total, items: dash.tasks.presensiMenunggu.items,
                      doneText: 'semua bukti presensi sudah diverifikasi',
                      renderItem: item => (
                        <Link to={`/humas/kelola-kegiatan/${item.id}?tab=presensi`} className="dash-item-link">
                          <span className="dash-item-main"><strong>{item.nama}</strong><small>{item.tanggal}</small></span>
                          <span className="dash-item-num">{item.jumlah}</span>
                        </Link>
                      ),
                    },
                    {
                      key: 'perbaikan', icon: FilePenLine, tone: 'info', title: 'Perbaikan sertifikat masuk', unit: 'pengajuan',
                      total: dash.tasks.perbaikanAktif.total, items: dash.tasks.perbaikanAktif.items,
                      to: '/humas/perbaikan-sertifikat', actionLabel: 'Proses',
                      doneText: 'tidak ada pengajuan perbaikan yang menunggu',
                      renderItem: item => (
                        <span className="dash-item-main"><strong>{item.nama}</strong><small>{item.kegiatan}</small></span>
                      ),
                    },
                    {
                      key: 'ajukan', icon: FileSignature, tone: 'danger', title: 'Sertifikat belum diajukan', unit: 'kegiatan selesai',
                      total: dash.tasks.belumDiajukan.total, items: dash.tasks.belumDiajukan.items,
                      doneText: 'semua kegiatan yang selesai sudah diajukan sertifikatnya',
                      renderItem: item => (
                        <Link to={`/humas/kelola-kegiatan/${item.id}`} className="dash-item-link">
                          <span className="dash-item-main"><strong>{item.nama}</strong><small>{item.hadir} peserta hadir · {item.tanggal}</small></span>
                        </Link>
                      ),
                    },
                  ]}
                />
                <TrendChart data={dash.trend} />
              </div>

              <aside className="dash-col">
                <ListCard title="Kegiatan terdekat" to="/humas/kelola-kegiatan" empty={kegiatanTerdekat.length ? null : 'Tidak ada kegiatan terdekat.'}>
                  {kegiatanTerdekat.map(k => (
                    <li key={k.id}>
                      <Link to={`/humas/kelola-kegiatan/${k.id}`} className="dash-item-link">
                        <span className="dash-date-badge"><b>{getDayLabel(k.tanggal)}</b><small>{k.tanggal.split(' ')[1]?.slice(0, 3)}</small></span>
                        <span className="dash-item-main"><strong>{k.nama}</strong><small>{k.jenis} · {k.lokasi}</small></span>
                      </Link>
                    </li>
                  ))}
                </ListCard>
                <PipelineCard pipeline={dash.pipeline} vertical />
                <RateBars data={dash.kehadiran} limit={5} subtitle="Kegiatan dengan kehadiran tertinggi" linkTo={r => `/humas/kelola-kegiatan/${r.id}`} />
              </aside>
            </div>
          )}
        </div>

        {/* ── Kegiatan Terbaru ── */}
        <div className="ringkasan-card-container" style={{ marginTop: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <h3 className="ringkasan-card-title" style={{ margin: 0 }}>Kegiatan terbaru</h3>
            <button className="ringkasan-lihat-btn" onClick={() => navigate('/humas/kelola-kegiatan')}>Lihat semua</button>
          </div>
          <div className="table-container" style={{ margin: 0, boxShadow: 'none' }}>
            <table className="data-table">
              <thead>
              <tr>
                <th>Kegiatan</th>
                <th>Tanggal</th>
                <th>Penyelenggara</th>
                <th style={{ textAlign: 'center' }}>Pendaftar / Kuota</th>
                <th>Status</th>
                <th>Tindakan</th>
              </tr>
            </thead>
              <tbody>
                {kegiatanTerbaru.map(k => {
                  const cfg = statusConfig[k.status] ?? statusConfig.draft;
                  return (
                    <tr key={k.id}>
                    <td className="ui-cell-name">
                      <span
                        className="table-name-bold humas-link"
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate(`/humas/kelola-kegiatan/${k.id}`)}
                      >
                        {k.nama}
                      </span>
                      <div className="ui-cell-muted" style={{ marginTop: 3 }}>
                        {k.jenis} · {k.jenisPelaksanaan} · {k.lokasi}
                      </div>
                    </td>
                    <td className="ui-nowrap">{k.tanggal}</td>
                    <td className="ui-cell-muted" style={{ minWidth: 140 }}>{k.penyelenggara}</td>
                    <td className="ui-nowrap" style={{ textAlign: 'center' }}>
                      <strong style={{ color: k.pendaftar > 0 ? 'var(--green-700)' : 'inherit' }}>{k.pendaftar}</strong>
                      <span className="ui-cell-muted"> / {k.kuota ?? '∞'}</span>
                    </td>
                    <td className="ui-nowrap"><span className={cfg.className}>● {cfg.label}</span></td>
                    <td>
                      <div className="ui-row-actions">
                        <IconAction icon={Eye} label="Lihat detail" onClick={() => navigate(`/humas/kelola-kegiatan/${k.id}`)} />
                        <IconAction icon={Pencil} label="Edit kegiatan" onClick={() => { setEditTarget(k); setShowTambah(true); }} />
                        <IconAction icon={Trash2} label="Hapus kegiatan" tone="danger" onClick={() => handleHapus(k.id)} />
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* ── Tambah / Edit Modal ── */}
      {showTambah && (
        <TambahKegiatanModal
          onClose={() => { setShowTambah(false); setEditTarget(null); }}
          onSave={handleSaveKegiatan}
          editData={editTarget}
        />
      )}

    </>
  );
}
