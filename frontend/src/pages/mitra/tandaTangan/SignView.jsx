import {
  ArrowLeft,
  ShieldCheck,
  X,
  Check,
  PenTool,
  Eraser,
  Upload,
} from 'lucide-react';
import { SignatureCanvas } from './shared';
import '../mitra-static.css';

/** Tampilan dipisah dari TandaTanganMitra.jsx */
export default function SignView({ color, setSignPin, setLineWidth, signPinError, setTool, selectedItem, tool, canvasRef, handleProsesTTE, signPin, lineWidth, setColor, stampImg, signPage, setSignPage, setViewMode, setStampImg }) {
  const isSignedMitra =
    selectedItem.statusTandaTangan === 'diterbitkan' ||
    selectedItem.statusTandaTangan === 'sudah-ditandatangani' ||
    selectedItem.statusTandaTangan === 'menunggu-rektor' ||
    selectedItem.statusTandaTangan === 'selesai';

  return (
    <div className="mitra-stack">

      {/* Header */}
      <div className="ix-ef3e5cd">
        <div>
          <h2 className="ix-2736f7e">Tanda Tangan Template</h2>
          <p className="ix-9f4e9eb">
            Tandatangani template sertifikat: <strong>{selectedItem.namaKegiatan}</strong>
          </p>
        </div>
        <span style={{
          fontSize: 12,
          fontWeight: 700,
          padding: '4px 10px',
          borderRadius: 20,
          background: isSignedMitra ? '#DCFCE7' : '#FEF3C7',
          color: isSignedMitra ? '#15803d' : '#B45309',
        }}>
          {isSignedMitra ? 'Sudah Ditandatangani' : 'Belum Ditandatangani'}
        </span>
      </div>

      {/* Two-column layout */}
      <div className="ix-342022f">

        {/* LEFT: Template Preview + tools */}
        <div className="ix-6479258">
          {/* Panel title */}
          <div className="ix-f2053a4">
            Template Preview
          </div>

          {/* Canvas area */}
          <div className="ix-220ed9d">
            <div className="ix-5ff193d">
              {/* Dummy doc text */}
              <div className="ix-5824171">
                <p><strong>Instruksi Pengerjaan:</strong></p>
                <p>A. Ketentuan Umum</p>
                <ol>
                  <li>Sol ini harus diselesaikan secara berkelompok.</li>
                  <li>Anggota kelompok ditentukan oleh Dosen Pengampu.</li>
                  <li>Jawaban harus menunjukkan analisis dan argumentasi kelompok.</li>
                  <li>Setiap kelompok harus menghasilkan output: laporan analisis (pdf) + presentasi (ppt/pdf).</li>
                </ol>
                <p>B. Panduan Analisis Kasus</p>
                <ol>
                  <li>Mengidentifikasi persoalan etis, termasuk pihak yang berkepentingan.</li>
                  <li>Menerapkan prinsip etika dan kode etik profesi yang relevan.</li>
                  <li>Menganalisis alternatif tindakan, manfaat, risiko, dan konsekuensi.</li>
                </ol>
              </div>
              {/* Canvas overlay */}
              <div className="ix-d28f6d1">
                <SignatureCanvas ref={canvasRef} tool={tool} lineWidth={lineWidth} color={color} />
              </div>
              {/* Stamp overlay */}
              {stampImg && (
                <img
                  src={stampImg}
                  alt="Stamp"
                  className="ix-15766ae"
                />
              )}
            </div>
          </div>

          {/* Tools bar */}
          <div className="ix-73188d0">
            {/* Pen */}
            <button type="button" onClick={() => setTool('pen')}
              style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid #d1d5db', background: tool === 'pen' ? '#111827' : '#fff', color: tool === 'pen' ? '#fff' : '#374151', display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, cursor: 'pointer' }}>
              <PenTool size={14} /> Pen
            </button>
            {/* Eraser */}
            <button type="button" onClick={() => setTool('eraser')}
              style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid #d1d5db', background: tool === 'eraser' ? '#111827' : '#fff', color: tool === 'eraser' ? '#fff' : '#374151', display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, cursor: 'pointer' }}>
              <Eraser size={14} /> Eraser
            </button>
            {/* TTD Tersimpan */}
            <button type="button" disabled
              className="ix-e8236a2">
              <Check size={14} /> TTD Tersimpan
            </button>
            {/* Stempel */}
            <label className="ix-e55b073">
              <ShieldCheck size={14} /> Stempel
              <input type="file" accept="image/*" className="ix-3e2e7c3" onChange={(e) => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (ev) => setStampImg(ev.target.result);
                reader.readAsDataURL(file);
              }} />
            </label>
            {/* Upload Gambar */}
            <label className="ix-e55b073">
              <Upload size={14} /> Upload Gambar
              <input type="file" accept="image/*" className="ix-3e2e7c3" onChange={(e) => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (ev) => setStampImg(ev.target.result);
                reader.readAsDataURL(file);
              }} />
            </label>
            {/* Size slider */}
            <div className="ix-3973df2">
              Size:
              <input type="range" min={1} max={10} value={lineWidth} onChange={(e) => setLineWidth(Number(e.target.value))}
                className="ix-38208a7" />
              {lineWidth}
            </div>
            {/* Color picker */}
            <div className="ix-3973df2">
              Color:
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)}
                className="ix-4e5521b" />
            </div>
          </div>

          {/* Clear button */}
          <div className="ix-0643f82">
            <button type="button" onClick={() => { canvasRef.current?.clear(); setStampImg(null); }}
              className="ix-87609d7">
              <X size={14} /> Clear
            </button>
          </div>

          {/* PIN & Simpan TTD */}
          <div className="ix-374de81">
            <label className="ix-e15491f">
              PIN Digital Signature <span className="ix-91f6676">*</span>
            </label>
            <div className="ix-7d7489e">
              <div className="ix-f68b1b2">
                <input
                  type="password"
                  value={signPin}
                  maxLength={6}
                  placeholder="Masukkan 6-digit PIN"
                  onChange={(e) => setSignPin(e.target.value)}
                  className="ix-a9d0f55"
                />
                {signPinError && <span className="ix-0f37ddb">{signPinError}</span>}
              </div>
              <button type="button" onClick={handleProsesTTE}
                className="ix-d50256f">
                <Check size={14} /> Simpan TTD
              </button>
            </div>
          </div>

          {/* Pagination */}
          <div className="ix-af84281">
            <span>Halaman {signPage} dari 3</span>
            <div className="ix-fb60eee">
              <button type="button" onClick={() => setSignPage((p) => Math.max(1, p - 1))} disabled={signPage === 1}
                style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid #d1d5db', background: signPage === 1 ? '#f3f4f6' : '#fff', color: signPage === 1 ? '#9CA3AF' : '#374151', cursor: signPage === 1 ? 'default' : 'pointer', fontSize: 13 }}>
                Previous
              </button>
              <button type="button" onClick={() => setSignPage((p) => Math.min(3, p + 1))} disabled={signPage === 3}
                style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid #d1d5db', background: signPage === 3 ? '#f3f4f6' : '#fff', color: signPage === 3 ? '#9CA3AF' : '#374151', cursor: signPage === 3 ? 'default' : 'pointer', fontSize: 13 }}>
                Next
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: Template Info */}
        <div className="ix-814058e">
          {/* Info card */}
          <div className="ix-dccecf0">
            <h3 className="ix-46d82ea">Template Info</h3>
            <div className="ix-a022263">
              <div>
                <span className="ix-1a8e419">Title</span>
                <div className="ix-b52bed0">{selectedItem.namaKegiatan}</div>
              </div>
              <div>
                <span className="ix-1a8e419">Status</span>
                <div style={{ fontWeight: 600, color: isSignedMitra ? '#15803d' : '#B45309', marginTop: 2 }}>
                  {isSignedMitra ? 'Sudah Ditandatangani' : 'Belum Ditandatangani'}
                </div>
              </div>
              <div>
                <span className="ix-1a8e419">Description</span>
                <div className="ix-d057d00">{selectedItem.nomorSK}</div>
              </div>
            </div>
          </div>

          {/* Back button */}
          <button type="button" onClick={() => setViewMode('detail')}
            className="ix-2a643a2">
            <ArrowLeft size={14} /> Kembali ke Detail
          </button>
        </div>
      </div>
    </div>
  );
}
