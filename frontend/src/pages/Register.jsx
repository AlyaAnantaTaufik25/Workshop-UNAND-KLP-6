import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import UnandLogo from '../components/UnandLogo';
import './login.css';
import './register.css';

export default function Register() {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleRegister = event => {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    const nama = values.get('nama').trim();
    const email = values.get('email').trim();
    const telepon = values.get('telepon').trim();

    if (!nama) {
      setError('Masukkan nama lengkap Anda.');
      form.elements.nama.focus();
      return;
    }
    if (!values.get('password').trim()) {
      setError('Kata sandi tidak boleh hanya berisi spasi.');
      form.elements.password.focus();
      return;
    }
    const digits = telepon.replace(/\D/g, '');
    if (!/^\+?\d[\d\s()-]*$/.test(telepon) || digits.length < 8 || digits.length > 15) {
      setError('Masukkan nomor HP yang valid, terdiri dari 8–15 digit.');
      form.elements.telepon.focus();
      return;
    }

    try {
      // Demo only: reuse the participant profile without storing credentials.
      localStorage.setItem('workshop-unand:peserta:profile', JSON.stringify({
        nama,
        email,
        telepon,
        jenis: 'Umum',
        nim: '',
        prodi: '',
      }));
    } catch {
      setError('Profil demo belum tersimpan. Izinkan penyimpanan browser, lalu coba lagi.');
      return;
    }
    navigate('/peserta/cari-workshop', { replace: true });
  };

  return (
    <div className="login-root register-root">
      <aside className="login-left">
        <Link to="/" className="login-logo" aria-label="Workshop UNAND, kembali ke halaman masuk">
          <UnandLogo className="login-logo-icon" />
          <div className="login-logo-text">
            <span className="login-logo-name">Workshop UNAND</span>
            <span className="login-logo-sub">Universitas Andalas</span>
          </div>
        </Link>

        <div className="login-left-bottom">
          <p className="login-tagline-label">Sistem Informasi Manajemen Workshop</p>
          <h1 className="login-tagline-heading">
            Belajar, <br />berkolaborasi, dan <br />bertumbuh bersama.
          </h1>
          <p className="login-tagline-desc">
            Temukan kegiatan berkualitas dari Universitas Andalas dan mitra terpercaya.
          </p>
        </div>
      </aside>

      <main className="login-right">
        <div className="login-form-container">
          <p className="login-welcome-label">Selamat Datang</p>
          <p className="login-banner">Prototipe interaktif · akun demo, bukan autentikasi nyata.</p>
          <h2 className="login-heading">Buat akun peserta</h2>
          <p className="login-subheading">Daftar sebagai peserta umum untuk mengikuti kegiatan.</p>

          <form onSubmit={handleRegister} onChange={() => error && setError('')} aria-label="Daftar akun peserta" aria-describedby={error ? 'register-error' : undefined}>
            <div className="form-group">
              <label className="form-label" htmlFor="register-name">Nama lengkap</label>
              <input
                id="register-name"
                className="form-input"
                name="nama"
                autoComplete="name"
                placeholder="Masukkan nama lengkap"
                required
                maxLength={100}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="register-email">Email</label>
              <input
                id="register-email"
                className="form-input"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="nama@email.com"
                required
                maxLength={254}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="register-password">Kata sandi</label>
              <input
                id="register-password"
                className="form-input"
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder="Minimal 8 karakter"
                required
                minLength={8}
                maxLength={128}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="register-phone">Nomor HP</label>
              <input
                id="register-phone"
                className="form-input"
                name="telepon"
                type="tel"
                autoComplete="tel"
                placeholder="08xx xxxx xxxx"
                required
                minLength={8}
                maxLength={20}
              />
            </div>
            {error && <p id="register-error" className="register-error" role="alert">{error}</p>}
            <button type="submit" className="btn-primary">Daftar Akun Demo</button>
          </form>

          <p className="login-register-link">
            Sudah punya akun? <Link to="/">Masuk di sini</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
