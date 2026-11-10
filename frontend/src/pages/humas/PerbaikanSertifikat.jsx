import { useState } from 'react';
import { Search, Bell, Eye } from 'lucide-react';

const initialData = [
  {
    id: 1,
    namaPeserta: 'Nadia Amelia',
    namaKegiatan: 'Workshop Penulisan Artikel Ilmiah UNAND',
    kegiatanSingkat: 'Workshop Penulisan Artikel Ilmiah',
    nomorSertifikat: 'UNAND/SERT/1004/2026',
    jenisPerbaikan: 'Nama Peserta',
    tanggalPengajuan: '17 Mei 2026, 10:15',
    status: 'diproses',
    catatan: 'Nama pada sertifikat tertulis Nadia Amelia, seharusnya Nadia Amelia Putri.',
    detail: {
      jenisKegiatan: 'Workshop',
      tanggalKegiatan: '15/4/2026',
      penerbit: 'UNAND',
    },
  },
];

const statusConfig = {
  menunggu: { label: 'Menunggu Pemeriksaan', className: 'humas-badge humas-badge-draft' },
  diproses: { label: 'Sedang Diproses', className: 'humas-badge humas-badge-berlangsung' },
  selesai:  { label: 'Selesai', className: 'humas-badge humas-badge-publik' },
  ditolak:  { label: 'Ditolak', className: 'humas-badge humas-badge-selesai' },
};

export default function PerbaikanSertifikat() {
  const [data, setData] = useState(initialData);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Mode: 'list' | 'detail' | 'koreksi'
  const [mode, setMode] = useState('list');
  const [selectedItem, setSelectedItem] = useState(initialData[0]);

  // State untuk form koreksi
  const [koreksiForm, setKoreksiForm] = useState({
    namaPeserta: 'Nadia Amelia',
    informasiKegiatan: 'Workshop Penulisan Artikel Ilmiah',
    informasiLainnya: '',
  });

  const filtered = data.filter(d => {
    const q = search.toLowerCase();
    const matchSearch =
      d.namaPeserta.toLowerCase().includes(q) ||
      d.namaKegiatan.toLowerCase().includes(q) ||
      d.nomorSertifikat.toLowerCase().includes(q);
    const matchStatus = filterStatus ? d.status === filterStatus : true;
    return matchSearch && matchStatus;
  });

  const handleOpenDetail = item => {
    setSelectedItem(item);
    setMode('detail');
  };

  const handleOpenKoreksi = () => {
    setKoreksiForm({
      namaPeserta: selectedItem.namaPeserta,
      informasiKegiatan: selectedItem.kegiatanSingkat || selectedItem.namaKegiatan,
      informasiLainnya: '',
    });
    setMode('koreksi');
  };

  const handleSimpanKoreksi = () => {
    setData(prev =>
      prev.map(item => {
        if (item.id === selectedItem.id) {
          return {
            ...item,
            namaPeserta: koreksiForm.namaPeserta,
            kegiatanSingkat: koreksiForm.informasiKegiatan,
            status: 'selesai',
          };
        }
        return item;
      })
    );
    setSelectedItem(prev => ({
      ...prev,
      namaPeserta: koreksiForm.namaPeserta,
      kegiatanSingkat: koreksiForm.informasiKegiatan,
      status: 'selesai',
    }));
    setMode('detail');
  };

  const handleTolak = () => {
    setData(prev =>
      prev.map(item =>
        item.id === selectedItem.id ? { ...item, status: 'ditolak' } : item
      )
    );
    setSelectedItem(prev => ({ ...prev, status: 'ditolak' }));
    setMode('list');
  };

  // Komponen Kanvas Sertifikat
  const renderCertificateCanvas = (namaText, kegiatanText) => (
    <div
      style={{
        border: '1.5px solid #14532d',
        padding: '4px',
        borderRadius: '2px',
        background: '#ffffff',
        width: '100%',
        maxWidth: '540px',
      }}
    >
      <div
        style={{
          border: '1.5px solid #14532d',
          padding: '36px 28px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          background: '#ffffff',
        }}
      >
        {/* Logo UNAND */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '20px',
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 6,
              background: '#14532d',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '17px',
              fontFamily: 'serif',
            }}
          >
            U
          </div>
          <div style={{ textAlign: 'left' }}>
            <div
              style={{
                fontSize: '12.5px',
                fontWeight: '800',
                color: '#14532d',
                letterSpacing: '0.04em',
                lineHeight: '1.2',
              }}
            >
              UNIVERSITAS ANDALAS
            </div>
            <div style={{ fontSize: '9.5px', color: '#6b7280', marginTop: '2px' }}>
              Dokumen resmi
            </div>
          </div>
        </div>

        {/* SERTIFIKAT */}
        <div
          style={{
            fontSize: '12.5px',
            fontWeight: '800',
            color: '#14532d',
            letterSpacing: '0.22em',
            marginBottom: '12px',
          }}
        >
          SERTIFIKAT
        </div>

        {/* Diberikan kepada */}
        <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '8px' }}>
          Diberikan kepada
        </div>

        {/* NAMA PESERTA */}
        <div
          style={{
            fontFamily: 'serif',
            fontSize: '22px',
            fontWeight: '600',
            color: '#14532d',
            letterSpacing: '0.04em',
            borderBottom: '1.5px solid #14532d',
            paddingBottom: '4px',
            minWidth: '240px',
            marginBottom: '14px',
          }}
        >
          {namaText ? namaText.toUpperCase() : 'NADIA AMELIA'}
        </div>

        {/* Atas partisipasinya */}
        <div style={{ fontSize: '10.5px', color: '#6b7280', marginBottom: '6px' }}>
          atas partisipasinya sebagai peserta dalam
        </div>

        {/* Nama Kegiatan */}
        <div
          style={{
            fontFamily: 'serif',
            fontSize: '15.5px',
            fontWeight: '700',
            color: '#14532d',
            marginBottom: '4px',
          }}
        >
          {kegiatanText || 'Workshop Penulisan Artikel Ilmiah'}
        </div>

        {/* Tanggal & Lokasi */}
        <div style={{ fontSize: '10px', color: '#4b5563', marginBottom: '36px' }}>
          15 April 2026 · Universitas Andalas
        </div>

        {/* Tanda Tangan */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            width: '100%',
            maxWidth: '380px',
            padding: '0 10px',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '120px' }}>
            <div style={{ width: '100%', height: '1px', background: '#374151', marginBottom: '6px' }} />
            <div style={{ fontSize: '10.5px', fontWeight: '700', color: '#111827' }}>Rektor UNAND</div>
            <div style={{ fontSize: '9px', color: '#9ca3af', marginTop: '2px' }}>Tahap selesai</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '120px' }}>
            <div style={{ width: '100%', height: '1px', background: '#374151', marginBottom: '6px' }} />
            <div style={{ fontSize: '10.5px', fontWeight: '700', color: '#111827' }}>Pimpinan Mitra</div>
            <div style={{ fontSize: '9px', color: '#9ca3af', marginTop: '2px' }}>Tahap selesai</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="humas-list-page">
      {/* ────────────────────────────────────────────────────────── */}
      {/* 1. LIST VIEW                                               */}
      {/* ────────────────────────────────────────────────────────── */}
      {mode === 'list' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
            <button className="humas-notif-btn">
              <Bell size={15} /> Notifikasi perbaikan (1)
            </button>
          </div>

          <div>
            <p
              style={{
                fontSize: '11px',
                fontWeight: '700',
                color: '#166534',
                letterSpacing: '0.05em',
                marginBottom: '4px',
              }}
            >
              KOREKSI OLEH PENERBIT
            </p>
            <h2 className="humas-section-title">Perbaikan Sertifikat</h2>
            <p className="humas-section-sub">
              Periksa pengajuan dan lanjutkan dokumen pengganti sesuai alur penerbitan.
            </p>
          </div>



          {/* Filter Bar */}
          <div className="filter-bar" style={{ marginBottom: 16 }}>
            <div className="search-wrap" style={{ flex: 1 }}>
              <Search size={15} className="search-icon" />
              <input
                className="search-input"
                placeholder="Cari peserta, kegiatan, nom..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select
              className="filter-select"
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
            >
              <option value="">Semua status</option>
              <option value="diproses">Sedang Diproses</option>
              <option value="menunggu">Menunggu Pemeriksaan</option>
              <option value="selesai">Selesai</option>
              <option value="ditolak">Ditolak</option>
            </select>
          </div>

          {/* Data Table */}
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>NAMA PESERTA</th>
                  <th>NAMA KEGIATAN</th>
                  <th>NOMOR SERTIFIKAT</th>
                  <th>JENIS PERBAIKAN</th>
                  <th>TANGGAL PENGAJUAN</th>
                  <th>STATUS</th>
                  <th>AKSI</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', color: '#9ca3af', padding: '32px' }}>
                      Tidak ada pengajuan perbaikan sertifikat.
                    </td>
                  </tr>
                ) : (
                  filtered.map(d => {
                    const cfg = statusConfig[d.status] ?? statusConfig.diproses;
                    return (
                      <tr key={d.id}>
                        <td>
                          <span className="table-name-bold">{d.namaPeserta}</span>
                        </td>
                        <td>
                          <div style={{ maxWidth: 260, lineHeight: '1.35' }}>
                            <span>{d.namaKegiatan}</span>
                          </div>
                        </td>
                        <td>{d.nomorSertifikat}</td>
                        <td>{d.jenisPerbaikan}</td>
                        <td style={{ whiteSpace: 'nowrap' }}>{d.tanggalPengajuan}</td>
                        <td>
                          <span className={cfg.className}>● {cfg.label}</span>
                        </td>
                        <td>
                          <div className="humas-tindakan-group">
                            <button
                              type="button"
                              className="humas-tindakan-btn humas-tindakan-view"
                              onClick={() => handleOpenDetail(d)}
                            >
                              <Eye size={12} /> Detail
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* 2. DETAIL VIEW                                             */}
      {/* ────────────────────────────────────────────────────────── */}
      {mode === 'detail' && selectedItem && (
        <>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: 16,
            }}
          >
            <div>
              <p
                style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  color: '#166534',
                  letterSpacing: '0.05em',
                  marginBottom: '4px',
                }}
              >
                KOREKSI OLEH PENERBIT
              </p>
              <h2 className="humas-section-title">Detail Pengajuan Perbaikan</h2>
              <p className="humas-section-sub">
                Periksa pengajuan dan lanjutkan dokumen pengganti sesuai alur penerbitan.
              </p>
            </div>
            <button
              type="button"
              style={{
                background: '#ffffff',
                border: '1px solid #d1d5db',
                color: '#374151',
                padding: '8px 18px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
              onClick={() => setMode('list')}
            >
              Kembali ke Daftar
            </button>
          </div>



          {/* Card Info Pengajuan */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '20px 24px',
              marginBottom: '20px',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', fontSize: '13px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '9px 0',
                  borderBottom: '1px solid #f1f5f9',
                }}
              >
                <span style={{ color: '#4b5563' }}>Nama peserta</span>
                <span style={{ color: '#111827', fontWeight: '500' }}>{selectedItem.namaPeserta}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '9px 0',
                  borderBottom: '1px solid #f1f5f9',
                }}
              >
                <span style={{ color: '#4b5563' }}>Nama kegiatan</span>
                <span style={{ color: '#111827', fontWeight: '500' }}>
                  {selectedItem.kegiatanSingkat || selectedItem.namaKegiatan}
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '9px 0',
                  borderBottom: '1px solid #f1f5f9',
                }}
              >
                <span style={{ color: '#4b5563' }}>Jenis kegiatan</span>
                <span style={{ color: '#111827', fontWeight: '500' }}>
                  {selectedItem.detail?.jenisKegiatan || 'Workshop'}
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '9px 0',
                  borderBottom: '1px solid #f1f5f9',
                }}
              >
                <span style={{ color: '#4b5563' }}>Nomor sertifikat</span>
                <span style={{ color: '#111827', fontWeight: '500' }}>
                  {selectedItem.nomorSertifikat}
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '9px 0',
                  borderBottom: '1px solid #f1f5f9',
                }}
              >
                <span style={{ color: '#4b5563' }}>Tanggal kegiatan</span>
                <span style={{ color: '#111827', fontWeight: '500' }}>
                  {selectedItem.detail?.tanggalKegiatan || '15/4/2026'}
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '9px 0',
                  borderBottom: '1px solid #f1f5f9',
                }}
              >
                <span style={{ color: '#4b5563' }}>Penerbit sertifikat</span>
                <span style={{ color: '#111827', fontWeight: '500' }}>
                  {selectedItem.detail?.penerbit || 'UNAND'}
                </span>
              </div>
            </div>

            {/* Issue Section */}
            <div style={{ marginTop: '16px' }}>
              <span className={statusConfig[selectedItem.status]?.className || 'humas-badge'}>
                ● {statusConfig[selectedItem.status]?.label || 'Sedang Diproses'}
              </span>
              <div
                style={{
                  fontSize: '13.5px',
                  fontWeight: '700',
                  color: '#111827',
                  marginTop: '8px',
                }}
              >
                {selectedItem.jenisPerbaikan}
              </div>
              <p style={{ fontSize: '13px', color: '#4b5563', marginTop: '4px', lineHeight: '1.45' }}>
                {selectedItem.catatan}
              </p>
            </div>
          </div>

          {/* Card Pratinjau Sertifikat */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              overflow: 'hidden',
              marginBottom: '20px',
            }}
          >
            <div
              style={{
                padding: '12px 18px',
                borderBottom: '1px solid #e5e7eb',
                fontSize: '12px',
                color: '#6b7280',
                background: '#ffffff',
              }}
            >
              Pratinjau sertifikat
            </div>
            <div
              style={{
                background: '#edf2ee',
                padding: '36px 20px',
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              {renderCertificateCanvas(
                selectedItem.namaPeserta,
                selectedItem.kegiatanSingkat || selectedItem.namaKegiatan
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <button
              type="button"
              style={{
                background: '#14532d',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '10px 22px',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
              }}
              onClick={handleOpenKoreksi}
            >
              Proses Perbaikan
            </button>
            <button
              type="button"
              style={{
                background: '#ffffff',
                color: '#14532d',
                border: '1px solid #14532d',
                borderRadius: '6px',
                padding: '10px 22px',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
              }}
              onClick={handleTolak}
            >
              Tolak Pengajuan
            </button>
          </div>
        </>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* 3. KOREKSI VIEW / PROSES PERBAIKAN                         */}
      {/* ────────────────────────────────────────────────────────── */}
      {mode === 'koreksi' && selectedItem && (
        <>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: 16,
            }}
          >
            <div>
              <p
                style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  color: '#166534',
                  letterSpacing: '0.05em',
                  marginBottom: '4px',
                }}
              >
                KOREKSI OLEH PENERBIT
              </p>
              <h2 className="humas-section-title">Koreksi Sertifikat</h2>
              <p className="humas-section-sub">
                Periksa pengajuan dan lanjutkan dokumen pengganti sesuai alur penerbitan.
              </p>
            </div>
            <button
              type="button"
              style={{
                background: '#ffffff',
                border: '1px solid #d1d5db',
                color: '#374151',
                padding: '8px 18px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
              onClick={() => setMode('list')}
            >
              Kembali ke Daftar
            </button>
          </div>



          {/* Card Atas: Ringkasan Pengajuan */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '20px 24px',
              marginBottom: '20px',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', fontSize: '13px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '9px 0',
                  borderBottom: '1px solid #f1f5f9',
                }}
              >
                <span style={{ color: '#4b5563' }}>Nama peserta</span>
                <span style={{ color: '#111827', fontWeight: '500' }}>{selectedItem.namaPeserta}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '9px 0',
                  borderBottom: '1px solid #f1f5f9',
                }}
              >
                <span style={{ color: '#4b5563' }}>Nama kegiatan</span>
                <span style={{ color: '#111827', fontWeight: '500' }}>
                  {selectedItem.kegiatanSingkat || selectedItem.namaKegiatan}
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '9px 0',
                  borderBottom: '1px solid #f1f5f9',
                }}
              >
                <span style={{ color: '#4b5563' }}>Jenis kegiatan</span>
                <span style={{ color: '#111827', fontWeight: '500' }}>
                  {selectedItem.detail?.jenisKegiatan || 'Workshop'}
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '9px 0',
                  borderBottom: '1px solid #f1f5f9',
                }}
              >
                <span style={{ color: '#4b5563' }}>Nomor sertifikat</span>
                <span style={{ color: '#111827', fontWeight: '500' }}>
                  {selectedItem.nomorSertifikat}
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '9px 0',
                  borderBottom: '1px solid #f1f5f9',
                }}
              >
                <span style={{ color: '#4b5563' }}>Tanggal kegiatan</span>
                <span style={{ color: '#111827', fontWeight: '500' }}>
                  {selectedItem.detail?.tanggalKegiatan || '15/4/2026'}
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '9px 0',
                  borderBottom: '1px solid #f1f5f9',
                }}
              >
                <span style={{ color: '#4b5563' }}>Penerbit sertifikat</span>
                <span style={{ color: '#111827', fontWeight: '500' }}>
                  {selectedItem.detail?.penerbit || 'UNAND'}
                </span>
              </div>
            </div>

            {/* Issue Section */}
            <div style={{ marginTop: '16px' }}>
              <span className={statusConfig[selectedItem.status]?.className || 'humas-badge'}>
                ● {statusConfig[selectedItem.status]?.label || 'Sedang Diproses'}
              </span>
              <div
                style={{
                  fontSize: '13.5px',
                  fontWeight: '700',
                  color: '#111827',
                  marginTop: '8px',
                }}
              >
                {selectedItem.jenisPerbaikan}
              </div>
              <p style={{ fontSize: '13px', color: '#4b5563', marginTop: '4px', lineHeight: '1.45' }}>
                {selectedItem.catatan}
              </p>
            </div>
          </div>

          {/* Card Tengah: Data Sebelumnya vs Data Hasil Perbaikan */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '24px',
              marginBottom: '20px',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '36px',
              }}
            >
              {/* Kolom Kiri: Data Sebelumnya */}
              <div>
                <h3
                  style={{
                    fontSize: '13.5px',
                    fontWeight: '700',
                    color: '#111827',
                    marginBottom: '16px',
                  }}
                >
                  Data Sebelumnya
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', fontSize: '13px' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '9px 0',
                      borderBottom: '1px solid #f1f5f9',
                    }}
                  >
                    <span style={{ color: '#4b5563' }}>Nama peserta</span>
                    <span style={{ color: '#111827', fontWeight: '500' }}>
                      {selectedItem.namaPeserta}
                    </span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '9px 0',
                      borderBottom: '1px solid #f1f5f9',
                    }}
                  >
                    <span style={{ color: '#4b5563' }}>Nama kegiatan</span>
                    <span style={{ color: '#111827', fontWeight: '500' }}>
                      {selectedItem.kegiatanSingkat || selectedItem.namaKegiatan}
                    </span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '9px 0',
                      borderBottom: '1px solid #f1f5f9',
                    }}
                  >
                    <span style={{ color: '#4b5563' }}>Jenis kegiatan</span>
                    <span style={{ color: '#111827', fontWeight: '500' }}>
                      {selectedItem.detail?.jenisKegiatan || 'Workshop'}
                    </span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '9px 0',
                      borderBottom: '1px solid #f1f5f9',
                    }}
                  >
                    <span style={{ color: '#4b5563' }}>Nomor sertifikat</span>
                    <span style={{ color: '#111827', fontWeight: '500' }}>
                      {selectedItem.nomorSertifikat}
                    </span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '9px 0',
                      borderBottom: '1px solid #f1f5f9',
                    }}
                  >
                    <span style={{ color: '#4b5563' }}>Tanggal kegiatan</span>
                    <span style={{ color: '#111827', fontWeight: '500' }}>
                      {selectedItem.detail?.tanggalKegiatan || '15/4/2026'}
                    </span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '9px 0',
                    }}
                  >
                    <span style={{ color: '#4b5563' }}>Penerbit sertifikat</span>
                    <span style={{ color: '#111827', fontWeight: '500' }}>
                      {selectedItem.detail?.penerbit || 'UNAND'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Kolom Kanan: Data Hasil Perbaikan */}
              <div>
                <h3
                  style={{
                    fontSize: '13.5px',
                    fontWeight: '700',
                    color: '#111827',
                    marginBottom: '16px',
                  }}
                >
                  Data Hasil Perbaikan
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '12px',
                        fontWeight: '700',
                        color: '#111827',
                        marginBottom: '6px',
                      }}
                    >
                      Nama Peserta
                    </label>
                    <textarea
                      style={{
                        width: '100%',
                        height: '70px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        padding: '10px 12px',
                        fontSize: '13px',
                        color: '#111827',
                        resize: 'vertical',
                        outline: 'none',
                      }}
                      value={koreksiForm.namaPeserta}
                      onChange={e =>
                        setKoreksiForm(prev => ({ ...prev, namaPeserta: e.target.value }))
                      }
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '12px',
                        fontWeight: '700',
                        color: '#111827',
                        marginBottom: '6px',
                      }}
                    >
                      Informasi Kegiatan
                    </label>
                    <textarea
                      style={{
                        width: '100%',
                        height: '70px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        padding: '10px 12px',
                        fontSize: '13px',
                        color: '#111827',
                        resize: 'vertical',
                        outline: 'none',
                      }}
                      value={koreksiForm.informasiKegiatan}
                      onChange={e =>
                        setKoreksiForm(prev => ({
                          ...prev,
                          informasiKegiatan: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '12px',
                        fontWeight: '700',
                        color: '#111827',
                        marginBottom: '6px',
                      }}
                    >
                      Informasi Lainnya
                    </label>
                    <textarea
                      style={{
                        width: '100%',
                        height: '70px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        padding: '10px 12px',
                        fontSize: '13px',
                        color: '#111827',
                        resize: 'vertical',
                        outline: 'none',
                      }}
                      value={koreksiForm.informasiLainnya}
                      onChange={e =>
                        setKoreksiForm(prev => ({
                          ...prev,
                          informasiLainnya: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card Bawah: Pratinjau Sertifikat Interaktif */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              overflow: 'hidden',
              marginBottom: '20px',
            }}
          >
            <div
              style={{
                padding: '12px 18px',
                borderBottom: '1px solid #e5e7eb',
                fontSize: '12px',
                color: '#6b7280',
                background: '#ffffff',
              }}
            >
              Pratinjau sertifikat
            </div>
            <div
              style={{
                background: '#edf2ee',
                padding: '36px 20px',
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              {renderCertificateCanvas(
                koreksiForm.namaPeserta,
                koreksiForm.informasiKegiatan
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <button
              type="button"
              style={{
                background: '#14532d',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '10px 22px',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
              }}
              onClick={handleSimpanKoreksi}
            >
              Simpan Perbaikan
            </button>
            <button
              type="button"
              style={{
                background: '#ffffff',
                color: '#14532d',
                border: '1px solid #14532d',
                borderRadius: '6px',
                padding: '10px 22px',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
              }}
              onClick={() => setMode('detail')}
            >
              Batal Koreksi
            </button>
          </div>
        </>
      )}
    </div>
  );
}
