import { useState } from 'react';
import { User, Check } from 'lucide-react';
import { currentMitra } from './data';
import './mitra.css';

export default function ProfilMitra() {
  const initialData = {
    nama: currentMitra.nama || 'Ahmad Rizal',
    email: currentMitra.email || 'mitra@unand.ac.id',
    telepon: currentMitra.telepon || '0812 6789 4321',
    instansi: currentMitra.instansi || 'PT Semen Padang',
    jenisMitra: currentMitra.jenisMitra || 'Eksternal',
    subtitle: currentMitra.subtitle || 'Mitra · Penanggung jawab instansi',
  };

  const [form, setForm] = useState(initialData);
  const [saved, setSaved] = useState(false);

  const set = (k, v) => {
    setForm(prev => ({ ...prev, [k]: v }));
    setSaved(false);
  };

  const handleReset = () => {
    setForm(initialData);
    setSaved(false);
  };

  const handleSimpan = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 4000);
  };

  return (
    <div className="mitra-stack">
      {/* Intro Header */}
      <div className="mitra-intro">
        <h2>Profil Mitra</h2>
        <p>Kelola informasi kontak penanggung jawab dan identitas instansi mitra.</p>
      </div>

      {saved && (
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
          }}
        >
          <Check size={18} /> Perubahan profil berhasil disimpan.
        </div>
      )}

      {/* Profil Card Sesuai Gambar Desain */}
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
                onChange={e => set('nama', e.target.value)}
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
                onChange={e => set('telepon', e.target.value)}
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
    </div>
  );
}
