import React, { useEffect, useRef } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import CustomBreadcrumb, { type BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { Settings, Palette, Shield, BookOpenText, Globe } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/theme-provider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { showSuccess, showError } from '@/utils/toast';
import { useTranslation } from 'react-i18next';
import { useGetControlPanelSettingsQuery } from '@/store/slices/controlPanelApi';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';

const SystemSettingsPage: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { i18n } = useTranslation();

  const { data: settings, isLoading, error } = useGetControlPanelSettingsQuery();
  const initialSettingsApplied = useRef(false); // Tambahkan useRef ini

  // Set initial theme and language from API data if available
  useEffect(() => {
    if (settings && !initialSettingsApplied.current) { // Periksa apakah pengaturan awal sudah diterapkan
      setTheme(settings.app_theme);
      i18n.changeLanguage(settings.app_language);
      initialSettingsApplied.current = true; // Tandai bahwa pengaturan awal sudah diterapkan
    }
  }, [settings, setTheme, i18n]);

  const handleSaveChanges = () => {
    showSuccess("Perubahan berhasil disimpan! (Simulasi)");
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: 'Pengaturan', href: '/dashboard/settings/system', icon: <Settings className="h-4 w-4" /> },
    { label: 'Sistem', icon: <Settings className="h-4 w-4" /> },
  ];

  if (isLoading) {
    return (
      <DashboardLayout title="Pengaturan Sistem" role="administrasi">
        <div className="container mx-auto py-4 px-4">
          <CustomBreadcrumb items={breadcrumbItems} />
          <div className="space-y-8 max-w-3xl mx-auto">
            <Card>
              <CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader>
              <CardContent className="space-y-6">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader>
              <CardContent className="space-y-6">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-10 w-32 self-end" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader>
              <CardContent className="space-y-6">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-32 self-end" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-10 w-48" />
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    showError("Gagal memuat pengaturan sistem.");
    return (
      <DashboardLayout title="Pengaturan Sistem" role="administrasi">
        <div className="container mx-auto py-4 px-4 text-center text-red-500">
          <p>Terjadi kesalahan saat memuat pengaturan sistem. Silakan coba lagi nanti.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Pengaturan Sistem" role="administrasi">
      <div className="container mx-auto py-4 px-4">
        <CustomBreadcrumb items={breadcrumbItems} />
        <div className="space-y-8 max-w-3xl mx-auto">
          {/* Pengaturan Tampilan */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Tampilan
              </CardTitle>
              <CardDescription>
                Sesuaikan tampilan aplikasi sesuai preferensi Anda.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="theme-select" className="text-base">Tema Aplikasi</Label>
                <Select value={theme} onValueChange={(value) => setTheme(value as "light" | "dark" | "system")}>
                  <SelectTrigger id="theme-select" className="w-[180px]">
                    <SelectValue placeholder="Pilih tema" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Terang</SelectItem>
                    <SelectItem value="dark">Gelap</SelectItem>
                    <SelectItem value="system">Sistem</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="language-select" className="text-base">Bahasa</Label>
                <Select value={i18n.language} onValueChange={changeLanguage}>
                  <SelectTrigger id="language-select" className="w-[180px]">
                    <SelectValue placeholder="Pilih bahasa" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="id">Bahasa Indonesia</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ar">العربية</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Pengaturan Profil Aplikasi */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpenText className="h-5 w-5" />
                Profil Aplikasi
              </CardTitle>
              <CardDescription>
                Kelola informasi dasar mengenai aplikasi Anda.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center shrink-0">
                  {settings?.app_logo ? (
                    <img src={settings.app_logo} alt="App Logo" className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <BookOpenText className="w-12 h-12 text-muted-foreground" />
                  )}
                </div>
                <div className="space-y-2 w-full">
                  <Label htmlFor="logo-upload">Logo Aplikasi</Label>
                  <Input id="logo-upload" type="file" className="max-w-xs" />
                  <p className="text-xs text-muted-foreground">Unggah file PNG atau JPG. Ukuran maks 1MB.</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="app-name">Nama Aplikasi</Label>
                <Input id="app-name" defaultValue={settings?.app_name || "Sistem Manajemen Pesantren"} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="app-description">Deskripsi Aplikasi</Label>
                <Textarea id="app-description" defaultValue={settings?.app_description || "Aplikasi komprehensif untuk mengelola semua aspek operasional pesantren secara digital."} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="app-version">Versi Aplikasi</Label>
                <Input id="app-version" defaultValue={settings?.app_version || "1.0.0"} readOnly />
              </div>
              <div className="space-y-2">
                <Label htmlFor="app-url">URL Aplikasi</Label>
                <Input id="app-url" defaultValue={settings?.app_url || ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="app-email">Email Kontak</Label>
                <Input id="app-email" type="email" defaultValue={settings?.app_email || ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="app-phone">Nomor Telepon</Label>
                <Input id="app-phone" defaultValue={settings?.app_phone || ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="app-address">Alamat</Label>
                <Textarea id="app-address" defaultValue={settings?.app_address || ""} />
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSaveChanges}>Simpan Perubahan</Button>
              </div>
            </CardContent>
          </Card>

          {/* Pengaturan Keamanan */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Keamanan
              </CardTitle>
              <CardDescription>
                Ubah kata sandi dan kelola pengaturan keamanan lainnya.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="maintenance-mode" className="text-base">Mode Pemeliharaan</Label>
                <Switch id="maintenance-mode" checked={settings?.is_maintenance_mode || false} />
              </div>
              {settings?.is_maintenance_mode && (
                <div className="space-y-2">
                  <Label htmlFor="maintenance-message">Pesan Pemeliharaan</Label>
                  <Textarea id="maintenance-message" defaultValue={settings?.maintenance_message || "Sistem sedang dalam pemeliharaan. Mohon maaf atas ketidaknyamanannya."} />
                </div>
              )}
              <Button variant="outline">Ubah Kata Sandi</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SystemSettingsPage;