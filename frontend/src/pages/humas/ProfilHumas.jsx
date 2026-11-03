import { useState } from 'react';
import { Bell, User } from 'lucide-react';
import { currentHumas } from '../../data/mockData';

export default function ProfilHumas() {
  const [form, setForm] = useState({
    nama: currentHumas?.name || 'Nadia Amelia',
    email: currentHumas?.email || 'humas@unand.ac.id',
    telepon: '0812 6789 4321',
  });
  const [saved, setSaved] = useState(false);

  const set = (k, v) => { setForm(prev => ({ ...prev, [k]: v })); setSaved(false); };

  const handleSimpan = () => { setSaved(true); };
  const handleBatal  = () => {
    setForm({ nama: currentHumas?.name || 'Nadia Amelia', email: currentHumas?.email || 'humas@unand.ac.id', telepon: '0812 6789 4321' });
    setSaved(false);
  };

  return (
    <div className="humas-list-page">

      {/* Prototype Banner */}
      <div className="humas-prototype-banner">
        <span className="humas-prototype-tag">Mode Prototipe</span>
        <span className="humas-prototype-text">
          Data contoh, perubahan hanya selama sesi. OFS, OTF, tanda tangan electronic dan PDF resmi belum terintegrasi.
        </span>
        <span className="humas-prototype-date">Referensi demo: 10 Mei 2026</span>
      </div>

      {/* Notif */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="humas-notif-btn"><Bell size={15} /> Notifikasi perbaikan (1)</button>
      </div>

      {/* Profile card */}
      <div className="profil-card">

        {/* Avatar row */}
        <div className="profil-avatar-row">
          <div className="profil-avatar">
            <User size={28} />
          </div>
          <div>
            <div className="profil-name">{form.nama}</div>
            <div className="profil-role">Humas</div>
          </div>
        </div>

        {/* Section heading */}
        <div style={{ padding: '0 24px' }}>
          <h2 className="humas-section-title">Profil pribadi</h2>
          <p className="humas-section-sub">
            Kelola informasi akun Humas.{' '}
            <a href="#" className="humas-link">Identitas resmi</a> berstatus read-only.
          </p>
        </div>

        {/* Form */}
        <div className="profil-form">
          <div className="profil-form-row">
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Nama lengkap <span className="req">*</span></label>
              <input
                className="form-input"
                value={form.nama}
                onChange={e => set('nama', e.target.value)}
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Email resmi</label>
              <input
                className="form-input"
                value={form.email}
                readOnly
                style={{ background: 'var(--gray-50)', color: 'var(--gray-500)' }}
              />
            </div>
          </div>
          <div className="form-group" style={{ maxWidth: '49%' }}>
            <label className="form-label">Nomor telepon <span className="req">*</span></label>
            <input
              className="form-input"
              value={form.telepon}
              onChange={e => set('telepon', e.target.value)}
            />
          </div>

          {saved && (
            <p style={{ color: 'var(--green-700)', fontSize: '13px', fontWeight: 500 }}>
              ✓ Perubahan berhasil disimpan.
            </p>
          )}

          <div className="profil-footer">
            <button className="modal-btn modal-btn-batal" onClick={handleBatal}>Batal</button>
            <button className="modal-btn modal-btn-publish" onClick={handleSimpan}>Simpan Perubahan</button>
          </div>
        </div>
      </div>
    </div>
  );
}
