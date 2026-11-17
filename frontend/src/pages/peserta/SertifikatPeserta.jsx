import { useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { Award, Eye, FilePenLine, History, Search, SearchX } from 'lucide-react';
import { EmptyState, Status } from './components';
import { correctionStatuses } from './certificateCorrections';
import { CertificateDownloadButton, CertificateEmpty, CertificateHeading, CertificateNotificationsLink, CorrectionStatus, useCertificateDownload } from './CertificateUi';

export default function SertifikatPeserta() {
  const { certificates, corrections } = useOutletContext();
  const [query, setQuery] = useState('');
  const [issuer, setIssuer] = useState('');
  const [status, setStatus] = useState('');
  const download = useCertificateDownload();
  const latestRequest = certificateId => corrections.filter(item => item.certificateId === certificateId).sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))[0];
  const filtered = certificates.filter(certificate => {
    const text = `${certificate.recipient} ${certificate.workshop.title} ${certificate.number} ${certificate.issuer}`.toLocaleLowerCase('id-ID');
    return text.includes(query.trim().toLocaleLowerCase('id-ID')) && (!issuer || certificate.issuerType === issuer)
      && (!status || (latestRequest(certificate.id)?.status || 'none') === status);
  }).sort((a, b) => (b.workshop.isoDate || '').localeCompare(a.workshop.isoDate || ''));
  if (!certificates.length) return <CertificateEmpty />;
  return <div className="peserta-stack">
    <CertificateNotificationsLink />
    <CertificateHeading title="Sertifikat Anda" description="Lihat, unduh, dan ajukan perbaikan sertifikat dari kegiatan yang telah selesai.">
      <Link className="peserta-button peserta-button--secondary" to="/peserta/sertifikat/perbaikan"><History size={17} />Riwayat Perbaikan</Link>
    </CertificateHeading>
    <section className="peserta-filterbar peserta-certificate-filters" aria-label="Filter sertifikat">
      <label className="peserta-searchbox"><Search size={18} /><input type="search" aria-label="Cari sertifikat" placeholder="Cari kegiatan, nomor, atau penerbit..." value={query} onChange={event => setQuery(event.target.value)} /></label>
      <select aria-label="Penerbit sertifikat" value={issuer} onChange={event => setIssuer(event.target.value)}><option value="">Semua penerbit</option><option value="unand">UNAND</option><option value="mitra">Mitra</option></select>
      <select aria-label="Status perbaikan sertifikat" value={status} onChange={event => setStatus(event.target.value)}><option value="">Semua perbaikan</option><option value="none">Belum ada pengajuan</option>{Object.entries(correctionStatuses).map(([key, config]) => <option value={key} key={key}>{config.label}</option>)}</select>
    </section>
    <div className="peserta-section-line"><h2>Daftar sertifikat <span className="peserta-count" aria-live="polite">{filtered.length}</span></h2></div>
    {download.error && <p className="peserta-inline-error" role="alert">{download.error}</p>}
    {filtered.length ? filtered.map(certificate => {
      const request = latestRequest(certificate.id);
      const active = request && ['menunggu', 'diproses'].includes(request.status);
      return <article className="peserta-certificate-row" key={certificate.id} aria-label={certificate.workshop.title}>
        <div className="peserta-certificate-icon"><Award size={30} /></div>
        <div className="peserta-certificate-details"><div className="peserta-activity-status"><Status>{certificate.revision > 1 ? 'Diperbaiki' : 'Diterbitkan'}</Status>{request && <CorrectionStatus status={request.status} />}</div><h3>{certificate.workshop.title}</h3><p>No. {certificate.number} &middot; Terbit {certificate.issued}</p><p className="peserta-certificate-issuer">Penerbit: {certificate.issuer} &middot; {certificate.kind || 'Workshop'}</p></div>
        <div className="peserta-certificate-actions">
          <Link className="peserta-button peserta-button--secondary" to={`/peserta/sertifikat/${certificate.id}`}><Eye size={17} />Lihat Detail</Link>
          <Link className="peserta-button peserta-button--secondary" to={active ? `/peserta/sertifikat/perbaikan/${request.id}` : `/peserta/sertifikat/${certificate.id}/perbaikan`}><FilePenLine size={17} />{active ? 'Lihat Pengajuan' : 'Ajukan Perbaikan'}</Link>
          <CertificateDownloadButton certificate={certificate} {...download} />
        </div>
      </article>;
    }) : <EmptyState icon={SearchX} title="Sertifikat tidak ditemukan" action={<button className="peserta-button peserta-button--secondary" onClick={() => { setQuery(''); setIssuer(''); setStatus(''); }}>Reset Filter</button>}>Coba kata kunci, penerbit, atau status perbaikan lain.</EmptyState>}
  </div>;
}