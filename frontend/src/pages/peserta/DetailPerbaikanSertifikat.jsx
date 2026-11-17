import { useEffect, useState } from 'react';
import { Link, useOutletContext, useParams } from 'react-router-dom';
import { Check, FileText, X } from 'lucide-react';
import { Modal } from './components';
import { formatCorrectionTime, getCertificateVersions } from './certificateCorrections';
import { CertificateDocument, CertificateDownloadButton, CertificateHeading, CertificateNotFound, CertificateNotificationsLink, CorrectionStatus, useCertificateDownload } from './CertificateUi';

export default function DetailPerbaikanSertifikat() {
  const { requestId } = useParams();
  const { certificates, certificateOriginals, corrections, cancelCorrection, markCorrectionRead, notify } = useOutletContext();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState('');
  const download = useCertificateDownload();
  const request = corrections.find(item => item.id === requestId && certificates.some(certificate => certificate.id === item.certificateId));
  useEffect(() => {
    if (request && !request.notificationRead && ['selesai', 'ditolak'].includes(request.status)) {
      const result = markCorrectionRead(request.id);
      if (!result.ok) notify(result.message);
    }
  }, [request?.id, request?.notificationRead, request?.status, markCorrectionRead, notify]);
  if (!request) return <CertificateNotFound request />;
  const certificate = certificates.find(item => item.id === request.certificateId);
  const original = certificateOriginals.find(item => item.id === request.certificateId);
  const replacement = getCertificateVersions(original, corrections).find(item => item.correctionId === request.id);
  const cancel = () => {
    const result = cancelCorrection(request.id);
    if (!result.ok) { setError(result.message); return; }
    setConfirming(false); notify('Pengajuan perbaikan dibatalkan. Sertifikat tetap seperti semula.');
  };
  return <div className="peserta-stack peserta-certificate-page">
    <CertificateNotificationsLink />
    <CertificateHeading title="Detail Pengajuan Perbaikan" description="Lihat usulan, perkembangan pemeriksaan, dan tanggapan penerbit."><Link className="peserta-button peserta-button--secondary" to="/peserta/sertifikat/perbaikan">Kembali ke Riwayat</Link></CertificateHeading>
    <section className="peserta-certificate-panel"><div className="peserta-certificate-section-heading"><div><span className="peserta-tag">{request.id}</span><h3>{certificate.workshop.title}</h3><p>Penerbit: {certificate.issuer}</p></div><CorrectionStatus status={request.status} /></div><dl className="peserta-certificate-metadata"><div><dt>Nomor sertifikat saat pengajuan</dt><dd>{request.certificateNumber || original.number}</dd></div><div><dt>Tanggal pengajuan</dt><dd>{formatCorrectionTime(request.createdAt)}</dd></div><div><dt>Terakhir diperbarui</dt><dd>{formatCorrectionTime(request.updatedAt)}</dd></div></dl></section>
    <section className="peserta-certificate-panel"><h3>Rincian perbaikan yang diajukan</h3><div className="peserta-certificate-table-wrap"><table className="peserta-certificate-table"><caption className="peserta-sr-only">Perbandingan data saat pengajuan dan usulan perbaikan</caption><thead><tr><th>Bagian</th><th>Data saat pengajuan</th><th>Usulan perbaikan</th></tr></thead><tbody>{request.changes.map(change => <tr key={change.field}><td data-label="Bagian">{change.label}</td><td data-label="Data saat pengajuan">{change.oldValue || 'Belum tercantum'}</td><td data-label="Usulan perbaikan"><strong>{change.newValue}</strong></td></tr>)}</tbody></table></div><div className="peserta-certificate-reason"><h4>Alasan perbaikan</h4><p>{request.reason}</p></div>{request.attachment && <div className="peserta-certificate-attachment"><FileText size={22} /><div><strong>{request.attachment.name}</strong><p>{Math.ceil(request.attachment.size / 1024)} KB · Dokumen pendukung</p></div><a className="peserta-button peserta-button--secondary" href={request.attachment.dataUrl} download={request.attachment.name}>Unduh Lampiran</a></div>}</section>
    <div className="peserta-certificate-detail-grid"><section className="peserta-certificate-panel"><h3>Perkembangan pengajuan</h3><ol className="peserta-correction-timeline">{request.events.map((event, index) => <li key={`${event.status}-${index}`}><span><Check size={14} /></span><div><CorrectionStatus status={event.status} /><time>{formatCorrectionTime(event.at)}</time><p>{event.note}</p></div></li>)}</ol></section><section className="peserta-certificate-panel"><h3>Tanggapan penerbit</h3><div className={`peserta-certificate-response peserta-certificate-response--${request.status}`}><p>{request.issuerNote || (request.status === 'dibatalkan' ? 'Pengajuan telah dibatalkan oleh peserta. Tidak ada perubahan pada sertifikat.' : request.status === 'menunggu' ? 'Pengajuan menunggu pemeriksaan penerbit. Sertifikat belum berubah.' : 'Penerbit sedang memeriksa pengajuan Anda. Hasil akan muncul pada notifikasi perbaikan.')}</p></div><div className="peserta-certificate-actions peserta-certificate-actions--start"><Link className="peserta-button peserta-button--secondary" to={`/peserta/sertifikat/${certificate.id}`}>Lihat Sertifikat</Link>{['ditolak', 'dibatalkan'].includes(request.status) && <Link className="peserta-button" to={`/peserta/sertifikat/${certificate.id}/perbaikan?ulang=${request.id}`}>Ajukan Kembali</Link>}{request.status === 'menunggu' && <button className="peserta-button peserta-button--secondary" onClick={() => { setError(''); setConfirming(true); }}><X size={16} />Batalkan Pengajuan</button>}</div></section></div>
    {replacement && <section className="peserta-certificate-panel peserta-document-panel"><header><div><h3>Dokumen pengganti tersedia</h3><p>Perbaikan telah diterbitkan oleh {certificate.issuer}. Dokumen awal tetap tersimpan dalam riwayat versi.</p></div></header><CertificateDocument certificate={replacement} /><footer className="peserta-certificate-actions"><Link className="peserta-button peserta-button--secondary" to={`/peserta/sertifikat/${certificate.id}?versi=asli`}>Lihat Dokumen Awal</Link><CertificateDownloadButton certificate={replacement} {...download} label="Unduh Sertifikat Pengganti" /></footer>{download.error && <p className="peserta-inline-error" role="alert">{download.error}</p>}</section>}
    {confirming && <Modal title="Batalkan Pengajuan Perbaikan?" onClose={() => setConfirming(false)}><div className="peserta-modal-body"><p>Pengajuan {request.id} akan dibatalkan. Dokumen sertifikat tidak berubah dan Anda dapat mengajukan kembali.</p>{error && <p className="peserta-inline-error" role="alert">{error}</p>}</div><footer><button className="peserta-button peserta-button--secondary" onClick={() => setConfirming(false)}>Tetap Ajukan</button><button className="peserta-button peserta-button--danger" onClick={cancel}>Ya, Batalkan</button></footer></Modal>}
  </div>;
}