import { Link, useOutletContext, useParams, useSearchParams } from 'react-router-dom';
import { FilePenLine, History, Printer } from 'lucide-react';
import { formatCorrectionTime, getCertificateVersions } from './certificateCorrections';
import { CertificateDocument, CertificateDownloadButton, CertificateHeading, CertificateMetadata, CertificateNotFound, CorrectionStatus, useCertificateDownload } from './CertificateUi';

export default function DetailSertifikatPeserta() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const { certificateOriginals, corrections } = useOutletContext();
  const download = useCertificateDownload();
  const original = certificateOriginals.find(item => item.id === id);
  if (!original) return <CertificateNotFound />;
  const versions = getCertificateVersions(original, corrections);
  const current = versions.at(-1);
  const requestedVersion = params.get('versi');
  const certificate = requestedVersion === 'asli' ? versions[0] : requestedVersion ? versions.find(item => String(item.revision) === requestedVersion) : current;
  if (!certificate) return <CertificateNotFound />;
  const requests = corrections.filter(item => item.certificateId === id).sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  const active = requests.find(item => ['menunggu', 'diproses'].includes(item.status));
  const oldVersion = certificate.revision !== current.revision;
  return <div className="peserta-stack peserta-certificate-page">    <CertificateHeading title="Detail Sertifikat" description="Ajukan perbaikan kepada penerbit. Dokumen hanya dapat dikoreksi oleh pihak penerbit."><Link className="peserta-button peserta-button--secondary" to="/peserta/sertifikat">Kembali ke Daftar</Link></CertificateHeading>
    <div className="peserta-certificate-banner">Data sertifikat diambil dari sistem. Ajukan perbaikan bila terdapat kesalahan data; penerbit akan menanggapi melalui riwayat perbaikan.</div>
    {oldVersion && <div className="peserta-certificate-warning"><strong>Anda melihat versi terdahulu.</strong><p>Gunakan sertifikat terbaru untuk data yang sudah diperbaiki.</p><Link to={`/peserta/sertifikat/${id}`}>Lihat Sertifikat Terbaru</Link></div>}
    <CertificateMetadata certificate={certificate} />
    <section className="peserta-certificate-panel peserta-document-panel"><header><span>Pratinjau sertifikat · Dokumen contoh</span><span>Versi {certificate.revision}</span></header><CertificateDocument certificate={certificate} /><footer className="peserta-certificate-actions"><button className="peserta-button peserta-button--secondary" onClick={() => window.print()}><Printer size={17} />Cetak</button><CertificateDownloadButton certificate={certificate} {...download} label={oldVersion ? 'Unduh Versi Ini' : 'Unduh PDF'} /></footer>{download.error && <p className="peserta-inline-error" role="alert">{download.error}</p>}</section>
    <section className="peserta-certificate-panel"><div className="peserta-certificate-section-heading"><div><h3>Perbaikan sertifikat</h3><p>Permintaan akan ditujukan kepada {current.issuer} sebagai penerbit sertifikat ini.</p></div><Link className="peserta-button" to={active ? `/peserta/sertifikat/perbaikan/${active.id}` : `/peserta/sertifikat/${id}/perbaikan`}><FilePenLine size={17} />{active ? 'Lihat Pengajuan Berjalan' : 'Ajukan Perbaikan'}</Link></div>
      {active && <div className="peserta-certificate-request-summary"><CorrectionStatus status={active.status} /><p>Pengajuan dikirim {formatCorrectionTime(active.createdAt)}. Tunggu tanggapan penerbit sebelum mengajukan kembali.</p></div>}
      <Link className="peserta-certificate-text-link" to={`/peserta/sertifikat/perbaikan?sertifikat=${id}`}><History size={16} />Riwayat Perbaikan ({requests.length})</Link>
    </section>
    {versions.length > 1 && <section className="peserta-certificate-panel"><h3>Riwayat versi sertifikat</h3><div className="peserta-certificate-version-list">{versions.slice().reverse().map(version => <div key={version.revision}><div><strong>Versi {version.revision}{version.revision === current.revision ? ' · Terbaru' : ' · Dokumen awal'}</strong><p>{version.number} &middot; {version.issued}</p></div><Link className="peserta-button peserta-button--secondary" to={`/peserta/sertifikat/${id}?versi=${version.revision}`}>Lihat Versi</Link></div>)}</div></section>}
  </div>;
}