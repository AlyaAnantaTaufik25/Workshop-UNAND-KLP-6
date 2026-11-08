import { useState } from 'react';
import {
  Search,
  Eye,
  ArrowLeft,
  FileText,
  Upload,
  CheckCircle2,
  X,
  AlertTriangle,
  ArrowRight,
  Clock,
  Check,
  Ban,
  FileCheck2,
  SearchX,
} from 'lucide-react';
import { mitraPerbaikan } from './data';
import UnandLogo from '../../components/UnandLogo';

const statusConfig = {
  menunggu: {
    label: 'Menunggu',
    className: 'mitra-badge mitra-badge-menunggu',
    badgeColor: '#fef3c7',
    textColor: '#92400e',
  },
  diproses: {
    label: 'Sedang Diproses',
    className: 'mitra-badge mitra-badge-diproses',
    badgeColor: '#e0f2fe',
    textColor: '#0369a1',
  },
  selesai: {
    label: 'Selesai',
    className: 'mitra-badge mitra-badge-selesai-proses',
    badgeColor: '#dcfce7',
    textColor: '#15803d',
  },
  ditolak: {
    label: 'Ditolak',
    className: 'mitra-badge mitra-badge-ditolak',
    badgeColor: '#fee2e2',
    textColor: '#b91c1c',
  },
};

export default function PerbaikanSertifikatMitra() {
  const [data, setData] = useState(mitraPerbaikan);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // 3 Tampilan Utama: 'list' (Tampilan 1), 'detail' (Tampilan 2), 'form' (Tampilan 3)
  const [viewMode, setViewMode] = useState('list');
  const [selectedId, setSelectedId] = useState(null);

  // Form Koreksi State (Tampilan 3)
  const [formNama, setFormNama] = useState('');
  const [formNomor, setFormNomor] = useState('');
  const [formKeterangan, setFormKeterangan] = useState('');
  const [formBerkas, setFormBerkas] = useState(null);
  const [formBerkasNama, setFormBerkasNama] = useState('');
  const [perluTtdUlang, setPerluTtdUlang] = useState('ya'); // 'ya' | 'tidak'

  // Modal State
  const [showTolakModal, setShowTolakModal] = useState(false);
  const [alasanTolak, setAlasanTolak] = useState('');
  const [showOldCertModal, setShowOldCertModal] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const selectedItem = data.find(d => d.id === selectedId) || data[0];

  // Hitungan Statistik
  const totalPengajuan = data.length;
  const totalMenunggu = data.filter(d => d.status === 'menunggu').length;
  const totalSelesai = data.filter(d => d.status === 'selesai').length;

  const filtered = data.filter(d => {
    const q = search.toLowerCase();
    const matchSearch =
      d.namaPeserta.toLowerCase().includes(q) ||
      d.namaKegiatan.toLowerCase().includes(q) ||
      d.jenisPerbaikan.toLowerCase().includes(q);
    const matchStatus = filterStatus ? d.status === filterStatus : true;
    return matchSearch && matchStatus;
  });

  // Handler Masuk ke Tampilan 2 (Detail)
  const handleBukaDetail = (item) => {
    setSelectedId(item.id);
    setViewMode('detail');
  };

  // Handler Masuk ke Tampilan 3 (Form Perbaikan) setelah Terima
  const handleTerimaPengajuan = () => {
    setFormNama(selectedItem.usulanNama || selectedItem.namaPeserta);
    setFormNomor(selectedItem.nomorSertifikat);
    setFormKeterangan(`Perbaikan ${selectedItem.bagian || 'nama peserta'} sesuai pengajuan.`);
    setFormBerkas(null);
    setFormBerkasNama(`Sertifikat_${selectedItem.namaPeserta.replace(/\s+/g, '_')}_Revisi.pdf`);
    setPerluTtdUlang('ya');
    setViewMode('form');
  };

  // Handler Simpan Hasil Koreksi Form
  const handleSimpanKoreksi = (e) => {
    e.preventDefault();
    setData(prev =>
      prev.map(d =>
        d.id === selectedItem.id
          ? {
              ...d,
              namaPeserta: formNama,
              status: 'selesai',
              catatanKoreksi: formKeterangan,
              berkasRevisi: formBerkasNama,
              perluTtdUlang,
            }
          : d
      )
    );
    showToast(`Perbaikan sertifikat untuk ${formNama} berhasil disimpan.`);
    setViewMode('list');
  };

  // Handler Konfirmasi Tolak Pengajuan
  const handleConfirmTolak = (e) => {
    e.preventDefault();
    if (!alasanTolak.trim()) return;

    setData(prev =>
      prev.map(d =>
        d.id === selectedItem.id
          ? {
              ...d,
              status: 'ditolak',
              alasanTolak: alasanTolak.trim(),
            }
          : d
      )
    );
    setShowTolakModal(false);
    setAlasanTolak('');
    showToast(`Pengajuan perbaikan sertifikat ${selectedItem.namaPeserta} telah ditolak.`);
    setViewMode('list');
  };

  // =========================================================================
  // TAMPILAN 3: HALAMAN FORM PERBAIKAN SERTIFIKAT
  // =========================================================================
  if (viewMode === 'form' && selectedItem) {
    return (
      <div className="mitra-stack">
        <div>
          <button
            type="button"
            className="mitra-back-btn"
            onClick={() => setViewMode('detail')}
          >
            <ArrowLeft size={16} /> Kembali ke Detail Pengajuan
          </button>
        </div>

        <div className="mitra-intro">
          <h2>Form Perbaikan Sertifikat</h2>
          <p>Perbarui informasi sertifikat berdasarkan pengajuan peserta.</p>
        </div>

        {/* Ringkasan Peserta & Kegiatan */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #E5E7EB',
            borderRadius: 10,
            padding: '16px 22px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <span style={{ fontSize: 12, color: '#6B7280', textTransform: 'uppercase', fontWeight: 600 }}>
              Peserta:
            </span>
            <strong style={{ fontSize: 15, color: '#111827', marginLeft: 8 }}>
              {selectedItem.namaPeserta}
            </strong>
          </div>
          <div>
            <span style={{ fontSize: 12, color: '#6B7280', textTransform: 'uppercase', fontWeight: 600 }}>
              Kegiatan:
            </span>
            <span style={{ fontSize: 14, color: '#374151', marginLeft: 8, fontWeight: 600 }}>
              {selectedItem.namaKegiatan}
            </span>
          </div>
        </div>

        {/* Form Koreksi */}
        <form onSubmit={handleSimpanKoreksi}>
          <div className="mitra-profil-container">
            {/* Bagian: Data Sertifikat */}
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: '0 0 4px 0' }}>
                Data Sertifikat
              </h3>
              <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>
                Koreksi informasi sertifikat yang sesuai dengan permohonan peserta.
              </p>
            </div>

            <div className="mitra-profil-grid">
              {/* Nama Peserta */}
              <div className="mitra-profil-field">
                <label>
                  Nama Peserta <span className="req">*</span>
                </label>
                <input
                  type="text"
                  value={formNama}
                  onChange={e => setFormNama(e.target.value)}
                  required
                  className="mitra-profil-input"
                />
                <span style={{ fontSize: 12, color: '#15803d', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Check size={14} /> Data telah diperbaiki sesuai permintaan.
                </span>
              </div>

              {/* Nomor Sertifikat */}
              <div className="mitra-profil-field">
                <label>Nomor Sertifikat</label>
                <input
                  type="text"
                  value={formNomor}
                  readOnly
                  className="mitra-profil-input mitra-profil-input--readonly"
                  style={{ fontFamily: 'monospace' }}
                />
              </div>
            </div>

            {/* Keterangan Perbaikan */}
            <div className="mitra-profil-field" style={{ marginTop: 18 }}>
              <label>Keterangan Perbaikan</label>
              <textarea
                rows={3}
                value={formKeterangan}
                onChange={e => setFormKeterangan(e.target.value)}
                className="mitra-profil-input"
                style={{ height: 'auto', padding: '10px 14px', resize: 'vertical' }}
              />
            </div>

            <div className="mitra-profil-divider" style={{ margin: '26px 0 22px 0' }} />

            {/* Bagian: Dokumen Sertifikat */}
            <div style={{ marginBottom: 14 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: '0 0 4px 0' }}>
                Dokumen Sertifikat
              </h3>
              <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>
                Sertifikat versi terbaru · Unggah dokumen PDF hasil perbaikan.
              </p>
            </div>

            <label
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px 20px',
                border: formBerkasNama ? '1.5px solid #14532d' : '1.5px dashed #D1D5DB',
                borderRadius: 10,
                background: formBerkasNama ? '#F0FDF4' : '#F9FAFB',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.15s',
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: formBerkasNama ? '#DCFCE7' : '#EBF5EE',
                  color: '#14532d',
                  display: 'grid',
                  placeItems: 'center',
                  marginBottom: 10,
                }}
              >
                {formBerkasNama ? <CheckCircle2 size={24} /> : <Upload size={22} />}
              </div>
              <strong style={{ fontSize: 13.5, color: '#111827' }}>
                {formBerkasNama ? formBerkasNama : 'Unggah PDF'}
              </strong>
              <p style={{ fontSize: 12, color: formBerkasNama ? '#15803d' : '#6B7280', margin: '3px 0 0 0' }}>
                {formBerkasNama
                  ? 'Berkas PDF hasil perbaikan siap disimpan · Klik untuk mengganti'
                  : 'Klik untuk memilih berkas dokumen PDF hasil koreksi (Maks. 10 MB)'}
              </p>
              <input
                type="file"
                accept=".pdf"
                style={{ display: 'none' }}
                onChange={e => {
                  const f = e.target.files?.[0];
                  if (f) {
                    setFormBerkas(f);
                    setFormBerkasNama(f.name);
                  }
                }}
              />
            </label>

            <div className="mitra-profil-divider" style={{ margin: '26px 0 22px 0' }} />

            {/* Bagian: Tanda Tangan Ulang */}
            <div style={{ marginBottom: 14 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: '0 0 4px 0' }}>
                Tanda Tangan Ulang
              </h3>
              <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>
                Tentukan apakah sertifikat memerlukan tanda tangan ulang.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '14px 18px',
                  borderRadius: 8,
                  border: perluTtdUlang === 'ya' ? '1.5px solid #14532d' : '1px solid #E5E7EB',
                  background: perluTtdUlang === 'ya' ? '#F0FDF4' : '#FFFFFF',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                <input
                  type="radio"
                  name="ttd_ulang"
                  value="ya"
                  checked={perluTtdUlang === 'ya'}
                  onChange={() => setPerluTtdUlang('ya')}
                  style={{ accentColor: '#14532d', width: 18, height: 18 }}
                />
                <div>
                  <strong style={{ display: 'block', fontSize: 13.5, color: '#111827' }}>
                    Ya, perlu tanda tangan ulang
                  </strong>
                  <span style={{ fontSize: 12, color: '#6B7280' }}>
                    Sertifikat akan dikirimkan ke antrean TTE pimpinan mitra.
                  </span>
                </div>
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '14px 18px',
                  borderRadius: 8,
                  border: perluTtdUlang === 'tidak' ? '1.5px solid #14532d' : '1px solid #E5E7EB',
                  background: perluTtdUlang === 'tidak' ? '#F0FDF4' : '#FFFFFF',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                <input
                  type="radio"
                  name="ttd_ulang"
                  value="tidak"
                  checked={perluTtdUlang === 'tidak'}
                  onChange={() => setPerluTtdUlang('tidak')}
                  style={{ accentColor: '#14532d', width: 18, height: 18 }}
                />
                <div>
                  <strong style={{ display: 'block', fontSize: 13.5, color: '#111827' }}>
                    Tidak perlu tanda tangan ulang
                  </strong>
                  <span style={{ fontSize: 12, color: '#6B7280' }}>
                    Hanya pembaruan metadata tanpa perombakan tanda tangan.
                  </span>
                </div>
              </label>
            </div>

            <div className="mitra-profil-divider" style={{ marginTop: 32 }} />

            {/* Tombol Aksi */}
            <div className="mitra-profil-actions">
              <button
                type="button"
                className="mitra-profil-btn-batal"
                onClick={() => setViewMode('detail')}
              >
                Batal
              </button>
              <button
                type="submit"
                className="mitra-profil-btn-simpan"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}
              >
                <Check size={16} /> Simpan Hasil Perbaikan
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  }

  // =========================================================================
  // TAMPILAN 2: HALAMAN DETAIL PERBAIKAN SERTIFIKAT
  // =========================================================================
  if (viewMode === 'detail' && selectedItem) {
    const cfg = statusConfig[selectedItem.status] ?? statusConfig.menunggu;

    return (
      <div className="mitra-stack">
        <div>
          <button
            type="button"
            className="mitra-back-btn"
            onClick={() => setViewMode('list')}
          >
            <ArrowLeft size={16} /> Kembali ke Daftar Pengajuan
          </button>
        </div>

        <div className="mitra-list-header">
          <div className="mitra-intro">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <h2 style={{ margin: 0 }}>Detail Pengajuan</h2>
              <span className={cfg.className}>{cfg.label}</span>
            </div>
            <p>Informasi permintaan perbaikan sertifikat peserta.</p>
          </div>
        </div>

        {/* 1. INFORMASI PESERTA DAN KEGIATAN */}
        <div className="mitra-profil-container" style={{ padding: '24px 28px' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: '0 0 16px 0' }}>
            Informasi Peserta
          </h3>
          <div className="mitra-profil-grid">
            <div className="mitra-profil-field">
              <label>Nama</label>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', padding: '10px 0' }}>
                {selectedItem.namaPeserta}
              </div>
            </div>

            <div className="mitra-profil-field">
              <label>Email</label>
              <div style={{ fontSize: 14, color: '#374151', padding: '10px 0' }}>
                {selectedItem.email}
              </div>
            </div>

            <div className="mitra-profil-field">
              <label>Kegiatan</label>
              <div style={{ fontSize: 14, color: '#14532d', fontWeight: 600, padding: '10px 0' }}>
                {selectedItem.namaKegiatan}
              </div>
            </div>

            <div className="mitra-profil-field">
              <label>Nomor Sertifikat</label>
              <div style={{ fontSize: 13, fontFamily: 'monospace', color: '#374151', padding: '10px 0' }}>
                {selectedItem.nomorSertifikat}
              </div>
            </div>
          </div>
        </div>

        {/* 2. INFORMASI PENGAJUAN PERBAIKAN */}
        <div className="mitra-profil-container" style={{ padding: '24px 28px' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: '0 0 16px 0' }}>
            Keterangan Perbaikan
          </h3>

          <div className="mitra-profil-grid" style={{ marginBottom: 18 }}>
            <div className="mitra-profil-field">
              <label>Bagian yang salah</label>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', padding: '6px 0' }}>
                {selectedItem.bagian || selectedItem.jenisPerbaikan}
              </div>
            </div>

            <div className="mitra-profil-field">
              <label>Tanggal Pengajuan</label>
              <div style={{ fontSize: 14, color: '#374151', padding: '6px 0' }}>
                {selectedItem.tanggalPengajuan}
              </div>
            </div>
          </div>

          <div className="mitra-profil-field" style={{ marginBottom: 20 }}>
            <label>Keterangan peserta</label>
            <div
              style={{
                background: '#F9FAFB',
                border: '1px solid #E5E7EB',
                borderRadius: 8,
                padding: '12px 16px',
                fontSize: 13.5,
                color: '#374151',
                lineHeight: 1.6,
              }}
            >
              {selectedItem.catatan}
            </div>
          </div>

          {/* Sertifikat Sebelumnya */}
          <div>
            <label style={{ fontSize: 13.5, fontWeight: 600, color: '#111827', display: 'block', marginBottom: 8 }}>
              Sertifikat Sebelumnya
            </label>
            <div
              style={{
                border: '1px solid #E5E7EB',
                borderRadius: 8,
                padding: '14px 18px',
                background: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16,
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 8,
                    background: '#FEE2E2',
                    color: '#DC2626',
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  <FileText size={20} />
                </div>
                <div>
                  <strong style={{ fontSize: 13.5, color: '#111827', display: 'block' }}>
                    Sertifikat_{selectedItem.namaPeserta.replace(/\s+/g, '_')}.pdf
                  </strong>
                  <span style={{ fontSize: 12, color: '#6B7280' }}>
                    Dokumen sertifikat yang perlu diperbaiki
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="mitra-btn mitra-btn--secondary"
                onClick={() => setShowOldCertModal(true)}
                style={{ padding: '7px 14px', fontSize: 13 }}
              >
                <Eye size={14} /> Lihat Sertifikat
              </button>
            </div>
          </div>
        </div>

        {/* 3. TINDAKAN MITRA */}
        <div
          className="mitra-profil-container"
          style={{
            padding: '20px 28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div>
            <strong style={{ fontSize: 14, color: '#111827', display: 'block' }}>
              Tindakan Peninjauan Mitra
            </strong>
            <span style={{ fontSize: 12.5, color: '#6B7280' }}>
              Tolak jika alasan tidak valid, atau terima pengajuan untuk membuka formulir perbaikan.
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {selectedItem.status === 'menunggu' ? (
              <>
                <button
                  type="button"
                  onClick={() => setShowTolakModal(true)}
                  style={{
                    height: 40,
                    padding: '0 20px',
                    borderRadius: 8,
                    border: '1px solid #DC2626',
                    background: '#FFFFFF',
                    color: '#DC2626',
                    fontSize: 13.5,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  Tolak
                </button>
                <button
                  type="button"
                  onClick={handleTerimaPengajuan}
                  style={{
                    height: 40,
                    padding: '0 24px',
                    borderRadius: 8,
                    border: 'none',
                    background: '#14532d',
                    color: '#FFFFFF',
                    fontSize: 13.5,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  Terima
                </button>
              </>
            ) : selectedItem.status === 'selesai' ? (
              <span style={{ fontSize: 13, color: '#15803d', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle2 size={16} /> Pengajuan telah selesai diperbaiki
              </span>
            ) : selectedItem.status === 'ditolak' ? (
              <span style={{ fontSize: 13, color: '#DC2626', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Ban size={16} /> Pengajuan ditolak ({selectedItem.alasanTolak || 'Alasan tidak memenuhi syarat'})
              </span>
            ) : (
              <button
                type="button"
                onClick={handleTerimaPengajuan}
                className="mitra-btn"
              >
                Lanjutkan Perbaikan
              </button>
            )}
          </div>
        </div>

        {/* Modal Alasan Penolakan */}
        {showTolakModal && (
          <div
            className="modal-overlay"
            onClick={() => setShowTolakModal(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(15, 23, 42, 0.55)',
              backdropFilter: 'blur(3px)',
              display: 'grid',
              placeItems: 'center',
              zIndex: 1050,
              padding: 16,
            }}
          >
            <div
              className="modal-box"
              style={{
                maxWidth: 460,
                width: '100%',
                background: '#FFFFFF',
                borderRadius: 12,
                overflow: 'hidden',
                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15)',
              }}
              onClick={e => e.stopPropagation()}
            >
              <form onSubmit={handleConfirmTolak}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#111827' }}>
                    Tolak Pengajuan Perbaikan
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowTolakModal(false)}
                    style={{ background: 'transparent', border: 'none', color: '#9CA3AF', cursor: 'pointer' }}
                  >
                    <X size={18} />
                  </button>
                </div>
                <div style={{ padding: '20px 24px' }}>
                  <p style={{ fontSize: 13, color: '#4B5563', margin: '0 0 12px 0' }}>
                    Masukkan alasan penolakan agar peserta memahami mengapa permintaannya tidak dapat diterima:
                  </p>
                  <textarea
                    rows={4}
                    value={alasanTolak}
                    onChange={e => setAlasanTolak(e.target.value)}
                    placeholder="Contoh: Nama pada sertifikat sudah sesuai dengan KTP dan data pendaftaran awal."
                    required
                    className="mitra-profil-input"
                    style={{ height: 'auto', padding: '10px 12px', resize: 'vertical' }}
                  />
                </div>
                <div style={{ padding: '14px 24px', background: '#F8FAFC', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => setShowTolakModal(false)}
                    className="mitra-profil-btn-batal"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    style={{
                      height: 40,
                      padding: '0 20px',
                      borderRadius: 8,
                      border: 'none',
                      background: '#DC2626',
                      color: '#FFFFFF',
                      fontSize: 13.5,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Konfirmasi Tolak
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Pratinjau Sertifikat Lama */}
        {showOldCertModal && (
          <div
            className="modal-overlay"
            onClick={() => setShowOldCertModal(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(15, 23, 42, 0.55)',
              backdropFilter: 'blur(3px)',
              display: 'grid',
              placeItems: 'center',
              zIndex: 1050,
              padding: 16,
            }}
          >
            <div
              className="modal-box"
              style={{
                maxWidth: 620,
                width: '100%',
                background: '#FFFFFF',
                borderRadius: 12,
                overflow: 'hidden',
              }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ padding: '18px 24px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#111827' }}>
                  Pratinjau Sertifikat Sebelum Diperbaiki
                </h3>
                <button
                  type="button"
                  onClick={() => setShowOldCertModal(false)}
                  style={{ background: 'transparent', border: 'none', color: '#9CA3AF', cursor: 'pointer' }}
                >
                  <X size={18} />
                </button>
              </div>
              <div style={{ padding: '24px' }}>
                <div className="cert-preview-wrapper" style={{ margin: 0 }}>
                  <div className="cert-preview-box">
                    <div className="cert-logo-row">
                      <UnandLogo style={{ width: 36, height: 36 }} />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--green-800)' }}>PT SEMEN PADANG</div>
                        <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>Pratinjau Sertifikat Terbit Awal</div>
                      </div>
                    </div>
                    <div className="cert-divider" />
                    <div className="cert-label-sertifikat">SERTIFIKAT</div>
                    <div className="cert-diberikan">Diberikan kepada</div>
                    <div className="cert-nama" style={{ color: '#DC2626' }}>
                      {selectedItem.namaPeserta}
                    </div>
                    <div className="cert-atas">atas partisipasinya sebagai peserta dalam</div>
                    <div className="cert-kegiatan">{selectedItem.namaKegiatan}</div>
                    <div className="cert-tanggal">{selectedItem.tanggalKegiatan} · PT Semen Padang</div>
                    <div className="cert-ttd-row">
                      <div className="cert-ttd">
                        <div className="cert-ttd-line" />
                        <div className="cert-ttd-title">Rektor UNAND</div>
                      </div>
                      <div className="cert-ttd">
                        <div className="cert-ttd-line" />
                        <div className="cert-ttd-title">Pimpinan Mitra</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ padding: '14px 24px', background: '#F8FAFC', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="mitra-profil-btn-batal"
                  onClick={() => setShowOldCertModal(false)}
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // TAMPILAN 1: HALAMAN DAFTAR PERBAIKAN SERTIFIKAT (DEFAULT)
  // =========================================================================
  return (
    <div className="mitra-stack">
      {/* Toast Notification */}
      {toastMsg && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1000,
            background: '#14532d',
            color: '#fff',
            padding: '12px 20px',
            borderRadius: 8,
            boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          <Check size={16} /> {toastMsg}
        </div>
      )}

      {/* Header Halaman */}
      <div className="mitra-list-header">
        <div className="mitra-intro">
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--mitra-green)', letterSpacing: '0.6px', textTransform: 'uppercase' }}>
            Mitra
          </span>
          <h2 style={{ margin: '2px 0 4px 0' }}>Perbaikan Sertifikat</h2>
          <p>Kelola dan tindak lanjuti pengajuan perbaikan sertifikat.</p>
        </div>
      </div>

      {/* Ringkasan Jumlah Pengajuan (Cards dengan Ikon Formal) */}
      <div className="mitra-stats-grid">
        <div className="mitra-stat-box">
          <div className="mitra-stat-top">
            <p className="mitra-stat-title">Total Pengajuan</p>
            <div className="mitra-stat-icon" style={{ background: '#EBF5EE', color: '#14532d' }}>
              <FileText size={18} />
            </div>
          </div>
          <p className="mitra-stat-val">{String(totalPengajuan).padStart(2, '0')}</p>
        </div>

        <div className="mitra-stat-box">
          <div className="mitra-stat-top">
            <p className="mitra-stat-title">Menunggu</p>
            <div className="mitra-stat-icon" style={{ background: '#FEF3C7', color: '#B45309' }}>
              <Clock size={18} />
            </div>
          </div>
          <p className="mitra-stat-val" style={{ color: '#b45309' }}>{String(totalMenunggu).padStart(2, '0')}</p>
        </div>

        <div className="mitra-stat-box">
          <div className="mitra-stat-top">
            <p className="mitra-stat-title">Selesai</p>
            <div className="mitra-stat-icon" style={{ background: '#DCFCE7', color: '#15803d' }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <p className="mitra-stat-val" style={{ color: '#15803d' }}>{String(totalSelesai).padStart(2, '0')}</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="mitra-filterbar">
        <label className="mitra-searchbox">
          <Search size={18} />
          <input
            type="search"
            placeholder="Cari nama peserta atau kegiatan..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </label>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">Semua status</option>
          <option value="menunggu">Menunggu</option>
          <option value="diproses">Sedang Diproses</option>
          <option value="selesai">Selesai</option>
          <option value="ditolak">Ditolak</option>
        </select>
      </div>

      {/* Tabel Pengajuan */}
      <div className="mitra-table-card">
        <table className="mitra-table">
          <thead>
            <tr>
              <th style={{ width: 45, textAlign: 'center' }}>No.</th>
              <th>Nama Peserta</th>
              <th>Kegiatan</th>
              <th>Tanggal Pengajuan</th>
              <th>Jenis Kesalahan</th>
              <th style={{ textAlign: 'center' }}>Status</th>
              <th style={{ textAlign: 'center', width: 140 }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <div className="mitra-empty">
                    <SearchX size={36} />
                    <p>Tidak ada pengajuan perbaikan yang cocok dengan pencarian.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((item, idx) => {
                const cfg = statusConfig[item.status] ?? statusConfig.menunggu;
                return (
                  <tr key={item.id}>
                    {/* No. */}
                    <td style={{ textAlign: 'center', color: '#6B7280', fontSize: 13 }}>
                      {idx + 1}
                    </td>

                    {/* Nama Peserta */}
                    <td>
                      <strong
                        className="mitra-activity-title"
                        onClick={() => handleBukaDetail(item)}
                      >
                        {item.namaPeserta}
                      </strong>
                    </td>

                    {/* Kegiatan */}
                    <td style={{ fontSize: 13.5 }}>
                      {item.namaKegiatan}
                    </td>

                    {/* Tanggal Pengajuan */}
                    <td style={{ fontSize: 13, color: '#4B5563', whiteSpace: 'nowrap' }}>
                      {item.tanggalPengajuan}
                    </td>

                    {/* Jenis Kesalahan */}
                    <td style={{ fontSize: 13 }}>
                      <span style={{ padding: '3px 8px', borderRadius: 4, background: '#F3F4F6', color: '#374151' }}>
                        {item.jenisPerbaikan}
                      </span>
                    </td>

                    {/* Status */}
                    <td style={{ textAlign: 'center' }}>
                      <span className={cfg.className}>
                        <i></i> {cfg.label}
                      </span>
                    </td>

                    {/* Aksi: Lihat Detail */}
                    <td style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => handleBukaDetail(item)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          background: 'transparent',
                          border: 'none',
                          color: '#14532d',
                          fontWeight: 600,
                          fontSize: 13,
                          cursor: 'pointer',
                          padding: '6px 10px',
                          borderRadius: 6,
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#EBF5EE')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        Lihat Detail <ArrowRight size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
