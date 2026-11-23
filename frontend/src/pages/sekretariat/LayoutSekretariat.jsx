import { useState, useRef, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  CalendarDays, ClipboardCheck, Award, User, LogOut, Bell
} from 'lucide-react';
import UnandLogo from '../../components/UnandLogo';
import './sekretariat.css';
import { usePortalData } from '../../context/PortalData';
import { useAuth } from '../../context/AuthContext';
import useNotifications from '../../hooks/useNotifications';
import { useMobileNav } from '../../components/MobileNav';

const navItems = [
  { to: '/sekretariat/kegiatan',  label: 'Kegiatan', icon: CalendarDays },
  { to: '/sekretariat/presensi',  label: 'Presensi', icon: ClipboardCheck },
  { to: '/sekretariat/sertifikat',label: 'Sertifikat',icon: Award          },
  { to: '/sekretariat/profil',    label: 'Profil',   icon: User           },
];

// Maps route path → page title shown in header
const pageTitles = {
  '/sekretariat/kegiatan':             'Kegiatan',
  '/sekretariat/presensi':             'Presensi',
  '/sekretariat/sertifikat':           'Sertifikat',
  '/sekretariat/sertifikat-perbaikan': 'Sertifikat Hasil Perbaikan',
  '/sekretariat/profil':               'Profil',
};

export default function Layout() {
  // Navigasi sidebar untuk layar kecil
  const { navClass, toggle: navToggle, overlay: navOverlay } = useMobileNav();
  const { currentUser } = usePortalData();
  const { logout } = useAuth();
  const { items: notifications, unread, markRead } = useNotifications();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifRead, setNotifRead] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    setNotifOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleOutside = (event) => {
      if (!notifRef.current?.contains(event.target)) {
        setNotifOpen(false);
      }
    };
    const handleEscape = (event) => {
      if (event.key === 'Escape') setNotifOpen(false);
    };
    if (!notifOpen) return;
    document.addEventListener('pointerdown', handleOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('pointerdown', handleOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [notifOpen]);

  const isDokumenPengganti = location.pathname.includes('/dokumen-pengganti');
  const pageTitle = isDokumenPengganti
    ? 'Sertifikat Hasil Perbaikan'
    : (pageTitles[location.pathname] ??
      Object.entries(pageTitles).find(([k]) => location.pathname.startsWith(k))?.[1] ??
      'Dashboard');

  return (
    <div className={`app-layout role-sekretariat${navClass}`}>
      {navOverlay}

      {/* ── SIDEBAR (Selaras dengan Peserta) ── */}
      <aside className="sidebar" aria-label="Navigasi Sekretariat Rektor">
        {/* Brand */}
        <div className="sidebar-brand">
          <UnandLogo className="sidebar-brandmark" />
          <div>
            <strong>Workshop UNAND</strong>
            <span>Sistem Informasi Workshop</span>
          </div>
        </div>

        {/* Role badge */}
        <div className="sidebar-role-badge">
          <span>MASUK SEBAGAI</span>
          <strong>Sekretariat Rektor</strong>
        </div>

        {/* Navigation */}
        <nav aria-label="Navigasi Menu">
          {navItems.map(({ to, label, icon: Icon }) => {
            const isActive = to === '/sekretariat/sertifikat'
              ? location.pathname.startsWith('/sekretariat/sertifikat') || 
                location.pathname.startsWith('/sekretariat/sertifikat-perbaikan') ||
                location.pathname.startsWith('/sekretariat/dokumen-pengganti')
              : location.pathname.startsWith(to);

            return (
              <NavLink
                key={to}
                to={to}
                className={isActive ? 'is-active' : ''}
              >
                <Icon size={20} />
                <span>{label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Logout */}
        <button
          className="sidebar-logout"
          onClick={() => { logout(); navigate('/', { replace: true }); }}
        >
          <LogOut size={20} />
          <span>Keluar</span>
        </button>
      </aside>

      {/* ── MAIN CONTENT AREA ── */}
      <div className="main-content">

        {/* Top Header (Selaras dengan Peserta) */}
        <header className="top-header">
          <div className="top-header-left">
            {navToggle}
            <span className="top-header-crumb">WORKSHOP UNAND</span>
            <h1 className="top-header-title">{pageTitle}</h1>
          </div>

          <div className="top-header-right">
            {/* Notifikasi Bell */}
            <div style={{ position: 'relative' }} ref={notifRef}>
              <button
                className="top-header-icon-btn"
                aria-label="Notifikasi"
                title="Notifikasi"
                onClick={() => {
                  setNotifOpen(prev => !prev);
                  setNotifRead(true);
                }}
              >
                <Bell size={20} />
                {unread > 0 && <i className="top-header-notif-dot" />}
              </button>

              {notifOpen && (
                <div className="header-notif-popover">
                  <h2>Notifikasi</h2>
                  {notifications.length === 0 && <p style={{ padding: '8px 4px', fontSize: 13, color: '#6b7280' }}>Belum ada notifikasi.</p>}
                  {notifications.map(n => (
                    <NavLink
                      key={n.id}
                      to={n.link || '#'}
                      className="header-notif-item"
                      onClick={() => { setNotifOpen(false); if (n.belumDibaca) markRead(n.id); }}
                    >
                      <Award size={18} />
                      <div>
                        <strong>{n.judul}</strong>
                        <p>{n.deskripsi}</p>
                        <small>{n.waktu}</small>
                      </div>
                    </NavLink>
                  ))}
                </div>
              )}
            </div>

            {/* Profile User */}
            <button
              className="user-profile-btn"
              onClick={() => navigate('/sekretariat/profil')}
              title={`Profil ${currentUser.nama}`}
            >
              <div className="user-avatar">{currentUser.inisial}</div>
              <div className="user-info">
                <span className="user-name">{currentUser.nama}</span>
                <span className="user-role">{currentUser.role}</span>
              </div>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="content-container">
          <Outlet />
        </main>
      </div>

    </div>
  );
}
