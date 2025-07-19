import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import WaliSantriDashboard from "./pages/WaliSantriDashboard";
import AdministrasiDashboard from "./pages/AdministrasiDashboard";
import Login from "./pages/Login";
import Daftar from "./pages/Daftar";
import StafPage from "./pages/StafPage"; // Import StafPage
import HakAksesPage from "./pages/HakAksesPage"; // Import HakAksesPage
import PeranPage from "./pages/PeranPage"; // Import PeranPage
import { ThemeProvider } from "./components/theme-provider"; // Import ThemeProvider

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme"> {/* Wrap with ThemeProvider */}
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
            <Route path="/dashboard/staf" element={<StafPage />} /> {/* Add route for StafPage */}
            <Route path="/dashboard/hak-akses" element={<HakAksesPage />} /> {/* Add route for HakAksesPage */}
            <Route path="/dashboard/peran" element={<PeranPage />} /> {/* Add route for PeranPage */}
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;