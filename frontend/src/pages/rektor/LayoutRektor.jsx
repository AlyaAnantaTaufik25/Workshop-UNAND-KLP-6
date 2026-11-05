import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  FileText, Clock, User, LogOut, ChevronDown
} from 'lucide-react';
import { currentRektor } from './data';
import UnandLogo from '../../components/UnandLogo';
import './rektor.css';

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
  const navigate = useNavigate();
  const location = useLocation();

  const isDetail = location.pathname.includes('/pengajuan/') || location.pathname.includes('/riwayat/');
  const isDokumenPengganti = location.pathname.includes('/dokumen-pengganti/') || location.pathname.includes('/sertifikat-perbaikan');
  
  const pageTitle = isDokumenPengganti
    ? 'Sertifikat Hasil Perbaikan'
    : isDetail
    ? 'Detail Kegiatan'
    : (pageTitles[location.pathname] ?? 'Portal Rektor');

  return (
    <div className="app-layout role-rektor">
      {/* ── SIDEBAR REKTOR ── */}
      <aside className="sidebar">
        {/* Logo */}
        <div className="sidebar-logo">
          <UnandLogo className="sidebar-logo-icon" />
          <div className="sidebar-logo-text">
            <span className="sidebar-logo-name">Workshop UNAND</span>
            <span className="sidebar-logo-sub">Sistem Informasi Manajemen Kegiatan</span>
          </div>
        </div>

        {/* Role info */}
        <div className="sidebar-role-section">
          <p className="sidebar-role-label">PORTAL REKTOR</p>
          <div className="sidebar-role-badge-box">
            {currentRektor.role}
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
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
                className={
                  'sidebar-nav-item-rektor' + (isActive ? ' active' : '')
                }
              >
                <Icon size={17} />
                <span>{label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User preview & Logout */}
        <div className="sidebar-bottom">
          <div className="sidebar-user-bottom-card">
            <div className="sidebar-user-avatar-mini">{currentRektor.inisialAvatar}</div>
            <div className="sidebar-user-bottom-info">
              <div className="sidebar-user-bottom-name">{currentRektor.namaPendek}</div>
              <div className="sidebar-user-bottom-role">{currentRektor.jabatan}</div>
            </div>
          </div>
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
            <div className="user-profile-btn" onClick={() => navigate('/rektor/profil')}>
              <div className="user-avatar" style={{ background: 'var(--green-50)', color: 'var(--green-700)', border: '1px solid var(--green-200)' }}>
                {currentRektor.inisialAvatar}
              </div>
              <div className="user-info">
                <span className="user-name">{currentRektor.nama}</span>
                <span className="user-role">{currentRektor.role}</span>
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
