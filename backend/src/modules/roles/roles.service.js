const rolesRepository = require('./roles.repository');

/**
 * Business Logic Layer untuk modul roles
 */
class RolesService {
  constructor() {
    this.repository = rolesRepository;
  }

  async list() {
    const rows = await this.repository.findAll();
    return rows.map((r) => ({ id: r.id, code: r.code, nama: r.name, deskripsi: r.description, jumlahPengguna: Number(r.jumlah_pengguna) }));
  }
}

module.exports = new RolesService();
