const bcrypt = require('bcryptjs');
const authRepository = require('./auth.repository');
const { signToken } = require('../../middlewares/auth.middleware');
const { unauthorized, conflict, badRequest, notFound, forbidden, tooMany } = require('../../utils/http.util');
const { pool } = require('../../config/database');
const { audit } = require('../../services/audit.service');
const { initials } = require('../../utils/format.util');

const DEFAULT_PIN = '123456';

// Penguncian sementara setelah percobaan gagal berulang
const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

/** Sisa detik penguncian (0 = tidak terkunci) */
async function lockSeconds(userId, column) {
  const [[row]] = await pool.query(`SELECT GREATEST(COALESCE(TIMESTAMPDIFF(SECOND, NOW(), ${column}), 0), 0) AS s FROM users WHERE id = ?`, [userId]);
  return row ? Number(row.s) : 0;
}
/** Catat kegagalan; kunci bila mencapai batas. Mengembalikan { locked, remaining } */
async function registerFailure(userId, prefix) {
  await pool.query(
    `UPDATE users SET
       ${prefix}_locked_until = IF(${prefix}_failed_count + 1 >= ?, NOW() + INTERVAL ? MINUTE, ${prefix}_locked_until),
       ${prefix}_failed_count = IF(${prefix}_failed_count + 1 >= ?, 0, ${prefix}_failed_count + 1)
     WHERE id = ?`,
    [MAX_ATTEMPTS, LOCK_MINUTES, MAX_ATTEMPTS, userId]
  );
  const [[row]] = await pool.query(`SELECT ${prefix}_failed_count AS n, ${prefix}_locked_until > NOW() AS locked FROM users WHERE id = ?`, [userId]);
  return { locked: !!row.locked, remaining: MAX_ATTEMPTS - Number(row.n) };
}
const lockMessage = (what, seconds) => `${what} dikunci sementara karena terlalu banyak percobaan gagal. Coba lagi dalam ${Math.max(1, Math.ceil(seconds / 60))} menit.`;

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
    const normalized = String(email).trim().toLowerCase();
    const user = await this.repository.findByEmail(normalized);
    const actor = user ? { id: user.id, nama: user.nama, role: user.role } : null;
    if (user) {
      const locked = await lockSeconds(user.id, 'login_locked_until');
      if (locked > 0) {
        await audit({ action: 'auth.login_blocked', entity: 'user', entityId: user.id, description: 'Login ditolak: akun terkunci sementara', user: actor });
        throw tooMany(lockMessage('Akun', locked));
      }
    }
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      if (!user) {
        await audit({ action: 'auth.login_failed', entity: 'user', description: `Login gagal untuk email tidak terdaftar: ${normalized.slice(0, 120)}` });
        throw unauthorized('Email atau kata sandi salah');
      }
      const { locked, remaining } = await registerFailure(user.id, 'login');
      await audit({ action: locked ? 'auth.login_locked' : 'auth.login_failed', entity: 'user', entityId: user.id, description: locked ? `Akun dikunci ${LOCK_MINUTES} menit setelah ${MAX_ATTEMPTS} percobaan gagal` : 'Kata sandi salah', user: actor });
      if (locked) throw tooMany(lockMessage('Akun', LOCK_MINUTES * 60));
      throw unauthorized(remaining <= 2 ? `Email atau kata sandi salah. Sisa ${remaining} percobaan sebelum akun dikunci ${LOCK_MINUTES} menit.` : 'Email atau kata sandi salah');
    }
    if (user.status !== 'Aktif') throw forbidden('Akun Anda dinonaktifkan. Hubungi Humas UNAND.');
    await pool.query('UPDATE users SET login_failed_count = 0, login_locked_until = NULL, last_login_at = NOW() WHERE id = ?', [user.id]);
    await audit({ action: 'auth.login', entity: 'user', entityId: user.id, description: 'Login berhasil', user: actor });
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
    await audit({ action: 'auth.password_changed', entity: 'user', entityId: userId, description: 'Kata sandi diubah' });
  }

  async verifyPin(userId, pin) {
    const profile = await this.repository.findById(userId);
    if (!['rektor', 'mitra'].includes(profile.role)) throw forbidden('PIN TTE hanya untuk Rektor dan Mitra');
    const actor = { id: profile.id, nama: profile.nama, role: profile.role };
    const locked = await lockSeconds(userId, 'pin_locked_until');
    if (locked > 0) {
      await audit({ action: 'tte.pin_blocked', entity: 'user', entityId: userId, description: 'PIN TTE ditolak: terkunci sementara', user: actor });
      throw tooMany(lockMessage('PIN tanda tangan elektronik', locked));
    }
    const hash = profile.pin_hash;
    const ok = hash ? await bcrypt.compare(String(pin || ''), hash) : String(pin) === DEFAULT_PIN;
    if (!ok) {
      const { locked: nowLocked, remaining } = await registerFailure(userId, 'pin');
      await audit({ action: nowLocked ? 'tte.pin_locked' : 'tte.pin_failed', entity: 'user', entityId: userId, description: nowLocked ? `PIN TTE dikunci ${LOCK_MINUTES} menit setelah ${MAX_ATTEMPTS} percobaan gagal` : 'PIN TTE salah', user: actor });
      if (nowLocked) throw tooMany(lockMessage('PIN tanda tangan elektronik', LOCK_MINUTES * 60));
      throw badRequest(`PIN tanda tangan elektronik salah. Sisa ${remaining} percobaan sebelum PIN dikunci ${LOCK_MINUTES} menit.`);
    }
    await pool.query('UPDATE users SET pin_failed_count = 0, pin_locked_until = NULL WHERE id = ?', [userId]);
    return true;
  }

  async changePin(userId, { oldPin, newPin }) {
    await this.verifyPin(userId, oldPin);
    if (!/^\d{6}$/.test(String(newPin || ''))) throw badRequest('PIN baru harus 6 digit angka');
    await this.repository.updateUser(userId, { pin_hash: await bcrypt.hash(String(newPin), 10) });
    await audit({ action: 'tte.pin_changed', entity: 'user', entityId: userId, description: 'PIN TTE diubah' });
  }

  async resetPin(userId) {
    await this.repository.updateUser(userId, { pin_hash: await bcrypt.hash(DEFAULT_PIN, 10), pin_failed_count: 0, pin_locked_until: null });
    await audit({ action: 'tte.pin_reset', entity: 'user', entityId: userId, description: 'PIN TTE dikembalikan ke bawaan' });
  }
}

const service = new AuthService();
service.serializeUser = serializeUser;
module.exports = service;
