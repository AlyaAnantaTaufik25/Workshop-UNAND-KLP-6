const { pool } = require('../../config/database');

/** Query dasar kegiatan beserta lokasi, mitra, status sertifikat, dan statistik peserta */
const BASE_SELECT = `
  SELECT w.*, l.gedung, l.ruangan, l.lokasi AS lokasi_alamat, l.latitude, l.longitude, l.radius,
         p.nama AS partner_nama, s.status AS sertifikat_status, s.id AS submission_id,
         st.pendaftar, st.waiting, st.hadir, st.pending, st.ditolak
  FROM workshops w
  LEFT JOIN locations l ON l.id = w.location_id
  LEFT JOIN partners p ON p.id = w.partner_id
  LEFT JOIN certificate_submissions s ON s.workshop_id = w.id
  LEFT JOIN (
    SELECT r.workshop_id,
      SUM(r.status IN ('terdaftar','selesai')) AS pendaftar,
      SUM(r.status = 'waiting') AS waiting,
      SUM(r.status IN ('terdaftar','selesai') AND COALESCE(a.hadir,0) > 0) AS hadir,
      SUM(r.status IN ('terdaftar','selesai') AND COALESCE(a.hadir,0) = 0 AND COALESCE(a.pending,0) > 0) AS pending,
      SUM(r.status IN ('terdaftar','selesai') AND COALESCE(a.hadir,0) = 0 AND COALESCE(a.pending,0) = 0 AND COALESCE(a.ditolak,0) > 0) AS ditolak
    FROM registrations r
    LEFT JOIN (
      SELECT registration_id, SUM(status = 'hadir') AS hadir, SUM(status = 'pending') AS pending, SUM(status = 'ditolak') AS ditolak
      FROM attendances GROUP BY registration_id
    ) a ON a.registration_id = r.id
    GROUP BY r.workshop_id
  ) st ON st.workshop_id = w.id
`;

/**
 * Data Access Layer untuk modul workshops
 */
class WorkshopsRepository {
  constructor() {
    this.db = pool;
  }

  async findAll({ partnerId, publicOnly, status, search } = {}) {
    const where = [];
    const params = [];
    if (partnerId) { where.push('w.partner_id = ?'); params.push(partnerId); }
    if (publicOnly) where.push("w.status <> 'draft'");
    if (status) { where.push('w.status = ?'); params.push(status); }
    if (search) { where.push('(w.nama LIKE ? OR w.penyelenggara LIKE ?)'); params.push(`%${search}%`, `%${search}%`); }
    const [rows] = await this.db.query(
      `${BASE_SELECT} ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY w.tanggal_mulai DESC, w.id DESC`,
      params
    );
    return rows;
  }

  /** Cari berdasarkan id numerik atau slug */
  async findOne(idOrSlug) {
    const isNum = /^\d+$/.test(String(idOrSlug));
    const [rows] = await this.db.query(`${BASE_SELECT} WHERE ${isNum ? 'w.id' : 'w.slug'} = ?`, [idOrSlug]);
    return rows[0] || null;
  }

  async participants(workshopId) {
    const [regs] = await this.db.query(
      `SELECT r.*, u.nama, u.email, u.jenis_peserta FROM registrations r JOIN users u ON u.id = r.user_id
       WHERE r.workshop_id = ? ORDER BY r.status = 'waiting', r.queue_no, r.registered_at, r.id`,
      [workshopId]
    );
    const [atts] = await this.db.query(
      `SELECT a.* FROM attendances a JOIN registrations r ON r.id = a.registration_id
       WHERE r.workshop_id = ? ORDER BY a.tanggal, a.id`,
      [workshopId]
    );
    return { regs, atts };
  }

  async slugExists(slug, exceptId = 0) {
    const [rows] = await this.db.query('SELECT id FROM workshops WHERE slug = ? AND id <> ?', [slug, exceptId]);
    return rows.length > 0;
  }

  async findPartnerByName(nama) {
    const [rows] = await this.db.query('SELECT id, nama FROM partners WHERE nama = ?', [nama]);
    return rows[0] || null;
  }

  async findLocation(gedung, ruangan) {
    const [rows] = await this.db.query('SELECT id FROM locations WHERE gedung = ? AND ruangan = ?', [gedung, ruangan]);
    return rows[0] || null;
  }

  async create(data) {
    const [res] = await this.db.query('INSERT INTO workshops SET ?', [data]);
    return res.insertId;
  }

  async update(id, data) {
    if (!Object.keys(data).length) return;
    await this.db.query('UPDATE workshops SET ? WHERE id = ?', [data, id]);
  }

  async remove(id) {
    await this.db.query('DELETE FROM workshops WHERE id = ?', [id]);
  }

  async completeRegistrations(id) {
    await this.db.query("UPDATE registrations SET status = 'selesai' WHERE workshop_id = ? AND status = 'terdaftar'", [id]);
  }

  /** Pendaftaran milik user (portal peserta) */
  async registrationsOfUser(userId) {
    const [regs] = await this.db.query(
      `SELECT r.*, w.slug FROM registrations r JOIN workshops w ON w.id = r.workshop_id WHERE r.user_id = ? ORDER BY r.registered_at`,
      [userId]
    );
    const [atts] = await this.db.query(
      `SELECT a.* FROM attendances a JOIN registrations r ON r.id = a.registration_id WHERE r.user_id = ? ORDER BY a.tanggal, a.submitted_at`,
      [userId]
    );
    return { regs, atts };
  }
}

module.exports = new WorkshopsRepository();
