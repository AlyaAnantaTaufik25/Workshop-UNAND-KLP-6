import { useState } from 'react';
import { Link, useLocation, useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, MapPin, SearchX } from 'lucide-react';
import { getWorkshopLocation, initials } from './data';
import { EmptyState } from './components';
import OnlineMeetingInfo from './OnlineMeetingInfo';
import { getRegistrationState } from './workshopStates';
import { RegistrationPanel } from './WorkshopStatePanels';
import WorkshopRegistrationDialog from './WorkshopRegistrationDialog';

export default function DetailWorkshop() {
  const { id } = useParams();
  const { workshops, registrations } = useOutletContext();
  const location = useLocation();
  const navigate = useNavigate();
  const [dialog, setDialog] = useState(null);
  const workshop = workshops.find(item => item.id === id);
  const registration = registrations.find(item => item.workshopId === id);
  const backTo = location.state?.from === 'workshop-saya' ? '/peserta/workshop-saya' : '/peserta/cari-workshop';
  if (!workshop) return <EmptyState icon={SearchX} title="Workshop tidak ditemukan" action={<Link to="/peserta/cari-workshop" className="peserta-button">Cari Workshop</Link>}>Kegiatan ini tidak tersedia.</EmptyState>;
  const state = getRegistrationState(workshop, registration);
  const openDialog = value => setDialog(value);

  return <div className="peserta-stack">
    <Link className="peserta-back-link" to={backTo}><ArrowLeft size={16} />{backTo.endsWith('workshop-saya') ? 'Kembali ke workshop saya' : 'Kembali ke pencarian'}</Link>
    <section className="peserta-detail-hero"><div><div className="peserta-detail-tags"><span className="peserta-tag">{workshop.theme}</span></div><h2>{workshop.title}</h2><p>{workshop.description}</p><div className="peserta-hero-meta"><span><CalendarDays size={20} />{workshop.date}, {workshop.time.split(' - ')[0]} WIB</span><span><MapPin size={20} />{getWorkshopLocation(workshop, 'short')}</span></div>{!workshop.cancelled && registration?.status !== 'cancelled' && <OnlineMeetingInfo workshop={workshop} registration={registration} />}</div>
      <aside className="peserta-registration-sidebar"><RegistrationPanel key={id} workshop={workshop} state={state} registration={registration} onRegister={() => openDialog('register')} onCancel={() => openDialog('cancel')} onView={() => navigate('/peserta/workshop-saya')} />{!['registered', 'waiting'].includes(state) && <Link className="peserta-text-button" to="/peserta/cari-workshop">Jelajahi workshop lainnya</Link>}</aside>
    </section>
    <div className="peserta-detail-grid"><section className="peserta-detail-copy"><h3>Tentang workshop</h3><p>{workshop.about}</p><h3>Yang akan Anda dapatkan</h3><ul><li>Materi dan studi kasus praktis</li><li>Sertifikat elektronik setelah kehadiran valid</li><li>Kesempatan diskusi dengan pemateri</li></ul><h3>Target peserta</h3><p>{workshop.target}</p></section>
      <aside className="peserta-speaker"><h3>Pemateri</h3><div className="peserta-person"><span className="peserta-avatar">{workshop.speakerInitials || initials(workshop.speaker)}</span><div><strong>{workshop.speaker}</strong><span>{workshop.speakerRole}</span></div></div><hr /><h3>Mitra kegiatan</h3><p>{workshop.partner}</p><h3>Lokasi</h3><p>{getWorkshopLocation(workshop, 'full')}</p></aside>
    </div>
    {dialog && <WorkshopRegistrationDialog key={dialog} workshop={workshop} registration={registration} action={dialog} onClose={() => setDialog(null)} onSuccess={() => { if (dialog === 'register') navigate('/peserta/workshop-saya'); }} />}
  </div>;
}
