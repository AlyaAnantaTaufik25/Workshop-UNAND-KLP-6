import { useRef, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { Award, Building2, Download, LoaderCircle, SearchX } from 'lucide-react';
import UnandLogo from '../../components/UnandLogo';
import { getWorkshopLocation } from './data';
import { EmptyState, Status } from './components';
import { correctionStatuses } from './certificateCorrections';

export function CertificateHeading({ title, description, children }) {
  return <section className="peserta-certificate-heading"><div><span className="peserta-tag">SERTIFIKAT SAYA</span><h2>{title}</h2><p>{description}</p></div><div className="peserta-certificate-actions">{children}</div></section>;
}

export function CertificateMetadata({ certificate }) {
  const rows = [
    ['Nama peserta', [certificate.recipient, certificate.degree].filter(Boolean).join(', ')],
    ['Nama kegiatan', certificate.workshop.title], ['Jenis kegiatan', certificate.kind || 'Workshop'],
    ['Nomor sertifikat', certificate.number], ['Tanggal kegiatan', certificate.workshop.isoDate ? new Date(`${certificate.workshop.isoDate}T12:00:00+07:00`).toLocaleDateString('id-ID', { timeZone: 'Asia/Jakarta' }) : certificate.workshop.date],
    ['Penerbit sertifikat', certificate.issuer || 'UNAND'],
  ];
  return <section className="peserta-certificate-panel"><dl className="peserta-certificate-metadata">{rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><Status>{certificate.revision > 1 ? 'Diperbaiki · Diterbitkan' : 'Diterbitkan'}</Status></section>;
}

export function CertificateDocument({ certificate }) {
  return <div className="peserta-certificate-preview">
    <div className="peserta-certificate-brand">{certificate.issuerType === 'mitra' ? <Building2 size={34} /> : <UnandLogo className="peserta-brandmark" />}<strong>{certificate.issuerType === 'mitra' ? certificate.issuer.toUpperCase() : 'UNIVERSITAS ANDALAS'}</strong></div>
    <span>SERTIFIKAT</span><p>No. {certificate.number}</p><p>Diberikan kepada</p><h2>{[certificate.recipient, certificate.degree].filter(Boolean).join(', ')}</h2>
    <p>Atas partisipasinya sebagai peserta dalam kegiatan</p><h3>{certificate.workshop.title}</h3><p>{certificate.workshop.date} &middot; {getWorkshopLocation(certificate.workshop)}</p>
    {certificate.additionalInfo && <p>{certificate.additionalInfo}</p>}
    <div className="peserta-certificate-issued">Diterbitkan pada {certificate.issued}<br />{certificate.issuer || 'Universitas Andalas'}</div>
    <p className="peserta-certificate-demo">Dokumen resmi · SIM Workshop UNAND</p>
  </div>;
}

export function CorrectionStatus({ status }) {
  const config = correctionStatuses[status];
  return <Status tone={config.tone}>{config.label}</Status>;
}

export function CertificateNotFound({ request = false }) {
  return <EmptyState icon={SearchX} title={request ? 'Pengajuan tidak ditemukan' : 'Sertifikat tidak ditemukan'} action={<Link className="peserta-button" to="/peserta/sertifikat">Kembali ke Daftar</Link>}>Dokumen ini tidak tersedia untuk peserta.</EmptyState>;
}

export function useCertificateDownload() {
  const { notify } = useOutletContext();
  const [downloadingId, setDownloadingId] = useState(null);
  const [error, setError] = useState('');
  const busy = useRef(false);
  const download = async certificate => {
    if (busy.current) return;
    busy.current = true;
    setDownloadingId(certificate.id);
    setError('');
    try {
      const { downloadCertificatePdf } = await import('./certificatePdf');
      await downloadCertificatePdf(certificate);
      notify('Unduhan sertifikat PDF dimulai.');
    } catch {
      setError('Sertifikat belum berhasil diunduh. Periksa koneksi, lalu coba lagi.');
    } finally { busy.current = false; setDownloadingId(null); }
  };
  return { download, downloadingId, error };
}

export function CertificateDownloadButton({ certificate, download, downloadingId, secondary = false, label = 'Unduh PDF' }) {
  return <button className={`peserta-button${secondary ? ' peserta-button--secondary' : ''}`} disabled={downloadingId !== null} onClick={() => download(certificate)}>{downloadingId === certificate.id ? <LoaderCircle size={17} className="peserta-spin" /> : <Download size={17} />}{downloadingId === certificate.id ? 'Menyiapkan PDF…' : label}</button>;
}

export function CertificateEmpty() {
  return <EmptyState icon={Award} title="Belum ada sertifikat tersedia">Sertifikat akan muncul setelah kehadiran Anda divalidasi dan dokumen diterbitkan.</EmptyState>;
}
