import { useState } from 'react';
import { currentRektor } from './data';

function initials(name) {
  if (!name) return 'AR';
  return name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase();
}

export default function ProfilRektor() {
  const [form, setForm] = useState({ ...currentRektor });
  const [savedMessage, setSavedMessage] = useState('');
  const [error, setError] = useState('');

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

  return (
    <div className="peserta-stack">
      <section className="peserta-intro">
        <h2>Informasi pribadi</h2>
        <p>Pastikan data Anda benar untuk kebutuhan penandatanganan dan pengesahan sertifikat resmi.</p>
      </section>

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
    </div>
  );
}
