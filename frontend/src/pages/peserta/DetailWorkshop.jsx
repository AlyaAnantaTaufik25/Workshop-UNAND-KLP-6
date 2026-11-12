import { useState } from 'react';
import { Link, useLocation, useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, Check, MapPin, SearchX } from 'lucide-react';
import { getWorkshopLocation, initials, participantWorkshops } from './data';
import { EmptyState, Modal, Status } from './components';
import OnlineMeetingInfo from './OnlineMeetingInfo';
import { ONLINE_MEETING_NOTICE } from './meetingAccess';

export default function DetailWorkshop() {
  const { id } = useParams();
  const { profile, registrations, register, notify } = useOutletContext();
  const location = useLocation();
  const navigate = useNavigate();
  const [confirm, setConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const workshop = participantWorkshops.find(item => item.id === id);
  const registration = registrations.find(item => item.workshopId === id);
  const backTo = location.state?.from === 'workshop-saya' ? '/peserta/workshop-saya' : '/peserta/cari-workshop';
  if (!workshop) return <EmptyState icon={SearchX} title="Workshop tidak ditemukan" action={<Link to="/peserta/cari-workshop" className="peserta-button">Cari Workshop</Link>}>Kegiatan ini tidak tersedia.</EmptyState>;
  const handleRegister = () => {
    if (register(workshop.id)) {
      setConfirm(false);
      notify('Pendaftaran berhasil. Workshop ditambahkan ke Workshop Saya.');
      navigate('/peserta/workshop-saya');
    }
  };

  return <div className="peserta-stack">
    <Link className="peserta-back-link" to={backTo}><ArrowLeft size={16} />{backTo.endsWith('workshop-saya') ? 'Kembali ke workshop saya' : 'Kembali ke pencarian'}</Link>
    <section className="peserta-detail-hero"><div><div className="peserta-detail-tags"><span className="peserta-tag">{workshop.theme}</span></div><h2>{workshop.title}</h2><p>{workshop.description}</p><div className="peserta-hero-meta"><span><CalendarDays size={20} />{workshop.date}, {workshop.time.split(' - ')[0]} WIB</span><span><MapPin size={20} />{getWorkshopLocation(workshop, 'short')}</span></div><OnlineMeetingInfo workshop={workshop} registration={registration} /></div>
      <aside className="peserta-registration-box"><Status tone={workshop.completed ? 'gray' : registration?.status === 'waiting' ? 'amber' : 'green'}>{workshop.completed ? 'Workshop selesai' : registration?.status === 'waiting' ? `Waiting List - Antrean ${registration.queue}` : registration ? 'Terdaftar' : 'Pendaftaran dibuka'}</Status>
        {!workshop.completed && <><p>Sisa kuota</p><strong>{workshop.remaining} dari {workshop.capacity} kursi</strong><progress max={workshop.capacity} value={workshop.capacity - workshop.remaining} aria-label="Kuota terisi" /><small>Batas pendaftaran {workshop.deadline}</small></>}
        {registration ? <Link className="peserta-button" to="/peserta/workshop-saya">Lihat Workshop Saya</Link> : !workshop.completed ? <button className="peserta-button" onClick={() => setConfirm(true)}>Daftar Workshop</button> : <Link className="peserta-button peserta-button--secondary" to="/peserta/cari-workshop">Cari Workshop Lain</Link>}
      </aside>
    </section>
    <div className="peserta-detail-grid"><section className="peserta-detail-copy"><h3>Tentang workshop</h3><p>{workshop.about}</p><h3>Yang akan Anda dapatkan</h3><ul><li>Materi dan studi kasus praktis</li><li>Sertifikat elektronik setelah kehadiran valid</li><li>Kesempatan diskusi dengan pemateri</li></ul><h3>Target peserta</h3><p>{workshop.target}</p></section>
      <aside className="peserta-speaker"><h3>Pemateri</h3><div className="peserta-person"><span className="peserta-avatar">{workshop.speakerInitials || initials(workshop.speaker)}</span><div><strong>{workshop.speaker}</strong><span>{workshop.speakerRole}</span></div></div><hr /><h3>Mitra kegiatan</h3><p>{workshop.partner}</p><h3>Lokasi</h3><p>{getWorkshopLocation(workshop, 'full')}</p></aside>
    </div>
    {confirm && <Modal title="Konfirmasi Pendaftaran" onClose={() => setConfirm(false)}><div className="peserta-modal-body"><h3>{workshop.title}</h3><p>{workshop.date} &middot; {workshop.time}</p><dl className="peserta-summary"><div><dt>Nama peserta</dt><dd>{profile.nama}</dd></div><div><dt>Email</dt><dd>{profile.email}</dd></div><div><dt>Lokasi</dt><dd>{getWorkshopLocation(workshop)}</dd></div></dl>{workshop.mode === 'online' && <p className="peserta-registration-note">{ONLINE_MEETING_NOTICE}</p>}<label className="peserta-checkbox"><input type="checkbox" checked={agreed} onChange={event => setAgreed(event.target.checked)} /><span>Saya memastikan data peserta sudah benar dan bersedia mengikuti kegiatan.</span></label></div><footer><button className="peserta-button peserta-button--secondary" onClick={() => setConfirm(false)}>Batal</button><button className="peserta-button" disabled={!agreed} onClick={handleRegister}><Check size={17} />Konfirmasi Daftar</button></footer></Modal>}
  </div>;
}
