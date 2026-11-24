import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { AlertTriangle, CheckCircle2, HelpCircle, Info, X, XCircle } from 'lucide-react';
import './dialog.css';

/**
 * Dialog & toast seragam untuk seluruh portal, pengganti alert/confirm/prompt bawaan browser.
 *
 *   import { dialog, toast } from '../../components/Dialog';
 *   if (await dialog.confirm({ title: 'Hapus mitra?', message: '...', tone: 'danger' })) ...
 *   const alasan = await dialog.prompt({ title: 'Tolak pengajuan', label: 'Alasan penolakan' });
 *   await dialog.alert({ title: 'Pop-up diblokir', message: '...' });
 *   toast('Data berhasil disimpan');
 *
 * <DialogHost /> dipasang satu kali di main.jsx.
 */

// ── Store sederhana (di luar React) agar dapat dipanggil dari mana saja ──
let state = { dialog: null, toasts: [] };
const listeners = new Set();
const emit = () => listeners.forEach(l => l());
const setState = patch => { state = { ...state, ...patch }; emit(); };
const subscribe = l => { listeners.add(l); return () => listeners.delete(l); };
const getSnapshot = () => state;

function open(kind, options) {
  return new Promise(resolve => {
    // Dialog sebelumnya (jika ada) dianggap dibatalkan
    state.dialog?.resolve(kind === 'confirm' ? false : null);
    setState({ dialog: { kind, ...options, resolve } });
  });
}

export const dialog = {
  confirm: (opts = {}) => open('confirm', opts),
  prompt: (opts = {}) => open('prompt', opts),
  alert: (opts = {}) => open('alert', opts),
};

let toastId = 0;
export function toast(message, { tone = 'success', duration = 3800 } = {}) {
  if (!message) return;
  const id = ++toastId;
  setState({ toasts: [...state.toasts, { id, message, tone }].slice(-4) });
  setTimeout(() => setState({ toasts: state.toasts.filter(t => t.id !== id) }), duration);
}

const TONE_ICON = {
  default: HelpCircle,
  danger: AlertTriangle,
  warning: AlertTriangle,
  info: Info,
  success: CheckCircle2,
};
const TOAST_ICON = { success: CheckCircle2, error: XCircle, info: Info, warning: AlertTriangle };

function DialogBox({ d }) {
  const [value, setValue] = useState(d.defaultValue || '');
  const [touched, setTouched] = useState(false);
  const inputRef = useRef(null);
  const confirmRef = useRef(null);
  const tone = d.tone || (d.kind === 'alert' ? 'info' : 'default');
  const Icon = TONE_ICON[tone] || HelpCircle;
  const required = d.kind === 'prompt' && d.required !== false;
  const invalid = required && !value.trim();

  const close = result => {
    setState({ dialog: null });
    d.resolve(result);
  };
  const cancel = () => close(d.kind === 'confirm' ? false : null);
  const submit = () => {
    if (d.kind === 'prompt') {
      setTouched(true);
      if (invalid) { inputRef.current?.focus(); return; }
      close(value.trim());
    } else {
      close(d.kind === 'confirm' ? true : undefined);
    }
  };

  useEffect(() => {
    (d.kind === 'prompt' ? inputRef : confirmRef).current?.focus();
    const onKey = e => {
      if (e.key === 'Escape') cancel();
      if (e.key === 'Enter' && d.kind !== 'prompt') submit();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const confirmText = d.confirmText || (d.kind === 'alert' ? 'Mengerti' : d.kind === 'prompt' ? 'Kirim' : 'Ya, lanjutkan');

  return (
    <div className="ui-dialog-overlay" onMouseDown={e => { if (e.target === e.currentTarget && d.kind !== 'alert') cancel(); }}>
      <div className={`ui-dialog ui-dialog--${tone}`} role="dialog" aria-modal="true" aria-labelledby="ui-dialog-title">
        <button type="button" className="ui-dialog-close" onClick={cancel} aria-label="Tutup"><X size={16} /></button>
        <div className="ui-dialog-head">
          <span className="ui-dialog-icon"><Icon size={22} /></span>
          <div>
            <h2 id="ui-dialog-title" className="ui-dialog-title">{d.title || (d.kind === 'confirm' ? 'Konfirmasi' : 'Informasi')}</h2>
            {d.message && <p className="ui-dialog-message">{d.message}</p>}
          </div>
        </div>

        {d.kind === 'prompt' && (
          <div className="ui-dialog-field">
            {d.label && <label htmlFor="ui-dialog-input">{d.label}{required && <span aria-hidden="true"> *</span>}</label>}
            {d.multiline === false
              ? <input id="ui-dialog-input" ref={inputRef} value={value} placeholder={d.placeholder || ''} onChange={e => setValue(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') submit(); }} maxLength={d.maxLength || 500} />
              : <textarea id="ui-dialog-input" ref={inputRef} rows={3} value={value} placeholder={d.placeholder || ''} onChange={e => setValue(e.target.value)} maxLength={d.maxLength || 500} />}
            {touched && invalid && <p className="ui-dialog-error">{d.label || 'Isian ini'} wajib diisi.</p>}
          </div>
        )}

        <div className="ui-dialog-actions">
          {d.kind !== 'alert' && (
            <button type="button" className="ui-dialog-btn ui-dialog-btn--secondary" onClick={cancel}>{d.cancelText || 'Batal'}</button>
          )}
          <button ref={confirmRef} type="button" className={`ui-dialog-btn ${tone === 'danger' ? 'ui-dialog-btn--danger' : 'ui-dialog-btn--primary'}`} onClick={submit}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export function DialogHost() {
  const { dialog: d, toasts } = useSyncExternalStore(subscribe, getSnapshot);
  return (
    <>
      {d && <DialogBox key={`${d.kind}-${d.title}`} d={d} />}
      <div className="ui-toast-stack" aria-live="polite">
        {toasts.map(t => {
          const Icon = TOAST_ICON[t.tone] || CheckCircle2;
          return (
            <div key={t.id} className={`ui-toast ui-toast--${t.tone}`} role="status">
              <Icon size={18} />
              <span>{t.message}</span>
              <button type="button" aria-label="Tutup pesan" onClick={() => setState({ toasts: state.toasts.filter(x => x.id !== t.id) })}><X size={14} /></button>
            </div>
          );
        })}
      </div>
    </>
  );
}
