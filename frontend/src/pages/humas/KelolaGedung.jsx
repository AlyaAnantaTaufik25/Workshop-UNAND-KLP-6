import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Plus, X, Eye, Pencil, Trash2, MapPin, Navigation, Compass } from 'lucide-react';
import useCrud from '../../hooks/useCrud';
import { locationsApi } from '../../api';
import { PageLoader, ErrorNotice } from '../../components/RequireRole';
import { usePagination, IconAction } from '../../components/Pagination';
import { dialog } from '../../components/Dialog';
import BackButton from '../../components/BackButton';

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
  const { items, loading, error, reload, actionError, create, update, remove } = useCrud(locationsApi);
  const gedung = items;
  const [search, setSearch] = useState('');

  // Modals state
  const [showTambah, setShowTambah] = useState(false);
  const [tambahForm, setTambahForm] = useState(defaultForm);
  const [showMapPicker, setShowMapPicker] = useState(false);

  const [detailData, setDetailData] = useState(null);

  const [editData, setEditData] = useState(null);
  const [editForm, setEditForm] = useState(defaultForm);

  const filtered = gedung.filter(
    g =>
      g.gedung.toLowerCase().includes(search.toLowerCase()) ||
      g.ruangan.toLowerCase().includes(search.toLowerCase()) ||
      g.lokasi.toLowerCase().includes(search.toLowerCase())
  );
  // Paginasi tabel
  const { pageItems: pg_filtered, pager: pager_filtered } = usePagination(filtered, 10);

  // ── Handlers Tambah ──
  const handleSimpanTambah = async () => {
    if (!tambahForm.gedung || !tambahForm.ruangan) return;
    if (await create({ ...tambahForm, radius: Number(tambahForm.radius) || 100 })) {
      setTambahForm(defaultForm);
      setShowTambah(false);
    }
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

  const handleSimpanEdit = async () => {
    if (!editForm.gedung || !editForm.ruangan) return;
    if (await update(editData.id, { ...editForm, radius: Number(editForm.radius) || editData.radius })) setEditData(null);
  };

  // ── Handlers Hapus ──
  const handleHapus = async id => {
    if (await dialog.confirm({ title: 'Hapus gedung & ruangan?', message: 'Lokasi ini akan dihapus permanen. Kegiatan yang memakai lokasi ini tidak lagi memiliki gedung.', confirmText: 'Hapus', tone: 'danger' })) await remove(id);
  };

  return (
    <>
      <div className="humas-list-page">
        <ErrorNotice error={error} onRetry={reload} />
        {actionError && <ErrorNotice error={{ message: actionError }} />}
        {loading && !items.length && <PageLoader />}
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
                setTambahForm({
                  gedung: '',
                  ruangan: '',
                  lokasi: 'Kampus Limau Manis, Padang',
                  lat: '-0.914488',
                  lng: '100.466542',
                  radius: 50,
                });
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
                pg_filtered.map(g => (
                  <tr key={g.id}>
                    <td>{g.gedung}</td>
                    <td>{g.ruangan}</td>
                    <td>{g.lokasi}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{g.lat}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{g.lng}</td>
                    <td style={{ textAlign: 'center' }}>{g.radius}</td>
                    <td>
                      <div className="ui-row-actions">
                        <IconAction icon={Eye} label="Lihat detail" onClick={() => setDetailData(g)} />
                        <IconAction icon={Pencil} label="Edit" onClick={() => handleOpenEdit(g)} />
                        <IconAction icon={Trash2} label="Hapus" tone="danger" onClick={() => handleHapus(g.id)} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {pager_filtered}
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

              {/* Opsi Pilih Lewat Peta */}
              <div style={{ marginTop: 4 }}>
                <button
                  type="button"
                  onClick={() => setShowMapPicker(true)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 14px',
                    borderRadius: 6,
                    border: '1.5px solid #15803d',
                    background: '#f0fdf4',
                    color: '#15803d',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <MapPin size={15} />
                  <span>Tentukan Titik & Radius pada Peta</span>
                </button>
                {tambahForm.lat && tambahForm.lng && (
                  <span style={{ marginLeft: 10, fontSize: '12px', color: '#6b7280' }}>
                    Terpilih: {tambahForm.lat}, {tambahForm.lng} ({tambahForm.radius || 50}m)
                  </span>
                )}
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
      {/* 1.1 MODAL TITIK PUSAT & RADIUS GEOFENCE (LEAFLET MAP)    */}
      {/* ────────────────────────────────────────────────────────── */}
      {showMapPicker && (
        <div className="modal-overlay" onClick={() => setShowMapPicker(false)} style={{ zIndex: 1050 }}>
          <div
            className="modal-box"
            style={{ maxWidth: 580, width: '100%', borderRadius: 12, padding: 0, overflow: 'hidden', background: '#fff' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1f2937', margin: 0 }}>
                  Titik Pusat & Radius Geofence Gedung (Leaflet Map)
                </h3>
                <button
                  type="button"
                  onClick={() => setShowMapPicker(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Sub-bar Hijau */}
            <div
              style={{
                background: '#f0fdf4',
                padding: '9px 18px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid #dcfce7',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#15803d', fontWeight: 600, fontSize: '12.5px' }}>
                <Compass size={15} />
                <span>Tentukan Koordinat Gedung pada Peta</span>
              </div>
              <span style={{ fontSize: '11.5px', color: '#16a34a' }}>
                Klik atau geser pin untuk menentukan titik
              </span>
            </div>

            {/* Container Peta Visual Leaflet */}
            <div
              style={{
                position: 'relative',
                height: 290,
                background: '#f2efe9',
                overflow: 'hidden',
                cursor: 'crosshair',
                userSelect: 'none',
              }}
              onClick={e => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const latOffset = ((y - 145) / 145) * -0.0012;
                const lngOffset = ((x - (rect.width / 2)) / (rect.width / 2)) * 0.0012;
                const newLat = (-0.914488 + latOffset).toFixed(6);
                const newLng = (100.466542 + lngOffset).toFixed(6);
                setTambahForm(prev => ({
                  ...prev,
                  lat: newLat,
                  lng: newLng,
                }));
              }}
            >
              {/* Vektor Map jalan & gedung */}
              <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
                <rect width="100%" height="100%" fill="#f2efe9" />
                <path d="M -20 75 Q 200 65 600 80" stroke="#fff" strokeWidth="22" fill="none" />
                <path d="M 110 -20 L 130 310" stroke="#fff" strokeWidth="18" fill="none" />
                <path d="M 380 -20 L 400 310" stroke="#fff" strokeWidth="24" fill="none" />
                <path d="M 270 75 L 285 310" stroke="#fff" strokeWidth="16" fill="none" />
                <path d="M -20 75 Q 200 65 600 80" stroke="#fef3c7" strokeWidth="4" fill="none" strokeDasharray="8 6" />

                <rect x="25" y="105" width="90" height="65" rx="3" fill="#e5e0d8" stroke="#d5cfc5" strokeWidth="1" />
                <text x="30" y="138" fontSize="8.5" fill="#9ca3af" fontWeight="bold">Dean Engineering Faculty</text>

                <rect x="160" y="125" width="120" height="60" rx="3" fill="#e5e0d8" stroke="#d5cfc5" strokeWidth="1" />
                <rect x="210" y="200" width="95" height="80" rx="3" fill="#d9d2c7" stroke="#c9c1b5" strokeWidth="1" />
                <rect x="330" y="105" width="85" height="75" rx="3" fill="#ded7cd" stroke="#cfc7bc" strokeWidth="1" />
                <rect x="450" y="120" width="105" height="110" rx="3" fill="#e5e0d8" stroke="#d5cfc5" strokeWidth="1" />

                <rect x="320" y="18" width="55" height="35" rx="3" fill="#e5e0d8" stroke="#d5cfc5" strokeWidth="1" />
                <text x="328" y="34" fontSize="9" fill="#3b82f6" fontWeight="bold">Gedung F</text>

                <text x="380" y="50" fontSize="12" fill="#4b5563" fontWeight="bold" fontStyle="italic">
                  Padang State Polytechnic
                </text>
              </svg>

              {/* Zoom (+ / -) */}
              <div
                style={{
                  position: 'absolute',
                  top: 12,
                  left: 12,
                  background: '#fff',
                  borderRadius: 4,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                  display: 'flex',
                  flexDirection: 'column',
                  zIndex: 10,
                }}
                onClick={e => e.stopPropagation()}
              >
                <button
                  type="button"
                  style={{ width: 28, height: 28, border: 'none', borderBottom: '1px solid #e5e7eb', background: '#fff', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  +
                </button>
                <button
                  type="button"
                  style={{ width: 28, height: 28, border: 'none', background: '#fff', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  –
                </button>
              </div>

              {/* Tombol Lokasi Saya */}
              <div
                style={{ position: 'absolute', top: 12, right: 12, zIndex: 10 }}
                onClick={e => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => {
                    setTambahForm(prev => ({
                      ...prev,
                      lat: '-0.914488',
                      lng: '100.466542',
                    }));
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 12px',
                    background: '#fff',
                    borderRadius: 6,
                    border: '1px solid #d1d5db',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                    color: '#15803d',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <Navigation size={13} />
                  <span>Lokasi Saya</span>
                </button>
              </div>

              {/* Radius Circle */}
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: `${Math.min(Math.max((Number(tambahForm.radius) || 50) * 2.8, 60), 240)}px`,
                  height: `${Math.min(Math.max((Number(tambahForm.radius) || 50) * 2.8, 60), 240)}px`,
                  borderRadius: '50%',
                  background: 'rgba(34, 197, 94, 0.22)',
                  border: '2px solid #16a34a',
                  pointerEvents: 'none',
                  zIndex: 4,
                }}
              />

              {/* Pin Hijau */}
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -100%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  pointerEvents: 'none',
                  zIndex: 5,
                }}
              >
                <div
                  style={{
                    width: 34,
                    height: 42,
                    background: '#15803d',
                    borderRadius: '50% 50% 50% 0',
                    transform: 'rotate(-45deg)',
                    boxShadow: '0 3px 8px rgba(0,0,0,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      background: '#fff',
                      borderRadius: '50%',
                      transform: 'rotate(45deg)',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Bottom Info Bar: KOORDINAT, RADIUS, & Slider */}
            <div
              style={{
                padding: '12px 18px',
                background: '#fff',
                borderTop: '1px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 10,
              }}
            >
              <div>
                <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#9ca3af', fontWeight: 700, letterSpacing: 0.5 }}>
                  KOORDINAT
                </div>
                <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#111827', marginTop: 2, fontFamily: 'monospace' }}>
                  {tambahForm.lat || '-0.914488'}, {tambahForm.lng || '100.466542'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#9ca3af', fontWeight: 700, letterSpacing: 0.5 }}>
                  RADIUS GEOFENCE
                </div>
                <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#15803d', marginTop: 2 }}>
                  {tambahForm.radius || 50} meter
                </div>
              </div>

              {/* Slider Radius */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '12px', color: '#4b5563', fontWeight: 500 }}>Ubah Radius:</span>
                <input
                  type="range"
                  min="20"
                  max="200"
                  step="5"
                  value={tambahForm.radius || 50}
                  onChange={e => setTambahForm(prev => ({ ...prev, radius: Number(e.target.value) }))}
                  style={{
                    accentColor: '#15803d',
                    cursor: 'pointer',
                    width: 100,
                  }}
                />
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#111827', minWidth: 28 }}>
                  {tambahForm.radius || 50}m
                </span>
              </div>
            </div>

            {/* Tombol Batal & Terapkan Sesuai Gambar */}
            <div
              style={{
                padding: '10px 18px 14px',
                background: '#fafafa',
                borderTop: '1px solid #f1f5f9',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 8,
              }}
            >
              <button
                type="button"
                onClick={() => setShowMapPicker(false)}
                style={{
                  padding: '7px 16px',
                  borderRadius: 7,
                  border: '1px solid #d1d5db',
                  background: '#fff',
                  color: '#374151',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => setShowMapPicker(false)}
                style={{
                  padding: '7px 18px',
                  borderRadius: 7,
                  border: 'none',
                  background: '#0f172a',
                  color: '#fff',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Tambah Gedung
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
              <BackButton onClick={() => setDetailData(null)} label="Kembali ke Daftar" />
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
