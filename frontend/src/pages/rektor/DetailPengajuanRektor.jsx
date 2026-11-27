import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Eye,
  Check,
  ShieldCheck,
  FileText,
  CheckCircle2,
} from 'lucide-react';
import BackButton from '../../components/BackButton';
import UnandLogo from '../../components/UnandLogo';
import { usePortalData } from '../../context/PortalData';
import { certificatesApi } from '../../api';
import { dialog, toast } from '../../components/Dialog';
import { statusClass, statusLabel } from './detailPengajuan/shared';
import SignView from './detailPengajuan/SignView';
import './rektor-static.css';

export default function DetailPengajuanRektor() {
  const { sertifikatData, currentRektor, reload } = usePortalData();
  const { id }   = useParams();
  const navigate = useNavigate();

  const sert = sertifikatData.find(s => String(s.id) === id);
  const contohPeserta = sert?.penerimaContoh && sert.penerimaContoh !== '-' ? sert.penerimaContoh : 'Nama Peserta';

  // View mode: 'detail' | 'sign'
  const [viewMode, setViewMode] = useState('detail');

  // Status TTD Rektor
  const [signed, setSigned] = useState(sert?.statusTandaTangan === 'diterbitkan');
  const [signatureImg, setSignatureImg] = useState(null);
  const [waktuTtdRektor, setWaktuTtdRektor] = useState(
    sert?.waktuTtdRektor || null
  );

  // State untuk penandatanganan (Canvas, Tools, PIN)
  const [tool, setTool] = useState('pen'); // 'pen' | 'eraser'
  const [lineWidth, setLineWidth] = useState(3);
  const [color, setColor] = useState('#000000');
  const [stampImg, setStampImg] = useState(null);
  const [signPin, setSignPin] = useState('');
  const [signPinError, setSignPinError] = useState('');
  const [signPage, setSignPage] = useState(1);
  const canvasRef = useRef(null);

  // Toast seragam (komponen Dialog global)
  const showToast = (msg) => toast(msg, { tone: /gagal|salah|tidak|ditolak/i.test(msg) ? 'error' : 'success' });

  if (!sert) {
    return (
      <div className="ix-77d5e40">
        <p>Data tidak ditemukan.</p>
        <BackButton onClick={() => navigate('/rektor/pengajuan')} label="Kembali ke daftar" />
      </div>
    );
  }


  // Urutan sesuai alur backend: Humas -> TTE Mitra (bila ada mitra) -> TTE Rektor -> terbit
  const mitraDone = !sert.perluMitra || sert.statusTandaTangan !== 'menunggu-mitra';
  const steps = [
    { label: 'Template oleh Humas', done: true, statusText: 'Selesai' },
    ...(sert.perluMitra ? [{
      label: 'Pimpinan Mitra',
      done: mitraDone,
      statusText: mitraDone ? `Selesai ditandatangani${sert.waktuTtdMitra ? ` · ${sert.waktuTtdMitra}` : ''}` : 'Menunggu tanda tangan',
    }] : []),
    {
      label: 'Rektor UNAND',
      done: signed,
      statusText: signed ? 'Selesai ditandatangani' : mitraDone ? 'Menunggu tanda tangan Anda' : 'Menunggu tanda tangan Mitra',
    },
    {
      label: 'Sertifikat diterbitkan',
      done: signed,
      note: 'Otomatis setelah tanda tangan lengkap',
    },
  ];

  // Simpan / Proses Tanda Tangan Elektronik
  const handleProsesTTE = async () => {
    if (!signPin || signPin.length !== 6) {
      setSignPinError('PIN harus 6 digit angka');
      return;
    }
    if (canvasRef.current?.isEmpty()) {
      setSignPinError('Harap gambar tanda tangan terlebih dahulu pada canvas');
      return;
    }
    // PIN diverifikasi server; sertifikat peserta terbit otomatis setelah TTE terakhir
    try {
      await certificatesApi.sign(sert.id, signPin, canvasRef.current?.getDataURL());
    } catch (err) {
      setSignPinError(err.message);
      return;
    }
    reload();

    const waktuSekarang =
      new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }) + ' WIB';

    const dataUrl = canvasRef.current?.getDataURL();
    setSignatureImg(dataUrl);
    setWaktuTtdRektor(waktuSekarang);
    setSigned(true);

    // Reset state canvas
    canvasRef.current?.clear();
    setSignPin('');
    setSignPinError('');
    setStampImg(null);
    setSignPage(1);
    setViewMode('detail');

    showToast('Tanda tangan berhasil dibubuhkan. Sertifikat batch kegiatan telah ditandatangani secara resmi oleh Rektor UNAND.');
  };

  // Pratinjau PDF Sertifikat Resmi (Popup Window yang bisa dicetak/disimpan)
  const handlePratinjauPDF = () => {
    const printWindow = window.open('', '_blank', 'width=950,height=750');
    if (!printWindow) {
      dialog.alert({ title: 'Pop-up diblokir', message: 'Izinkan pop-up browser untuk melihat atau mencetak pratinjau sertifikat PDF.', tone: 'warning' });
      return;
    }

    const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <title>Sertifikat_${sert.namaKegiatan.replace(/\\s+/g, '_')}</title>
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
    .sig-img { max-height: 50px; max-width: 160px; object-fit: contain; }
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
    <div class="mitra-name">Mitra Kerja Sama: ${sert.penyelenggara}</div>
    <div class="cert-title">SERTIFIKAT PENGHARGAAN</div>
    <div class="cert-no">Nomor: ${sert.nomorSK || 'UNAND/CERT/2026/042'}</div>
    <div class="cert-giver">Diberikan Kepada:</div>
    <div class="cert-name">NADIA AMELIA</div>
    <div class="cert-desc">
      Atas partisipasi dan kontribusinya secara aktif sebagai peserta dalam kegiatan
      <strong>${sert.namaKegiatan}</strong> yang diselenggarakan oleh <strong>${sert.penyelenggara}</strong>
      bekerja sama dengan Universitas Andalas pada tanggal ${sert.tanggalPengajuan}.
    </div>
    <div class="sig-row">
      <div class="sig-block">
        <div class="sig-role">Rektor Universitas Andalas</div>
        <div class="sig-space">
          ${
            signed && signatureImg
              ? `<img src="${signatureImg}" class="sig-img" alt="TTD Rektor" />`
              : `<span style="font-family: cursive; font-size: 17px; color: #14532d; font-weight: bold;">${currentRektor.nama}</span>`
          }
        </div>
        <div class="sig-name">${currentRektor.nama}</div>
        <div class="sig-status">${signed ? '✓ Ditandatangani Elektronik' : 'Menunggu TTE'}</div>
      </div>
      <div class="sig-block">
        <div class="sig-role">Pimpinan Mitra Kerja Sama</div>
        <div class="sig-space">
          <span style="font-family: cursive; font-size: 15px; color: #14532d; font-weight: bold;">Pimpinan Mitra</span>
        </div>
        <div class="sig-name">${sert.penyelenggara}</div>
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

  // =========================================================================
  // VIEW MODE: SIGN (Canvas Tanda Tangan + Tools + PIN 6-Digit)
  // =========================================================================
  if (viewMode === 'sign') {
    return <SignView {...{ color, setSignPin, currentRektor, setLineWidth, signPinError, setTool, canvasRef, tool, signed, handleProsesTTE, sert, signPin, lineWidth, setColor, stampImg, signPage, setSignPage, setViewMode, setStampImg }} />;
  }

  // =========================================================================
  // VIEW MODE: DETAIL (Default View)
  // =========================================================================
  return (
    <div>

      {/* Back button */}
      <BackButton to="/rektor/pengajuan" label="Kembali ke Daftar Pengajuan" />

      {/* Header Info */}
      <div className="detail-header ix-7f35be1" >
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
            <span className="detail-preview-label">Pratinjau Ilustrasi Sertifikat</span>
            <button className="btn-perbesar" type="button" onClick={handlePratinjauPDF}>
              <Eye size={14} /> Pratinjau PDF
            </button>
          </div>

          <div className="certificate-preview">
            <div className="certificate-doc">
              <div className="cert-header-row">
                <UnandLogo className="cert-logo" />
                <div className="cert-univ-name">
                  UNIVERSITAS<br />ANDALAS
                  <span className="ix-d6681c4">
                    Mitra Kerja Sama: {sert.penyelenggara}
                  </span>
                </div>
              </div>
              <p className="ix-8366ab4">
                Pratinjau ilustrasi sertifikat baku · Contoh peserta: {contohPeserta}
              </p>
              <p className="cert-title">SERTIFIKAT</p>
              <p className="cert-given">Diberikan kepada</p>
              <p className="cert-recipient">{contohPeserta.toUpperCase()}</p>
              <p className="cert-participation">atas partisipasinya sebagai peserta dalam</p>
              <p className="cert-event-name">{sert.namaKegiatan}</p>
              <p className="cert-date-place">
                {sert.tanggalPengajuan} · Universitas Andalas
              </p>

              <div className="cert-signatures">
                {/* TTD Rektor UNAND */}
                <div className="cert-sig-item">
                  <p className="cert-sig-line">Rektor UNAND</p>
                  <div
                    className="ix-eaa3ab6"
                  >
                    {signed ? (
                      signatureImg ? (
                        <img
                          src={signatureImg}
                          alt="TTD Rektor"
                          className="ix-8e8d2de"
                        />
                      ) : (
                        <span className="ix-76d06c6">
                          {currentRektor.nama}
                        </span>
                      )
                    ) : (
                      <span
                        className="ix-22d6331"
                      >
                        AREA TANDA TANGAN REKTOR
                      </span>
                    )}
                  </div>
                  <p className="cert-sig-role" style={{ color: signed ? '#15803d' : 'var(--gray-500)', fontWeight: signed ? 700 : 500 }}>
                    {signed ? (waktuTtdRektor ? `✓ TTD Terverifikasi (${waktuTtdRektor})` : '✓ TTD Terverifikasi Digital') : 'Menunggu TTE Rektor'}
                  </p>
                </div>

                {/* TTD Pimpinan Mitra */}
                <div className="cert-sig-item">
                  <p className="cert-sig-line">Pimpinan Mitra</p>
                  <div
                    className="ix-eaa3ab6"
                  >
                    <span className="ix-eb54941">
                      Pimpinan Mitra
                    </span>
                  </div>
                  <p className="cert-sig-role ix-0d92821" >
                    ✓ TTD Mitra Terverifikasi
                  </p>
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
              <span className="info-row-value ix-739a043" >{sert.template}</span>
            </div>
            <div className="info-row">
              <span className="info-row-label">Dokumen</span>
              <span className="info-row-value ix-f70c68d" >
                {sert.jumlahSertifikat} sertifikat peserta hadir
              </span>
            </div>
            <div className="info-row">
              <span className="info-row-label">Penyelenggara</span>
              <span className="info-row-value">{sert.penyelenggara}</span>
            </div>
            <div className="info-row">
              <span className="info-row-label">Sumber</span>
              <span className="info-row-value">{sert.sumber}</span>
            </div>
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

          {/* Action Card Rektor (Identik dengan Mitra) */}
          <div className="info-card ix-b4c4077" >
            <p className="info-card-title ix-75648e1" >Tindakan Pengesahan</p>
            <p className="ix-32e8260">
              Periksa isi dokumen sebelum membubuhkan tanda tangan elektronik dan PIN resmi.
            </p>

            {/* Tombol Pratinjau PDF Resmi */}
            <button type="button" className="btn-perbesar ix-72b389a" onClick={handlePratinjauPDF}
              
            >
              <FileText size={15} /> Pratinjau PDF Resmi
            </button>

            {/* Tombol Tanda Tangan jika belum ditandatangani */}
            {!signed ? (
              <button type="button" className="btn-upload ix-ec36eb4" onClick={() => { setSignPin(''); setSignPinError(''); setStampImg(null); setSignPage(1); setTool('pen'); setViewMode('sign'); }}
                
              >
                <ShieldCheck size={16} /> Konfirmasi dan Tanda Tangani
              </button>
            ) : (
              <div
                className="ix-8ed92f5"
              >
                <CheckCircle2 size={18} />
                <span>Sertifikat batch kegiatan telah ditandatangani secara resmi oleh Rektor UNAND.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
