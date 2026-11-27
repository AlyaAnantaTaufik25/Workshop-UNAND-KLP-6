const { pool } = require('../../config/database');

/**
 * Data Access Layer untuk modul registrations
 */
class RegistrationsRepository {
  constructor() {
    this.db = pool;
  }

  async findById(id) {
    const [rows] = await this.db.query(
      `SELECT r.*, w.slug, w.partner_id, w.kuota, w.nama AS workshop_nama FROM registrations r
       JOIN workshops w ON w.id = r.workshop_id WHERE r.id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  async findByUserWorkshop(userId, workshopId, conn = this.db) {
    const [rows] = await conn.query('SELECT * FROM registrations WHERE user_id = ? AND workshop_id = ?', [userId, workshopId]);
    return rows[0] || null;
  }

  async countActive(workshopId, conn = this.db) {
    const [[row]] = await conn.query(
      "SELECT COUNT(*) AS n FROM registrations WHERE workshop_id = ? AND status IN ('terdaftar','selesai')",
      [workshopId]
    );
    return Number(row.n);
  }

  async nextQueue(workshopId, conn = this.db) {
    const [[row]] = await conn.query(
      "SELECT COALESCE(MAX(queue_no), 0) + 1 AS q FROM registrations WHERE workshop_id = ? AND status = 'waiting'",
      [workshopId]
    );
    return Number(row.q);
  }

  async create(data, conn = this.db) {
    const [res] = await conn.query('INSERT INTO registrations SET ?', [data]);
    return res.insertId;
  }

  async update(id, data, conn = this.db) {
    await conn.query('UPDATE registrations SET ? WHERE id = ?', [data, id]);
  }

  async firstWaiting(workshopId, conn = this.db) {
    const [rows] = await conn.query(
      "SELECT * FROM registrations WHERE workshop_id = ? AND status = 'waiting' ORDER BY queue_no, registered_at LIMIT 1",
      [workshopId]
    );
    return rows[0] || null;
  }

  /** Seluruh peserta (opsional dibatasi kegiatan milik mitra) */
  async listAll({ partnerId, workshopId } = {}) {
    const where = [];
    const params = [];
    if (partnerId) { where.push('w.partner_id = ?'); params.push(partnerId); }
    if (workshopId) { where.push('w.id = ?'); params.push(workshopId); }
    const [regs] = await this.db.query(
      `SELECT r.*, u.nama, u.email, u.jenis_peserta, w.nama AS workshop_nama, w.jenis AS workshop_jenis
       FROM registrations r JOIN users u ON u.id = r.user_id JOIN workshops w ON w.id = r.workshop_id
       ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
       ORDER BY w.tanggal_mulai DESC, r.registered_at`,
      params
    );
    const [atts] = await this.db.query(
      `SELECT a.* FROM attendances a JOIN registrations r ON r.id = a.registration_id JOIN workshops w ON w.id = r.workshop_id
       ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY a.tanggal`,
      params
    );
    return { regs, atts };
  }

  async transaction(fn) {
    const conn = await this.db.getConnection();
    try {
      await conn.beginTransaction();
      const result = await fn(conn);
      await conn.commit();
      return result;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }
}

module.exports = new RegistrationsRepository();
