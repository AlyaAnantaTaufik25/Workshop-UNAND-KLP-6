import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import UnandLogo from '../../../components/UnandLogo';
import { statusConfig } from './shared';
import '../mitra-static.css';

/** Tampilan dipisah dari TandaTanganMitra.jsx */
export default function DetailView({ handlePratinjauPDF, setSignPinError, setSignPin, currentMitra, setSignPage, setTool, setViewMode, selectedItem, setStampImg }) {
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
          <div className="ix-86a9eb1">
            <h2 className="ix-75648e1">Detail Sertifikat</h2>
            <span className={cfg.className}>{cfg.label}</span>
          </div>
          <p>Tinjau isi dokumen sertifikat kegiatan sebelum membubuhkan tanda tangan.</p>
        </div>
      </div>

      {/* ── 2 KOLOM UTAMA: PRATINJAU ILUSTRASI SERTIFIKAT & INFORMASI DOKUMEN ── */}
      <div className="ix-00faf49">
        {/* SISI KIRI: PRATINJAU ILUSTRASI SERTIFIKAT */}
        <div className="mitra-profil-container ix-cb120a0" >
          <div className="ix-d386188">
            <h3 className="ix-6e08798">
              Pratinjau Ilustrasi Sertifikat
            </h3>
            <span className="ix-e9e7311">
              Format Baku Resmi UNAND
            </span>
          </div>

          <div className="cert-preview-wrapper ix-9664601" >
            <div className="cert-preview-box">
              <div className="cert-logo-row">
                <UnandLogo />
                <div>
                  <div className="ix-72341e8">
                    UNIVERSITAS ANDALAS
                  </div>
                  <div className="ix-3353a72">
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
              <div className="cert-ttd-row ix-51b6c18" >
                {/* TTD Rektor */}
                <div className="cert-ttd">
                  <div className="cert-ttd-line" />
                  <div className="cert-ttd-title">Rektor UNAND</div>
                  <div className="cert-ttd-sub ix-38cb2e1" >
                    {selectedItem.perluRektor
                      ? selectedItem.statusTandaTangan === 'diterbitkan' || selectedItem.statusTandaTangan === 'selesai'
                        ? '✓ TTD Rektor Sah'
                        : 'Menunggu TTD Rektor'
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
                      fontSize: 11,
                      fontWeight: 700,
                      color: isSignedMitra ? '#15803d' : '#B45309',
                    }}
                  >
                    {isSignedMitra ? '✓ TTD MITRA TERVERIFIKASI' : 'AREA TANDA TANGAN MITRA'}
                  </div>
                  <div className="cert-ttd-line" />
                  <div className="cert-ttd-title">{currentMitra.nama}</div>
                  <div className="cert-ttd-sub ix-38cb2e1" >
                    {isSignedMitra ? selectedItem.waktuTtdMitra || 'Tanda Tangan Sah' : 'Perwakilan Mitra (Menunggu TTD)'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p className="ix-cd6319f">
            Pratinjau ilustrasi sertifikat · Contoh peserta: <strong>{selectedItem.penerimaContoh || '-'}</strong>
          </p>
        </div>

        {/* SISI KANAN: INFORMASI KEGIATAN BATCH & TINDAKAN */}
        <div className="ix-d165583">
          {/* Tabel Informasi Kegiatan Batch */}
          <div className="mitra-profil-container ix-cb120a0" >
            <h3 className="ix-6430d3c">
              Informasi Kegiatan
            </h3>

            <div className="ix-d1ab608">
              <div className="ix-c3bc1ca">
                <span className="ix-758c699">Nama Kegiatan</span>
                <strong className="ix-5ba4bd0">
                  {selectedItem.namaKegiatan}
                </strong>
              </div>

              <div className="ix-c3bc1ca">
                <span className="ix-758c699">Jenis Kegiatan</span>
                <span className="ix-0adc26a">{selectedItem.jenis}</span>
              </div>

              <div className="ix-c3bc1ca">
                <span className="ix-758c699">Mitra</span>
                <span className="ix-0adc26a">{selectedItem.mitra}</span>
              </div>

              <div className="ix-c3bc1ca">
                <span className="ix-758c699">Sumber</span>
                <span className="ix-6edfe9b">
                  {selectedItem.sumber}
                </span>
              </div>

              <div className="ix-c3bc1ca">
                <span className="ix-758c699">Nomor SK</span>
                <span className="ix-10d2aca">
                  {selectedItem.nomorSK}
                </span>
              </div>

              <div className="ix-c3bc1ca">
                <span className="ix-758c699">Jumlah Sertifikat</span>
                <span className="ix-46290f4">{selectedItem.jumlahSertifikat} Sertifikat</span>
              </div>

              <div className="ix-c3bc1ca">
                <span className="ix-758c699">Tanggal Pengajuan</span>
                <span className="ix-0adc26a">{selectedItem.tanggalPengajuan}</span>
              </div>

              <div className="ix-eef7c68">
                <span className="ix-758c699">Status</span>
                <span className={cfg.className}>{cfg.label}</span>
              </div>
            </div>
          </div>

          {/* Kartu Tindakan */}
          <div className="mitra-profil-container ix-cb120a0" >
            <h3 className="ix-95e712f">
              Tindakan
            </h3>
            <p className="ix-18645b2">
              Periksa isi sertifikat pada pratinjau sebelum melakukan tanda tangan resmi.
            </p>

            <div className="ix-b4c4077">
              {/* Tombol Pratinjau PDF (Harus ada agar Mitra dapat memeriksa dokumen) */}
              <button type="button" className="mitra-btn mitra-btn--secondary ix-bfe7ab0" onClick={handlePratinjauPDF}
                
              >
                <FileText size={16} /> Pratinjau PDF
              </button>

              {/* Tombol Konfirmasi TTE jika status menunggu-ttd */}
              {selectedItem.statusTandaTangan === 'menunggu-ttd' ? (
                <button type="button" className="mitra-btn ix-bfe7ab0" onClick={() => { setSignPin(''); setSignPinError(''); setStampImg(null); setSignPage(1); setTool('pen'); setViewMode('sign'); }}
                  
                >
                  <ShieldCheck size={16} /> Konfirmasi dan Tanda Tangani
                </button>
              ) : selectedItem.statusTandaTangan === 'menunggu-rektor' ? (
                <div
                  className="ix-997f23b"
                >
                  <Clock size={18} />
                  <span>Tanda tangan berhasil dibubuhkan. Menunggu proses tanda tangan dari Rektor UNAND.</span>
                </div>
              ) : (
                <div
                  className="ix-125e101"
                >
                  <CheckCircle2 size={18} />
                  <span>Sertifikat batch kegiatan telah ditandatangani secara resmi.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
