import {
  ArrowLeft,
  Upload,
  CheckCircle2,
  Check,
} from 'lucide-react';
import '../mitra-static.css';

/** Tampilan dipisah dari PerbaikanSertifikatMitra.jsx */
export default function FormView({ setFormBerkasNama, formNama, setFormNama, handleSimpanKoreksi, perluTtdUlang, setFormKeterangan, formNomor, formKeterangan, formBerkasNama, setViewMode, setFormBerkas, selectedItem, setPerluTtdUlang }) {
  return (
    <div className="mitra-stack">
      <div>
        <button
          type="button"
          className="mitra-back-btn"
          onClick={() => setViewMode('detail')}
        >
          <ArrowLeft size={16} /> Kembali ke Detail Pengajuan
        </button>
      </div>

      <div className="mitra-intro">
        <h2>Form Perbaikan Sertifikat</h2>
        <p>Perbarui informasi sertifikat berdasarkan pengajuan peserta.</p>
      </div>

      {/* Ringkasan Peserta & Kegiatan */}
      <div
        className="ix-af1277e"
      >
        <div>
          <span className="ix-6b8e380">
            Peserta:
          </span>
          <strong className="ix-aa15f44">
            {selectedItem.namaPeserta}
          </strong>
        </div>
        <div>
          <span className="ix-6b8e380">
            Kegiatan:
          </span>
          <span className="ix-8baf194">
            {selectedItem.namaKegiatan}
          </span>
        </div>
      </div>

      {/* Form Koreksi */}
      <form onSubmit={handleSimpanKoreksi}>
        <div className="mitra-profil-container">
          {/* Bagian: Data Sertifikat */}
          <div className="ix-7f35be1">
            <h3 className="ix-4a513d5">
              Data Sertifikat
            </h3>
            <p className="ix-233f5ca">
              Koreksi informasi sertifikat yang sesuai dengan permohonan peserta.
            </p>
          </div>

          <div className="mitra-profil-grid">
            {/* Nama Peserta */}
            <div className="mitra-profil-field">
              <label>
                Nama Peserta <span className="req">*</span>
              </label>
              <input
                type="text"
                value={formNama}
                onChange={e => setFormNama(e.target.value)}
                required
                className="mitra-profil-input"
              />
              <span className="ix-5faf6cd">
                <Check size={14} /> Data telah diperbaiki sesuai permintaan.
              </span>
            </div>

            {/* Nomor Sertifikat */}
            <div className="mitra-profil-field">
              <label>Nomor Sertifikat</label>
              <input type="text" value={formNomor} readOnly className="mitra-profil-input mitra-profil-input--readonly ix-ea06501" />
              <span className="ix-c7e951b">
                Nomor sertifikat ter-generate otomatis dan berurutan oleh sistem.
              </span>
            </div>
          </div>

          {/* Keterangan Perbaikan */}
          <div className="mitra-profil-field ix-8ba6493" >
            <label>Keterangan Perbaikan</label>
            <textarea rows={3} value={formKeterangan} onChange={e => setFormKeterangan(e.target.value)} className="mitra-profil-input ix-5237fd7" />
          </div>

          <div className="mitra-profil-divider ix-b4315b5" />

          {/* Bagian: Dokumen Sertifikat */}
          <div className="ix-804129a">
            <h3 className="ix-def8629">
              Dokumen Sertifikat
            </h3>
            <p className="ix-233f5ca">
              Sertifikat versi terbaru · Unggah dokumen PDF hasil perbaikan.
            </p>
          </div>

          <label
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px 20px',
              border: formBerkasNama ? '1.5px solid #14532d' : '1.5px dashed #D1D5DB',
              borderRadius: 10,
              background: formBerkasNama ? '#F0FDF4' : '#F9FAFB',
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'all 0.15s',
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: formBerkasNama ? '#DCFCE7' : '#EBF5EE',
                color: '#14532d',
                display: 'grid',
                placeItems: 'center',
                marginBottom: 10,
              }}
            >
              {formBerkasNama ? <CheckCircle2 size={24} /> : <Upload size={22} />}
            </div>
            <strong className="ix-58ca68d">
              {formBerkasNama ? formBerkasNama : 'Unggah PDF'}
            </strong>
            <p style={{ fontSize: 12, color: formBerkasNama ? '#15803d' : '#6B7280', margin: '3px 0 0 0' }}>
              {formBerkasNama
                ? 'Berkas PDF hasil perbaikan siap disimpan · Klik untuk mengganti'
                : 'Klik untuk memilih berkas dokumen PDF hasil koreksi (Maks. 10 MB)'}
            </p>
            <input
              type="file"
              accept=".pdf"
              className="ix-3e2e7c3"
              onChange={e => {
                const f = e.target.files?.[0];
                if (f) {
                  setFormBerkas(f);
                  setFormBerkasNama(f.name);
                }
              }}
            />
          </label>

          <div className="mitra-profil-divider ix-b4315b5" />

          {/* Bagian: Tanda Tangan Ulang */}
          <div className="ix-804129a">
            <h3 className="ix-def8629">
              Tanda Tangan Ulang
            </h3>
            <p className="ix-233f5ca">
              Tentukan apakah sertifikat memerlukan tanda tangan ulang.
            </p>
          </div>

          <div className="ix-5ca1747">
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '14px 18px',
                borderRadius: 8,
                border: perluTtdUlang === 'ya' ? '1.5px solid #14532d' : '1px solid #E5E7EB',
                background: perluTtdUlang === 'ya' ? '#F0FDF4' : '#FFFFFF',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              <input
                type="radio"
                name="ttd_ulang"
                value="ya"
                checked={perluTtdUlang === 'ya'}
                onChange={() => setPerluTtdUlang('ya')}
                className="ix-21dd825"
              />
              <div>
                <strong className="ix-3c1244b">
                  Ya, perlu tanda tangan ulang
                </strong>
                <span className="ix-d1d52fb">
                  Sertifikat akan dikirimkan ke antrean TTE pimpinan mitra.
                </span>
              </div>
            </label>

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '14px 18px',
                borderRadius: 8,
                border: perluTtdUlang === 'tidak' ? '1.5px solid #14532d' : '1px solid #E5E7EB',
                background: perluTtdUlang === 'tidak' ? '#F0FDF4' : '#FFFFFF',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              <input
                type="radio"
                name="ttd_ulang"
                value="tidak"
                checked={perluTtdUlang === 'tidak'}
                onChange={() => setPerluTtdUlang('tidak')}
                className="ix-21dd825"
              />
              <div>
                <strong className="ix-3c1244b">
                  Tidak perlu tanda tangan ulang
                </strong>
                <span className="ix-d1d52fb">
                  Hanya pembaruan metadata tanpa perombakan tanda tangan.
                </span>
              </div>
            </label>
          </div>

          <div className="mitra-profil-divider ix-d0c91f6" />

          {/* Tombol Aksi */}
          <div className="mitra-profil-actions">
            <button
              type="button"
              className="mitra-profil-btn-batal"
              onClick={() => setViewMode('detail')}
            >
              Batal
            </button>
            <button type="submit" className="mitra-profil-btn-simpan ix-8a5df5b"
              
            >
              <Check size={16} /> Simpan Hasil Perbaikan
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
