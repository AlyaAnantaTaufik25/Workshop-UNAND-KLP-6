const bcrypt = require('bcryptjs');
const usersRepository = require('./users.repository');
const { notFound, badRequest, conflict, forbidden } = require('../../utils/http.util');

const DEFAULT_PASSWORD = 'password123';

function serialize(u) {
  return {
    id: u.id,
    nama: u.nama,
    email: u.email,
    role: u.role_name,
    roleCode: u.role,
    status: u.status,
    telepon: u.telepon || '',
    jenis: u.jenis_peserta || '',
    instansi: u.partner_nama || '',
    partnerId: u.partner_id,
    jabatan: u.jabatan || '',
    dibuat: u.created_at,
  };
}

/**
 * Business Logic Layer untuk modul users (Kelola Pengguna oleh Humas)
 */
class UsersService {
  constructor() {
    this.repository = usersRepository;
  }

  async list(query) {
    return (await this.repository.findAll({ role: query.role, search: query.search })).map(serialize);
  }

  async get(id, user) {
    if (user && user.role !== 'humas' && Number(id) !== user.id) throw forbidden();
    const u = await this.repository.findById(id);
    if (!u) throw notFound('Pengguna tidak ditemukan');
    return serialize(u);
  }

  async toColumns(body) {
    const data = {};
    if (body.nama !== undefined) data.nama = String(body.nama).trim();
    if (body.email !== undefined) data.email = String(body.email).trim().toLowerCase();
    if (body.telepon !== undefined) data.telepon = body.telepon || null;
    if (body.jabatan !== undefined) data.jabatan = body.jabatan || null;
    if (body.status !== undefined) {
      if (!['Aktif', 'Nonaktif'].includes(body.status)) throw badRequest("Status harus 'Aktif' atau 'Nonaktif'");
      data.status = body.status;
    }
    if (body.role !== undefined) {
      const role = await this.repository.roleByCodeOrName(body.role);
      if (!role) throw badRequest('Role tidak dikenal');
      data.role_id = role.id;
    }
    if (body.instansi !== undefined) {
      const p = body.instansi ? await this.repository.partnerByName(body.instansi) : null;
      data.partner_id = p ? p.id : null;
    }
    if (body.password) {
      if (String(body.password).length < 8) throw badRequest('Kata sandi minimal 8 karakter');
      data.password_hash = await bcrypt.hash(String(body.password), 10);
    }
    return data;
  }

  async create(body) {
    const data = await this.toColumns({ role: 'peserta', status: 'Aktif', ...body });
    if (!data.nama || !data.email) throw badRequest('Nama dan email wajib diisi');
    if (!data.password_hash) data.password_hash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
    try {
      const id = await this.repository.create(data);
      return this.get(id);
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') throw conflict('Email sudah terdaftar');
      throw err;
    }
  }

  async update(id, body, user) {
    await this.get(id, user);
    // Selain humas hanya boleh mengubah data dasar miliknya sendiri
    const allowed = user.role === 'humas' ? body : { nama: body.nama, telepon: body.telepon };
    try {
      await this.repository.update(id, await this.toColumns(allowed));
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') throw conflict('Email sudah dipakai akun lain');
      throw err;
    }
    return this.get(id);
  }

  async setStatus(id, status, user) {
    if (Number(id) === user.id) throw badRequest('Anda tidak dapat menonaktifkan akun sendiri');
    return this.update(id, { status }, user);
  }
}

module.exports = new UsersService();
