import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import CustomBreadcrumb, { type BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { Settings, Edit, X, Save, Camera, Info, Phone, Mail, MapPin, Globe as GlobeIcon, Server, ToggleLeft, MessageSquare, Palette, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGetControlPanelSettingsQuery, useUpdateControlPanelSettingsMutation, type ControlPanelSettings } from '@/store/slices/controlPanelApi';
import { Skeleton } from '@/components/ui/skeleton';
import { showSuccess, showError } from '@/utils/toast';
import { useTranslation } from 'react-i18next';
import { Separator } from '@/components/ui/separator';

const AppProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const { data: apiResponse, isLoading, isError, refetch } = useGetControlPanelSettingsQuery(); // Mengubah nama variabel menjadi apiResponse
  const settings = apiResponse?.data; // Mengambil data sebenarnya dari properti 'data'
  const [updateSettings, { isLoading: isUpdating }] = useUpdateControlPanelSettingsMutation();

  const [isEditMode, setIsEditMode] = useState(false);
  const [formState, setFormState] = useState<Partial<ControlPanelSettings>>({});
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [largeLogoPreview, setLargeLogoPreview] = useState<string | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);

  useEffect(() => {
    if (settings) { // Menggunakan 'settings' yang sudah di-unwrap
      setFormState(settings);
      if (settings.app_logo) {
        setLogoPreview(`https://api-smp.umediatama.com/storage/uploads/logos/small/${settings.app_logo}`);
        setLargeLogoPreview(`https://api-smp.umediatama.com/storage/uploads/logos/large/${settings.app_logo}`);
      } else {
        setLogoPreview(null);
        setLargeLogoPreview(null);
      }
      if (settings.app_favicon) {
        setFaviconPreview(`https://api-smp.umediatama.com/storage/uploads/logos/${settings.app_favicon}`);
      } else {
        setFaviconPreview(null);
      }
    }
  }, [settings]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormState(prev => ({ ...prev, [id]: value }));
  };

  const handleSwitchChange = (checked: boolean, id: keyof ControlPanelSettings) => {
    setFormState(prev => ({ ...prev, [id]: checked }));
  };

  const handleSelectChange = (value: string, id: keyof ControlPanelSettings) => {
    setFormState(prev => ({ ...prev, [id]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'favicon') => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === 'logo') {
        setLogoFile(file);
        setLogoPreview(URL.createObjectURL(file));
      } else {
        if (!file.name.toLowerCase().endsWith('.ico')) {
          showError('Format favicon tidak valid. Harap unggah berkas dengan ekstensi .ico');
          e.target.value = ''; // Reset input file
          return;
        }
        setFaviconFile(file);
        setFaviconPreview(URL.createObjectURL(file));
      }
    }
  };

  const handleCancel = () => {
    if (settings) { // Menggunakan 'settings' yang sudah di-unwrap
      setFormState(settings);
      if (settings.app_logo) {
        setLogoPreview(`https://api-smp.umediatama.com/storage/uploads/logos/small/${settings.app_logo}`);
        setLargeLogoPreview(`https://api-smp.umediatama.com/storage/uploads/logos/large/${settings.app_logo}`);
      } else {
        setLogoPreview(null);
        setLargeLogoPreview(null);
      }
      if (settings.app_favicon) {
        setFaviconPreview(`https://api-smp.umediatama.com/storage/uploads/logos/${settings.app_favicon}`);
      } else {
        setFaviconPreview(null);
      }
    }
    setLogoFile(null);
    setFaviconFile(null);
    setIsEditMode(false);
  };

  const handleSubmit = async () => {
    if (!settings?.id) { // Menggunakan 'settings' yang sudah di-unwrap
      showError("ID profil aplikasi tidak ditemukan untuk melakukan pembaruan.");
      return;
    }

    const formData = new FormData();
    
    Object.keys(formState).forEach(key => {
        const typedKey = key as keyof ControlPanelSettings;
        const value = formState[typedKey];
        
        if (typedKey === 'app_logo' || typedKey === 'app_favicon' || typedKey === 'id') return;

        if (typedKey === 'is_maintenance_mode') {
            formData.append(typedKey, value ? 'true' : 'false'); // Mengubah dari '1'/'0' menjadi 'true'/'false'
        } else if (value !== null && value !== undefined) {
            formData.append(typedKey, String(value));
        }
    });

    if (logoFile) {
      formData.append('app_logo', logoFile);
    }
    if (faviconFile) {
      formData.append('app_favicon', faviconFile);
    }

    formData.append('_method', 'PUT');

    console.log("Data yang dikirim:");
    for (const [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    try {
      await updateSettings({ id: settings.id, formData }).unwrap(); // Menggunakan 'settings' yang sudah di-unwrap
      showSuccess('Profil aplikasi berhasil diperbarui!');
      setIsEditMode(false);
      setLogoFile(null);
      setFaviconFile(null);
      refetch();
    } catch (err) {
      console.error('Gagal memperbarui profil aplikasi:', err);
      showError('Gagal memperbarui profil aplikasi. Periksa konsol untuk detail.');
    }
  };

  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: t('sidebar.settings'), icon: <Settings className="h-4 w-4" /> },
    { label: t('sidebar.appProfile'), href: '/dashboard/settings/app-profile', icon: <Info className="h-4 w-4" /> },
  ];

  const renderDetailItem = (icon: React.ReactNode, label: string, value: string | React.ReactNode | null | undefined, className = "") => (
    <div className={`flex items-start space-x-4 ${className}`}>
      <div className="flex-shrink-0 text-muted-foreground pt-1">{icon}</div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <div className="text-base font-semibold">{value || '-'}</div>
      </div>
    </div>
  );

  const renderFormItem = (label: string, children: React.ReactNode, className = "") => (
    <div className={`grid grid-cols-1 md:grid-cols-3 items-center gap-2 md:gap-4 ${className}`}>
      <Label className="md:text-right">{label}</Label>
      <div className="md:col-span-2">{children}</div>
    </div>
  );

  if (isLoading) {
    return (
      <DashboardLayout title={t('sidebar.appProfile')} role="administrasi">
        <div className="p-4">
          <Skeleton className="h-8 w-1/2 mb-6" />
          <Card>
            <CardHeader><Skeleton className="h-6 w-1/4 mb-2" /><Skeleton className="h-4 w-1/2" /></CardHeader>
            <CardContent className="space-y-6"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /><Skeleton className="h-24 w-full" /></CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (isError) {
    return (
      <DashboardLayout title={t('sidebar.appProfile')} role="administrasi">
        <div className="p-4 text-center text-red-500">
          <p>Gagal memuat data profil aplikasi.</p>
          <Button onClick={() => refetch()} className="mt-4">Coba Lagi</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={t('sidebar.appProfile')} role="administrasi">
      <div className="p-4">
        <CustomBreadcrumb items={breadcrumbItems} />
        <Card className="mt-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Profil Aplikasi</CardTitle>
              <CardDescription>Lihat dan kelola informasi dasar aplikasi.</CardDescription>
            </div>
            {!isEditMode ? (
              <Button onClick={() => setIsEditMode(true)}><Edit className="mr-2 h-4 w-4" /> Edit</Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleCancel}><X className="mr-2 h-4 w-4" /> Batal</Button>
                <Button onClick={handleSubmit} disabled={isUpdating} variant="success">
                  <Save className="mr-2 h-4 w-4" /> {isUpdating ? 'Menyimpan...' : 'Simpan'}
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {isEditMode ? (
              <div className="space-y-8 max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {renderFormItem("Logo", 
                    <div className="flex items-center gap-4">
                      {logoPreview ? (
                        <img src={logoPreview} alt="Logo Preview" className="h-16 w-16 object-contain rounded bg-muted p-1" />
                      ) : (
                        <div className="h-16 w-16 bg-muted rounded flex items-center justify-center">
                          <Camera className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      <Input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'logo')} />
                    </div>
                  )}
                  {renderFormItem("Favicon", 
                    <div className="flex items-center gap-4">
                      {faviconPreview ? (
                        <img src={faviconPreview} alt="Favicon Preview" className="h-16 w-16 object-contain rounded bg-muted p-1" />
                      ) : (
                        <div className="h-16 w-16 bg-muted rounded flex items-center justify-center">
                          <Camera className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      <Input type="file" accept=".ico" onChange={(e) => handleFileChange(e, 'favicon')} />
                    </div>
                  )}
                </div>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  {renderFormItem("Nama Aplikasi", <Input id="app_name" value={formState.app_name || ''} onChange={handleInputChange} />)}
                  {renderFormItem("Versi", <Input id="app_version" value={formState.app_version || ''} onChange={handleInputChange} />)}
                  {renderFormItem("URL", <Input id="app_url" value={formState.app_url || ''} onChange={handleInputChange} />)}
                  {renderFormItem("Email", <Input id="app_email" type="email" value={formState.app_email || ''} onChange={handleInputChange} />)}
                  {renderFormItem("Telepon", <Input id="app_phone" value={formState.app_phone || ''} onChange={handleInputChange} />)}
                  {renderFormItem("Tema", 
                    <Select value={formState.app_theme} onValueChange={(value) => handleSelectChange(value, 'app_theme')}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="light">Terang</SelectItem><SelectItem value="dark">Gelap</SelectItem><SelectItem value="system">Sistem</SelectItem></SelectContent>
                    </Select>
                  )}
                  {renderFormItem("Bahasa", 
                    <Select value={formState.app_language} onValueChange={(value) => handleSelectChange(value, 'app_language')}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="indonesia">Indonesia</SelectItem><SelectItem value="english">English</SelectItem><SelectItem value="arabic">Arabic</SelectItem></SelectContent>
                    </Select>
                  )}
                  {renderFormItem("Mode Pemeliharaan", 
                    <div className="flex items-center gap-4">
                      <Switch id="is_maintenance_mode" checked={formState.is_maintenance_mode} onCheckedChange={(checked) => handleSwitchChange(checked, 'is_maintenance_mode')} />
                      <Label htmlFor="is_maintenance_mode">Aktifkan</Label>
                    </div>
                  )}
                  {renderFormItem("Alamat", <Textarea id="app_address" value={formState.app_address || ''} onChange={handleInputChange} />, "md:col-span-2")}
                  {renderFormItem("Deskripsi", <Textarea id="app_description" value={formState.app_description || ''} onChange={handleInputChange} />, "md:col-span-2")}
                  {formState.is_maintenance_mode && renderFormItem("Pesan Pemeliharaan", <Textarea id="maintenance_message" value={formState.maintenance_message || ''} onChange={handleInputChange} />, "md:col-span-2")}
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {renderDetailItem(<Camera className="h-5 w-5" />, "Logo", largeLogoPreview ? (
                    <img src={largeLogoPreview} alt="Logo" className="h-20 object-contain bg-muted p-1 rounded" />
                  ) : (
                    <div className="h-20 w-20 bg-muted rounded flex items-center justify-center">
                      <Camera className="h-10 w-10 text-muted-foreground" />
                    </div>
                  ))}
                  {renderDetailItem(<Camera className="h-5 w-5" />, "Favicon", faviconPreview ? (
                    <img src={faviconPreview} alt="Favicon" className="h-20 object-contain bg-muted p-1 rounded" />
                  ) : (
                    <div className="h-20 w-20 bg-muted rounded flex items-center justify-center">
                      <Camera className="h-10 w-10 text-muted-foreground" />
                    </div>
                  ))}
                </div>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {renderDetailItem(<Info className="h-5 w-5" />, "Nama Aplikasi", settings?.app_name)}
                  {renderDetailItem(<Server className="h-5 w-5" />, "Versi", settings?.app_version)}
                  {renderDetailItem(<GlobeIcon className="h-5 w-5" />, "URL", <a href={settings?.app_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{settings?.app_url}</a>)}
                  {renderDetailItem(<Mail className="h-5 w-5" />, "Email", settings?.app_email)}
                  {renderDetailItem(<Phone className="h-5 w-5" />, "Telepon", settings?.app_phone)}
                  {renderDetailItem(<Palette className="h-5 w-5" />, "Tema", settings?.app_theme)}
                  {renderDetailItem(<Languages className="h-5 w-5" />, "Bahasa", settings?.app_language)}
                  {renderDetailItem(<ToggleLeft className="h-5 w-5" />, "Mode Pemeliharaan", settings?.is_maintenance_mode ? 'Aktif' : 'Tidak Aktif')}
                  {renderDetailItem(<MapPin className="h-5 w-5" />, "Alamat", settings?.app_address, "md:col-span-2")}
                  {renderDetailItem(<Info className="h-5 w-5" />, "Deskripsi", <p className="whitespace-pre-wrap">{settings?.app_description}</p>, "md:col-span-2")}
                  {settings?.is_maintenance_mode && renderDetailItem(<MessageSquare className="h-5 w-5" />, "Pesan Pemeliharaan", settings?.maintenance_message, "md:col-span-2")}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AppProfilePage;