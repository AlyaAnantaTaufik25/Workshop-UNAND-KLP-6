import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, User } from 'lucide-react';
import { currentHumas } from './data';

export default function ProfilHumas() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nama: currentHumas?.name || 'Nadia Amelia',
    email: currentHumas?.email || 'humas@unand.ac.id',
    telepon: '0812 6789 4321',
  });
  const [saved, setSaved] = useState(false);

  const set = (k, v) => {
    setForm(prev => ({ ...prev, [k]: v }));
    setSaved(false);
  };

  const handleSimpan = () => {
    setSaved(true);
  };

  const handleBatal = () => {
    setForm({
      nama: currentHumas?.name || 'Nadia Amelia',
      email: currentHumas?.email || 'humas@unand.ac.id',
      telepon: '0812 6789 4321',
    });
    setSaved(false);
  };

  return (
    <div className="humas-list-page">
      {/* Top Notif Bar */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button
          className="humas-notif-btn"
          onClick={() => navigate('/humas/perbaikan-sertifikat')}
        >
          <Bell size={15} /> Notifikasi perbaikan (1)
        </button>
      </div>

      {/* Heading di luar card */}
      <div style={{ marginBottom: 20 }}>
        <h2 className="humas-section-title">Profil pribadi</h2>
        <p className="humas-section-sub">
          Kelola informasi akun Humas. Identitas resmi bersifat read-only.
        </p>
      </div>

      {/* Card Profil */}
      <div
        className="profil-card"
        style={{
          maxWidth: '100%',
          background: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: 8,
          padding: '24px 28px',
        }}
      >
        {/* Avatar Row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            paddingBottom: 20,
            borderBottom: '1px solid #f1f5f9',
            marginBottom: 20,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: '#edf7ef',
              color: '#166534',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <User size={24} />
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>
              {form.nama}
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: 2 }}>
              Humas
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Row 1: Nama Lengkap & Email Resmi */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 24,
            }}
          >
            <div className="form-group">
              <label className="form-label">
                Nama lengkap <span className="req">*</span>
              </label>
              <input
                className="form-input"
                value={form.nama}
                onChange={e => set('nama', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email resmi</label>
              <input
                className="form-input"
                value={form.email}
                readOnly
                style={{ background: '#f9fafb', color: '#6b7280' }}
              />
            </div>
          </div>

          {/* Row 2: Nomor Telepon */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 24,
            }}
          >
            <div className="form-group">
              <label className="form-label">
                Nomor telepon <span className="req">*</span>
              </label>
              <input
                className="form-input"
                value={form.telepon}
                onChange={e => set('telepon', e.target.value)}
              />
            </div>
            <div />
          </div>

          {saved && (
            <p style={{ color: '#166534', fontSize: '13px', fontWeight: 600, margin: 0 }}>
              ✓ Perubahan berhasil disimpan.
            </p>
          )}

          {/* Footer Buttons */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 10,
              marginTop: 16,
            }}
          >
            <button
              type="button"
              className="modal-btn modal-btn-batal"
              style={{
                padding: '8px 20px',
                borderRadius: 6,
                border: '1px solid #d1d5db',
                background: '#ffffff',
                color: '#374151',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
              onClick={handleBatal}
            >
              Batal
            </button>
            <button
              type="button"
              className="modal-btn modal-btn-publish"
              style={{
                background: '#14532d',
                color: '#ffffff',
                border: 'none',
                padding: '8px 20px',
                borderRadius: 6,
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
              onClick={handleSimpan}
            >
              Simpan Perubahan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
