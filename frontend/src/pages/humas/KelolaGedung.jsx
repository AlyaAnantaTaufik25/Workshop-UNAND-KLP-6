import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Plus, X, Eye, Pencil, Trash2 } from 'lucide-react';

const initialGedung = [
  {
    id: 1,
    gedung: 'Convention Hall',
    ruangan: 'Ruang Utama',
    lokasi: 'Kampus Limau Manis, Padang',
    lat: '-0.9142',
    lng: '100.4580',
    radius: 150,
  },
  {
    id: 2,
    gedung: 'Gedung Rektorat',
    ruangan: 'Ruang Sidang Lantai 4',
    lokasi: 'Kampus Limau Manis, Padang',
    lat: '-0.9147',
    lng: '100.4592',
    radius: 100,
  },
];

const defaultForm = {
  gedung: '',
  ruangan: '',
  lokasi: '',
  lat: '',
  lng: '',
  radius: '',
};

export default function KelolaGedung() {
  const navigate = useNavigate();
  const [gedung, setGedung] = useState(initialGedung);
  const [search, setSearch] = useState('');

  // Modals state
  const [showTambah, setShowTambah] = useState(false);
  const [tambahForm, setTambahForm] = useState(defaultForm);

  const [detailData, setDetailData] = useState(null);

  const [editData, setEditData] = useState(null);
  const [editForm, setEditForm] = useState(defaultForm);

  const filtered = gedung.filter(
    g =>
      g.gedung.toLowerCase().includes(search.toLowerCase()) ||
      g.ruangan.toLowerCase().includes(search.toLowerCase()) ||
      g.lokasi.toLowerCase().includes(search.toLowerCase())
  );

  // ── Handlers Tambah ──
  const handleSimpanTambah = () => {
    if (!tambahForm.gedung || !tambahForm.ruangan) return;
    setGedung(prev => [
      ...prev,
      {
        ...tambahForm,
        id: Date.now(),
        radius: Number(tambahForm.radius) || 100,
      },
    ]);
    setTambahForm(defaultForm);
    setShowTambah(false);
  };

  // ── Handlers Edit ──
  const handleOpenEdit = g => {
    setDetailData(null);
    setEditData(g);
    setEditForm({
      gedung: g.gedung,
      ruangan: g.ruangan,
      lokasi: g.lokasi,
      lat: g.lat,
      lng: g.lng,
      radius: g.radius,
    });
  };

  const handleSimpanEdit = () => {
    if (!editForm.gedung || !editForm.ruangan) return;
    setGedung(prev =>
      prev.map(g =>
        g.id === editData.id
          ? {
              ...g,
              ...editForm,
              radius: Number(editForm.radius) || g.radius,
            }
          : g
      )
    );
    setEditData(null);
  };

  // ── Handlers Hapus ──
  const handleHapus = id => {
    setGedung(prev => prev.filter(g => g.id !== id));
  };

  return (
    <>
      <div className="humas-list-page">
        {/* Top Header Row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 20,
          }}
        >
          <div>
            <h2 className="humas-section-title">Kelola Gedung & Ruangan</h2>
            <p className="humas-section-sub">
              Master lokasi geofencing yang digunakan kembali. Peminjaman tetap melalui SIPRAS.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
            <button
              className="humas-notif-btn"
              onClick={() => navigate('/humas/perbaikan-sertifikat')}
            >
              <Bell size={15} /> Notifikasi perbaikan (1)
            </button>
            <button
              className="humas-tambah-btn"
              style={{
                background: '#14532d',
                color: '#ffffff',
                border: 'none',
                fontWeight: 600,
                borderRadius: 6,
                padding: '8px 16px',
                cursor: 'pointer',
              }}
              onClick={() => {
                setTambahForm(defaultForm);
                setShowTambah(true);
              }}
            >
              <Plus size={15} /> Tambah Gedung / Ruangan
            </button>
          </div>
        </div>

        {/* Search Bar Full Width */}
        <div className="filter-bar" style={{ marginBottom: 16 }}>
          <div className="search-wrap" style={{ flex: 1, width: '100%' }}>
            <Search size={15} className="search-icon" />
            <input
              className="search-input"
              placeholder="Cari data..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
        </div>

        {/* Table */}
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>NAMA GEDUNG</th>
                <th>NAMA RUANGAN</th>
                <th>LOKASI</th>
                <th>LATITUDE</th>
                <th>LONGITUDE</th>
                <th>RADIUS GEOFENCING (METER)</th>
                <th>TINDAKAN</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: '#9ca3af', padding: '32px' }}>
                    Belum ada data gedung & ruangan.
                  </td>
                </tr>
              ) : (
                filtered.map(g => (
                  <tr key={g.id}>
                    <td>{g.gedung}</td>
                    <td>{g.ruangan}</td>
                    <td>{g.lokasi}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{g.lat}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{g.lng}</td>
                    <td style={{ textAlign: 'center' }}>{g.radius}</td>
                    <td>
                      <div className="humas-tindakan-group">
                        <button
                          type="button"
                          className="humas-tindakan-btn humas-tindakan-view"
                          onClick={() => setDetailData(g)}
                        >
                          <Eye size={12} /> Detail
                        </button>
                        <button
                          type="button"
                          className="humas-tindakan-btn humas-tindakan-edit"
                          onClick={() => handleOpenEdit(g)}
                        >
                          <Pencil size={12} /> Edit
                        </button>
                        <button
                          type="button"
                          className="humas-tindakan-btn humas-tindakan-delete"
                          onClick={() => handleHapus(g.id)}
                        >
                          <Trash2 size={12} /> Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 1. MODAL TAMBAH GEDUNG / RUANGAN                          */}
      {/* ────────────────────────────────────────────────────────── */}
      {showTambah && (
        <div className="modal-overlay" onClick={() => setShowTambah(false)}>
          <div
            className="modal-box"
            style={{ maxWidth: 540, width: '100%', borderRadius: 8 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-header" style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: 12 }}>
              <div>
                <p className="modal-header-crumb">WORKSHOP UNAND</p>
                <h2 className="modal-header-title">Tambah Gedung / Ruangan</h2>
              </div>
              <button className="modal-close-btn" onClick={() => setShowTambah(false)}>
                <X size={16} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 16 }}>
              {/* Row 1 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">
                    Nama gedung <span className="req">*</span>
                  </label>
                  <input
                    className="form-input"
                    value={tambahForm.gedung}
                    onChange={e => setTambahForm(prev => ({ ...prev, gedung: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    Nama ruangan <span className="req">*</span>
                  </label>
                  <input
                    className="form-input"
                    value={tambahForm.ruangan}
                    onChange={e => setTambahForm(prev => ({ ...prev, ruangan: e.target.value }))}
                  />
                </div>
              </div>

              {/* Row 2 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">
                    Lokasi <span className="req">*</span>
                  </label>
                  <input
                    className="form-input"
                    value={tambahForm.lokasi}
                    onChange={e => setTambahForm(prev => ({ ...prev, lokasi: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    Latitude <span className="req">*</span>
                  </label>
                  <input
                    className="form-input"
                    value={tambahForm.lat}
                    onChange={e => setTambahForm(prev => ({ ...prev, lat: e.target.value }))}
                  />
                </div>
              </div>

              {/* Row 3 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">
                    Longitude <span className="req">*</span>
                  </label>
                  <input
                    className="form-input"
                    value={tambahForm.lng}
                    onChange={e => setTambahForm(prev => ({ ...prev, lng: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    Radius geofencing (meter) <span className="req">*</span>
                  </label>
                  <input
                    className="form-input"
                    type="number"
                    value={tambahForm.radius}
                    onChange={e => setTambahForm(prev => ({ ...prev, radius: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <div
              className="modal-footer"
              style={{
                borderTop: '1px solid #f1f5f9',
                paddingTop: 14,
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 10,
              }}
            >
              <button
                type="button"
                className="modal-btn modal-btn-batal"
                style={{
                  padding: '8px 20px',
                  borderRadius: 6,
                  border: '1px solid #d1d5db',
                  background: '#ffffff',
                  color: '#374151',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
                onClick={() => setShowTambah(false)}
              >
                Batal
              </button>
              <button
                type="button"
                className="modal-btn modal-btn-publish"
                style={{
                  background: '#14532d',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '8px 20px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
                onClick={handleSimpanTambah}
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* 2. MODAL DETAIL DATA                                       */}
      {/* ────────────────────────────────────────────────────────── */}
      {detailData && (
        <div className="modal-overlay" onClick={() => setDetailData(null)}>
          <div
            className="modal-box"
            style={{ maxWidth: 520, width: '100%', borderRadius: 8 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-header" style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: 12 }}>
              <div>
                <p className="modal-header-crumb">WORKSHOP UNAND</p>
                <h2 className="modal-header-title">Detail Data</h2>
              </div>
              <button className="modal-close-btn" onClick={() => setDetailData(null)}>
                <X size={16} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', fontSize: '13px', paddingTop: 16 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '11px 0',
                  borderBottom: '1px solid #f1f5f9',
                }}
              >
                <span style={{ color: '#4b5563' }}>Nama gedung</span>
                <span style={{ color: '#111827', fontWeight: 500 }}>{detailData.gedung}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '11px 0',
                  borderBottom: '1px solid #f1f5f9',
                }}
              >
                <span style={{ color: '#4b5563' }}>Nama ruangan</span>
                <span style={{ color: '#111827', fontWeight: 500 }}>{detailData.ruangan}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '11px 0',
                  borderBottom: '1px solid #f1f5f9',
                }}
              >
                <span style={{ color: '#4b5563' }}>Lokasi</span>
                <span style={{ color: '#111827', fontWeight: 500 }}>{detailData.lokasi}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '11px 0',
                  borderBottom: '1px solid #f1f5f9',
                }}
              >
                <span style={{ color: '#4b5563' }}>Latitude</span>
                <span style={{ color: '#111827', fontWeight: 500 }}>{detailData.lat}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '11px 0',
                  borderBottom: '1px solid #f1f5f9',
                }}
              >
                <span style={{ color: '#4b5563' }}>Longitude</span>
                <span style={{ color: '#111827', fontWeight: 500 }}>{detailData.lng}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '11px 0',
                }}
              >
                <span style={{ color: '#4b5563' }}>Radius geofencing (meter)</span>
                <span style={{ color: '#111827', fontWeight: 500 }}>{detailData.radius}</span>
              </div>
            </div>

            <div
              className="modal-footer"
              style={{
                borderTop: '1px solid #f1f5f9',
                paddingTop: 14,
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 10,
              }}
            >
              <button
                type="button"
                className="modal-btn modal-btn-batal"
                style={{
                  padding: '8px 20px',
                  borderRadius: 6,
                  border: '1px solid #d1d5db',
                  background: '#ffffff',
                  color: '#374151',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
                onClick={() => setDetailData(null)}
              >
                Kembali ke Daftar
              </button>
              <button
                type="button"
                className="modal-btn modal-btn-publish"
                style={{
                  background: '#14532d',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '8px 20px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
                onClick={() => handleOpenEdit(detailData)}
              >
                Edit Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* 3. MODAL EDIT LOKASI                                      */}
      {/* ────────────────────────────────────────────────────────── */}
      {editData && (
        <div className="modal-overlay" onClick={() => setEditData(null)}>
          <div
            className="modal-box"
            style={{ maxWidth: 540, width: '100%', borderRadius: 8 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-header" style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: 12 }}>
              <div>
                <p className="modal-header-crumb">WORKSHOP UNAND</p>
                <h2 className="modal-header-title">Edit Lokasi</h2>
              </div>
              <button className="modal-close-btn" onClick={() => setEditData(null)}>
                <X size={16} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 16 }}>
              {/* Row 1 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">
                    Nama gedung <span className="req">*</span>
                  </label>
                  <input
                    className="form-input"
                    value={editForm.gedung}
                    onChange={e => setEditForm(prev => ({ ...prev, gedung: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    Nama ruangan <span className="req">*</span>
                  </label>
                  <input
                    className="form-input"
                    value={editForm.ruangan}
                    onChange={e => setEditForm(prev => ({ ...prev, ruangan: e.target.value }))}
                  />
                </div>
              </div>

              {/* Row 2 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">
                    Lokasi <span className="req">*</span>
                  </label>
                  <input
                    className="form-input"
                    value={editForm.lokasi}
                    onChange={e => setEditForm(prev => ({ ...prev, lokasi: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    Latitude <span className="req">*</span>
                  </label>
                  <input
                    className="form-input"
                    value={editForm.lat}
                    onChange={e => setEditForm(prev => ({ ...prev, lat: e.target.value }))}
                  />
                </div>
              </div>

              {/* Row 3 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">
                    Longitude <span className="req">*</span>
                  </label>
                  <input
                    className="form-input"
                    value={editForm.lng}
                    onChange={e => setEditForm(prev => ({ ...prev, lng: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    Radius geofencing (meter) <span className="req">*</span>
                  </label>
                  <input
                    className="form-input"
                    type="number"
                    value={editForm.radius}
                    onChange={e => setEditForm(prev => ({ ...prev, radius: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <div
              className="modal-footer"
              style={{
                borderTop: '1px solid #f1f5f9',
                paddingTop: 14,
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 10,
              }}
            >
              <button
                type="button"
                className="modal-btn modal-btn-batal"
                style={{
                  padding: '8px 20px',
                  borderRadius: 6,
                  border: '1px solid #d1d5db',
                  background: '#ffffff',
                  color: '#374151',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
                onClick={() => setEditData(null)}
              >
                Batal
              </button>
              <button
                type="button"
                className="modal-btn modal-btn-publish"
                style={{
                  background: '#14532d',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '8px 20px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
                onClick={handleSimpanEdit}
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
