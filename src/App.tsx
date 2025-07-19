import { Toaster } from "@/components/ui/toaster";
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
import { ThemeProvider } from "@/components/theme-provider";

// Redux imports
import { Provider } from 'react-redux';
import { store } from './store'; // Import the Redux store

// Import hooks from new slices (even if not directly used here, ensures injection)
import { useGetSantriQuery } from './store/slices/santriApi'; // Corrected import path
import { useGetRolesQuery } from './store/slices/roleApi'; // Corrected import path


const App = () => (
  <Provider store={store}> {/* Membungkus aplikasi dengan Redux Provider */}
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/daftar" element={<Daftar />} />
            <Route path="/dashboard/wali-santri" element={<WaliSantriDashboard />} />
            <Route path="/dashboard/administrasi" element={<AdministrasiDashboard />} />
            <Route path="/dashboard/staf" element={<StafPage />} />
            <Route path="/dashboard/hak-akses" element={<HakAksesPage />} />
            <Route path="/dashboard/peran" element={<PeranPage />} />
            <Route path="/dashboard/santri" element={<ManajemenSantriPage />} />
            <Route path="/dashboard/wali-santri-list" element={<WaliSantriListPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </Provider>
);

export default App;