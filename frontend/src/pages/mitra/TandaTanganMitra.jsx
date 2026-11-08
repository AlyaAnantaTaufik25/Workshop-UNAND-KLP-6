import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileText,
  Clock,
  ShieldCheck,
  Lock,
  X,
  Check,
  SearchX,
  Building2,
  Users,
  CalendarDays,
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

export default function TandaTanganMitra() {
  const navigate = useNavigate();
  const [data, setData] = useState(mitraTandaTangan);
  const [search, setSearch] = useState('');
  const [filterJenis, setFilterJenis] = useState('');
  const [filterKegiatan, setFilterKegiatan] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterTanggal, setFilterTanggal] = useState('');

  // Mode View: 'list' atau 'detail'
  const [viewMode, setViewMode] = useState('list');
  const [selectedId, setSelectedId] = useState(null);

  // Modal State Konfirmasi TTE
  const [showSignModal, setShowSignModal] = useState(false);
  const [passphrase, setPassphrase] = useState('123456');
  const [setujuPernyataan, setSetujuPernyataan] = useState(true);
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const selectedItem = data.find(d => d.id === selectedId) || data[0];

  // Hitungan Statistik — per kegiatan/batch
  const countMenungguTtd      = data.filter(d => d.statusTandaTangan === 'menunggu-ttd').length;
  const countSudahTtd         = data.filter(d => d.statusTandaTangan === 'diterbitkan' || d.statusTandaTangan === 'sudah-ditandatangani' || d.statusTandaTangan === 'selesai').length;
  const countMenungguRektor   = data.filter(d => d.statusTandaTangan === 'menunggu-rektor').length;

  // Daftar Kegiatan Unik untuk Filter
  const kegiatanList = Array.from(new Set(data.map(d => d.namaKegiatan)));

  // Filter Data
  const filtered = data.filter(d => {
    const q = search.toLowerCase();
    const matchSearch =
      d.namaKegiatan.toLowerCase().includes(q) ||
      d.mitra.toLowerCase().includes(q) ||
      (d.nomorSK || '').toLowerCase().includes(q);
    const matchJenis    = filterJenis    ? d.jenis === filterJenis : true;
    const matchKegiatan = filterKegiatan ? d.namaKegiatan === filterKegiatan : true;
    const matchStatus   = filterStatus   ? d.statusTandaTangan === filterStatus : true;
    const matchTanggal  = filterTanggal  ? d.isoTanggal === filterTanggal : true;
    return matchSearch && matchJenis && matchKegiatan && matchStatus && matchTanggal;
  });

  const resetFilter = () => {
    setSearch('');
    setFilterJenis('');
    setFilterKegiatan('');
    setFilterStatus('');
    setFilterTanggal('');
  };

  const handleBukaDetail = (item) => {
    setSelectedId(item.id);
    setViewMode('detail');
  };

  // Konfirmasi dan Pembubuhan TTE
  const handleProsesTTE = (e) => {
    e.preventDefault();
    if (!setujuPernyataan) return;

    const waktuSekarang = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }) + ' WIB';

    // Jika kegiatan perlu TTE Rektor → 'menunggu-rektor', jika tidak → 'diterbitkan'
    const newStatus = selectedItem.perluRektor ? 'menunggu-rektor' : 'diterbitkan';

    setData(prev =>
      prev.map(d =>
        d.id === selectedItem.id
          ? {
              ...d,
              statusTandaTangan: newStatus,
              waktuTtdMitra: waktuSekarang,
              penandatanganMitra: currentMitra.nama || 'Ahmad Rizal',
            }
          : d
      )
    );

    setShowSignModal(false);
    showToast(
      selectedItem.perluRektor
        ? `TTE Mitra berhasil dibubuhkan. Berkas diteruskan untuk TTE Rektor UNAND.`
        : `TTE Mitra berhasil dibubuhkan. Sertifikat batch kegiatan telah selesai ditandatangani.`
    );
  };

  // Fungsi Pratinjau PDF Sertifikat Formal (contoh satu peserta dari batch)
  const handlePratinjauPDF = () => {
    const item = selectedItem;
    const isSigned = item.statusTandaTangan === 'diterbitkan' ||
                     item.statusTandaTangan === 'sudah-ditandatangani' ||
                     item.statusTandaTangan === 'selesai' ||
                     item.statusTandaTangan === 'menunggu-rektor';

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
        <div class="ttd-qr" style="${isSigned ? 'background: #dcfce7; border-color: #166534;' : 'background: #fff7ed; border-color: #ea580c;'}">
          ${isSigned ? 'TTE VALID<br/>MITRA' : 'MENUNGGU<br/>TTD MITRA'}
        </div>
        <div class="ttd-name">${currentMitra.nama}</div>
        <div style="color: #64748b; font-size: 11px;">
          ${isSigned ? 'Telah Ditandatangani Elektronik' : 'Pimpinan Kerja Sama Mitra'}
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

  // =========================================================================
  // TAMPILAN 2: DETAIL KEGIATAN BATCH & PROSES PENANDATANGANAN
  // =========================================================================
  if (viewMode === 'detail' && selectedItem) {
    const cfg = statusConfig[selectedItem.statusTandaTangan] ?? statusConfig['menunggu-ttd'];
    const isSignedMitra =
      selectedItem.statusTandaTangan === 'diterbitkan' ||
      selectedItem.statusTandaTangan === 'sudah-ditandatangani' ||
      selectedItem.statusTandaTangan === 'menunggu-rektor' ||
      selectedItem.statusTandaTangan === 'selesai';

    return (
      <div className="mitra-stack">
        {/* Back Button */}
        <div>
          <button
            type="button"
            className="mitra-back-btn"
            onClick={() => setViewMode('list')}
          >
            <ArrowLeft size={16} /> Kembali ke Daftar Sertifikat
          </button>
        </div>

        {/* Header Detail */}
        <div className="mitra-list-header">
          <div className="mitra-intro">
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--mitra-green)', letterSpacing: '0.6px', textTransform: 'uppercase' }}>
              STATUS DOKUMEN
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 2 }}>
              <h2 style={{ margin: 0 }}>Detail Sertifikat</h2>
              <span className={cfg.className}>{cfg.label}</span>
            </div>
            <p>Tinjau isi dokumen sertifikat kegiatan sebelum membubuhkan tanda tangan elektronik.</p>
          </div>
        </div>

        {/* ── 2 KOLOM UTAMA: PRATINJAU ILUSTRASI SERTIFIKAT & INFORMASI DOKUMEN ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24, alignItems: 'start' }}>
          {/* SISI KIRI: PRATINJAU ILUSTRASI SERTIFIKAT */}
          <div className="mitra-profil-container" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: 0 }}>
                Pratinjau Ilustrasi Sertifikat
              </h3>
              <span style={{ fontSize: 11.5, color: '#6B7280' }}>
                Format Baku Resmi UNAND
              </span>
            </div>

            <div className="cert-preview-wrapper" style={{ margin: 0, padding: '16px' }}>
              <div className="cert-preview-box">
                <div className="cert-logo-row">
                  <UnandLogo style={{ width: 38, height: 38 }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--green-800)' }}>
                      UNIVERSITAS ANDALAS
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>
                      Mitra Kerja Sama: {selectedItem.mitra}
                    </div>
                  </div>
                </div>

                <div className="cert-divider" />
                <div className="cert-label-sertifikat">SERTIFIKAT</div>
                <div className="cert-diberikan">Diberikan kepada</div>
                <div className="cert-nama">{selectedItem.penerimaContoh || 'Nama Peserta'}</div>
                <div className="cert-atas">atas partisipasinya dalam</div>
                <div className="cert-kegiatan">{selectedItem.namaKegiatan}</div>
                <div className="cert-tanggal">Padang, {selectedItem.tanggalKegiatan}</div>

                {/* Area Tanda Tangan */}
                <div className="cert-ttd-row" style={{ marginTop: 24 }}>
                  {/* TTD Rektor */}
                  <div className="cert-ttd">
                    <div className="cert-ttd-line" />
                    <div className="cert-ttd-title">Rektor UNAND</div>
                    <div className="cert-ttd-sub" style={{ fontSize: 10 }}>
                      {selectedItem.perluRektor
                        ? selectedItem.statusTandaTangan === 'diterbitkan' || selectedItem.statusTandaTangan === 'selesai'
                          ? '✓ TTE Rektor Sah'
                          : 'Menunggu TTE Rektor'
                        : 'Tidak Diperlukan'}
                    </div>
                  </div>

                  {/* TTD Mitra */}
                  <div className="cert-ttd">
                    <div
                      style={{
                        padding: '4px 8px',
                        borderRadius: 4,
                        marginBottom: 4,
                        background: isSignedMitra ? '#DCFCE7' : '#FEF3C7',
                        border: isSignedMitra ? '1px solid #86EFAC' : '1px dashed #F59E0B',
                        fontSize: 10,
                        fontWeight: 700,
                        color: isSignedMitra ? '#15803d' : '#B45309',
                      }}
                    >
                      {isSignedMitra ? '✓ TTE MITRA TERVERIFIKASI' : 'AREA TANDA TANGAN MITRA'}
                    </div>
                    <div className="cert-ttd-line" />
                    <div className="cert-ttd-title">{currentMitra.nama}</div>
                    <div className="cert-ttd-sub" style={{ fontSize: 10 }}>
                      {isSignedMitra ? selectedItem.waktuTtdMitra || 'Tanda Tangan Elektronik Sah' : 'Perwakilan Mitra (Menunggu TTD)'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <p style={{ textAlign: 'center', fontSize: 12, color: '#6B7280', marginTop: 10, marginBottom: 0 }}>
              Pratinjau ilustrasi sertifikat · Contoh peserta: <strong>{selectedItem.penerimaContoh || '-'}</strong>
            </p>
          </div>

          {/* SISI KANAN: INFORMASI KEGIATAN BATCH & TINDAKAN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Tabel Informasi Kegiatan Batch */}
            <div className="mitra-profil-container" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: 15.5, fontWeight: 700, color: '#111827', margin: '0 0 16px 0' }}>
                Informasi Kegiatan
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13.5 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid #F1F5F9' }}>
                  <span style={{ color: '#64748B' }}>Nama Kegiatan</span>
                  <strong style={{ color: '#14532d', textAlign: 'right', maxWidth: 220 }}>
                    {selectedItem.namaKegiatan}
                  </strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid #F1F5F9' }}>
                  <span style={{ color: '#64748B' }}>Jenis Kegiatan</span>
                  <span style={{ color: '#334155' }}>{selectedItem.jenis}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid #F1F5F9' }}>
                  <span style={{ color: '#64748B' }}>Mitra</span>
                  <span style={{ color: '#334155' }}>{selectedItem.mitra}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid #F1F5F9' }}>
                  <span style={{ color: '#64748B' }}>Sumber</span>
                  <span style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: 4, padding: '2px 8px', fontSize: 12, fontWeight: 600, color: '#0369A1' }}>
                    {selectedItem.sumber}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid #F1F5F9' }}>
                  <span style={{ color: '#64748B' }}>Nomor SK</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#334155', fontSize: 12 }}>
                    {selectedItem.nomorSK}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid #F1F5F9' }}>
                  <span style={{ color: '#64748B' }}>Jumlah Sertifikat</span>
                  <span style={{ color: '#14532d', fontWeight: 700 }}>{selectedItem.jumlahSertifikat} Sertifikat</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid #F1F5F9' }}>
                  <span style={{ color: '#64748B' }}>Tanggal Pengajuan</span>
                  <span style={{ color: '#334155' }}>{selectedItem.tanggalPengajuan}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid #F1F5F9' }}>
                  <span style={{ color: '#64748B' }}>TTE Rektor</span>
                  <span style={{ fontWeight: 600, color: selectedItem.perluRektor ? '#0369A1' : '#15803d' }}>
                    {selectedItem.perluRektor ? 'Diperlukan' : 'Tidak Perlu'}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid #F1F5F9' }}>
                  <span style={{ color: '#64748B' }}>Status</span>
                  <span className={cfg.className}>{cfg.label}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B' }}>Waktu TTE Mitra</span>
                  <span style={{ color: isSignedMitra ? '#15803d' : '#B45309', fontWeight: 600, fontSize: 12.5 }}>
                    {selectedItem.waktuTtdMitra || 'Belum Ditandatangani'}
                  </span>
                </div>
              </div>
            </div>

            {/* Kartu Tindakan */}
            <div className="mitra-profil-container" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: 15.5, fontWeight: 700, color: '#111827', margin: '0 0 10px 0' }}>
                Tindakan
              </h3>
              <p style={{ fontSize: 12.5, color: '#6B7280', margin: '0 0 16px 0' }}>
                Periksa isi sertifikat pada pratinjau sebelum melakukan tanda tangan resmi.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* Tombol Pratinjau PDF (Harus ada agar Mitra dapat memeriksa dokumen) */}
                <button
                  type="button"
                  className="mitra-btn mitra-btn--secondary"
                  onClick={handlePratinjauPDF}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <FileText size={16} /> Pratinjau PDF
                </button>

                {/* Tombol Konfirmasi TTE jika status menunggu-ttd */}
                {selectedItem.statusTandaTangan === 'menunggu-ttd' ? (
                  <button
                    type="button"
                    className="mitra-btn"
                    onClick={() => setShowSignModal(true)}
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    <ShieldCheck size={16} /> Konfirmasi dan Tanda Tangani
                  </button>
                ) : selectedItem.statusTandaTangan === 'menunggu-rektor' ? (
                  <div
                    style={{
                      background: '#E0F2FE',
                      border: '1px solid #BAE6FD',
                      borderRadius: 8,
                      padding: '12px 14px',
                      fontSize: 12.5,
                      color: '#0369A1',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <Clock size={18} />
                    <span>TTE Mitra berhasil dibubuhkan. Menunggu proses tanda tangan dari Rektor UNAND.</span>
                  </div>
                ) : (
                  <div
                    style={{
                      background: '#DCFCE7',
                      border: '1px solid #86EFAC',
                      borderRadius: 8,
                      padding: '12px 14px',
                      fontSize: 12.5,
                      color: '#15803d',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <CheckCircle2 size={18} />
                    <span>Sertifikat batch kegiatan telah ditandatangani secara resmi.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── MODAL KONFIRMASI TTE RESMI SISTEM ── */}
        {showSignModal && (
          <div
            className="modal-overlay"
            onClick={() => setShowSignModal(false)}
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
                maxWidth: 480,
                width: '100%',
                background: '#FFFFFF',
                borderRadius: 12,
                overflow: 'hidden',
                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15)',
              }}
              onClick={e => e.stopPropagation()}
            >
              <form onSubmit={handleProsesTTE}>
                {/* Modal Header */}
                <div
                  style={{
                    padding: '20px 24px',
                    borderBottom: '1px solid #F1F5F9',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: '#EBF5EE',
                        color: '#14532d',
                        display: 'grid',
                        placeItems: 'center',
                      }}
                    >
                      <ShieldCheck size={22} />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#111827' }}>
                        Konfirmasi Tanda Tangan Elektronik
                      </h3>
                      <p style={{ margin: '2px 0 0', fontSize: 12, color: '#6B7280' }}>
                        Pemberian tanda tangan digital resmi pada sertifikat
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowSignModal(false)}
                    style={{ background: 'transparent', border: 'none', color: '#9CA3AF', cursor: 'pointer' }}
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Modal Body */}
                <div style={{ padding: '20px 24px' }}>
                  {/* Info Box Penandatangan */}
                  <div
                    style={{
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: 8,
                      padding: '12px 16px',
                      fontSize: 12.5,
                      marginBottom: 16,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748B' }}>Identitas Penandatangan:</span>
                      <strong style={{ color: '#0F172A' }}>{currentMitra.nama}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748B' }}>Jabatan & Instansi:</span>
                      <span style={{ color: '#334155' }}>Pimpinan PT Semen Padang</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748B' }}>Dokumen Sertifikat:</span>
                      <span style={{ fontFamily: 'monospace', color: '#14532d', fontWeight: 600 }}>
                        {selectedItem.nomorSK}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748B' }}>Kegiatan:</span>
                      <strong style={{ color: '#334155', textAlign: 'right', maxWidth: 220 }}>{selectedItem.namaKegiatan}</strong>
                    </div>
                  </div>

                  {/* Input Passphrase TTE */}
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

                  {/* Checkbox Pernyataan Keabsahan */}
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 10,
                      fontSize: 12.5,
                      color: '#374151',
                      lineHeight: 1.5,
                      cursor: 'pointer',
                    }}
                  >
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

                {/* Modal Footer */}
                <div
                  style={{
                    padding: '14px 24px',
                    background: '#F8FAFC',
                    borderTop: '1px solid #E2E8F0',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: 10,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setShowSignModal(false)}
                    className="mitra-profil-btn-batal"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={!setujuPernyataan || !passphrase}
                    className="mitra-profil-btn-simpan"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      opacity: !setujuPernyataan || !passphrase ? 0.6 : 1,
                    }}
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

  // =========================================================================
  // TAMPILAN 1: HALAMAN DAFTAR SERTIFIKAT TTE (DEFAULT)
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

      {/* Header Halaman Sesuai Desain */}
      <div className="mitra-list-header">
        <div className="mitra-intro">
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--mitra-green)', letterSpacing: '0.6px', textTransform: 'uppercase' }}>
            Dashboard Mitra
          </span>
          <h2 style={{ margin: '2px 0 4px 0' }}>Tanda Tangan</h2>
          <p>Kelola proses penandatanganan sertifikat kegiatan yang menjadi kewenangan Mitra.</p>
        </div>
      </div>

      {/* Ringkasan Statistik (3 Cards dengan Ikon Formal) */}
      <div className="mitra-stats-grid">
        <div className="mitra-stat-box">
          <div className="mitra-stat-top">
            <p className="mitra-stat-title">Menunggu TTD</p>
            <div className="mitra-stat-icon" style={{ background: '#FEF3C7', color: '#B45309' }}>
              <Clock size={18} />
            </div>
          </div>
          <p className="mitra-stat-val" style={{ color: '#b45309' }}>{countMenungguTtd}</p>
        </div>

        <div className="mitra-stat-box">
          <div className="mitra-stat-top">
            <p className="mitra-stat-title">Sudah Ditandatangani</p>
            <div className="mitra-stat-icon" style={{ background: '#DCFCE7', color: '#15803d' }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <p className="mitra-stat-val" style={{ color: '#15803d' }}>{countSudahTtd}</p>
        </div>

        <div className="mitra-stat-box">
          <div className="mitra-stat-top">
            <p className="mitra-stat-title">Menunggu Rektor</p>
            <div className="mitra-stat-icon" style={{ background: '#E0F2FE', color: '#0369A1' }}>
              <Building2 size={18} />
            </div>
          </div>
          <p className="mitra-stat-val" style={{ color: '#0369a1' }}>{countMenungguRektor}</p>
        </div>
      </div>

      {/* ── BAGIAN DAFTAR SERTIFIKAT & FILTER ── */}
      <div style={{ marginTop: 8 }}>
        <h3 style={{ fontSize: 16.5, fontWeight: 700, color: '#111827', margin: '0 0 12px 0' }}>
          Daftar Kegiatan Sertifikat
        </h3>

        {/* Filter Bar */}
        <div className="mitra-filterbar">
          {/* Pencarian */}
          <label className="mitra-searchbox">
            <Search size={18} />
            <input
              type="search"
              placeholder="Cari nama kegiatan atau mitra..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </label>

          {/* Filter Jenis Kegiatan */}
          <select
            value={filterJenis}
            onChange={e => setFilterJenis(e.target.value)}
          >
            <option value="">Semua jenis</option>
            <option value="Workshop">Workshop</option>
            <option value="Seminar">Seminar</option>
            <option value="Kuliah Umum">Kuliah Umum</option>
          </select>

          {/* Filter Nama Kegiatan */}
          <select
            value={filterKegiatan}
            onChange={e => setFilterKegiatan(e.target.value)}
            style={{ maxWidth: 220 }}
          >
            <option value="">Semua kegiatan</option>
            {kegiatanList.map(k => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>

          {/* Filter Status Tanda Tangan */}
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
          >
            <option value="">Semua status</option>
            <option value="menunggu-ttd">Menunggu TTD</option>
            <option value="menunggu-rektor">Menunggu Rektor</option>
            <option value="diterbitkan">Diterbitkan</option>
          </select>

          {/* Filter Periode Tanggal */}
          <input
            type="date"
            className="form-input"
            value={filterTanggal}
            onChange={e => setFilterTanggal(e.target.value)}
            title="Filter Tanggal Pengajuan"
            style={{ height: 42, width: 140, padding: '0 10px', fontSize: 13 }}
          />

          {(search || filterJenis || filterKegiatan || filterStatus || filterTanggal) && (
            <button
              type="button"
              className="mitra-btn mitra-btn--secondary"
              onClick={resetFilter}
              style={{ minHeight: 42, padding: '0 14px' }}
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* ── TABEL DAFTAR KEGIATAN SERTIFIKAT (PER BATCH KEGIATAN) ── */}
      <div className="mitra-table-card">
        <table className="mitra-table">
          <thead>
            <tr>
              <th style={{ width: 45, textAlign: 'center' }}>No.</th>
              <th>Nama Kegiatan</th>
              <th>Jenis</th>
              <th>Mitra</th>
              <th>Sumber</th>
              <th style={{ textAlign: 'center' }}>Jumlah Sertifikat</th>
              <th style={{ textAlign: 'center' }}>Status Tanda Tangan</th>
              <th>Tanggal Pengajuan</th>
              <th style={{ textAlign: 'center', width: 140 }}>Tindakan</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9}>
                  <div className="mitra-empty">
                    <SearchX size={36} />
                    <p>Tidak ada kegiatan yang cocok dengan filter pencarian.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((item, idx) => {
                const cfg = statusConfig[item.statusTandaTangan] ?? statusConfig['menunggu-ttd'];
                return (
                  <tr key={item.id}>
                    {/* 1. No */}
                    <td style={{ textAlign: 'center', color: '#6B7280', fontSize: 13 }}>
                      {idx + 1}
                    </td>

                    {/* 2. Nama Kegiatan */}
                    <td>
                      <strong
                        className="mitra-activity-title"
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleBukaDetail(item)}
                      >
                        {item.namaKegiatan}
                      </strong>
                    </td>

                    {/* 3. Jenis */}
                    <td style={{ fontSize: 13, color: '#4B5563' }}>
                      {item.jenis}
                    </td>

                    {/* 4. Mitra */}
                    <td style={{ fontSize: 13, color: '#334155' }}>
                      {item.mitra}
                    </td>

                    {/* 5. Sumber */}
                    <td>
                      <span style={{
                        background: '#F0F9FF',
                        border: '1px solid #BAE6FD',
                        borderRadius: 4,
                        padding: '2px 8px',
                        fontSize: 12,
                        fontWeight: 600,
                        color: '#0369A1',
                        whiteSpace: 'nowrap',
                      }}>
                        {item.sumber}
                      </span>
                    </td>

                    {/* 6. Jumlah Sertifikat */}
                    <td style={{ textAlign: 'center', color: '#14532d', fontWeight: 700, fontSize: 13 }}>
                      {item.jumlahSertifikat}
                    </td>

                    {/* 7. Status */}
                    <td style={{ textAlign: 'center' }}>
                      <span className={cfg.className}>
                        {cfg.label}
                      </span>
                    </td>

                    {/* 8. Tanggal Pengajuan */}
                    <td style={{ fontSize: 13, color: '#4B5563', whiteSpace: 'nowrap' }}>
                      {item.tanggalPengajuan}
                    </td>

                    {/* 9. Tindakan */}
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
