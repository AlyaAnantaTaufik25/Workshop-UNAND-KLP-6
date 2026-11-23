import { useState } from 'react';
import { User, Check, Lock, KeyRound, ShieldCheck, Eye, EyeOff, AlertCircle } from 'lucide-react';
import './mitra.css';
import { usePortalData } from '../../context/PortalData';
import { authApi } from '../../api';
import { useAuth } from '../../context/AuthContext';

export default function ProfilMitra() {
  const { currentMitra } = usePortalData();
  const [activeTab, setActiveTab] = useState('profil'); // 'profil' | 'pin'

  // State Profil
  const initialData = {
    nama: currentMitra.nama || 'Ahmad Rizal',
    email: currentMitra.email || 'mitra@unand.ac.id',
    telepon: currentMitra.telepon || '0812 6789 4321',
    instansi: currentMitra.instansi || 'PT Semen Padang',
    jenisMitra: currentMitra.jenisMitra || 'Eksternal',
    subtitle: currentMitra.subtitle || 'Mitra · Penanggung jawab instansi',
  };

  const [form, setForm] = useState(initialData);
  const { updateProfile } = useAuth();
  const [profileError, setProfileError] = useState('');
  const [saved, setSaved] = useState(false);

  // State PIN Tanda Tangan
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showOldPin, setShowOldPin] = useState(false);
  const [showNewPin, setShowNewPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [pinSuccessMsg, setPinSuccessMsg] = useState('');
  const [pinError, setPinError] = useState('');

  const set = (k, v) => {
    setForm((prev) => ({ ...prev, [k]: v }));
    setSaved(false);
  };

  const handleReset = () => {
    setForm(initialData);
    setSaved(false);
  };

  const handleSimpan = async (e) => {
    e.preventDefault();
    try {
      await updateProfile({ nama: form.nama, email: form.email, telepon: form.telepon, jabatan: form.jabatan, bidangUsaha: form.bidangUsaha, alamat: form.alamat });
      setProfileError('');
    } catch (err) {
      setProfileError(err.message);
      alert(err.message);
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 4000);
  };

  // Handler Ubah PIN
  const handleUbahPin = async (e) => {
    e.preventDefault();
    setPinError('');
    setPinSuccessMsg('');

    if (!/^\d{6}$/.test(newPin)) {
      setPinError('PIN baru harus terdiri dari tepat 6 digit angka.');
      return;
    }

    if (newPin !== confirmPin) {
      setPinError('Konfirmasi PIN baru tidak cocok.');
      return;
    }

    // PIN diverifikasi & disimpan (ter-hash) di server
    try {
      await authApi.changePin(oldPin, newPin);
    } catch (err) {
      setPinError(err.message);
      return;
    }
    setOldPin('');
    setNewPin('');
    setConfirmPin('');
    setPinSuccessMsg('PIN Tanda Tangan berhasil diperbarui!');
    setTimeout(() => setPinSuccessMsg(''), 4500);
  };

  // Handler Lupa / Reset PIN
  const handleResetDefaultPin = () => {
    if (window.confirm('Apakah Anda yakin ingin mereset PIN tanda tangan ke PIN awal (123456)?')) {
      authApi.resetPin().catch(err => setPinError(err.message));
      setOldPin('');
      setNewPin('');
      setConfirmPin('');
      setPinError('');
      setPinSuccessMsg('PIN berhasil direset ke default: 123456. Silakan gunakan 123456 sebagai PIN Lama.');
      setTimeout(() => setPinSuccessMsg(''), 5000);
    }
  };

  return (
    <div className="mitra-stack">
      {/* Intro Header */}
      <div className="mitra-intro">
        <h2>Profil Mitra</h2>
        <p>Kelola informasi kontak penanggung jawab dan keamanan tanda tangan digital instansi mitra.</p>
      </div>

      {/* Tabs Navigasi */}
      <div className="mitra-tabs" style={{ margin: '12px 0 20px' }}>
        <button
          type="button"
          className={`mitra-tab-btn ${activeTab === 'profil' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('profil')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <User size={15} /> Informasi Profil
        </button>
        <button
          type="button"
          className={`mitra-tab-btn ${activeTab === 'pin' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('pin')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <KeyRound size={15} /> PIN Tanda Tangan
        </button>
      </div>

      {/* Alert Sukses Profil */}
      {saved && activeTab === 'profil' && (
        <div
          style={{
            background: 'var(--mitra-tint)',
            border: '1px solid #b9cec0',
            color: 'var(--mitra-green)',
            padding: '12px 18px',
            borderRadius: 8,
            fontSize: 13.5,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 16,
          }}
        >
          <Check size={18} /> Perubahan profil berhasil disimpan.
        </div>
      )}

      {/* Alert Sukses PIN */}
      {pinSuccessMsg && activeTab === 'pin' && (
        <div
          style={{
            background: 'var(--mitra-tint)',
            border: '1px solid #b9cec0',
            color: 'var(--mitra-green)',
            padding: '12px 18px',
            borderRadius: 8,
            fontSize: 13.5,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 16,
          }}
        >
          <Check size={18} /> {pinSuccessMsg}
        </div>
      )}

      {/* ── TAB 1: INFORMASI PROFIL ── */}
      {activeTab === 'profil' && (
        <div className="mitra-profil-container">
          {/* Header Avatar & Nama */}
          <div className="mitra-profil-header">
            <div className="mitra-profil-avatar">
              <User size={24} strokeWidth={2} />
            </div>
            <div>
              <h3 className="mitra-profil-name">{form.nama}</h3>
              <p className="mitra-profil-sub">{form.subtitle}</p>
            </div>
          </div>

          <div className="mitra-profil-divider" />

          {/* Form Fields 2 Kolom */}
          <form onSubmit={handleSimpan}>
            <div className="mitra-profil-grid">
              {/* Baris 1: Nama Lengkap & Email Resmi */}
              <div className="mitra-profil-field">
                <label>
                  Nama lengkap <span className="req">*</span>
                </label>
                <input
                  type="text"
                  value={form.nama}
                  onChange={(e) => set('nama', e.target.value)}
                  required
                  className="mitra-profil-input"
                />
              </div>

              <div className="mitra-profil-field">
                <label>Email resmi</label>
                <input
                  type="email"
                  value={form.email}
                  readOnly
                  className="mitra-profil-input mitra-profil-input--readonly"
                />
              </div>

              {/* Baris 2: Nomor Telepon & Nama Instansi */}
              <div className="mitra-profil-field">
                <label>
                  Nomor telepon <span className="req">*</span>
                </label>
                <input
                  type="tel"
                  value={form.telepon}
                  onChange={(e) => set('telepon', e.target.value)}
                  required
                  className="mitra-profil-input"
                />
              </div>

              <div className="mitra-profil-field">
                <label>Nama instansi</label>
                <input
                  type="text"
                  value={form.instansi}
                  readOnly
                  className="mitra-profil-input mitra-profil-input--readonly"
                />
              </div>

              {/* Baris 3: Jenis Mitra */}
              <div className="mitra-profil-field">
                <label>Jenis Mitra</label>
                <input
                  type="text"
                  value={form.jenisMitra}
                  readOnly
                  className="mitra-profil-input mitra-profil-input--readonly"
                />
              </div>

              <div className="mitra-profil-field" />
            </div>

            <div className="mitra-profil-divider" style={{ marginTop: 32 }} />

            {/* Action Buttons */}
            <div className="mitra-profil-actions">
              <button
                type="button"
                onClick={handleReset}
                className="mitra-profil-btn-batal"
              >
                Batal
              </button>
              <button
                type="submit"
                className="mitra-profil-btn-simpan"
              >
                Simpan Perubahan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── TAB 2: UBAH PIN TANDA TANGAN ── */}
      {activeTab === 'pin' && (
        <div className="mitra-profil-container">
          <div className="mitra-profil-header">
            <div className="mitra-profil-avatar" style={{ background: '#EBF5EE', color: '#14532d' }}>
              <ShieldCheck size={24} strokeWidth={2} />
            </div>
            <div>
              <h3 className="mitra-profil-name">PIN Digital Signature</h3>
              <p className="mitra-profil-sub">Kelola 6-digit PIN keamanan untuk otorisasi pembubuhan tanda tangan pada sertifikat.</p>
            </div>
          </div>

          <div className="mitra-profil-divider" />

          {/* Kotak Edukasi / Penjelasan Singkat */}
          <div style={{
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: 8,
            padding: '14px 18px',
            marginBottom: 24,
            display: 'flex',
            gap: 12,
            alignItems: 'flex-start',
          }}>
            <Lock size={18} color="#14532d" style={{ marginTop: 2, flexShrink: 0 }} />
            <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.5 }}>
              <strong style={{ color: '#0F172A' }}>Otorisasi Tanda Tangan Resmi</strong>
              <p style={{ margin: '4px 0 0', color: '#64748B' }}>
                PIN 6-digit wajib dimasukkan setiap kali Anda membubuhkan tanda tangan resmi. Anda dapat mengubahnya secara berkala demi menjaga keamanan dokumen.
              </p>
            </div>
          </div>

          {/* Alert Error */}
          {pinError && (
            <div style={{
              background: '#FEF2F2',
              border: '1px solid #FCA5A5',
              color: '#DC2626',
              padding: '10px 14px',
              borderRadius: 8,
              fontSize: 13,
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              <AlertCircle size={16} /> {pinError}
            </div>
          )}

          <form onSubmit={handleUbahPin} style={{ maxWidth: 460 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* PIN Lama */}
              <div className="mitra-profil-field">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label style={{ margin: 0 }}>
                    PIN Saat Ini <span className="req">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleResetDefaultPin}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--mitra-green)',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: 0,
                      textDecoration: 'underline',
                    }}
                  >
                    Lupa PIN? Reset
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showOldPin ? 'text' : 'password'}
                    maxLength={6}
                    value={oldPin}
                    onChange={(e) => setOldPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="Masukkan 6-digit PIN lama"
                    required
                    className="mitra-profil-input"
                    style={{ paddingRight: 40, letterSpacing: showOldPin ? 'normal' : '3px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPin(!showOldPin)}
                    style={{
                      position: 'absolute',
                      right: 10,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#9CA3AF',
                      cursor: 'pointer',
                      padding: 4,
                    }}
                  >
                    {showOldPin ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <span style={{ fontSize: 11.5, color: '#94A3B8', marginTop: 4, display: 'block' }}>
                  Default sistem: <code>123456</code>
                </span>
              </div>

              {/* PIN Baru */}
              <div className="mitra-profil-field">
                <label style={{ marginBottom: 6, display: 'block' }}>
                  PIN Baru (6 Digit Angka) <span className="req">*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showNewPin ? 'text' : 'password'}
                    maxLength={6}
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="Masukkan 6-digit angka baru"
                    required
                    className="mitra-profil-input"
                    style={{ paddingRight: 40, letterSpacing: showNewPin ? 'normal' : '3px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPin(!showNewPin)}
                    style={{
                      position: 'absolute',
                      right: 10,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#9CA3AF',
                      cursor: 'pointer',
                      padding: 4,
                    }}
                  >
                    {showNewPin ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Konfirmasi PIN Baru */}
              <div className="mitra-profil-field">
                <label style={{ marginBottom: 6, display: 'block' }}>
                  Konfirmasi PIN Baru <span className="req">*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConfirmPin ? 'text' : 'password'}
                    maxLength={6}
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="Ulangi 6-digit PIN baru"
                    required
                    className="mitra-profil-input"
                    style={{ paddingRight: 40, letterSpacing: showConfirmPin ? 'normal' : '3px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPin(!showConfirmPin)}
                    style={{
                      position: 'absolute',
                      right: 10,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#9CA3AF',
                      cursor: 'pointer',
                      padding: 4,
                    }}
                  >
                    {showConfirmPin ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="mitra-profil-divider" style={{ marginTop: 28 }} />

            <div className="mitra-profil-actions">
              <button
                type="button"
                onClick={() => {
                  setOldPin('');
                  setNewPin('');
                  setConfirmPin('');
                  setPinError('');
                }}
                className="mitra-profil-btn-batal"
              >
                Reset Form
              </button>
              <button
                type="submit"
                className="mitra-profil-btn-simpan"
              >
                Simpan PIN Baru
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
