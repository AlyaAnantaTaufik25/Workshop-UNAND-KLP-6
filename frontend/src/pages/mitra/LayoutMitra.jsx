import { useState, useRef, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Briefcase,
  Users,
  FileText,
  Award,
  Pencil,
  BarChart3,
  User,
  LogOut,
  Bell,
} from 'lucide-react';
import { currentMitra } from './data';
import UnandLogo from '../../components/UnandLogo';
import './mitra.css';

const navItems = [
  { to: '/mitra/kegiatan-kerja-sama',  label: 'Kegiatan Kerja Sama',  icon: Briefcase },
  { to: '/mitra/peserta',              label: 'Peserta',              icon: Users },
  { to: '/mitra/template-sertifikat',  label: 'Template Sertifikat',  icon: FileText },
  { to: '/mitra/perbaikan-sertifikat', label: 'Perbaikan Sertifikat', icon: Award },
  { to: '/mitra/tanda-tangan',         label: 'Tanda Tangan',         icon: Pencil },
  { to: '/mitra/laporan',              label: 'Laporan',              icon: BarChart3 },
  { to: '/mitra/profil',               label: 'Profil',               icon: User },
];

const pageTitles = {
  '/mitra/kegiatan-kerja-sama':  'Kegiatan Kerja Sama',
  '/mitra/peserta':              'Peserta',
  '/mitra/template-sertifikat':  'Template Sertifikat',
  '/mitra/perbaikan-sertifikat': 'Perbaikan Sertifikat',
  '/mitra/dokumen-pengganti':    'Dokumen Pengganti',
  '/mitra/tanda-tangan':         'Tanda Tangan',
  '/mitra/laporan':              'Laporan',
  '/mitra/profil':               'Profil',
};

export default function LayoutMitra() {
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

  const pageTitle =
    pageTitles[location.pathname] ??
    Object.entries(pageTitles).find(([k]) => location.pathname.startsWith(k))?.[1] ??
    'Kegiatan Kerja Sama';

  return (
    <div className="mitra-shell">
      {/* ── SIDEBAR ── */}
      <aside className="mitra-sidebar">
        {/* Brand */}
        <div className="mitra-brand">
          <UnandLogo className="mitra-brandmark" />
          <div>
            <strong>Workshop UNAND</strong>
            <span>Sistem Informasi Manajemen Kegiatan</span>
          </div>
        </div>

        {/* Role info */}
        <div className="mitra-role-badge">
          <span>MASUK SEBAGAI</span>
          <strong>Mitra</strong>
          <span className="mitra-role-instansi">{currentMitra.instansi}</span>
        </div>

        {/* Nav list */}
        <nav aria-label="Navigasi Mitra">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                isActive || (to.includes('kegiatan-kerja-sama') && location.pathname.includes('/kegiatan-kerja-sama/'))
                  ? 'is-active'
                  : ''
              }
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <button className="mitra-logout" onClick={() => navigate('/')}>
          <LogOut size={18} />
          <span>Keluar</span>
        </button>
      </aside>

      {/* ── MAIN CONTENT AREA ── */}
      <div className="mitra-main">
        {/* Topbar */}
        <header className="mitra-topbar">
          <div className="mitra-title-wrap">
            <div>
              <span className="mitra-eyebrow">WORKSHOP UNAND</span>
              <h1>{pageTitle}</h1>
            </div>
          </div>

          <div className="mitra-top-actions">
            {/* Notifikasi Perbaikan Icon & Popover */}
            <div className="mitra-notifications" ref={notifRef}>
              <button
                className="mitra-icon-button"
                aria-label="Notifikasi perbaikan"
                title="Notifikasi perbaikan"
                aria-expanded={notifOpen}
                onClick={() => {
                  setNotifOpen(prev => !prev);
                  setNotifRead(true);
                }}
              >
                <Bell size={20} />
                {!notifRead && <i className="mitra-notification-dot" />}
              </button>

              {notifOpen && (
                <div className="mitra-notification-popover">
                  <h2>Notifikasi</h2>
                  <NavLink
                    to="/mitra/perbaikan-sertifikat"
                    className="mitra-notif-item"
                    onClick={() => setNotifOpen(false)}
                  >
                    <div className="mitra-notif-icon">
                      <Award size={18} />
                    </div>
                    <div>
                      <strong>Permohonan Perbaikan Sertifikat</strong>
                      <p>Rafi Pratama mengajukan perbaikan nama pada sertifikat Workshop Data Science.</p>
                      <small>20 Mei 2026 · Baru</small>
                    </div>
                  </NavLink>
                  <NavLink
                    to="/mitra/tanda-tangan"
                    className="mitra-notif-item"
                    onClick={() => setNotifOpen(false)}
                  >
                    <div className="mitra-notif-icon" style={{ background: '#edf5fa', color: '#236483' }}>
                      <Pencil size={18} />
                    </div>
                    <div>
                      <strong>Menunggu Tanda Tangan Elektronik</strong>
                      <p>Sertifikat Workshop Data Science menunggu TTE Pimpinan PT Semen Padang.</p>
                      <small>18 Mei 2026</small>
                    </div>
                  </NavLink>
                </div>
              )}
            </div>

            {/* Profile User */}
            <button
              className="mitra-profile-btn"
              onClick={() => navigate('/mitra/profil')}
              title={`Profil ${currentMitra.nama}`}
            >
              <span className="mitra-avatar">{currentMitra.inisial}</span>
              <div className="mitra-profile-text">
                <strong>{currentMitra.nama}</strong>
                <span>{currentMitra.role}</span>
              </div>
            </button>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="mitra-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
