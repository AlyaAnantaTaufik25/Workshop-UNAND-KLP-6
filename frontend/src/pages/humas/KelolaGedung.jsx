import { useState } from 'react';
import { Search, Bell, Plus, Eye, Pencil, Trash2, X } from 'lucide-react';

const initialGedung = [
  { id: 1, gedung: 'Convention Hall',  ruangan: 'Ruang Utama',            lokasi: 'Kampus Limau Manis, Padang', lat: '-0.9142', lng: '100.4580', radius: 150 },
  { id: 2, gedung: 'Gedung Rektorat',  ruangan: 'Ruang Sidang Lantai 4',   lokasi: 'Kampus Limau Manis, Padang', lat: '-0.9147', lng: '100.4592', radius: 100 },
];

const defaultForm = { gedung: '', ruangan: '', lokasi: '', lat: '', lng: '', radius: '' };

export default function KelolaGedung() {
  const [gedung, setGedung]     = useState(initialGedung);
  const [search, setSearch]     = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]         = useState(defaultForm);

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const filtered = gedung.filter(g =>
    g.gedung.toLowerCase().includes(search.toLowerCase()) ||
    g.ruangan.toLowerCase().includes(search.toLowerCase())
  );

  const handleSimpan = () => {
    if (!form.gedung || !form.ruangan) return;
    setGedung(prev => [...prev, { ...form, id: Date.now(), radius: Number(form.radius) }]);
    setForm(defaultForm);
    setShowModal(false);
  };

  const handleHapus = (id) => {
    if (window.confirm('Yakin hapus gedung/ruangan ini?')) setGedung(prev => prev.filter(g => g.id !== id));
  };

  return (
    <>
      <div className="humas-list-page">

        {/* Prototype Banner */}
        <div className="humas-prototype-banner">
          <span className="humas-prototype-tag">Mode Prototipe</span>
          <span className="humas-prototype-text">
            Data contoh, perubahan hanya selama sesi. OFS, OTF, tanda tangan electronic dan PDF resmi belum terintegrasi.
          </span>
          <span className="humas-prototype-date">Referensi demo: 10 Mei 2026</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="humas-notif-btn"><Bell size={15} /> Notifikasi perbaikan (1)</button>
        </div>

        <div className="humas-list-header">
          <div>
            <h2 className="humas-section-title">Kelola Gedung & Ruangan</h2>
            <p className="humas-section-sub">
              Master lokasi geofencing yang digunakan kembali.{' '}
              <a href="#" className="humas-link">Peminjaman</a> tetap melalui SIPRAS.
            </p>
          </div>
          <button className="humas-tambah-btn" onClick={() => setShowModal(true)}>
            <Plus size={15} /> Tambah Gedung / Ruangan
          </button>
        </div>

        <div className="filter-bar">
          <div className="search-wrap" style={{ flex: 1 }}>
            <Search size={15} className="search-icon" />
            <input className="search-input" placeholder="Cari data..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nama Gedung</th>
                <th>Nama Ruangan</th>
                <th>Lokasi</th>
                <th>Latitude</th>
                <th>Longitude</th>
                <th>Radius Geofencing (Meter)</th>
                <th>Tindakan</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--gray-400)', padding: '32px' }}>Belum ada data gedung.</td></tr>
              )}
              {filtered.map(g => (
                <tr key={g.id}>
                  <td><span className="table-name-bold humas-link">{g.gedung}</span></td>
                  <td>{g.ruangan}</td>
                  <td>{g.lokasi}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{g.lat}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{g.lng}</td>
                  <td style={{ textAlign: 'center' }}>{g.radius}</td>
                  <td>
                    <div className="humas-tindakan-group">
                      <button className="humas-tindakan-btn humas-tindakan-view"><Eye size={12} /> Lihat Detail</button>
                      <button className="humas-tindakan-btn humas-tindakan-edit"><Pencil size={12} /> Edit</button>
                      <button className="humas-tindakan-btn humas-tindakan-delete" onClick={() => handleHapus(g.id)}><Trash2 size={12} /> Hapus</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <p className="modal-header-crumb">WORKSHOP UNAND</p>
                <h2 className="modal-header-title">Tambah Gedung / Ruangan</h2>
              </div>
              <button className="modal-close-btn" onClick={() => setShowModal(false)}><X size={16} /></button>
            </div>
            <div className="modal-body" style={{ gap: 14 }}>
              <div className="modal-grid-2">
                <div className="form-group">
                  <label className="form-label">Nama gedung <span className="req">*</span></label>
                  <input className="form-input" value={form.gedung} onChange={e => set('gedung', e.target.value)} placeholder="Contoh: Convention Hall" />
                </div>
                <div className="form-group">
                  <label className="form-label">Nama ruangan <span className="req">*</span></label>
                  <input className="form-input" value={form.ruangan} onChange={e => set('ruangan', e.target.value)} placeholder="Contoh: Ruang Utama" />
                </div>
              </div>
              <div className="modal-grid-2">
                <div className="form-group">
                  <label className="form-label">Lokasi <span className="req">*</span></label>
                  <input className="form-input" value={form.lokasi} onChange={e => set('lokasi', e.target.value)} placeholder="Kampus Limau Manis..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Latitude <span className="req">*</span></label>
                  <input className="form-input" value={form.lat} onChange={e => set('lat', e.target.value)} placeholder="-0.9142" />
                </div>
              </div>
              <div className="modal-grid-2">
                <div className="form-group">
                  <label className="form-label">Longitude <span className="req">*</span></label>
                  <input className="form-input" value={form.lng} onChange={e => set('lng', e.target.value)} placeholder="100.4580" />
                </div>
                <div className="form-group">
                  <label className="form-label">Radius geofencing (meter) <span className="req">*</span></label>
                  <input className="form-input" type="number" value={form.radius} onChange={e => set('radius', e.target.value)} placeholder="150" />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="modal-btn modal-btn-batal" onClick={() => setShowModal(false)}>Batal</button>
              <button className="modal-btn modal-btn-publish" onClick={handleSimpan}>Simpan Perubahan</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
