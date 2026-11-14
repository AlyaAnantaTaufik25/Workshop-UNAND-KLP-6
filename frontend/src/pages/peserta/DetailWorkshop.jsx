import { useState } from 'react';
import { Link, useLocation, useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { AlertCircle, ArrowLeft, CalendarDays, Check, LoaderCircle, MapPin, SearchX, Users } from 'lucide-react';
import { getWorkshopLocation, initials } from './data';
import { EmptyState, Modal } from './components';
import OnlineMeetingInfo from './OnlineMeetingInfo';
import { ONLINE_MEETING_NOTICE } from './meetingAccess';
import { getRegistrationAvailability, getRegistrationState } from './workshopStates';
import { RegistrationPanel } from './WorkshopStatePanels';

export default function DetailWorkshop() {
  const { id } = useParams();
  const { profile, workshops, registrations, register, cancelRegistration, notify } = useOutletContext();
  const location = useLocation();
  const navigate = useNavigate();
  const [dialog, setDialog] = useState(null);
  const [agreed, setAgreed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const workshop = workshops.find(item => item.id === id);
  const registration = registrations.find(item => item.workshopId === id);
  const backTo = location.state?.from === 'workshop-saya' ? '/peserta/workshop-saya' : '/peserta/cari-workshop';
  if (!workshop) return <EmptyState icon={SearchX} title="Workshop tidak ditemukan" action={<Link to="/peserta/cari-workshop" className="peserta-button">Cari Workshop</Link>}>Kegiatan ini tidak tersedia.</EmptyState>;
  const state = getRegistrationState(workshop, registration);
  const waiting = getRegistrationAvailability(workshop) === 'waiting-list';
  const closeDialog = () => { if (!saving) setDialog(null); };
  const openDialog = value => { setDialog(value); setAgreed(false); setError(''); };
  const handleConfirm = async () => {
    if (saving || (dialog === 'register' && !agreed)) return;
    setSaving(true);
    setError('');
    try {
      const success = await (dialog === 'cancel' ? cancelRegistration(workshop.id) : register(workshop.id));
      if (!success) { setError('Perubahan belum tersimpan. Periksa status kegiatan dan coba lagi.'); return; }
      setDialog(null);
      notify(dialog === 'cancel' ? 'Pendaftaran dibatalkan. Kursi atau antrean Anda telah dilepas.' : waiting ? 'Berhasil bergabung ke waiting list. Pantau antrean di Workshop Saya.' : 'Pendaftaran berhasil. Kursi Anda telah dikonfirmasi.');
      if (dialog === 'register') navigate('/peserta/workshop-saya');
    } catch {
      setError('Perubahan belum tersimpan. Silakan coba kembali.');
    } finally {
      setSaving(false);
    }
  };

  return <div className="peserta-stack">
    <Link className="peserta-back-link" to={backTo}><ArrowLeft size={16} />{backTo.endsWith('workshop-saya') ? 'Kembali ke workshop saya' : 'Kembali ke pencarian'}</Link>
    <section className="peserta-detail-hero"><div><div className="peserta-detail-tags"><span className="peserta-tag">{workshop.theme}</span></div><h2>{workshop.title}</h2><p>{workshop.description}</p><div className="peserta-hero-meta"><span><CalendarDays size={20} />{workshop.date}, {workshop.time.split(' - ')[0]} WIB</span><span><MapPin size={20} />{getWorkshopLocation(workshop, 'short')}</span></div>{!workshop.cancelled && registration?.status !== 'cancelled' && <OnlineMeetingInfo workshop={workshop} registration={registration} />}</div>
      <aside className="peserta-registration-sidebar"><RegistrationPanel key={id} workshop={workshop} state={state} registration={registration} onRegister={() => openDialog('register')} onCancel={() => openDialog('cancel')} onView={() => navigate('/peserta/workshop-saya')} />{!['registered', 'waiting'].includes(state) && <Link className="peserta-text-button" to="/peserta/cari-workshop">Jelajahi workshop lainnya</Link>}</aside>
    </section>
    <div className="peserta-detail-grid"><section className="peserta-detail-copy"><h3>Tentang workshop</h3><p>{workshop.about}</p><h3>Yang akan Anda dapatkan</h3><ul><li>Materi dan studi kasus praktis</li><li>Sertifikat elektronik setelah kehadiran valid</li><li>Kesempatan diskusi dengan pemateri</li></ul><h3>Target peserta</h3><p>{workshop.target}</p></section>
      <aside className="peserta-speaker"><h3>Pemateri</h3><div className="peserta-person"><span className="peserta-avatar">{workshop.speakerInitials || initials(workshop.speaker)}</span><div><strong>{workshop.speaker}</strong><span>{workshop.speakerRole}</span></div></div><hr /><h3>Mitra kegiatan</h3><p>{workshop.partner}</p><h3>Lokasi</h3><p>{getWorkshopLocation(workshop, 'full')}</p></aside>
    </div>
    {dialog && <Modal title={dialog === 'cancel' ? 'Batalkan Pendaftaran?' : waiting ? 'Konfirmasi Waiting List' : 'Konfirmasi Pendaftaran'} onClose={closeDialog}>
      <div className="peserta-modal-body"><h3>{workshop.title}</h3><p>{workshop.date} &middot; {workshop.time}</p>
        {dialog === 'cancel' ? <div className="peserta-rejection"><AlertCircle size={20} /><p>{registration?.status === 'waiting' ? 'Nomor antrean Anda akan dilepas. Jika bergabung kembali, Anda akan mendapat nomor antrean baru.' : 'Kursi Anda akan dilepas untuk peserta lain. Anda perlu mendaftar kembali jika ingin mengikuti kegiatan.'}</p></div>
          : <><dl className="peserta-summary"><div><dt>Nama peserta</dt><dd>{profile.nama}</dd></div><div><dt>Email</dt><dd>{profile.email}</dd></div><div><dt>Lokasi</dt><dd>{getWorkshopLocation(workshop)}</dd></div></dl>{waiting && <div className="peserta-info"><Users size={20} /><p>Anda akan masuk antrean, belum menjadi peserta terkonfirmasi. Presensi dan akses pertemuan tersedia setelah Anda mendapat kursi.</p></div>}{workshop.mode === 'online' && <p className="peserta-registration-note">{ONLINE_MEETING_NOTICE}</p>}<label className="peserta-checkbox"><input type="checkbox" checked={agreed} onChange={event => setAgreed(event.target.checked)} disabled={saving} /><span>Saya memastikan data peserta sudah benar dan {waiting ? 'memahami ketentuan waiting list' : 'bersedia mengikuti kegiatan'}.</span></label></>}
        {error && <p className="peserta-inline-error" role="alert">{error}</p>}
      </div>
      <footer><button className="peserta-button peserta-button--secondary" disabled={saving} onClick={closeDialog}>{dialog === 'cancel' ? 'Tetap Ikut' : 'Kembali'}</button><button className={`peserta-button${dialog === 'cancel' ? ' peserta-button--danger' : ''}`} disabled={saving || (dialog === 'register' && !agreed)} onClick={handleConfirm}>{saving ? <LoaderCircle size={17} className="peserta-spin" /> : <Check size={17} />}{saving ? 'Menyimpan…' : dialog === 'cancel' ? 'Ya, Batalkan' : waiting ? 'Gabung Antrean' : 'Konfirmasi Daftar'}</button></footer>
    </Modal>}
  </div>;
}
