const locationsRepository = require('./locations.repository');
const { notFound, badRequest } = require('../../utils/http.util');

function serialize(l) {
  return {
    id: l.id,
    gedung: l.gedung,
    ruangan: l.ruangan,
    lokasi: l.lokasi || '',
    lat: l.latitude !== null ? String(Number(l.latitude)) : '',
    lng: l.longitude !== null ? String(Number(l.longitude)) : '',
    radius: Number(l.radius),
    jumlahKegiatan: Number(l.jumlah_kegiatan || 0),
  };
}

function toColumns(body) {
  const data = {};
  if (body.gedung !== undefined) data.gedung = String(body.gedung).trim();
  if (body.ruangan !== undefined) data.ruangan = String(body.ruangan).trim();
  if (body.lokasi !== undefined) data.lokasi = body.lokasi || null;
  const num = (v) => (v === '' || v === null || v === undefined ? null : Number(v));
  if (body.lat !== undefined) data.latitude = num(body.lat);
  if (body.lng !== undefined) data.longitude = num(body.lng);
  if (body.radius !== undefined) data.radius = parseInt(body.radius, 10) || 100;
  if (data.latitude !== undefined && data.latitude !== null && (data.latitude < -90 || data.latitude > 90)) throw badRequest('Latitude harus antara -90 dan 90');
  if (data.longitude !== undefined && data.longitude !== null && (data.longitude < -180 || data.longitude > 180)) throw badRequest('Longitude harus antara -180 dan 180');
  return data;
}

/**
 * Business Logic Layer untuk modul locations (gedung & ruangan)
 */
class LocationsService {
  constructor() {
    this.repository = locationsRepository;
  }

  async list() {
    return (await this.repository.findAll()).map(serialize);
  }

  async get(id) {
    const l = await this.repository.findById(id);
    if (!l) throw notFound('Lokasi tidak ditemukan');
    return serialize(l);
  }

  async create(body) {
    const data = toColumns(body);
    if (!data.gedung || !data.ruangan) throw badRequest('Nama gedung dan ruangan wajib diisi');
    const id = await this.repository.create(data);
    return this.get(id);
  }

  async update(id, body) {
    await this.get(id);
    await this.repository.update(id, toColumns(body));
    return this.get(id);
  }

  async remove(id) {
    await this.get(id);
    await this.repository.remove(id);
  }
}

module.exports = new LocationsService();
