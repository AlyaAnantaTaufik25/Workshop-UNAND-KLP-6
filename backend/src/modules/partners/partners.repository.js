const { pool } = require('../../config/database');

/**
 * Data Access Layer untuk modul partners
 */
class PartnersRepository {
  constructor() {
    this.db = pool;
  }

  async findAll(partnerId = null) {
    const [rows] = await this.db.query(
      `SELECT p.*, GROUP_CONCAT(w.nama ORDER BY w.tanggal_mulai DESC SEPARATOR '\\n') AS kegiatan
       FROM partners p LEFT JOIN workshops w ON w.partner_id = p.id
       ${partnerId ? 'WHERE p.id = ?' : ''}
       GROUP BY p.id ORDER BY p.nama`,
      partnerId ? [partnerId] : []
    );
    return rows;
  }

  async findById(id) {
    const rows = await this.findAll(id);
    return rows[0] || null;
  }

  async create(data) {
    const [res] = await this.db.query('INSERT INTO partners SET ?', [data]);
    return res.insertId;
  }

  async update(id, data) {
    await this.db.query('UPDATE partners SET ? WHERE id = ?', [data, id]);
  }

  async remove(id) {
    await this.db.query('DELETE FROM partners WHERE id = ?', [id]);
  }
}

module.exports = new PartnersRepository();
