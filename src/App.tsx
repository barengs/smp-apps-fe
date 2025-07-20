import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "@/pages/landing/Index.tsx";
import NotFound from "@/pages/utility/NotFound.tsx";
import WaliSantriDashboard from "@/pages/dashboard/WaliSantriDashboard.tsx";
import AdministrasiDashboard from "@/pages/dashboard/AdministrasiDashboard.tsx";
import Login from "@/pages/auth/Login.tsx";
import Daftar from "@/pages/auth/Daftar.tsx";
import StafPage from "@/pages/manajemen-staf/StafPage";
import HakAksesPage from "@/pages/manajemen-staf/HakAksesPage";
import PeranPage from "@/pages/manajemen-staf/PeranPage";
import ManajemenSantriPage from "@/pages/manajemen-santri/ManajemenSantriPage";
import WaliSantriListPage from "@/pages/manajemen-santri/WaliSantriListPage";
import StaffDetailPage from "@/pages/manajemen-staf/StaffDetailPage";
import SantriDetailPage from "@/pages/manajemen-santri/SantriDetailPage";
import ProvinsiPage from "@/pages/data-wilayah/ProvinsiPage.tsx";
import KotaPage from "@/pages/data-wilayah/KotaPage.tsx";
import KecamatanPage from "@/pages/data-wilayah/KecamatanPage.tsx";
import DesaPage from "@/pages/data-wilayah/DesaPage.tsx"; // Import DesaPage
import { ThemeProvider } from "@/components/theme-provider";

// Redux imports
import { Provider } from 'react-redux';
import { store } from './store';

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
            <Route path="/dashboard/santri/:id" element={<SantriDetailPage />} />
            <Route path="/dashboard/wali-santri-list" element={<WaliSantriListPage />} />
            <Route path="/dashboard/wilayah/provinsi" element={<ProvinsiPage />} />
            <Route path="/dashboard/wilayah/kota" element={<KotaPage />} />
            <Route path="/dashboard/wilayah/kecamatan" element={<KecamatanPage />} />
            <Route path="/dashboard/wilayah/desa" element={<DesaPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </Provider>
);

export default App;