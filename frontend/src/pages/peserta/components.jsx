import { useEffect, useId, useRef } from 'react';
import { MapPin, Video, X } from 'lucide-react';

export function Status({ children, tone = 'green' }) {
  return <span className={`peserta-status peserta-status--${tone}`}><i />{children}</span>;
}

export function WorkshopMode({ mode }) {
  if (mode !== 'online' && mode !== 'offline') return null;
  const label = mode === 'online' ? 'Online' : 'Offline';
  const Icon = mode === 'online' ? Video : MapPin;
  return <span className={`peserta-workshop-mode peserta-workshop-mode--${mode}`} aria-label={`Mode pelaksanaan: ${label}`}><Icon size={13} aria-hidden="true" />{label}</span>;
}

export function EmptyState({ icon: Icon, title, children, action }) {
  return <div className="peserta-empty"><div><Icon size={30} /></div><h2>{title}</h2><p>{children}</p>{action}</div>;
}

export function Modal({ title, children, onClose, wide = false }) {
  const titleId = useId();
  const ref = useRef(null);
  const closeRef = useRef(onClose);
  useEffect(() => { closeRef.current = onClose; }, [onClose]);
  useEffect(() => {
    const previous = document.activeElement;
    const dialog = ref.current;
    const focusable = () => [...dialog.querySelectorAll('button, a[href], input, select, textarea, [tabindex="0"]')].filter(el => !el.disabled);
    (focusable()[0] || dialog).focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKey = event => {
      if (event.key === 'Escape') closeRef.current();
      if (event.key !== 'Tab') return;
      const elements = focusable();
      const first = elements[0];
      const last = elements.at(-1);
      if (!first) { event.preventDefault(); dialog.focus(); }
      else if (!dialog.contains(document.activeElement)) { event.preventDefault(); (event.shiftKey ? last : first).focus(); }
      else if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, []);
  return <div className="peserta-modal-backdrop" onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <section className={`peserta-modal${wide ? ' peserta-modal--wide' : ''}`} ref={ref} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1}>
      <header><h2 id={titleId}>{title}</h2><button type="button" className="peserta-icon-button" onClick={onClose} aria-label="Tutup" title="Tutup"><X size={20} /></button></header>
      {children}
    </section>
  </div>;
}
