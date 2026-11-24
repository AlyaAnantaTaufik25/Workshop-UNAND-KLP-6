import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { certificatesApi, registrationsApi, workshopsApi } from '../api';
import { useCurrentUser } from './AuthContext';
import { PageLoader, ErrorNotice } from '../components/RequireRole';

/**
 * Data portal Sekretariat, Rektor, dan Mitra dari backend, disajikan dengan
 * nama & bentuk yang sama seperti data mock lama (workshops, sertifikatData,
 * dokumenPengganti, presensiData, mitraKegiatan, dst.) agar halaman cukup
 * mengganti sumber datanya.
 */
const PortalDataContext = createContext(null);

const LOADERS = {
  sekretariat: ['workshops', 'submissions', 'replacements', 'registrations', 'templatesUnand'],
  rektor: ['workshops', 'submissions', 'replacements', 'library'],
  mitra: ['workshops', 'submissions', 'replacements', 'registrations', 'templates', 'corrections'],
};

const FETCH = {
  workshops: () => workshopsApi.list(),
  submissions: () => certificatesApi.submissions(),
  replacements: () => certificatesApi.replacements(),
  registrations: () => registrationsApi.list(),
  library: () => certificatesApi.templates({ library: 1 }),
  templates: () => certificatesApi.templates(),
  templatesUnand: () => certificatesApi.templates(),
  corrections: () => certificatesApi.corrections(),
};

export function PortalDataProvider({ role, children }) {
  const [raw, setRaw] = useState(null);
  const [error, setError] = useState(null);
  const currentUser = useCurrentUser();

  const reload = useCallback(async () => {
    try {
      const keys = LOADERS[role] || [];
      const values = await Promise.all(keys.map(k => FETCH[k]()));
      setRaw(Object.fromEntries(keys.map((k, i) => [k, values[i]])));
      setError(null);
    } catch (err) {
      setError(err);
    }
  }, [role]);

  useEffect(() => { reload(); }, [reload]);

  const value = useMemo(() => {
    if (!raw) return null;
    const workshops = (raw.workshops || []).map(w => ({ ...w, lokasi: w.lokasiStrip }));
    const registrations = raw.registrations || [];
    const byWorkshop = {};
    registrations.forEach(r => { (byWorkshop[r.kegiatanId] = byWorkshop[r.kegiatanId] || []).push(r); });

    // Presensi lintas kegiatan (peserta terkonfirmasi saja)
    const presensiData = registrations
      .filter(r => ['terdaftar', 'selesai'].includes(r.registrationStatus))
      .map(r => ({ id: r.id, namaPeserta: r.nama, kegiatan: r.kegiatan, kegiatanId: r.kegiatanId, waktuPresensi: r.waktuPresensi, statusKehadiran: r.statusHadir, jenis: r.jenis }));

    // Detail per kegiatan untuk portal mitra
    const mitraDetailData = Object.fromEntries(workshops.map(w => [w.id, {
      tema: w.tema,
      waktu: w.waktu,
      periodePendaftaran: w.periodePendaftaran,
      statusSertifikat: w.statusSertifikatLabel,
      tentang: w.tentang,
      manfaat: w.manfaat,
      targetPeserta: w.targetPeserta,
      narasumber: w.narasumberNama,
      imageUrl: w.imageUrl,
      peserta: (byWorkshop[w.id] || []).filter(r => r.registrationStatus !== 'dibatalkan'),
      rekap: { totalPendaftar: w.pendaftar, pesertaHadir: w.hadir },
    }]));

    return {
      reload,
      currentUser,
      currentRektor: currentUser,
      currentMitra: currentUser,
      workshops,
      sertifikatData: raw.submissions || [],
      dokumenPengganti: raw.replacements || [],
      presensiData,
      humasTemplates: raw.library || raw.templatesUnand || [],
      mitraKegiatan: workshops.filter(w => w.status !== 'draft'),
      mitraDetailData,
      mitraPeserta: registrations.filter(r => r.registrationStatus !== 'dibatalkan').map(r => ({ ...r, id: r.registrationId })),
      mitraTemplates: raw.templates || [],
      mitraPerbaikan: (raw.corrections || []).map(c => ({ ...c, id: c.dbId })),
      mitraTandaTangan: raw.submissions || [],
    };
  }, [raw, reload, currentUser]);

  if (!value) return error ? <div style={{ padding: 24 }}><ErrorNotice error={error} onRetry={reload} /></div> : <PageLoader />;
  return <PortalDataContext.Provider value={value}>{children}</PortalDataContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function usePortalData() {
  const ctx = useContext(PortalDataContext);
  if (!ctx) throw new Error('usePortalData harus dipakai di dalam PortalDataProvider');
  return ctx;
}
