import { useState } from 'react';
import { X, Calendar, Clock } from 'lucide-react';

const jenisOptions = ['Workshop', 'Seminar', 'Kuliah Umum', 'Pelatihan', 'Konferensi'];
const jenisPelaksanaanOptions = ['Offline', 'Online'];
const mitraOptions = ['PT Semen Padang', 'Bank Nagari', 'Fakultas Ekonomi dan Bisnis UNAND', 'Fakultas Teknologi Informasi UNAND', 'UNAND', 'Lainnya'];
const gedungOptions = ['Convention Hall', 'Gedung Rektorat', 'Gedung Fakultas', 'Aula Utama'];
const ruanganMap = {
  'Convention Hall':   ['Ruang Utama', 'Ruang A', 'Ruang B', 'Ruang C'],
  'Gedung Rektorat':   ['Ruang Sidang Lantai 4', 'Ruang Sidang Lantai 3', 'Aula Rektorat'],
  'Gedung Fakultas':   ['Aula Fakultas', 'Ruang Seminar', 'Ruang Kelas Besar'],
  'Aula Utama':        ['Aula Utama', 'Lobby'],
};

const defaultForm = {
  judul: '',
  jenis: 'Workshop',
  jenisPelaksanaan: 'Offline',
  deskripsi: '',
  tema: '',
  pemateri: '',
  manfaat: '',
  targetPeserta: '',
  penyelenggara: 'PT Semen Padang',
  poster: null,
  tanggalMulai: '',
  tanggalSelesai: '',
  waktuMulai: '09:00',
  waktuSelesai: '15:30',
  gedung: '',
  ruangan: '',
  pembukaan: '',
  penutupan: '',
  kuotaJenis: 'Terbatas',
  kuota: 120,
};

export default function TambahKegiatanModal({ onClose, onSave, editData = null }) {
  const initialForm = editData
    ? {
        judul:            editData.nama || editData.judul || '',
        jenis:            editData.jenis || 'Workshop',
        jenisPelaksanaan: editData.jenisPelaksanaan || (editData.lokasi?.toLowerCase() === 'online' ? 'Online' : 'Offline'),
        deskripsi:        editData.deskripsi || '',
        tema:             editData.tema || '',
        pemateri:         editData.pemateri || (Array.isArray(editData.narasumber) ? editData.narasumber.join(', ') : ''),
        manfaat:          editData.manfaat || '',
        targetPeserta:    editData.targetPeserta || '',
        penyelenggara:    editData.penyelenggara || 'PT Semen Padang',
        poster:           null,
        tanggalMulai:     editData.tanggalMulai || '',
        tanggalSelesai:   editData.tanggalSelesai || editData.tanggalMulai || '',
        waktuMulai:       editData.waktuMulai || '09:00',
        waktuSelesai:     editData.waktuSelesai || '15:30',
        gedung:           editData.gedung || '',
        ruangan:          editData.ruangan || '',
        pembukaan:        editData.pembukaan || '',
        penutupan:        editData.penutupan || '',
        kuotaJenis:       editData.kuota != null ? 'Terbatas' : 'Tanpa Batas',
        kuota:            editData.kuota || 120,
      }
    : defaultForm;

  const [form, setForm] = useState(initialForm);
  const [posterName, setPosterName] = useState('');

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleGedungChange = (val) => {
    set('gedung', val);
    set('ruangan', ruanganMap[val]?.[0] ?? '');
  };

  const handlePosterChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      set('poster', file);
      setPosterName(file.name);
    }
  };

  const hitungDurasiHari = () => {
    if (!form.tanggalMulai || !form.tanggalSelesai) return 0;
    const start = new Date(form.tanggalMulai);
    const end = new Date(form.tanggalSelesai);
    const diffTime = end - start;
    if (isNaN(diffTime) || diffTime < 0) return 0;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const durasiHari = hitungDurasiHari();

  const handleSubmit = (status) => {
    const tanggalDisplay = form.tanggalMulai && form.tanggalSelesai
      ? (form.tanggalMulai === form.tanggalSelesai ? form.tanggalMulai : `${form.tanggalMulai} – ${form.tanggalSelesai}`)
      : (form.tanggalMulai || '-');

    const payload = {
      ...form,
      tanggal: tanggalDisplay,
      lokasi: form.gedung ? `${form.gedung} · ${form.ruangan || 'Ruang Utama'}` : 'Online',
      status,
      id: editData?.id,
    };
    onSave?.(payload);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box humas-tambah-modal" onClick={e => e.stopPropagation()}>

        {/* ── Header ── */}
        <div className="modal-header">
          <div>
            <p className="modal-header-crumb">WORKSHOP UNAND</p>
            <h2 className="modal-header-title">{editData ? 'Edit Kegiatan' : 'Tambah Kegiatan'}</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Tutup">
            <X size={16} />
          </button>
        </div>

        {/* ── Scrollable Body ── */}
        <div className="modal-body">

          {/* ── 01 — Informasi Kegiatan ── */}
          <div className="modal-section">
            <h3 className="modal-section-title">01 — Informasi Kegiatan</h3>

            {/* Row 1: Judul kegiatan & Jenis kegiatan */}
            <div className="modal-grid-2">
              <div className="form-group">
                <label className="form-label">Judul kegiatan <span className="req">*</span></label>
                <input
                  className="form-input"
                  placeholder=""
                  value={form.judul}
                  onChange={e => set('judul', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Jenis kegiatan <span className="req">*</span></label>
                <select
                  className="form-input form-select"
                  value={form.jenis}
                  onChange={e => set('jenis', e.target.value)}
                >
                  {jenisOptions.map(j => <option key={j} value={j}>{j}</option>)}
                </select>
              </div>
            </div>

            {/* Row 2: Jenis Pelaksanaan & Deskripsi kegiatan */}
            <div className="modal-grid-2">
              <div className="form-group">
                <label className="form-label">Jenis Pelaksanaan <span className="req">*</span></label>
                <select
                  className="form-input form-select"
                  value={form.jenisPelaksanaan}
                  onChange={e => set('jenisPelaksanaan', e.target.value)}
                >
                  {jenisPelaksanaanOptions.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Deskripsi kegiatan <span className="req">*</span></label>
                <textarea
                  className="form-input form-textarea"
                  rows={3}
                  value={form.deskripsi}
                  onChange={e => set('deskripsi', e.target.value)}
                />
              </div>
            </div>

            {/* Row 3: Tema & Pemateri / narasumber */}
            <div className="modal-grid-2">
              <div className="form-group">
                <label className="form-label">Tema <span className="req">*</span></label>
                <input
                  className="form-input"
                  value={form.tema}
                  onChange={e => set('tema', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Pemateri / narasumber <span className="req">*</span></label>
                <input
                  className="form-input"
                  value={form.pemateri}
                  onChange={e => set('pemateri', e.target.value)}
                />
              </div>
            </div>

            {/* Row 4: Manfaat / benefit & Target peserta */}
            <div className="modal-grid-2">
              <div className="form-group">
                <label className="form-label">Manfaat / benefit <span className="req">*</span></label>
                <textarea
                  className="form-input form-textarea"
                  rows={3}
                  value={form.manfaat}
                  onChange={e => set('manfaat', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Target peserta <span className="req">*</span></label>
                <input
                  className="form-input"
                  value={form.targetPeserta}
                  onChange={e => set('targetPeserta', e.target.value)}
                />
              </div>
            </div>

            {/* Row 5: Penyelenggara / Mitra & Poster kegiatan */}
            <div className="modal-grid-2">
              <div className="form-group">
                <label className="form-label">Penyelenggara / Mitra <span className="req">*</span></label>
                <select
                  className="form-input form-select"
                  value={form.penyelenggara}
                  onChange={e => set('penyelenggara', e.target.value)}
                >
                  {mitraOptions.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Poster kegiatan <span className="form-label-opt">(opsional)</span></label>
                <label className="custom-file-input-box">
                  <span className="file-box-text">
                    {posterName ? posterName : 'Pilih File Tidak ada file yang dipilih'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handlePosterChange}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* ── 02 — Pelaksanaan ── */}
          <div className="modal-section">
            <h3 className="modal-section-title">02 — Pelaksanaan</h3>

            {/* Row 1: Tanggal Mulai & Tanggal Selesai */}
            <div className="modal-grid-2">
              <div className="form-group">
                <label className="form-label">Tanggal Mulai <span className="req">*</span></label>
                <div className="input-with-icon-wrap">
                  <input
                    className="form-input"
                    type="date"
                    value={form.tanggalMulai}
                    onChange={e => set('tanggalMulai', e.target.value)}
                  />
                  <Calendar size={15} className="input-field-icon" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Tanggal Selesai <span className="req">*</span></label>
                <div className="input-with-icon-wrap">
                  <input
                    className="form-input"
                    type="date"
                    value={form.tanggalSelesai}
                    onChange={e => set('tanggalSelesai', e.target.value)}
                  />
                  <Calendar size={15} className="input-field-icon" />
                </div>
              </div>
            </div>

            {/* Row 2: Waktu mulai & Waktu selesai */}
            <div className="modal-grid-2">
              <div className="form-group">
                <label className="form-label">Waktu mulai <span className="req">*</span></label>
                <div className="input-with-icon-wrap">
                  <input
                    className="form-input"
                    type="text"
                    placeholder="09.00"
                    value={form.waktuMulai}
                    onChange={e => set('waktuMulai', e.target.value)}
                  />
                  <Clock size={15} className="input-field-icon" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Waktu selesai <span className="req">*</span></label>
                <div className="input-with-icon-wrap">
                  <input
                    className="form-input"
                    type="text"
                    placeholder="15.30"
                    value={form.waktuSelesai}
                    onChange={e => set('waktuSelesai', e.target.value)}
                  />
                  <Clock size={15} className="input-field-icon" />
                </div>
              </div>
            </div>

            {/* Row 3: Gedung & Ruangan */}
            <div className="modal-grid-2">
              <div className="form-group">
                <label className="form-label">Gedung <span className="req">*</span></label>
                <select
                  className="form-input form-select"
                  value={form.gedung}
                  onChange={e => handleGedungChange(e.target.value)}
                >
                  <option value="">Pilih gedung</option>
                  {gedungOptions.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Ruangan <span className="req">*</span></label>
                <select
                  className="form-input form-select"
                  value={form.ruangan}
                  onChange={e => set('ruangan', e.target.value)}
                >
                  <option value="">Pilih ruangan</option>
                  {(ruanganMap[form.gedung] ?? []).map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>

            {/* Info Box */}
            <div className="modal-info-box">
              Jumlah hari pelaksanaan: {durasiHari} hari. Peserta mendaftar satu kali untuk seluruh rangkaian kegiatan.
            </div>
            <p className="modal-info-subtext">
              Koordinat dan radius mengikuti master lokasi. Peminjaman gedung tetap melalui SIPRAS.
            </p>
          </div>

          {/* ── 03 — Pendaftaran ── */}
          <div className="modal-section">
            <h3 className="modal-section-title">03 — Pendaftaran</h3>

            {/* Row 1: Pembukaan pendaftaran & Penutupan pendaftaran */}
            <div className="modal-grid-2">
              <div className="form-group">
                <label className="form-label">Pembukaan pendaftaran <span className="req">*</span></label>
                <div className="input-with-icon-wrap">
                  <input
                    className="form-input"
                    type="date"
                    value={form.pembukaan}
                    onChange={e => set('pembukaan', e.target.value)}
                  />
                  <Calendar size={15} className="input-field-icon" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Penutupan pendaftaran <span className="req">*</span></label>
                <div className="input-with-icon-wrap">
                  <input
                    className="form-input"
                    type="date"
                    value={form.penutupan}
                    onChange={e => set('penutupan', e.target.value)}
                  />
                  <Calendar size={15} className="input-field-icon" />
                </div>
              </div>
            </div>

            {/* Row 2: Ketentuan kuota & Jumlah kuota */}
            <div className="modal-grid-2">
              <div className="form-group">
                <label className="form-label">Ketentuan kuota <span className="req">*</span></label>
                <select
                  className="form-input form-select"
                  value={form.kuotaJenis}
                  onChange={e => set('kuotaJenis', e.target.value)}
                >
                  <option value="Terbatas">Terbatas</option>
                  <option value="Tanpa Batas">Tanpa Batas</option>
                </select>
              </div>
              {form.kuotaJenis === 'Terbatas' && (
                <div className="form-group">
                  <label className="form-label">Jumlah kuota <span className="req">*</span></label>
                  <input
                    className="form-input"
                    type="number"
                    min={1}
                    value={form.kuota}
                    onChange={e => set('kuota', e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>

        </div>

        {/* ── Footer Buttons ── */}
        <div className="modal-footer">
          <button className="modal-btn modal-btn-batal" onClick={onClose}>
            Batal
          </button>
          <button className="modal-btn modal-btn-draft" onClick={() => handleSubmit('draft')}>
            Simpan Draft
          </button>
          <button className="modal-btn modal-btn-publish" onClick={() => handleSubmit('publik')}>
            Publikasikan
          </button>
        </div>

      </div>
    </div>
  );
}
