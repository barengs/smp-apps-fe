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
import PeranDetailPage from "@/pages/manajemen-staf/PeranDetailPage";
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
import MataPelajaranForm from "@/pages/manajemen-kurikulum/MataPelajaranForm";
import PelanggaranPage from "@/pages/manajemen-kamtib/PelanggaranPage";
import NavigationManagementPage from "@/pages/utility/NavigationManagementPage"; 
import StaffEditPage from "@/pages/manajemen-staf/StaffEditPage";
import SantriFormPage from "@/pages/manajemen-santri/SantriFormPage";
import SantriEditPage from "@/pages/manajemen-santri/SantriEditPage";
import WaliSantriEditPage from "@/pages/manajemen-santri/WaliSantriEditPage";
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
import ProfileEditPage from '@/pages/profile/ProfileEditPage';
import BeritaDetailPage from '@/pages/landing/BeritaDetailPage';
import PenanggungJawabPage from './pages/manajemen-magang/PenanggungJawabPage';
import InstitusiTugasPage from './pages/manajemen-magang/InstitusiTugasPage';
import CalonSantriDetailPage from '@/pages/manajemen-santri/CalonSantriDetailPage';
import CalonSantriEditPage from './pages/manajemen-santri/CalonSantriEditPage';
import TransaksiPage from '@/pages/keuangan/TransaksiPage';
import ProdukPage from '@/pages/keuangan/ProdukPage';
import CoaPage from '@/pages/keuangan/CoaPage';
import JenisTransaksiPage from '@/pages/keuangan/JenisTransaksiPage';
import RekeningPage from '@/pages/keuangan/RekeningPage';
import RekeningDetailPage from './pages/keuangan/RekeningDetailPage';
import LaporanPage from '@/pages/keuangan/LaporanPage';
import KamarPage from '@/pages/manajemen-kepesantrenan/KamarPage';
import OrganisasiPage from '@/pages/manajemen-staf/OrganisasiPage';
import ProtectedRoute from '@/components/ProtectedRoute';
import AppProfilePage from './pages/utility/AppProfilePage';
import TransaksiDetailPage from '@/pages/keuangan/TransaksiDetailPage';
import GuruPage from '@/pages/manajemen-kurikulum/GuruPage';
import GuruFormPage from '@/pages/manajemen-kurikulum/GuruFormPage'; // Import the new GuruFormPage
import GuruDetailPage from '@/pages/manajemen-kurikulum/GuruDetailPage'; // Import the new GuruDetailPage
import PenugasanGuruPage from '@/pages/manajemen-kurikulum/PenugasanGuruPage'; // Import the new PenugasanGuruPage
import TeachingHoursPage from '@/pages/manajemen-kurikulum/TeachingHoursPage'; // Import the new TeachingHoursPage
import JamPelajaranPage from '@/pages/manajemen-kurikulum/JamPelajaranPage';
import SiswaPage from '@/pages/manajemen-kurikulum/SiswaPage';
import SiswaDetailPage from '@/pages/manajemen-kurikulum/SiswaDetailPage';
import PresensiPage from './pages/manajemen-kurikulum/PresensiPage';
import PresensiDetailPage from './pages/manajemen-kurikulum/PresensiDetailPage';
import PresensiFormPage from './pages/manajemen-kurikulum/PresensiFormPage'; // Import baru
import InstitusiPendidikanPage from './pages/manajemen-kurikulum/InstitusiPendidikanPage';
import InstitusiPendidikanForm from './pages/manajemen-kurikulum/InstitusiPendidikanForm';

// Redux imports
import { Provider } from 'react-redux';
import { store } from './store';
import { ThemeProvider } from './components/theme-provider';
import { ToastContainer } from 'react-toastify';
import AuthManager from './components/AuthManager';
import DynamicAppConfig from './components/DynamicAppConfig';
import { useEffect } from 'react';
import { useGetControlPanelSettingsQuery } from './store/slices/controlPanelApi';

function App() {
  const { data: settingsResponse } = useGetControlPanelSettingsQuery(); // Mengubah nama variabel
  const settings = settingsResponse?.data; // Mengakses data dari properti 'data'

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
    <Provider store={store}>
      <BrowserRouter
        future={{
          v7_startTransition: true,
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
                <Route path="/dashboard/staf" element={<StafPage />} />
                <Route path="/dashboard/staf/:id" element={<StaffDetailPage />} />
                <Route path="/dashboard/staf/:id/edit" element={<StaffEditPage />} />
                <Route path="/dashboard/hak-akses" element={<HakAksesPage />} />
                <Route path="/dashboard/peran" element={<PeranPage />} />
                <Route path="/dashboard/peran/:id" element={<PeranDetailPage />} />
                <Route path="/dashboard/organisasi" element={<OrganisasiPage />} />
                
                {/* Rute Manajemen Santri */}
                <Route path="/dashboard/santri" element={<ManajemenSantriPage />} />
                <Route path="/dashboard/santri/:id" element={<SantriDetailPage />} />
                <Route path="/dashboard/santri/:id/edit" element={<SantriEditPage />} />
                
                {/* Rute Pendaftaran Santri */}
                <Route path="/dashboard/pendaftaran-santri" element={<CalonSantriPage />} />
                <Route path="/dashboard/pendaftaran-santri/add" element={<SantriFormPage />} />
                <Route path="/dashboard/pendaftaran-santri/:id/edit" element={<CalonSantriEditPage />} />
                <Route path="/dashboard/calon-santri/:id" element={<CalonSantriDetailPage />} />

                <Route path="/dashboard/wali-santri-list" element={<WaliSantriListPage />} />
                <Route path="/dashboard/wali-santri/:id" element={<WaliSantriDetailPage />} />
                <Route path="/dashboard/wali-santri/:id/edit" element={<WaliSantriEditPage />} />
                <Route path="/dashboard/informasi-santri" element={<InformasiSantriPage />} />
                <Route path="/dashboard/nilai-absensi" element={<NilaiAbsensiPage />} />
                <Route path="/dashboard/bank-santri" element={<BankSantriPage />} />
                <Route path="/dashboard/bank-santri/transaksi" element={<TransaksiPage />} />
                <Route path="/dashboard/bank-santri/transaksi/:id" element={<TransaksiDetailPage />} />
                <Route path="/dashboard/bank-santri/produk" element={<ProdukPage />} />
                <Route path="/dashboard/bank-santri/coa" element={<CoaPage />} />
                <Route path="/dashboard/bank-santri/jenis-transaksi" element={<JenisTransaksiPage />} />
                <Route path="/dashboard/bank-santri/rekening" element={<RekeningPage />} />
                <Route path="/dashboard/bank-santri/rekening/:accountNumber" element={<RekeningDetailPage />} />
                <Route path="/dashboard/bank-santri/laporan" element={<LaporanPage />} />
                <Route path="/dashboard/pengumuman" element={<PengumumanPage />} />
                <Route path="/dashboard/settings" element={<WaliSantriSettingsPage />} />
                <Route path="/dashboard/guru-tugas" element={<GuruTugasPage />} />
                <Route path="/dashboard/penanggung-jawab-magang" element={<PenanggungJawabPage />} />
                <Route path="/dashboard/institusi-tugas" element={<InstitusiTugasPage />} />
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
                <Route path="/dashboard/kepesantrenan/kamar" element={<KamarPage />} />
                <Route path="/dashboard/jadwal" element={<JadwalKegiatanPage />} />
                <Route path="/dashboard/manajemen-kurikulum/mata-pelajaran" element={<MataPelajaranPage />} />
                <Route path="/dashboard/manajemen-kurikulum/mata-pelajaran/add" element={<MataPelajaranForm />} />
                <Route path="/dashboard/manajemen-kurikulum/mata-pelajaran/:id/edit" element={<MataPelajaranForm />} />
                <Route path="/dashboard/manajemen-kurikulum/jam-pelajaran" element={<JamPelajaranPage />} />
                <Route path="/dashboard/manajemen-kurikulum/siswa" element={<SiswaPage />} />
                <Route path="/dashboard/manajemen-kurikulum/siswa/detail" element={<SiswaDetailPage />} />
                <Route path="/dashboard/manajemen-kurikulum/guru" element={<GuruPage />} />
                <Route path="/dashboard/manajemen-kurikulum/guru/add" element={<GuruFormPage />} />
                <Route path="/dashboard/manajemen-kurikulum/guru/:id/edit" element={<GuruFormPage />} />
                <Route path="/dashboard/manajemen-kurikulum/guru/:id" element={<GuruDetailPage />} />
                <Route path="/dashboard/manajemen-kurikulum/penugasan-guru" element={<PenugasanGuruPage />} />
                <Route path="/dashboard/manajemen-kurikulum/jam-mengajar" element={<TeachingHoursPage />} />
                <Route path="/dashboard/manajemen-kurikulum/presensi" element={<PresensiPage />} />
                <Route path="/dashboard/manajemen-kurikulum/presensi/:detailId" element={<PresensiDetailPage />} />
                <Route path="/dashboard/manajemen-kurikulum/presensi/:detailId/pertemuan/:meetingNumber" element={<PresensiFormPage />} />
                <Route path="/dashboard/manajemen-kurikulum/jadwal-pelajaran" element={<JadwalPelajaranPage />} />
                <Route path="/dashboard/manajemen-kurikulum/kenaikan-kelas" element={<KenaikanKelasPage />} />
                <Route path="/dashboard/manajemen-kurikulum/institusi-pendidikan" element={<InstitusiPendidikanPage />} />
                <Route path="/dashboard/manajemen-kurikulum/institusi-pendidikan/tambah" element={<InstitusiPendidikanForm onSuccess={() => {}} onCancel={() => {}} />} />
                <Route path="/dashboard/manajemen-kurikulum/institusi-pendidikan/:id" element={<InstitusiPendidikanPage />} />
                <Route path="/dashboard/manajemen-kamtib/pelanggaran" element={<PelanggaranPage />} />
                <Route path="/dashboard/master-data/pekerjaan" element={<PekerjaanPage />} />
                <Route path="/dashboard/berita" element={<BeritaPage />} />
                <Route path="/dashboard/settings/navigation" element={<NavigationManagementPage />} />
                <Route path="/dashboard/settings/app-profile" element={<AppProfilePage />} />
                <Route path="/dashboard/profile" element={<UserProfilePage />} />
                <Route path="/dashboard/profile/edit" element={<ProfileEditPage />} />
              </Route>

              {/* Rute Catch-all untuk halaman yang tidak ditemukan */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthManager>
        </ThemeProvider>
      </BrowserRouter>
    </Provider>
  );
}

export default App;