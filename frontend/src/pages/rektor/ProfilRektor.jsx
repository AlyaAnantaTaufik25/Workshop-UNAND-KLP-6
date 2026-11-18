import { useState } from 'react';
import { User, Lock, KeyRound, Check, ShieldCheck, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { currentRektor } from './data';

function initials(name) {
  if (!name) return 'AR';
  return name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase();
}

export default function ProfilRektor() {
  const [activeTab, setActiveTab] = useState('profil'); // 'profil' | 'pin'

  // Form Profil
  const [form, setForm] = useState({ ...currentRektor });
  const [savedMessage, setSavedMessage] = useState('');
  const [error, setError] = useState('');

  // State PIN Digital Signature
  const [currentStoredPin, setCurrentStoredPin] = useState(() => {
    return localStorage.getItem('rektor_pin') || '123456';
  });
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showOldPin, setShowOldPin] = useState(false);
  const [showNewPin, setShowNewPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [pinSuccessMsg, setPinSuccessMsg] = useState('');
  const [pinError, setPinError] = useState('');

  const update = event => {
    setForm(val => ({ ...val, [event.target.name]: event.target.value }));
  };

  const handleSubmit = event => {
    event.preventDefault();
    const next = Object.fromEntries(
      Object.entries(form).map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value])
    );
    if (!next.nama || !next.email || !next.telepon) {
      setError('Lengkapi semua data profil sebelum menyimpan.');
      return;
    }
    setError('');
    setForm(next);
    setSavedMessage('Perubahan profil berhasil disimpan.');
    setTimeout(() => setSavedMessage(''), 3500);
  };

  // Handler Ubah PIN
  const handleUbahPin = (e) => {
    e.preventDefault();
    setPinError('');
    setPinSuccessMsg('');

    if (oldPin !== currentStoredPin) {
      setPinError('PIN lama tidak sesuai. Silakan periksa kembali atau gunakan tombol reset.');
      return;
    }

    if (!/^\d{6}$/.test(newPin)) {
      setPinError('PIN baru harus terdiri dari tepat 6 digit angka.');
      return;
    }

    if (newPin !== confirmPin) {
      setPinError('Konfirmasi PIN baru tidak cocok.');
      return;
    }

    localStorage.setItem('rektor_pin', newPin);
    setCurrentStoredPin(newPin);
    setOldPin('');
    setNewPin('');
    setConfirmPin('');
    setPinSuccessMsg('PIN Tanda Tangan Digital Rektor berhasil diperbarui!');
    setTimeout(() => setPinSuccessMsg(''), 4500);
  };

  // Handler Lupa / Reset PIN
  const handleResetDefaultPin = () => {
    if (window.confirm('Apakah Anda yakin ingin mereset PIN tanda tangan Rektor ke PIN awal (123456)?')) {
      localStorage.setItem('rektor_pin', '123456');
      setCurrentStoredPin('123456');
      setOldPin('');
      setNewPin('');
      setConfirmPin('');
      setPinError('');
      setPinSuccessMsg('PIN berhasil direset ke default: 123456.');
      setTimeout(() => setPinSuccessMsg(''), 5000);
    }
  };

  return (
    <div className="peserta-stack">
      <section className="peserta-intro">
        <h2>Profil Rektor & Keamanan TTE</h2>
        <p>Kelola data identitas pimpinan dan PIN keamanan tanda tangan digital sertifikat resmi.</p>
      </section>

      {/* Tab Navigasi Profil vs PIN */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #dfe6e1', paddingBottom: '10px' }}>
        <button
          type="button"
          onClick={() => setActiveTab('profil')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '9px 18px',
            borderRadius: '8px',
            border: activeTab === 'profil' ? '1px solid #14532d' : '1px solid transparent',
            background: activeTab === 'profil' ? '#14532d' : 'white',
            color: activeTab === 'profil' ? '#fff' : '#4b5563',
            fontWeight: 700,
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <User size={16} /> Informasi Pribadi
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pin')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '9px 18px',
            borderRadius: '8px',
            border: activeTab === 'pin' ? '1px solid #14532d' : '1px solid transparent',
            background: activeTab === 'pin' ? '#14532d' : 'white',
            color: activeTab === 'pin' ? '#fff' : '#4b5563',
            fontWeight: 700,
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <KeyRound size={16} /> PIN Digital Signature (TTE)
        </button>
      </div>

      {activeTab === 'profil' ? (
        <form className="peserta-profile-form" onSubmit={handleSubmit}>
          <div className="peserta-profile-heading">
            <span className="peserta-avatar peserta-avatar--large">
              {currentRektor.inisialAvatar || initials(form.nama)}
            </span>
            <div>
              <h3>{form.nama}</h3>
              <p>{form.role} · {form.jabatan || form.unitKerja}</p>
            </div>
          </div>

          <div className="peserta-form-grid">
            <label>
              <span>Nama lengkap & Gelar</span>
              <input
                name="nama"
                autoComplete="name"
                value={form.nama}
                onChange={update}
                required
                maxLength={100}
              />
            </label>

            <label>
              <span>Email resmi</span>
              <input
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={update}
                required
                maxLength={254}
              />
            </label>

            <label>
              <span>Jabatan</span>
              <input
                name="jabatan"
                value={form.jabatan}
                onChange={update}
                required
                maxLength={100}
              />
            </label>

            <label>
              <span>Nomor HP</span>
              <input
                name="telepon"
                type="tel"
                autoComplete="tel"
                pattern="[+0-9 ()-]{8,20}"
                title="Nomor telepon 8 hingga 20 karakter"
                value={form.telepon}
                onChange={update}
                required
                maxLength={20}
              />
            </label>

            <label>
              <span>NIP</span>
              <input
                name="nip"
                value={form.nip}
                onChange={update}
                maxLength={30}
              />
            </label>

            <label>
              <span>Instansi / Unit kerja</span>
              <input
                name="unitKerja"
                value={form.unitKerja}
                onChange={update}
                maxLength={100}
              />
            </label>
          </div>

          {error && <p className="peserta-form-error" role="alert">{error}</p>}
          {savedMessage && (
            <p style={{ marginTop: '15px', color: '#15803d', fontSize: '13px', fontWeight: 600 }} role="status">
              ✓ {savedMessage}
            </p>
          )}

          <div className="peserta-form-actions">
            <button className="peserta-button" type="submit">
              Simpan Perubahan
            </button>
          </div>
        </form>
      ) : (
        /* TAB PIN DIGITAL SIGNATURE */
        <div className="peserta-profile-form">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid #dfe6e1' }}>
            <div style={{ width: 44, height: 44, borderRadius: 8, background: '#edf7ef', color: '#14532d', display: 'grid', placeItems: 'center' }}>
              <ShieldCheck size={26} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#111827' }}>
                PIN Digital Signature Tanda Tangan Elektronik
              </h3>
              <p style={{ margin: '3px 0 0', fontSize: 12.5, color: '#6b7280' }}>
                PIN 6-digit digunakan untuk otentikasi saat membubuhkan tanda tangan resmi Rektor UNAND.
              </p>
            </div>
          </div>

          <form onSubmit={handleUbahPin} style={{ maxWidth: 540 }}>
            {pinError && (
              <div style={{ background: '#fee2e2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#b91c1c', display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertCircle size={16} /> {pinError}
              </div>
            )}
            {pinSuccessMsg && (
              <div style={{ background: '#dcfce7', border: '1px solid #86efac', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#15803d', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600 }}>
                <Check size={16} /> {pinSuccessMsg}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                  PIN Lama (6 Digit) <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showOldPin ? 'text' : 'password'}
                    maxLength={6}
                    placeholder="Masukkan PIN saat ini (default: 123456)"
                    value={oldPin}
                    onChange={(e) => setOldPin(e.target.value.replace(/\D/g, ''))}
                    style={{ width: '100%', height: 42, padding: '0 40px 0 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13.5 }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPin(!showOldPin)}
                    style={{ position: 'absolute', right: 12, top: 12, background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}
                  >
                    {showOldPin ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                  PIN Baru (6 Digit Angka) <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showNewPin ? 'text' : 'password'}
                    maxLength={6}
                    placeholder="Masukkan 6 digit angka baru"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                    style={{ width: '100%', height: 42, padding: '0 40px 0 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13.5 }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPin(!showNewPin)}
                    style={{ position: 'absolute', right: 12, top: 12, background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}
                  >
                    {showNewPin ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                  Konfirmasi PIN Baru <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConfirmPin ? 'text' : 'password'}
                    maxLength={6}
                    placeholder="Ulangi 6 digit angka baru"
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                    style={{ width: '100%', height: 42, padding: '0 40px 0 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13.5 }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPin(!showConfirmPin)}
                    style={{ position: 'absolute', right: 12, top: 12, background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}
                  >
                    {showConfirmPin ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 24, alignItems: 'center' }}>
              <button
                type="submit"
                className="peserta-button"
                style={{ padding: '10px 24px' }}
              >
                <Lock size={15} /> Simpan PIN Baru
              </button>
              <button
                type="button"
                className="peserta-button peserta-button--secondary"
                onClick={handleResetDefaultPin}
              >
                Reset ke Default (123456)
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
