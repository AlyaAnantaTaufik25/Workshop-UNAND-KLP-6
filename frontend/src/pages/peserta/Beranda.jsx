import { Link, useOutletContext } from 'react-router-dom';
import {
  CalendarCheck2, Hourglass, CheckCircle2, Award, ClipboardCheck, BellRing, Search,
  Clock, MapPin, ArrowRight, CalendarPlus, Sparkles,
} from 'lucide-react';
import { DashHero, StatTile, TaskPanel, ListCard } from '../../components/Dashboard';
import { canSubmitAttendance, getRegistrationAvailability, registrationStates } from './workshopStates';
import { getWorkshopLocation } from './data';

const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const tanggalBadge = iso => {
  if (!iso) return { hari: '-', bulan: '' };
  const [, m, d] = iso.split('-');
  return { hari: Number(d), bulan: BULAN[Number(m) - 1] };
};

/** Kartu agenda: tanggal besar, judul lengkap, jam, lokasi, dan status pendaftaran */
function AgendaCard({ w, reg, canAttend }) {
  const { hari, bulan } = tanggalBadge(w.isoDate);
  const waiting = reg.status === 'waiting';
  return (
    <Link to={`/peserta/workshop/${w.id}`} className="dash-card dash-agenda-card">
      <div className="dash-agenda-top">
        <span className="dash-agenda-date"><b>{hari}</b><small>{bulan}</small></span>
        <span className={`dash-badge ${waiting ? 'dash-badge--warning' : canAttend ? 'dash-badge--info' : 'dash-badge--good'}`}>
          {waiting ? <Hourglass size={12} /> : canAttend ? <ClipboardCheck size={12} /> : <CheckCircle2 size={12} />}
          {waiting ? `Antrean ke-${reg.queue || '-'}` : canAttend ? 'Presensi dibuka' : 'Terdaftar'}
        </span>
      </div>
      <h4 className="dash-agenda-title">{w.title}</h4>
      <ul className="dash-agenda-meta">
        <li><Clock size={14} />{w.time}</li>
        <li><MapPin size={14} />{getWorkshopLocation(w, 'short')}</li>
      </ul>
      <span className="dash-agenda-more">Lihat detail <ArrowRight size={14} /></span>
    </Link>
  );
}

/**
 * Beranda peserta: agenda kegiatan, hal yang perlu ditindaklanjuti,
 * sertifikat terbaru, dan rekomendasi workshop.
 */
export default function BerandaPeserta() {
  const { profile, workshops, registrations, certificates, corrections } = useOutletContext();
  const byId = Object.fromEntries(workshops.map(w => [w.id, w]));
  const regOf = id => registrations.find(r => r.workshopId === id);

  const aktif = registrations.filter(r => ['registered', 'waiting'].includes(r.status) && byId[r.workshopId] && !byId[r.workshopId].completed && !byId[r.workshopId].cancelled);
  const terdaftar = aktif.filter(r => r.status === 'registered');
  const antre = aktif.filter(r => r.status === 'waiting');
  const selesai = registrations.filter(r => r.status === 'completed');

  // Agenda: kegiatan aktif yang diikuti, urut tanggal terdekat
  const agenda = aktif
    .map(r => ({ reg: r, w: byId[r.workshopId] }))
    .sort((a, b) => (a.w.isoDate || '').localeCompare(b.w.isoDate || ''));

  // Presensi yang bisa dikirim sekarang
  const presensi = registrations
    .filter(r => byId[r.workshopId] && canSubmitAttendance(byId[r.workshopId], r))
    .map(r => byId[r.workshopId]);
  const bisaPresensi = new Set(presensi.map(w => w.id));

  // Tanggapan penerbit yang belum dibaca
  const tanggapan = corrections.filter(c => ['selesai', 'ditolak'].includes(c.status) && !c.notificationRead);

  // Rekomendasi: pendaftaran masih dibuka dan belum diikuti
  const rekomendasi = workshops
    .filter(w => !regOf(w.id) || regOf(w.id).status === 'cancelled')
    .filter(w => registrationStates[getRegistrationAvailability(w)]?.canRegister)
    .slice(0, 3);

  return (
    <div className="dash-page">
      <DashHero
        title={`Halo, ${profile.nama?.split(' ')[0] || 'Peserta'}`}
        subtitle="Ringkasan kegiatan, presensi, dan sertifikat Anda di Workshop UNAND."
      >
        <Link to="/peserta/cari-workshop" className="peserta-button"><Search size={16} />Cari Workshop</Link>
      </DashHero>

      <div className="dash-grid-4">
        <StatTile icon={CalendarCheck2} label="Workshop terdaftar" value={terdaftar.length} hint="Kursi sudah dikonfirmasi" to="/peserta/workshop-saya" />
        <StatTile icon={Hourglass} label="Dalam waiting list" value={antre.length} hint="Menunggu kursi kosong" to="/peserta/workshop-saya" />
        <StatTile icon={CheckCircle2} label="Workshop selesai" value={selesai.length} hint="Telah diikuti" to="/peserta/workshop-saya" />
        <StatTile icon={Award} label="Sertifikat" value={certificates.length} hint="Siap diunduh" to="/peserta/sertifikat" />
      </div>

      {/* ── Agenda terdekat (selebar halaman) ── */}
      <section className="dash-section">
        <header className="dash-section-head">
          <div>
            <h3>Agenda terdekat</h3>
            <p>{agenda.length ? `${agenda.length} kegiatan yang Anda ikuti` : 'Belum ada kegiatan yang Anda ikuti'}</p>
          </div>
          {agenda.length > 0 && <Link to="/peserta/workshop-saya" className="dash-head-link">Workshop Saya <ArrowRight size={14} /></Link>}
        </header>
        {agenda.length ? (
          <div className="dash-agenda-row">
            {agenda.slice(0, 4).map(({ reg, w }) => <AgendaCard key={w.id} w={w} reg={reg} canAttend={bisaPresensi.has(w.id)} />)}
          </div>
        ) : (
          <div className="dash-card dash-empty-card">
            <CalendarPlus size={26} />
            <div>
              <strong>Mulai ikuti workshop</strong>
              <p>Temukan kegiatan dari Universitas Andalas dan mitra, lalu daftar untuk mendapat sertifikat.</p>
            </div>
            <Link to="/peserta/cari-workshop" className="peserta-button">Cari Workshop</Link>
          </div>
        )}
      </section>

      {/* ── Perlu tindakan | Sertifikat & rekomendasi ── */}
      <div className="dash-grid-2 dash-grid-2--even">
        <TaskPanel
          tasks={[
            {
              key: 'presensi', icon: ClipboardCheck, title: 'Presensi bisa diisi sekarang', unit: 'kegiatan',
              total: presensi.length, items: presensi, to: '/peserta/workshop-saya', actionLabel: 'Isi presensi',
              doneText: 'belum ada sesi presensi yang dibuka untuk Anda',
              renderItem: w => (
                <Link to={`/peserta/workshop/${w.id}`} className="dash-item-link">
                  <span className="dash-item-main"><strong>{w.title}</strong><small>{w.mode === 'online' ? 'Unggah bukti kehadiran' : 'Masukkan kode presensi & lokasi'}</small></span>
                </Link>
              ),
            },
            {
              key: 'tanggapan', icon: BellRing, tone: 'info', title: 'Tanggapan perbaikan sertifikat', unit: 'tanggapan baru',
              total: tanggapan.length, items: tanggapan, to: '/peserta/sertifikat/notifikasi', actionLabel: 'Lihat',
              doneText: 'tidak ada tanggapan baru dari penerbit',
              renderItem: c => (
                <Link to={`/peserta/sertifikat/perbaikan/${c.id}`} className="dash-item-link">
                  <span className="dash-item-main"><strong>{c.namaKegiatan || c.certificateNumber}</strong><small>{c.status === 'selesai' ? 'Disetujui · dokumen pengganti tersedia' : 'Ditolak · lihat alasan penerbit'}</small></span>
                  <span className={`dash-badge ${c.status === 'selesai' ? 'dash-badge--good' : 'dash-badge--serious'}`}>{c.status === 'selesai' ? 'Disetujui' : 'Ditolak'}</span>
                </Link>
              ),
            },
          ]}
        />

        <div className="dash-col">
          <ListCard
            title="Sertifikat terbaru"
            subtitle={certificates.length ? `${certificates.length} sertifikat siap diunduh` : null}
            to="/peserta/sertifikat"
            empty={certificates.length ? null : 'Sertifikat muncul setelah kegiatan selesai dan kehadiran tervalidasi.'}
          >
            {certificates.slice(0, 4).map(c => (
              <li key={c.id}>
                <Link to={`/peserta/sertifikat/${c.id}`} className="dash-item-link">
                  <span className="dash-item-icon"><Award size={16} /></span>
                  <span className="dash-item-main"><strong>{c.workshop.title}</strong><small>{c.issuer} · terbit {c.issued}</small></span>
                  <span className="dash-item-cta">Lihat</span>
                </Link>
              </li>
            ))}
          </ListCard>

          {rekomendasi.length > 0 && (
            <ListCard title="Rekomendasi untuk Anda" subtitle="Pendaftaran masih dibuka" to="/peserta/cari-workshop">
              {rekomendasi.map(w => (
                <li key={w.id}>
                  <Link to={`/peserta/workshop/${w.id}`} className="dash-item-link">
                    <span className="dash-item-icon dash-item-icon--accent"><Sparkles size={16} /></span>
                    <span className="dash-item-main"><strong>{w.title}</strong><small>{w.date} · {w.quota}</small></span>
                    <span className="dash-item-cta">Daftar</span>
                  </Link>
                </li>
              ))}
            </ListCard>
          )}
        </div>
      </div>
    </div>
  );
}
