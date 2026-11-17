import { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Home, Briefcase, Handshake, MapPin,
  Users, FileText, BarChart3, User, LogOut, ChevronDown, ChevronRight, Bell, X
} from 'lucide-react';
import { currentHumas } from './data';
import UnandLogo from '../../components/UnandLogo';
import './humas.css';

// Notifikasi mock data (shared across layout)
export const notifikasiData = [
  {
    id: 1,
    judul: 'Pengajuan Perbaikan Sertifikat Baru',
    deskripsi: 'Nadia Amelia · Workshop Penulisan Artikel Ilmiah',
    waktu: '17 Mei 2026, 10:15 · belum dibaca',
    belumDibaca: true,
    link: '/humas/kelola-sertifikat/perbaikan',
  },
];

const navItems = [
  { to: '/humas/ringkasan',         label: 'Dashboard',               icon: Home },
  { to: '/humas/kelola-kegiatan',   label: 'Kelola Kegiatan',         icon: Briefcase },
  { to: '/humas/kelola-mitra',      label: 'Kelola Mitra',            icon: Handshake },
  { to: '/humas/kelola-gedung',     label: 'Kelola Gedung & Ruangan', icon: MapPin },
  { to: '/humas/kelola-pengguna',   label: 'Kelola Pengguna',         icon: Users },
  {
    label: 'Kelola Sertifikat',
    icon: FileText,
    children: [
      { to: '/humas/template-sertifikat',  label: 'Template Sertifikat'  },
      { to: '/humas/perbaikan-sertifikat', label: 'Perbaikan Sertifikat' },
    ],
  },
  { to: '/humas/laporan',           label: 'Laporan',                 icon: BarChart3 },
  { to: '/humas/profil',            label: 'Profil',                  icon: User },
];

const pageTitles = {
  '/humas/ringkasan':            'Dashboard',
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
  const [sertifikatOpen, setSertifikatOpen] = useState(
    location.pathname.startsWith('/humas/template-sertifikat') ||
    location.pathname.startsWith('/humas/perbaikan-sertifikat')
  );
  const [showNotif, setShowNotif] = useState(false);

  const pageTitle =
    pageTitles[location.pathname] ??
    Object.entries(pageTitles).find(([k]) => location.pathname.startsWith(k))?.[1] ??
    'Dashboard';

  const unreadCount = notifikasiData.filter(n => n.belumDibaca).length;

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
          {navItems.map((item) => {
            if (item.children) {
              const isParentActive = item.children.some(c => location.pathname.startsWith(c.to));
              return (
                <div key={item.label} className="sidebar-group">
                  <button
                    className={`sidebar-group-btn${isParentActive ? ' is-active active' : ''}`}
                    onClick={() => setSertifikatOpen(o => !o)}
                  >
                    <item.icon size={20} />
                    <span>{item.label}</span>
                    {sertifikatOpen
                      ? <ChevronDown size={14} style={{ marginLeft: 'auto' }} />
                      : <ChevronRight size={14} style={{ marginLeft: 'auto' }} />
                    }
                  </button>
                  {sertifikatOpen && (
                    <div className="sidebar-sub-menu">
                      {item.children.map(child => (
                        <NavLink
                          key={child.to}
                          to={child.to}
                          className={location.pathname.startsWith(child.to) ? 'is-active active sidebar-sub-link' : 'sidebar-sub-link'}
                        >
                          <span>{child.label}</span>
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              );
            }
            const isActive = location.pathname.startsWith(item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={isActive ? 'is-active active' : ''}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
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
            {/* Notification Bell */}
            <button
              className="layout-notif-bell"
              onClick={() => setShowNotif(true)}
              title="Notifikasi Perbaikan Sertifikat"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="layout-notif-badge">{unreadCount}</span>
              )}
            </button>

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

      {/* ── Notifikasi Modal ── */}
      {showNotif && (
        <div className="modal-overlay" onClick={() => setShowNotif(false)}>
          <div className="modal-box" style={{ maxWidth: 480, marginTop: 70, marginLeft: 'auto', marginRight: 24 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <p className="modal-header-crumb">WORKSHOP UNAND</p>
                <h2 className="modal-header-title">Notifikasi Perbaikan Sertifikat</h2>
              </div>
              <button className="modal-close-btn" onClick={() => setShowNotif(false)}><X size={16} /></button>
            </div>
            <div className="modal-body" style={{ gap: 12 }}>
              {notifikasiData.map(n => (
                <div key={n.id} className="notif-item">
                  <div className="notif-item-icon"><Bell size={16} /></div>
                  <div className="notif-item-content">
                    <p className="notif-item-title">{n.judul}</p>
                    <p className="notif-item-desc">{n.deskripsi}</p>
                    <p className="notif-item-time">{n.waktu}</p>
                    <button
                      className="notif-item-link"
                      onClick={() => { setShowNotif(false); navigate(n.link); }}
                    >
                      Lihat Detail
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
