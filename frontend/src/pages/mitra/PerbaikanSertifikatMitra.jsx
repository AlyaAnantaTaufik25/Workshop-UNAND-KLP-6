import { useState } from 'react';
import {
  Search,
  FileText,
  CheckCircle2,
  ArrowRight,
  Clock,
  SearchX,
} from 'lucide-react';
import { usePortalData } from '../../context/PortalData';
import { certificatesApi } from '../../api';
import { usePagination } from '../../components/Pagination';
import { toast } from '../../components/Dialog';
import Select from '../../components/Select';
import useUrlState from '../../hooks/useUrlState';
import { statusConfig } from './perbaikan/shared';
import FormView from './perbaikan/FormView';
import DetailView from './perbaikan/DetailView';
import useOnChange from '../../hooks/useOnChange';
import './mitra-static.css';

export default function PerbaikanSertifikatMitra() {
  const { mitraPerbaikan, reload } = usePortalData();
  const [data, setData] = useState(mitraPerbaikan);
  useOnChange(mitraPerbaikan, next => setData(next));
  const [search, setSearch] = useUrlState('q');
  const [filterStatus, setFilterStatus] = useUrlState('status');

  // 3 Tampilan Utama: 'list' (Tampilan 1), 'detail' (Tampilan 2), 'form' (Tampilan 3)
  const [viewMode, setViewMode] = useState('list');
  const [selectedId, setSelectedId] = useState(null);

  // Form Koreksi State (Tampilan 3)
  const [formNama, setFormNama] = useState('');
  const [formNomor, setFormNomor] = useState('');
  const [formKeterangan, setFormKeterangan] = useState('');
  const [, setFormBerkas] = useState(null);
  const [formBerkasNama, setFormBerkasNama] = useState('');
  const [perluTtdUlang, setPerluTtdUlang] = useState('ya'); // 'ya' | 'tidak'

  // Modal State
  const [showTolakModal, setShowTolakModal] = useState(false);
  const [alasanTolak, setAlasanTolak] = useState('');
  const [showOldCertModal, setShowOldCertModal] = useState(false);

  // Toast seragam (komponen Dialog global)
  const showToast = (msg) => toast(msg, { tone: /gagal|salah|tidak|ditolak/i.test(msg) ? 'error' : 'success' });

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
  // Paginasi tabel
  const { pageItems: pg_filtered, pager: pager_filtered } = usePagination(filtered, 10);

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
  const handleSimpanKoreksi = async (e) => {
    e.preventDefault();
    // Menyetujui perbaikan -> dokumen pengganti terbit (diteruskan ke Rektor bila perlu TTE ulang)
    try {
      if (selectedItem.status === 'menunggu') await certificatesApi.processCorrection(selectedItem.id, { action: 'proses' });
      await certificatesApi.processCorrection(selectedItem.id, {
        action: 'selesai',
        note: formKeterangan,
        changes: [{ field: 'recipient', newValue: formNama }, { field: 'degree', newValue: formNama.split(',').slice(1).join(',').trim() }],
      });
    } catch (err) {
      showToast(err.message);
      return;
    }
    reload();
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
  const handleConfirmTolak = async (e) => {
    e.preventDefault();
    if (!alasanTolak.trim()) return;
    try {
      await certificatesApi.processCorrection(selectedItem.id, { action: 'tolak', note: alasanTolak.trim() });
    } catch (err) {
      showToast(err.message);
      return;
    }
    reload();

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
    return <FormView {...{ setFormBerkasNama, formNama, setFormNama, handleSimpanKoreksi, perluTtdUlang, setFormKeterangan, formNomor, formKeterangan, formBerkasNama, setViewMode, setFormBerkas, selectedItem, setPerluTtdUlang }} />;
  }

  // =========================================================================
  // TAMPILAN 2: HALAMAN DETAIL PERBAIKAN SERTIFIKAT
  // =========================================================================
  if (viewMode === 'detail' && selectedItem) {
    return <DetailView {...{ handleConfirmTolak, setShowOldCertModal, showOldCertModal, setShowTolakModal, handleTerimaPengajuan, showTolakModal, setViewMode, setAlasanTolak, selectedItem, alasanTolak }} />;
  }

  // =========================================================================
  // TAMPILAN 1: HALAMAN DAFTAR PERBAIKAN SERTIFIKAT (DEFAULT)
  // =========================================================================
  return (
    <div className="mitra-stack">

      {/* Header Halaman */}
      <div className="mitra-list-header">
        <div className="mitra-intro">
          <h2 className="ix-f185995">Perbaikan Sertifikat</h2>
          <p>Kelola dan tindak lanjuti pengajuan perbaikan sertifikat.</p>
        </div>
      </div>

      {/* Ringkasan Jumlah Pengajuan (Cards dengan Ikon Formal) */}
      <div className="mitra-stats-grid">
        <div className="mitra-stat-box">
          <div className="mitra-stat-top">
            <p className="mitra-stat-title">Total Pengajuan</p>
            <div className="mitra-stat-icon ix-dcce3b1" >
              <FileText size={18} />
            </div>
          </div>
          <p className="mitra-stat-val">{String(totalPengajuan).padStart(2, '0')}</p>
        </div>

        <div className="mitra-stat-box">
          <div className="mitra-stat-top">
            <p className="mitra-stat-title">Menunggu</p>
            <div className="mitra-stat-icon ix-347542b" >
              <Clock size={18} />
            </div>
          </div>
          <p className="mitra-stat-val ix-b3a24dc" >{String(totalMenunggu).padStart(2, '0')}</p>
        </div>

        <div className="mitra-stat-box">
          <div className="mitra-stat-top">
            <p className="mitra-stat-title">Selesai</p>
            <div className="mitra-stat-icon ix-d21faf7" >
              <CheckCircle2 size={18} />
            </div>
          </div>
          <p className="mitra-stat-val ix-71d61ad" >{String(totalSelesai).padStart(2, '0')}</p>
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
        <Select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">Semua status</option>
          <option value="menunggu">Menunggu</option>
          <option value="diproses">Sedang Diproses</option>
          <option value="selesai">Selesai</option>
          <option value="ditolak">Ditolak</option>
        </Select>
      </div>

      {/* Tabel Pengajuan */}
      <div className="mitra-table-card">
        <table className="mitra-table">
          <thead>
            <tr>
              <th className="ix-edae378">No.</th>
              <th>Nama Peserta</th>
              <th>Kegiatan</th>
              <th>Tanggal Pengajuan</th>
              <th>Jenis Kesalahan</th>
              <th className="ix-36e6dcd">Status</th>
              <th className="ix-9347349">Aksi</th>
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
              pg_filtered.map((item, idx) => {
                const cfg = statusConfig[item.status] ?? statusConfig.menunggu;
                return (
                  <tr key={item.id}>
                    {/* No. */}
                    <td className="ix-46d1f74">
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
                    <td className="ix-03ace97">
                      {item.namaKegiatan}
                    </td>

                    {/* Tanggal Pengajuan */}
                    <td className="ix-2b68f42">
                      {item.tanggalPengajuan}
                    </td>

                    {/* Jenis Kesalahan */}
                    <td className="ix-7f35999">
                      <span className="ix-1960846">
                        {item.jenisPerbaikan}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="ix-36e6dcd">
                      <span className={cfg.className}>
                        <i></i> {cfg.label}
                      </span>
                    </td>

                    {/* Aksi: Lihat Detail */}
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
