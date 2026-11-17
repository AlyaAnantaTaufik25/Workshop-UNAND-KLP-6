import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { AlertCircle, Check, LoaderCircle, Users } from 'lucide-react';
import { Modal } from './components';
import { getWorkshopLocation } from './data';
import { ONLINE_MEETING_NOTICE } from './meetingAccess';
import { getRegistrationAvailability } from './workshopStates';

export default function WorkshopRegistrationDialog({ workshop, registration, action, onClose, onSuccess }) {
  const { profile, register, cancelRegistration, notify } = useOutletContext();
  const [agreed, setAgreed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const cancelling = action === 'cancel';
  const waiting = getRegistrationAvailability(workshop) === 'waiting-list';
  const close = () => { if (!saving) onClose(); };
  const confirm = async () => {
    if (saving || (!cancelling && !agreed)) return;
    setSaving(true);
    setError('');
    try {
      const success = await (cancelling ? cancelRegistration(workshop.id) : register(workshop.id));
      if (!success) { setError('Perubahan belum tersimpan. Periksa status kegiatan dan coba lagi.'); return; }
      notify(cancelling ? 'Pendaftaran dibatalkan. Kursi atau antrean Anda telah dilepas.' : waiting ? 'Berhasil bergabung ke waiting list. Pantau antrean di Workshop Saya.' : 'Pendaftaran berhasil. Kursi Anda telah dikonfirmasi.');
      onClose();
      onSuccess?.();
    } catch {
      setError('Perubahan belum tersimpan. Silakan coba kembali.');
    } finally {
      setSaving(false);
    }
  };

  return <Modal title={cancelling ? 'Batalkan Pendaftaran?' : waiting ? 'Konfirmasi Waiting List' : 'Konfirmasi Pendaftaran'} onClose={close}>
    <div className="peserta-modal-body"><h3>{workshop.title}</h3><p>{workshop.date} &middot; {workshop.time}</p>
      {cancelling ? <div className="peserta-rejection"><AlertCircle size={20} /><p>{registration?.status === 'waiting' ? 'Nomor antrean Anda akan dilepas. Jika bergabung kembali, Anda akan mendapat nomor antrean baru.' : 'Kursi Anda akan dilepas untuk peserta lain. Anda perlu mendaftar kembali jika ingin mengikuti kegiatan.'}</p></div>
        : <><dl className="peserta-summary"><div><dt>Nama peserta</dt><dd>{profile.nama}</dd></div><div><dt>Email</dt><dd>{profile.email}</dd></div><div><dt>Lokasi</dt><dd>{getWorkshopLocation(workshop)}</dd></div></dl>{waiting && <div className="peserta-info"><Users size={20} /><p>Anda akan masuk antrean, belum menjadi peserta terkonfirmasi. Presensi dan akses pertemuan tersedia setelah Anda mendapat kursi.</p></div>}{workshop.mode === 'online' && <p className="peserta-registration-note">{ONLINE_MEETING_NOTICE}</p>}<label className="peserta-checkbox"><input type="checkbox" checked={agreed} onChange={event => setAgreed(event.target.checked)} disabled={saving} /><span>Saya memastikan data peserta sudah benar dan {waiting ? 'memahami ketentuan waiting list' : 'bersedia mengikuti kegiatan'}.</span></label></>}
      {error && <p className="peserta-inline-error" role="alert">{error}</p>}
    </div>
    <footer><button className="peserta-button peserta-button--secondary" disabled={saving} onClick={close}>{cancelling ? 'Tetap Ikut' : 'Kembali'}</button><button className={`peserta-button${cancelling ? ' peserta-button--danger' : ''}`} disabled={saving || (!cancelling && !agreed)} onClick={confirm}>{saving ? <LoaderCircle size={17} className="peserta-spin" /> : <Check size={17} />}{saving ? 'Menyimpan…' : cancelling ? 'Ya, Batalkan' : waiting ? 'Gabung Antrean' : 'Konfirmasi Daftar'}</button></footer>
  </Modal>;
}
