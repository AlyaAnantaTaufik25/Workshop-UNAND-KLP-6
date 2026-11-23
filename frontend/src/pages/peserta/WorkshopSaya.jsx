import { useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { CalendarDays, Check, ClipboardCheck, UserPlus } from 'lucide-react';
import { getWorkshopLocation } from './data';
import { EmptyState, Modal, Status } from './components';
import OnlineMeetingInfo from './OnlineMeetingInfo';
import { attendanceStates, canSubmitAttendance, getAttendanceState, getRegistrationAvailability, getRegistrationState, registrationStates } from './workshopStates';
import { AttendancePanel } from './WorkshopStatePanels';
import WorkshopRegistrationDialog from './WorkshopRegistrationDialog';

export default function WorkshopSaya() {
  const { workshops, registrations, submitAttendance, notify } = useOutletContext();
  const [attendanceId, setAttendanceId] = useState(null);
  const [registrationAction, setRegistrationAction] = useState(null);
  const [filter, setFilter] = useState('');
  const [mode, setMode] = useState('');
  const selected = workshops.find(item => item.id === attendanceId);
  const selectedRegistration = registrations.find(item => item.workshopId === attendanceId);
  const registrationWorkshop = workshops.find(item => item.id === registrationAction?.id);
  const entries = workshops.flatMap(workshop => {
    const registration = registrations.find(item => item.workshopId === workshop.id);
    if (!registration && !workshop.saved) return [];
    const status = workshop.cancelled || registration?.status === 'cancelled' ? 'cancelled'
      : workshop.completed || registration?.status === 'completed' ? 'completed' : registration?.status || 'saved';
    return [{ workshop, registration, status }];
  });
  const actionable = ({ workshop, registration }) => canSubmitAttendance(workshop, registration)
    || (registrationStates[getRegistrationState(workshop, registration)].canRegister && registrationStates[getRegistrationAvailability(workshop)].canRegister);
  entries.sort((first, second) => Number(Boolean(actionable(second))) - Number(Boolean(actionable(first))));
  const filtered = entries.filter(item => (!filter || item.status === filter) && (!mode || item.workshop.mode === mode));
  const counts = [
    { label: 'Terdaftar', status: 'registered', tone: 'green' },
    { label: 'Waiting list', status: 'waiting', tone: 'amber' },
    { label: 'Selesai', status: 'completed', tone: 'blue' },
    { label: 'Dibatalkan', status: 'cancelled', tone: 'gray' },
  ];
  const startRegistration = (id, action = 'register') => setRegistrationAction({ id, action });

  return <div className="peserta-stack">
    <section className="peserta-intro">
      <h2>Workshop dan kegiatan Anda</h2>
      <p>Daftar workshop tersimpan, pantau antrean, dan isi presensi sesuai jadwal kegiatan.</p>
    </section>
    <div className="peserta-stat-grid">{counts.map(item => <button key={item.status} className={`peserta-stat peserta-stat--${item.tone}${filter === item.status ? ' is-selected' : ''}`} aria-pressed={filter === item.status} onClick={() => setFilter(filter === item.status ? '' : item.status)}><span>{item.label}</span><strong>{entries.filter(entry => entry.status === item.status).length}</strong></button>)}</div>
    <div className="peserta-section-line peserta-my-workshop-heading">
      <h2>Daftar workshop <span className="peserta-count" aria-live="polite">{filtered.length}</span></h2>
      <div className="peserta-workshop-filters">
        <label className="peserta-status-filter"><span className="peserta-sr-only" id="my-workshop-mode">Mode workshop saya</span><select aria-labelledby="my-workshop-mode" value={mode} onChange={event => setMode(event.target.value)}><option value="">Semua mode</option><option value="online">Online</option><option value="offline">Offline</option></select></label>
        <label className="peserta-status-filter"><span className="peserta-sr-only" id="my-workshop-status">Filter status workshop saya</span><select aria-labelledby="my-workshop-status" value={filter} onChange={event => setFilter(event.target.value)}><option value="">Semua status</option><option value="saved">Belum terdaftar</option>{counts.map(item => <option key={item.status} value={item.status}>{item.label}</option>)}</select></label>
      </div>
    </div>
    {filtered.length ? <div className="peserta-list-cards">{filtered.map(({ workshop, registration, status }) => {
      const stateKey = getRegistrationState(workshop, registration);
      const state = registrationStates[stateKey];
      const availability = registrationStates[getRegistrationAvailability(workshop)];
      const attendanceKey = getAttendanceState(workshop, registration);
      const attendanceState = attendanceStates[attendanceKey];
      const canRegister = state.canRegister && availability.canRegister;
      const canAttend = canSubmitAttendance(workshop, registration);
      const showAttendance = registration && status !== 'cancelled';
      const attendanceAction = canAttend ? attendanceKey === 'rejected' ? 'Perbaiki Presensi' : workshop.mode === 'online' ? 'Absen Online' : 'Absen Offline' : 'Status Presensi';
      return <article className="peserta-activity" key={workshop.id} aria-label={workshop.title}>
        <div className={`peserta-datebox${status === 'completed' || status === 'cancelled' ? ' is-muted' : ''}`}>{status === 'completed' ? <Check size={28} /> : <><strong>{workshop.date.split(' ')[0]}</strong><span>{workshop.date.split(' ')[1].toUpperCase()}</span></>}</div>
        <div className="peserta-activity-main">
          <div className="peserta-activity-copy">
            <div className="peserta-activity-status">
              <span className="peserta-mode-label">{workshop.mode === 'online' ? 'Online' : 'Offline'}</span>
              {status === 'saved' && <Status tone="gray">Belum terdaftar</Status>}
              <Status tone={state.tone}>{state.label}{registration?.status === 'waiting' && !workshop.cancelled ? ` · Antrean ${registration.queue}` : ''}</Status>
              {showAttendance && registration.status !== 'waiting' && <Status tone={attendanceState.tone}>{attendanceState.label}</Status>}
            </div>
            <h3>{workshop.title}</h3>
            <p>{workshop.date} &middot; {workshop.time} &middot; {getWorkshopLocation(workshop, 'short')}</p>
            {registration?.status === 'waiting' && !workshop.cancelled && <p className="peserta-waiting-note">Kursi belum dikonfirmasi. Presensi tersedia setelah Anda mendapat kursi.</p>}
            {!registration && !workshop.completed && !workshop.cancelled && <p className="peserta-activity-note">{stateKey === 'not-open' ? `Pendaftaran dibuka ${workshop.opens}.` : `Batas pendaftaran ${workshop.deadline}.`}</p>}
            {showAttendance && <OnlineMeetingInfo workshop={workshop} registration={registration} compact />}
          </div>
          <div className="peserta-row-actions">
            {canRegister ? <button className="peserta-button" onClick={() => startRegistration(workshop.id)}><UserPlus size={16} />{state.action}</button>
              : showAttendance ? <button className={`peserta-button${canAttend ? '' : ' peserta-button--secondary'}`} onClick={() => setAttendanceId(workshop.id)}><ClipboardCheck size={16} />{registration.status === 'waiting' ? 'Status Antrean' : attendanceAction}</button>
                : <button className="peserta-button peserta-button--secondary" disabled>{stateKey === 'cancelled' ? availability.action : state.action}</button>}
            <Link className="peserta-button peserta-button--secondary" to={`/peserta/workshop/${workshop.id}`} state={{ from: 'workshop-saya' }}>Detail</Link>
            {state.canCancel && <button className="peserta-text-button peserta-text-button--danger" onClick={() => startRegistration(workshop.id, 'cancel')}>Batalkan</button>}
          </div>
        </div>
      </article>;
    })}</div> : <EmptyState icon={CalendarDays} title={entries.length ? 'Tidak ada workshop dengan filter ini' : 'Belum ada workshop yang diikuti'} action={entries.length ? <button className="peserta-button peserta-button--secondary" onClick={() => { setFilter(''); setMode(''); }}>Tampilkan Semua</button> : <Link className="peserta-button" to="/peserta/cari-workshop">Cari Workshop</Link>}>{entries.length ? 'Pilih status atau mode lain untuk melihat kegiatan Anda.' : 'Temukan kegiatan yang sesuai dengan minat Anda.'}</EmptyState>}
    {registrationWorkshop && <WorkshopRegistrationDialog key={`${registrationWorkshop.id}-${registrationAction.action}`} workshop={registrationWorkshop} registration={registrations.find(item => item.workshopId === registrationWorkshop.id)} action={registrationAction.action} onClose={() => setRegistrationAction(null)} />}
    {selected && <Modal title={selectedRegistration?.status === 'waiting' ? 'Status Antrean Workshop' : 'Presensi Workshop'} wide onClose={() => setAttendanceId(null)}><div className="peserta-modal-body"><h3>{selected.title}</h3><p>{selected.time} &middot; {getWorkshopLocation(selected)}</p>{selectedRegistration?.status === 'waiting' && <div className="peserta-queue"><span>Nomor antrean Anda</span><strong>{String(selectedRegistration.queue).padStart(2, '0')}</strong><small>Kursi diberikan sesuai urutan antrean.</small></div>}<AttendancePanel key={selected.id} workshop={selected} state={getAttendanceState(selected, selectedRegistration)} attendance={selectedRegistration?.attendance} onSubmit={async evidence => {
      const success = await submitAttendance(selected.id, evidence);
      if (success) notify(evidence.method === 'upload' ? 'Bukti presensi terkirim. Status menunggu verifikasi panitia.' : 'Presensi berhasil. Kehadiran Anda tervalidasi.');
      return success;
    }} /></div><footer><button className="peserta-button peserta-button--secondary" onClick={() => setAttendanceId(null)}>Tutup</button></footer></Modal>}
  </div>;
}
