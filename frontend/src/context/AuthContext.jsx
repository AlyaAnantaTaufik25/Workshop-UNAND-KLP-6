import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../api';
import { clearSession, readStoredUser, storeUser } from '../api/client';

const AuthContext = createContext(null);

/** Halaman awal tiap role setelah login */
// oxlint-disable-next-line react/only-export-components -- sengaja diekspor bersama komponen (API bersama modul ini)
export const ROLE_HOME = {
  peserta: '/peserta/beranda',
  humas: '/humas/ringkasan',
  sekretariat: '/sekretariat/dashboard',
  mitra: '/mitra/kegiatan-kerja-sama',
  rektor: '/rektor/pengajuan',
};

export function AuthProvider({ children }) {
  // Profil tersimpan hanya sebagai cache tampilan; keabsahan sesi selalu dicek ke server (cookie httpOnly)
  const [user, setUser] = useState(() => readStoredUser());
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    authApi.session()
      .then(({ user: me }) => {
        if (me) { setUser(me); storeUser(me); } else { clearSession(); setUser(null); }
      })
      .catch(() => { clearSession(); setUser(null); })
      .finally(() => setChecking(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const { user: me } = await authApi.login(email, password);
    storeUser(me);
    setUser(me);
    return me;
  }, []);

  const register = useCallback(async data => {
    const { user: me } = await authApi.register(data);
    storeUser(me);
    setUser(me);
    return me;
  }, []);

  const logout = useCallback(async () => {
    clearSession();
    setUser(null);
    try { await authApi.logout(); } catch { /* sesi mungkin sudah berakhir */ }
  }, []);

  const updateProfile = useCallback(async data => {
    const me = await authApi.updateMe(data);
    storeUser(me);
    setUser(me);
    return me;
  }, []);

  const refresh = useCallback(async () => {
    const me = await authApi.me();
    storeUser(me);
    setUser(me);
    return me;
  }, []);

  const value = useMemo(() => ({ user, checking, login, register, logout, updateProfile, refresh }), [user, checking, login, register, logout, updateProfile, refresh]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth harus dipakai di dalam AuthProvider');
  return ctx;
}

/**
 * Profil user login dengan bentuk yang sama seperti data mock lama
 * (currentHumas, currentRektor, currentMitra, currentUser) agar halaman tidak perlu banyak berubah.
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useCurrentUser() {
  const { user } = useAuth();
  return useMemo(() => {
    if (!user) return { nama: '', inisial: '', role: '', email: '' };
    return {
      ...user,
      role: user.roleLabel,
      inisialAvatar: user.inisial,
      jabatan: user.jabatan || user.roleLabel,
    };
  }, [user]);
}
