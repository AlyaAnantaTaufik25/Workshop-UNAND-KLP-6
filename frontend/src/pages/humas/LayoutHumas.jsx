import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, CalendarDays, Handshake, Building2,
  Users, FileText, FilePen, BarChart3, UserCircle, LogOut, ChevronDown
} from 'lucide-react';
import { currentHumas } from './data';
import UnandLogo from '../../components/UnandLogo';
import './humas.css';

const navItems = [
  { to: '/humas/ringkasan',           label: 'Ringkasan',           icon: LayoutDashboard },
  { to: '/humas/kelola-kegiatan',     label: 'Kelola Kegiatan',     icon: CalendarDays    },
  { to: '/humas/kelola-mitra',        label: 'Kelola Mitra',        icon: Handshake       },
  { to: '/humas/kelola-gedung',       label: 'Kelola Gedung & Ruangan', icon: Building2   },
  { to: '/humas/kelola-pengguna',     label: 'Kelola Pengguna',     icon: Users           },
  { to: '/humas/template-sertifikat', label: 'Template Sertifikat', icon: FileText        },
  { to: '/humas/perbaikan-sertifikat',label: 'Perbaikan Sertifikat',icon: FilePen         },
  { to: '/humas/laporan',             label: 'Laporan',             icon: BarChart3       },
  { to: '/humas/profil',              label: 'Profil',              icon: UserCircle      },
];

const pageTitles = {
  '/humas/ringkasan':            'Ringkasan',
  '/humas/kelola-kegiatan':      'Kelola Kegiatan',
  '/humas/kelola-mitra':         'Kelola Mitra',
  '/humas/kelola-gedung':        'Kelola Gedung & Ruangan',
  '/humas/kelola-pengguna':      'Kelola Pengguna',
  '/humas/template-sertifikat':  'Template Sertifikat',
  '/humas/perbaikan-sertifikat': 'Perbaikan Sertifikat',
  '/humas/laporan':              'Laporan',
  '/humas/profil':               'Profil',
};

export default function LayoutHumas() {
  const navigate = useNavigate();
  const location = useLocation();

  const pageTitle =
    pageTitles[location.pathname] ??
    Object.entries(pageTitles).find(([k]) => location.pathname.startsWith(k))?.[1] ??
    'Dashboard';

  return (
    <div className="app-layout role-humas">

      {/* ── SIDEBAR ── */}
      <aside className="sidebar">
        {/* Logo */}
        <div className="sidebar-logo">
          <UnandLogo className="sidebar-logo-icon" />
          <div className="sidebar-logo-text">
            <span className="sidebar-logo-name">Workshop UNAND</span>
            <span className="sidebar-logo-sub">Sistem Informasi Manajemen Workshop</span>
          </div>
        </div>

        {/* Role info */}
        <div className="sidebar-role-section">
          <p className="sidebar-role-label">Masuk Sebagai</p>
          <p className="sidebar-role-name">Humas</p>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navItems.map(({ to, label, icon: Icon }) => {
            const isActive = location.pathname.startsWith(to);
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
            <div className="user-profile-btn" onClick={() => navigate('/humas/profil')}>
              <div className="user-avatar">{currentHumas.inisial}</div>
              <div className="user-info">
                <span className="user-name">{currentHumas.nama}</span>
                <span className="user-role">{currentHumas.role}</span>
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
