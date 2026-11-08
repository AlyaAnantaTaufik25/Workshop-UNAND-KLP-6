import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import LayoutPeserta from './pages/peserta/LayoutPeserta';
import CariWorkshop from './pages/peserta/CariWorkshop';
import DetailWorkshop from './pages/peserta/DetailWorkshop';
import WorkshopSaya from './pages/peserta/WorkshopSaya';
import SertifikatPeserta from './pages/peserta/SertifikatPeserta';
import ProfilPeserta from './pages/peserta/ProfilPeserta';

// Sekretariat Rektor
import Layout from './components/Layout';
import Kegiatan from './pages/sekretariat/Kegiatan';
import Presensi from './pages/sekretariat/Presensi';
import Sertifikat from './pages/sekretariat/Sertifikat';
import SertifikatPerbaikan from './pages/sekretariat/SertifikatPerbaikan';
import DetailKegiatanKegiatan from './pages/sekretariat/DetailKegiatanKegiatan';
import DetailKegiatan from './pages/sekretariat/DetailKegiatan';
import DetailDokumenPengganti from './pages/sekretariat/DetailDokumenPengganti';
import Profil from './pages/sekretariat/Profil';

// Rektor
import LayoutRektor from './components/LayoutRektor';
import PengajuanSertifikat from './pages/rektor/PengajuanSertifikat';
import SertifikatPerbaikanRektor from './pages/rektor/SertifikatPerbaikanRektor';
import DetailPengajuanRektor from './pages/rektor/DetailPengajuanRektor';
import RiwayatTandaTangan from './pages/rektor/RiwayatTandaTangan';
import DetailRiwayatRektor from './pages/rektor/DetailRiwayatRektor';
import DetailDokumenPenggantiRektor from './pages/rektor/DetailDokumenPenggantiRektor';
import ProfilRektor from './pages/rektor/ProfilRektor';

// Humas
import LayoutHumas from './components/LayoutHumas';

// Mitra
import LayoutMitra from './pages/mitra/LayoutMitra';
import KegiatanKerjaSama from './pages/mitra/KegiatanKerjaSama';
import DetailKegiatanMitra from './pages/mitra/DetailKegiatanMitra';
import PesertaMitra from './pages/mitra/PesertaMitra';
import TemplateSertifikatMitra from './pages/mitra/TemplateSertifikatMitra';
import PerbaikanSertifikatMitra from './pages/mitra/PerbaikanSertifikatMitra';
import DetailDokumenPenggantiMitra from './pages/mitra/DetailDokumenPenggantiMitra';
import TandaTanganMitra from './pages/mitra/TandaTanganMitra';
import DetailTandaTanganMitra from './pages/mitra/DetailTandaTanganMitra';
import LaporanMitra from './pages/mitra/LaporanMitra';
import ProfilMitra from './pages/mitra/ProfilMitra';
import RingkasanHumas from './pages/humas/RingkasanHumas';
import DetailKegiatanHumas from './pages/humas/DetailKegiatanHumas';
import KelolaKegiatan from './pages/humas/KelolaKegiatan';
import KelolaMitra from './pages/humas/KelolaMitra';
import KelolaGedung from './pages/humas/KelolaGedung';
import KelolaPengguna from './pages/humas/KelolaPengguna';
import TemplateSertifikat from './pages/humas/TemplateSertifikat';
import PerbaikanSertifikat from './pages/humas/PerbaikanSertifikat';
import Laporan from './pages/humas/Laporan';
import ProfilHumas from './pages/humas/ProfilHumas';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/peserta" element={<LayoutPeserta />}>
          <Route index element={<Navigate to="cari-workshop" replace />} />
          <Route path="cari-workshop" element={<CariWorkshop />} />
          <Route path="workshop/:id" element={<DetailWorkshop />} />
          <Route path="workshop-saya" element={<WorkshopSaya />} />
          <Route path="sertifikat" element={<SertifikatPeserta />} />
          <Route path="profil" element={<ProfilPeserta />} />
        </Route>

        {/* ── ROLE: SEKRETARIAT REKTOR ── */}
        <Route path="/sekretariat" element={<Layout />}>
          <Route index element={<Navigate to="kegiatan" replace />} />
          <Route path="kegiatan" element={<Kegiatan />} />
          <Route path="kegiatan/:id" element={<DetailKegiatanKegiatan />} />
          <Route path="presensi" element={<Presensi />} />
          <Route path="sertifikat" element={<Sertifikat />} />
          <Route path="sertifikat-perbaikan" element={<SertifikatPerbaikan />} />
          <Route path="sertifikat/:id" element={<DetailKegiatan />} />
          <Route path="dokumen-pengganti/:id" element={<DetailDokumenPengganti />} />
          <Route path="profil" element={<Profil />} />
        </Route>

        {/* ── ROLE: REKTOR ── */}
        <Route path="/rektor" element={<LayoutRektor />}>
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
        <Route path="/humas" element={<LayoutHumas />}>
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
          <Route path="profil" element={<ProfilHumas />} />
        </Route>

        {/* ── ROLE: MITRA ── */}
        <Route path="/mitra" element={<LayoutMitra />}>
          <Route index element={<Navigate to="kegiatan-kerja-sama" replace />} />
          <Route path="kegiatan-kerja-sama" element={<KegiatanKerjaSama />} />
          <Route path="kegiatan-kerja-sama/:id" element={<DetailKegiatanMitra />} />
          <Route path="peserta" element={<PesertaMitra />} />
          <Route path="template-sertifikat" element={<TemplateSertifikatMitra />} />
          <Route path="perbaikan-sertifikat" element={<PerbaikanSertifikatMitra />} />
          <Route path="dokumen-pengganti/:id" element={<DetailDokumenPenggantiMitra />} />
          <Route path="tanda-tangan" element={<TandaTanganMitra />} />
          <Route path="tanda-tangan/:id" element={<DetailTandaTanganMitra />} />
          <Route path="laporan" element={<LaporanMitra />} />
          <Route path="profil" element={<ProfilMitra />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
