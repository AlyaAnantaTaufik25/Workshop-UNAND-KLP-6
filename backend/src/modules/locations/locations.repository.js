const { pool } = require('../../config/database');

/**
 * Data Access Layer untuk modul locations
 */
class LocationsRepository {
  constructor() {
    this.db = pool;
  }

  async findAll() {
    const [rows] = await this.db.query(
      `SELECT l.*, (SELECT COUNT(*) FROM workshops w WHERE w.location_id = l.id) AS jumlah_kegiatan
       FROM locations l ORDER BY l.gedung, l.ruangan`
    );
    return rows;
  }

  async findById(id) {
    const [rows] = await this.db.query('SELECT * FROM locations WHERE id = ?', [id]);
    return rows[0] || null;
  }

  async create(data) {
    const [res] = await this.db.query('INSERT INTO locations SET ?', [data]);
    return res.insertId;
  }

  async update(id, data) {
    await this.db.query('UPDATE locations SET ? WHERE id = ?', [data, id]);
  }

  async remove(id) {
    await this.db.query('DELETE FROM locations WHERE id = ?', [id]);
  }
}

module.exports = new LocationsRepository();
