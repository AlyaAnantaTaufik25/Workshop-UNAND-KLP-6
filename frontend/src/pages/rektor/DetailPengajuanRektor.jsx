import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Eye, Check, PenTool } from 'lucide-react';
import { sertifikatData, dokumenPengganti } from '../../data/mockData';
import BackButton from '../../components/BackButton';
import UnandLogo from '../../components/UnandLogo';

const statusClass = {
  'menunggu-rektor': 'badge badge-orange',
  'menunggu-mitra':  'badge badge-amber',
  'diterbitkan':     'badge badge-green',
};
const statusLabel = {
  'menunggu-rektor': 'Menunggu Rektor',
  'menunggu-mitra':  'Menunggu Mitra',
  'diterbitkan':     'Diterbitkan',
};

export default function DetailPengajuanRektor() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const [signed, setSigned] = useState(false);

  const sert = sertifikatData.find(s => String(s.id) === id);

  if (!sert) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--gray-400)' }}>
        <p>Data tidak ditemukan.</p>
        <button
          onClick={() => navigate('/rektor/pengajuan')}
          style={{ marginTop: '16px', color: 'var(--green-700)', background: 'none',
                   border: 'none', cursor: 'pointer', fontWeight: 600 }}
        >
          ← Kembali ke daftar
        </button>
      </div>
    );
  }

  const isMenungguRektor = sert.statusTandaTangan === 'menunggu-rektor' && !signed;

  const steps = [
    { label: 'Template oleh Humas', done: true },
    { label: 'Rektor UNAND',        done: !isMenungguRektor, statusText: isMenungguRektor ? 'Menunggu' : 'Selesai ditandatangani' },
    { label: 'Pimpinan Mitra',      done: sert.statusTandaTangan === 'diterbitkan', statusText: 'Menunggu' },
    { label: 'Penerbitan oleh Sekretariat', done: sert.statusTandaTangan === 'diterbitkan', note: 'Setelah kedua tanda tangan lengkap' },
  ];

  const handleTandatangan = () => {
    setSigned(true);
  };

  return (
    <div>
      {/* Back button */}
      <BackButton to="/rektor/pengajuan" label="Kembali ke Daftar Pengajuan" />

      {/* Header Info */}
      <div className="detail-header" style={{ marginBottom: '20px' }}>
        <p className="detail-source-tag">Sumber {sert.sumber}</p>
        <div className="detail-title">
          {sert.namaKegiatan}
          <span className={signed ? 'badge badge-green' : statusClass[sert.statusTandaTangan]}>
            {signed ? 'Sudah Ditandatangani' : statusLabel[sert.statusTandaTangan]}
          </span>
        </div>
        <p className="detail-subtitle">
          {sert.jenis} · {sert.penyelenggara} · {sert.tanggalPengajuan}
        </p>
      </div>

      {/* Two Columns Layout */}
      <div className="detail-layout">
        {/* LEFT: Certificate Preview */}
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
              <p style={{ fontSize: '10px', color: 'var(--gray-400)', marginBottom: '18px' }}>
                Pratinjau contoh · bukan PDF resmi
              </p>
              <p className="cert-title">SERTIFIKAT</p>
              <p className="cert-given">Diberikan kepada</p>
              <p className="cert-recipient">NADIA AMELIA</p>
              <p className="cert-participation">atas partisipasinya sebagai peserta dalam</p>
              <p className="cert-event-name">{sert.namaKegiatan}</p>
              <p className="cert-date-place">
                {sert.tanggalPengajuan} · Universitas Andalas
              </p>

              <div className="cert-signatures">
                <div className="cert-sig-item">
                  <p className="cert-sig-line">Rektor UNAND</p>
                  <div style={{
                    height: 32,
                    margin: '6px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderBottom: '1px solid var(--gray-300)',
                    fontFamily: 'cursive',
                    fontSize: '15px',
                    color: !isMenungguRektor ? 'var(--green-900)' : 'transparent',
                    fontWeight: 700
                  }}>
                    {!isMenungguRektor && 'Andani Eka Putra'}
                  </div>
                  <p className="cert-sig-role">
                    {!isMenungguRektor ? 'Ditandatangani digital' : 'Menunggu'}
                  </p>
                </div>
                <div className="cert-sig-item">
                  <p className="cert-sig-line">Pimpinan Mitra</p>
                  <div style={{ height: 32, borderBottom: '1px solid var(--gray-300)', margin: '6px 20px', opacity: 0.4 }} />
                  <p className="cert-sig-role">Menunggu</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Document Info + Process + Signature Action */}
        <div className="detail-right-panel">
          {/* Card Info Dokumen */}
          <div className="info-card">
            <p className="info-card-title">Informasi dokumen</p>
            <div className="info-row">
              <span className="info-row-label">Template</span>
              <span className="info-row-value" style={{ fontSize: '12px' }}>{sert.template}</span>
            </div>
            <div className="info-row">
              <span className="info-row-label">Dokumen</span>
              <span className="info-row-value" style={{ color: 'var(--green-700)' }}>
                {sert.jumlahSertifikat} sertifikat peserta hadir
              </span>
            </div>
            <div className="info-row">
              <span className="info-row-label">Penyelenggara</span>
              <span className="info-row-value">{sert.penyelenggara}</span>
            </div>
            <button className="btn-daftar-dok">Daftar Dokumen</button>
          </div>

          {/* Card Urutan Proses */}
          <div className="process-card">
            <p className="process-card-title">Urutan proses - Sumber {sert.sumber}</p>
            {steps.map((step, i) => (
              <div className="process-step" key={i}>
                <div className={`process-step-num ${step.done ? 'step-done' : 'step-waiting'}`}>
                  {step.done ? <Check size={12} /> : i + 1}
                </div>
                <div className="process-step-info">
                  <p className="process-step-label">{step.label}</p>
                  <p className={`process-step-status${step.done ? ' done' : ''}`}>
                    {step.statusText ?? (step.done ? 'Selesai' : step.note ?? 'Menunggu')}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Action Button Rektor */}
          <div className="action-buttons">
            <button
              className="btn-upload"
              onClick={handleTandatangan}
              disabled={!isMenungguRektor}
              style={{
                background: isMenungguRektor ? 'var(--green-900)' : 'var(--green-100)',
                color: isMenungguRektor ? 'white' : 'var(--green-800)',
                cursor: isMenungguRektor ? 'pointer' : 'default',
                border: isMenungguRektor ? 'none' : '1px solid var(--green-200)',
              }}
            >
              <PenTool size={15} />
              {signed ? 'Sertifikat Telah Ditandatangani' : 'Tandatangani Sertifikat'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Section Dokumen Pengganti di Bawah (Screenshot 2) ── */}
      <div className="section-divider" style={{ marginTop: '40px' }}>
        <p className="section-divider-label">DOKUMEN PENGGANTI</p>
        <h3 className="section-divider-heading">Pemrosesan Sertifikat Hasil Perbaikan</h3>
        <p className="section-divider-sub">
          Periksa pengajuan dan lanjutkan dokumen pengganti sesuai alur penerbitan.
        </p>

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
              {dokumenPengganti.map(d => (
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
                    <span className="badge badge-blue">
                      Sedang Diproses
                    </span>
                  </td>
                  <td>
                    <span className="table-action-link">Lihat Detail</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

