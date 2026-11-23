const { pool } = require('../../config/database');

/**
 * Data Access Layer untuk modul roles
 */
class RolesRepository {
  constructor() {
    this.db = pool;
  }

  async findAll() {
    const [rows] = await this.db.query(
      `SELECT r.*, (SELECT COUNT(*) FROM users u WHERE u.role_id = r.id) AS jumlah_pengguna FROM roles r ORDER BY r.id`
    );
    return rows;
  }
}

module.exports = new RolesRepository();
