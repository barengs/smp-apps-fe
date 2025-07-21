import React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import CustomBreadcrumb, { type BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { Settings, Palette, User, Shield } from 'lucide-react';
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

const SettingsPage: React.FC = () => {
  const { theme, setTheme } = useTheme();

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

          {/* Pengaturan Profil */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profil Pengguna
              </CardTitle>
              <CardDescription>
                Kelola informasi profil Anda.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Nama: Nama Pengguna</p>
              <p className="text-sm text-muted-foreground">Email: pengguna@example.com</p>
              <Button variant="outline">Edit Profil</Button>
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