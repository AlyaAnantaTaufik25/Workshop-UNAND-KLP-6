import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  Clock,
  ShieldCheck,
  Lock,
  X,
  Check,
} from 'lucide-react';
import { mitraTandaTangan, currentMitra } from './data';
import UnandLogo from '../../components/UnandLogo';

const statusConfig = {
  'menunggu-ttd': {
    label: 'Menunggu TTD',
    className: 'mitra-badge mitra-badge-menunggu',
  },
  'menunggu-rektor': {
    label: 'Menunggu Rektor',
    className: 'mitra-badge mitra-badge-diproses',
  },
  'diterbitkan': {
    label: 'Diterbitkan',
    className: 'mitra-badge mitra-badge-sudah-ttd',
  },
  'sudah-ditandatangani': {
    label: 'Sudah Ditandatangani',
    className: 'mitra-badge mitra-badge-sudah-ttd',
  },
  'selesai': {
    label: 'Selesai',
    className: 'mitra-badge mitra-badge-selesai-proses',
  },
};

export default function DetailTandaTanganMitra() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(() => {
    return mitraTandaTangan.find(d => String(d.id) === String(id)) || mitraTandaTangan[0];
  });

  const [showSignModal, setShowSignModal] = useState(false);
  const [passphrase, setPassphrase] = useState('123456');
  const [setujuPernyataan, setSetujuPernyataan] = useState(true);
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const isSignedMitra =
    item.statusTandaTangan === 'diterbitkan' ||
    item.statusTandaTangan === 'sudah-ditandatangani' ||
    item.statusTandaTangan === 'menunggu-rektor' ||
    item.statusTandaTangan === 'selesai';

  const cfg = statusConfig[item.statusTandaTangan] ?? statusConfig['menunggu-ttd'];

  const handleProsesTTE = (e) => {
    e.preventDefault();
    if (!setujuPernyataan) return;

    const waktuSekarang =
      new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }) + ' WIB';

    const newStatus = item.perluRektor ? 'menunggu-rektor' : 'diterbitkan';

    setItem(prev => ({
      ...prev,
      statusTandaTangan: newStatus,
      waktuTtdMitra: waktuSekarang,
      penandatanganMitra: currentMitra.nama,
    }));

    setShowSignModal(false);
    showToast(
      item.perluRektor
        ? 'TTE Mitra berhasil dibubuhkan. Berkas diteruskan untuk TTE Rektor UNAND.'
        : 'TTE Mitra berhasil dibubuhkan. Sertifikat batch kegiatan telah selesai ditandatangani.'
    );
  };

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
  <title>Sertifikat_${item.namaKegiatan.replace(/\s+/g, '_')}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; margin: 0; padding: 24px; background: #f8fafc; color: #111827; }
    .action-bar { position: sticky; top: 0; background: #ffffff; border-bottom: 2px solid #14532d; padding: 12px 24px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
    .btn { padding: 8px 16px; border-radius: 6px; font-size: 13.5px; font-weight: 600; cursor: pointer; border: none; }
    .btn-print { background: #14532d; color: #ffffff; }
    .btn-close { background: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; }
    .cert-frame { max-width: 900px; margin: 0 auto; background: #ffffff; border: 8px double #14532d; padding: 44px 50px; text-align: center; border-radius: 4px; box-shadow: 0 8px 30px rgba(0,0,0,0.08); }
    .header-logo { display: flex; justify-content: center; align-items: center; gap: 14px; margin-bottom: 20px; }
    .univ-name { font-size: 16px; font-weight: 800; color: #14532d; letter-spacing: 0.5px; }
    .mitra-name { font-size: 13px; font-weight: 700; color: #4b5563; }
    .cert-title { font-size: 26px; font-weight: 900; color: #14532d; letter-spacing: 2px; margin: 16px 0 6px; }
    .cert-no { font-family: monospace; font-size: 13px; color: #64748b; margin-bottom: 20px; }
    .cert-giver { font-size: 14px; color: #475569; font-style: italic; margin-bottom: 8px; }
    .cert-recipient { font-size: 24px; font-weight: 800; color: #0f172a; border-bottom: 2px solid #14532d; display: inline-block; padding: 0 24px 6px; margin-bottom: 16px; }
    .cert-reason { font-size: 14px; color: #334155; margin-bottom: 8px; }
    .cert-event { font-size: 18px; font-weight: 700; color: #14532d; margin-bottom: 20px; }
    .cert-date { font-size: 13px; color: #64748b; margin-bottom: 40px; }
    .ttd-grid { display: flex; justify-content: space-between; margin-top: 30px; padding: 0 40px; }
    .ttd-box { width: 240px; text-align: center; font-size: 12.5px; }
    .ttd-qr { width: 70px; height: 70px; margin: 12px auto; background: #ecfdf5; border: 1px dashed #14532d; display: grid; place-items: center; font-size: 10px; color: #14532d; font-weight: 700; border-radius: 6px; }
    .ttd-name { font-weight: 700; color: #0f172a; margin-top: 6px; border-bottom: 1px solid #94a3b8; padding-bottom: 4px; }
    @media print {
      .no-print { display: none !important; }
      body { padding: 0; background: #fff; }
      .cert-frame { border: 6px double #14532d; box-shadow: none; margin: 0; padding: 30px 40px; }
      @page { size: landscape; margin: 10mm; }
    }
  </style>
</head>
<body>
  <div class="action-bar no-print">
    <div>
      <strong style="color: #14532d; font-size: 15px;">Pratinjau Sertifikat Resmi</strong>
      <span style="font-size: 12px; color: #64748b; margin-left: 8px;">(Contoh • ${item.namaKegiatan})</span>
    </div>
    <div style="display: flex; gap: 8px;">
      <button class="btn btn-print" onclick="window.print()">🖨️ Cetak / Simpan PDF</button>
      <button class="btn btn-close" onclick="window.close()">Tutup</button>
    </div>
  </div>

  <div class="cert-frame">
    <div class="header-logo">
      <div>
        <div class="univ-name">UNIVERSITAS ANDALAS</div>
        <div class="mitra-name">KERJA SAMA RESMI ${item.mitra.toUpperCase()}</div>
      </div>
    </div>

    <div class="cert-title">SERTIFIKAT PENGHARGAAN</div>
    <div class="cert-no">Nomor: ${item.nomorSK}</div>

    <div class="cert-giver">Diberikan kepada:</div>
    <div class="cert-recipient">${item.penerimaContoh || 'Nama Peserta'}</div>

    <div class="cert-reason">Atas partisipasinya yang berdedikasi sebagai peserta dalam kegiatan:</div>
    <div class="cert-event">${item.namaKegiatan}</div>

    <div class="cert-date">Diselenggarakan di Padang pada tanggal ${item.tanggalKegiatan}</div>

    <div class="ttd-grid">
      <div class="ttd-box">
        <div>Rektor Universitas Andalas</div>
        <div class="ttd-qr">
          ${item.perluRektor ? 'QR RESMI<br/>REKTOR' : 'TIDAK<br/>DIPERLUKAN'}
        </div>
        <div class="ttd-name">Prof. Dr. Efa Yonnedi, S.E., MPPM</div>
        <div style="color: #64748b; font-size: 11px;">Tanda Tangan Elektronik</div>
      </div>

      <div class="ttd-box">
        <div>Pimpinan ${item.mitra}</div>
        <div class="ttd-qr" style="${isSignedMitra ? 'background: #dcfce7; border-color: #166534;' : 'background: #fff7ed; border-color: #ea580c;'}">
          ${isSignedMitra ? 'TTE VALID<br/>MITRA' : 'MENUNGGU<br/>TTD MITRA'}
        </div>
        <div class="ttd-name">${currentMitra.nama}</div>
        <div style="color: #64748b; font-size: 11px;">
          ${isSignedMitra ? 'Telah Ditandatangani Elektronik' : 'Pimpinan Kerja Sama Mitra'}
        </div>
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

      {/* Back Button */}
      <div>
        <button
          type="button"
          className="mitra-back-btn"
          onClick={() => navigate('/mitra/tanda-tangan')}
        >
          <ArrowLeft size={16} /> Kembali ke Daftar Kegiatan
        </button>
      </div>

      {/* Header Detail */}
      <div className="mitra-list-header">
        <div className="mitra-intro">
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--mitra-green)', letterSpacing: '0.6px', textTransform: 'uppercase' }}>
            STATUS DOKUMEN
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 2 }}>
            <h2 style={{ margin: 0 }}>Detail Kegiatan Sertifikat</h2>
            <span className={cfg.className}>{cfg.label}</span>
          </div>
          <p>Tinjau isi dokumen sertifikat kegiatan sebelum membubuhkan tanda tangan elektronik.</p>
        </div>
      </div>

      {/* ── 2 KOLOM: PRATINJAU & INFO ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24, alignItems: 'start' }}>
        {/* KIRI: PRATINJAU */}
        <div className="mitra-profil-container" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: 0 }}>Pratinjau Ilustrasi Sertifikat</h3>
            <span style={{ fontSize: 11.5, color: '#6B7280' }}>Format Baku Resmi UNAND</span>
          </div>

          <div className="cert-preview-wrapper" style={{ margin: 0, padding: '16px' }}>
            <div className="cert-preview-box">
              <div className="cert-logo-row">
                <UnandLogo style={{ width: 38, height: 38 }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--green-800)' }}>UNIVERSITAS ANDALAS</div>
                  <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>Mitra Kerja Sama: {item.mitra}</div>
                </div>
              </div>

              <div className="cert-divider" />
              <div className="cert-label-sertifikat">SERTIFIKAT</div>
              <div className="cert-diberikan">Diberikan kepada</div>
              <div className="cert-nama">{item.penerimaContoh || 'Nama Peserta'}</div>
              <div className="cert-atas">atas partisipasinya dalam</div>
              <div className="cert-kegiatan">{item.namaKegiatan}</div>
              <div className="cert-tanggal">Padang, {item.tanggalKegiatan}</div>

              <div className="cert-ttd-row" style={{ marginTop: 24 }}>
                <div className="cert-ttd">
                  <div className="cert-ttd-line" />
                  <div className="cert-ttd-title">Rektor UNAND</div>
                  <div className="cert-ttd-sub" style={{ fontSize: 10 }}>
                    {item.perluRektor
                      ? item.statusTandaTangan === 'diterbitkan' || item.statusTandaTangan === 'selesai'
                        ? '✓ TTE Rektor Sah' : 'Menunggu TTE Rektor'
                      : 'Tidak Diperlukan'}
                  </div>
                </div>

                <div className="cert-ttd">
                  <div style={{
                    padding: '4px 8px', borderRadius: 4, marginBottom: 4,
                    background: isSignedMitra ? '#DCFCE7' : '#FEF3C7',
                    border: isSignedMitra ? '1px solid #86EFAC' : '1px dashed #F59E0B',
                    fontSize: 10, fontWeight: 700,
                    color: isSignedMitra ? '#15803d' : '#B45309',
                  }}>
                    {isSignedMitra ? '✓ TTE MITRA TERVERIFIKASI' : 'AREA TANDA TANGAN MITRA'}
                  </div>
                  <div className="cert-ttd-line" />
                  <div className="cert-ttd-title">{currentMitra.nama}</div>
                  <div className="cert-ttd-sub" style={{ fontSize: 10 }}>
                    {isSignedMitra ? item.waktuTtdMitra || 'Tanda Tangan Elektronik Sah' : 'Perwakilan Mitra (Menunggu TTD)'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p style={{ textAlign: 'center', fontSize: 12, color: '#6B7280', marginTop: 10, marginBottom: 0 }}>
            Pratinjau ilustrasi sertifikat · Contoh peserta: <strong>{item.penerimaContoh || '-'}</strong>
          </p>
        </div>

        {/* KANAN: INFO + TINDAKAN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="mitra-profil-container" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: 15.5, fontWeight: 700, color: '#111827', margin: '0 0 16px 0' }}>Informasi Kegiatan</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13.5 }}>
              {[
                { label: 'Nama Kegiatan', value: <strong style={{ color: '#14532d', textAlign: 'right', maxWidth: 220 }}>{item.namaKegiatan}</strong> },
                { label: 'Jenis', value: item.jenis },
                { label: 'Mitra', value: item.mitra },
                {
                  label: 'Sumber', value: (
                    <span style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: 4, padding: '2px 8px', fontSize: 12, fontWeight: 600, color: '#0369A1' }}>
                      {item.sumber}
                    </span>
                  )
                },
                { label: 'Nomor SK', value: <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#334155', fontSize: 12 }}>{item.nomorSK}</span> },
                { label: 'Jumlah Sertifikat', value: <span style={{ color: '#14532d', fontWeight: 700 }}>{item.jumlahSertifikat} Sertifikat</span> },
                { label: 'Tanggal Pengajuan', value: item.tanggalPengajuan },
                {
                  label: 'TTE Rektor', value: (
                    <span style={{ fontWeight: 600, color: item.perluRektor ? '#0369A1' : '#15803d' }}>
                      {item.perluRektor ? 'Diperlukan' : 'Tidak Perlu'}
                    </span>
                  )
                },
                { label: 'Status', value: <span className={cfg.className}>{cfg.label}</span> },
                {
                  label: 'Waktu TTE Mitra', value: (
                    <span style={{ color: isSignedMitra ? '#15803d' : '#B45309', fontWeight: 600, fontSize: 12.5 }}>
                      {item.waktuTtdMitra || 'Belum Ditandatangani'}
                    </span>
                  )
                },
              ].map((row, i, arr) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    paddingBottom: i < arr.length - 1 ? 8 : 0,
                    borderBottom: i < arr.length - 1 ? '1px solid #F1F5F9' : 'none',
                  }}
                >
                  <span style={{ color: '#64748B' }}>{row.label}</span>
                  <span style={{ color: '#334155', textAlign: 'right' }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tindakan */}
          <div className="mitra-profil-container" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: 15.5, fontWeight: 700, color: '#111827', margin: '0 0 10px 0' }}>Tindakan</h3>
            <p style={{ fontSize: 12.5, color: '#6B7280', margin: '0 0 16px 0' }}>
              Periksa isi sertifikat pada pratinjau sebelum melakukan tanda tangan resmi.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button
                type="button"
                className="mitra-btn mitra-btn--secondary"
                onClick={handlePratinjauPDF}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <FileText size={16} /> Pratinjau PDF
              </button>

              {item.statusTandaTangan === 'menunggu-ttd' ? (
                <button
                  type="button"
                  className="mitra-btn"
                  onClick={() => setShowSignModal(true)}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <ShieldCheck size={16} /> Konfirmasi dan Tanda Tangani
                </button>
              ) : item.statusTandaTangan === 'menunggu-rektor' ? (
                <div style={{ background: '#E0F2FE', border: '1px solid #BAE6FD', borderRadius: 8, padding: '12px 14px', fontSize: 12.5, color: '#0369A1', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Clock size={18} />
                  <span>TTE Mitra berhasil dibubuhkan. Menunggu proses tanda tangan dari Rektor UNAND.</span>
                </div>
              ) : (
                <div style={{ background: '#DCFCE7', border: '1px solid #86EFAC', borderRadius: 8, padding: '12px 14px', fontSize: 12.5, color: '#15803d', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircle2 size={18} />
                  <span>Sertifikat batch kegiatan telah ditandatangani secara resmi.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── MODAL TTE ── */}
      {showSignModal && (
        <div
          onClick={() => setShowSignModal(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.55)', backdropFilter: 'blur(3px)', display: 'grid', placeItems: 'center', zIndex: 1050, padding: 16 }}
        >
          <div
            style={{ maxWidth: 480, width: '100%', background: '#FFFFFF', borderRadius: 12, overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15)' }}
            onClick={e => e.stopPropagation()}
          >
            <form onSubmit={handleProsesTTE}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#EBF5EE', color: '#14532d', display: 'grid', placeItems: 'center' }}>
                    <ShieldCheck size={22} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#111827' }}>Konfirmasi Tanda Tangan Elektronik</h3>
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: '#6B7280' }}>Pemberian tanda tangan digital resmi pada sertifikat</p>
                  </div>
                </div>
                <button type="button" onClick={() => setShowSignModal(false)} style={{ background: 'transparent', border: 'none', color: '#9CA3AF', cursor: 'pointer' }}>
                  <X size={18} />
                </button>
              </div>

              <div style={{ padding: '20px 24px' }}>
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, padding: '12px 16px', fontSize: 12.5, marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>Identitas Penandatangan:</span>
                    <strong style={{ color: '#0F172A' }}>{currentMitra.nama}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>Jabatan & Instansi:</span>
                    <span style={{ color: '#334155' }}>Pimpinan {item.mitra}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>Nomor SK:</span>
                    <span style={{ fontFamily: 'monospace', color: '#14532d', fontWeight: 600 }}>{item.nomorSK}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>Kegiatan:</span>
                    <strong style={{ color: '#334155', textAlign: 'right', maxWidth: 220 }}>{item.namaKegiatan}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>Jumlah Sertifikat:</span>
                    <strong style={{ color: '#14532d' }}>{item.jumlahSertifikat} sertifikat</strong>
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 6 }}>
                    PIN / Passphrase TTE Resmi
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="password"
                      value={passphrase}
                      onChange={e => setPassphrase(e.target.value)}
                      required
                      className="mitra-profil-input"
                      placeholder="Masukkan PIN TTE Anda"
                      style={{ paddingLeft: 36 }}
                    />
                    <Lock size={16} color="#9CA3AF" style={{ position: 'absolute', left: 12, top: 15 }} />
                  </div>
                  <span style={{ fontSize: 11.5, color: '#6B7280', marginTop: 4, display: 'block' }}>
                    Sistem mencatat waktu penandatanganan dan kode hash keabsahan elektronik.
                  </span>
                </div>

                <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 12.5, color: '#374151', lineHeight: 1.5, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={setujuPernyataan}
                    onChange={e => setSetujuPernyataan(e.target.checked)}
                    style={{ accentColor: '#14532d', marginTop: 3, width: 16, height: 16 }}
                  />
                  <span>
                    Saya telah memeriksa pratinjau sertifikat ini dan menyetujui pembubuhan tanda tangan elektronik resmi selaku penanggung jawab mitra kegiatan.
                  </span>
                </label>
              </div>

              <div style={{ padding: '14px 24px', background: '#F8FAFC', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" onClick={() => setShowSignModal(false)} className="mitra-profil-btn-batal">Batal</button>
                <button
                  type="submit"
                  disabled={!setujuPernyataan || !passphrase}
                  className="mitra-profil-btn-simpan"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, opacity: !setujuPernyataan || !passphrase ? 0.6 : 1 }}
                >
                  <Check size={16} /> Bubuhkan Tanda Tangan Sekarang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
