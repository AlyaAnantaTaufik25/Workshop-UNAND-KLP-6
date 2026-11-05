import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Eye, Upload, Check, Search } from 'lucide-react';
import { sertifikatData, presensiData, dokumenPengganti } from '../../data/mockData';
import BackButton from '../../components/BackButton';
import UnandLogo from '../../components/UnandLogo';

/* ─── Status maps ─────────────────────────────────────── */
const sertStatusClass = {
  'menunggu-rektor': 'badge badge-orange',
  'menunggu-mitra':  'badge badge-amber',
  'diterbitkan':     'badge badge-green',
};
const sertStatusLabel = {
  'menunggu-rektor': 'Menunggu Rektor',
  'menunggu-mitra':  'Menunggu Mitra',
  'diterbitkan':     'Diterbitkan',
};
const dpStatusLabel = { 'sedang-diproses': 'Sedang Diproses' };
const dpStatusClass = { 'sedang-diproses': 'badge badge-blue' };

/* ─── Process steps ───────────────────────────────────── */
function getSteps(status) {
  return [
    { label: 'Template oleh Humas',         done: true },
    { label: 'Rektor UNAND',                done: status === 'diterbitkan' },
    { label: 'Pimpinan Mitra',              done: status === 'diterbitkan' },
    { label: 'Penerbitan oleh Sekretariat', done: status === 'diterbitkan',
      note: 'Setelah semua tanda tangan lengkap.' },
  ];
}

/* ─── Main Component ──────────────────────────────────── */
export default function DetailKegiatan() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const [dpSearch, setDpSearch] = useState('');
  const [dpStatus, setDpStatus] = useState('');

  const sert = sertifikatData.find(s => String(s.id) === id);

  if (!sert) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--gray-400)' }}>
        <p>Data tidak ditemukan.</p>
        <button
          onClick={() => navigate('/sekretariat/sertifikat')}
          style={{ marginTop: '16px', color: 'var(--green-700)', background: 'none',
                   border: 'none', cursor: 'pointer', fontWeight: 600 }}
        >
          ← Kembali ke Sertifikat
        </button>
      </div>
    );
  }

  const steps = getSteps(sert.statusTandaTangan);

  /* Peserta valid: dari presensiData yang hadir valid untuk workshop id ini */
  const pesertaValid = presensiData.filter(
    p => p.kegiatanId === sert.id && p.statusKehadiran === 'hadir-valid'
  );

  /* Dokumen pengganti terkait sertifikat ini */
  const filteredDp = dokumenPengganti.filter(d => {
    const matchSearch = !dpSearch ||
      d.namaPeserta.toLowerCase().includes(dpSearch.toLowerCase()) ||
      d.namaKegiatan.toLowerCase().includes(dpSearch.toLowerCase()) ||
      d.nomorSertifikat.toLowerCase().includes(dpSearch.toLowerCase());
    const matchStatus = !dpStatus || d.status === dpStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div>
      {/* ── Back button ── */}
      <BackButton to="/sekretariat/sertifikat" label="Kembali ke Daftar Sertifikat" />

      {/* ── Detail header ── */}
      <div className="detail-header">
        <p className="detail-source-tag">Sumber {sert.sumber}</p>
        <div className="detail-title">
          {sert.namaKegiatan}
          <span className={sertStatusClass[sert.statusTandaTangan]}>
            {sertStatusLabel[sert.statusTandaTangan]}
          </span>
        </div>
        <p className="detail-subtitle">
          {sert.jenis} · {sert.penyelenggara} · {sert.tanggalPengajuan}
        </p>
      </div>

      {/* ── Two-column: Preview + Info panel ── */}
      <div className="detail-layout">

        {/* LEFT: Certificate preview */}
        <div className="detail-preview-panel">
          <div className="detail-preview-header">
            <span className="detail-preview-label">Pratinjau dokumen contoh</span>
            <button className="btn-perbesar">
              <Eye size={14} /> Perbesar
            </button>
          </div>

          <div className="certificate-preview">
            <div className="certificate-doc">
              <div className="cert-header-row">
                <UnandLogo className="cert-logo" />
                <div className="cert-univ-name">UNIVERSITAS<br />ANDALAS</div>
              </div>
              <p style={{ fontSize: '10px', color: 'var(--gray-400)', marginBottom: '20px' }}>
                Pratinjau contoh · bukan PDF resmi
              </p>
              <p className="cert-title">Sertifikat</p>
              <p className="cert-given">Diberikan kepada</p>
              <p className="cert-recipient">Nadia Amelia</p>
              <p className="cert-participation">atas partisipasinya sebagai peserta dalam</p>
              <p className="cert-event-name">{sert.namaKegiatan}</p>
              <p className="cert-date-place">
                {sert.tanggalPengajuan} · Universitas Andalas
              </p>
              <div className="cert-signatures">
                <div className="cert-sig-item">
                  <p className="cert-sig-line">Pimpinan Mitra</p>
                  <div style={{ height: 32, borderBottom: '1px solid var(--gray-300)', margin: '6px 24px', opacity: 0.4 }} />
                  <p className="cert-sig-role">Menunggu</p>
                </div>
                <div className="cert-sig-item">
                  <p className="cert-sig-line">Rektor UNAND</p>
                  <div style={{ height: 32, borderBottom: '1px solid var(--gray-300)', margin: '6px 24px', opacity: 0.4 }} />
                  <p className="cert-sig-role">Menunggu</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Info + Process + Actions */}
        <div className="detail-right-panel">

          {/* Info dokumen */}
          <div className="info-card">
            <p className="info-card-title">Informasi dokumen</p>
            <div className="info-row">
              <span className="info-row-label">Template</span>
              <span className="info-row-value" style={{ maxWidth: '160px', textAlign: 'right', fontSize: '12px' }}>
                {sert.template}
              </span>
            </div>
            <div className="info-row">
              <span className="info-row-label">Dokumen</span>
              <span className="info-row-value" style={{ color: 'var(--green-700)' }}>
                {sert.jumlahSertifikat} peserta hadir
              </span>
            </div>
            <div className="info-row">
              <span className="info-row-label">Penyelenggara</span>
              <span className="info-row-value">{sert.penyelenggara}</span>
            </div>
            <button className="btn-daftar-dok">Daftar Dokumen</button>
          </div>

          {/* Process flow */}
          <div className="process-card">
            <p className="process-card-title">Urutan proses · Sumber {sert.sumber}</p>
            {steps.map((step, i) => (
              <div className="process-step" key={i}>
                <div className={`process-step-num ${step.done ? 'step-done' : 'step-waiting'}`}>
                  {step.done ? <Check size={12} /> : i + 1}
                </div>
                <div className="process-step-info">
                  <p className="process-step-label">{step.label}</p>
                  <p className={`process-step-status${step.done ? ' done' : ''}`}>
                    {step.done ? 'Selesai' : (step.note ?? 'Menunggu')}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="action-buttons">
            <button className="btn-upload">
              <Upload size={15} />
              Unggah Sertifikat PDF
            </button>
            <button
              className="btn-terbitkan"
              disabled={sert.statusTandaTangan !== 'diterbitkan'}
              style={{ opacity: sert.statusTandaTangan !== 'diterbitkan' ? 0.5 : 1 }}
            >
              Terbitkan Sertifikat
            </button>
            <p className="btn-terbitkan-note">
              Penerbitan hanya setelah semua tanda tangan lengkap dan PDF diunggah.
            </p>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          SECTION: Peserta dengan presensi valid
          ══════════════════════════════════════════════════════════ */}
      <div className="sert-section">
        <h3 className="sert-section-heading">Peserta dengan presensi valid</h3>
        <p className="sert-section-sub">
          Hanya peserta yang memenuhi syarat kehadiran dapat menerima sertifikat.
        </p>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nama Peserta</th>
                <th>Kegiatan</th>
                <th>Waktu Presensi</th>
                <th>Status Kehadiran</th>
              </tr>
            </thead>
            <tbody>
              {pesertaValid.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', color: 'var(--gray-400)', padding: '28px' }}>
                    Belum ada peserta dengan presensi valid untuk kegiatan ini.
                  </td>
                </tr>
              ) : (
                pesertaValid.map(p => (
                  <tr key={p.id}>
                    <td><span className="table-name-bold">{p.namaPeserta}</span></td>
                    <td>{p.kegiatan}</td>
                    <td style={{ color: p.waktuPresensi ? 'var(--gray-700)' : 'var(--gray-400)' }}>
                      {p.waktuPresensi ?? '—'}
                    </td>
                    <td>
                      <span className="badge badge-green">Hadir valid</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          SECTION: Dokumen Pengganti
          ══════════════════════════════════════════════════════════ */}
      <div className="sert-section">
        <p className="section-divider-label">Dokumen Pengganti</p>
        <h3 className="sert-section-heading">Pemrosesan Sertifikat Hasil Perbaikan</h3>
        <p className="sert-section-sub">
          Periksa pengajuan dan lanjutkan dokumen pengganti sesuai alur penerbitan.
        </p>

        {/* Filter bar */}
        <div className="filter-bar" style={{ marginBottom: '16px' }}>
          <div className="search-wrap" style={{ maxWidth: '340px' }}>
            <Search size={15} className="search-icon" />
            <input
              className="search-input"
              placeholder="Cari peserta, kegiatan, no..."
              value={dpSearch}
              onChange={e => setDpSearch(e.target.value)}
            />
          </div>
          <select
            className="filter-select"
            value={dpStatus}
            onChange={e => setDpStatus(e.target.value)}
          >
            <option value="">Semua status</option>
            <option value="sedang-diproses">Sedang Diproses</option>
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
              {filteredDp.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: 'var(--gray-400)', padding: '28px' }}>
                    Tidak ada pengajuan dokumen pengganti.
                  </td>
                </tr>
              ) : (
                filteredDp.map(d => (
                  <tr key={d.id}>
                    <td><span className="table-name-bold">{d.namaPeserta}</span></td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--gray-800)', fontSize: '13px' }}>
                        {d.namaKegiatan}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--gray-400)' }}>{d.penyelenggara}</div>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{d.nomorSertifikat}</td>
                    <td>{d.jenisPerbaikan}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{d.tanggalPengajuan}</td>
                    <td>
                      <span className={dpStatusClass[d.status]}>
                        {dpStatusLabel[d.status]}
                      </span>
                    </td>
                    <td>
                      <span className="table-action-link">Lihat Detail</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
