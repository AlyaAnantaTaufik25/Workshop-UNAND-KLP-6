import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';

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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

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

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
