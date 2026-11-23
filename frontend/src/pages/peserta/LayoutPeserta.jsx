import { useCallback, useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Award, Bell, CalendarDays, LogOut, Menu, Search, User, X } from 'lucide-react';
import { initials } from './data';
import UnandLogo from '../../components/UnandLogo';
import { PageLoader, ErrorNotice } from '../../components/RequireRole';
import { useAuth } from '../../context/AuthContext';
import { attendanceApi, certificatesApi, readFileAsDataUrl, registrationsApi, workshopsApi } from '../../api';
import { getCertificateVersions } from './certificateCorrections';
import './peserta.css';
import './workshopStates.css';
import './sertifikat.css';

const navItems = [
  { to: '/peserta/cari-workshop', label: 'Cari Workshop', icon: Search },
  { to: '/peserta/workshop-saya', label: 'Workshop Saya', icon: CalendarDays },
  { to: '/peserta/sertifikat', label: 'Sertifikat', icon: Award },
  { to: '/peserta/profil', label: 'Profil', icon: User },
];

// Portal peserta memakai slug sebagai id kegiatan (dipakai di URL & pencocokan pendaftaran)
const toParticipantWorkshop = workshop => ({ ...workshop, id: workshop.slug, dbId: workshop.id });

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
  const { user, logout, updateProfile } = useAuth();
  const profile = { nama: user?.nama || '', email: user?.email || '', jenis: user?.jenis || 'Umum', telepon: user?.telepon || '', nim: user?.nim || '', prodi: user?.prodi || '' };
  const [workshops, setWorkshops] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [issued, setIssued] = useState([]);
  const [corrections, setCorrections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // Ambil seluruh data peserta dari backend
  const reload = useCallback(async () => {
    try {
      const [ws, regs, certs, corr] = await Promise.all([
        workshopsApi.list(), registrationsApi.my(), certificatesApi.my(), certificatesApi.corrections(),
      ]);
      setWorkshops(ws.map(toParticipantWorkshop));
      setRegistrations(regs);
      setIssued(certs);
      setCorrections(corr);
      setLoadError(null);
    } catch (err) {
      setLoadError(err);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { reload(); }, [reload]);

  const certificateOriginals = issued
    .map(certificate => ({ ...certificate, workshop: workshops.find(item => item.id === certificate.workshopId) }))
    .filter(certificate => certificate.workshop);
  const certificates = certificateOriginals.map(certificate => getCertificateVersions(certificate, corrections).at(-1));
  const unreadCorrections = corrections.filter(item => ['selesai', 'ditolak'].includes(item.status) && !item.notificationRead && certificates.some(certificate => certificate.id === item.certificateId)).length;
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

  // ── Aksi peserta (semua tersimpan di database melalui API)
  const saveProfile = async value => {
    try {
      await updateProfile(value);
      return true;
    } catch (err) {
      notify(err.message || 'Profil belum tersimpan.');
      return false;
    }
  };
  // Melempar error agar dialog dapat menampilkan pesan dari server
  const register = async workshopId => {
    await registrationsApi.register(workshopId);
    await reload();
    return true;
  };
  const cancelRegistration = async workshopId => {
    const entry = registrations.find(item => item.workshopId === workshopId);
    if (!entry) throw new Error('Pendaftaran tidak ditemukan.');
    await registrationsApi.cancel(entry.registrationId);
    await reload();
    return true;
  };
  const submitAttendance = async (workshopId, evidence) => {
    if (evidence.method === 'upload') {
      const fileData = await readFileAsDataUrl(evidence.file);
      await attendanceApi.upload({ workshopId, fileName: evidence.fileName, fileData });
    } else {
      await attendanceApi.checkIn({ workshopId, code: evidence.code, latitude: evidence.location?.latitude, longitude: evidence.location?.longitude });
    }
    await reload();
    return true;
  };
  const submitCorrection = async (certificate, payload) => {
    try {
      const request = await certificatesApi.createCorrection({
        certificateId: certificate.id,
        changes: payload.changes.map(change => ({ field: change.field, newValue: change.newValue })),
        reason: payload.reason,
        agreed: payload.agreed,
        attachment: payload.attachment || null,
      });
      await reload();
      return { ok: true, request };
    } catch (err) {
      return { ok: false, message: err.message };
    }
  };
  const cancelCorrection = async id => {
    try {
      await certificatesApi.cancelCorrection(id);
      await reload();
      return { ok: true };
    } catch (err) {
      return { ok: false, message: err.message };
    }
  };
  const markCorrectionRead = useCallback(async id => {
    try {
      setCorrections(await certificatesApi.markCorrectionsRead(id));
      return { ok: true };
    } catch (err) {
      return { ok: false, message: err.message };
    }
  }, []);
  const handleLogout = () => { logout(); navigate('/', { replace: true }); };
  const pageTitle = location.pathname.startsWith('/peserta/sertifikat') ? 'Sertifikat' : location.pathname.includes('/workshop/') ? 'Detail Workshop' : navItems.find(item => location.pathname === item.to)?.label || 'Cari Workshop';

  return <div className="peserta-shell">
    <a className="peserta-skip" href="#peserta-content">Ke konten utama</a>
    {menuOpen && <button className="peserta-overlay" aria-label="Tutup navigasi" tabIndex={-1} onClick={() => setMenuOpen(false)} />}
    <aside ref={sidebarRef} id="peserta-navigation" className={`peserta-sidebar${menuOpen ? ' is-open' : ''}`}>
      <div className="peserta-brand"><UnandLogo className="peserta-brandmark" /><div><strong>Workshop UNAND</strong><span>Sistem Informasi Workshop</span></div><button className="peserta-menu-close peserta-icon-button" aria-label="Tutup navigasi" title="Tutup navigasi" onClick={() => setMenuOpen(false)}><X size={20} /></button></div>
      <div className="peserta-role"><span>MASUK SEBAGAI</span><strong>Peserta</strong></div>
      <nav aria-label="Navigasi peserta">{navItems.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} className={({ isActive }) => (isActive || (to.endsWith('cari-workshop') && location.pathname.includes('/workshop/'))) ? 'is-active' : ''}><Icon size={20} /><span>{label}</span></NavLink>)}</nav>
      <button className="peserta-logout" onClick={handleLogout}><LogOut size={20} /><span>Keluar</span></button>
    </aside>
    <div className="peserta-main">
      <header className="peserta-topbar">
        <div className="peserta-title-wrap"><button ref={menuButtonRef} className="peserta-menu-button peserta-icon-button" aria-label="Buka navigasi" title="Buka navigasi" aria-expanded={menuOpen} aria-controls="peserta-navigation" onClick={() => setMenuOpen(true)}><Menu size={22} /></button><div><span className="peserta-eyebrow">WORKSHOP UNAND</span><h1>{pageTitle}</h1></div></div>
        <div className="peserta-top-actions">
          <div className="peserta-notifications" ref={notificationRef}><button className="peserta-icon-button" aria-label="Notifikasi" title="Notifikasi" aria-expanded={notificationsOpen} onClick={() => { setNotificationsOpen(value => !value); setNotificationsRead(true); }}><Bell size={20} />{unreadCorrections > 0 ? <span className="peserta-notification-count" aria-label={`${unreadCorrections} notifikasi belum dibaca`}>{unreadCorrections}</span> : (!notificationsRead && certificates.length > 0) && <i className="peserta-notification-dot" />}</button>
            {notificationsOpen && <div className="peserta-notification-popover"><h2>Notifikasi</h2>{certificates.length ? <><NavLink to="/peserta/sertifikat/notifikasi"><Bell size={20} /><div><strong>Notifikasi perbaikan ({unreadCorrections})</strong><p>Lihat tanggapan penerbit untuk pengajuan Anda.</p></div></NavLink><NavLink to="/peserta/sertifikat"><Award size={20} /><div><strong>Sertifikat telah diterbitkan</strong><p>{certificates[0].workshop.title}</p><small>{certificates[0].issued}</small></div></NavLink></> : <p>Belum ada notifikasi sertifikat.</p>}</div>}
          </div>
          <NavLink to="/peserta/profil" className="peserta-profile-link" aria-label={`Profil ${profile.nama}`}><span className="peserta-avatar">{initials(profile.nama)}</span><div><strong>{profile.nama}</strong><span>Peserta</span></div></NavLink>
        </div>
      </header>
      <main id="peserta-content" className="peserta-content">{loading ? <PageLoader /> : loadError && !workshops.length ? <ErrorNotice error={loadError} onRetry={() => { setLoading(true); reload(); }} /> : <Outlet context={{ profile, saveProfile, workshops, registrations, certificates, certificateOriginals, corrections, submitCorrection, cancelCorrection, markCorrectionRead, register, cancelRegistration, submitAttendance, notify, reload }} />}</main>
    </div>
    {message && <div className="peserta-toast" role="status">{message}<button className="peserta-icon-button" aria-label="Tutup pesan" onClick={() => setMessage('')}><X size={16} /></button></div>}
  </div>;
}
