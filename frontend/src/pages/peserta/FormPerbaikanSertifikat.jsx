import { useRef, useState } from 'react';
import { Link, useNavigate, useOutletContext, useParams, useSearchParams } from 'react-router-dom';
import { Check, FilePenLine, LoaderCircle, Upload } from 'lucide-react';
import { Modal } from './components';
import { certificateValues, correctionFields, validateAttachment, validateCorrection } from './certificateCorrections';
import { CertificateHeading, CertificateNotFound } from './CertificateUi';
import useUnsavedChanges from '../../hooks/useUnsavedChanges';

function readAttachment(file) {
  if (!file) return Promise.resolve(null);
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Dokumen pendukung belum dapat dibaca. Pilih ulang berkasnya.'));
    reader.onload = () => resolve({ name: file.name, type: file.type, size: file.size, dataUrl: reader.result });
    reader.readAsDataURL(file);
  });
}

export default function FormPerbaikanSertifikat() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const { certificates, corrections, submitCorrection, notify } = useOutletContext();
  const navigate = useNavigate();
  const certificate = certificates.find(item => item.id === id);
  const previous = corrections.find(item => item.id === params.get('ulang') && item.certificateId === id && ['ditolak', 'dibatalkan'].includes(item.status));
  const [selected, setSelected] = useState(() => previous?.changes.map(change => change.field) || []);
  const [values, setValues] = useState(() => Object.fromEntries(previous?.changes.map(change => [change.field, change.newValue]) || []));
  const [reason, setReason] = useState(previous?.reason || '');
  const [file, setFile] = useState(null);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const initialFields = previous?.changes.map(change => change.field) || [];
  const dirty = !busy && (selected.join() !== initialFields.join() || reason !== (previous?.reason || '') || Boolean(file) || Object.keys(values).some(k => (values[k] || '') !== (previous?.changes.find(c => c.field === k)?.newValue || '')));
  useUnsavedChanges(dirty);
  if (!certificate) return <CertificateNotFound />;
  const active = corrections.find(item => item.certificateId === id && ['menunggu', 'diproses'].includes(item.status));
  if (active) return <div className="peserta-stack"><CertificateHeading title="Pengajuan masih berjalan" description="Selesaikan pengajuan yang sedang diperiksa sebelum mengajukan perbaikan baru." /><div className="peserta-certificate-panel"><p>Sertifikat {certificate.number} memiliki pengajuan aktif.</p><Link className="peserta-button" to={`/peserta/sertifikat/perbaikan/${active.id}`}>Lihat Pengajuan</Link></div></div>;
  const current = certificateValues(certificate);
  const payload = { changes: selected.map(field => ({ field, newValue: values[field] || '' })), reason, agreed };
  const toggle = field => { setSelected(items => items.includes(field) ? items.filter(item => item !== field) : [...items, field]); setError(''); };
  const review = event => {
    event.preventDefault();
    const message = validateCorrection(certificate, payload, corrections) || validateAttachment(file);
    if (message) { setError(message); return; }
    setError(''); setConfirming(true);
  };
  const send = async () => {
    if (busyRef.current) return;
    busyRef.current = true; setBusy(true); setError('');
    try {
      const attachment = await readAttachment(file);
      const result = await submitCorrection(certificate, { ...payload, attachment });
      if (!result.ok) { setError(result.message); return; }
      notify('Pengajuan perbaikan tersimpan. Status menunggu pemeriksaan penerbit.');
      navigate(`/peserta/sertifikat/perbaikan/${result.request.id}`, { replace: true });
    } catch (failure) { setError(failure.message || 'Pengajuan belum tersimpan. Silakan coba lagi.'); }
    finally { busyRef.current = false; setBusy(false); }
  };
  return <div className="peserta-stack">    <CertificateHeading title="Ajukan Perbaikan Sertifikat" description="Sampaikan bagian yang salah dan usulan data yang benar kepada penerbit."><Link className="peserta-button peserta-button--secondary" to={`/peserta/sertifikat/${id}`}>Kembali ke Detail</Link></CertificateHeading>
    <div className="peserta-certificate-banner">Pengajuan dikirim ke penerbit sertifikat. Data pada sertifikat tetap berlaku sampai penerbit menerbitkan perbaikan.</div>
    <form className="peserta-certificate-panel peserta-correction-form" onSubmit={review}>
      <div className="peserta-certificate-form-summary"><FilePenLine size={22} /><div><h3>{certificate.workshop.title}</h3><p>{certificate.number}</p><p>Penerbit tujuan: <strong>{certificate.issuer}</strong></p></div></div>
      <fieldset><legend>Bagian yang perlu diperbaiki <span aria-hidden="true">*</span></legend><div className="peserta-correction-fields">{Object.entries(correctionFields).map(([field, config]) => <label className="peserta-checkbox" key={field}><input type="checkbox" checked={selected.includes(field)} onChange={() => toggle(field)} /><span>{config.label}</span></label>)}</div></fieldset>
      {selected.map(field => <section className="peserta-correction-field" key={field}><h3>{correctionFields[field].label}</h3><div><span>Data saat ini</span><p>{current[field] || 'Belum tercantum'}</p></div><label htmlFor={`correction-${field}`}>Usulan {correctionFields[field].label.toLowerCase()} <span aria-hidden="true">*</span></label>{['activity', 'other'].includes(field) ? <textarea id={`correction-${field}`} rows={3} value={values[field] || ''} onChange={event => setValues(items => ({ ...items, [field]: event.target.value }))} maxLength={correctionFields[field].maxLength} required /> : <input id={`correction-${field}`} value={values[field] || ''} onChange={event => setValues(items => ({ ...items, [field]: event.target.value }))} maxLength={correctionFields[field].maxLength} required />}</section>)}
      <label className="peserta-correction-label" htmlFor="correction-reason">Alasan perbaikan <span aria-hidden="true">*</span></label><textarea id="correction-reason" rows={4} value={reason} onChange={event => setReason(event.target.value)} placeholder="Jelaskan bagian yang salah dan alasan perbaikan..." minLength={10} maxLength={1000} required /><p className="peserta-certificate-help">Minimal 10 karakter, maksimal 1.000 karakter.</p>
      <label className="peserta-correction-label" htmlFor="correction-attachment">Dokumen pendukung (opsional)</label><div className="peserta-correction-upload"><Upload size={22} /><div><input id="correction-attachment" type="file" accept="application/pdf,image/png,image/jpeg" onChange={event => { const next = event.target.files?.[0] || null; const message = validateAttachment(next); setError(message); setFile(message ? null : next); if (message) event.target.value = ''; }} /><p>PDF, JPG, atau PNG · Maksimal 2 MB</p></div>{file && <button type="button" className="peserta-text-button" onClick={() => { setFile(null); document.getElementById('correction-attachment').value = ''; }}>Hapus Lampiran</button>}</div>
      <label className="peserta-checkbox"><input type="checkbox" checked={agreed} onChange={event => setAgreed(event.target.checked)} required /><span>Saya memastikan usulan perbaikan sesuai dengan data yang benar dan bersedia menunggu pemeriksaan penerbit.</span></label>
      {error && !confirming && <p className="peserta-inline-error" role="alert">{error}</p>}
      <div className="peserta-certificate-actions"><Link className="peserta-button peserta-button--secondary" to={`/peserta/sertifikat/${id}`}>Batal</Link><button className="peserta-button" type="submit"><Check size={17} />Tinjau Pengajuan</button></div>
    </form>
    {confirming && <Modal title="Konfirmasi Pengajuan Perbaikan" onClose={() => { if (!busy) setConfirming(false); }}><div className="peserta-modal-body"><h3>{certificate.workshop.title}</h3><p>Pengajuan ditujukan kepada {certificate.issuer}.</p><dl className="peserta-summary">{payload.changes.map(change => <div key={change.field}><dt>{correctionFields[change.field].label}</dt><dd>{change.newValue}</dd></div>)}<div><dt>Alasan</dt><dd>{reason}</dd></div>{file && <div><dt>Lampiran</dt><dd>{file.name}</dd></div>}</dl><p>Sertifikat tidak berubah sebelum penerbit menyetujui dan menerbitkan dokumen pengganti.</p>{error && <p className="peserta-inline-error" role="alert">{error}</p>}</div><footer><button className="peserta-button peserta-button--secondary" disabled={busy} onClick={() => setConfirming(false)}>Periksa Kembali</button><button className="peserta-button" disabled={busy} onClick={send}>{busy ? <LoaderCircle size={17} className="peserta-spin" /> : <Check size={17} />}{busy ? 'Menyimpan…' : 'Kirim Pengajuan'}</button></footer></Modal>}
  </div>;
}