import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutGrid, ClipboardCheck, Award, UserCircle, LogOut, ChevronDown
} from 'lucide-react';
import { currentUser } from '../data/mockData';

const navItems = [
  { to: '/sekretariat/kegiatan',  label: 'Kegiatan', icon: LayoutGrid     },
  { to: '/sekretariat/presensi',  label: 'Presensi', icon: ClipboardCheck },
  { to: '/sekretariat/sertifikat',label: 'Sertifikat',icon: Award          },
  { to: '/sekretariat/profil',    label: 'Profil',   icon: UserCircle     },
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
  const navigate  = useNavigate();
  const location  = useLocation();

  const isDokumenPengganti = location.pathname.includes('/dokumen-pengganti');
  const pageTitle = isDokumenPengganti
    ? 'Sertifikat Hasil Perbaikan'
    : (pageTitles[location.pathname] ??
      Object.entries(pageTitles).find(([k]) => location.pathname.startsWith(k))?.[1] ??
      'Dashboard');

  return (
    <div className="app-layout">

      {/* ── SIDEBAR ── */}
      <aside className="sidebar">
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">U</div>
          <div className="sidebar-logo-text">
            <span className="sidebar-logo-name">Workshop UNAND</span>
            <span className="sidebar-logo-sub">Sistem Informasi Manajemen Kegiatan</span>
          </div>
        </div>

        {/* Role info */}
        <div className="sidebar-role-section">
          <p className="sidebar-role-label">Masuk Sebagai</p>
          <p className="sidebar-role-name">{currentUser.role}</p>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
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
                className={'sidebar-nav-item' + (isActive ? ' active' : '')}
              >
                <Icon size={18} />
                <span>{label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="sidebar-bottom">
          <button
            className="sidebar-logout-btn"
            onClick={() => navigate('/')}
          >
            <LogOut size={18} />
            Keluar
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT AREA ── */}
      <div className="main-content">

        {/* Top Header */}
        <header className="top-header">
          <div className="top-header-left">
            <span className="top-header-crumb">WORKSHOP UNAND</span>
            <h1 className="top-header-title">{pageTitle}</h1>
          </div>

          <div className="top-header-right">
            <div className="user-profile-btn" onClick={() => navigate('/sekretariat/profil')}>
              <div className="user-avatar">{currentUser.inisial}</div>
              <div className="user-info">
                <span className="user-name">{currentUser.nama}</span>
                <span className="user-role">{currentUser.role}</span>
              </div>
              <ChevronDown size={14} className="user-chevron" />
            </div>
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
