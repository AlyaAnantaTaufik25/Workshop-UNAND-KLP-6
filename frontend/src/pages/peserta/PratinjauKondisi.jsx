import { useState } from 'react';
import { ArrowRight, CalendarDays, Check, ClipboardCheck, FlaskConical, LoaderCircle, MapPin, RotateCcw, Users } from 'lucide-react';
import { Modal } from './components';
import { participantWorkshops } from './data';
import { attendanceStates, registrationStates } from './workshopStates';
import { AttendancePanel, RegistrationPanel } from './WorkshopStatePanels';

export default function PratinjauKondisi() {
  const [category, setCategory] = useState('registration');
  const [registrationKey, setRegistrationKey] = useState('open');
  const [attendanceKey, setAttendanceKey] = useState('open');
  const [mode, setMode] = useState('offline');
  const [result, setResult] = useState('success');
  const [dialog, setDialog] = useState(null);
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [evidence, setEvidence] = useState(null);
  const [version, setVersion] = useState(0);
  const registration = category === 'registration';
  const stateKey = registration ? registrationKey : attendanceKey;
  const states = registration ? registrationStates : attendanceStates;
  const entries = Object.entries(states).filter(([key]) => registration || mode === 'offline' || !['location-denied', 'outside-radius', 'invalid-code'].includes(key));
  const workshop = { ...participantWorkshops[0], mode, attendanceState: 'open', remaining: ['full', 'waiting-list', 'waiting'].includes(registrationKey) ? 0 : 12 };

  const select = key => {
    if (busy) return;
    (registration ? setRegistrationKey : setAttendanceKey)(key);
    setError('');
    setEvidence(null);
    setVersion(value => value + 1);
  };
  const openDialog = value => { setDialog(value); setAgreed(false); setError(''); };
  const confirm = async () => {
    if (busy || (dialog === 'register' && !agreed)) return;
    setBusy(true);
    await new Promise(resolve => setTimeout(resolve, 700));
    setBusy(false);
    if (result === 'error') { setError('Pendaftaran belum tersimpan. Silakan coba lagi.'); return; }
    setRegistrationKey(dialog === 'cancel' ? 'cancelled' : registrationKey === 'waiting-list' ? 'waiting' : 'registered');
    setDialog(null);
    setError('');
  };
  const previewEvidence = evidence || { method: mode === 'online' ? 'upload' : 'qr-location', submittedAt: '2025-05-18T09:05:00+07:00', ...(mode === 'online' ? { fileName: 'bukti-kehadiran.png' } : {}), reason: 'Identitas peserta atau sesi pada bukti belum sesuai. Mohon kirim bukti yang lebih jelas.' };

  return <div className="peserta-stack">
    <section className="peserta-preview-intro"><div className="peserta-preview-kicker"><FlaskConical size={16} />PRATINJAU TAMPILAN</div><h2>Setiap kondisi, informasi yang jelas.</h2><p>Jelajahi tampilan pendaftaran dan presensi dari awal hingga selesai. Pilih kondisi untuk mencoba pesan, formulir, dan tombolnya.</p><div className="peserta-preview-totals"><span><Users size={16} />{Object.keys(registrationStates).length} kondisi pendaftaran</span><span><ClipboardCheck size={16} />{Object.keys(attendanceStates).length} kondisi presensi</span></div></section>
    <div className="peserta-preview-toolbar"><div className="peserta-segmented" role="group" aria-label="Kategori pratinjau"><button aria-pressed={registration} onClick={() => { setCategory('registration'); setError(''); }} disabled={busy}><Users size={17} />Pendaftaran</button><button aria-pressed={!registration} onClick={() => { setCategory('attendance'); setError(''); }} disabled={busy}><ClipboardCheck size={17} />Presensi / Absen</button></div><label className="peserta-preview-result"><span>Hasil simulasi</span><select aria-label="Hasil simulasi pengiriman" value={result} disabled={busy} onChange={event => setResult(event.target.value)}><option value="success">Berhasil</option><option value="error">Gagal menyimpan</option></select></label></div>
    <div className="peserta-preview-layout">
      <section className="peserta-condition-list" aria-label="Pilih kondisi"><div className="peserta-condition-heading"><h3>Pilih kondisi</h3><span>{entries.length} tampilan</span></div>{entries.map(([key, state], index) => <button className={`peserta-condition-option${stateKey === key ? ' is-active' : ''}`} key={key} aria-pressed={stateKey === key} disabled={busy} onClick={() => select(key)}><span className="peserta-condition-number">{String(index + 1).padStart(2, '0')}</span><i className={`peserta-tone-dot peserta-tone-dot--${state.tone}`} /><span>{state.label}</span>{stateKey === key && <ArrowRight size={16} />}</button>)}</section>
      <section className="peserta-preview-frame" aria-label="Tampilan kondisi terpilih"><header><span><i />{registration ? 'Detail pendaftaran' : 'Presensi workshop'}</span><button className="peserta-text-button" disabled={busy} onClick={() => select('open')}><RotateCcw size={14} />Reset</button></header><div className="peserta-preview-body"><div className="peserta-preview-workshop"><span className="peserta-tag">TEKNOLOGI</span><h3>{workshop.title}</h3><p><CalendarDays size={15} />{workshop.date} · {workshop.time}</p><p><MapPin size={15} />{mode === 'online' && !registration ? 'Online' : workshop.shortPlace}</p></div>
        {!registration && <div className="peserta-segmented peserta-mode-switch" role="group" aria-label="Metode presensi"><button aria-pressed={mode === 'offline'} disabled={busy} onClick={() => { setMode('offline'); setVersion(value => value + 1); }}>Offline · QR & Lokasi</button><button aria-pressed={mode === 'online'} disabled={busy} onClick={() => { setMode('online'); if (['location-denied', 'outside-radius', 'invalid-code'].includes(attendanceKey)) setAttendanceKey('open'); setVersion(value => value + 1); }}>Online · Unggah Bukti</button></div>}
        {registration ? <RegistrationPanel workshop={workshop} state={registrationKey} registration={{ queue: 4 }} onRegister={() => openDialog('register')} onCancel={() => openDialog('cancel')} onView={() => { setCategory('attendance'); setAttendanceKey(registrationKey === 'waiting' ? 'waiting-list' : registrationKey === 'completed' ? 'present' : 'open'); }} />
          : <AttendancePanel key={`${attendanceKey}-${mode}-${version}`} workshop={workshop} state={attendanceKey} attendance={previewEvidence} preview onSubmit={async value => {
            setBusy(true);
            await new Promise(resolve => setTimeout(resolve, 700));
            setBusy(false);
            if (result === 'error') return false;
            setEvidence(value);
            setAttendanceKey('pending');
            return true;
          }} />}
      </div><footer><FlaskConical size={16} /><span>Mode simulasi. Pilihan di halaman ini tidak mengubah data Workshop Saya.</span></footer></section>
    </div>
    {dialog && <Modal title={dialog === 'cancel' ? 'Batalkan Pendaftaran?' : registrationKey === 'waiting-list' ? 'Konfirmasi Waiting List' : 'Konfirmasi Pendaftaran'} onClose={() => { if (!busy) setDialog(null); }}><div className="peserta-modal-body"><h3>{workshop.title}</h3><p>{dialog === 'cancel' ? 'Kursi atau nomor antrean Anda akan dilepas setelah pembatalan.' : registrationKey === 'waiting-list' ? 'Anda akan masuk daftar tunggu. Kursi belum dikonfirmasi.' : 'Pastikan data Anda sudah benar sebelum melanjutkan.'}</p><dl className="peserta-summary"><div><dt>Nama peserta</dt><dd>Nadia Amelia</dd></div><div><dt>Status</dt><dd>{dialog === 'cancel' ? 'Akan dibatalkan' : registrationKey === 'waiting-list' ? 'Waiting list' : 'Peserta terkonfirmasi'}</dd></div></dl>{dialog !== 'cancel' && <label className="peserta-checkbox"><input type="checkbox" checked={agreed} disabled={busy} onChange={event => setAgreed(event.target.checked)} /><span>Saya menyetujui ketentuan pendaftaran workshop.</span></label>}{error && <p role="alert" className="peserta-inline-error">{error}</p>}</div><footer><button className="peserta-button peserta-button--secondary" disabled={busy} onClick={() => setDialog(null)}>Kembali</button><button className={`peserta-button${dialog === 'cancel' ? ' peserta-button--danger' : ''}`} disabled={busy || (dialog !== 'cancel' && !agreed)} onClick={confirm}>{busy ? <LoaderCircle size={17} className="peserta-spin" /> : <Check size={17} />}{busy ? 'Menyimpan…' : dialog === 'cancel' ? 'Ya, Batalkan' : 'Konfirmasi'}</button></footer></Modal>}
  </div>;
}
