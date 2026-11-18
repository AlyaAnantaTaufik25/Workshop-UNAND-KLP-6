import { useParams, useNavigate } from 'react-router-dom';
import { Eye, Check, PenTool, FileText, CheckCircle2 } from 'lucide-react';
import { sertifikatData } from '../../data/mockData';
import { currentRektor } from './data';
import BackButton from '../../components/BackButton';
import UnandLogo from '../../components/UnandLogo';

export default function DetailRiwayatRektor() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const sert = sertifikatData.find(s => String(s.id) === id) || sertifikatData.find(s => s.id === 3);

  const steps = [
    { label: 'Template oleh Mitra', done: true, text: 'Tersedia' },
    { label: 'Pimpinan Mitra',      done: true, text: 'Selesai' },
    { label: 'Rektor UNAND',        done: true, text: 'Selesai' },
    { label: 'Penerbitan oleh Sekretariat', done: true, text: 'Diterbitkan' },
  ];

  const handlePratinjauPDF = () => {
    const printWindow = window.open('', '_blank', 'width=950,height=750');
    if (!printWindow) {
      alert('Harap izinkan pop-up browser untuk melihat atau mencetak pratinjau sertifikat PDF.');
      return;
    }

    const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <title>Sertifikat_${(sert?.namaKegiatan || 'Kegiatan').replace(/\\s+/g, '_')}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
      margin: 0; padding: 24px; background: #f8fafc; color: #111827;
    }
    .action-bar {
      position: sticky; top: 0; background: #ffffff; border-bottom: 2px solid #14532d;
      padding: 12px 24px; display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 24px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.06);
    }
    .btn {
      padding: 8px 16px; border-radius: 6px; font-size: 13.5px; font-weight: 600; cursor: pointer; border: none;
    }
    .btn-print { background: #14532d; color: #ffffff; }
    .btn-close { background: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; }
    .cert-frame {
      max-width: 900px; margin: 0 auto; background: #ffffff; border: 8px double #14532d;
      padding: 44px 50px; text-align: center; border-radius: 4px; box-shadow: 0 8px 30px rgba(0,0,0,0.08);
    }
    .univ-name { font-size: 16px; font-weight: 800; color: #14532d; letter-spacing: 0.5px; }
    .mitra-name { font-size: 13px; font-weight: 700; color: #4b5563; }
    .cert-title { font-size: 26px; font-weight: 900; color: #14532d; letter-spacing: 2px; margin: 16px 0 6px; }
    .cert-no { font-family: monospace; font-size: 13px; color: #64748b; margin-bottom: 20px; }
    .cert-giver { font-size: 14px; color: #475569; font-style: italic; margin-bottom: 8px; }
    .cert-name { font-size: 24px; font-weight: 800; color: #14532d; margin-bottom: 12px; }
    .cert-desc { font-size: 14px; color: #334155; max-width: 700px; margin: 0 auto 20px; line-height: 1.6; }
    .sig-row { display: flex; justify-content: space-around; margin-top: 36px; padding-top: 16px; border-top: 1px dashed #cbd5e1; }
    .sig-block { min-width: 220px; text-align: center; }
    .sig-role { font-weight: 700; font-size: 13px; color: #1e293b; margin-bottom: 6px; }
    .sig-space { min-height: 55px; display: flex; align-items: center; justify-content: center; }
    .sig-name { font-weight: 700; font-size: 13.5px; color: #14532d; border-top: 1px solid #94a3b8; display: inline-block; padding-top: 4px; min-width: 170px; }
    .sig-status { font-size: 11px; color: #15803d; font-weight: 600; margin-top: 4px; }
    @media print {
      body { padding: 0; background: #fff; }
      .action-bar { display: none; }
      .cert-frame { box-shadow: none; border-width: 6px; }
    }
  </style>
</head>
<body>
  <div class="action-bar">
    <div style="font-weight: 700; color: #14532d;">Pratinjau Resmi Sertifikat UNAND</div>
    <div style="display: flex; gap: 10px;">
      <button class="btn btn-print" onclick="window.print()">Cetak / Simpan PDF</button>
      <button class="btn btn-close" onclick="window.close()">Tutup</button>
    </div>
  </div>
  <div class="cert-frame">
    <div class="univ-name">UNIVERSITAS ANDALAS</div>
    <div class="mitra-name">Mitra Kerja Sama: ${sert?.penyelenggara || 'PT Semen Padang'}</div>
    <div class="cert-title">SERTIFIKAT PENGHARGAAN</div>
    <div class="cert-no">Nomor: ${sert?.nomorSK || 'UNAND/CERT/2026/042'}</div>
    <div class="cert-giver">Diberikan Kepada:</div>
    <div class="cert-name">NADIA AMELIA</div>
    <div class="cert-desc">
      Atas partisipasi dan kontribusinya secara aktif sebagai peserta dalam kegiatan
      <strong>${sert?.namaKegiatan || 'Manajemen Proyek Kolaboratif'}</strong> yang diselenggarakan oleh <strong>${sert?.penyelenggara || 'PT Semen Padang'}</strong>
      bekerja sama dengan Universitas Andalas pada tanggal ${sert?.tanggalPengajuan || '15 April 2026'}.
    </div>
    <div class="sig-row">
      <div class="sig-block">
        <div class="sig-role">Rektor Universitas Andalas</div>
        <div class="sig-space">
          <span style="font-family: cursive; font-size: 17px; color: #14532d; font-weight: bold;">${currentRektor.nama}</span>
        </div>
        <div class="sig-name">${currentRektor.nama}</div>
        <div class="sig-status">✓ Ditandatangani Elektronik</div>
      </div>
      <div class="sig-block">
        <div class="sig-role">Pimpinan Mitra Kerja Sama</div>
        <div class="sig-space">
          <span style="font-family: cursive; font-size: 15px; color: #14532d; font-weight: bold;">Pimpinan Mitra</span>
        </div>
        <div class="sig-name">${sert?.penyelenggara || 'PT Semen Padang'}</div>
        <div class="sig-status">✓ Ditandatangani Elektronik</div>
      </div>
    </div>
  </div>
</body>
</html>`;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div>
      {/* Back button */}
      <BackButton to="/rektor/riwayat" label="Kembali ke Riwayat" />

      {/* Header Info */}
      <div className="detail-header" style={{ marginBottom: '20px' }}>
        <p className="detail-source-tag">Sumber {sert?.sumber || 'Mitra'}</p>
        <div className="detail-title">
          {sert?.namaKegiatan || 'Manajemen Proyek Kolaboratif'}
          <span className="badge badge-green">
            Diterbitkan
          </span>
        </div>
        <p className="detail-subtitle">
          {sert?.jenis || 'Workshop'} · {sert?.penyelenggara || 'PT Semen Padang'} · {sert?.tanggalPengajuan || '15 April 2026'}
        </p>
      </div>

      {/* Two Columns Layout */}
      <div className="detail-layout">
        {/* LEFT: Certificate Preview */}
        <div className="detail-preview-panel">
          <div className="detail-preview-header">
            <span className="detail-preview-label">Pratinjau dokumen resmi</span>
            <button className="btn-perbesar" type="button" onClick={handlePratinjauPDF}>
              <Eye size={14} /> Pratinjau PDF
            </button>
          </div>

          <div className="certificate-preview">
            <div className="certificate-doc">
              <div className="cert-header-row">
                <UnandLogo className="cert-logo" />
                <div className="cert-univ-name">
                  UNIVERSITAS ANDALAS<br />
                  <span style={{ fontSize: '10px', color: 'var(--gray-400)', fontWeight: 400 }}>
                    Mitra Kerja Sama: {sert?.penyelenggara || 'PT Semen Padang'}
                  </span>
                </div>
              </div>
              
              <p className="cert-title">SERTIFIKAT</p>
              <p className="cert-given">Diberikan kepada</p>
              <p className="cert-recipient">NADIA AMELIA</p>
              <p className="cert-participation">atas partisipasinya sebagai peserta dalam</p>
              <p className="cert-event-name">{sert?.namaKegiatan || 'Manajemen Proyek Kolaboratif'}</p>
              <p className="cert-date-place">
                {sert?.tanggalPengajuan || '15 April 2026'} · Universitas Andalas
              </p>

              <div className="cert-signatures">
                <div className="cert-sig-item">
                  <p className="cert-sig-line">Rektor UNAND</p>
                  <div style={{
                    minHeight: 32,
                    margin: '6px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderBottom: '1px solid var(--gray-300)',
                    fontFamily: 'cursive',
                    fontSize: '15px',
                    color: 'var(--green-900)',
                    fontWeight: 700,
                  }}>
                    {currentRektor.nama}
                  </div>
                  <p className="cert-sig-role" style={{ color: '#15803d', fontWeight: 600 }}>✓ Telah Ditandatangani</p>
                </div>
                <div className="cert-sig-item">
                  <p className="cert-sig-line">Pimpinan Mitra</p>
                  <div style={{
                    minHeight: 32,
                    margin: '6px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderBottom: '1px solid var(--gray-300)',
                    fontFamily: 'cursive',
                    fontSize: '14px',
                    color: 'var(--green-900)',
                    fontWeight: 700,
                  }}>
                    Pimpinan Mitra
                  </div>
                  <p className="cert-sig-role" style={{ color: '#15803d', fontWeight: 600 }}>✓ Telah Ditandatangani</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Document Info + Process + Signature Status Card */}
        <div className="detail-right-panel">
          {/* Card Info Dokumen */}
          <div className="info-card">
            <p className="info-card-title">Informasi dokumen</p>
            <div className="info-row">
              <span className="info-row-label">Template</span>
              <span className="info-row-value" style={{ fontSize: '12px' }}>{sert?.template || 'Desain Klasik Hijau & Garis Emas'}</span>
            </div>
            <div className="info-row">
              <span className="info-row-label">Dokumen</span>
              <span className="info-row-value" style={{ color: 'var(--green-700)', fontWeight: 700 }}>
                {sert?.jumlahSertifikat || 84} sertifikat peserta hadir
              </span>
            </div>
            <div className="info-row">
              <span className="info-row-label">Penyelenggara</span>
              <span className="info-row-value">{sert?.penyelenggara || 'PT Semen Padang'}</span>
            </div>
            <div className="info-row">
              <span className="info-row-label">Sumber</span>
              <span className="info-row-value">{sert?.sumber || 'Mitra'}</span>
            </div>
          </div>

          {/* Card Urutan Proses */}
          <div className="process-card">
            <p className="process-card-title">Urutan proses - Sumber {sert?.sumber || 'Mitra'}</p>
            {steps.map((step, i) => (
              <div className="process-step" key={i}>
                <div className="process-step-num step-done">
                  <Check size={12} />
                </div>
                <div className="process-step-info">
                  <p className="process-step-label">{step.label}</p>
                  <p className="process-step-status done">
                    {step.text}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Status Box */}
          <div className="info-card">
            <p className="info-card-title" style={{ margin: '0 0 10px' }}>Status Pengesahan</p>
            <div
              style={{
                background: '#DCFCE7',
                border: '1px solid #86EFAC',
                borderRadius: 6,
                padding: '12px 14px',
                fontSize: '12.5px',
                color: '#15803d',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontWeight: 600,
                marginBottom: 12,
              }}
            >
              <CheckCircle2 size={18} />
              <span>Sertifikat batch kegiatan telah selesai ditandatangani dan diterbitkan.</span>
            </div>

            <button
              type="button"
              className="btn-perbesar"
              onClick={handlePratinjauPDF}
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '10px 14px',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                background: '#ffffff',
                color: '#334155',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <FileText size={15} /> Buka Cetak / PDF Resmi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
