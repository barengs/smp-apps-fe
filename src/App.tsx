import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "@/pages/landing/Index";
import NotFound from "@/pages/utility/NotFound";
import WaliSantriDashboard from "@/pages/dashboard/WaliSantriDashboard";
import AdministrasiDashboard from "@/pages/dashboard/AdministrasiDashboard";
import Login from "@/pages/auth/Login";
import Daftar from "@/pages/auth/Daftar";
import StafPage from "@/pages/manajemen-staf/StafPage";
import HakAksesPage from "@/pages/manajemen-staf/HakAksesPage";
import PeranPage from "@/pages/manajemen-staf/PeranPage";
import ManajemenSantriPage from "@/pages/manajemen-santri/ManajemenSantriPage";
import WaliSantriListPage from "@/pages/manajemen-santri/WaliSantriListPage";
import StaffDetailPage from "@/pages/manajemen-staf/StaffDetailPage";
import SantriDetailPage from "@/pages/manajemen-santri/SantriDetailPage";
import ProvinsiPage from "@/pages/data-wilayah/ProvinsiPage";
import KotaPage from "@/pages/data-wilayah/KotaPage";
import KecamatanPage from "@/pages/data-wilayah/KecamatanPage";
import DesaPage from "@/pages/data-wilayah/DesaPage";
import WaliSantriDetailPage from "@/pages/manajemen-santri/WaliSantriDetailPage";
import ProgramPage from "@/pages/manajemen-pendidikan/ProgramPage";
import TahunAjaranPage from "@/pages/manajemen-pendidikan/TahunAjaranPage";
import AsramaPage from "@/pages/manajemen-pendidikan/AsramaPage";
import JenjangPendidikanPage from "@/pages/manajemen-pendidikan/JenjangPendidikanPage";
import KelasPage from "@/pages/manajemen-pendidikan/KelasPage";
import JadwalKegiatanPage from "@/pages/manajemen-pendidikan/JadwalKegiatanPage";
import RombelPage from "@/pages/manajemen-pendidikan/RombelPage";
import KenaikanKelasPage from "@/pages/manajemen-kurikulum/KenaikanKelasPage";
import JadwalPelajaranPage from "@/pages/manajemen-kurikulum/JadwalPelajaranPage";
import MataPelajaranPage from "@/pages/manajemen-kurikulum/MataPelajaranPage";
import PelanggaranPage from "@/pages/manajemen-kamtib/PelanggaranPage";
import SystemSettingsPage from "@/pages/utility/SystemSettingsPage";
import NavigationManagementPage from "@/pages/utility/NavigationManagementPage"; 
import StaffEditPage from "@/pages/manajemen-staf/StaffEditPage";
import SantriFormPage from "@/pages/manajemen-santri/SantriFormPage";
import KelompokPendidikanPage from '@/pages/manajemen-pendidikan/KelompokPendidikanPage';
import PekerjaanPage from '@/pages/master-data/PekerjaanPage';
import BeritaPage from '@/pages/informasi/BeritaPage';
import InformasiSantriPage from '@/pages/manajemen-santri/InformasiSantriPage';
import NilaiAbsensiPage from '@/pages/manajemen-santri/NilaiAbsensiPage';
import BankSantriPage from '@/pages/keuangan/BankSantriPage';
import PengumumanPage from '@/pages/informasi/PengumumanPage';
import WaliSantriSettingsPage from '@/pages/utility/WaliSantriSettingsPage';
import GuruTugasPage from '@/pages/manajemen-santri/GuruTugasPage';
import CalonSantriPage from '@/pages/manajemen-santri/CalonSantriPage';
import UserProfilePage from '@/pages/profile/UserProfilePage';
import BeritaDetailPage from '@/pages/landing/BeritaDetailPage';
import PenanggungJawabPage from './pages/manajemen-magang/PenanggungJawabPage';
import CalonSantriDetailPage from '@/pages/manajemen-santri/CalonSantriDetailPage';
import TransaksiPage from '@/pages/keuangan/TransaksiPage';
import ProdukPage from '@/pages/keuangan/ProdukPage';
import CoaPage from '@/pages/keuangan/CoaPage';
// import RegistrationPdfPreviewPage from '@/pages/manajemen-santri/RegistrationPdfPreviewPage'; // Import halaman pratinjau PDF

// Redux imports
import { Provider } from 'react-redux';
import { store } from './store';
import { ThemeProvider } from '@/components/theme-provider';

import { ToastContainer } from 'react-toastify';
import ProtectedRoute from "./components/ProtectedRoute";

const App = () => (
  <Provider store={store}>
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <TooltipProvider>
        <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
        <BrowserRouter future={{ v7_startTransition: true }}>
          <Routes>
            {/* Rute Publik */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/daftar" element={<Daftar />} />
            <Route path="/berita/:id" element={<BeritaDetailPage />} />
            {/* <Route path="/registration-pdf-preview/:id" element={<RegistrationPdfPreviewPage />} /> */} {/* Rute baru untuk pratinjau PDF */}

            {/* Rute yang Dilindungi */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard/wali-santri" element={<WaliSantriDashboard />} />
              <Route path="/dashboard/administrasi" element={<AdministrasiDashboard />} />
              <Route path="/dashboard/staf" element={<StafPage />} />
              <Route path="/dashboard/staf/:id" element={<StaffDetailPage />} />
              <Route path="/dashboard/staf/:id/edit" element={<StaffEditPage />} />
              <Route path="/dashboard/hak-akses" element={<HakAksesPage />} />
              <Route path="/dashboard/peran" element={<PeranPage />} />
              
              {/* Rute Manajemen Santri */}
              <Route path="/dashboard/santri" element={<ManajemenSantriPage />} />
              <Route path="/dashboard/santri/:id" element={<SantriDetailPage />} />
              
              {/* Rute Pendaftaran Santri */}
              <Route path="/dashboard/pendaftaran-santri" element={<CalonSantriPage />} />
              <Route path="/dashboard/pendaftaran-santri/add" element={<SantriFormPage />} />
              <Route path="/dashboard/pendaftaran-santri/:id" element={<SantriFormPage />} />
              <Route path="/dashboard/calon-santri/:id" element={<CalonSantriDetailPage />} />

              <Route path="/dashboard/wali-santri-list" element={<WaliSantriListPage />} />
              <Route path="/dashboard/wali-santri/:id" element={<WaliSantriDetailPage />} />
              <Route path="/dashboard/informasi-santri" element={<InformasiSantriPage />} />
              <Route path="/dashboard/nilai-absensi" element={<NilaiAbsensiPage />} />
              <Route path="/dashboard/bank-santri" element={<BankSantriPage />} />
              <Route path="/dashboard/bank-santri/transaksi" element={<TransaksiPage />} />
              <Route path="/dashboard/bank-santri/produk" element={<ProdukPage />} />
              <Route path="/dashboard/bank-santri/coa" element={<CoaPage />} />
              <Route path="/dashboard/pengumuman" element={<PengumumanPage />} />
              <Route path="/dashboard/settings" element={<WaliSantriSettingsPage />} />
              <Route path="/dashboard/guru-tugas" element={<GuruTugasPage />} />
              <Route path="/dashboard/penanggung-jawab-magang" element={<PenanggungJawabPage />} />
              <Route path="/dashboard/wilayah/provinsi" element={<ProvinsiPage />} />
              <Route path="/dashboard/wilayah/kota" element={<KotaPage />} />
              <Route path="/dashboard/wilayah/kecamatan" element={<KecamatanPage />} />
              <Route path="/dashboard/wilayah/desa" element={<DesaPage />} />
              <Route path="/dashboard/pendidikan/program" element={<ProgramPage />} />
              <Route path="/dashboard/pendidikan/tahun-ajaran" element={<TahunAjaranPage />} />
              <Route path="/dashboard/pendidikan/asrama" element={<AsramaPage />} />
              <Route path="/dashboard/pendidikan/jenjang" element={<JenjangPendidikanPage />} />
              <Route path="/dashboard/pendidikan/kelas" element={<KelasPage />} />
              <Route path="/dashboard/pendidikan/rombel" element={<RombelPage />} />
              <Route path="/dashboard/pendidikan/kelompok-pendidikan" element={<KelompokPendidikanPage />} />
              <Route path="/dashboard/jadwal" element={<JadwalKegiatanPage />} />
              <Route path="/dashboard/manajemen-kurikulum/kenaikan-kelas" element={<KenaikanKelasPage />} />
              <Route path="/dashboard/manajemen-kurikulum/jadwal-pelajaran" element={<JadwalPelajaranPage />} />
              <Route path="/dashboard/manajemen-kurikulum/mata-pelajaran" element={<MataPelajaranPage />} />
              <Route path="/dashboard/manajemen-kamtib/pelanggaran" element={<PelanggaranPage />} />
              <Route path="/dashboard/master-data/pekerjaan" element={<PekerjaanPage />} />
              <Route path="/dashboard/berita" element={<BeritaPage />} />
              <Route path="/dashboard/settings/system" element={<SystemSettingsPage />} />
              <Route path="/dashboard/settings/navigation" element={<NavigationManagementPage />} />
              <Route path="/dashboard/profile" element={<UserProfilePage />} />
            </Route>

            {/* Rute Catch-all untuk halaman yang tidak ditemukan */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </Provider>
);

export default App;