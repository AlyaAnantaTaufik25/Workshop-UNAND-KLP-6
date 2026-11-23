const { pool } = require('../../config/database');

/**
 * Data Access Layer untuk modul attendance
 */
class AttendanceRepository {
  constructor() {
    this.db = pool;
  }

  async findRegistration(userId, workshopId) {
    const [rows] = await this.db.query('SELECT * FROM registrations WHERE user_id = ? AND workshop_id = ?', [userId, workshopId]);
    return rows[0] || null;
  }

  async findForDay(registrationId, tanggal) {
    const [rows] = await this.db.query('SELECT * FROM attendances WHERE registration_id = ? AND tanggal = ?', [registrationId, tanggal]);
    return rows[0] || null;
  }

  async findById(id) {
    const [rows] = await this.db.query(
      `SELECT a.*, r.workshop_id, w.partner_id FROM attendances a
       JOIN registrations r ON r.id = a.registration_id JOIN workshops w ON w.id = r.workshop_id WHERE a.id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  async upsert(registrationId, tanggal, data) {
    const existing = await this.findForDay(registrationId, tanggal);
    if (existing) {
      await this.db.query('UPDATE attendances SET ? WHERE id = ?', [data, existing.id]);
      return existing.id;
    }
    const [res] = await this.db.query('INSERT INTO attendances SET ?', [{ ...data, registration_id: registrationId, tanggal }]);
    return res.insertId;
  }

  async update(id, data) {
    await this.db.query('UPDATE attendances SET ? WHERE id = ?', [data, id]);
  }

  async createToken(workshopId, token, expiresAt, userId) {
    await this.db.query('INSERT INTO attendance_tokens SET ?', [{ workshop_id: workshopId, token, expires_at: expiresAt, created_by: userId }]);
  }

  async validToken(workshopId, token) {
    const [rows] = await this.db.query(
      'SELECT * FROM attendance_tokens WHERE workshop_id = ? AND token = ? AND expires_at > NOW()',
      [workshopId, String(token).trim().toUpperCase()]
    );
    return rows[0] || null;
  }

  async hasActiveTokens(workshopId) {
    const [rows] = await this.db.query('SELECT id FROM attendance_tokens WHERE workshop_id = ? AND expires_at > NOW() LIMIT 1', [workshopId]);
    return rows.length > 0;
  }
}

module.exports = new AttendanceRepository();
