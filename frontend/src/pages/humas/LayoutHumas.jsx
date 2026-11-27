import { useState, useRef, useEffect, Suspense } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Home, Briefcase, Handshake, MapPin, Users, FileText, BarChart3, ChevronDown, Bell, X } from 'lucide-react';
import { useCurrentUser } from '../../context/AuthContext';
import useNotifications from '../../hooks/useNotifications';
import './humas.css';
import { useMobileNav } from '../../components/MobileNav';
import Sidebar from '../../components/Sidebar';
import { PageLoader } from '../../components/RequireRole';
import { Award, ShieldCheck } from 'lucide-react';

const SECTIONS = [
  { items: [{ to: '/humas/ringkasan', label: 'Dashboard', icon: Home }] },
  { title: 'Kelola', items: [
    { to: '/humas/kelola-kegiatan', label: 'Kegiatan', icon: Briefcase, badge: t => t.presensiMenunggu?.total },
    { to: '/humas/kelola-mitra', label: 'Mitra', icon: Handshake },
    { to: '/humas/kelola-gedung', label: 'Gedung & Ruangan', icon: MapPin },
    { to: '/humas/kelola-pengguna', label: 'Pengguna', icon: Users },
  ] },
  { title: 'Sertifikat', items: [
    { to: '/humas/template-sertifikat', label: 'Template', icon: FileText },
    { to: '/humas/perbaikan-sertifikat', label: 'Perbaikan', icon: Award, badge: t => t.perbaikanAktif?.total },
  ] },
  { title: 'Analitik', items: [
    { to: '/humas/laporan', label: 'Laporan', icon: BarChart3 },
    { to: '/humas/log-audit', label: 'Log Audit', icon: ShieldCheck },
  ] },
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
  '/humas/log-audit':            'Log Audit',
  '/humas/profil':               'Profil',
};

export default function LayoutHumas() {
  // Navigasi sidebar untuk layar kecil
  const { navClass, toggle: navToggle, overlay: navOverlay } = useMobileNav();
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotif, setShowNotif] = useState(false);
  const notifRef = useRef(null);
  const currentHumas = useCurrentUser();
  const { items: notifikasiData, unread: unreadCount, markRead } = useNotifications();

  // Tutup dropdown saat klik luar
  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotif(false);
      }
    }
    if (showNotif) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotif]);

  const pageTitle =
    pageTitles[location.pathname] ??
    Object.entries(pageTitles).find(([k]) => location.pathname.startsWith(k))?.[1] ??
    'Dashboard';


  return (
    <div className={`app-layout role-humas${navClass}`}>
      {navOverlay}

      {/* ── SIDEBAR ── */}
      <Sidebar className="sidebar" ariaLabel="Navigasi Humas" portal="Humas" sections={SECTIONS} />

      {/* ── MAIN CONTENT AREA ── */}
      <div className="main-content">

        {/* Top Header */}
        <header className="top-header">
          <div className="top-header-left">
            {navToggle}
            <span className="top-header-crumb">WORKSHOP UNAND</span>
            <h1 className="top-header-title">{pageTitle}</h1>
          </div>

          <div className="top-header-right">
            {/* Notification Bell – dropdown, bukan modal-overlay */}
            <div className="layout-notif-wrapper" ref={notifRef}>
              <button
                className="layout-notif-bell"
                onClick={() => setShowNotif(o => !o)}
                title="Notifikasi Perbaikan Sertifikat"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="layout-notif-badge">{unreadCount}</span>
                )}
              </button>

              {showNotif && (
                <div className="layout-notif-dropdown">
                  <div className="layout-notif-dropdown-header">
                    <span className="layout-notif-dropdown-title">Notifikasi Perbaikan Sertifikat</span>
                    <button className="modal-close-btn" onClick={() => setShowNotif(false)} aria-label="Tutup"><X size={15} /></button>
                  </div>
                  <div className="layout-notif-dropdown-body">
                    {notifikasiData.length === 0 && <p className="notif-item-desc" style={{ padding: 16 }}>Belum ada notifikasi.</p>}
                    {notifikasiData.map(n => (
                      <div key={n.id} className="notif-item">
                        <div className="notif-item-icon"><Bell size={15} /></div>
                        <div className="notif-item-content">
                          <p className="notif-item-title">{n.judul}</p>
                          <p className="notif-item-desc">{n.deskripsi}</p>
                          <p className="notif-item-time">{n.waktu}</p>
                          <button
                            className="notif-item-link"
                            onClick={() => { setShowNotif(false); markRead(n.id); if (n.link) navigate(n.link); }}
                          >
                            Lihat Detail
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

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
          <Suspense fallback={<PageLoader />}><Outlet /></Suspense>
        </main>
      </div>

    </div>
  );
}
