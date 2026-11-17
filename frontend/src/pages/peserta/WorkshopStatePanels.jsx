import { useRef, useState } from 'react';
import { AlertCircle, Check, CheckCircle2, ClipboardCheck, Clock3, FileImage, LoaderCircle, LockKeyhole, MapPin, QrCode, Upload, Users, XCircle } from 'lucide-react';
import { Status } from './components';
import { attendanceStates, getRegistrationAvailability, registrationStates } from './workshopStates';

export function StateMessage({ state, title, children }) {
  const Icon = state.tone === 'red' ? AlertCircle : state.tone === 'amber' ? Clock3 : state.tone === 'green' ? CheckCircle2 : LockKeyhole;
  return <div className={`peserta-state-message peserta-state-message--${state.tone}`} role="status">
    <span className="peserta-state-icon"><Icon size={24} /></span>
    <div><Status tone={state.tone}>{state.label}</Status><h3>{title || state.title}</h3><p>{children || state.description}</p></div>
  </div>;
}

export function RegistrationPanel({ workshop, state: stateKey, registration, onRegister, onCancel, onView, error }) {
  const state = registrationStates[stateKey];
  const availability = registrationStates[getRegistrationAvailability(workshop)];
  const canRegister = state.canRegister && (stateKey !== 'cancelled' || availability.canRegister);
  const hasQuota = Number.isFinite(workshop.capacity) && !['completed', 'event-cancelled'].includes(stateKey);
  return <section className="peserta-registration-panel" aria-label="Status pendaftaran">
    <StateMessage state={state} />
    {hasQuota && <div className="peserta-seat-info"><div><span><Users size={16} />Sisa kuota</span><strong>{workshop.remaining} <small>/ {workshop.capacity} kursi</small></strong></div><progress max={workshop.capacity} value={workshop.capacity - workshop.remaining} aria-label="Kuota terisi" /><p>{stateKey === 'not-open' ? `Dibuka ${workshop.opens || 'sesuai jadwal panitia'}` : `Batas pendaftaran ${workshop.deadline}`}</p></div>}
    {stateKey === 'waiting' && <div className="peserta-queue"><span>Nomor antrean Anda</span><strong>{String(registration?.queue || 1).padStart(2, '0')}</strong><small>Kursi diberikan sesuai urutan antrean.</small></div>}
    {error && <p className="peserta-inline-error" role="alert"><AlertCircle size={16} />{error}</p>}
    <div className="peserta-panel-actions">
      {canRegister ? <button className="peserta-button" onClick={onRegister}>{stateKey === 'waiting-list' ? <Users size={17} /> : <Check size={17} />}{state.action}</button>
        : ['registered', 'waiting', 'completed'].includes(stateKey) ? <button className="peserta-button" onClick={onView}>{state.action}</button>
          : <button className="peserta-button" disabled><LockKeyhole size={16} />{stateKey === 'cancelled' ? availability.action : state.action}</button>}
      {state.canCancel && <button className="peserta-text-button peserta-text-button--danger" onClick={onCancel}>Batalkan {stateKey === 'waiting' ? 'antrean' : 'pendaftaran'}</button>}
    </div>
  </section>;
}

const formatTime = value => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Belum tercatat' : new Intl.DateTimeFormat('id-ID', { timeZone: 'Asia/Jakarta', dateStyle: 'medium', timeStyle: 'short' }).format(date) + ' WIB';
};

export function AttendancePanel({ workshop, state: stateKey, attendance, onSubmit }) {
  const [code, setCode] = useState('');
  const [file, setFile] = useState(null);
  const [agreed, setAgreed] = useState(false);
  const [location, setLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [feedbackState, setFeedbackState] = useState(null);
  const mounted = useRef(true);
  // The form can close while the browser's location prompt is still open.
  const ref = node => { mounted.current = Boolean(node); };
  const state = attendanceStates[feedbackState || stateKey];
  const online = workshop.mode === 'online';
  const canSubmit = state.canSubmit && workshop.attendanceState === 'open';

  const checkLocation = () => {
    setError('');
    setLocation(null);
    if (!navigator.geolocation) { setFeedbackState('location-denied'); setError('Browser ini tidak mendukung akses lokasi.'); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(position => {
      if (!mounted.current) return;
      setLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude, accuracy: position.coords.accuracy });
      setLocating(false);
      setFeedbackState(null);
    }, failure => {
      if (!mounted.current) return;
      setLocating(false);
      setFeedbackState('location-denied');
      setError(failure.code === 1 ? 'Akses lokasi ditolak. Izinkan lokasi di pengaturan situs.' : 'Lokasi belum ditemukan. Aktifkan GPS dan coba lagi.');
    }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 });
  };

  const selectFile = event => {
    const selected = event.target.files?.[0];
    setFile(null);
    setError('');
    if (!selected) return;
    if (!['image/jpeg', 'image/png', 'application/pdf'].includes(selected.type) || selected.size > 2 * 1024 * 1024 || !selected.size) {
      setError('Pilih JPG, PNG, atau PDF yang tidak kosong, maksimal 2 MB.');
      event.target.value = '';
      return;
    }
    setFile(selected);
  };

  const ready = agreed && (online ? Boolean(file) : Boolean(code.trim() && location));
  const submit = async event => {
    event.preventDefault();
    if (!ready || submitting) return;
    setSubmitting(true);
    setError('');
    try {
      const saved = await onSubmit({ method: online ? 'upload' : 'qr-location', ...(online ? { fileName: file.name } : { code: code.trim(), location }), submittedAt: new Date().toISOString() });
      if (!saved && mounted.current) { setFeedbackState('error'); setError('Presensi belum tersimpan. Silakan coba kembali.'); }
      if (saved && mounted.current) setFeedbackState(null);
    } catch {
      if (mounted.current) { setFeedbackState('error'); setError('Terjadi kesalahan saat menyimpan presensi.'); }
    } finally {
      if (mounted.current) setSubmitting(false);
    }
  };

  return <section className="peserta-attendance-panel" ref={ref} aria-label="Presensi peserta">
    <div className="peserta-session-heading"><span><ClipboardCheck size={17} />Hari 1 · {workshop.date}</span><span className="peserta-mode-label">{online ? 'Online' : 'Tatap muka'}</span></div>
    <StateMessage state={state} />
    {stateKey === 'rejected' && <div className="peserta-rejection"><XCircle size={18} /><div><strong>Catatan panitia</strong><p>{attendance?.reason || 'Bukti kehadiran belum sesuai. Pastikan identitas dan sesi kegiatan terlihat dengan jelas.'}</p></div></div>}
    {['pending', 'present', 'rejected'].includes(stateKey) && <dl className="peserta-summary"><div><dt>Dikirim pada</dt><dd>{attendance?.submittedAt ? formatTime(attendance.submittedAt) : 'Belum tercatat'}</dd></div><div><dt>Metode</dt><dd>{attendance?.method === 'upload' || online ? 'Unggah bukti kehadiran' : 'Kode QR & lokasi'}</dd></div>{attendance?.fileName && <div><dt>Bukti</dt><dd><FileImage size={15} /> {attendance.fileName}</dd></div>}</dl>}
    {stateKey === 'present' && <div className="peserta-attendance-success"><CheckCircle2 size={19} /><span>Kehadiran sesi ini telah memenuhi validasi panitia.</span></div>}
    {state.canSubmit && !canSubmit && <p className="peserta-registration-note">Sesi sudah ditutup. Hubungi panitia untuk perbaikan presensi.</p>}
    {canSubmit && <form className="peserta-attendance-form" onSubmit={submit} aria-busy={submitting}>
      <div className="peserta-method-heading">{online ? <Upload size={19} /> : <QrCode size={19} />}<div><strong>{online ? 'Unggah bukti kehadiran' : 'Kode QR & verifikasi lokasi'}</strong><p>{online ? 'Lampirkan tangkapan layar sesi dengan nama Anda terlihat.' : 'Masukkan kode dari QR panitia dan sertakan lokasi Anda saat ini.'}</p></div></div>
      {online ? <label className="peserta-upload"><Upload size={26} /><strong>{file ? file.name : 'Pilih bukti kehadiran'}</strong><span>{file ? `${(file.size / 1024).toFixed(0)} KB · Klik untuk mengganti` : 'JPG, PNG, atau PDF · Maksimal 2 MB'}</span><input type="file" aria-label="Bukti kehadiran" accept="image/jpeg,image/png,application/pdf" onChange={selectFile} disabled={submitting} /></label>
        : <><label className="peserta-field"><span>Kode presensi dari panitia</span><input value={code} onChange={event => { setCode(event.target.value); setFeedbackState(null); }} placeholder="Masukkan kode sesi" autoComplete="off" maxLength={128} required disabled={submitting} /></label><div className={`peserta-location-check${location ? ' is-ready' : ''}`}><MapPin size={21} /><div><strong>{location ? 'Lokasi berhasil diperoleh' : 'Sertakan lokasi saat ini'}</strong><p>{location ? 'Koordinat akan disertakan untuk diperiksa panitia.' : 'Aktifkan GPS dan izinkan akses lokasi browser.'}</p></div><button type="button" className="peserta-button peserta-button--secondary" onClick={checkLocation} disabled={locating || submitting}>{locating ? <LoaderCircle className="peserta-spin" size={16} /> : <MapPin size={16} />}{locating ? 'Mencari…' : location ? 'Periksa Ulang' : 'Periksa Lokasi'}</button></div></>}
      <label className="peserta-checkbox"><input type="checkbox" checked={agreed} onChange={event => setAgreed(event.target.checked)} disabled={submitting} /><span>Saya menyatakan benar-benar mengikuti sesi kegiatan ini.</span></label>
      {error && <p className="peserta-inline-error" role="alert"><AlertCircle size={17} />{error}</p>}
      <button className="peserta-button" type="submit" disabled={!ready || submitting}>{submitting ? <LoaderCircle size={17} className="peserta-spin" /> : <Check size={17} />}{submitting ? 'Mengirim Presensi…' : stateKey === 'rejected' ? 'Kirim Ulang Presensi' : 'Kirim Presensi'}</button>
    </form>}
  </section>;
}
