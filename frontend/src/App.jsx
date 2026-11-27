import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import RequireRole, { PageLoader } from './components/RequireRole';
import { PortalDataProvider } from './context/PortalData';
import Login from './pages/Login';
import Register from './pages/Register';

// Halaman dimuat per role/per halaman agar bundle awal kecil
const VerifikasiSertifikat = lazy(() => import('./pages/VerifikasiSertifikat'));
const LogAudit = lazy(() => import('./pages/shared/LogAudit'));
const LayoutPeserta = lazy(() => import('./pages/peserta/LayoutPeserta'));
const BerandaPeserta = lazy(() => import('./pages/peserta/Beranda'));
const CariWorkshop = lazy(() => import('./pages/peserta/CariWorkshop'));
const DetailWorkshop = lazy(() => import('./pages/peserta/DetailWorkshop'));
const WorkshopSaya = lazy(() => import('./pages/peserta/WorkshopSaya'));
const SertifikatPeserta = lazy(() => import('./pages/peserta/SertifikatPeserta'));
const DetailSertifikatPeserta = lazy(() => import('./pages/peserta/DetailSertifikatPeserta'));
const FormPerbaikanSertifikat = lazy(() => import('./pages/peserta/FormPerbaikanSertifikat'));
const RiwayatPerbaikanSertifikat = lazy(() => import('./pages/peserta/RiwayatPerbaikanSertifikat'));
const DetailPerbaikanSertifikat = lazy(() => import('./pages/peserta/DetailPerbaikanSertifikat'));
const NotifikasiPerbaikanSertifikat = lazy(() => import('./pages/peserta/NotifikasiPerbaikanSertifikat'));
const ProfilPeserta = lazy(() => import('./pages/peserta/ProfilPeserta'));
const Layout = lazy(() => import('./components/Layout'));
const DashboardSekretariat = lazy(() => import('./pages/sekretariat/Dashboard'));
const Kegiatan = lazy(() => import('./pages/sekretariat/Kegiatan'));
const Presensi = lazy(() => import('./pages/sekretariat/Presensi'));
const Sertifikat = lazy(() => import('./pages/sekretariat/Sertifikat'));
const SertifikatPerbaikan = lazy(() => import('./pages/sekretariat/SertifikatPerbaikan'));
const DetailKegiatanKegiatan = lazy(() => import('./pages/sekretariat/DetailKegiatanKegiatan'));
const DetailKegiatan = lazy(() => import('./pages/sekretariat/DetailKegiatan'));
const DetailDokumenPengganti = lazy(() => import('./pages/sekretariat/DetailDokumenPengganti'));
const Profil = lazy(() => import('./pages/sekretariat/Profil'));
const LayoutRektor = lazy(() => import('./components/LayoutRektor'));
const PengajuanSertifikat = lazy(() => import('./pages/rektor/PengajuanSertifikat'));
const SertifikatPerbaikanRektor = lazy(() => import('./pages/rektor/SertifikatPerbaikanRektor'));
const DetailPengajuanRektor = lazy(() => import('./pages/rektor/DetailPengajuanRektor'));
const RiwayatTandaTangan = lazy(() => import('./pages/rektor/RiwayatTandaTangan'));
const DetailRiwayatRektor = lazy(() => import('./pages/rektor/DetailRiwayatRektor'));
const DetailDokumenPenggantiRektor = lazy(() => import('./pages/rektor/DetailDokumenPenggantiRektor'));
const ProfilRektor = lazy(() => import('./pages/rektor/ProfilRektor'));
const LayoutHumas = lazy(() => import('./components/LayoutHumas'));
const LayoutMitra = lazy(() => import('./pages/mitra/LayoutMitra'));
const KegiatanKerjaSama = lazy(() => import('./pages/mitra/KegiatanKerjaSama'));
const DetailKegiatanMitra = lazy(() => import('./pages/mitra/DetailKegiatanMitra'));
const PesertaMitra = lazy(() => import('./pages/mitra/PesertaMitra'));
const TemplateSertifikatMitra = lazy(() => import('./pages/mitra/TemplateSertifikatMitra'));
const PerbaikanSertifikatMitra = lazy(() => import('./pages/mitra/PerbaikanSertifikatMitra'));
const DetailDokumenPenggantiMitra = lazy(() => import('./pages/mitra/DetailDokumenPenggantiMitra'));
const TandaTanganMitra = lazy(() => import('./pages/mitra/TandaTanganMitra'));
const LaporanMitra = lazy(() => import('./pages/mitra/LaporanMitra'));
const ProfilMitra = lazy(() => import('./pages/mitra/ProfilMitra'));
const RingkasanHumas = lazy(() => import('./pages/humas/RingkasanHumas'));
const DetailKegiatanHumas = lazy(() => import('./pages/humas/DetailKegiatanHumas'));
const KelolaKegiatan = lazy(() => import('./pages/humas/KelolaKegiatan'));
const KelolaMitra = lazy(() => import('./pages/humas/KelolaMitra'));
const KelolaGedung = lazy(() => import('./pages/humas/KelolaGedung'));
const KelolaPengguna = lazy(() => import('./pages/humas/KelolaPengguna'));
const TemplateSertifikat = lazy(() => import('./pages/humas/TemplateSertifikat'));
const PerbaikanSertifikat = lazy(() => import('./pages/humas/PerbaikanSertifikat'));
const Laporan = lazy(() => import('./pages/humas/Laporan'));
const ProfilHumas = lazy(() => import('./pages/humas/ProfilHumas'));

// Sekretariat Rektor

// Rektor

// Humas

// Mitra

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader full />}>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* Publik: verifikasi keaslian sertifikat (tujuan QR di PDF) */}
        <Route path="/verifikasi" element={<VerifikasiSertifikat />} />
        <Route path="/verifikasi/*" element={<VerifikasiSertifikat />} />
        <Route path="/peserta" element={<RequireRole role="peserta"><LayoutPeserta /></RequireRole>}>
          <Route index element={<Navigate to="beranda" replace />} />
          <Route path="beranda" element={<BerandaPeserta />} />
          <Route path="cari-workshop" element={<CariWorkshop />} />
          <Route path="workshop/:id" element={<DetailWorkshop />} />
          <Route path="workshop-saya" element={<WorkshopSaya />} />
          <Route path="sertifikat" element={<SertifikatPeserta />} />
          <Route path="sertifikat/notifikasi" element={<NotifikasiPerbaikanSertifikat />} />
          <Route path="sertifikat/perbaikan" element={<RiwayatPerbaikanSertifikat />} />
          <Route path="sertifikat/perbaikan/:requestId" element={<DetailPerbaikanSertifikat />} />
          <Route path="sertifikat/:id/perbaikan" element={<FormPerbaikanSertifikat />} />
          <Route path="sertifikat/:id" element={<DetailSertifikatPeserta />} />
          <Route path="profil" element={<ProfilPeserta />} />
          <Route path="pratinjau-kondisi" element={<Navigate to="/peserta/workshop-saya" replace />} />
        </Route>

        {/* ── ROLE: SEKRETARIAT REKTOR ── */}
        <Route path="/sekretariat" element={<RequireRole role="sekretariat"><PortalDataProvider role="sekretariat"><Layout /></PortalDataProvider></RequireRole>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardSekretariat />} />
          <Route path="kegiatan" element={<Kegiatan />} />
          <Route path="kegiatan/:id" element={<DetailKegiatanKegiatan />} />
          <Route path="presensi" element={<Presensi />} />
          <Route path="sertifikat" element={<Sertifikat />} />
          <Route path="sertifikat-perbaikan" element={<SertifikatPerbaikan />} />
          <Route path="log-audit" element={<LogAudit />} />
          <Route path="sertifikat/:id" element={<DetailKegiatan />} />
          <Route path="dokumen-pengganti/:id" element={<DetailDokumenPengganti />} />
          <Route path="profil" element={<Profil />} />
        </Route>

        {/* ── ROLE: REKTOR ── */}
        <Route path="/rektor" element={<RequireRole role="rektor"><PortalDataProvider role="rektor"><LayoutRektor /></PortalDataProvider></RequireRole>}>
          <Route index element={<Navigate to="pengajuan" replace />} />
          <Route path="pengajuan" element={<PengajuanSertifikat />} />
          <Route path="sertifikat-perbaikan" element={<SertifikatPerbaikanRektor />} />
          <Route path="pengajuan/:id" element={<DetailPengajuanRektor />} />
          <Route path="riwayat" element={<RiwayatTandaTangan />} />
          <Route path="riwayat/:id" element={<DetailRiwayatRektor />} />
          <Route path="dokumen-pengganti/:id" element={<DetailDokumenPenggantiRektor />} />
          <Route path="profil" element={<ProfilRektor />} />
        </Route>

        {/* ── ROLE: HUMAS ── */}
        <Route path="/humas" element={<RequireRole role="humas"><LayoutHumas /></RequireRole>}>
          <Route index element={<Navigate to="ringkasan" replace />} />
          <Route path="ringkasan" element={<RingkasanHumas />} />
          <Route path="kelola-kegiatan" element={<KelolaKegiatan />} />
          <Route path="kelola-kegiatan/:id" element={<DetailKegiatanHumas />} />
          <Route path="kelola-mitra" element={<KelolaMitra />} />
          <Route path="kelola-gedung" element={<KelolaGedung />} />
          <Route path="kelola-pengguna" element={<KelolaPengguna />} />
          <Route path="template-sertifikat" element={<TemplateSertifikat />} />
          <Route path="perbaikan-sertifikat" element={<PerbaikanSertifikat />} />
          <Route path="laporan" element={<Laporan />} />
          <Route path="log-audit" element={<LogAudit />} />
          <Route path="profil" element={<ProfilHumas />} />
        </Route>

        {/* ── ROLE: MITRA ── */}
        <Route path="/mitra" element={<RequireRole role="mitra"><PortalDataProvider role="mitra"><LayoutMitra /></PortalDataProvider></RequireRole>}>
          <Route index element={<Navigate to="kegiatan-kerja-sama" replace />} />
          <Route path="kegiatan-kerja-sama" element={<KegiatanKerjaSama />} />
          <Route path="kegiatan-kerja-sama/:id" element={<DetailKegiatanMitra />} />
          <Route path="peserta" element={<PesertaMitra />} />
          <Route path="template-sertifikat" element={<TemplateSertifikatMitra />} />
          <Route path="perbaikan-sertifikat" element={<PerbaikanSertifikatMitra />} />
          <Route path="dokumen-pengganti/:id" element={<DetailDokumenPenggantiMitra />} />
          <Route path="tanda-tangan" element={<TandaTanganMitra />} />
          <Route path="tanda-tangan/:id" element={<TandaTanganMitra />} />
          <Route path="laporan" element={<LaporanMitra />} />
          <Route path="profil" element={<ProfilMitra />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
