import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "@/pages/landing/Index";
import NotFound from "@/pages/utility/NotFound";
import WaliSantriDashboard from "@/pages/dashboard/WaliSantriDashboard";
import AdministrasiDashboard from "@/pages/dashboard/AdministrasiDashboard";
import KamtibDashboard from "@/pages/dashboard/KamtibDashboard";
import Login from "@/pages/auth/Login";
import Daftar from "@/pages/auth/Daftar";
import StafPage from "@/pages/manajemen-staf/StafPage";
import HakAksesPage from "@/pages/manajemen-staf/HakAksesPage";
import PeranPage from "@/pages/manajemen-staf/PeranPage";
import PeranDetailPage from "@/pages/manajemen-staf/PeranDetailPage";
import PeranAddPage from "@/pages/manajemen-staf/PeranAddPage";
import PeranEditPage from "@/pages/manajemen-staf/PeranEditPage";
import OrganisasiPage from "@/pages/manajemen-staf/OrganisasiPage";
import ManajemenSantriPage from "@/pages/manajemen-santri/ManajemenSantriPage";
import ManajemenPerjanjianPage from "@/pages/manajemen-santri/ManajemenPerjanjianPage";
import BoyongPage from "@/pages/manajemen-santri/BoyongPage";
import WaliSantriListPage from "@/pages/manajemen-santri/WaliSantriListPage";
import StaffDetailPage from "@/pages/manajemen-staf/StaffDetailPage";
import SantriDetailPage from "@/pages/manajemen-santri/SantriDetailPage";
import StudentAgreementPage from "@/pages/manajemen-santri/StudentAgreementPage";
import MutasiAsramaPage from "@/pages/manajemen-santri/MutasiAsramaPage";
import ProvinsiPage from "@/pages/data-wilayah/ProvinsiPage";
import KotaPage from "@/pages/data-wilayah/KotaPage";
import KecamatanPage from "@/pages/data-wilayah/KecamatanPage";
import DesaPage from "@/pages/data-wilayah/DesaPage";
import WaliSantriDetailPage from "@/pages/manajemen-santri/WaliSantriDetailPage";
import ProgramPage from "@/pages/master-data/ProgramPage";
import TahunAjaranPage from "@/pages/master-data/TahunAjaranPage";
import AsramaPage from "@/pages/manajemen-kepesantrenan/AsramaPage";
import JadwalKegiatanPage from "@/pages/manajemen-kepesantrenan/JadwalKegiatanPage";
import PelanggaranPage from "@/pages/manajemen-kamtib/PelanggaranPage";
import KategoriPelanggaranPage from '@/pages/manajemen-kamtib/KategoriPelanggaranPage';
import NavigationManagementPage from "@/pages/utility/NavigationManagementPage";
import { RoleManagementPage } from "@/pages/utility/RoleManagementPage";
import { RoleFormPage } from "@/pages/utility/RoleFormPage";
import StaffEditPage from "@/pages/manajemen-staf/StaffEditPage";
import SantriFormPage from "@/pages/manajemen-santri/SantriFormPage";
import SantriEditPage from "@/pages/manajemen-santri/SantriEditPage";
import WaliSantriEditPage from "@/pages/manajemen-santri/WaliSantriEditPage";
import PekerjaanPage from '@/pages/master-data/PekerjaanPage';
import BeritaPage from '@/pages/informasi/BeritaPage';
import InformasiSantriPage from '@/pages/manajemen-santri/InformasiSantriPage';
import NilaiAbsensiPage from '@/pages/manajemen-santri/NilaiAbsensiPage';
import PengumumanPage from '@/pages/informasi/PengumumanPage';
import WaliSantriSettingsPage from '@/pages/utility/WaliSantriSettingsPage';
import GuruTugasPage from '@/pages/manajemen-santri/GuruTugasPage';
import CalonSantriPage from '@/pages/manajemen-santri/CalonSantriPage';
import UserProfilePage from '@/pages/profile/UserProfilePage';
import ProfileEditPage from '@/pages/profile/ProfileEditPage';
import BeritaDetailPage from '@/pages/landing/BeritaDetailPage';
import PenanggungJawabPage from './pages/manajemen-magang/PenanggungJawabPage';
import InstitusiTugasPage from './pages/manajemen-magang/InstitusiTugasPage';
import CalonSantriDetailPage from '@/pages/manajemen-santri/CalonSantriDetailPage';
import CalonSantriEditPage from './pages/manajemen-santri/CalonSantriEditPage';
import LaporanPelanggaranPage from '@/pages/manajemen-kamtib/LaporanPelanggaranPage';
import KamarPage from '@/pages/manajemen-kepesantrenan/KamarPage';
import OrganizationPage from '@/pages/manajemen-organisasi/OrganizationPage';
import PositionPage from '@/pages/manajemen-organisasi/PositionPage';
import KepengurusanPage from '@/pages/manajemen-organisasi/KepengurusanPage';
import ProtectedRoute from '@/components/ProtectedRoute';
import AppProfilePage from './pages/utility/AppProfilePage';
import LaporanPelanggaranDetailPage from '@/pages/manajemen-kamtib/LaporanPelanggaranDetailPage';
import SanksiPage from '@/pages/manajemen-kamtib/SanksiPage';
import JenisSanksiPage from './pages/manajemen-kamtib/JenisSanksiPage';
import PerizinanPage from '@/pages/manajemen-kamtib/PerizinanPage';
import TipeIzinPage from '@/pages/manajemen-kamtib/TipeIzinPage';
import PerizinanDetailPage from '@/pages/manajemen-kamtib/PerizinanDetailPage';
import ManajemenLiburPage from '@/pages/manajemen-kamtib/ManajemenLiburPage';
import LiburSantriPage from '@/pages/manajemen-kamtib/LiburSantriPage';
import HolidayVerificationPage from '@/pages/manajemen-kamtib/HolidayVerificationPage';
import StudentCardTemplateSettingsPage from '@/pages/utility/StudentCardTemplateSettingsPage';
import DataSantriPage from '@/pages/wali-santri/DataSantriPage';
import DataSantriDetailPage from '@/pages/wali-santri/DataSantriDetailPage';
import RegistrationPage from '@/pages/wali-santri/RegistrationPage';
import RegistrationHistoryPage from '@/pages/wali-santri/RegistrationHistoryPage';
import TagihanPage from '@/pages/wali-santri/TagihanPage';
import TransaksiPage from '@/pages/wali-santri/TransaksiPage';
import { StatistikSantriPage } from '@/pages/kesantrian/laporan/StatistikSantriPage';
import { LaporanPelanggaranPage as LaporanPelanggaranPesantrenPage } from '@/pages/kesantrian/laporan/LaporanPelanggaranPage';
import { LaporanIzinPage } from '@/pages/kesantrian/laporan/LaporanIzinPage';
import RekeningPage from '@/pages/keuangan/RekeningPage';
import RekeningDetailPage from '@/pages/keuangan/RekeningDetailPage';

// Theme & Global
import { ThemeProvider } from './components/theme-provider';
import { ToastContainer } from 'react-toastify';
import AuthManager from './components/AuthManager';
import DynamicAppConfig from './components/DynamicAppConfig';
import { useEffect } from 'react';
import { useGetControlPanelSettingsQuery } from './store/slices/controlPanelApi';

function App() {
  const { data: settingsResponse } = useGetControlPanelSettingsQuery();
  const settings = settingsResponse?.data;

  useEffect(() => {
    if (settings?.app_description) {
      let metaDescriptionTag = document.querySelector('meta[name="description"]');
      if (!metaDescriptionTag) {
        metaDescriptionTag = document.createElement('meta');
        metaDescriptionTag.setAttribute('name', 'description');
        document.head.appendChild(metaDescriptionTag);
      }
      metaDescriptionTag.setAttribute('content', settings.app_description);
    }
  }, [settings]);

  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <ToastContainer />
        <AuthManager>
          <DynamicAppConfig />
          <Routes>
            {/* Landing Page Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/daftar" element={<Daftar />} />
            <Route path="/berita/:id" element={<BeritaDetailPage />} />

            {/* Rute yang Dilindungi */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard/wali-santri" element={<WaliSantriDashboard />} />
              <Route path="/dashboard/administrasi" element={<AdministrasiDashboard />} />
              <Route path="/dashboard/manajemen-kamtib/dashboard" element={<KamtibDashboard />} />
              <Route path="/dashboard/staf" element={<StafPage />} />
              <Route path="/dashboard/staf/:id" element={<StaffDetailPage />} />
              <Route path="/dashboard/staf/:id/edit" element={<StaffEditPage />} />
              <Route path="/dashboard/hak-akses" element={<HakAksesPage />} />
              <Route path="/dashboard/peran" element={<PeranPage />} />
              <Route path="/dashboard/peran/add" element={<PeranAddPage />} />
              <Route path="/dashboard/peran/:id" element={<PeranDetailPage />} />
              <Route path="/dashboard/peran/:id/edit" element={<PeranEditPage />} />
              <Route path="/dashboard/organisasi" element={<OrganisasiPage />} />
              <Route path="/dashboard/organisasi/lembaga" element={<OrganizationPage />} />
              <Route path="/dashboard/organisasi/jabatan" element={<PositionPage />} />
              <Route path="/dashboard/organisasi/kepengurusan" element={<KepengurusanPage />} />

              {/* Rute Manajemen Santri */}
              <Route path="/dashboard/santri" element={<ManajemenSantriPage />} />
              <Route path="/dashboard/santri/perjanjian" element={<ManajemenPerjanjianPage />} />
              <Route path="/dashboard/santri/boyong" element={<BoyongPage />} />
              <Route path="/dashboard/santri/:id" element={<SantriDetailPage />} />
              <Route path="/dashboard/santri/:id/agreement" element={<StudentAgreementPage />} />
              <Route path="/dashboard/santri/:id/edit" element={<SantriEditPage />} />
              <Route path="/dashboard/santri/mutasi-asrama" element={<MutasiAsramaPage />} />
              <Route path="/dashboard/santri/rekening" element={<RekeningPage />} />
              <Route path="/dashboard/santri/rekening/:accountNumber" element={<RekeningDetailPage />} />

              {/* Rute Pendaftaran Santri */}
              <Route path="/dashboard/pendaftaran-santri" element={<CalonSantriPage />} />
              <Route path="/dashboard/pendaftaran-santri/add" element={<SantriFormPage />} />
              <Route path="/dashboard/pendaftaran-santri/:id/edit" element={<CalonSantriEditPage />} />
              <Route path="/dashboard/calon-santri/:id" element={<CalonSantriDetailPage />} />

              <Route path="/dashboard/wali-santri-list" element={<WaliSantriListPage />} />
              <Route path="/dashboard/wali-santri/:id" element={<WaliSantriDetailPage />} />
              <Route path="/dashboard/wali-santri/:id/edit" element={<WaliSantriEditPage />} />

              {/* Wali Santri Specific Routes */}
              <Route path="/dashboard/wali-santri/data-santri" element={<DataSantriPage />} />
              <Route path="/dashboard/wali-santri/data-santri/:id" element={<DataSantriDetailPage />} />
              <Route path="/dashboard/wali-santri/pendaftaran-santri" element={<RegistrationHistoryPage />} />
              <Route path="/dashboard/wali-santri/pendaftaran-santri/baru" element={<RegistrationPage />} />
              <Route path="/dashboard/wali-santri/tagihan" element={<TagihanPage />} />
              <Route path="/dashboard/wali-santri/transaksi" element={<TransaksiPage />} />

              <Route path="/dashboard/informasi-santri" element={<InformasiSantriPage />} />
              <Route path="/dashboard/nilai-absensi" element={<NilaiAbsensiPage />} />
              <Route path="/dashboard/settings" element={<WaliSantriSettingsPage />} />
              <Route path="/dashboard/guru-tugas" element={<GuruTugasPage />} />
              <Route path="/dashboard/penanggung-jawab-magang" element={<PenanggungJawabPage />} />
              <Route path="/dashboard/institusi-tugas" element={<InstitusiTugasPage />} />

              {/* Route Management Wilayah */}
              <Route path="/dashboard/wilayah/provinsi" element={<ProvinsiPage />} />
              <Route path="/dashboard/wilayah/kota" element={<KotaPage />} />
              <Route path="/dashboard/wilayah/kecamatan" element={<KecamatanPage />} />
              <Route path="/dashboard/wilayah/desa" element={<DesaPage />} />

              {/* Route Master Data */}
              <Route path="/dashboard/master-data/pekerjaan" element={<PekerjaanPage />} />
              <Route path="/dashboard/master-data/program" element={<ProgramPage />} />
              <Route path="/dashboard/master-data/tahun-ajaran" element={<TahunAjaranPage />} />

              {/* Route Kepesantrenan */}
              <Route path="/dashboard/kepesantrenan/asrama" element={<AsramaPage />} />
              <Route path="/dashboard/kepesantrenan/kamar" element={<KamarPage />} />
              <Route path="/dashboard/kepesantrenan/jadwal-kegiatan" element={<JadwalKegiatanPage />} />

              {/* Route Manajemen Kamtib */}
              <Route path="/dashboard/manajemen-kamtib/pelanggaran" element={<PelanggaranPage />} />
              <Route path="/dashboard/manajemen-kamtib/kategori-pelanggaran" element={<KategoriPelanggaranPage />} />
              <Route path="/dashboard/manajemen-kamtib/sanksi" element={<SanksiPage />} />
              <Route path="/dashboard/manajemen-kamtib/jenis-sanksi" element={<JenisSanksiPage />} />
              <Route path="/dashboard/manajemen-kamtib/laporan" element={<LaporanPelanggaranPage />} />
              <Route path="/dashboard/manajemen-kamtib/laporan/:id" element={<LaporanPelanggaranDetailPage />} />
              <Route path="/dashboard/manajemen-kamtib/perizinan" element={<PerizinanPage />} />
              <Route path="/dashboard/manajemen-kamtib/tipe-izin" element={<TipeIzinPage />} />
              <Route path="/dashboard/manajemen-kamtib/perizinan/:id" element={<PerizinanDetailPage />} />
              <Route path="/dashboard/manajemen-kamtib/manajemen-libur" element={<ManajemenLiburPage />} />
              <Route path="/dashboard/manajemen-kamtib/libur-santri" element={<LiburSantriPage />} />
              <Route path="/dashboard/manajemen-kamtib/libur-santri/:id" element={<LiburSantriPage />} />
              <Route path="/dashboard/manajemen-kamtib/libur-verifikasi" element={<HolidayVerificationPage />} />

              {/* Utility & Settings */}
              <Route path="/dashboard/settings/navigation" element={<NavigationManagementPage />} />
              <Route path="/dashboard/settings/app-profile" element={<AppProfilePage />} />
              <Route path="/dashboard/settings/student-card-template" element={<StudentCardTemplateSettingsPage />} />
              <Route path="/utility/roles" element={<RoleManagementPage />} />
              <Route path="/utility/roles/create" element={<RoleFormPage />} />
              <Route path="/utility/roles/:id/edit" element={<RoleFormPage />} />
              <Route path="/dashboard/profile" element={<UserProfilePage />} />
              <Route path="/dashboard/profile/edit" element={<ProfileEditPage />} />

              {/* Manajemen Informasi */}
              <Route path="/dashboard/berita" element={<BeritaPage />} />
              <Route path="/dashboard/pengumuman" element={<PengumumanPage />} />

              {/* Laporan Pesantren */}
              <Route path="/dashboard/kesantrian/laporan/statistik-santri" element={<StatistikSantriPage />} />
              <Route path="/dashboard/kesantrian/laporan/pelanggaran" element={<LaporanPelanggaranPesantrenPage />} />
              <Route path="/dashboard/kesantrian/laporan/izin" element={<LaporanIzinPage />} />
            </Route>

            {/* Rute Catch-all untuk halaman yang tidak ditemukan */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthManager>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
