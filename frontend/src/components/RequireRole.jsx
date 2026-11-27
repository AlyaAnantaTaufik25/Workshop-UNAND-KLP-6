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
  if (!user) return <Navigate to="/" replace state={{ from: location.pathname + location.search }} />;
  if (user.role !== role) return <Navigate to={ROLE_HOME[user.role] || '/'} replace />;
  return children;
}

/**
 * Kerangka (skeleton) halaman saat data dimuat: kepala, kartu ringkas, dan baris tabel.
 * full = layar penuh (sebelum layout tersedia, mis. memeriksa sesi).
 */
export function PageLoader({ label = 'Memuat data…', full = false, rows = 6 }) {
  return (
    <div className={`ui-skeleton${full ? ' ui-skeleton--full' : ''}`} role="status" aria-live="polite" aria-busy="true">
      <span className="ui-sr-only">{label}</span>
      <div className="ui-skel-head">
        <span className="ui-skel ui-skel-title" />
        <span className="ui-skel ui-skel-sub" />
      </div>
      <div className="ui-skel-cards">
        {[0, 1, 2].map(i => <span key={i} className="ui-skel ui-skel-card" />)}
      </div>
      <div className="ui-skel-table">
        <span className="ui-skel ui-skel-bar" />
        {Array.from({ length: rows }, (_, i) => (
          <div className="ui-skel-row" key={i}>
            <span className="ui-skel" style={{ width: `${38 + ((i * 17) % 30)}%` }} />
            <span className="ui-skel" style={{ width: '16%' }} />
            <span className="ui-skel" style={{ width: '12%' }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ErrorNotice({ error, onRetry }) {
  if (!error) return null;
  return (
    <div role="alert" className="ui-error">
      <span>{error.message || 'Gagal memuat data.'}</span>
      {onRetry && <button type="button" className="ui-error-retry" onClick={onRetry}>Coba lagi</button>}
    </div>
  );
}
