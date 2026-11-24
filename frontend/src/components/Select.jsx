import { Children, Fragment, isValidElement, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check } from 'lucide-react';
import './select.css';

/**
 * Pengganti <select> dengan panel pilihan yang mengikuti desain aplikasi.
 *
 * Elemen <select> asli tetap dirender sebagai "kotak" sehingga seluruh CSS & tata letak
 * yang sudah ada tidak berubah; hanya daftar pilihan bawaan OS (yang tidak bisa dihias)
 * diganti panel kustom. Di perangkat sentuh, picker bawaan tetap dipakai.
 *
 *   <Select className="filter-select" value={v} onChange={e => setV(e.target.value)}>
 *     <option value="">Semua</option> ...
 *   </Select>
 */

/** Ratakan children (termasuk array & fragment) menjadi daftar opsi */
function readOptions(children, out = []) {
  Children.forEach(children, child => {
    if (!isValidElement(child)) return;
    if (child.type === Fragment) { readOptions(child.props.children, out); return; }
    if (child.type === 'optgroup') { readOptions(child.props.children, out); return; }
    if (child.type === 'option') {
      const label = Children.toArray(child.props.children).join('');
      out.push({ value: child.props.value !== undefined ? String(child.props.value) : label, label, disabled: !!child.props.disabled });
    }
  });
  return out;
}

const isCoarsePointer = () => typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches;
const MENU_MAX = 300;

export default function Select({ children, value, defaultValue, onChange, onMouseDown, onKeyDown, onBlur, ...rest }) {
  const selectRef = useRef(null);
  const menuRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState(null);
  const [active, setActive] = useState(-1);
  const options = readOptions(children);
  const current = String(value ?? selectRef.current?.value ?? defaultValue ?? '');

  // Hitung posisi panel (di bawah kotak, atau di atas bila ruang bawah sempit)
  const place = useCallback(() => {
    const el = selectRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const spaceBelow = window.innerHeight - r.bottom - 12;
    const spaceAbove = r.top - 12;
    const wanted = Math.min(MENU_MAX, options.length * 40 + 12);
    const above = spaceBelow < wanted && spaceAbove > spaceBelow;
    setPos({
      left: Math.min(r.left, window.innerWidth - Math.max(r.width, 200) - 8),
      width: r.width,
      top: above ? undefined : r.bottom + 6,
      bottom: above ? window.innerHeight - r.top + 6 : undefined,
      maxHeight: Math.max(140, Math.min(MENU_MAX, above ? spaceAbove : spaceBelow)),
      above,
    });
  }, [options.length]);

  const openMenu = () => {
    if (rest.disabled) return;
    place();
    setActive(Math.max(0, options.findIndex(o => o.value === current)));
    setOpen(true);
  };
  const close = () => setOpen(false);

  const choose = opt => {
    if (!opt || opt.disabled) return;
    const el = selectRef.current;
    if (value === undefined && el) el.value = opt.value; // mode tidak terkontrol
    // Bentuk event mengikuti onChange <select>: handler membaca e.target.value / e.target.name
    const target = { value: opt.value, name: rest.name, id: rest.id };
    onChange?.({ target, currentTarget: target, preventDefault() {}, stopPropagation() {} });
    close();
    el?.focus();
  };

  const handleMouseDown = e => {
    onMouseDown?.(e);
    if (e.defaultPrevented || e.button !== 0 || isCoarsePointer()) return;
    e.preventDefault(); // cegah daftar bawaan OS
    selectRef.current?.focus();
    if (open) close(); else openMenu();
  };

  const move = step => {
    let i = active;
    for (let n = 0; n < options.length; n += 1) {
      i = (i + step + options.length) % options.length;
      if (!options[i].disabled) break;
    }
    setActive(i);
  };

  const handleKeyDown = e => {
    onKeyDown?.(e);
    if (e.defaultPrevented) return;
    if (!open) {
      if (e.key === 'Enter' || e.key === ' ' || (e.altKey && e.key === 'ArrowDown') || e.key === 'F4') {
        e.preventDefault();
        openMenu();
      }
      return; // panah atas/bawah tanpa panel: biarkan perilaku bawaan (ganti nilai)
    }
    if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
    else if (e.key === 'Home') { e.preventDefault(); setActive(0); }
    else if (e.key === 'End') { e.preventDefault(); setActive(options.length - 1); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(options[active]); }
    else if (e.key === 'Escape') { e.preventDefault(); close(); }
    else if (e.key === 'Tab') close();
    else if (e.key.length === 1) {
      // Lompat ke opsi berawalan huruf yang diketik
      const i = options.findIndex((o, idx) => idx > active && o.label.toLowerCase().startsWith(e.key.toLowerCase()));
      const j = i >= 0 ? i : options.findIndex(o => o.label.toLowerCase().startsWith(e.key.toLowerCase()));
      if (j >= 0) setActive(j);
    }
  };

  // Tutup saat klik di luar; ikuti posisi saat scroll/resize
  useEffect(() => {
    if (!open) return undefined;
    const onDown = e => {
      if (menuRef.current?.contains(e.target) || selectRef.current?.contains(e.target)) return;
      close();
    };
    const onMove = () => place();
    document.addEventListener('pointerdown', onDown);
    window.addEventListener('resize', onMove);
    window.addEventListener('scroll', onMove, true);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      window.removeEventListener('resize', onMove);
      window.removeEventListener('scroll', onMove, true);
    };
  }, [open, place]);

  // Pastikan opsi aktif terlihat di dalam panel
  useLayoutEffect(() => {
    if (!open || active < 0) return;
    menuRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [open, active]);

  const listId = rest.id ? `${rest.id}-list` : undefined;

  return (
    <>
      <select
        ref={selectRef}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        onMouseDown={handleMouseDown}
        onKeyDown={handleKeyDown}
        onBlur={e => { onBlur?.(e); }}
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        data-ui-select-open={open || undefined}
        {...rest}
      >
        {children}
      </select>
      {open && pos && createPortal(
        <div
          ref={menuRef}
          id={listId}
          className={`ui-select-menu${pos.above ? ' is-above' : ''}`}
          role="listbox"
          style={{ left: pos.left, top: pos.top, bottom: pos.bottom, minWidth: pos.width, maxHeight: pos.maxHeight }}
          onMouseDown={e => e.preventDefault()}
        >
          {options.map((opt, i) => {
            const selected = opt.value === current;
            return (
              <div
                key={`${opt.value}-${i}`}
                data-index={i}
                role="option"
                aria-selected={selected}
                aria-disabled={opt.disabled || undefined}
                className={`ui-select-option${selected ? ' is-selected' : ''}${i === active ? ' is-active' : ''}${opt.disabled ? ' is-disabled' : ''}`}
                onMouseEnter={() => setActive(i)}
                onClick={() => choose(opt)}
              >
                <span className="ui-select-option-label">{opt.label || ' '}</span>
                {selected && <Check size={15} className="ui-select-check" />}
              </div>
            );
          })}
        </div>,
        document.body,
      )}
    </>
  );
}
