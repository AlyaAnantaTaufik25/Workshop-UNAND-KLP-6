import { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Pencil, CalendarDays, Clock, MapPin, Check, Download, QrCode, X, FileText, Search } from 'lucide-react';
import { usePagination } from '../../components/Pagination';
import TambahKegiatanModal from './components/TambahKegiatanModal';
import useApi from '../../hooks/useApi';
import { attendanceApi, certificatesApi, workshopsApi } from '../../api';
import { PageLoader, ErrorNotice } from '../../components/RequireRole';
import Select from '../../components/Select';
import QrPresensi from '../../components/QrPresensi';
import BackButton from '../../components/BackButton';
import { exportExcel } from '../../utils/excel';
import { toast } from '../../components/Dialog';

const TABS = ['Informasi', 'Peserta', 'Presensi', 'Rekap'];

const statusConfig = {
  berlangsung: { label: 'Berlangsung', className: 'humas-badge humas-badge-berlangsung' },
  publik:      { label: 'Publik',      className: 'humas-badge humas-badge-publik'      },
  selesai:     { label: 'Selesai',     className: 'humas-badge humas-badge-selesai'     },
  draft:       { label: 'Draft',       className: 'humas-badge humas-badge-draft'       },
  dibatalkan:  { label: 'Dibatalkan',  className: 'humas-badge humas-badge-selesai'     },
};

const hadirConfig = {
  'hadir-valid':         { label: 'Hadir',               className: 'humas-badge humas-badge-publik' },
  'menunggu-verifikasi': { label: 'Menunggu verifikasi', className: 'humas-badge humas-badge-berlangsung' },
  ditolak:               { label: 'Ditolak',             className: 'humas-badge humas-badge-draft' },
  'tidak-hadir':         { label: 'Tidak hadir',         className: 'humas-badge humas-badge-selesai' },
  'belum-hadir':         { label: 'Belum hadir',         className: 'humas-badge humas-badge-selesai' },
};
const DAY_STATUS = { hadir: 'hadir-valid', pending: 'menunggu-verifikasi', ditolak: 'ditolak', 'tidak-hadir': 'tidak-hadir' };

function StatusHadirBadge({ status }) {
  const cfg = hadirConfig[status] ?? hadirConfig['belum-hadir'];
  return <span className={cfg.className}>● {cfg.label}</span>;
}

/** Daftar tanggal (YYYY-MM-DD) dari tanggal mulai s.d. selesai */
function eventDays(start, end) {
  const days = [];
  if (!start) return days;
  for (let d = new Date(`${start}T00:00:00Z`); d <= new Date(`${end || start}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + 1)) {
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}
const formatDay = iso => new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${iso}T00:00:00Z`));

export default function DetailKegiatanHumas() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'presensi' ? 'Presensi' : 'Informasi';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [qr, setQr] = useState(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState('');
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showAjukan, setShowAjukan] = useState(false);
  const [ajukanForm, setAjukanForm] = useState({ templateId: '', nomorSk: '', perluRektor: true });

  const [cari, setCari] = useState('');
  const { data: kegiatan, loading, error, reload } = useApi(() => workshopsApi.get(id), [id]);
  const q = cari.trim().toLowerCase();
  const cocok = p => !q || p.nama.toLowerCase().includes(q) || (p.email || '').toLowerCase().includes(q);
  const pesertaFiltered = (kegiatan?.peserta || []).filter(cocok);
  const { pageItems: pesertaPage, pager: pesertaPager } = usePagination(pesertaFiltered, 15);
  const hariAktif = selectedDay || kegiatan?.tanggalMulai;
  const presensiFiltered = (kegiatan?.peserta || [])
    .filter(p => ['terdaftar', 'selesai'].includes(p.registrationStatus) && cocok(p));
  const { pageItems: presensiPage, pager: presensiPager } = usePagination(presensiFiltered, 15);
  const { data: templates = [] } = useApi(() => certificatesApi.templates(), []);

  const run = async (fn) => {
    setBusy(true);
    setActionError('');
    try { await fn(); await reload(); }
    catch (err) { setActionError(err.message); }
    finally { setBusy(false); }
  };

  if (loading && !kegiatan) return <PageLoader />;
  if (!kegiatan) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', color: 'var(--gray-400)' }}>
        <ErrorNotice error={error} />
        <p>Kegiatan tidak ditemukan.</p>
        <button className="humas-lihat-btn" style={{ marginTop: 16 }} onClick={() => navigate('/humas/kelola-kegiatan')}>
          Kembali
        </button>
      </div>
    );
  }

  const cfg = statusConfig[kegiatan.status] ?? statusConfig.draft;
  const waktuDisplay = kegiatan.waktu || '-';
  const days = eventDays(kegiatan.tanggalMulai, kegiatan.tanggalSelesai);
  const day = selectedDay && days.includes(selectedDay) ? selectedDay : days[0];
  const absensiOpen = kegiatan.statusPresensi === 'dibuka';
  const pesertaAktif = (kegiatan.peserta || []).filter(p => ['terdaftar', 'selesai'].includes(p.registrationStatus));

  // Status presensi per peserta untuk hari terpilih
  const toRow = (iso) => (p) => {
    const att = (p.presensiHarian || []).find(a => a.tanggal === iso);
    return {
      id: p.id,
      nama: p.nama,
      attendanceId: att?.id ?? null,
      status: att ? DAY_STATUS[att.status] : 'belum-hadir',
      waktu: att?.waktu || null,
      bukti: att ? (att.metode === 'upload' ? `Unggahan: ${att.fileName || 'bukti'}` : att.metode === 'manual' ? 'Dicatat panitia' : 'Kode QR & GPS') : 'Belum ada',
      alasan: att?.alasanTolak || '',
    };
  };
  const kehadiranHari = (iso, list = pesertaAktif) => list.map(toRow(iso));
  const statsHari = (iso) => {
    const rows = kehadiranHari(iso);
    const count = s => rows.filter(r => r.status === s).length;
    return { rows, belum: count('belum-hadir') + count('tidak-hadir'), pending: count('menunggu-verifikasi'), hadir: count('hadir-valid'), ditolak: count('ditolak') };
  };
  const current = statsHari(day);
  const barisHalaman = kehadiranHari(day, presensiPage);
  void hariAktif;

  const toggleAbsensi = () => run(() => workshopsApi.setStatus(kegiatan.id, { statusPresensi: absensiOpen ? 'ditutup' : 'dibuka' }));
  const buatKode = () => run(async () => { setQr(await attendanceApi.generateQr(kegiatan.id, 15)); });
  const verifikasi = (attendanceId, status, reason) => run(() => attendanceApi.verify(attendanceId, status, reason));
  const ajukanSertifikat = () => run(async () => {
    await certificatesApi.submit({ workshopId: kegiatan.id, templateId: ajukanForm.templateId || null, nomorSk: ajukanForm.nomorSk, perluRektor: ajukanForm.perluRektor });
    setShowAjukan(false);
  });

  const unduhPeserta = async () => {
    const list = kegiatan.peserta ?? [];
    try {
      await exportExcel({
        fileName: `Daftar_Peserta_${kegiatan.nama}`,
        title: 'Daftar Peserta Kegiatan',
        subtitle: 'Hubungan Masyarakat · Sistem Informasi Workshop UNAND',
        info: [
          ['Kegiatan', kegiatan.nama],
          ['Jadwal', [kegiatan.tanggal, kegiatan.waktu].filter(Boolean).join(' · ') || '-'],
          ['Lokasi', kegiatan.lokasi || (kegiatan.mode === 'online' ? 'Online' : '-')],
          ['Jumlah peserta', `${list.length} orang`],
        ],
        sheets: [{
          name: 'Peserta', numbered: true,
          columns: [
            { header: 'Nama Peserta', key: 'nama' },
            { header: 'Email', key: 'email' },
            { header: 'Jenis Peserta', key: 'jenis' },
            { header: 'Status Pendaftaran', key: 'statusPendaftaran' },
            { header: 'Status Kehadiran', key: 'statusHadir', value: p => hadirConfig[p.statusHadir]?.label || p.statusHadir },
          ],
          rows: list,
        }],
      });
    } catch (err) {
      toast(`Gagal membuat file Excel: ${err.message}`, { tone: 'error' });
    }
  };

  return (
    <>
    <div className="humas-detail-page">

      <div className="humas-detail-toprow">
        <BackButton to="/humas/kelola-kegiatan" label="Kembali ke daftar kegiatan" />
      </div>

      <ErrorNotice error={actionError ? { message: actionError } : null} />

      <div className="humas-detail-card">

        {/* Event Header */}
        <div className="humas-detail-header">
          <div className="humas-detail-header-left">
            <div className="humas-detail-header-badges">
              <span className="humas-jenis-badge">{kegiatan.jenis.toUpperCase()}</span>
              <span className="humas-pelaksanaan-badge">{kegiatan.jenisPelaksanaan}</span>
            </div>
            <h2 className="humas-detail-title">{kegiatan.nama}</h2>
            <div className="humas-detail-meta">
              <span><CalendarDays size={13} /> {kegiatan.tanggal}</span>
              <span><Clock size={13} /> {waktuDisplay}</span>
              <span><MapPin size={13} /> {kegiatan.lokasi}</span>
            </div>
          </div>
          <button className="humas-edit-btn" onClick={() => setShowEdit(true)}>
            <Pencil size={14} />
            Edit Kegiatan
          </button>
        </div>

        {/* Tabs */}
        <div className="humas-tabs">
          {TABS.map(tab => (
            <button key={tab} className={'humas-tab-btn' + (activeTab === tab ? ' active' : '')} onClick={() => setActiveTab(tab)}>
              {tab}
            </button>
          ))}
        </div>

        {/* ── Tab: Informasi ── */}
        {activeTab === 'Informasi' && (
          <div className="humas-detail-body">
            <div className="humas-detail-main">
              {kegiatan.imageUrl && (
                <img src={kegiatan.imageUrl} alt={kegiatan.nama} className="humas-detail-img" />
              )}
              <div className="humas-detail-section">
                <h3 className="humas-detail-section-title">Tentang kegiatan</h3>
                <p className="humas-detail-text">{kegiatan.deskripsi || '-'}</p>
              </div>
              <div className="humas-detail-section">
                <h3 className="humas-detail-section-title">Manfaat / benefit</h3>
                <p className="humas-detail-text">{kegiatan.manfaat || '-'}</p>
              </div>
              <div className="humas-detail-section">
                <h3 className="humas-detail-section-title">Target peserta</h3>
                <p className="humas-detail-text humas-link">{kegiatan.targetPeserta || '-'}</p>
              </div>
              <div className="humas-detail-section">
                <h3 className="humas-detail-section-title">Narasumber</h3>
                <p className="humas-detail-text humas-link">{kegiatan.pemateri || '-'}</p>
              </div>

              <div className="humas-detail-section jadwal-seminar-section">
                <h3 className="humas-detail-section-title">
                  Jadwal {kegiatan.jenis} · {days.length} hari
                </h3>
                <p className="jadwal-seminar-note">
                  Pendaftaran satu kali berlaku untuk seluruh hari kegiatan.
                </p>
                {days.map((d, i) => (
                  <div key={d} className="jadwal-seminar-item">
                    <span className="jadwal-seminar-day">Hari {i + 1}</span>
                    <span className="jadwal-seminar-time">{formatDay(d)} · {waktuDisplay}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="humas-detail-sidebar">
              <div className="humas-info-card">
                <h3 className="humas-info-card-title">Informasi kegiatan</h3>
                <div className="humas-info-rows">
                  <div className="humas-info-row">
                    <span className="humas-info-label">Penyelenggara / Mitra</span>
                    <span className="humas-info-value humas-link">{kegiatan.penyelenggara}</span>
                  </div>
                  <div className="humas-info-row">
                    <span className="humas-info-label">Tema</span>
                    <span className="humas-info-value">{kegiatan.tema || '-'}</span>
                  </div>
                  <div className="humas-info-row">
                    <span className="humas-info-label">Jenis Pelaksanaan</span>
                    <span className="humas-info-value">{kegiatan.jenisPelaksanaan}</span>
                  </div>
                  <div className="humas-info-row">
                    <span className="humas-info-label">Lokasi</span>
                    <span className="humas-info-value">{kegiatan.lokasi}</span>
                  </div>
                  <div className="humas-info-row">
                    <span className="humas-info-label">Periode pendaftaran</span>
                    <span className="humas-info-value">{kegiatan.periodePendaftaran}</span>
                  </div>
                  <div className="humas-info-row">
                    <span className="humas-info-label">Kuota</span>
                    <span className="humas-info-value">
                      {kegiatan.pendaftar} / {kegiatan.kuota ?? '∞'}{' '}
                      <span style={{ color: 'var(--gray-400)', fontSize: '12px' }}>terisi</span>
                      {kegiatan.waitingCount > 0 && <span style={{ color: 'var(--gray-400)', fontSize: '12px' }}> · {kegiatan.waitingCount} antre</span>}
                    </span>
                  </div>
                  <div className="humas-info-row">
                    <span className="humas-info-label">Status sertifikat</span>
                    <span className="humas-info-value">{kegiatan.statusSertifikatLabel}</span>
                  </div>
                  <div className="humas-info-row">
                    <span className="humas-info-label">Status</span>
                    <span className={cfg.className}>● {cfg.label}</span>
                  </div>
                </div>

                <button type="button" className="btn-kelola-absensi" onClick={() => setActiveTab('Presensi')}>
                  <Check size={16} /> Kelola Absensi {kegiatan.jenis}
                </button>

                {/* Pengajuan sertifikat ke Mitra/Rektor */}
                {['berlangsung', 'selesai'].includes(kegiatan.status) && kegiatan.statusSertifikat !== 'diterbitkan' && (
                  <button type="button" className="btn-outline-green" style={{ marginTop: 10, width: '100%', display: 'inline-flex', justifyContent: 'center', alignItems: 'center', gap: 8, padding: '9px 14px' }} onClick={() => setShowAjukan(true)} disabled={busy}>
                    <FileText size={15} /> {kegiatan.statusSertifikat ? 'Ajukan Ulang Sertifikat' : 'Ajukan Sertifikat'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Tab: Peserta ── */}
        {activeTab === 'Peserta' && (
          <div className="humas-tab-content">
            <div className="ui-table-toolbar">
              <div className="ui-table-search">
                <Search size={15} />
                <input value={cari} onChange={e => setCari(e.target.value)} placeholder="Cari nama atau email peserta…" />
              </div>
              <button type="button" className="btn-outline-green" onClick={unduhPeserta} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '7px 14px', fontSize: '12.5px' }}>
                <Download size={14} />
                Unduh Data Peserta (CSV)
              </button>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nama Peserta</th>
                    <th>Jenis Peserta</th>
                    <th>Email</th>
                    <th>Status Pendaftaran</th>
                    <th>Status Kehadiran</th>
                  </tr>
                </thead>
                <tbody>
                  {pesertaFiltered.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', color: 'var(--gray-400)', padding: '32px' }}>
                        Belum ada data peserta.
                      </td>
                    </tr>
                  ) : (
                    pesertaPage.map(p => (
                      <tr key={p.id}>
                        <td><span className="table-name-bold">{p.nama}</span></td>
                        <td>{p.jenis}</td>
                        <td className="ui-cell-muted">{p.email}</td>
                        <td>
                          <span className={p.registrationStatus === 'waiting' ? 'humas-badge humas-badge-berlangsung' : p.registrationStatus === 'dibatalkan' ? 'humas-badge humas-badge-selesai' : 'humas-badge humas-badge-publik'}>
                            ● {p.statusPendaftaran}{p.queue ? ` #${p.queue}` : ''}
                          </span>
                        </td>
                        <td><StatusHadirBadge status={p.registrationStatus === 'waiting' || p.registrationStatus === 'dibatalkan' ? 'belum-hadir' : p.statusHadir} /></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              {pesertaPager}
            </div>
          </div>
        )}

        {/* ── Tab: Presensi ── */}
        {activeTab === 'Presensi' && (
          <div className="kelola-absensi-container">
            <div className="kelola-absensi-header">
              <h2 className="kelola-absensi-title">Kelola Absensi {kegiatan.jenis}</h2>
              <p className="kelola-absensi-sub">{kegiatan.nama}</p>
            </div>

            <div className="kelola-absensi-card">
              <div className="kelola-absensi-card-top">
                <span className="humas-pelaksanaan-badge">● {kegiatan.jenisPelaksanaan}</span>
                <span className="kelola-absensi-card-meta">{kegiatan.tanggal} · {days.length} hari</span>
              </div>
              <p className="kelola-absensi-card-desc">
                {kegiatan.mode === 'online'
                  ? 'Peserta online mengunggah bukti kehadiran, lalu panitia memverifikasi (hadir/ditolak).'
                  : 'Peserta offline memasukkan kode presensi dan lokasi GPS; kehadiran tervalidasi otomatis bila berada dalam radius gedung.'}
              </p>

              {days.map((d, i) => {
                const st = statsHari(d);
                return (
                  <div key={d} className="kelola-absensi-day-row">
                    <div className="kelola-absensi-day-left">
                      <h4 className="kelola-absensi-day-title">Hari {i + 1}</h4>
                      <p className="kelola-absensi-day-date">{formatDay(d)} · {st.hadir} hadir</p>
                      {absensiOpen ? (
                        <span className="badge-absensi-dibuka">● Absensi Dibuka</span>
                      ) : (
                        <span className="badge-absensi-ditutup">● Absensi {kegiatan.statusPresensi === 'ditutup' ? 'Ditutup' : 'Belum Dibuka'}</span>
                      )}
                    </div>
                    <div className="kelola-absensi-day-actions">
                      {i === 0 && (
                        <button type="button" className={absensiOpen ? 'btn-tutup-absensi' : 'btn-buka-absensi'} onClick={toggleAbsensi} disabled={busy}>
                          {absensiOpen ? 'Tutup Absensi' : 'Buka Absensi'}
                        </button>
                      )}
                      {i === 0 && absensiOpen && kegiatan.mode === 'offline' && (
                        <button type="button" className="btn-lihat-kehadiran" onClick={buatKode} disabled={busy}>
                          <QrCode size={14} style={{ verticalAlign: -2 }} /> Buat Kode Presensi
                        </button>
                      )}
                      <button type="button" className="btn-lihat-kehadiran" onClick={() => setSelectedDay(d)}>
                        Lihat Kehadiran
                      </button>
                    </div>
                  </div>
                );
              })}

              {qr && <QrPresensi qr={qr} slug={kegiatan.slug} title={kegiatan.nama} onClose={() => setQr(null)} onRenew={buatKode} />}
            </div>

            <div className="kelola-absensi-kehadiran-section">
              <div className="kelola-absensi-kehadiran-header">
                <h3 className="kelola-absensi-kehadiran-title">
                  Hari {days.indexOf(day) + 1} — {day ? formatDay(day) : '-'}
                </h3>
                {absensiOpen ? <span className="badge-absensi-dibuka">● Absensi Dibuka</span> : <span className="badge-absensi-ditutup">● Absensi Ditutup</span>}
              </div>

              <div className="kelola-absensi-stats-grid">
                <div className="kelola-absensi-stat-card"><span className="kelola-absensi-stat-num">{current.belum}</span><span className="kelola-absensi-stat-label">Belum Absen</span></div>
                <div className="kelola-absensi-stat-card"><span className="kelola-absensi-stat-num">{current.pending}</span><span className="kelola-absensi-stat-label">Menunggu Verifikasi</span></div>
                <div className="kelola-absensi-stat-card"><span className="kelola-absensi-stat-num">{current.hadir}</span><span className="kelola-absensi-stat-label">Hadir</span></div>
                <div className="kelola-absensi-stat-card"><span className="kelola-absensi-stat-num">{current.ditolak}</span><span className="kelola-absensi-stat-label">Ditolak</span></div>
              </div>

              <div className="ui-table-toolbar" style={{ marginTop: 16 }}>
                <div className="ui-table-search">
                <Search size={15} />
                <input value={cari} onChange={e => setCari(e.target.value)} placeholder="Cari nama atau email peserta…" />
              </div>
              </div>
              <div className="table-container" style={{ margin: 0, boxShadow: 'none' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>NAMA PESERTA</th>
                      <th>WAKTU PRESENSI</th>
                      <th>BUKTI KEHADIRAN</th>
                      <th>STATUS VERIFIKASI</th>
                      <th>AKSI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {barisHalaman.length === 0 && (
                      <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--gray-400)', padding: 24 }}>Belum ada peserta terdaftar.</td></tr>
                    )}
                    {barisHalaman.map(p => (
                      <tr key={p.id}>
                        <td><span className="table-name-bold">{p.nama}</span></td>
                        <td className="ui-nowrap">{p.waktu || '-'}</td>
                        <td>{p.bukti}{p.alasan && <div style={{ fontSize: 12, color: '#b91c1c' }}>{p.alasan}</div>}</td>
                        <td><StatusHadirBadge status={p.status} /></td>
                        <td style={{ fontSize: '13px' }}>
                          {p.attendanceId && ['menunggu-verifikasi', 'ditolak', 'hadir-valid'].includes(p.status) ? (
                            <div className="humas-tindakan-group">
                              {p.status !== 'hadir-valid' && (
                                <button className="btn-table-action" disabled={busy} onClick={() => verifikasi(p.attendanceId, 'hadir')}>
                                  <Check size={13} /> Terima
                                </button>
                              )}
                              {p.status !== 'ditolak' && (
                                <button className="btn-table-action" style={{ color: '#dc2626' }} disabled={busy} onClick={() => { setRejectTarget(p); setRejectReason(''); }}>
                                  <X size={13} /> Tolak
                                </button>
                              )}
                            </div>
                          ) : <span style={{ color: '#64748b' }}>Tidak ada tindakan</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {presensiPager}
              </div>
            </div>
          </div>
        )}

        {/* ── Tab: Rekap ── */}
        {activeTab === 'Rekap' && (
          <div className="rekap-kehadiran-container">
            <h3 className="rekap-kehadiran-title">Rekap Kehadiran {kegiatan.jenis} Per Hari</h3>
            <div className="table-container" style={{ margin: 0, boxShadow: 'none' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>KEGIATAN</th>
                    <th>PELAKSANAAN</th>
                    <th>HARI</th>
                    <th>TANGGAL</th>
                    <th>ABSENSI</th>
                    <th style={{ textAlign: 'center' }}>BELUM ABSEN</th>
                    <th style={{ textAlign: 'center' }}>MENUNGGU VERIFIKASI</th>
                    <th style={{ textAlign: 'center' }}>HADIR</th>
                    <th style={{ textAlign: 'center' }}>DITOLAK</th>
                  </tr>
                </thead>
                <tbody>
                  {days.map((d, i) => {
                    const st = statsHari(d);
                    return (
                      <tr key={d}>
                        <td><span className="table-name-bold">{kegiatan.nama}</span></td>
                        <td>{kegiatan.jenisPelaksanaan}</td>
                        <td>Hari {i + 1}</td>
                        <td style={{ whiteSpace: 'nowrap' }}>{formatDay(d)}</td>
                        <td>{absensiOpen ? 'Dibuka' : 'Ditutup'}</td>
                        <td style={{ textAlign: 'center' }}>{st.belum}</td>
                        <td style={{ textAlign: 'center' }}>{st.pending}</td>
                        <td style={{ textAlign: 'center' }}>{st.hadir}</td>
                        <td style={{ textAlign: 'center' }}>{st.ditolak}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>

    {/* ── Modal Edit Kegiatan ── */}
    {showEdit && (
      <TambahKegiatanModal
        onClose={() => setShowEdit(false)}
        onSave={async payload => { await workshopsApi.update(kegiatan.id, payload); await reload(); }}
        editData={kegiatan}
      />
    )}

    {/* ── Modal Tolak Presensi ── */}
    {rejectTarget && (
      <div className="modal-overlay" onClick={() => setRejectTarget(null)}>
        <div className="confirm-modal" onClick={e => e.stopPropagation()}>
          <div className="confirm-modal-header">
            <div>
              <p className="modal-header-crumb">WORKSHOP UNAND</p>
              <h2 className="confirm-modal-title">Tolak Presensi {rejectTarget.nama}</h2>
            </div>
            <button className="modal-close-btn" onClick={() => setRejectTarget(null)}><X size={16} /></button>
          </div>
          <div className="confirm-modal-body">
            <label className="form-label">Alasan penolakan</label>
            <textarea className="form-input" rows={3} value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Contoh: Nama peserta tidak terlihat pada bukti." />
          </div>
          <div className="confirm-modal-footer">
            <button className="modal-btn modal-btn-batal" onClick={() => setRejectTarget(null)}>Batal</button>
            <button className="modal-btn" style={{ background: '#dc2626', color: 'white', border: 'none' }} disabled={!rejectReason.trim() || busy}
              onClick={async () => { await verifikasi(rejectTarget.attendanceId, 'ditolak', rejectReason.trim()); setRejectTarget(null); }}>
              Tolak Presensi
            </button>
          </div>
        </div>
      </div>
    )}

    {/* ── Modal Ajukan Sertifikat ── */}
    {showAjukan && (
      <div className="modal-overlay" onClick={() => setShowAjukan(false)}>
        <div className="confirm-modal" onClick={e => e.stopPropagation()}>
          <div className="confirm-modal-header">
            <div>
              <p className="modal-header-crumb">WORKSHOP UNAND</p>
              <h2 className="confirm-modal-title">Ajukan Sertifikat</h2>
            </div>
            <button className="modal-close-btn" onClick={() => setShowAjukan(false)}><X size={16} /></button>
          </div>
          <div className="confirm-modal-body" style={{ display: 'grid', gap: 10 }}>
            <p style={{ margin: 0 }}>{kegiatan.hadir} peserta hadir akan menerima sertifikat. Alur tanda tangan: {kegiatan.partnerId ? 'Mitra → ' : ''}{ajukanForm.perluRektor ? 'Rektor → ' : ''}Terbit.</p>
            <label className="form-label">Template sertifikat</label>
            <Select className="form-input" value={ajukanForm.templateId} onChange={e => setAjukanForm(f => ({ ...f, templateId: e.target.value }))}>
              <option value="">— Pilih template —</option>
              {templates.map(t => <option key={t.id} value={t.id}>{t.nama}</option>)}
            </Select>
            <label className="form-label">Nomor SK</label>
            <input className="form-input" value={ajukanForm.nomorSk} onChange={e => setAjukanForm(f => ({ ...f, nomorSk: e.target.value }))} placeholder="Contoh: WDS/UNAND/001/2026" />
            <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13 }}>
              <input type="checkbox" checked={ajukanForm.perluRektor} onChange={e => setAjukanForm(f => ({ ...f, perluRektor: e.target.checked }))} />
              Perlu tanda tangan Rektor
            </label>
          </div>
          <div className="confirm-modal-footer">
            <button className="modal-btn modal-btn-batal" onClick={() => setShowAjukan(false)}>Batal</button>
            <button className="modal-btn modal-btn-publish" disabled={busy} onClick={ajukanSertifikat}>Ajukan</button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
