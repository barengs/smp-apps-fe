import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import CustomBreadcrumb, { type BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { Settings, Save, UploadCloud, FileImage } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useGetStudentCardSettingsQuery, useUpdateStudentCardSettingsMutation, StudentCardSettings } from '@/store/slices/studentCardApi';
import { Skeleton } from '@/components/ui/skeleton';
import { showSuccess, showError } from '@/utils/toast';
import { useTranslation } from 'react-i18next';

const StudentCardTemplateSettingsPage: React.FC = () => {
  const { t } = useTranslation();
  const { data: apiResponse, isLoading, isError, refetch } = useGetStudentCardSettingsQuery();
  const settings = apiResponse?.data;
  const [updateSettings, { isLoading: isUpdating }] = useUpdateStudentCardSettingsMutation();

  const [files, setFiles] = useState<{ [key in keyof StudentCardSettings]?: File | null }>({});
  const [previews, setPreviews] = useState<{ [key in keyof StudentCardSettings]?: string | null }>({});

  const STORAGE_BASE_URL = import.meta.env.VITE_STORAGE_BASE_URL;

  useEffect(() => {
    if (settings) {
      const newPreviews: any = {};
      (['front_template', 'back_template', 'stamp', 'signature'] as const).forEach(key => {
        if (settings[key]) {
          newPreviews[key] = `${STORAGE_BASE_URL}${settings[key]}`;
        }
      });
      setPreviews(newPreviews);
    }
  }, [settings, STORAGE_BASE_URL]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, key: keyof StudentCardSettings) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showError('File harus berupa gambar.');
        return;
      }
      setFiles(prev => ({ ...prev, [key]: file }));
      setPreviews(prev => ({ ...prev, [key]: URL.createObjectURL(file) }));
    }
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    let hasChanges = false;

    Object.keys(files).forEach(key => {
      const file = files[key as keyof StudentCardSettings];
      if (file) {
        formData.append(key, file);
        hasChanges = true;
      }
    });

    if (!hasChanges) {
      showError('Tidak ada perubahan gambar untuk disimpan.');
      return;
    }

    try {
      await updateSettings(formData).unwrap();
      showSuccess('Template kartu santri berhasil diperbarui!');
      setFiles({});
      refetch();
    } catch (err) {
      console.error('Gagal memperbarui template:', err);
      showError('Gagal memperbarui template. Silakan coba lagi.');
    }
  };

  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: t('sidebar.settings'), icon: <Settings className="h-4 w-4" /> },
    { label: t('sidebar.studentCardTemplate') || 'Template Kartu Santri', href: '/dashboard/settings/student-card-template', icon: <FileImage className="h-4 w-4" /> },
  ];

  if (isLoading) {
    return (
      <DashboardLayout title={t('sidebar.studentCardTemplate') || 'Template Kartu Santri'} role="administrasi">
        <div className="p-4">
          <Skeleton className="h-8 w-1/3 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-64 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (isError) {
    return (
       <DashboardLayout title={t('sidebar.studentCardTemplate') || 'Template Kartu Santri'} role="administrasi">
        <div className="p-4 text-center text-red-500">
          <p>Gagal memuat pengaturan template kartu.</p>
          <Button onClick={() => refetch()} className="mt-4">Coba Lagi</Button>
        </div>
      </DashboardLayout>
    );
  }

  const renderUploadCard = (label: string, key: keyof StudentCardSettings, description: string) => (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{label}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center min-h-[200px] bg-muted/20 relative overflow-hidden">
           {previews[key] ? (
            <img 
              src={previews[key] || ''} 
              alt={`${label} Preview`} 
              className="max-h-[180px] w-auto object-contain z-10" 
            />
          ) : (
            <div className="text-muted-foreground flex flex-col items-center">
              <FileImage className="h-10 w-10 mb-2" />
              <span>Belum ada gambar</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Input 
            type="file" 
            accept="image/*" 
            className="cursor-pointer"
            onChange={(e) => handleFileChange(e, key)} 
          />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout title={t('sidebar.studentCardTemplate') || 'Template Kartu Santri'} role="administrasi">
      <div className="p-4 pb-20">
        <CustomBreadcrumb items={breadcrumbItems} />
        
        <div className="flex justify-between items-center mt-6 mb-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Pengaturan Template Kartu</h1>
              <p className="text-muted-foreground">Kelola gambar template depan, belakang, stempel, dan tanda tangan kartu santri.</p>
            </div>
            <Button onClick={handleSubmit} disabled={isUpdating || Object.keys(files).length === 0} variant="success">
              <Save className="mr-2 h-4 w-4" /> {isUpdating ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {renderUploadCard('Template Depan', 'front_template', 'Gambar latar belakang untuk sisi depan kartu santri.')}
          {renderUploadCard('Template Belakang', 'back_template', 'Gambar latar belakang untuk sisi belakang kartu santri.')}
          {renderUploadCard('Stempel', 'stamp', 'Gambar stempel resmi yayasan/sekolah (transparan direkomendasikan).')}
          {renderUploadCard('Tanda Tangan', 'signature', 'Gambar tanda tangan kepala sekolah/pimpinan (transparan direkomendasikan).')}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentCardTemplateSettingsPage;
