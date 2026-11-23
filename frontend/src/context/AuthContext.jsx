import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../api';
import { clearSession, getToken, readStoredUser, setSession } from '../api/client';

const AuthContext = createContext(null);

/** Halaman awal tiap role setelah login */
export const ROLE_HOME = {
  peserta: '/peserta/cari-workshop',
  humas: '/humas/ringkasan',
  sekretariat: '/sekretariat/kegiatan',
  mitra: '/mitra/kegiatan-kerja-sama',
  rektor: '/rektor/pengajuan',
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => (getToken() ? readStoredUser() : null));
  const [checking, setChecking] = useState(() => Boolean(getToken()));

  // Validasi ulang sesi tersimpan ke server saat aplikasi dibuka
  useEffect(() => {
    if (!getToken()) return;
    authApi.me()
      .then(me => { setUser(me); setSession(null, me); })
      .catch(() => { clearSession(); setUser(null); })
      .finally(() => setChecking(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const { token, user: me } = await authApi.login(email, password);
    setSession(token, me);
    setUser(me);
    return me;
  }, []);

  const register = useCallback(async data => {
    const { token, user: me } = await authApi.register(data);
    setSession(token, me);
    setUser(me);
    return me;
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  const updateProfile = useCallback(async data => {
    const me = await authApi.updateMe(data);
    setSession(null, me);
    setUser(me);
    return me;
  }, []);

  const refresh = useCallback(async () => {
    const me = await authApi.me();
    setSession(null, me);
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
