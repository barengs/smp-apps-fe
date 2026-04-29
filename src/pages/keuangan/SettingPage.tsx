import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import CustomBreadcrumb from '@/components/CustomBreadcrumb';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Settings, 
  CreditCard, 
  Store, 
  Save, 
  Loader2, 
  ShieldCheck, 
  Globe, 
  Info,
  Lock,
  ExternalLink
} from 'lucide-react';
import { useGetSettingsQuery, useUpdateSettingsMutation } from '@/store/slices/settingApi';
import * as toast from '@/utils/toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const SettingPage: React.FC = () => {
  const { data: settingsByGroup, isLoading } = useGetSettingsQuery();
  const [updateSettings, { isLoading: isUpdating }] = useUpdateSettingsMutation();

  const [formState, setFormState] = useState<{ [key: string]: string | null }>({});

  useEffect(() => {
    if (settingsByGroup) {
      const initialState: { [key: string]: string | null } = {};
      Object.values(settingsByGroup).flat().forEach(s => {
        initialState[s.key] = s.value === '••••••••' ? '' : s.value;
      });
      setFormState(initialState);
    }
  }, [settingsByGroup]);

  const handleInputChange = (key: string, value: string) => {
    setFormState(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveGroup = async (group: string) => {
    const groupSettings = settingsByGroup?.[group] || [];
    const settingsToUpdate = groupSettings.map(s => ({
      key: s.key,
      value: formState[s.key] === '' && s.is_secret ? null : formState[s.key],
    })).filter(s => s.value !== null || !groupSettings.find(gs => gs.key === s.key)?.is_secret);

    try {
      await updateSettings({ settings: settingsToUpdate }).unwrap();
      toast.showSuccess(`Pengaturan ${group} berhasil disimpan`);
    } catch (err: any) {
      toast.showError(err?.data?.message || 'Gagal menyimpan pengaturan');
    }
  };

  const breadcrumbItems = [
    { label: 'Bank Santri' },
    { label: 'Pengaturan' },
  ];

  if (isLoading) {
    return (
      <DashboardLayout title="Pengaturan Bank Santri" role="administrasi">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Konfigurasi Sistem Bank Santri" role="administrasi">
      <CustomBreadcrumb items={breadcrumbItems} />
      
      <div className="container mx-auto mt-6 max-w-4xl space-y-8">
        
        {/* Midtrans Configuration */}
        <Card className="border-2 shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50 dark:bg-slate-900/50 border-b">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle>Integrasi Midtrans</CardTitle>
                  <CardDescription>Konfigurasi payment gateway untuk top-up otomatis.</CardDescription>
                </div>
              </div>
              <Button 
                size="sm" 
                onClick={() => handleSaveGroup('midtrans')} 
                disabled={isUpdating}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Simpan
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <Alert className="bg-blue-50/50 border-blue-100 flex items-start gap-3">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-xs text-blue-800">
                Pastikan Anda sudah mendaftarkan akun di <a href="https://midtrans.com" target="_blank" rel="noreferrer" className="underline font-bold">Midtrans Dashboard</a>. 
                Webhook URL yang harus didaftarkan: <code className="bg-white px-1 border rounded">{import.meta.env.VITE_BANK_API_BASE_URL}midtrans/webhook</code>
              </AlertDescription>
            </Alert>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  Server Key <Lock className="h-3 w-3 text-muted-foreground" />
                </Label>
                <Input 
                  type="password"
                  placeholder="SB-Mid-server-..."
                  value={formState['midtrans_server_key'] || ''}
                  onChange={(e) => handleInputChange('midtrans_server_key', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Client Key</Label>
                <Input 
                  placeholder="SB-Mid-client-..."
                  value={formState['midtrans_client_key'] || ''}
                  onChange={(e) => handleInputChange('midtrans_client_key', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Merchant ID</Label>
                <Input 
                  placeholder="G123456789"
                  value={formState['midtrans_merchant_id'] || ''}
                  onChange={(e) => handleInputChange('midtrans_merchant_id', e.target.value)}
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/40 rounded-lg border">
                <div className="space-y-0.5">
                  <Label>Mode Produksi</Label>
                  <p className="text-xs text-muted-foreground">Aktifkan jika menggunakan akun Live Midtrans.</p>
                </div>
                <Switch 
                  checked={formState['midtrans_is_production'] === 'true'}
                  onCheckedChange={(checked) => handleInputChange('midtrans_is_production', checked ? 'true' : 'false')}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Koperasi Configuration */}
        <Card className="border-2 shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50 dark:bg-slate-900/50 border-b">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                  <Store className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle>Keamanan Koperasi</CardTitle>
                  <CardDescription>Otorisasi akses untuk terminal kasir koperasi.</CardDescription>
                </div>
              </div>
              <Button 
                size="sm" 
                onClick={() => handleSaveGroup('koperasi')} 
                disabled={isUpdating}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Simpan
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  Koperasi API Key <ShieldCheck className="h-3 w-3 text-purple-600" />
                </Label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Masukkan sandi rahasia untuk kasir..."
                    value={formState['koperasi_api_key'] || ''}
                    onChange={(e) => handleInputChange('koperasi_api_key', e.target.value)}
                  />
                  <Button variant="outline" onClick={() => handleInputChange('koperasi_api_key', Math.random().toString(36).substring(2, 12).toUpperCase())}>
                    Generate
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground">Sandi ini digunakan oleh terminal kasir (pos) untuk mengakses data saldo santri.</p>
              </div>
              <div className="space-y-2">
                <Label>Nama Outlet Default</Label>
                <Input 
                  placeholder="Koperasi Pusat Pesantren"
                  value={formState['koperasi_outlet_name'] || ''}
                  onChange={(e) => handleInputChange('koperasi_outlet_name', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* General Pesantren Info */}
        <Card className="border-2 shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50 dark:bg-slate-900/50 border-b">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                  <Globe className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle>Identitas Lembaga</CardTitle>
                  <CardDescription>Data yang akan tampil pada struk dan laporan.</CardDescription>
                </div>
              </div>
              <Button 
                size="sm" 
                onClick={() => handleSaveGroup('general')} 
                disabled={isUpdating}
                className="bg-amber-600 hover:bg-amber-700"
              >
                {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Simpan
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label>Nama Pesantren</Label>
              <Input 
                value={formState['pesantren_name'] || ''}
                onChange={(e) => handleInputChange('pesantren_name', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Alamat Lengkap</Label>
              <Input 
                value={formState['pesantren_address'] || ''}
                onChange={(e) => handleInputChange('pesantren_address', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

      </div>
    </DashboardLayout>
  );
};

export default SettingPage;
