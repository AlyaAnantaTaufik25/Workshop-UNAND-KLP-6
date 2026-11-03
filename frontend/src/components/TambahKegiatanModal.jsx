import { useState } from 'react';
import { X, Upload } from 'lucide-react';

const jenisOptions = ['Workshop', 'Seminar', 'Kuliah Umum', 'Pelatihan', 'Konferensi'];
const mitraOptions = ['PT Semen Padang', 'Bank Nagari', 'Fakultas Ekonomi dan Bisnis UNAND', 'UNAND', 'Lainnya'];
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
  deskripsi: '',
  tema: '',
  pemateri: '',
  manfaat: '',
  targetPeserta: '',
  penyelenggara: 'PT Semen Padang',
  poster: null,
  tanggal: '',
  waktuMulai: '09:00',
  waktuSelesai: '15:30',
  gedung: 'Convention Hall',
  ruangan: 'Ruang Utama',
  pembukaan: '',
  penutupan: '',
  kuotaJenis: 'Terbatas',
  kuota: 120,
};

export default function TambahKegiatanModal({ onClose, onSave, editData = null }) {
  // Pre-fill form when editing
  const initialForm = editData
    ? {
        judul: editData.nama || '',
        jenis: editData.jenis || 'Workshop',
        deskripsi: editData.deskripsi || '',
        tema: editData.tema || '',
        pemateri: (editData.narasumber || []).join(', '),
        manfaat: editData.manfaat || '',
        targetPeserta: editData.targetPeserta || '',
        penyelenggara: editData.penyelenggara || 'PT Semen Padang',
        poster: null,
        tanggal: editData.tanggalRaw || '',
        waktuMulai: editData.waktuMulai || '09:00',
        waktuSelesai: editData.waktuSelesai || '15:30',
        gedung: editData.gedung || 'Convention Hall',
        ruangan: editData.ruangan || 'Ruang Utama',
        pembukaan: editData.pembukaan || '',
        penutupan: editData.penutupan || '',
        kuotaJenis: editData.kuota ? 'Terbatas' : 'Tanpa Batas',
        kuota: editData.kuota || 120,
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

  const handleSubmit = (status) => {
    const payload = { ...form, status, id: editData?.id };
    onSave?.(payload);
    onClose();
  };


  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>

        {/* ── Header ── */}
        <div className="modal-header">
          <div>
            <p className="modal-header-crumb">WORKSHOP UNAND</p>
            <h2 className="modal-header-title">{editData ? 'Edit Kegiatan' : 'Tambah Kegiatan'}</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* ── Scrollable Body ── */}
        <div className="modal-body">

          {/* ── 01 Informasi Kegiatan ── */}
          <div className="modal-section">
            <div className="modal-section-header">
              <span className="modal-section-num">01</span>
              <span className="modal-section-label">Informasi Kegiatan</span>
            </div>

            <div className="modal-grid-2">
              <div className="form-group">
                <label className="form-label">Judul kegiatan <span className="req">*</span></label>
                <input
                  className="form-input"
                  placeholder="Nama kegiatan..."
                  value={form.judul}
                  onChange={e => set('judul', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Jenis kegiatan <span className="req">*</span></label>
                <select
                  className="form-input"
                  value={form.jenis}
                  onChange={e => set('jenis', e.target.value)}
                >
                  {jenisOptions.map(j => <option key={j}>{j}</option>)}
                </select>
              </div>
            </div>

            <div className="modal-grid-2">
              <div className="form-group">
                <label className="form-label">Deskripsi kegiatan <span className="req">*</span></label>
                <textarea
                  className="form-input form-textarea"
                  placeholder="Deskripsikan kegiatan..."
                  value={form.deskripsi}
                  onChange={e => set('deskripsi', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Tema <span className="req">*</span></label>
                <input
                  className="form-input"
                  placeholder="Tema kegiatan..."
                  value={form.tema}
                  onChange={e => set('tema', e.target.value)}
                />
              </div>
            </div>

            <div className="modal-grid-2">
              <div className="form-group">
                <label className="form-label">Pemateri / narasumber <span className="req">*</span></label>
                <input
                  className="form-input"
                  placeholder="Nama pemateri..."
                  value={form.pemateri}
                  onChange={e => set('pemateri', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Manfaat / benefit <span className="req">*</span></label>
                <textarea
                  className="form-input form-textarea form-textarea--sm"
                  placeholder="Manfaat mengikuti kegiatan..."
                  value={form.manfaat}
                  onChange={e => set('manfaat', e.target.value)}
                />
              </div>
            </div>

            <div className="modal-grid-2">
              <div className="form-group">
                <label className="form-label">Target peserta <span className="req">*</span></label>
                <input
                  className="form-input"
                  placeholder="Contoh: Mahasiswa dan umum"
                  value={form.targetPeserta}
                  onChange={e => set('targetPeserta', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Penyelenggara / Mitra <span className="req">*</span></label>
                <select
                  className="form-input"
                  value={form.penyelenggara}
                  onChange={e => set('penyelenggara', e.target.value)}
                >
                  {mitraOptions.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Poster kegiatan <span className="form-label-opt">(opsional)</span></label>
              <label className="file-upload-label">
                <Upload size={15} />
                <span>{posterName || 'Pilih File · Tidak ada file yang dipilih'}</span>
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handlePosterChange}
                />
              </label>
            </div>
          </div>

          {/* ── 02 Pelaksanaan ── */}
          <div className="modal-section">
            <div className="modal-section-header">
              <span className="modal-section-num">02</span>
              <span className="modal-section-label">Pelaksanaan</span>
            </div>

            <div className="modal-grid-2">
              <div className="form-group">
                <label className="form-label">Tanggal <span className="req">*</span></label>
                <input
                  className="form-input"
                  type="date"
                  value={form.tanggal}
                  onChange={e => set('tanggal', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Waktu mulai <span className="req">*</span></label>
                <input
                  className="form-input"
                  type="time"
                  value={form.waktuMulai}
                  onChange={e => set('waktuMulai', e.target.value)}
                />
              </div>
            </div>

            <div className="modal-grid-2">
              <div className="form-group">
                <label className="form-label">Waktu selesai <span className="req">*</span></label>
                <input
                  className="form-input"
                  type="time"
                  value={form.waktuSelesai}
                  onChange={e => set('waktuSelesai', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Gedung <span className="req">*</span></label>
                <select
                  className="form-input"
                  value={form.gedung}
                  onChange={e => handleGedungChange(e.target.value)}
                >
                  {gedungOptions.map(g => <option key={g}>{g}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Ruangan <span className="req">*</span></label>
              <select
                className="form-input form-input--half"
                value={form.ruangan}
                onChange={e => set('ruangan', e.target.value)}
              >
                {(ruanganMap[form.gedung] ?? []).map(r => <option key={r}>{r}</option>)}
              </select>
              <p className="form-hint">
                Koordinat dan radius mengikuti master luas.{' '}
                <a href="#" className="humas-link">Pemantauan gedung tetap melalui SIPKAS.</a>
              </p>
            </div>
          </div>

          {/* ── 03 Pendaftaran ── */}
          <div className="modal-section">
            <div className="modal-section-header">
              <span className="modal-section-num">03</span>
              <span className="modal-section-label">Pendaftaran</span>
            </div>

            <div className="modal-grid-2">
              <div className="form-group">
                <label className="form-label">Pembukaan pendaftaran <span className="req">*</span></label>
                <input
                  className="form-input"
                  type="date"
                  value={form.pembukaan}
                  onChange={e => set('pembukaan', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Penutupan pendaftaran <span className="req">*</span></label>
                <input
                  className="form-input"
                  type="date"
                  value={form.penutupan}
                  onChange={e => set('penutupan', e.target.value)}
                />
              </div>
            </div>

            <div className="modal-grid-2">
              <div className="form-group">
                <label className="form-label">Ketentuan kuota <span className="req">*</span></label>
                <select
                  className="form-input"
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
          <button className="modal-btn modal-btn-batal" onClick={onClose}>Batal</button>
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
