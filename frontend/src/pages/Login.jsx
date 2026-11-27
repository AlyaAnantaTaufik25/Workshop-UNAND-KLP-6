import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ROLE_HOME, useAuth } from '../context/AuthContext';
import UnandLogo from '../components/UnandLogo';
import './login.css';
import {
  User, Building2, FileText, Landmark, Users, Check
} from 'lucide-react';

const roles = [
  { key: 'peserta',            label: 'Peserta',            icon: User,      path: '/peserta/cari-workshop' },
  { key: 'humas',              label: 'Humas',              icon: Building2, path: '/humas/ringkasan' },
  { key: 'sekretariat', label: 'Sekretariat Rektor', icon: FileText,  path: '/sekretariat/kegiatan' },
  { key: 'mitra',              label: 'Mitra',              icon: Users,     path: '/mitra/kegiatan-kerja-sama' },
  { key: 'rektor',             label: 'Rektor',             icon: Landmark,  path: '/rektor/pengajuan' },
];

const DEMO_PASSWORD = 'password123';

export default function Login() {
  const [email, setEmail]       = useState('peserta@unand.ac.id');
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [selectedRole, setSelectedRole] = useState('peserta');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login } = useAuth();

  // Tujuan setelah masuk: halaman yang tadi dibuka (bila milik role yang sama), selain itu beranda role
  const from = location.state?.from;
  const targetFor = role => {
    const home = ROLE_HOME[role] || '/';
    const prefix = home.split('/').slice(0, 2).join('/');
    return typeof from === 'string' && from.startsWith(`${prefix}/`) ? from : home;
  };

  if (user) return <Navigate to={targetFor(user.role)} replace />;

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    setLoading(true);
    try {
      const me = await login(email.trim(), password);
      navigate(targetFor(me.role), { replace: true });
    } catch (err) {
      setError(err.message || 'Gagal masuk. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  // Akses cepat demo: isi otomatis akun demo sesuai role
  const handleDemoSelect = (roleKey) => {
    setSelectedRole(roleKey);
    setEmail(`${roleKey}@unand.ac.id`);
    setPassword(DEMO_PASSWORD);
    setError('');
  };

  return (
    <div className="login-root">
      {/* ── LEFT PANEL ── */}
      <div className="login-left">
        <div className="login-logo">
          <UnandLogo className="login-logo-icon" />
          <div className="login-logo-text">
            <span className="login-logo-name">Workshop UNAND</span>
            <span className="login-logo-sub">Universitas Andalas</span>
          </div>
        </div>

        <div className="login-left-bottom">
          <p className="login-tagline-label">Sistem Informasi Manajemen Workshop</p>
          <h1 className="login-tagline-heading">
            Belajar, berkolaborasi, dan bertumbuh bersama.
          </h1>
          <p className="login-tagline-desc">
            Temukan kegiatan berkualitas dari Universitas Andalas dan mitra terpercaya.
          </p>
          <p className="login-copyright">© 2026 Universitas Andalas</p>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="login-right">
        <div className="login-form-container">
          <p className="login-welcome-label">Selamat Datang</p>

          <h2 className="login-heading">Masuk ke akun Anda</h2>
          <p className="login-subheading">Gunakan akun Workshop UNAND Anda.</p>

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                className="form-input"
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Kata sandi</label>
              <input
                className="form-input"
                type="password"
                placeholder="Minimal 8 karakter"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            {error && <p role="alert" style={{ color: '#b91c1c', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '8px 12px', fontSize: 13, margin: '0 0 12px' }}>{error}</p>}
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Memproses…' : `Masuk sebagai ${roles.find(r => r.key === selectedRole)?.label ?? 'Peserta'}`}
            </button>
          </form>

          <p className="login-register-link">
            Belum punya akun peserta umum?{' '}
            <Link to="/register">Daftar sekarang</Link>
          </p>

          {/* DIVIDER */}
          <div className="login-divider">
            <div className="login-divider-line" />
            <span className="login-demo-label">Akses Cepat Demo</span>
            <div className="login-divider-line" />
          </div>

          <p className="login-demo-subtitle">
            Pilih role untuk mengisi akun demo (kata sandi: password123).
          </p>

          <div className="demo-grid">
            {roles.map((role) => {
              const Icon = role.icon;
              const isActive = selectedRole === role.key;
              return (
                <button
                  type="button"
                  key={role.key}
                  className={`demo-btn${role.key === 'rektor' ? ' demo-btn-full' : ''}${isActive ? ' active' : ''}`}
                  onClick={() => handleDemoSelect(role.key)}
                >
                  <div className="demo-btn-icon">
                    <Icon size={14} />
                  </div>
                  {role.label}
                  {isActive && (
                    <span className="demo-check">
                      <Check size={14} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

