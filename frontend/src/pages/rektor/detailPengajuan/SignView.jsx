import {
  Check,
  PenTool,
  Eraser,
  Upload,
  ShieldCheck,
  X,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import SignatureCanvas from '../../../components/SignatureCanvas';
import '../rektor-static.css';

/** Tampilan dipisah dari DetailPengajuanRektor.jsx */
export default function SignView({ color, setSignPin, currentRektor, setLineWidth, signPinError, setTool, canvasRef, tool, signed, handleProsesTTE, sert, signPin, lineWidth, setColor, stampImg, signPage, setSignPage, setViewMode, setStampImg }) {
  return (
    <div>

      {/* Header Tanda Tangan Template */}
      <div className="ix-e18bc3c">
        <div>
          <h2 className="ix-2736f7e">
            Tanda Tangan Template
          </h2>
          <p className="ix-9f4e9eb">
            Tandatangani dokumen sertifikat kegiatan: <strong>{sert.namaKegiatan}</strong>
          </p>
        </div>
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            padding: '4px 10px',
            borderRadius: 20,
            background: signed ? '#DCFCE7' : '#FEF3C7',
            color: signed ? '#15803d' : '#B45309',
          }}
        >
          {signed ? 'Sudah Ditandatangani' : 'Belum Ditandatangani'}
        </span>
      </div>

      {/* Layout 2 Kolom (Canvas + Tools di kiri, Info di kanan) */}
      <div className="ix-bc6f935">
        {/* SISI KIRI: Template Preview & Canvas */}
        <div className="ix-6479258">
          {/* Panel title */}
          <div className="ix-f2053a4">
            Template Preview & Canvas TTE
          </div>

          {/* Canvas area */}
          <div className="ix-afade10">
            <div className="ix-a4b3b72">
              {/* Dokumen Teks Latar Belakang */}
              <div className="ix-5824171">
                <div className="ix-9767892">
                  <div className="ix-aef56fc">UNIVERSITAS ANDALAS</div>
                  <div className="ix-474aa03">Mitra Kerja Sama: {sert.penyelenggara}</div>
                  <div className="ix-379b76a">SERTIFIKAT PENGHARGAAN</div>
                </div>
                <p><strong>Ketentuan dan Pengesahan Digital:</strong></p>
                <ol className="ix-cb73c78">
                  <li>Sertifikat ini diterbitkan secara sah dan berurutan oleh Universitas Andalas.</li>
                  <li>Tanda tangan digital Rektor mengesahkan partisipasi seluruh peserta dengan presensi valid.</li>
                  <li>Gunakan panel di bawah untuk menggambar tanda tangan fisik atau membubuhkan stempel resmi.</li>
                </ol>
                <div className="ix-0c358c0">
                  Area tanda tangan digital Rektor UNAND ({currentRektor.nama})
                </div>
              </div>

              {/* Canvas Overlay tempat menggambar */}
              <div className="ix-806ccfc">
                <SignatureCanvas ref={canvasRef} tool={tool} lineWidth={lineWidth} color={color} height="350px" />
              </div>

              {/* Stempel Overlay jika diupload */}
              {stampImg && (
                <img
                  src={stampImg}
                  alt="Stempel UNAND"
                  className="ix-2f1ca42"
                />
              )}
            </div>
          </div>

          {/* Tools Bar */}
          <div className="ix-73188d0">
            {/* Pen */}
            <button
              type="button"
              onClick={() => setTool('pen')}
              style={{
                padding: '5px 12px',
                borderRadius: 6,
                border: '1px solid #d1d5db',
                background: tool === 'pen' ? '#14532d' : '#fff',
                color: tool === 'pen' ? '#fff' : '#374151',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <PenTool size={14} /> Pen
            </button>

            {/* Eraser */}
            <button
              type="button"
              onClick={() => setTool('eraser')}
              style={{
                padding: '5px 12px',
                borderRadius: 6,
                border: '1px solid #d1d5db',
                background: tool === 'eraser' ? '#14532d' : '#fff',
                color: tool === 'eraser' ? '#fff' : '#374151',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Eraser size={14} /> Eraser
            </button>

            {/* Stempel Resmi */}
            <label
              className="ix-ec14521"
            >
              <ShieldCheck size={14} /> Stempel
              <input
                type="file"
                accept="image/*"
                className="ix-3e2e7c3"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = (ev) => setStampImg(ev.target.result);
                  reader.readAsDataURL(file);
                }}
              />
            </label>

            {/* Upload Gambar */}
            <label
              className="ix-ec14521"
            >
              <Upload size={14} /> Upload Gambar
              <input
                type="file"
                accept="image/*"
                className="ix-3e2e7c3"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = (ev) => setStampImg(ev.target.result);
                  reader.readAsDataURL(file);
                }}
              />
            </label>

            {/* Size Slider */}
            <div className="ix-e1bf5fc">
              Size:
              <input
                type="range"
                min={1}
                max={10}
                value={lineWidth}
                onChange={(e) => setLineWidth(Number(e.target.value))}
                className="ix-38208a7"
              />
              {lineWidth}
            </div>

            {/* Color Picker */}
            <div className="ix-3973df2">
              Color:
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="ix-b32b92d"
              />
            </div>

            {/* Clear */}
            <button
              type="button"
              onClick={() => {
                canvasRef.current?.clear();
                setStampImg(null);
              }}
              className="ix-a095b66"
            >
              <X size={14} /> Clear
            </button>
          </div>

          {/* PIN Digital Signature & Simpan TTD */}
          <div className="ix-cf27ffe">
            <label className="ix-5d93d84">
              PIN Digital Signature <span className="ix-91f6676">*</span>
            </label>
            <div className="ix-f1041c7">
              <div className="ix-f68b1b2">
                <input
                  type="password"
                  value={signPin}
                  maxLength={6}
                  placeholder="Masukkan 6-digit PIN (default: 123456)"
                  onChange={(e) => setSignPin(e.target.value)}
                  className="ix-721bee1"
                />
                {signPinError && (
                  <span className="ix-d390c88">
                    {signPinError}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={handleProsesTTE}
                className="ix-f1e761c"
              >
                <Check size={15} /> Simpan TTD
              </button>
            </div>
          </div>

          {/* Pagination Preview */}
          <div className="ix-af84281">
            <span>Halaman {signPage} dari 3</span>
            <div className="ix-fb60eee">
              <button
                type="button"
                onClick={() => setSignPage((p) => Math.max(1, p - 1))}
                disabled={signPage === 1}
                style={{
                  padding: '5px 12px',
                  borderRadius: 6,
                  border: '1px solid #d1d5db',
                  background: signPage === 1 ? '#f3f4f6' : '#fff',
                  color: signPage === 1 ? '#9CA3AF' : '#374151',
                  cursor: signPage === 1 ? 'default' : 'pointer',
                  fontSize: 13,
                }}
              >
                <ChevronLeft size={14} className="ix-49b6a84" /> Previous
              </button>
              <button
                type="button"
                onClick={() => setSignPage((p) => Math.min(3, p + 1))}
                disabled={signPage === 3}
                style={{
                  padding: '5px 12px',
                  borderRadius: 6,
                  border: '1px solid #d1d5db',
                  background: signPage === 3 ? '#f3f4f6' : '#fff',
                  color: signPage === 3 ? '#9CA3AF' : '#374151',
                  cursor: signPage === 3 ? 'default' : 'pointer',
                  fontSize: 13,
                }}
              >
                Next <ChevronRight size={14} className="ix-49b6a84" />
              </button>
            </div>
          </div>
        </div>

        {/* SISI KANAN: Template Info & Petunjuk */}
        <div className="ix-814058e">
          {/* Info card */}
          <div className="ix-b5da40d">
            <h3 className="ix-b068e7f">Template Info</h3>
            <div className="ix-a022263">
              <div>
                <span className="ix-024c3ee">Kegiatan</span>
                <div className="ix-528d9c9">{sert.namaKegiatan}</div>
              </div>
              <div>
                <span className="ix-024c3ee">Status</span>
                <div style={{ fontWeight: 700, color: signed ? '#15803d' : '#B45309', marginTop: 2 }}>
                  {signed ? 'Sudah Ditandatangani' : 'Belum Ditandatangani'}
                </div>
              </div>
              <div>
                <span className="ix-024c3ee">Jumlah Dokumen</span>
                <div className="ix-1028079">{sert.jumlahSertifikat} Sertifikat Peserta</div>
              </div>
              <div>
                <span className="ix-024c3ee">Penyelenggara</span>
                <div className="ix-1028079">{sert.penyelenggara}</div>
              </div>
            </div>
          </div>

          {/* Petunjuk Penggunaan */}
          <div className="ix-e4e3058">
            <div className="ix-b6a7336">
              <ShieldCheck size={16} color="#14532d" /> Petunjuk Penandatanganan
            </div>
            <ul className="ix-8d431f9">
              <li>Goreskan tanda tangan Anda pada canvas gambar menggunakan pen atau mouse/stylus.</li>
              <li>Upload stempel resmi UNAND bila diperlukan.</li>
              <li>Masukkan PIN 6-digit keamanan tanda tangan digital (default: <code>123456</code>).</li>
              <li>Klik tombol <strong>Simpan TTD</strong> untuk mengesahkan sertifikat batch ini.</li>
            </ul>
          </div>

          {/* Back button */}
          <button
            type="button"
            onClick={() => setViewMode('detail')}
            className="ix-d9930ed"
          >
            <ArrowLeft size={15} /> Kembali ke Detail
          </button>
        </div>
      </div>
    </div>
  );
}
