import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Home, Briefcase, Handshake, MapPin,
  Users, FileText, Pencil, BarChart3, User, LogOut, ChevronDown
} from 'lucide-react';
import { currentHumas } from './data';
import UnandLogo from '../../components/UnandLogo';
import './humas.css';

const navItems = [
  { to: '/humas/ringkasan',           label: 'Ringkasan',               icon: Home },
  { to: '/humas/kelola-kegiatan',     label: 'Kelola Kegiatan',         icon: Briefcase },
  { to: '/humas/kelola-mitra',        label: 'Kelola Mitra',            icon: Handshake },
  { to: '/humas/kelola-gedung',       label: 'Kelola Gedung & Ruangan', icon: MapPin },
  { to: '/humas/kelola-pengguna',     label: 'Kelola Pengguna',         icon: Users },
  { to: '/humas/template-sertifikat', label: 'Template Sertifikat',     icon: FileText },
  { to: '/humas/perbaikan-sertifikat',label: 'Perbaikan Sertifikat',    icon: Pencil },
  { to: '/humas/laporan',             label: 'Laporan',                 icon: BarChart3 },
  { to: '/humas/profil',              label: 'Profil',                  icon: User },
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
    'Ringkasan';

  return (
    <div className="app-layout role-humas">

      {/* ── SIDEBAR ── */}
      <aside className="sidebar" aria-label="Navigasi Humas">
        {/* Brand */}
        <div className="sidebar-brand">
          <UnandLogo className="sidebar-brandmark" />
          <div>
            <strong>Workshop UNAND</strong>
            <span>Sistem Informasi Manajemen Kegiatan</span>
          </div>
        </div>

        {/* Role badge */}
        <div className="sidebar-role-badge">
          <span>MASUK SEBAGAI</span>
          <strong>Humas</strong>
        </div>

        {/* Navigation */}
        <nav aria-label="Navigasi Menu">
          {navItems.map(({ to, label, icon: Icon }) => {
            const isActive = location.pathname.startsWith(to);
            return (
              <NavLink
                key={to}
                to={to}
                className={isActive ? 'is-active active' : ''}
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
          onClick={() => navigate('/')}
        >
          <LogOut size={20} />
          <span>Keluar</span>
        </button>
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
            <button
              className="user-profile-btn"
              onClick={() => navigate('/humas/profil')}
              title={`Profil ${currentHumas.nama}`}
            >
              <div className="user-avatar">{currentHumas.inisial}</div>
              <div className="user-info">
                <span className="user-name">{currentHumas.nama}</span>
                <span className="user-role">{currentHumas.role}</span>
              </div>
              <ChevronDown size={14} className="user-chevron" />
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
