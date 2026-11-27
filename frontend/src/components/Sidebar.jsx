import { useCallback, useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, X } from 'lucide-react';
import UnandLogo from './UnandLogo';
import { useAuth } from '../context/AuthContext';
import { reportsApi } from '../api';
import { subscribeNotifications } from '../api/realtime';
import './sidebar.css';

/**
 * Sidebar bersama untuk kelima portal.
 * Elemen <aside> tetap memakai kelas posisi milik tiap portal (className) agar
 * perilaku tetap/geser di layar kecil tidak berubah; isi & tampilannya seragam.
 *
 * sections: [{ title?, items: [{ to, label, icon, match?: string[], badge?: (tasks) => number }] }]
 */
export default function Sidebar({ className = '', ariaLabel, portal, sections, onClose, asideRef, ...rest }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const tasks = useSidebarTasks(sections.some(s => s.items.some(i => i.badge)));

  const isActive = item => (item.match || [item.to]).some(p => location.pathname === p || location.pathname.startsWith(`${p}/`));
  const handleLogout = () => { logout(); navigate('/', { replace: true }); };

  return (
    <aside ref={asideRef} className={`${className} ui-sb`} aria-label={ariaLabel} {...rest}>
      <div className="ui-sb-brand">
        <UnandLogo className="ui-sb-logo" />
        <div className="ui-sb-brand-text">
          <strong>Workshop UNAND</strong>
          <span>Universitas Andalas</span>
        </div>
        {onClose && (
          <button type="button" className="ui-sb-close" aria-label="Tutup navigasi" onClick={onClose}><X size={18} /></button>
        )}
      </div>

      <div className="ui-sb-nav" role="navigation" aria-label={`Menu ${portal}`}>
        {sections.map((section, si) => (
          <div className="ui-sb-section" key={section.title || si}>
            {section.title && <p className="ui-sb-section-title">{section.title}</p>}
            {section.items.map(item => {
              const active = isActive(item);
              const count = item.badge && tasks ? item.badge(tasks) : 0;
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={() => `ui-sb-link${active ? ' is-current' : ''}`}
                  aria-current={active ? 'page' : undefined}
                  title={item.label}
                >
                  <Icon size={18} strokeWidth={active ? 2.2 : 1.9} className="ui-sb-icon" />
                  <span className="ui-sb-label">{item.label}</span>
                  {count > 0 && <span className="ui-sb-badge" aria-label={`${count} menunggu tindakan`}>{count > 99 ? '99+' : count}</span>}
                </NavLink>
              );
            })}
          </div>
        ))}
      </div>

      <button type="button" className="ui-sb-logout" onClick={handleLogout}>
        <LogOut size={18} className="ui-sb-icon" />
        <span>Keluar</span>
      </button>
    </aside>
  );
}

/** Jumlah tugas tertunda (untuk lencana menu); diperbarui berkala & saat tab kembali aktif */
function useSidebarTasks(enabled) {
  const [tasks, setTasks] = useState(null);
  const load = useCallback(async () => {
    try {
      const data = await reportsApi.dashboard();
      setTasks(data?.tasks || null);
    } catch { /* lencana bersifat tambahan; abaikan kegagalan */ }
  }, []);
  useEffect(() => {
    if (!enabled) return undefined;
    // oxlint-disable-next-line react/set-state-in-effect -- ambil data dari server (sinkronisasi sistem eksternal)
    load();
    const t = setInterval(load, 60000);
    const onFocus = () => { if (document.visibilityState === 'visible') load(); };
    document.addEventListener('visibilitychange', onFocus);
    const unsubscribe = subscribeNotifications(() => load());
    return () => { clearInterval(t); document.removeEventListener('visibilitychange', onFocus); unsubscribe(); };
  }, [enabled, load]);
  return tasks;
}
