import { Toaster as Sonner } from "@/components/ui/sonner";
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
import SantriFormPage from "@/pages/manajemen-santri/SantriFormPage"; // Import SantriFormPage

// Redux imports
import { Provider } from 'react-redux';
import { store } from './store';
import { ThemeProvider } from '@/components/theme-provider'; // Import ThemeProvider

const App = () => (
  <Provider store={store}>
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <TooltipProvider>
        <Sonner position="top-right" />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/daftar" element={<Daftar />} />
            <Route path="/dashboard/wali-santri" element={<WaliSantriDashboard />} />
            <Route path="/dashboard/administrasi" element={<AdministrasiDashboard />} />
            <Route path="/dashboard/staf" element={<StafPage />} />
            <Route path="/dashboard/staf/:id" element={<StaffDetailPage />} />
            <Route path="/dashboard/hak-akses" element={<HakAksesPage />} />
            <Route path="/dashboard/peran" element={<PeranPage />} />
            <Route path="/dashboard/santri" element={<ManajemenSantriPage />} />
            <Route path="/dashboard/santri/add" element={<SantriFormPage />} /> {/* New route for adding santri */}
            <Route path="/dashboard/santri/:id" element={<SantriDetailPage />} />
            <Route path="/dashboard/wali-santri-list" element={<WaliSantriListPage />} />
            <Route path="/dashboard/wali-santri/:id" element={<WaliSantriDetailPage />} />
            <Route path="/dashboard/wilayah/provinsi" element={<ProvinsiPage />} />
            <Route path="/dashboard/wilayah/kota" element={<KotaPage />} />
            <Route path="/dashboard/wilayah/kecamatan" element={<KecamatanPage />} />
            <Route path="/dashboard/wilayah/desa" element={<DesaPage />} />
            <Route path="/dashboard/pendidikan/program" element={<ProgramPage />} />
            <Route path="/dashboard/pendidikan/asrama" element={<AsramaPage />} />
            <Route path="/dashboard/pendidikan/jenjang" element={<JenjangPendidikanPage />} />
            <Route path="/dashboard/pendidikan/kelas" element={<KelasPage />} />
            <Route path="/dashboard/pendidikan/rombel" element={<RombelPage />} />
            <Route path="/dashboard/jadwal" element={<JadwalKegiatanPage />} />
            <Route path="/dashboard/manajemen-kurikulum/kenaikan-kelas" element={<KenaikanKelasPage />} />
            <Route path="/dashboard/manajemen-kurikulum/jadwal-pelajaran" element={<JadwalPelajaranPage />} />
            <Route path="/dashboard/manajemen-kurikulum/mata-pelajaran" element={<MataPelajaranPage />} />
            <Route path="/dashboard/manajemen-kamtib/pelanggaran" element={<PelanggaranPage />} />
            <Route path="/dashboard/settings/system" element={<SystemSettingsPage />} />
            <Route path="/dashboard/settings/navigation" element={<NavigationManagementPage />} /> 
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </Provider>
);

export default App;