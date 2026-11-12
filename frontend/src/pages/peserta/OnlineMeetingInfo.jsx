import { useEffect, useState } from 'react';
import { Clock3, ExternalLink, LockKeyhole, Video } from 'lucide-react';
import { getMeetingAccess, ONLINE_MEETING_NOTICE } from './meetingAccess';

const releaseDateFormatter = new Intl.DateTimeFormat('id-ID', {
  timeZone: 'Asia/Jakarta', day: 'numeric', month: 'long', year: 'numeric',
});

export default function OnlineMeetingInfo({ workshop, registration, compact = false }) {
  const [now, setNow] = useState(Date.now);
  const access = getMeetingAccess(workshop, registration, now);
  const availableAt = access?.availableAt;

  useEffect(() => {
    if (availableAt === undefined || availableAt === null) return;
    const refresh = () => setNow(Date.now());
    const refreshVisible = () => { if (!document.hidden) refresh(); };
    const remaining = availableAt - now;
    const timer = remaining > 0 ? setTimeout(refresh, Math.min(remaining, 2_147_483_647)) : undefined;
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refreshVisible);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refreshVisible);
    };
  }, [availableAt, now]);

  if (!access || access.status === 'completed') return null;
  const ready = access.status === 'available';
  const pending = access.status === 'pending';
  const Icon = ready ? Video : pending ? Clock3 : LockKeyhole;
  const title = ready ? 'Link pertemuan tersedia' : pending ? 'Menunggu link dari panitia' : 'Link tersedia H-1';

  return <section className={`peserta-meeting-info${compact ? ' peserta-meeting-info--compact' : ''}`} aria-label="Informasi link pertemuan" aria-live="polite">
    <Icon size={compact ? 17 : 20} aria-hidden="true" />
    <div className="peserta-meeting-content">
      <strong>{title}</strong>
      <p>{ONLINE_MEETING_NOTICE}</p>
      {availableAt !== null && <small>Jadwal pembagian: {releaseDateFormatter.format(availableAt)} (H-1).</small>}
      {access.status === 'waiting-list' && <small>Link akan diberikan setelah pendaftaran Anda terkonfirmasi.</small>}
      {pending && <small>Link belum tersedia. Silakan menunggu informasi dari panitia.</small>}
      {ready && <a className="peserta-button" href={access.url} target="_blank" rel="noopener noreferrer"><ExternalLink size={16} />Gabung pertemuan</a>}
    </div>
  </section>;
}
