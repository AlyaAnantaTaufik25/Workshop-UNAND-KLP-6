export const CORRECTIONS_STORAGE_KEY = 'workshop-unand:peserta:certificate-corrections:v1';
export const correctionStatuses = {
  menunggu: { label: 'Menunggu pemeriksaan', tone: 'amber' },
  diproses: { label: 'Sedang diproses', tone: 'blue' },
  selesai: { label: 'Selesai', tone: 'green' },
  ditolak: { label: 'Ditolak', tone: 'red' },
  dibatalkan: { label: 'Dibatalkan', tone: 'gray' },
};
export const correctionFields = {
  recipient: { label: 'Nama peserta', maxLength: 100 },
  degree: { label: 'Gelar peserta', maxLength: 60 },
  activity: { label: 'Informasi kegiatan', maxLength: 200 },
  other: { label: 'Informasi lainnya', maxLength: 500 },
};
export const activeCorrectionStatuses = ['menunggu', 'diproses'];
export const attachmentTypes = ['application/pdf', 'image/jpeg', 'image/png'];
export const MAX_ATTACHMENT_SIZE = 2 * 1024 * 1024;

export function certificateValues(certificate) {
  return { recipient: certificate.recipient, degree: certificate.degree || '', activity: certificate.workshop.title, other: certificate.additionalInfo || '' };
}

export function validateAttachment(file) {
  return file && (!attachmentTypes.includes(file.type) || !Number.isFinite(file.size) || file.size <= 0 || file.size > MAX_ATTACHMENT_SIZE || typeof file.name !== 'string' || !file.name.trim() || file.name.length > 255)
    ? 'Pilih PDF, JPG, atau PNG yang tidak kosong, maksimal 2 MB.' : '';
}

export function validateCorrection(certificate, payload, requests) {
  if (requests.some(item => item.certificateId === certificate.id && activeCorrectionStatuses.includes(item.status))) return 'Masih ada pengajuan yang sedang diperiksa untuk sertifikat ini.';
  if (!Array.isArray(payload.changes) || !payload.changes.length) return 'Pilih bagian sertifikat yang perlu diperbaiki.';
  if (new Set(payload.changes.map(change => change?.field)).size !== payload.changes.length) return 'Bagian perbaikan tidak boleh berulang.';
  const values = certificateValues(certificate);
  for (const change of payload.changes) {
    const field = change && Object.hasOwn(correctionFields, change.field) ? correctionFields[change.field] : null;
    if (!field || typeof change.newValue !== 'string' || !change.newValue.trim() || change.newValue.trim().length > field.maxLength) return 'Lengkapi usulan perbaikan dengan data yang valid.';
    if (change.newValue.trim() === values[change.field]) return 'Usulan perbaikan harus berbeda dari data saat ini.';
  }
  if (typeof payload.reason !== 'string' || payload.reason.trim().length < 10 || payload.reason.trim().length > 1000) return 'Jelaskan alasan perbaikan dalam 10–1.000 karakter.';
  if (payload.agreed !== true) return 'Setujui pernyataan kebenaran data sebelum mengirim.';
  const attachmentError = validateAttachment(payload.attachment);
  if (attachmentError) return attachmentError;
  if (payload.attachment && (!/^data:(application\/pdf|image\/(png|jpeg));base64,[A-Za-z0-9+/]+={0,2}$/.test(payload.attachment.dataUrl || '') || !payload.attachment.dataUrl.startsWith(`data:${payload.attachment.type};base64,`))) return 'Dokumen pendukung belum berhasil dibaca. Pilih ulang berkasnya.';
  return '';
}

export function createCorrection(certificate, payload, requests, { id, now = new Date().toISOString() } = {}) {
  const error = validateCorrection(certificate, payload, requests);
  if (error) return { ok: false, message: error };
  const values = certificateValues(certificate);
  const request = {
    id: id || `PB-${crypto.randomUUID()}`, certificateId: certificate.id, status: 'menunggu',
    createdAt: now, updatedAt: now, notificationRead: true,
    certificateNumber: certificate.number, issuer: certificate.issuer, issuerType: certificate.issuerType,
    changes: payload.changes.map(change => ({ field: change.field, label: correctionFields[change.field].label, oldValue: values[change.field], newValue: change.newValue.trim() })),
    reason: payload.reason.trim(), attachment: payload.attachment || null,
    events: [{ status: 'menunggu', at: now, note: `Pengajuan ditujukan kepada ${certificate.issuer}. Menunggu pemeriksaan penerbit.` }],
  };
  return { ok: true, request };
}

export function getCertificateVersions(certificate, requests) {
  let current = { ...certificate, revision: 1 };
  const versions = [current];
  const completed = requests.filter(item => item.certificateId === certificate.id && item.status === 'selesai').sort((a, b) => Date.parse(a.updatedAt) - Date.parse(b.updatedAt));
  for (const request of completed) {
    current = { ...current, workshop: { ...current.workshop }, revision: current.revision + 1, correctionId: request.id, correctedAt: request.updatedAt, originalNumber: certificate.number };
    for (const change of request.changes) {
      if (change.field === 'recipient') current.recipient = change.newValue;
      if (change.field === 'degree') current.degree = change.newValue;
      if (change.field === 'activity') current.workshop.title = change.newValue;
      if (change.field === 'other') current.additionalInfo = change.newValue;
    }
    current.number = request.replacementNumber || `${certificate.number}-R${current.revision - 1}`;
    current.issued = request.replacementIssued || formatCorrectionTime(request.updatedAt, false);
    versions.push(current);
  }
  return versions;
}

export function formatCorrectionTime(value, withTime = true) {
  if (!value || !Number.isFinite(Date.parse(value))) return 'Belum tersedia';
  return new Intl.DateTimeFormat('id-ID', { timeZone: 'Asia/Jakarta', dateStyle: 'medium', ...(withTime ? { timeStyle: 'short' } : {}) }).format(new Date(value));
}

export function isCorrectionRecord(value, certificateIds) {
  return value && typeof value.id === 'string' && certificateIds.includes(value.certificateId)
    && Object.hasOwn(correctionStatuses, value.status) && Number.isFinite(Date.parse(value.createdAt)) && Number.isFinite(Date.parse(value.updatedAt))
    && typeof value.reason === 'string' && typeof value.notificationRead === 'boolean'
    && Array.isArray(value.changes) && value.changes.length > 0 && value.changes.every(change => change && Object.hasOwn(correctionFields, change.field) && typeof change.label === 'string' && typeof change.oldValue === 'string' && typeof change.newValue === 'string' && change.newValue.length <= correctionFields[change.field].maxLength)
    && Array.isArray(value.events) && value.events.every(event => event && Object.hasOwn(correctionStatuses, event.status) && Number.isFinite(Date.parse(event.at)) && typeof event.note === 'string')
    && (!value.attachment || (!validateAttachment(value.attachment) && /^data:(application\/pdf|image\/(png|jpeg));base64,[A-Za-z0-9+/]+={0,2}$/.test(value.attachment.dataUrl || '') && value.attachment.dataUrl.length <= 2.8 * 1024 * 1024));
}
