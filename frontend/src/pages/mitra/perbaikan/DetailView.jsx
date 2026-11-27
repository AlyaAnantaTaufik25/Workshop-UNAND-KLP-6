import {
  Eye,
  ArrowLeft,
  FileText,
  CheckCircle2,
  X,
  Ban,
} from 'lucide-react';
import UnandLogo from '../../../components/UnandLogo';
import { statusConfig } from './shared';
import '../mitra-static.css';

/** Tampilan dipisah dari PerbaikanSertifikatMitra.jsx */
export default function DetailView({ handleConfirmTolak, setShowOldCertModal, showOldCertModal, setShowTolakModal, handleTerimaPengajuan, showTolakModal, setViewMode, setAlasanTolak, selectedItem, alasanTolak }) {
  const cfg = statusConfig[selectedItem.status] ?? statusConfig.menunggu;

  return (
    <div className="mitra-stack">
      <div>
        <button
          type="button"
          className="mitra-back-btn"
          onClick={() => setViewMode('list')}
        >
          <ArrowLeft size={16} /> Kembali ke Daftar Pengajuan
        </button>
      </div>

      <div className="mitra-list-header">
        <div className="mitra-intro">
          <div className="ix-bb438fa">
            <h2 className="ix-75648e1">Detail Pengajuan</h2>
            <span className={cfg.className}>{cfg.label}</span>
          </div>
          <p>Informasi permintaan perbaikan sertifikat peserta.</p>
        </div>
      </div>

      {/* 1. INFORMASI PESERTA DAN KEGIATAN */}
      <div className="mitra-profil-container ix-3340f59" >
        <h3 className="ix-4f9941e">
          Informasi Peserta
        </h3>
        <div className="mitra-profil-grid">
          <div className="mitra-profil-field">
            <label>Nama</label>
            <div className="ix-85a1580">
              {selectedItem.namaPeserta}
            </div>
          </div>

          <div className="mitra-profil-field">
            <label>Email</label>
            <div className="ix-413b42d">
              {selectedItem.email}
            </div>
          </div>

          <div className="mitra-profil-field">
            <label>Kegiatan</label>
            <div className="ix-72505f8">
              {selectedItem.namaKegiatan}
            </div>
          </div>

          <div className="mitra-profil-field">
            <label>Nomor Sertifikat</label>
            <div className="ix-7673cdc">
              {selectedItem.nomorSertifikat}
            </div>
          </div>
        </div>
      </div>

      {/* 2. INFORMASI PENGAJUAN PERBAIKAN */}
      <div className="mitra-profil-container ix-3340f59" >
        <h3 className="ix-4f9941e">
          Keterangan Perbaikan
        </h3>

        <div className="mitra-profil-grid ix-e63ea89" >
          <div className="mitra-profil-field">
            <label>Bagian yang salah</label>
            <div className="ix-789bf85">
              {selectedItem.bagian || selectedItem.jenisPerbaikan}
            </div>
          </div>

          <div className="mitra-profil-field">
            <label>Tanggal Pengajuan</label>
            <div className="ix-210de13">
              {selectedItem.tanggalPengajuan}
            </div>
          </div>
        </div>

        <div className="mitra-profil-field ix-7f35be1" >
          <label>Keterangan peserta</label>
          <div
            className="ix-c16690f"
          >
            {selectedItem.catatan}
          </div>
        </div>

        {/* Sertifikat Sebelumnya */}
        <div>
          <label className="ix-8cb6ac6">
            Sertifikat Sebelumnya
          </label>
          <div
            className="ix-cb254f7"
          >
            <div className="ix-7be55b0">
              <div
                className="ix-bc90020"
              >
                <FileText size={20} />
              </div>
              <div>
                <strong className="ix-19f9565">
                  Sertifikat_{selectedItem.namaPeserta.replace(/\s+/g, '_')}.pdf
                </strong>
                <span className="ix-d1d52fb">
                  Dokumen sertifikat yang perlu diperbaiki
                </span>
              </div>
            </div>

            <button type="button" className="mitra-btn mitra-btn--secondary ix-f73ebaa" onClick={() => setShowOldCertModal(true)}
              
            >
              <Eye size={14} /> Lihat Sertifikat
            </button>
          </div>
        </div>
      </div>

      {/* 3. TINDAKAN MITRA */}
      <div className="mitra-profil-container ix-03e2775"
        
      >
        <div>
          <strong className="ix-740a6d7">
            Tindakan Peninjauan Mitra
          </strong>
          <span className="ix-b2b44cc">
            Tolak jika alasan tidak valid, atau terima pengajuan untuk membuka formulir perbaikan.
          </span>
        </div>

        <div className="ix-7be55b0">
          {selectedItem.status === 'menunggu' ? (
            <>
              <button
                type="button"
                onClick={() => setShowTolakModal(true)}
                className="ix-4215d42"
              >
                Tolak
              </button>
              <button
                type="button"
                onClick={handleTerimaPengajuan}
                className="ix-e43784a"
              >
                Terima
              </button>
            </>
          ) : selectedItem.status === 'selesai' ? (
            <span className="ix-c00ffdb">
              <CheckCircle2 size={16} /> Pengajuan telah selesai diperbaiki
            </span>
          ) : selectedItem.status === 'ditolak' ? (
            <span className="ix-3032870">
              <Ban size={16} /> Pengajuan ditolak ({selectedItem.alasanTolak || 'Alasan tidak memenuhi syarat'})
            </span>
          ) : (
            <button
              type="button"
              onClick={handleTerimaPengajuan}
              className="mitra-btn"
            >
              Lanjutkan Perbaikan
            </button>
          )}
        </div>
      </div>

      {/* Modal Alasan Penolakan */}
      {showTolakModal && (
        <div className="modal-overlay ix-25fe773" onClick={() => setShowTolakModal(false)}
          
        >
          <div className="modal-box ix-7b7a01d" onClick={e => e.stopPropagation()}
          >
            <form onSubmit={handleConfirmTolak}>
              <div className="ix-319f17f">
                <h3 className="ix-e97d1c7">
                  Tolak Pengajuan Perbaikan
                </h3>
                <button
                  type="button"
                  onClick={() => setShowTolakModal(false)}
                  className="ix-7b74549"
                 aria-label="Tutup">
                  <X size={18} />
                </button>
              </div>
              <div className="ix-95454c4">
                <p className="ix-798e789">
                  Masukkan alasan penolakan agar peserta memahami mengapa permintaannya tidak dapat diterima:
                </p>
                <textarea rows={4} value={alasanTolak} onChange={e => setAlasanTolak(e.target.value)} placeholder="Contoh: Nama pada sertifikat sudah sesuai dengan KTP dan data pendaftaran awal." required className="mitra-profil-input ix-a835a91" />
              </div>
              <div className="ix-a550dbb">
                <button
                  type="button"
                  onClick={() => setShowTolakModal(false)}
                  className="mitra-profil-btn-batal"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="ix-2cdfa62"
                >
                  Konfirmasi Tolak
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Pratinjau Sertifikat Lama */}
      {showOldCertModal && (
        <div className="modal-overlay ix-25fe773" onClick={() => setShowOldCertModal(false)}
          
        >
          <div className="modal-box ix-d725328" onClick={e => e.stopPropagation()}
          >
            <div className="ix-7a0e9d7">
              <h3 className="ix-e97d1c7">
                Pratinjau Sertifikat Sebelum Diperbaiki
              </h3>
              <button
                type="button"
                onClick={() => setShowOldCertModal(false)}
                className="ix-7b74549"
               aria-label="Tutup">
                <X size={18} />
              </button>
            </div>
            <div className="ix-cb120a0">
              <div className="cert-preview-wrapper ix-75648e1" >
                <div className="cert-preview-box">
                  <div className="cert-logo-row">
                    <UnandLogo />
                    <div>
                      <div className="ix-72341e8">PT SEMEN PADANG</div>
                      <div className="ix-3353a72">Pratinjau Sertifikat Terbit Awal</div>
                    </div>
                  </div>
                  <div className="cert-divider" />
                  <div className="cert-label-sertifikat">SERTIFIKAT</div>
                  <div className="cert-diberikan">Diberikan kepada</div>
                  <div className="cert-nama ix-9598f67" >
                    {selectedItem.namaPeserta}
                  </div>
                  <div className="cert-atas">atas partisipasinya sebagai peserta dalam</div>
                  <div className="cert-kegiatan">{selectedItem.namaKegiatan}</div>
                  <div className="cert-tanggal">{selectedItem.tanggalKegiatan} · PT Semen Padang</div>
                  <div className="cert-ttd-row">
                    <div className="cert-ttd">
                      <div className="cert-ttd-line" />
                      <div className="cert-ttd-title">Rektor UNAND</div>
                    </div>
                    <div className="cert-ttd">
                      <div className="cert-ttd-line" />
                      <div className="cert-ttd-title">Pimpinan Mitra</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="ix-913865e">
              <button
                type="button"
                className="mitra-profil-btn-batal"
                onClick={() => setShowOldCertModal(false)}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
