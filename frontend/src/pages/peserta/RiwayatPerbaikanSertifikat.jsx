import { useState } from 'react';
import { Link, useOutletContext, useSearchParams } from 'react-router-dom';
import { History, Search } from 'lucide-react';
import { EmptyState } from './components';
import { correctionStatuses, formatCorrectionTime } from './certificateCorrections';
import { CertificateHeading, CertificateNotificationsLink, CorrectionStatus } from './CertificateUi';

export default function RiwayatPerbaikanSertifikat() {
  const { certificates, corrections } = useOutletContext();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const selectedCertificate = params.get('sertifikat') || '';
  const owned = corrections.filter(item => certificates.some(certificate => certificate.id === item.certificateId));
  const filtered = owned.filter(item => {
    const certificate = certificates.find(value => value.id === item.certificateId);
    return (!selectedCertificate || item.certificateId === selectedCertificate) && (!status || item.status === status)
      && `${item.id} ${certificate.workshop.title} ${certificate.issuer} ${certificate.number}`.toLocaleLowerCase('id-ID').includes(query.trim().toLocaleLowerCase('id-ID'));
  }).sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  return <div className="peserta-stack">
    <CertificateNotificationsLink />
    <CertificateHeading title="Riwayat Perbaikan Sertifikat" description="Pantau pengajuan, tanggapan penerbit, dan dokumen pengganti."><Link className="peserta-button peserta-button--secondary" to="/peserta/sertifikat">Kembali ke Daftar</Link></CertificateHeading>
    <div className="peserta-stat-grid">{['menunggu', 'diproses', 'selesai', 'ditolak'].map(key => <button className={`peserta-stat peserta-stat--${correctionStatuses[key].tone}${status === key ? ' is-selected' : ''}`} key={key} onClick={() => setStatus(status === key ? '' : key)} aria-pressed={status === key}><span>{correctionStatuses[key].label}</span><strong>{owned.filter(item => item.status === key).length}</strong></button>)}</div>
    <section className="peserta-filterbar peserta-certificate-filters" aria-label="Filter riwayat perbaikan"><label className="peserta-searchbox"><Search size={18} /><input type="search" aria-label="Cari pengajuan perbaikan" placeholder="Cari pengajuan atau kegiatan..." value={query} onChange={event => setQuery(event.target.value)} /></label><select aria-label="Filter sertifikat pengajuan" value={selectedCertificate} onChange={event => setParams(event.target.value ? { sertifikat: event.target.value } : {})}><option value="">Semua sertifikat</option>{certificates.map(certificate => <option value={certificate.id} key={certificate.id}>{certificate.workshop.title}</option>)}</select><select aria-label="Filter status pengajuan" value={status} onChange={event => setStatus(event.target.value)}><option value="">Semua status</option>{Object.entries(correctionStatuses).map(([key, config]) => <option value={key} key={key}>{config.label}</option>)}</select></section>
    {filtered.length ? <div className="peserta-certificate-table-wrap"><table className="peserta-certificate-table"><caption className="peserta-sr-only">Daftar pengajuan perbaikan sertifikat</caption><thead><tr><th>Kegiatan / Nomor pengajuan</th><th>Penerbit</th><th>Tanggal pengajuan</th><th>Status</th><th>Aksi</th></tr></thead><tbody>{filtered.map(item => {
      const certificate = certificates.find(value => value.id === item.certificateId);
      return <tr key={item.id}><td data-label="Kegiatan"><strong>{certificate.workshop.title}</strong><span>{item.id}</span><small>{item.changes.map(change => change.label).join(', ')}</small></td><td data-label="Penerbit">{certificate.issuer}</td><td data-label="Tanggal pengajuan">{formatCorrectionTime(item.createdAt)}</td><td data-label="Status"><CorrectionStatus status={item.status} /></td><td data-label="Aksi"><Link className="peserta-button peserta-button--secondary" to={`/peserta/sertifikat/perbaikan/${item.id}`}>Lihat Detail</Link></td></tr>;
    })}</tbody></table></div> : <EmptyState icon={History} title={owned.length ? 'Pengajuan tidak ditemukan' : 'Belum ada pengajuan perbaikan'} action={<Link className="peserta-button peserta-button--secondary" to="/peserta/sertifikat">Lihat Sertifikat</Link>}>{owned.length ? 'Coba filter lain untuk melihat pengajuan Anda.' : 'Ajukan perbaikan melalui detail sertifikat jika ada data yang belum sesuai.'}</EmptyState>}
  </div>;
}