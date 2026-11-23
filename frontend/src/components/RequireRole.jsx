import { Navigate, useLocation } from 'react-router-dom';
import { ROLE_HOME, useAuth } from '../context/AuthContext';

/**
 * Melindungi portal per role. Belum login -> ke halaman masuk;
 * login dengan role lain -> ke portal miliknya sendiri.
 */
export default function RequireRole({ role, children }) {
  const { user, checking } = useAuth();
  const location = useLocation();

  if (checking) return <PageLoader label="Memeriksa sesi…" />;
  if (!user) return <Navigate to="/" replace state={{ from: location.pathname }} />;
  if (user.role !== role) return <Navigate to={ROLE_HOME[user.role] || '/'} replace />;
  return children;
}

export function PageLoader({ label = 'Memuat data…' }) {
  return (
    <div role="status" style={{ display: 'grid', placeItems: 'center', minHeight: '40vh', color: '#4b5563', fontSize: 14, gap: 12 }}>
      <span style={{ width: 28, height: 28, border: '3px solid #d1fae5', borderTopColor: '#15803d', borderRadius: '50%', animation: 'api-spin 0.8s linear infinite' }} />
      <span>{label}</span>
      <style>{'@keyframes api-spin { to { transform: rotate(360deg); } }'}</style>
    </div>
  );
}

export function ErrorNotice({ error, onRetry }) {
  if (!error) return null;
  return (
    <div role="alert" style={{ margin: '16px 0', padding: '12px 16px', borderRadius: 10, background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca', fontSize: 14, display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
      <span>{error.message || 'Gagal memuat data.'}</span>
      {onRetry && <button type="button" onClick={onRetry} style={{ border: '1px solid #fca5a5', background: '#fff', color: '#991b1b', borderRadius: 8, padding: '6px 12px', cursor: 'pointer' }}>Coba lagi</button>}
    </div>
  );
}
