import { useCallback, useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Award, Bell, CalendarDays, LogOut, Menu, Search, User, X } from 'lucide-react';
import { initialProfile, initialRegistrations, initials, participantWorkshops, readParticipantData } from './data';
import UnandLogo from '../../components/UnandLogo';
import './peserta.css';

const navItems = [
  { to: '/peserta/cari-workshop', label: 'Cari Workshop', icon: Search },
  { to: '/peserta/workshop-saya', label: 'Workshop Saya', icon: CalendarDays },
  { to: '/peserta/sertifikat', label: 'Sertifikat', icon: Award },
  { to: '/peserta/profil', label: 'Profil', icon: User },
];

export default function LayoutPeserta() {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationsRead, setNotificationsRead] = useState(false);
  const [message, setMessage] = useState('');
  const timer = useRef();
  const notificationRef = useRef();
  const menuButtonRef = useRef();
  const sidebarRef = useRef();
  const [profile, setProfile] = useState(() => readParticipantData('profile', initialProfile, value => value && Object.keys(initialProfile).every(key => typeof value[key] === 'string') && value.nama.trim()));
  const [registrations, setRegistrations] = useState(() => readParticipantData('registrations', initialRegistrations, value => Array.isArray(value) && new Set(value.map(item => item?.workshopId)).size === value.length && value.every(item => item && participantWorkshops.some(workshop => workshop.id === item.workshopId) && ['registered', 'waiting', 'completed'].includes(item.status))));
  const notify = useCallback(text => {
    setMessage(text);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setMessage(''), 5000);
  }, []);
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => { setMenuOpen(false); setNotificationsOpen(false); }, [location.pathname]);
  useEffect(() => {
    const handleOutside = event => { if (!notificationRef.current?.contains(event.target)) setNotificationsOpen(false); };
    const handleEscape = event => { if (event.key === 'Escape') setNotificationsOpen(false); };
    if (!notificationsOpen) return;
    document.addEventListener('pointerdown', handleOutside);
    document.addEventListener('keydown', handleEscape);
    return () => { document.removeEventListener('pointerdown', handleOutside); document.removeEventListener('keydown', handleEscape); };
  }, [notificationsOpen]);
  useEffect(() => {
    if (!menuOpen) return;
    const sidebar = sidebarRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const buttons = sidebar.querySelectorAll('button, a');
    buttons[0]?.focus();
    const handleKey = event => {
      if (event.key === 'Escape') setMenuOpen(false);
      if (event.key !== 'Tab') return;
      const first = buttons[0];
      const last = buttons[buttons.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    sidebar.addEventListener('keydown', handleKey);
    return () => { sidebar.removeEventListener('keydown', handleKey); document.body.style.overflow = previousOverflow; menuButtonRef.current?.focus(); };
  }, [menuOpen]);

  const persist = (key, value, setter) => {
    try {
      localStorage.setItem(`workshop-unand:peserta:${key}`, JSON.stringify(value));
      setter(value);
      return true;
    } catch {
      notify('Data belum tersimpan. Periksa izin penyimpanan browser, lalu coba lagi.');
      return false;
    }
  };
  const saveProfile = value => persist('profile', value, setProfile);
  const register = workshopId => {
    if (registrations.some(item => item.workshopId === workshopId)) return false;
    return persist('registrations', [...registrations, { workshopId, status: 'registered' }], setRegistrations);
  };
  const pageTitle = location.pathname.includes('/workshop/') ? 'Detail Workshop' : navItems.find(item => location.pathname === item.to)?.label || 'Cari Workshop';

  return <div className="peserta-shell">
    <a className="peserta-skip" href="#peserta-content">Ke konten utama</a>
    {menuOpen && <button className="peserta-overlay" aria-label="Tutup navigasi" tabIndex={-1} onClick={() => setMenuOpen(false)} />}
    <aside ref={sidebarRef} id="peserta-navigation" className={`peserta-sidebar${menuOpen ? ' is-open' : ''}`}>
      <div className="peserta-brand"><UnandLogo className="peserta-brandmark" /><div><strong>Workshop UNAND</strong><span>Sistem Informasi Workshop</span></div><button className="peserta-menu-close peserta-icon-button" aria-label="Tutup navigasi" title="Tutup navigasi" onClick={() => setMenuOpen(false)}><X size={20} /></button></div>
      <div className="peserta-role"><span>MASUK SEBAGAI</span><strong>Peserta</strong></div>
      <nav aria-label="Navigasi peserta">{navItems.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} className={({ isActive }) => (isActive || (to.endsWith('cari-workshop') && location.pathname.includes('/workshop/'))) ? 'is-active' : ''}><Icon size={20} /><span>{label}</span></NavLink>)}</nav>
      <button className="peserta-logout" onClick={() => navigate('/')}><LogOut size={20} /><span>Keluar</span></button>
    </aside>
    <div className="peserta-main">
      <header className="peserta-topbar">
        <div className="peserta-title-wrap"><button ref={menuButtonRef} className="peserta-menu-button peserta-icon-button" aria-label="Buka navigasi" title="Buka navigasi" aria-expanded={menuOpen} aria-controls="peserta-navigation" onClick={() => setMenuOpen(true)}><Menu size={22} /></button><div><span className="peserta-eyebrow">WORKSHOP UNAND</span><h1>{pageTitle}</h1></div></div>
        <div className="peserta-top-actions">
          <div className="peserta-notifications" ref={notificationRef}><button className="peserta-icon-button" aria-label="Notifikasi" title="Notifikasi" aria-expanded={notificationsOpen} onClick={() => { setNotificationsOpen(value => !value); setNotificationsRead(true); }}><Bell size={20} />{!notificationsRead && <i className="peserta-notification-dot" />}</button>
            {notificationsOpen && <div className="peserta-notification-popover"><h2>Notifikasi</h2><NavLink to="/peserta/sertifikat"><Award size={20} /><div><strong>Sertifikat telah diterbitkan</strong><p>Public Speaking untuk Profesional Muda</p><small>18 April 2025</small></div></NavLink></div>}
          </div>
          <NavLink to="/peserta/profil" className="peserta-profile-link" aria-label={`Profil ${profile.nama}`}><span className="peserta-avatar">{initials(profile.nama)}</span><div><strong>{profile.nama}</strong><span>Peserta</span></div></NavLink>
        </div>
      </header>
      <main id="peserta-content" className="peserta-content"><Outlet context={{ profile, saveProfile, registrations, register, notify }} /></main>
    </div>
    {message && <div className="peserta-toast" role="status">{message}<button className="peserta-icon-button" aria-label="Tutup pesan" onClick={() => setMessage('')}><X size={16} /></button></div>}
  </div>;
}
