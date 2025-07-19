import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "@/pages/landing/Index.tsx"; // Menggunakan alias @/
import NotFound from "@/pages/utility/NotFound.tsx"; // Menggunakan alias @/
import WaliSantriDashboard from "@/pages/dashboard/WaliSantriDashboard.tsx"; // Menggunakan alias @/
import AdministrasiDashboard from "@/pages/dashboard/AdministrasiDashboard.tsx"; // Menggunakan alias @/
import Login from "@/pages/auth/Login.tsx"; // Menggunakan alias @/
import Daftar from "@/pages/auth/Daftar.tsx"; // Menggunakan alias @/
import StafPage from "@/pages/manajemen-staf/StafPage";
import HakAksesPage from "@/pages/manajemen-staf/HakAksesPage";
import PeranPage from "@/pages/manajemen-staf/PeranPage";
import ManajemenSantriPage from "@/pages/manajemen-santri/ManajemenSantriPage";
import WaliSantriListPage from "@/pages/manajemen-santri/WaliSantriListPage";
import { ThemeProvider } from "@/components/theme-provider";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
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
  </QueryClientProvider>
);

export default App;