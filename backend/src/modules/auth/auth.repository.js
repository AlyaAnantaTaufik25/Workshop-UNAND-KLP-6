const { pool } = require('../../config/database');

/**
 * Data Access Layer untuk modul auth
 */
class AuthRepository {
  constructor() {
    this.db = pool;
  }

  async findByEmail(email) {
    const [rows] = await this.db.query(
      `SELECT u.*, r.code AS role, r.name AS role_name
       FROM users u JOIN roles r ON r.id = u.role_id WHERE u.email = ?`,
      [email]
    );
    return rows[0] || null;
  }

  async findById(id) {
    const [rows] = await this.db.query(
      `SELECT u.*, r.code AS role, r.name AS role_name,
              p.nama AS partner_nama, p.jenis AS partner_jenis, p.bidang_usaha AS partner_bidang,
              p.alamat AS partner_alamat
       FROM users u
       JOIN roles r ON r.id = u.role_id
       LEFT JOIN partners p ON p.id = u.partner_id
       WHERE u.id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  async roleIdByCode(code) {
    const [rows] = await this.db.query('SELECT id FROM roles WHERE code = ?', [code]);
    return rows[0] ? rows[0].id : null;
  }

  async createUser(data) {
    const [res] = await this.db.query('INSERT INTO users SET ?', [data]);
    return res.insertId;
  }

  async updateUser(id, data) {
    if (!Object.keys(data).length) return;
    await this.db.query('UPDATE users SET ? WHERE id = ?', [data, id]);
  }

  async updatePartner(id, data) {
    if (!id || !Object.keys(data).length) return;
    await this.db.query('UPDATE partners SET ? WHERE id = ?', [data, id]);
  }
}

module.exports = new AuthRepository();
