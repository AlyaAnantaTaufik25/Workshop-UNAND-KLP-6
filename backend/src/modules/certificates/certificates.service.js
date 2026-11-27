const repo = require('./certificates.repository');
const authService = require('../auth/auth.service');
const workshopsService = require('../workshops/workshops.service');
const storage = require('../../services/storage.service');
const { buildCertificatePdf, authenticityCode } = require('../../services/certificatePdf.service');
const { audit, hashDocument } = require('../../services/audit.service');
const {
  FIELD_LABEL, parseJSON, serializeTemplate, serializeSubmission, serializeCertificate, serializeCorrection, serializeReplacement,
} = require('./certificates.serializer');
const { notFound, forbidden, badRequest, unprocessable, conflict } = require('../../utils/http.util');
const { toISODate, formatTanggal } = require('../../utils/format.util');

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
const MAX_FILE = 5 * 1024 * 1024;
const ACTIVE_CORRECTION = ['menunggu', 'diproses'];

const nowISO = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}+07:00`;
};

/**
 * Business Logic Layer untuk modul certificates
 */
class CertificatesService {
  constructor() {
    this.repository = repo;
  }

  // ════════════════ TEMPLATE ════════════════

  async listTemplates(user, query = {}) {
    const library = query.library === undefined ? undefined : ['1', 'true'].includes(String(query.library));
    const scope = user.role === 'mitra' ? { partnerId: user.partnerId || -1 } : { ownerUnand: true };
    return (await repo.templates({ ...scope, library })).map(serializeTemplate);
  }

  async getTemplate(id, user) {
    const t = await repo.template(id);
    if (!t) throw notFound('Template tidak ditemukan');
    if (user.role === 'mitra' && t.partner_id !== user.partnerId) throw forbidden();
    return t;
  }

  async templateColumns(body, user) {
    const data = {};
    const map = { nama: 'nama', desainKey: 'desain_key', kategori: 'kategori', orientasi: 'orientasi', warnaUtama: 'warna_utama', deskripsi: 'deskripsi', berkasNama: 'berkas_nama', ukuran: 'ukuran', status: 'status' };
    for (const [k, col] of Object.entries(map)) if (body[k] !== undefined) data[col] = body[k] === '' ? null : body[k];
    if (data.status && !['dapat-dipakai', 'dipakai', 'diterbitkan'].includes(data.status)) throw badRequest('Status template tidak valid');
    if (body.berkas !== undefined) {
      const file = body.berkas ? String(body.berkas) : null;
      if (file && !/^data:(application\/pdf|image\/(png|jpeg));base64,/.test(file)) throw badRequest('Berkas template harus PDF, PNG, atau JPG');
      if (file && file.length > MAX_FILE * 1.4) throw badRequest('Ukuran berkas template maksimal 5 MB');
      data.berkas_data = file ? storage.saveDataUrl(file, 'templates') : null;
      if (file && !data.ukuran) data.ukuran = `${(storage.byteSize(file) / 1024 / 1024).toFixed(1)} MB`;
    }
    if (body.workshopId !== undefined) data.workshop_id = body.workshopId || null;
    else if (body.kegiatanTerkait !== undefined) {
      const w = body.kegiatanTerkait ? await repo.workshopByName(body.kegiatanTerkait) : null;
      data.workshop_id = w ? w.id : null;
    }
    if (user.role === 'mitra') {
      data.partner_id = user.partnerId;
      const me = await authService.me(user.id);
      data.penerbit = me.instansi || 'Mitra';
    } else if (body.penerbit !== undefined) {
      data.penerbit = body.penerbit || 'UNAND';
    }
    return data;
  }

  async createTemplate(body, user) {
    const data = await this.templateColumns(body, user);
    if (!data.nama) throw badRequest('Nama template wajib diisi');
    if (!data.penerbit) data.penerbit = 'UNAND';
    const id = await repo.insert('certificate_templates', data);
    return serializeTemplate(await repo.template(id));
  }

  async updateTemplate(id, body, user) {
    const t = await this.getTemplate(id, user);
    if (t.status === 'diterbitkan') throw unprocessable('Template yang sudah dipakai untuk sertifikat terbit tidak dapat diubah');
    await repo.updateRow('certificate_templates', id, await this.templateColumns(body, user));
    return serializeTemplate(await repo.template(id));
  }

  async deleteTemplate(id, user) {
    const t = await this.getTemplate(id, user);
    if (t.status !== 'dapat-dipakai') throw unprocessable('Template yang sedang dipakai tidak dapat dihapus');
    await repo.deleteRow('certificate_templates', id);
  }

  async templateFile(id, user) {
    const t = await this.getTemplate(id, user);
    return { nama: t.berkas_nama, dataUrl: storage.publicUrl(t.berkas_data), url: storage.publicUrl(t.berkas_data) };
  }

  // ════════════════ PENGAJUAN & TTE ════════════════

  async listSubmissions(user) {
    const rows = await repo.submissions(user.role === 'mitra' ? { partnerId: user.partnerId || -1 } : {});
    return rows.map((s) => serializeSubmission(s, user.role));
  }

  async getSubmissionRow(id, user) {
    const s = await repo.submission(id);
    if (!s) throw notFound('Pengajuan sertifikat tidak ditemukan');
    if (user.role === 'mitra' && s.partner_id !== user.partnerId) throw forbidden();
    return s;
  }

  async getSubmission(id, user) {
    const s = await this.getSubmissionRow(id, user);
    const data = serializeSubmission(s, user.role);
    const attendees = await repo.attendeesOf(s.workshop_id);
    data.penerima = attendees.map((a) => ({ userId: a.user_id, nama: a.nama, email: a.email, nomor: a.nomor || null }));
    data.mitraSignature = storage.publicUrl(s.mitra_signature);
    data.rektorSignature = storage.publicUrl(s.rektor_signature);
    return data;
  }

  /** Humas mengajukan sertifikat kegiatan untuk ditandatangani */
  async createSubmission(body, user) {
    const w = await workshopsService.getRow(body.workshopId, user);
    const existing = await repo.submissionByWorkshop(w.id);
    if (existing && existing.status === 'diterbitkan') throw conflict('Sertifikat kegiatan ini sudah diterbitkan');
    const perluMitra = !!w.partner_id && body.perluMitra !== false;
    const perluRektor = body.perluRektor !== false;
    const status = perluMitra ? 'menunggu-mitra' : perluRektor ? 'menunggu-rektor' : 'diterbitkan';
    const data = {
      workshop_id: w.id, template_id: body.templateId || null, nomor_sk: body.nomorSk || null,
      perlu_mitra: perluMitra ? 1 : 0, perlu_rektor: perluRektor ? 1 : 0, status,
      tanggal_pengajuan: new Date(), diajukan_oleh: user.id, catatan: body.catatan || null,
      mitra_signed_at: null, mitra_signed_by: null, mitra_signature: null,
      rektor_signed_at: null, rektor_signed_by: null, rektor_signature: null,
    };
    let id;
    if (existing) { await repo.updateRow('certificate_submissions', existing.id, data); id = existing.id; }
    else id = await repo.insert('certificate_submissions', data);
    if (data.template_id) await repo.updateRow('certificate_templates', data.template_id, { status: 'dipakai' });

    if (status === 'menunggu-mitra') await repo.notify({ role_code: 'mitra', partner_id: w.partner_id, judul: 'Pengajuan Tanda Tangan Sertifikat', deskripsi: `${w.nama} menunggu TTE Anda`, link: `/mitra/tanda-tangan/${id}` });
    if (status === 'menunggu-rektor') await repo.notify({ role_code: 'rektor', judul: 'Sertifikat Menunggu Persetujuan', deskripsi: w.nama, link: '/rektor/pengajuan' });
    await audit({ action: 'certificate.submit', entity: 'certificate_submission', entityId: id, description: `Pengajuan sertifikat "${w.nama}" (${status})`, meta: { perluMitra, perluRektor, templateId: data.template_id, nomorSk: data.nomor_sk } });
    if (status === 'diterbitkan') await this.issueCertificates(id);
    return this.getSubmission(id, user);
  }

  /**
   * Sekretariat Rektor memeriksa draft: dapat mengganti template dan memberi catatan.
   * Tidak mengubah status TTE; menandai pengajuan sudah diverifikasi.
   */
  async verifySubmission(id, body, user) {
    const s = await this.getSubmissionRow(id, user);
    if (s.status === 'diterbitkan') throw unprocessable('Sertifikat sudah diterbitkan dan tidak dapat diubah');
    const data = { verified_at: new Date(), verified_by: user.id };
    if (body.templateId !== undefined) {
      const t = await repo.template(body.templateId);
      if (!t) throw notFound('Template tidak ditemukan');
      if (t.partner_id && t.partner_id !== s.partner_id) throw badRequest('Template mitra lain tidak dapat dipakai');
      data.template_id = t.id;
      if (s.template_id && s.template_id !== t.id) {
        // Template lama kembali tersedia bila tidak dipakai pengajuan lain
        await repo.db.query(
          `UPDATE certificate_templates SET status = 'dapat-dipakai'
           WHERE id = ? AND status = 'dipakai' AND NOT EXISTS (SELECT 1 FROM certificate_submissions WHERE template_id = ? AND id <> ?)`,
          [s.template_id, s.template_id, s.id]
        );
      }
      if (!t.is_library) await repo.updateRow('certificate_templates', t.id, { status: 'dipakai' });
    }
    if (body.catatan !== undefined) data.catatan = String(body.catatan).slice(0, 500) || null;
    await repo.updateRow('certificate_submissions', s.id, data);
    await audit({ action: 'certificate.verify', entity: 'certificate_submission', entityId: s.id, description: `Verifikasi draft "${s.workshop_nama}"${data.template_id ? ' · template diganti' : ''}`, meta: { templateId: data.template_id, catatan: data.catatan } });
    return this.getSubmission(s.id, user);
  }

  /** Tanda tangan elektronik oleh mitra atau rektor (diverifikasi dengan PIN) */
  async signSubmission(id, body, user) {
    const s = await this.getSubmissionRow(id, user);
    await authService.verifyPin(user.id, body.pin);
    const rawSignature = body.signature ? String(body.signature).slice(0, 2_000_000) : null;
    // Hash dokumen yang ditandatangani: isi pengajuan + template + gambar tanda tangan
    const docHash = hashDocument({ submission: s.id, workshop: s.workshop_id, nama: s.workshop_nama, nomorSk: s.nomor_sk, template: s.template_id, peran: user.role, signature: rawSignature || '' });
    const signature = rawSignature && rawSignature.startsWith('data:') ? storage.saveDataUrl(rawSignature, 'signatures') : null;
    let data;
    if (user.role === 'mitra') {
      if (s.status !== 'menunggu-mitra') throw unprocessable('Pengajuan ini tidak sedang menunggu tanda tangan mitra');
      data = { status: s.perlu_rektor ? 'menunggu-rektor' : 'diterbitkan', mitra_signed_at: new Date(), mitra_signed_by: user.id, mitra_signature: signature };
      if (s.perlu_rektor) await repo.notify({ role_code: 'rektor', judul: 'Sertifikat Menunggu Persetujuan', deskripsi: s.workshop_nama, link: '/rektor/pengajuan' });
    } else {
      if (s.status !== 'menunggu-rektor') throw unprocessable('Pengajuan ini tidak sedang menunggu tanda tangan Rektor');
      data = { status: 'diterbitkan', rektor_signed_at: new Date(), rektor_signed_by: user.id, rektor_signature: signature };
    }
    await repo.updateRow('certificate_submissions', s.id, data);
    await audit({ action: 'certificate.sign', entity: 'certificate_submission', entityId: s.id, docHash,
      description: `TTE ${user.role === 'mitra' ? 'Mitra' : 'Rektor'} untuk "${s.workshop_nama}"${s.nomor_sk ? ` (SK ${s.nomor_sk})` : ''}`,
      meta: { statusSebelum: s.status, statusSesudah: data.status, workshopId: s.workshop_id } });
    if (data.status === 'diterbitkan') await this.issueCertificates(s.id);
    return this.getSubmission(s.id, user);
  }

  /** Menerbitkan sertifikat individual untuk setiap peserta yang hadir valid */
  async issueCertificates(submissionId) {
    const s = await repo.submission(submissionId);
    const attendees = await repo.attendeesOf(s.workshop_id);
    const end = toISODate(s.tanggal_selesai);
    const year = end.slice(0, 4);
    const month = ROMAN[Number(end.slice(5, 7)) - 1];
    const today = toISODate(new Date());
    // Nomor urut melanjutkan sertifikat yang sudah ada untuk kegiatan ini, sehingga
    // penerbitan susulan (peserta yang diverifikasi belakangan) tidak bentrok.
    const [[{ issued }]] = await repo.db.query('SELECT COUNT(*) AS issued FROM certificates WHERE workshop_id = ?', [s.workshop_id]);
    let seqNo = Number(issued);
    let n = 0;
    for (const a of attendees) {
      if (a.nomor) continue;
      for (let attempt = 0; ; attempt += 1) {
        seqNo += 1;
        const seq = `${String(s.workshop_id).padStart(3, '0')}${String(seqNo).padStart(3, '0')}`;
        const nomor = s.sumber === 'Mitra' ? `SRT-M${s.partner_id}-${year}-${seq}` : `${seq}/UN16/WS/${month}/${year}`;
        try {
          await repo.insert('certificates', {
            code: `cert-${s.workshop_id}-${a.user_id}`, workshop_id: s.workshop_id, user_id: a.user_id, nomor,
            nama_penerima: a.nama, jenis: s.jenis, issued_at: today,
          });
          break;
        } catch (err) {
          // Nomor sudah terpakai → coba nomor berikutnya; selain itu lempar galat
          if (err.code !== 'ER_DUP_ENTRY' || !String(err.message).includes('nomor') || attempt > 50) throw err;
        }
      }
      n += 1;
      await repo.notify({ user_id: a.user_id, judul: 'Sertifikat Terbit', deskripsi: s.workshop_nama, link: '/peserta/sertifikat' });
    }
    if (s.template_id) await repo.updateRow('certificate_templates', s.template_id, { status: 'diterbitkan' });
    await audit({ action: 'certificate.issue', entity: 'certificate_submission', entityId: s.id, description: `${n} sertifikat "${s.workshop_nama}" diterbitkan`, meta: { jumlah: n } });
    return n;
  }

  /**
   * Penerbitan susulan: dipanggil setelah kehadiran peserta divalidasi. Bila
   * sertifikat kegiatan sudah diterbitkan, peserta yang baru hadir valid ikut
   * mendapat sertifikat. Mengembalikan jumlah sertifikat baru.
   */
  async issueLateCertificates(workshopId) {
    const sub = await repo.submissionByWorkshop(workshopId);
    if (!sub || sub.status !== 'diterbitkan') return 0;
    return this.issueCertificates(sub.id);
  }

  // ════════════════ SERTIFIKAT PESERTA ════════════════

  async myCertificates(user) {
    return (await repo.certificatesOfUser(user.id)).map(serializeCertificate);
  }

  async verifyCertificate(nomor) {
    const c = await repo.certificateByCode(nomor);
    if (!c) throw notFound('Nomor sertifikat tidak terdaftar');
    const sub = await this.submissionWithSigners(c.workshop_id);
    return {
      valid: true, ...serializeCertificate(c), namaKegiatan: c.workshop_nama,
      tanggalKegiatan: c.tanggal_selesai && c.tanggal_selesai !== c.tanggal_mulai ? `${formatTanggal(c.tanggal_mulai)} – ${formatTanggal(c.tanggal_selesai)}` : formatTanggal(c.tanggal_mulai),
      kodeKeaslian: authenticityCode(c),
      penandatangan: [
        sub?.mitra_signed_at ? { peran: `Pimpinan ${c.partner_nama || 'Mitra'}`, nama: sub.mitra_signer, waktu: sub.mitra_signed_at } : null,
        sub?.rektor_signed_at ? { peran: 'Rektor Universitas Andalas', nama: sub.rektor_signer, waktu: sub.rektor_signed_at } : null,
      ].filter(Boolean),
    };
  }

  async submissionWithSigners(workshopId) {
    const row = await repo.submissionByWorkshop(workshopId);
    return row ? repo.submission(row.id) : null;
  }

  /** PDF sertifikat resmi (dibuat server, dengan QR verifikasi) */
  async certificatePdf(code, user) {
    const c = await repo.certificateByCode(code);
    if (!c) throw notFound('Sertifikat tidak ditemukan');
    const allowed = c.user_id === user.id
      || ['humas', 'sekretariat', 'rektor'].includes(user.role)
      || (user.role === 'mitra' && c.sumber === 'Mitra' && (await repo.db.query('SELECT partner_id FROM workshops WHERE id = ?', [c.workshop_id]))[0][0]?.partner_id === user.partnerId);
    if (!allowed) throw forbidden('Anda tidak berhak mengunduh sertifikat ini');
    const buffer = await buildCertificatePdf(c, await this.submissionWithSigners(c.workshop_id));
    const safe = String(c.nomor).replace(/[^\w.-]+/g, '-');
    return { buffer, filename: `Sertifikat-${safe}.pdf` };
  }

  // ════════════════ PERBAIKAN SERTIFIKAT ════════════════

  scopeCorrections(user) {
    if (user.role === 'peserta') return ['c.user_id = ?', [user.id]];
    if (user.role === 'mitra') return ["w.sumber = 'Mitra' AND w.partner_id = ?", [user.partnerId || -1]];
    if (user.role === 'humas') return ["w.sumber = 'UNAND'", []];
    return ["c.status = 'selesai' AND c.tte_status <> 'tidak-perlu'", []];
  }

  async listCorrections(user) {
    const [where, params] = this.scopeCorrections(user);
    return (await repo.corrections(where, params)).map(serializeCorrection);
  }

  async getCorrectionRow(id, user) {
    const c = await repo.correction(id);
    if (!c) throw notFound('Pengajuan perbaikan tidak ditemukan');
    const [where, params] = this.scopeCorrections(user);
    const allowed = await repo.corrections(`${where} AND c.id = ?`, [...params, c.id]);
    if (!allowed.length) throw forbidden('Pengajuan ini tidak berada dalam wewenang Anda');
    return c;
  }

  async getCorrection(id, user) {
    return serializeCorrection(await this.getCorrectionRow(id, user));
  }

  /** Nilai sertifikat terkini setelah perbaikan yang sudah selesai */
  async currentValues(cert) {
    const done = await repo.corrections("c.certificate_id = ? AND c.status = 'selesai'", [cert.id]);
    const values = { recipient: cert.nama_penerima, degree: cert.gelar || '', activity: cert.workshop_nama, other: cert.info_tambahan || '' };
    done.reverse().forEach((c) => parseJSON(c.changes, []).forEach((ch) => { values[ch.field] = ch.newValue; }));
    return values;
  }

  async createCorrection(body, user) {
    const cert = await repo.certificateByCode(body.certificateId);
    if (!cert || cert.user_id !== user.id) throw notFound('Sertifikat tidak ditemukan');
    const active = await repo.corrections('c.certificate_id = ? AND c.status IN (?)', [cert.id, ACTIVE_CORRECTION]);
    if (active.length) throw conflict('Masih ada pengajuan yang sedang diperiksa untuk sertifikat ini.');
    if (!Array.isArray(body.changes) || !body.changes.length) throw badRequest('Pilih bagian sertifikat yang perlu diperbaiki.');
    if (new Set(body.changes.map((c) => c && c.field)).size !== body.changes.length) throw badRequest('Bagian perbaikan tidak boleh berulang.');
    const values = await this.currentValues(cert);
    const changes = body.changes.map((ch) => {
      if (!ch || !FIELD_LABEL[ch.field] || typeof ch.newValue !== 'string' || !ch.newValue.trim()) throw badRequest('Lengkapi usulan perbaikan dengan data yang valid.');
      if (ch.newValue.trim() === values[ch.field]) throw badRequest('Usulan perbaikan harus berbeda dari data saat ini.');
      return { field: ch.field, label: FIELD_LABEL[ch.field], oldValue: values[ch.field], newValue: ch.newValue.trim() };
    });
    const reason = String(body.reason || '').trim();
    if (reason.length < 10 || reason.length > 1000) throw badRequest('Jelaskan alasan perbaikan dalam 10–1.000 karakter.');
    if (body.agreed !== true) throw badRequest('Setujui pernyataan kebenaran data sebelum mengirim.');
    const att = body.attachment || null;
    if (att && (!/^data:(application\/pdf|image\/(png|jpeg));base64,/.test(att.dataUrl || '') || att.dataUrl.length > 2.8 * 1024 * 1024)) {
      throw badRequest('Pilih PDF, JPG, atau PNG yang tidak kosong, maksimal 2 MB.');
    }
    const issuer = cert.sumber === 'Mitra' ? (cert.partner_nama || cert.penyelenggara) : 'UNAND';
    const now = nowISO();
    const id = await repo.insert('certificate_corrections', {
      code: `PB-TMP-${Date.now()}-${user.id}`, certificate_id: cert.id, user_id: user.id, status: 'menunggu',
      changes: JSON.stringify(changes), reason, attachment: att ? JSON.stringify({ name: att.name, type: att.type, size: att.size, url: storage.saveDataUrl(att.dataUrl, 'perbaikan') }) : null, notification_read: 1,
      events: JSON.stringify([{ status: 'menunggu', at: now, note: `Pengajuan ditujukan kepada ${issuer}. Menunggu pemeriksaan penerbit.` }]),
    });
    await repo.updateRow('certificate_corrections', id, { code: `PB-${now.slice(0, 4)}-${3000 + id}` });
    await repo.notify({
      role_code: cert.sumber === 'Mitra' ? 'mitra' : 'humas', judul: 'Pengajuan Perbaikan Sertifikat Baru',
      deskripsi: `${user.nama} · ${cert.workshop_nama}`, link: cert.sumber === 'Mitra' ? '/mitra/perbaikan-sertifikat' : '/humas/perbaikan-sertifikat',
    });
    return serializeCorrection(await repo.correction(id));
  }

  async pushEvent(c, data, event) {
    const events = parseJSON(c.events, []);
    events.push({ ...event, at: nowISO() });
    await repo.updateRow('certificate_corrections', c.id, { ...data, events: JSON.stringify(events) });
  }

  async cancelCorrection(id, user) {
    const c = await this.getCorrectionRow(id, user);
    if (c.status !== 'menunggu') throw unprocessable('Pengajuan sudah diproses dan tidak dapat dibatalkan.');
    await this.pushEvent(c, { status: 'dibatalkan' }, { status: 'dibatalkan', note: 'Pengajuan dibatalkan oleh peserta.' });
    return serializeCorrection(await repo.correction(c.id));
  }

  async markRead(user, rawId) {
    // id opsional: kode pengajuan (PB-...) atau id angka; tipe lain ditolak
    const id = rawId === undefined || rawId === null || rawId === '' ? null : rawId;
    if (id !== null && !((typeof id === 'string' && id.length <= 60) || Number.isInteger(id))) {
      throw badRequest('ID pengajuan tidak valid');
    }
    const where = id ? 'user_id = ? AND (code = ? OR id = ?)' : 'user_id = ?';
    const params = id ? [user.id, id, id] : [user.id];
    await repo.db.query(`UPDATE certificate_corrections SET notification_read = 1 WHERE ${where} AND status IN ('selesai','ditolak')`, params);
    return this.listCorrections(user);
  }

  /**
   * Humas/mitra memproses perbaikan.
   * action: 'proses' | 'tolak' | 'selesai'. Pada 'selesai', isi `changes` dapat dikoreksi dan
   * dokumen pengganti diteruskan ke Rektor untuk TTE ulang bila diperlukan.
   */
  async processCorrection(id, body, user) {
    const c = await this.getCorrectionRow(id, user);
    const note = body.note ? String(body.note).trim() : '';
    if (!ACTIVE_CORRECTION.includes(c.status)) throw unprocessable('Pengajuan ini sudah selesai diproses');

    if (body.action === 'proses') {
      if (c.status !== 'menunggu') throw unprocessable('Pengajuan sudah dalam proses');
      await this.pushEvent(c, { status: 'diproses', issuer_note: note || 'Penerbit sedang memeriksa pengajuan.' }, { status: 'diproses', note: note || 'Pengajuan diterima dan sedang diperiksa penerbit.' });
    } else if (body.action === 'tolak') {
      if (!note) throw badRequest('Alasan penolakan wajib diisi');
      await this.pushEvent(c, { status: 'ditolak', issuer_note: note, notification_read: 0 }, { status: 'ditolak', note });
      await repo.notify({ user_id: c.user_id, judul: 'Perbaikan Sertifikat Ditolak', deskripsi: c.workshop_nama, link: '/peserta/sertifikat' });
    } else if (body.action === 'selesai') {
      let changes = parseJSON(c.changes, []);
      if (Array.isArray(body.changes)) {
        changes = changes.map((ch) => {
          const edit = body.changes.find((e) => e.field === ch.field);
          return edit && String(edit.newValue || '').trim() ? { ...ch, newValue: String(edit.newValue).trim() } : ch;
        });
      }
      const done = await repo.corrections("c.certificate_id = ? AND c.status = 'selesai'", [c.certificate_id]);
      const submission = await repo.submissionByWorkshop(c.workshop_id);
      const tte = submission && submission.perlu_rektor ? 'sedang-diproses' : 'selesai';
      await this.pushEvent(c, {
        status: 'selesai', changes: JSON.stringify(changes), notification_read: 0,
        issuer_note: note || 'Perbaikan disetujui. Dokumen pengganti diterbitkan.',
        replacement_number: `${c.nomor}-R${done.length + 1}`, replacement_issued: toISODate(new Date()), tte_status: tte,
      }, { status: 'selesai', note: note || 'Perbaikan disetujui. Dokumen pengganti diterbitkan.' });
      await repo.notify({ user_id: c.user_id, judul: 'Perbaikan Sertifikat Selesai', deskripsi: c.workshop_nama, link: '/peserta/sertifikat' });
      if (tte === 'sedang-diproses') await repo.notify({ role_code: 'rektor', judul: 'Dokumen Pengganti Menunggu TTE', deskripsi: `${c.user_nama} · ${c.workshop_nama}`, link: '/rektor/sertifikat-perbaikan' });
    } else {
      throw badRequest("Aksi harus 'proses', 'tolak', atau 'selesai'");
    }
    await audit({ action: `correction.${body.action}`, entity: 'certificate_correction', entityId: c.id, description: `Perbaikan sertifikat ${c.nomor} (${c.user_nama}) → ${body.action}`, meta: note ? { catatan: note } : null });
    return serializeCorrection(await repo.correction(c.id));
  }

  // ════════════════ DOKUMEN PENGGANTI ════════════════

  async listReplacements(user) {
    const rows = await repo.corrections("c.status = 'selesai' AND c.tte_status <> 'tidak-perlu'", []);
    const scoped = user.role === 'mitra' ? rows.filter((r) => r.partner_id === user.partnerId) : rows;
    return scoped.map(serializeReplacement);
  }

  async getReplacement(id, user) {
    const list = await this.listReplacements(user);
    const item = list.find((r) => String(r.id) === String(id) || r.code === id);
    if (!item) throw notFound('Dokumen pengganti tidak ditemukan');
    return item;
  }

  /** Mitra menyetujui dokumen pengganti hasil perbaikan sertifikat instansinya */
  async approveReplacement(id, user) {
    await this.getReplacement(id, user);
    const c = await repo.correction(id);
    if (c.mitra_approved_at) throw unprocessable('Dokumen pengganti ini sudah disetujui');
    await repo.updateRow('certificate_corrections', c.id, { mitra_approved_at: new Date(), mitra_approved_by: user.id });
    await audit({ action: 'replacement.approve', entity: 'certificate_correction', entityId: c.id, description: `Mitra menyetujui dokumen pengganti ${c.replacement_number || c.nomor} (${c.user_nama})` });
    if (c.tte_status === 'sedang-diproses') {
      await repo.notify({ role_code: 'rektor', judul: 'Dokumen Pengganti Disetujui Mitra', deskripsi: `${c.user_nama} · ${c.workshop_nama}`, link: '/rektor/sertifikat-perbaikan' });
    }
    return this.getReplacement(c.id, user);
  }

  /** Rektor menandatangani ulang dokumen pengganti */
  async signReplacement(id, body, user) {
    await this.getReplacement(id, user);
    await authService.verifyPin(user.id, body.pin);
    const c = await repo.correction(id);
    if (c.tte_status !== 'sedang-diproses') throw unprocessable('Dokumen pengganti ini sudah ditandatangani');
    await repo.updateRow('certificate_corrections', c.id, { tte_status: 'selesai', tte_signed_at: new Date(), tte_signed_by: user.id });
    await audit({ action: 'replacement.sign', entity: 'certificate_correction', entityId: c.id,
      docHash: hashDocument({ correction: c.id, nomor: c.replacement_number, changes: c.changes, penerima: c.user_nama }),
      description: `TTE Rektor dokumen pengganti ${c.replacement_number || c.nomor} (${c.user_nama})` });
    return this.getReplacement(c.id, user);
  }
}

module.exports = new CertificatesService();
