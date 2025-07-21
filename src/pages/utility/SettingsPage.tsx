import React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import CustomBreadcrumb, { type BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { Settings, Palette, Shield, BookOpenText } from 'lucide-react';
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
import { toast } from 'sonner';

const SettingsPage: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const handleSaveChanges = () => {
    toast.success("Perubahan berhasil disimpan! (Simulasi)");
  };

  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: 'Pengaturan', icon: <Settings className="h-4 w-4" /> },
  ];

  return (
    <DashboardLayout title="Pengaturan" role="administrasi">
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
            <CardContent className="space-y-4">
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
                  <BookOpenText className="w-12 h-12 text-muted-foreground" />
                </div>
                <div className="space-y-2 w-full">
                  <Label htmlFor="logo-upload">Logo Aplikasi</Label>
                  <Input id="logo-upload" type="file" className="max-w-xs" />
                  <p className="text-xs text-muted-foreground">Unggah file PNG atau JPG. Ukuran maks 1MB.</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="app-name">Nama Aplikasi</Label>
                <Input id="app-name" defaultValue="Sistem Manajemen Pesantren" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="app-description">Deskripsi Aplikasi</Label>
                <Textarea id="app-description" defaultValue="Aplikasi komprehensif untuk mengelola semua aspek operasional pesantren secara digital." />
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
            <CardContent>
              <Button variant="outline">Ubah Kata Sandi</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;