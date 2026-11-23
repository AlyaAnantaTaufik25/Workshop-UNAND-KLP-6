const partnersRepository = require('./partners.repository');
const workshopsService = require('../workshops/workshops.service');
const { notFound, forbidden, badRequest } = require('../../utils/http.util');

function serialize(p) {
  return {
    id: p.id,
    nama: p.nama,
    jenis: p.jenis,
    penanggungJawab: p.penanggung_jawab || '',
    email: p.email || '',
    kontak: p.kontak || '',
    bidangUsaha: p.bidang_usaha || '',
    alamat: p.alamat || '',
    kegiatanTerkait: p.kegiatan ? p.kegiatan.split('\n') : [],
  };
}

function toColumns(body) {
  const data = {};
  const map = { nama: 'nama', jenis: 'jenis', penanggungJawab: 'penanggung_jawab', email: 'email', kontak: 'kontak', bidangUsaha: 'bidang_usaha', alamat: 'alamat' };
  for (const [k, col] of Object.entries(map)) if (body[k] !== undefined) data[col] = body[k] === '' ? null : String(body[k]).trim();
  if (data.jenis && !['Internal', 'Eksternal'].includes(data.jenis)) throw badRequest("Jenis mitra harus 'Internal' atau 'Eksternal'");
  return data;
}

/**
 * Business Logic Layer untuk modul partners
 */
class PartnersService {
  constructor() {
    this.repository = partnersRepository;
  }

  async list(user) {
    const rows = await this.repository.findAll(user.role === 'mitra' ? user.partnerId || -1 : null);
    return rows.map(serialize);
  }

  async get(id, user) {
    if (user.role === 'mitra' && Number(id) !== user.partnerId) throw forbidden();
    const p = await this.repository.findById(id);
    if (!p) throw notFound('Mitra tidak ditemukan');
    return serialize(p);
  }

  async create(body) {
    const data = toColumns(body);
    if (!data.nama) throw badRequest('Nama instansi wajib diisi');
    const id = await this.repository.create(data);
    return serialize(await this.repository.findById(id));
  }

  async update(id, body) {
    await this.get(id, { role: 'humas' });
    await this.repository.update(id, toColumns(body));
    return serialize(await this.repository.findById(id));
  }

  async remove(id) {
    await this.get(id, { role: 'humas' });
    await this.repository.remove(id);
  }

  async workshops(id, user) {
    await this.get(id, user);
    const all = await workshopsService.list({ role: 'humas' });
    return all.filter((w) => w.partnerId === Number(id));
  }
}

module.exports = new PartnersService();
