import { useState } from 'react';
import { Search, Bell, X, AlertCircle, ArrowLeft } from 'lucide-react';

const initialData = [
  {
    id: 1,
    namaPeserta: 'Nadia Amelia',
    namaKegiatan: 'Workshop Penulisan Artikel Ilmiah',
    nomorSertifikat: 'DEMO/UNAND/1004/2026',
    jenisPerbaikan: 'Nama Peserta',
    tanggalPengajuan: '17 Mei 2026, 10:15',
    status: 'menunggu',
    catatan: 'Nama pada sertifikat tertulis Nadia Amelia, seharusnya Nadia Amelia Putri.',
    detail: {
      jenisKegiatan: 'Workshop',
      tanggalKegiatan: '15/4/2026',
      penerbit: 'UNAND',
    },
  },
];

const statusConfig = {
  menunggu:  { label: 'Menunggu Pemeriksaan', className: 'humas-badge humas-badge-draft',       icon: '★' },
  diproses:  { label: 'Sedang Diproses',      className: 'humas-badge humas-badge-berlangsung', icon: '●' },
  selesai:   { label: 'Selesai',              className: 'humas-badge humas-badge-publik',       icon: '●' },
  ditolak:   { label: 'Ditolak',              className: 'humas-badge humas-badge-selesai',      icon: '●' },
};

function CertPreview({ nama, kegiatan, tanggal }) {
  return (
    <div className="cert-preview-wrapper">
      <div className="cert-preview-box">
        <div className="cert-logo-row">
          <div className="cert-logo-icon">U</div>
          <div>
            <div className="cert-logo-title">UNIVERSITAS ANDALAS</div>
            <div className="cert-logo-sub">Pratinjau contoh, bukan PDF resmi</div>
          </div>
        </div>
        <div className="cert-divider" />
        <div className="cert-label-sertifikat">SERTIFIKAT</div>
        <div className="cert-diberikan">Diberikan kepada</div>
        <div className="cert-nama">{nama || 'NADIA AMELIA'}</div>
        <div className="cert-atas">atas partisipasinya sebagai peserta dalam</div>
        <div className="cert-kegiatan">{kegiatan || 'Workshop Penulisan Artikel Ilmiah'}</div>
        <div className="cert-tanggal">{tanggal || '15 April 2026'} · Universitas Andalas</div>
        <div className="cert-ttd-row">
          <div className="cert-ttd">
            <div className="cert-ttd-line" />
            <div className="cert-ttd-title">Rektor UNAND</div>
            <div className="cert-ttd-sub">Tanda tangan elektronik</div>
          </div>
          <div className="cert-ttd">
            <div className="cert-ttd-line" />
            <div className="cert-ttd-title">Pimpinan Mitra</div>
            <div className="cert-ttd-sub">Tanda tangan elektronik</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PerbaikanSertifikat() {
  const [data, setData]         = useState(initialData);
  const [search, setSearch]     = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [detailId, setDetailId] = useState(null);

  const filtered = data.filter(d => {
    const q = search.toLowerCase();
    const matchSearch = d.namaPeserta.toLowerCase().includes(q) || d.namaKegiatan.toLowerCase().includes(q);
    const matchStatus = filterStatus ? d.status === filterStatus : true;
    return matchSearch && matchStatus;
  });

  const handleProses = (id) => {
    setData(prev => prev.map(d => d.id === id ? { ...d, status: 'selesai' } : d));
    setDetailId(null);
  };

  const handleTolak = (id) => {
    setData(prev => prev.map(d => d.id === id ? { ...d, status: 'ditolak' } : d));
    setDetailId(null);
  };

  const detail = data.find(d => d.id === detailId);

  return (
    <div className="humas-list-page">

      {/* Prototype Banner */}
      <div className="humas-prototype-banner">
        <span className="humas-prototype-tag">Mode Prototipe</span>
        <span className="humas-prototype-text">
          Data contoh, perubahan hanya selama sesi. OFS, OTF, tanda tangan electronic dan PDF resmi belum terintegrasi.
        </span>
        <span className="humas-prototype-date">Referensi demo: 10 Mei 2026</span>
      </div>

      {/* Notif */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="humas-notif-btn"><Bell size={15} /> Notifikasi perbaikan (1)</button>
      </div>

      {detailId === null ? (
        <>
          {/* List View */}
          <div className="humas-list-header" style={{ marginBottom: 0 }}>
            <div>
              <p className="modal-header-crumb" style={{ marginBottom: 4 }}>KOREKSI OLEH PENERBIT</p>
              <h2 className="humas-section-title">Perbaikan Sertifikat</h2>
              <p className="humas-section-sub">
                Periksa pengajuan dan lanjutkan dokumen pengganti sesuai alur penerbitan.
              </p>
            </div>
          </div>

          <div className="humas-info-banner humas-info-banner--green">
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            <span>Simulasi terhubung antar-role selama sesi demo. Autentikasi, PDF resmi dan tanda tangan elektronik belum terintegrasi.</span>
          </div>

          <div className="filter-bar">
            <div className="search-wrap" style={{ flex: 1 }}>
              <Search size={15} className="search-icon" />
              <input className="search-input" placeholder="Cari peserta, kegiatan, nom..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="">Semua status</option>
              <option value="menunggu">Menunggu Pemeriksaan</option>
              <option value="diproses">Sedang Diproses</option>
              <option value="selesai">Selesai</option>
              <option value="ditolak">Ditolak</option>
            </select>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nama Peserta</th>
                  <th>Nama Kegiatan</th>
                  <th>Nomor Sertifikat</th>
                  <th>Jenis Perbaikan</th>
                  <th>Tanggal Pengajuan</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--gray-400)', padding: '32px' }}>Tidak ada pengajuan.</td></tr>
                )}
                {filtered.map(d => {
                  const cfg = statusConfig[d.status] ?? statusConfig.menunggu;
                  return (
                    <tr key={d.id}>
                      <td><span className="table-name-bold">{d.namaPeserta}</span></td>
                      <td>{d.namaKegiatan}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{d.nomorSertifikat}</td>
                      <td>{d.jenisPerbaikan}</td>
                      <td style={{ whiteSpace: 'nowrap', fontSize: '13px' }}>{d.tanggalPengajuan}</td>
                      <td><span className={cfg.className}>{cfg.icon} {cfg.label}</span></td>
                      <td>
                        <button className="humas-tindakan-btn humas-tindakan-view" onClick={() => setDetailId(d.id)}>
                          Lihat Detail
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <>
          {/* Detail View */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p className="modal-header-crumb" style={{ marginBottom: 4 }}>KOREKSI OLEH PENERBIT</p>
              <h2 className="humas-section-title">Detail Pengajuan Perbaikan</h2>
              <p className="humas-section-sub">Periksa pengajuan dan lanjutkan dokumen pengganti sesuai alur penerbitan.</p>
            </div>
            <button className="humas-edit-btn" onClick={() => setDetailId(null)}>
              <ArrowLeft size={14} /> Kembali ke Daftar
            </button>
          </div>

          <div className="humas-info-banner humas-info-banner--green">
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            <span>Simulasi terhubung antar-role selama sesi demo. Autentikasi, PDF resmi dan tanda tangan elektronik belum terintegrasi.</span>
          </div>

          {/* Info rows */}
          <div className="humas-detail-info-card">
            {[
              ['Nama peserta',      detail.namaPeserta],
              ['Nama kegiatan',     detail.namaKegiatan],
              ['Jenis kegiatan',    detail.detail.jenisKegiatan],
              ['Nomor sertifikat',  detail.nomorSertifikat],
              ['Tanggal kegiatan',  detail.detail.tanggalKegiatan],
              ['Penerbit sertifikat', detail.detail.penerbit],
            ].map(([label, val]) => (
              <div key={label} className="humas-detail-info-row">
                <span className="humas-detail-info-label">{label}</span>
                <span className="humas-detail-info-value">{val}</span>
              </div>
            ))}
          </div>

          {/* Issue section */}
          <div className="humas-perbaikan-issue">
            <div className="humas-perbaikan-issue-header">
              <span className={statusConfig[detail.status]?.className}>
                {statusConfig[detail.status]?.icon} {statusConfig[detail.status]?.label}
              </span>
              <span className="humas-detail-section-title" style={{ marginLeft: 8 }}>{detail.jenisPerbaikan}</span>
            </div>
            <p className="humas-detail-text" style={{ marginTop: 6 }}>{detail.catatan}</p>
          </div>

          {/* Certificate Preview */}
          <div className="form-group">
            <p className="form-hint" style={{ marginBottom: 8 }}>Pratinjau sertifikat - HTML simulasi, bukan PDF resmi</p>
            <CertPreview nama={detail.namaPeserta} kegiatan={detail.namaKegiatan} tanggal={detail.detail.tanggalKegiatan} />
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="modal-btn modal-btn-publish" onClick={() => handleProses(detail.id)}>Proses Perbaikan</button>
            <button className="modal-btn modal-btn-batal" onClick={() => handleTolak(detail.id)}>Tolak Pengajuan</button>
          </div>
        </>
      )}
    </div>
  );
}
