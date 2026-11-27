const storage = require('../../services/storage.service');
const {
  formatTanggal, formatTanggalJam, toISODate, toISOStringWIB,
} = require('../../utils/format.util');

const FIELD_LABEL = {
  recipient: 'Nama peserta',
  degree: 'Gelar peserta',
  activity: 'Informasi kegiatan',
  other: 'Informasi lainnya',
};
const JENIS_PERBAIKAN = { recipient: 'Nama Peserta', degree: 'Gelar Akademik', activity: 'Informasi Kegiatan', other: 'Informasi Lainnya' };

const parseJSON = (v, fallback) => {
  if (v === null || v === undefined) return fallback;
  if (typeof v !== 'string') return v;
  try { return JSON.parse(v); } catch { return fallback; }
};

const issuerOf = (row) => (row.sumber === 'Mitra' ? (row.partner_nama || row.penyelenggara) : 'UNAND');

function serializeTemplate(t) {
  return {
    id: t.id,
    nama: t.nama,
    desainKey: t.desain_key || 'klasik',
    kategori: t.kategori || '',
    penerbit: t.penerbit,
    partnerId: t.partner_id,
    workshopId: t.workshop_id,
    kegiatanTerkait: t.workshop_nama || '',
    status: t.status,
    orientasi: t.orientasi || 'Lanskap (A4)',
    warnaUtama: t.warna_utama || '#14532d',
    deskripsi: t.deskripsi || '',
    berkasNama: t.berkas_nama || '',
    hasBerkas: !!t.has_berkas,
    ukuran: t.ukuran || '',
    tanggalUnggah: formatTanggal(t.created_at),
    isLibrary: !!t.is_library,
  };
}

function serializeSubmission(s, role) {
  const status = role === 'mitra' && s.status === 'menunggu-mitra' ? 'menunggu-ttd' : s.status;
  return {
    id: s.id,
    workshopId: s.workshop_id,
    workshopSlug: s.slug,
    namaKegiatan: s.workshop_nama,
    jenis: s.jenis,
    sumber: s.sumber,
    mitra: s.partner_nama || s.penyelenggara,
    penyelenggara: s.partner_nama || s.penyelenggara,
    jumlahSertifikat: Number(s.jumlah_hadir || 0),
    statusTandaTangan: status,
    status: s.status,
    tanggalPengajuan: formatTanggal(s.tanggal_pengajuan),
    isoTanggal: toISODate(s.tanggal_pengajuan),
    tanggalKegiatan: formatTanggal(s.tanggal_selesai),
    nomorSK: s.nomor_sk || '-',
    perluMitra: !!s.perlu_mitra,
    perluRektor: !!s.perlu_rektor,
    template: s.template_nama || '-',
    templateId: s.template_id,
    desainKey: s.desain_key || 'klasik',
    warnaUtama: s.warna_utama || '#14532d',
    penerimaContoh: s.penerima_contoh || '-',
    waktuTtdMitra: s.mitra_signed_at ? formatTanggalJam(s.mitra_signed_at, ' WIB') : null,
    waktuTtdRektor: s.rektor_signed_at ? formatTanggalJam(s.rektor_signed_at, ' WIB') : null,
    penandatanganMitra: s.mitra_signer || null,
    penandatanganRektor: s.rektor_signer || null,
    catatan: s.catatan || '',
    terverifikasi: !!s.verified_at,
    waktuVerifikasi: s.verified_at ? formatTanggalJam(s.verified_at, ' WIB') : null,
    verifikator: s.verifier || null,
  };
}

function serializeCertificate(c) {
  return {
    id: c.code,
    dbId: c.id,
    workshopId: c.slug,
    number: c.nomor,
    issued: formatTanggal(c.issued_at),
    recipient: c.nama_penerima,
    issuer: issuerOf(c),
    issuerType: c.sumber === 'Mitra' ? 'mitra' : 'unand',
    kind: c.jenis,
    degree: c.gelar || '',
    additionalInfo: c.info_tambahan || '',
  };
}

/** Perbaikan sertifikat — superset untuk portal peserta, humas, mitra */
function serializeCorrection(c) {
  const changes = parseJSON(c.changes, []);
  const events = parseJSON(c.events, []);
  const rawAttachment = parseJSON(c.attachment, null);
  // Lampiran disimpan di disk; dataUrl tetap disediakan agar portal lama kompatibel
  const attachment = rawAttachment ? { ...rawAttachment, url: storage.publicUrl(rawAttachment.url || rawAttachment.dataUrl), dataUrl: storage.publicUrl(rawAttachment.url || rawAttachment.dataUrl) } : null;
  const first = changes[0] || {};
  return {
    // Portal peserta
    id: c.code,
    dbId: c.id,
    certificateId: c.cert_code,
    status: c.status,
    createdAt: toISOStringWIB(c.created_at),
    updatedAt: toISOStringWIB(c.updated_at),
    changes,
    reason: c.reason,
    attachment,
    notificationRead: !!c.notification_read,
    events,
    issuerNote: c.issuer_note || undefined,
    replacementNumber: c.replacement_number || undefined,
    replacementIssued: c.replacement_issued ? formatTanggal(c.replacement_issued) : undefined,
    certificateNumber: c.nomor,
    issuer: issuerOf(c),
    issuerType: c.sumber === 'Mitra' ? 'mitra' : 'unand',

    // Portal humas & mitra
    namaPeserta: c.user_nama,
    email: c.user_email,
    namaKegiatan: c.workshop_nama,
    kegiatanSingkat: c.workshop_nama.replace(/ UNAND$/, ''),
    nomorSertifikat: c.nomor,
    jenisPerbaikan: JENIS_PERBAIKAN[first.field] || 'Lainnya',
    bagian: FIELD_LABEL[first.field] || first.label || '',
    tanggalKegiatan: formatTanggal(c.tanggal_selesai, true),
    tanggalPengajuan: formatTanggalJam(c.created_at),
    catatan: c.reason,
    usulanNama: first.newValue || '',
    nilaiLama: first.oldValue || '',
    detail: {
      jenisKegiatan: c.jenis,
      tanggalKegiatan: formatTanggal(c.tanggal_selesai),
      penerbit: issuerOf(c),
    },
    tteStatus: c.tte_status,
  };
}

/** Dokumen pengganti (portal sekretariat & rektor) */
function serializeReplacement(c) {
  const changes = parseJSON(c.changes, []);
  const name = changes.find((x) => x.field === 'recipient');
  const first = changes[0] || {};
  const d = toISODate(c.tanggal_selesai);
  return {
    id: c.id,
    code: c.code,
    namaPeserta: name ? name.newValue : c.nama_penerima,
    namaPesertaLama: name ? name.oldValue : c.nama_penerima,
    namaKegiatan: c.workshop_nama,
    jenisKegiatan: c.jenis,
    penyelenggara: c.partner_nama || c.penyelenggara,
    nomorSertifikat: c.nomor,
    nomorPengganti: c.replacement_number || null,
    tanggalKegiatan: d ? `${Number(d.slice(8))}/${Number(d.slice(5, 7))}/${d.slice(0, 4)}` : '-',
    jenisPerbaikan: JENIS_PERBAIKAN[first.field] || 'Lainnya',
    jenisPerbaikanDetail: changes.map((x) => `${x.label}: "${x.oldValue || '-'}" menjadi "${x.newValue}"`).join('; ') + (c.reason ? `. ${c.reason}` : ''),
    tanggalPengajuan: formatTanggalJam(c.created_at).replace(':', '.'),
    status: c.tte_status === 'selesai' ? 'selesai' : 'sedang-diproses',
    waktuTte: c.tte_signed_at ? formatTanggalJam(c.tte_signed_at, ' WIB') : null,
    penandatangan: c.tte_signer || null,
    disetujuiMitra: !!c.mitra_approved_at,
    waktuSetujuMitra: c.mitra_approved_at ? formatTanggalJam(c.mitra_approved_at, ' WIB') : null,
    penyetujuMitra: c.mitra_approver || null,
    sumber: c.sumber,
  };
}

module.exports = {
  FIELD_LABEL,
  parseJSON,
  serializeTemplate,
  serializeSubmission,
  serializeCertificate,
  serializeCorrection,
  serializeReplacement,
};
