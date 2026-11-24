const { pool } = require('../../config/database');

const SUBMISSION_SELECT = `
  SELECT s.*, w.id AS w_id, w.slug, w.nama AS workshop_nama, w.jenis, w.sumber, w.penyelenggara, w.partner_id,
         w.tanggal_mulai, w.tanggal_selesai, p.nama AS partner_nama,
         t.nama AS template_nama, t.desain_key, t.warna_utama,
         um.nama AS mitra_signer, ur.nama AS rektor_signer, uv.nama AS verifier,
         (SELECT COUNT(DISTINCT r.id) FROM registrations r JOIN attendances a ON a.registration_id = r.id
            WHERE r.workshop_id = w.id AND a.status = 'hadir' AND r.status IN ('terdaftar','selesai')) AS jumlah_hadir,
         (SELECT u.nama FROM registrations r JOIN attendances a ON a.registration_id = r.id JOIN users u ON u.id = r.user_id
            WHERE r.workshop_id = w.id AND a.status = 'hadir' ORDER BY r.id LIMIT 1) AS penerima_contoh
  FROM certificate_submissions s
  JOIN workshops w ON w.id = s.workshop_id
  LEFT JOIN partners p ON p.id = w.partner_id
  LEFT JOIN certificate_templates t ON t.id = s.template_id
  LEFT JOIN users um ON um.id = s.mitra_signed_by
  LEFT JOIN users ur ON ur.id = s.rektor_signed_by
  LEFT JOIN users uv ON uv.id = s.verified_by
`;

const CORRECTION_SELECT = `
  SELECT c.*, ce.code AS cert_code, ce.nomor, ce.nama_penerima, ce.gelar, ce.info_tambahan, ce.issued_at,
         w.id AS workshop_id, w.slug, w.nama AS workshop_nama, w.jenis, w.sumber, w.penyelenggara, w.partner_id,
         w.tanggal_mulai, w.tanggal_selesai, p.nama AS partner_nama,
         u.nama AS user_nama, u.email AS user_email, us.nama AS tte_signer, ua.nama AS mitra_approver
  FROM certificate_corrections c
  JOIN certificates ce ON ce.id = c.certificate_id
  JOIN workshops w ON w.id = ce.workshop_id
  JOIN users u ON u.id = c.user_id
  LEFT JOIN partners p ON p.id = w.partner_id
  LEFT JOIN users us ON us.id = c.tte_signed_by
  LEFT JOIN users ua ON ua.id = c.mitra_approved_by
`;

/**
 * Data Access Layer untuk modul certificates
 */
class CertificatesRepository {
  constructor() {
    this.db = pool;
  }

  // ── Template
  async templates({ partnerId, ownerUnand, library } = {}) {
    const where = [];
    const params = [];
    if (partnerId) { where.push('t.partner_id = ?'); params.push(partnerId); }
    if (ownerUnand) where.push('t.partner_id IS NULL');
    if (library !== undefined) { where.push('t.is_library = ?'); params.push(library ? 1 : 0); }
    const [rows] = await this.db.query(
      `SELECT t.id, t.nama, t.desain_key, t.kategori, t.penerbit, t.partner_id, t.workshop_id, t.status, t.orientasi,
              t.warna_utama, t.deskripsi, t.berkas_nama, t.ukuran, t.is_library, t.created_at, t.berkas_data IS NOT NULL AS has_berkas,
              w.nama AS workshop_nama
       FROM certificate_templates t LEFT JOIN workshops w ON w.id = t.workshop_id
       ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY t.is_library DESC, t.created_at DESC, t.id DESC`,
      params
    );
    return rows;
  }

  async template(id) {
    const [rows] = await this.db.query(
      `SELECT t.*, w.nama AS workshop_nama, t.berkas_data IS NOT NULL AS has_berkas
       FROM certificate_templates t LEFT JOIN workshops w ON w.id = t.workshop_id WHERE t.id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  async workshopByName(nama) {
    const [rows] = await this.db.query('SELECT id FROM workshops WHERE nama = ? ORDER BY id DESC LIMIT 1', [nama]);
    return rows[0] || null;
  }

  async insert(table, data) {
    const [res] = await this.db.query(`INSERT INTO \`${table}\` SET ?`, [data]);
    return res.insertId;
  }

  async updateRow(table, id, data) {
    if (!Object.keys(data).length) return;
    await this.db.query(`UPDATE \`${table}\` SET ? WHERE id = ?`, [data, id]);
  }

  async deleteRow(table, id) {
    await this.db.query(`DELETE FROM \`${table}\` WHERE id = ?`, [id]);
  }

  // ── Pengajuan
  async submissions({ partnerId } = {}) {
    const [rows] = await this.db.query(
      `${SUBMISSION_SELECT} ${partnerId ? 'WHERE w.partner_id = ?' : ''} ORDER BY s.tanggal_pengajuan DESC`,
      partnerId ? [partnerId] : []
    );
    return rows;
  }

  async submission(id) {
    const [rows] = await this.db.query(`${SUBMISSION_SELECT} WHERE s.id = ?`, [id]);
    return rows[0] || null;
  }

  async submissionByWorkshop(workshopId) {
    const [rows] = await this.db.query('SELECT * FROM certificate_submissions WHERE workshop_id = ?', [workshopId]);
    return rows[0] || null;
  }

  async attendeesOf(workshopId) {
    const [rows] = await this.db.query(
      `SELECT DISTINCT r.user_id, u.nama, u.email, c.nomor, c.code
       FROM registrations r JOIN attendances a ON a.registration_id = r.id JOIN users u ON u.id = r.user_id
       LEFT JOIN certificates c ON c.workshop_id = r.workshop_id AND c.user_id = r.user_id
       WHERE r.workshop_id = ? AND a.status = 'hadir' AND r.status IN ('terdaftar','selesai')
       ORDER BY u.nama`,
      [workshopId]
    );
    return rows;
  }

  // ── Sertifikat
  async certificatesOfUser(userId) {
    const [rows] = await this.db.query(
      `SELECT c.*, w.slug, w.sumber, w.penyelenggara, p.nama AS partner_nama
       FROM certificates c JOIN workshops w ON w.id = c.workshop_id LEFT JOIN partners p ON p.id = w.partner_id
       WHERE c.user_id = ? ORDER BY c.issued_at DESC`,
      [userId]
    );
    return rows;
  }

  async certificateByCode(code) {
    const [rows] = await this.db.query(
      `SELECT c.*, w.slug, w.nama AS workshop_nama, w.sumber, w.penyelenggara, w.tanggal_mulai, w.tanggal_selesai, p.nama AS partner_nama
       FROM certificates c JOIN workshops w ON w.id = c.workshop_id LEFT JOIN partners p ON p.id = w.partner_id
       WHERE c.code = ? OR c.nomor = ?`,
      [code, code]
    );
    return rows[0] || null;
  }

  // ── Perbaikan
  async corrections(where = '1=1', params = []) {
    const [rows] = await this.db.query(`${CORRECTION_SELECT} WHERE ${where} ORDER BY c.created_at DESC`, params);
    return rows;
  }

  async correction(id) {
    const isNum = /^\d+$/.test(String(id));
    const [rows] = await this.db.query(`${CORRECTION_SELECT} WHERE ${isNum ? 'c.id' : 'c.code'} = ?`, [id]);
    return rows[0] || null;
  }

  async notify(data) {
    await this.db.query('INSERT INTO notifications SET ?', [data]);
  }
}

module.exports = new CertificatesRepository();
