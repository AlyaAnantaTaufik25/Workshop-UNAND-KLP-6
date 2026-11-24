const bcrypt = require('bcryptjs');
const authRepository = require('./auth.repository');
const { signToken } = require('../../middlewares/auth.middleware');
const { unauthorized, conflict, badRequest, notFound, forbidden } = require('../../utils/http.util');
const { initials } = require('../../utils/format.util');

const DEFAULT_PIN = '123456';

/** Bentuk profil user yang dipakai seluruh portal frontend */
function serializeUser(u) {
  if (!u) return null;
  return {
    id: u.id,
    nama: u.nama,
    namaPendek: u.nama,
    inisial: initials(u.nama),
    email: u.email,
    telepon: u.telepon || '',
    role: u.role,
    roleLabel: u.role_name,
    status: u.status,
    jabatan: u.jabatan || '',
    unitKerja: u.unit_kerja || '',
    nip: u.nip || '',
    // Peserta
    jenis: u.jenis_peserta || '',
    nim: u.nim || '',
    prodi: u.prodi || '',
    // Mitra
    partnerId: u.partner_id || null,
    instansi: u.partner_nama || '',
    jenisMitra: u.partner_jenis || '',
    bidangUsaha: u.partner_bidang || '',
    alamat: u.partner_alamat || '',
    subtitle: u.role === 'mitra' ? 'Mitra · Penanggung jawab instansi' : u.role_name,
    hasPin: !!u.pin_hash,
    createdAt: u.created_at || null,
  };
}

class AuthService {
  constructor() {
    this.repository = authRepository;
  }

  async login(email, password) {
    const user = await this.repository.findByEmail(String(email).trim().toLowerCase());
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      throw unauthorized('Email atau kata sandi salah');
    }
    if (user.status !== 'Aktif') throw forbidden('Akun Anda dinonaktifkan. Hubungi Humas UNAND.');
    const profile = await this.repository.findById(user.id);
    return { token: signToken(user), user: serializeUser(profile) };
  }

  async register(body) {
    const email = String(body.email).trim().toLowerCase();
    if (await this.repository.findByEmail(email)) throw conflict('Email sudah terdaftar');
    if (String(body.password).length < 8) throw badRequest('Kata sandi minimal 8 karakter');
    const roleId = await this.repository.roleIdByCode('peserta');
    const id = await this.repository.createUser({
      role_id: roleId,
      nama: String(body.nama).trim(),
      email,
      password_hash: await bcrypt.hash(String(body.password), 10),
      telepon: body.telepon || null,
      jenis_peserta: body.jenis || 'Umum',
      nim: body.nim || null,
      prodi: body.prodi || null,
    });
    const profile = await this.repository.findById(id);
    return { token: signToken(profile), user: serializeUser(profile) };
  }

  async me(userId) {
    const profile = await this.repository.findById(userId);
    if (!profile) throw notFound('Pengguna tidak ditemukan');
    return serializeUser(profile);
  }

  async updateProfile(userId, body) {
    const profile = await this.repository.findById(userId);
    if (!profile) throw notFound('Pengguna tidak ditemukan');
    const map = { nama: 'nama', telepon: 'telepon', jabatan: 'jabatan', unitKerja: 'unit_kerja', nip: 'nip', jenis: 'jenis_peserta', nim: 'nim', prodi: 'prodi' };
    const data = {};
    for (const [key, col] of Object.entries(map)) {
      if (body[key] !== undefined) data[col] = body[key] === '' ? null : String(body[key]).trim();
    }
    if (data.nama === null) throw badRequest('Nama tidak boleh kosong');
    if (body.email !== undefined && String(body.email).trim().toLowerCase() !== profile.email) {
      const email = String(body.email).trim().toLowerCase();
      if (await this.repository.findByEmail(email)) throw conflict('Email sudah dipakai akun lain');
      data.email = email;
    }
    await this.repository.updateUser(userId, data);

    // Mitra dapat memperbarui data instansinya
    if (profile.role === 'mitra' && profile.partner_id) {
      const pData = {};
      if (body.bidangUsaha !== undefined) pData.bidang_usaha = body.bidangUsaha;
      if (body.alamat !== undefined) pData.alamat = body.alamat;
      await this.repository.updatePartner(profile.partner_id, pData);
    }
    return this.me(userId);
  }

  async changePassword(userId, { oldPassword, newPassword }) {
    const profile = await this.repository.findById(userId);
    if (!(await bcrypt.compare(String(oldPassword || ''), profile.password_hash))) throw badRequest('Kata sandi lama salah');
    if (String(newPassword || '').length < 8) throw badRequest('Kata sandi baru minimal 8 karakter');
    await this.repository.updateUser(userId, { password_hash: await bcrypt.hash(String(newPassword), 10) });
  }

  async verifyPin(userId, pin) {
    const profile = await this.repository.findById(userId);
    if (!['rektor', 'mitra'].includes(profile.role)) throw forbidden('PIN TTE hanya untuk Rektor dan Mitra');
    const hash = profile.pin_hash;
    const ok = hash ? await bcrypt.compare(String(pin || ''), hash) : String(pin) === DEFAULT_PIN;
    if (!ok) throw badRequest('PIN tanda tangan elektronik salah');
    return true;
  }

  async changePin(userId, { oldPin, newPin }) {
    await this.verifyPin(userId, oldPin);
    if (!/^\d{6}$/.test(String(newPin || ''))) throw badRequest('PIN baru harus 6 digit angka');
    await this.repository.updateUser(userId, { pin_hash: await bcrypt.hash(String(newPin), 10) });
  }

  async resetPin(userId) {
    await this.repository.updateUser(userId, { pin_hash: await bcrypt.hash(DEFAULT_PIN, 10) });
  }
}

const service = new AuthService();
service.serializeUser = serializeUser;
module.exports = service;
