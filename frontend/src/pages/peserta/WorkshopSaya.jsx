import { useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { CalendarDays, Check, ClipboardCheck, PanelsTopLeft } from 'lucide-react';
import { getWorkshopLocation } from './data';
import { EmptyState, Modal, Status } from './components';
import OnlineMeetingInfo from './OnlineMeetingInfo';
import { attendanceStates, getAttendanceState, getRegistrationState, registrationStates } from './workshopStates';
import { AttendancePanel } from './WorkshopStatePanels';

export default function WorkshopSaya() {
  const { workshops, registrations, submitAttendance, notify } = useOutletContext();
  const [attendanceId, setAttendanceId] = useState(null);
  const [filter, setFilter] = useState('');
  const selected = workshops.find(item => item.id === attendanceId);
  const selectedRegistration = registrations.find(item => item.workshopId === attendanceId);
  const filtered = registrations.filter(item => !filter || item.status === filter);
  const counts = [
    { label: 'Terdaftar', status: 'registered', tone: 'green' },
    { label: 'Waiting list', status: 'waiting', tone: 'amber' },
    { label: 'Selesai', status: 'completed', tone: 'blue' },
    { label: 'Dibatalkan', status: 'cancelled', tone: 'gray' },
  ];

  return <div className="peserta-stack">
    <section className="peserta-intro peserta-intro--split"><div><h2>Kegiatan yang Anda ikuti</h2><p>Pantau pendaftaran, antrean, dan kehadiran setiap workshop.</p></div><Link className="peserta-button peserta-button--secondary" to="/peserta/pratinjau-kondisi"><PanelsTopLeft size={17} />Lihat Semua Kondisi</Link></section>
    <div className="peserta-stat-grid">{counts.map(item => <button key={item.status} className={`peserta-stat peserta-stat--${item.tone}${filter === item.status ? ' is-selected' : ''}`} aria-pressed={filter === item.status} onClick={() => setFilter(filter === item.status ? '' : item.status)}><span>{item.label}</span><strong>{registrations.filter(registration => registration.status === item.status).length}</strong></button>)}</div>
    <div className="peserta-section-line"><h2>Daftar workshop <span className="peserta-count">{filtered.length}</span></h2><label className="peserta-status-filter"><span className="peserta-sr-only">Filter status workshop saya</span><select value={filter} onChange={event => setFilter(event.target.value)}><option value="">Semua status</option>{counts.map(item => <option key={item.status} value={item.status}>{item.label}</option>)}</select></label></div>
    {filtered.length ? <div className="peserta-list-cards">{filtered.map(registration => {
      const workshop = workshops.find(item => item.id === registration.workshopId);
      const stateKey = getRegistrationState(workshop, registration);
      const state = registrationStates[stateKey];
      const attendanceKey = getAttendanceState(workshop, registration);
      const attendanceState = attendanceStates[attendanceKey];
      const done = stateKey === 'completed';
      return <article className="peserta-activity" key={workshop.id}>
        <div className={`peserta-datebox${done || registration.status === 'cancelled' ? ' is-muted' : ''}`}>{done ? <Check size={28} /> : <><strong>{workshop.date.split(' ')[0]}</strong><span>{workshop.date.split(' ')[1].toUpperCase()}</span></>}</div>
        <div className="peserta-activity-main"><div><div className="peserta-activity-status"><Status tone={state.tone}>{state.label}{registration.status === 'waiting' ? ` · Antrean ${registration.queue}` : ''}</Status>{registration.status !== 'waiting' && <Status tone={attendanceState.tone}>{attendanceState.label}</Status>}</div><h3>{workshop.title}</h3><p>{workshop.date} &middot; {getWorkshopLocation(workshop, 'short')}</p>{registration.status === 'waiting' && <p className="peserta-waiting-note">Kursi belum dikonfirmasi. Kami menunggu ketersediaan dari peserta lain.</p>}{registration.status !== 'cancelled' && !workshop.cancelled && <OnlineMeetingInfo workshop={workshop} registration={registration} compact />}</div>
          <div className="peserta-row-actions"><button className={`peserta-button${attendanceKey === 'open' ? '' : ' peserta-button--secondary'}`} onClick={() => setAttendanceId(workshop.id)}><ClipboardCheck size={16} />{attendanceKey === 'open' ? 'Isi Presensi' : 'Status Presensi'}</button><Link className="peserta-button peserta-button--secondary" to={`/peserta/workshop/${workshop.id}`} state={{ from: 'workshop-saya' }}>Detail</Link></div>
        </div>
      </article>;
    })}</div> : <EmptyState icon={CalendarDays} title={registrations.length ? 'Tidak ada workshop dengan status ini' : 'Belum ada workshop yang diikuti'} action={registrations.length ? <button className="peserta-button peserta-button--secondary" onClick={() => setFilter('')}>Tampilkan Semua</button> : <Link className="peserta-button" to="/peserta/cari-workshop">Cari Workshop</Link>}>{registrations.length ? 'Pilih status lain untuk melihat kegiatan Anda.' : 'Temukan kegiatan yang sesuai dengan minat Anda.'}</EmptyState>}
    {selected && <Modal title="Presensi Workshop" wide onClose={() => setAttendanceId(null)}><div className="peserta-modal-body"><h3>{selected.title}</h3><p>{selected.time} &middot; {getWorkshopLocation(selected)}</p><AttendancePanel key={selected.id} workshop={selected} state={getAttendanceState(selected, selectedRegistration)} attendance={selectedRegistration?.attendance} onSubmit={async evidence => {
      const success = await submitAttendance(selected.id, evidence);
      if (success) notify('Presensi disimpan di browser. Status menunggu verifikasi panitia.');
      return success;
    }} /></div><footer><button className="peserta-button peserta-button--secondary" onClick={() => setAttendanceId(null)}>Tutup</button></footer></Modal>}
  </div>;
}
