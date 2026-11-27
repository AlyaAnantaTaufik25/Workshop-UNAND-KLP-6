import { useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  Search,
  ArrowRight,
  CheckCircle2,
  Clock,
  SearchX,
  Building2,
} from 'lucide-react';
import { usePortalData } from '../../context/PortalData';
import { certificatesApi } from '../../api';
import { usePagination } from '../../components/Pagination';
import { dialog, toast } from '../../components/Dialog';
import Select from '../../components/Select';
import useUrlState from '../../hooks/useUrlState';
import { PERIODE_OPTIONS, inPeriode } from '../../utils/periode';
import { statusConfig } from './tandaTangan/shared';
import DetailView from './tandaTangan/DetailView';
import SignView from './tandaTangan/SignView';
import useOnChange from '../../hooks/useOnChange';
import './mitra-static.css';

export default function TandaTanganMitra() {
  const { mitraTandaTangan, currentMitra, reload } = usePortalData();
  const [data, setData] = useState(mitraTandaTangan);
  useOnChange(mitraTandaTangan, next => setData(next));
  const [search, setSearch] = useUrlState('q');
  const [filterJenis, setFilterJenis] = useUrlState('jenis');
  const [filterKegiatan, setFilterKegiatan] = useUrlState('kegiatan');
  const [filterStatus, setFilterStatus] = useUrlState('status');
  const [filterTanggal, setFilterTanggal] = useUrlState('periode');

  // Mode View: 'list' | 'detail' | 'sign'
  const { id: routeId } = useParams();
  const [viewMode, setViewMode] = useState(routeId ? 'detail' : 'list');
  const [selectedId, setSelectedId] = useState(routeId ? Number(routeId) : null);

  // State untuk halaman tanda tangan
  const [tool, setTool] = useState('pen');
  const [lineWidth, setLineWidth] = useState(3);
  const [color, setColor] = useState('#000000');
  const [stampImg, setStampImg] = useState(null);
  const [signPin, setSignPin] = useState('');
  const [signPinError, setSignPinError] = useState('');
  const [signPage, setSignPage] = useState(1);
  const canvasRef = useRef(null);

  // Toast seragam (komponen Dialog global)
  const showToast = (msg) => toast(msg, { tone: /gagal|salah|tidak|ditolak/i.test(msg) ? 'error' : 'success' });

  const selectedItem = data.find((d) => d.id === selectedId) || data[0];

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
    const matchTanggal  = inPeriode(d.isoTanggal, filterTanggal);
    return matchSearch && matchJenis && matchKegiatan && matchStatus && matchTanggal;
  });
  // Paginasi tabel
  const { pageItems: pg_filtered, pager: pager_filtered } = usePagination(filtered, 10);

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

  // Konfirmasi dan Pembubuhan TTE — dipanggil dari view 'sign'
  const handleProsesTTE = async () => {
    if (!signPin || signPin.length !== 6) {
      setSignPinError('PIN harus 6 digit');
      return;
    }
    if (canvasRef.current?.isEmpty()) {
      setSignPinError('Harap gambar tanda tangan terlebih dahulu');
      return;
    }
    // PIN diverifikasi server; status lanjut ke Rektor atau langsung terbit
    try {
      await certificatesApi.sign(selectedItem.id, signPin, canvasRef.current?.getDataURL());
    } catch (err) {
      setSignPinError(err.message);
      return;
    }
    reload();

    const waktuSekarang = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }) + ' WIB';

    const newStatus = selectedItem.perluRektor ? 'menunggu-rektor' : 'diterbitkan';

    setData((prev) =>
      prev.map((d) =>
        d.id === selectedItem.id
          ? {
              ...d,
              statusTandaTangan: newStatus,
              waktuTtdMitra: waktuSekarang,
              penandatanganMitra: currentMitra.nama || 'Ahmad Rizal',
              signatureImg: canvasRef.current?.getDataURL(),
            }
          : d
      )
    );

    // reset state sign
    canvasRef.current?.clear();
    setSignPin('');
    setSignPinError('');
    setStampImg(null);
    setSignPage(1);
    setViewMode('detail');

    showToast(
      selectedItem.perluRektor
        ? 'Tanda tangan berhasil dibubuhkan. Berkas diteruskan untuk TTD Rektor UNAND.'
        : 'Tanda tangan berhasil dibubuhkan. Sertifikat batch kegiatan telah selesai ditandatangani.'
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
      dialog.alert({ title: 'Pop-up diblokir', message: 'Izinkan pop-up browser untuk melihat atau mencetak pratinjau sertifikat PDF.', tone: 'warning' });
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
          ${isSigned ? 'TTD VALID<br/>MITRA' : 'MENUNGGU<br/>TTD MITRA'}
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
    return <DetailView {...{ handlePratinjauPDF, setSignPinError, setSignPin, currentMitra, setSignPage, setTool, setViewMode, selectedItem, setStampImg }} />;
  }

  // =========================================================================
  // TAMPILAN 3: HALAMAN TANDA TANGAN TEMPLATE (canvas + tools + PIN)
  // =========================================================================
  if (viewMode === 'sign' && selectedItem) {
    return <SignView {...{ color, setSignPin, setLineWidth, signPinError, setTool, selectedItem, tool, canvasRef, handleProsesTTE, signPin, lineWidth, setColor, stampImg, signPage, setSignPage, setViewMode, setStampImg }} />;
  }

  // =========================================================================
  // TAMPILAN 1: HALAMAN DAFTAR SERTIFIKAT TTE (DEFAULT)
  // =========================================================================
  return (
    <div className="mitra-stack">

      {/* Header Halaman Sesuai Desain */}
      <div className="mitra-list-header">
        <div className="mitra-intro">
          <h2 className="ix-f185995">Tanda Tangan</h2>
          <p>Kelola proses penandatanganan sertifikat kegiatan yang menjadi kewenangan Mitra.</p>
        </div>
      </div>

      {/* Ringkasan Statistik (3 Cards dengan Ikon Formal) */}
      <div className="mitra-stats-grid">
        <div className="mitra-stat-box">
          <div className="mitra-stat-top">
            <p className="mitra-stat-title">Menunggu TTD</p>
            <div className="mitra-stat-icon ix-347542b" >
              <Clock size={18} />
            </div>
          </div>
          <p className="mitra-stat-val ix-b3a24dc" >{countMenungguTtd}</p>
        </div>

        <div className="mitra-stat-box">
          <div className="mitra-stat-top">
            <p className="mitra-stat-title">Sudah Ditandatangani</p>
            <div className="mitra-stat-icon ix-d21faf7" >
              <CheckCircle2 size={18} />
            </div>
          </div>
          <p className="mitra-stat-val ix-71d61ad" >{countSudahTtd}</p>
        </div>

        <div className="mitra-stat-box">
          <div className="mitra-stat-top">
            <p className="mitra-stat-title">Menunggu Rektor</p>
            <div className="mitra-stat-icon ix-950cb80" >
              <Building2 size={18} />
            </div>
          </div>
          <p className="mitra-stat-val ix-2e57c29" >{countMenungguRektor}</p>
        </div>
      </div>

      {/* ── BAGIAN DAFTAR SERTIFIKAT & FILTER ── */}
      <div className="ix-5007bfb">
        <h3 className="ix-a6e47fb">
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
          <Select
            value={filterJenis}
            onChange={e => setFilterJenis(e.target.value)}
          >
            <option value="">Semua jenis</option>
            <option value="Workshop">Workshop</option>
            <option value="Seminar">Seminar</option>
            <option value="Kuliah Umum">Kuliah Umum</option>
          </Select>

          {/* Filter Nama Kegiatan */}
          <Select
            value={filterKegiatan}
            onChange={e => setFilterKegiatan(e.target.value)}
            className="ix-ecb8243"
          >
            <option value="">Semua kegiatan</option>
            {kegiatanList.map(k => (
              <option key={k} value={k}>{k}</option>
            ))}
          </Select>

          {/* Filter Status Tanda Tangan */}
          <Select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
          >
            <option value="">Semua status</option>
            <option value="menunggu-ttd">Menunggu TTD</option>
            <option value="menunggu-rektor">Menunggu Rektor</option>
            <option value="diterbitkan">Diterbitkan</option>
          </Select>

          {/* Filter Periode */}
          <Select className="filter-select ix-79f72d2" value={filterTanggal} onChange={e => setFilterTanggal(e.target.value)} aria-label="Filter periode">
            {PERIODE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </Select>

          {(search || filterJenis || filterKegiatan || filterStatus || filterTanggal) && (
            <button type="button" className="mitra-btn mitra-btn--secondary ix-20b3fd9" onClick={resetFilter}
              
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
              <th className="ix-edae378">No.</th>
              <th>Nama Kegiatan</th>
              <th>Jenis</th>
              <th>Mitra</th>
              <th>Sumber</th>
              <th className="ix-36e6dcd">Jumlah Sertifikat</th>
              <th className="ix-36e6dcd">Status Tanda Tangan</th>
              <th>Tanggal Pengajuan</th>
              <th className="ix-9347349">Tindakan</th>
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
              pg_filtered.map((item, idx) => {
                const cfg = statusConfig[item.statusTandaTangan] ?? statusConfig['menunggu-ttd'];
                return (
                  <tr key={item.id}>
                    {/* 1. No */}
                    <td className="ix-46d1f74">
                      {idx + 1}
                    </td>

                    {/* 2. Nama Kegiatan */}
                    <td>
                      <strong className="mitra-activity-title ix-0552d64" onClick={() => handleBukaDetail(item)}
                      >
                        {item.namaKegiatan}
                      </strong>
                    </td>

                    {/* 3. Jenis */}
                    <td className="ix-53519af">
                      {item.jenis}
                    </td>

                    {/* 4. Mitra */}
                    <td className="ix-fc674f8">
                      {item.mitra}
                    </td>

                    {/* 5. Sumber */}
                    <td>
                      <span className={`source-tag ${item.sumber === 'UNAND' ? 'source-unand' : 'source-mitra'}`}>
                        {item.sumber}
                      </span>
                    </td>

                    {/* 6. Jumlah Sertifikat */}
                    <td className="ix-6746a68">
                      {item.jumlahSertifikat}
                    </td>

                    {/* 7. Status */}
                    <td className="ix-36e6dcd">
                      <span className={cfg.className}>
                        {cfg.label}
                      </span>
                    </td>

                    {/* 8. Tanggal Pengajuan */}
                    <td className="ix-2b68f42">
                      {item.tanggalPengajuan}
                    </td>

                    {/* 9. Tindakan */}
                    <td className="ix-36e6dcd">
                      <button type="button" className="ui-row-action" onClick={() => handleBukaDetail(item)}>
                        Lihat Detail <ArrowRight size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
          {pager_filtered}
      </div>
    </div>
  );
}
