import { useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { Bell, CheckCheck } from 'lucide-react';
import { EmptyState } from './components';
import { formatCorrectionTime } from './certificateCorrections';
import { CertificateHeading, CorrectionStatus } from './CertificateUi';

export default function NotifikasiPerbaikanSertifikat() {
  const { corrections, certificates, markCorrectionRead } = useOutletContext();
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [error, setError] = useState('');
  const notifications = corrections.filter(item => ['selesai', 'ditolak'].includes(item.status) && certificates.some(certificate => certificate.id === item.certificateId)).sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
  const unread = notifications.filter(item => !item.notificationRead).length;
  const filtered = notifications.filter(item => !unreadOnly || !item.notificationRead);
  const markAll = () => { const result = markCorrectionRead(); setError(result.ok ? '' : result.message); };
  return <div className="peserta-stack">
    <CertificateHeading title="Notifikasi Perbaikan Sertifikat" description="Tanggapan penerbit dan pemberitahuan dokumen pengganti."><Link className="peserta-button peserta-button--secondary" to="/peserta/sertifikat">Kembali ke Daftar</Link></CertificateHeading>
    <div className="peserta-certificate-notification-toolbar"><div className="peserta-certificate-tabs"><button aria-pressed={!unreadOnly} onClick={() => setUnreadOnly(false)}>Semua ({notifications.length})</button><button aria-pressed={unreadOnly} onClick={() => setUnreadOnly(true)}>Belum dibaca ({unread})</button></div><button className="peserta-button peserta-button--secondary" disabled={!unread} onClick={markAll}><CheckCheck size={17} />Tandai Semua Dibaca</button></div>
    {error && <p className="peserta-inline-error" role="alert">{error}</p>}
    {filtered.length ? <div className="peserta-list-cards">{filtered.map(item => {
      const certificate = certificates.find(value => value.id === item.certificateId);
      return <article className={`peserta-certificate-panel peserta-certificate-notification${!item.notificationRead ? ' is-unread' : ''}`} key={item.id}><span className="peserta-certificate-notification-icon"><Bell size={21} /></span><div><div className="peserta-activity-status"><CorrectionStatus status={item.status} />{!item.notificationRead && <span className="peserta-certificate-unread-label">Baru</span>}</div><h3>{item.status === 'selesai' ? 'Perbaikan selesai, sertifikat pengganti tersedia' : 'Pengajuan perbaikan ditolak'}</h3><p>{certificate.workshop.title}</p><p>{item.issuerNote}</p><time>{formatCorrectionTime(item.updatedAt)} &middot; {certificate.issuer}</time></div><Link className="peserta-button peserta-button--secondary" to={`/peserta/sertifikat/perbaikan/${item.id}`}>Lihat Detail</Link></article>;
    })}</div> : <EmptyState icon={Bell} title={notifications.length ? 'Semua notifikasi sudah dibaca' : 'Belum ada notifikasi perbaikan'} action={<Link className="peserta-button peserta-button--secondary" to="/peserta/sertifikat/perbaikan">Lihat Riwayat Pengajuan</Link>}>Hasil pemeriksaan penerbit akan ditampilkan di sini.</EmptyState>}
  </div>;
}