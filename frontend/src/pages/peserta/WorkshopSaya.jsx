import { useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { CalendarDays, Check, ClipboardCheck, Info } from 'lucide-react';
import { getWorkshopLocation, participantWorkshops } from './data';
import { EmptyState, Modal, Status } from './components';
import OnlineMeetingInfo from './OnlineMeetingInfo';

export default function WorkshopSaya() {
  const { registrations } = useOutletContext();
  const [attendance, setAttendance] = useState(null);
  return <div className="peserta-stack"><section className="peserta-intro"><h2>Kegiatan yang Anda ikuti</h2><p>Pantau status pendaftaran dan akses presensi workshop.</p></section>
    {registrations.length ? <div className="peserta-list-cards">{registrations.map(registration => {
      const workshop = participantWorkshops.find(item => item.id === registration.workshopId);
      const done = registration.status === 'completed';
      return <article className="peserta-activity" key={workshop.id}><div className={`peserta-datebox${done ? ' is-muted' : ''}`}>{done ? <Check size={28} /> : <><strong>{workshop.date.split(' ')[0]}</strong><span>{workshop.date.split(' ')[1].toUpperCase()}</span></>}</div><div className="peserta-activity-main"><div><div className="peserta-activity-status"><Status tone={done ? 'gray' : registration.status === 'waiting' ? 'amber' : 'green'}>{done ? 'Selesai' : registration.status === 'waiting' ? `Waiting List · Antrean ${registration.queue}` : 'Terdaftar'}</Status></div><h3>{workshop.title}</h3><p>{workshop.date} &middot; {getWorkshopLocation(workshop, 'short')}</p><OnlineMeetingInfo workshop={workshop} registration={registration} compact /></div><div className="peserta-row-actions">{registration.status === 'registered' && <button className="peserta-button" onClick={() => setAttendance(workshop)}>Presensi</button>}<Link className="peserta-button peserta-button--secondary" to={`/peserta/workshop/${workshop.id}`} state={{ from: 'workshop-saya' }}>Detail</Link></div></div></article>;
    })}</div> : <EmptyState icon={CalendarDays} title="Belum ada workshop yang diikuti" action={<Link className="peserta-button" to="/peserta/cari-workshop">Cari Workshop</Link>}>Temukan kegiatan yang sesuai dengan minat Anda.</EmptyState>}
    {attendance && <Modal title="Presensi Workshop" onClose={() => setAttendance(null)}><div className="peserta-modal-body"><div className="peserta-attendance-icon"><ClipboardCheck size={32} /></div><h3>{attendance.title}</h3><p>{attendance.date} &middot; {attendance.time}</p><OnlineMeetingInfo workshop={attendance} registration={registrations.find(item => item.workshopId === attendance.id)} /><div className="peserta-info"><Info size={19} /><p>{attendance.mode === 'online' ? 'Presensi online dilakukan melalui tautan resmi yang dibagikan panitia pada sesi pertemuan. Kehadiran Anda akan divalidasi oleh panitia.' : 'Presensi dilakukan di lokasi kegiatan menggunakan QR atau tautan resmi dari panitia. Hubungi panitia untuk mengonfirmasi kehadiran Anda.'}</p></div><dl className="peserta-summary"><div><dt>Lokasi</dt><dd>{getWorkshopLocation(attendance)}</dd></div><div><dt>Status kehadiran</dt><dd>Belum ada presensi tervalidasi</dd></div></dl></div><footer><button className="peserta-button peserta-button--secondary" onClick={() => setAttendance(null)}>Tutup</button></footer></Modal>}
  </div>;
}
