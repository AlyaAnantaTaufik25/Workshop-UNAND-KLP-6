import { useEffect, useMemo, useRef, useState } from 'react';
import { ImagePlus, RefreshCw, Trash2 } from 'lucide-react';
import './poster-dropzone.css';

const MAX_MB = 5;

/**
 * Unggah poster: seret-lepas atau klik, pratinjau gambar, validasi jenis & ukuran.
 * value: File | null (poster baru); currentUrl: poster yang sudah ada (mode edit).
 * onChange(File | null)  — null berarti poster baru dibatalkan.
 */
export default function PosterDropzone({ value, currentUrl, onChange, disabled }) {
  const inputRef = useRef(null);
  const [drag, setDrag] = useState(false);
  const [error, setError] = useState('');
  // URL pratinjau diturunkan dari berkas; dibebaskan saat berkas berganti
  const preview = useMemo(() => (value instanceof File ? URL.createObjectURL(value) : ''), [value]);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  const accept = file => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('File harus berupa gambar (JPG, PNG, atau WebP).'); return; }
    if (file.size > MAX_MB * 1024 * 1024) { setError(`Ukuran gambar maksimal ${MAX_MB} MB.`); return; }
    setError('');
    onChange(file);
  };

  const shown = preview || currentUrl;
  const open = () => !disabled && inputRef.current?.click();

  return (
    <div className="ui-poster">
      <div
        className={`ui-poster-zone${drag ? ' is-drag' : ''}${shown ? ' has-image' : ''}${disabled ? ' is-disabled' : ''}`}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={shown ? 'Ganti poster kegiatan' : 'Unggah poster kegiatan'}
        onClick={open}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } }}
        onDragOver={e => { e.preventDefault(); if (!disabled) setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={e => { e.preventDefault(); setDrag(false); if (!disabled) accept(e.dataTransfer.files?.[0]); }}
      >
        {shown ? (
          <img src={shown} alt="Pratinjau poster kegiatan" />
        ) : (
          <div className="ui-poster-empty">
            <span className="ui-poster-icon"><ImagePlus size={22} /></span>
            <strong>Seret poster ke sini</strong>
            <span>atau <u>pilih file</u> · JPG/PNG, maks {MAX_MB} MB</span>
          </div>
        )}
        <input ref={inputRef} type="file" accept="image/*" hidden onChange={e => { accept(e.target.files?.[0]); e.target.value = ''; }} />
      </div>
      {shown && (
        <div className="ui-poster-bar">
          <span className="ui-poster-name">{value instanceof File ? `${value.name} · ${(value.size / 1024 / 1024).toFixed(1)} MB` : 'Poster saat ini'}</span>
          <button type="button" className="ui-poster-btn" onClick={open} disabled={disabled}><RefreshCw size={14} /> Ganti</button>
          {value instanceof File && (
            <button type="button" className="ui-poster-btn ui-poster-btn--danger" onClick={() => onChange(null)} disabled={disabled}><Trash2 size={14} /> Batalkan</button>
          )}
        </div>
      )}
      {error && <p className="ui-poster-error" role="alert">{error}</p>}
    </div>
  );
}
