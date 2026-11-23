import { useState, useRef, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  FileText, Clock, User, LogOut, Bell, Award
} from 'lucide-react';
import UnandLogo from '../../components/UnandLogo';
import './rektor.css';
import { usePortalData } from '../../context/PortalData';
import { useAuth } from '../../context/AuthContext';
import useNotifications from '../../hooks/useNotifications';
import { useMobileNav } from '../../components/MobileNav';

const navItems = [
  { to: '/rektor/pengajuan', label: 'Pengajuan Sertifikat', icon: FileText },
  { to: '/rektor/riwayat',   label: 'Riwayat Tanda Tangan', icon: Clock    },
  { to: '/rektor/profil',    label: 'Profil',               icon: User     },
];

const pageTitles = {
  '/rektor/pengajuan':            'Pengajuan Sertifikat',
  '/rektor/sertifikat-perbaikan': 'Sertifikat Hasil Perbaikan',
  '/rektor/riwayat':              'Riwayat Tanda Tangan',
  '/rektor/profil':               'Profil',
};

export default function LayoutRektor() {
  // Navigasi sidebar untuk layar kecil
  const { navClass, toggle: navToggle, overlay: navOverlay } = useMobileNav();
  const { currentRektor } = usePortalData();
  const { logout } = useAuth();
  const { items: notifications, unread, markRead } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
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

  const isDetail = location.pathname.includes('/pengajuan/') || location.pathname.includes('/riwayat/');
  const isDokumenPengganti = location.pathname.includes('/dokumen-pengganti/') || location.pathname.includes('/sertifikat-perbaikan');
  
  const pageTitle = isDokumenPengganti
    ? 'Sertifikat Hasil Perbaikan'
    : isDetail
    ? 'Detail Kegiatan'
    : (pageTitles[location.pathname] ?? 'Portal Rektor');

  return (
    <div className={`app-layout role-rektor${navClass}`}>
      {navOverlay}
      {/* ── SIDEBAR REKTOR (Selaras dengan Peserta) ── */}
      <aside className="sidebar" aria-label="Navigasi Rektor">
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
          <strong>Rektor</strong>
        </div>

        {/* Navigation */}
        <nav aria-label="Navigasi Menu">
          {navItems.map(({ to, label, icon: Icon }) => {
            const isActive = to === '/rektor/pengajuan'
              ? location.pathname.startsWith('/rektor/pengajuan') || 
                location.pathname.startsWith('/rektor/sertifikat-perbaikan') ||
                location.pathname.startsWith('/rektor/dokumen-pengganti')
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
              onClick={() => navigate('/rektor/profil')}
              title={`Profil ${currentRektor.nama}`}
            >
              <div className="user-avatar">{currentRektor.inisialAvatar}</div>
              <div className="user-info">
                <span className="user-name">{currentRektor.nama}</span>
                <span className="user-role">{currentRektor.role}</span>
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
