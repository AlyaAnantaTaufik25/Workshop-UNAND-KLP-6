import { User, Lock, ShieldCheck } from 'lucide-react';
import { currentUser } from '../../data/mockData';

export default function Profil() {
  return (
    <div style={{ width: '100%' }}>
      {/* Page section heading */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '4px' }}>
          Profil pribadi
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--gray-500)' }}>
          Informasi akun Sekretariat Rektor. Identitas resmi bersifat read-only dan tidak dapat diubah.
        </p>
      </div>

      {/* Main Profile Card (Full Width) */}
      <div style={{
        background: 'white',
        border: '1px solid var(--gray-200)',
        borderRadius: '12px',
        width: '100%',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}>

        {/* Avatar + info row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '24px 32px',
        }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '50%',
            background: 'var(--green-50)',
            border: '1.5px solid var(--green-200)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <User size={26} strokeWidth={1.75} color="var(--green-700)" />
          </div>
          <div>
            <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--gray-900)', lineHeight: 1.3 }}>
              {currentUser.nama}
            </p>
            <p style={{ fontSize: '13px', color: 'var(--gray-500)', marginTop: '3px' }}>
              {currentUser.role}
            </p>
          </div>
          <div style={{
            marginLeft: 'auto',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'var(--green-50)',
            color: 'var(--green-800)',
            border: '1px solid var(--green-200)',
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 600
          }}>
            <ShieldCheck size={14} color="var(--green-700)" />
            <span>Akun Resmi Terverifikasi</span>
          </div>
        </div>

        {/* Divider line */}
        <div style={{ height: '1px', background: 'var(--gray-200)', width: '100%' }} />

        {/* Form body (Read-Only) */}
        <div style={{ padding: '28px 32px 32px' }}>

          {/* Row 1: Nama lengkap & Email resmi */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
            marginBottom: '24px'
          }}>
            {/* Nama lengkap (read-only) */}
            <div>
              <label style={labelStyle}>Nama lengkap</label>
              <input
                style={readOnlyInputStyle}
                type="text"
                value={currentUser.nama}
                readOnly
                tabIndex={-1}
              />
            </div>

            {/* Email resmi (read-only) */}
            <div>
              <label style={labelStyle}>Email resmi</label>
              <input
                style={readOnlyInputStyle}
                type="email"
                value={currentUser.email}
                readOnly
                tabIndex={-1}
              />
            </div>
          </div>

          {/* Row 2: Nomor telepon & Peran */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
            marginBottom: '28px'
          }}>
            <div>
              <label style={labelStyle}>Nomor telepon</label>
              <input
                style={readOnlyInputStyle}
                type="tel"
                value="0812 5789 4321"
                readOnly
                tabIndex={-1}
              />
            </div>
            <div>
              <label style={labelStyle}>Peran / Unit Kerja</label>
              <input
                style={readOnlyInputStyle}
                type="text"
                value={`${currentUser.role} - Universitas Andalas`}
                readOnly
                tabIndex={-1}
              />
            </div>
          </div>

          {/* Notice: Read-only info */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: 'var(--gray-50)',
            border: '1px solid var(--gray-200)',
            borderRadius: '8px',
            padding: '14px 18px',
            color: 'var(--gray-600)',
            fontSize: '13px',
            lineHeight: 1.5
          }}>
            <Lock size={17} color="var(--gray-500)" style={{ flexShrink: 0 }} />
            <div>
              Data profil resmi bersifat <strong>read-only</strong> dan tidak dapat diubah oleh aktor. Pembaruan data akun hanya dapat dilakukan melalui Administrator Sistem UNAND.
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

const labelStyle = {
  display: 'block',
  fontSize: '13px',
  fontWeight: 600,
  color: 'var(--gray-700)',
  marginBottom: '8px',
};

const readOnlyInputStyle = {
  width: '100%',
  padding: '11px 16px',
  border: '1px solid var(--gray-200)',
  borderRadius: '8px',
  fontSize: '14px',
  color: 'var(--gray-700)',
  background: 'var(--gray-50)',
  cursor: 'not-allowed',
  outline: 'none',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
};
