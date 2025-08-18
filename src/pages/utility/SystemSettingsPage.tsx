import React, { useEffect, useState } from 'react';
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
import { showSuccess, showError } from '@/utils/toast';
import { useTranslation } from 'react-i18next';
import { useGetControlPanelSettingsQuery, useUpdateControlPanelSettingsMutation, type ControlPanelSettings } from '@/store/slices/controlPanelApi';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';

const languageMapping: { [key: string]: string } = {
  indonesia: 'id',
  english: 'en',
  arabic: 'ar',
};

const SystemSettingsPage: React.FC = () => {
  const { setTheme } = useTheme();
  const { i18n } = useTranslation();
  const { data: settings, isLoading, error } = useGetControlPanelSettingsQuery();
  const [updateSettings, { isLoading: isUpdating }] = useUpdateControlPanelSettingsMutation();

  const [formState, setFormState] = useState<Partial<ControlPanelSettings>>({});
  const [logoFile, setLogoFile] = useState<File | null>(null);

  useEffect(() => {
    if (settings) {
      setFormState(settings);
    }
  }, [settings]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormState(prev => ({ ...prev, [id]: value }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const previewUrl = URL.createObjectURL(file);
      setFormState(prev => ({ ...prev, app_logo: previewUrl }));
    }
  };

  const handleSwitchChange = (checked: boolean, id: keyof ControlPanelSettings) => {
    setFormState(prev => ({ ...prev, [id]: checked }));
  };

  const handleSelectChange = (value: string, id: keyof ControlPanelSettings) => {
    setFormState(prev => ({ ...prev, [id]: value }));
    if (id === 'app_theme') {
      setTheme(value as 'light' | 'dark' | 'system');
    }
    if (id === 'app_language') {
      const i18nCode = languageMapping[value];
      if (i18nCode) {
        i18n.changeLanguage(i18nCode);
      }
    }
  };

  const handleSaveChanges = async () => {
    const formData = new FormData();

    // Append all text, boolean, and numeric fields explicitly
    formData.append('app_name', formState.app_name || '');
    formData.append('app_version', formState.app_version || '');
    formData.append('app_description', formState.app_description || '');
    formData.append('app_url', formState.app_url || '');
    formData.append('app_email', formState.app_email || '');
    formData.append('app_phone', formState.app_phone || '');
    formData.append('app_address', formState.app_address || '');
    formData.append('is_maintenance_mode', formState.is_maintenance_mode ? '1' : '0');
    formData.append('maintenance_message', formState.maintenance_message || '');
    formData.append('app_theme', formState.app_theme || 'system');
    formData.append('app_language', formState.app_language || 'indonesia');
    
    // Append favicon URL if it exists
    if (formState.app_favicon) {
        formData.append('app_favicon', formState.app_favicon);
    }

    // Append the new logo file if it has been selected
    if (logoFile) {
      formData.append('app_logo', logoFile);
    }

    try {
      await updateSettings(formData).unwrap();
      showSuccess("Perubahan berhasil disimpan!");
      setLogoFile(null);
    } catch (err) {
      showError("Gagal menyimpan perubahan.");
      console.error(err);
    }
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
            {/* Skeleton loaders */}
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
              <CardTitle className="flex items-center gap-2"><Palette /> Tampilan</CardTitle>
              <CardDescription>Sesuaikan tampilan dan bahasa aplikasi.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="app_theme" className="text-base">Tema Aplikasi</Label>
                <Select value={formState.app_theme} onValueChange={(value) => handleSelectChange(value, 'app_theme')}>
                  <SelectTrigger id="app_theme" className="w-[180px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Terang</SelectItem>
                    <SelectItem value="dark">Gelap</SelectItem>
                    <SelectItem value="system">Sistem</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="app_language" className="text-base">Bahasa</Label>
                <Select value={formState.app_language} onValueChange={(value) => handleSelectChange(value, 'app_language')}>
                  <SelectTrigger id="app_language" className="w-[180px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="indonesia">Bahasa Indonesia</SelectItem>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="arabic">العربية</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Pengaturan Profil Aplikasi */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><BookOpenText /> Profil Aplikasi</CardTitle>
              <CardDescription>Kelola informasi dasar mengenai aplikasi Anda.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center shrink-0">
                  {formState.app_logo ? (
                    <img src={formState.app_logo} alt="App Logo" className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <BookOpenText className="w-12 h-12 text-muted-foreground" />
                  )}
                </div>
                <div className="space-y-2 w-full">
                  <Label htmlFor="app_logo_upload">Unggah Logo Baru</Label>
                  <Input id="app_logo_upload" type="file" accept="image/*" onChange={handleLogoChange} />
                  <p className="text-xs text-muted-foreground">Ganti logo aplikasi. Biarkan kosong jika tidak ingin mengubah.</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="app_name">Nama Aplikasi</Label>
                <Input id="app_name" value={formState.app_name || ''} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="app_description">Deskripsi Aplikasi</Label>
                <Textarea id="app_description" value={formState.app_description || ''} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="app_version">Versi Aplikasi</Label>
                <Input id="app_version" value={formState.app_version || ''} readOnly />
              </div>
              <div className="space-y-2">
                <Label htmlFor="app_url">URL Aplikasi</Label>
                <Input id="app_url" value={formState.app_url || ''} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="app_email">Email Kontak</Label>
                <Input id="app_email" type="email" value={formState.app_email || ''} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="app_phone">Nomor Telepon</Label>
                <Input id="app_phone" value={formState.app_phone || ''} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="app_address">Alamat</Label>
                <Textarea id="app_address" value={formState.app_address || ''} onChange={handleInputChange} />
              </div>
            </CardContent>
          </Card>

          {/* Pengaturan Keamanan */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Shield /> Keamanan</CardTitle>
              <CardDescription>Kelola mode pemeliharaan.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="is_maintenance_mode" className="text-base">Mode Pemeliharaan</Label>
                <Switch id="is_maintenance_mode" checked={formState.is_maintenance_mode || false} onCheckedChange={(checked) => handleSwitchChange(checked, 'is_maintenance_mode')} />
              </div>
              {formState.is_maintenance_mode && (
                <div className="space-y-2">
                  <Label htmlFor="maintenance_message">Pesan Pemeliharaan</Label>
                  <Textarea id="maintenance_message" value={formState.maintenance_message || ''} onChange={handleInputChange} />
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSaveChanges} variant="success" disabled={isUpdating}>
              {isUpdating ? 'Menyimpan...' : 'Simpan Semua Perubahan'}
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SystemSettingsPage;