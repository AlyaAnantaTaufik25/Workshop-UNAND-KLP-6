const { pool } = require('../../config/database');

/**
 * Data Access Layer untuk modul users
 */
class UsersRepository {
  constructor() {
    this.db = pool;
  }

  async findAll({ role, search } = {}) {
    const where = [];
    const params = [];
    if (role) { where.push('(r.code = ? OR r.name = ?)'); params.push(role, role); }
    if (search) { where.push('(u.nama LIKE ? OR u.email LIKE ?)'); params.push(`%${search}%`, `%${search}%`); }
    const [rows] = await this.db.query(
      `SELECT u.*, r.code AS role, r.name AS role_name, p.nama AS partner_nama
       FROM users u JOIN roles r ON r.id = u.role_id LEFT JOIN partners p ON p.id = u.partner_id
       ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
       ORDER BY FIELD(r.code, 'humas', 'sekretariat', 'rektor', 'mitra', 'peserta'), u.id`,
      params
    );
    return rows;
  }

  async findById(id) {
    const [rows] = await this.db.query(
      `SELECT u.*, r.code AS role, r.name AS role_name, p.nama AS partner_nama
       FROM users u JOIN roles r ON r.id = u.role_id LEFT JOIN partners p ON p.id = u.partner_id WHERE u.id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  async roleByCodeOrName(value) {
    const [rows] = await this.db.query('SELECT * FROM roles WHERE code = ? OR name = ?', [value, value]);
    return rows[0] || null;
  }

  async partnerByName(nama) {
    const [rows] = await this.db.query('SELECT id FROM partners WHERE nama = ?', [nama]);
    return rows[0] || null;
  }

  async create(data) {
    const [res] = await this.db.query('INSERT INTO users SET ?', [data]);
    return res.insertId;
  }

  async update(id, data) {
    if (!Object.keys(data).length) return;
    await this.db.query('UPDATE users SET ? WHERE id = ?', [data, id]);
  }
}

module.exports = new UsersRepository();
