import { useCallback, useEffect, useRef, useState, Suspense } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Award, Bell, CalendarDays, House, Menu, Search, User } from 'lucide-react';
import { initials } from './data';
import { PageLoader, ErrorNotice } from '../../components/RequireRole';
import { useAuth } from '../../context/AuthContext';
import { attendanceApi, certificatesApi, readFileAsDataUrl, registrationsApi, workshopsApi } from '../../api';
import { getCertificateVersions } from './certificateCorrections';
import './peserta.css';
import './workshopStates.css';
import './sertifikat.css';
import { toast } from '../../components/Dialog';
import useAutoRefresh from '../../hooks/useAutoRefresh';
import useNotifications from '../../hooks/useNotifications';
import Sidebar from '../../components/Sidebar';
import useOnChange from '../../hooks/useOnChange';

const SECTIONS = [
  { items: [
    { to: '/peserta/beranda', label: 'Beranda', icon: House },
    { to: '/peserta/cari-workshop', label: 'Cari Workshop', icon: Search, match: ['/peserta/cari-workshop', '/peserta/workshop'] },
  ] },
  { title: 'Kegiatan Saya', items: [
    { to: '/peserta/workshop-saya', label: 'Workshop Saya', icon: CalendarDays },
    { to: '/peserta/sertifikat', label: 'Sertifikat', icon: Award },
  ] },
];

const navItems = [
  { to: '/peserta/beranda', label: 'Beranda', icon: House },
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
  const notificationRef = useRef();
  const menuButtonRef = useRef();
  const sidebarRef = useRef();
  const { user, updateProfile } = useAuth();
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
  // oxlint-disable-next-line react/set-state-in-effect -- ambil data dari server (sinkronisasi sistem eksternal)
  useEffect(() => { reload(); }, [reload]);
  useAutoRefresh(reload, { interval: 60000 });

  const certificateOriginals = issued
    .map(certificate => ({ ...certificate, workshop: workshops.find(item => item.id === certificate.workshopId) }))
    .filter(certificate => certificate.workshop);
  const certificates = certificateOriginals.map(certificate => getCertificateVersions(certificate, corrections).at(-1));
  const unreadCorrections = corrections.filter(item => ['selesai', 'ditolak'].includes(item.status) && !item.notificationRead && certificates.some(certificate => certificate.id === item.certificateId)).length;
  // Notifikasi server (pendaftaran, pengingat H-1, sertifikat terbit) — real-time via SSE
  const { items: serverNotifications, unread: serverUnread, markRead } = useNotifications({ onNew: reload });
  const totalUnread = serverUnread + unreadCorrections;
  // Pesan singkat memakai toast global yang seragam dengan portal lain
  const notify = useCallback(text => {
    toast(text, { tone: /belum|gagal|tidak|salah|ditolak/i.test(text) ? 'error' : 'success', duration: 5000 });
  }, []);
  useOnChange(location.pathname, () => { setMenuOpen(false); setNotificationsOpen(false); });
  useEffect(() => {
    const handleOutside = event => { if (!notificationRef.current?.contains(event.target)) setNotificationsOpen(false); };
    const handleEscape = event => { if (event.key === 'Escape') setNotificationsOpen(false); };
    if (!notificationsOpen) return;
    document.addEventListener('pointerdown', handleOutside);
    document.addEventListener('keydown', handleEscape);
    return () => { document.removeEventListener('pointerdown', handleOutside); document.removeEventListener('keydown', handleEscape); };
  }, [notificationsOpen]);
  useEffect(() => {
    const menuButton = menuButtonRef.current;
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
    return () => { sidebar.removeEventListener('keydown', handleKey); document.body.style.overflow = previousOverflow; menuButton?.focus(); };
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
  const pageTitle = location.pathname.startsWith('/peserta/sertifikat') ? 'Sertifikat' : location.pathname.includes('/workshop/') ? 'Detail Workshop' : navItems.find(item => location.pathname === item.to)?.label || 'Cari Workshop';

  return <div className="peserta-shell">
    <a className="peserta-skip" href="#peserta-content">Ke konten utama</a>
    {menuOpen && <button className="peserta-overlay" aria-label="Tutup navigasi" tabIndex={-1} onClick={() => setMenuOpen(false)} />}
    <Sidebar asideRef={sidebarRef} id="peserta-navigation" className={`peserta-sidebar${menuOpen ? ' is-open' : ''}`} ariaLabel="Navigasi peserta" portal="Peserta" sections={SECTIONS} onClose={() => setMenuOpen(false)} />
    <div className="peserta-main">
      <header className="peserta-topbar">
        <div className="peserta-title-wrap"><button ref={menuButtonRef} className="peserta-menu-button peserta-icon-button" aria-label="Buka navigasi" title="Buka navigasi" aria-expanded={menuOpen} aria-controls="peserta-navigation" onClick={() => setMenuOpen(true)}><Menu size={22} /></button><div><span className="peserta-eyebrow">WORKSHOP UNAND</span><h1>{pageTitle}</h1></div></div>
        <div className="peserta-top-actions">
          <div className="peserta-notifications" ref={notificationRef}><button className="peserta-icon-button" aria-label={totalUnread ? `Notifikasi, ${totalUnread} belum dibaca` : 'Notifikasi'} title="Notifikasi" aria-expanded={notificationsOpen} onClick={() => setNotificationsOpen(value => !value)}><Bell size={20} />{totalUnread > 0 && <span className="peserta-notification-count" aria-hidden="true">{totalUnread > 9 ? '9+' : totalUnread}</span>}</button>
            {notificationsOpen && <div className="peserta-notification-popover"><div className="peserta-notif-head"><h2>Notifikasi</h2>{serverUnread > 0 && <button type="button" className="peserta-notif-readall" onClick={() => markRead()}>Tandai semua dibaca</button>}</div>
              <div className="peserta-notif-list">
                {unreadCorrections > 0 && <NavLink to="/peserta/sertifikat/notifikasi" className="peserta-notif-item is-unread"><Award size={18} /><div><strong>Tanggapan perbaikan sertifikat ({unreadCorrections})</strong><p>Lihat tanggapan penerbit untuk pengajuan Anda.</p></div></NavLink>}
                {serverNotifications.slice(0, 6).map(n => <button type="button" key={n.id} className={`peserta-notif-item${n.belumDibaca ? ' is-unread' : ''}`} onClick={() => { markRead(n.id); setNotificationsOpen(false); if (n.link) navigate(n.link); }}><Bell size={18} /><div><strong>{n.judul}</strong>{n.deskripsi && <p>{n.deskripsi}</p>}<small>{n.waktu.replace(' · belum dibaca', '')}</small></div></button>)}
                {!serverNotifications.length && !unreadCorrections && <p className="peserta-notif-empty">Belum ada notifikasi.</p>}
              </div>
            </div>}
          </div>
          <NavLink to="/peserta/profil" className="peserta-profile-link" aria-label={`Profil ${profile.nama}`}><span className="peserta-avatar">{initials(profile.nama)}</span><div><strong>{profile.nama}</strong><span>Peserta</span></div></NavLink>
        </div>
      </header>
      <main id="peserta-content" className="peserta-content">{loading ? <PageLoader /> : loadError && !workshops.length ? <ErrorNotice error={loadError} onRetry={() => { setLoading(true); reload(); }} /> : <Suspense fallback={<PageLoader />}><Outlet context={{ profile, saveProfile, workshops, registrations, certificates, certificateOriginals, corrections, submitCorrection, cancelCorrection, markCorrectionRead, register, cancelRegistration, submitAttendance, notify, reload }} /></Suspense>}</main>
    </div>
  </div>;
}
