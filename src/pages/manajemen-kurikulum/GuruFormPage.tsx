import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import CustomBreadcrumb, { type BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import * as toast from '@/utils/toast';

const GuruFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: 'Dashboard', href: '/dashboard/administrasi' },
    { label: 'Manajemen Kurikulum', href: '/dashboard/manajemen-kurikulum/mata-pelajaran' },
    { label: 'Guru', href: '/dashboard/manajemen-kurikulum/guru' },
    { label: isEdit ? 'Edit Guru' : 'Tambah Guru', icon: <ArrowLeft className="h-4 w-4" /> },
  ];

  const handleSubmit = () => {
    // Placeholder for form submission logic
    toast.showSuccess(`Guru ${isEdit ? 'diperbarui' : 'ditambahkan'}!`);
    navigate('/dashboard/manajemen-kurikulum/guru');
  };

  return (
    <DashboardLayout title={isEdit ? "Edit Guru" : "Tambah Guru"} role="administrasi">
      <div className="container mx-auto px-4 pb-4">
        <CustomBreadcrumb items={breadcrumbItems} />
        <Card>
          <CardHeader>
            <CardTitle>{isEdit ? "Edit Data Guru" : "Tambah Data Guru"}</CardTitle>
            <CardDescription>
              {isEdit ? "Perbarui informasi guru." : "Tambahkan guru baru ke sistem."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Form untuk {isEdit ? "mengedit" : "menambah"} data guru akan segera tersedia di sini.</p>
            <div className="mt-4 flex justify-end space-x-2">
              <Button variant="outline" onClick={() => navigate('/dashboard/manajemen-kurikulum/guru')}>
                Batal
              </Button>
              <Button onClick={handleSubmit}>
                {isEdit ? "Simpan Perubahan" : "Tambah Guru"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default GuruFormPage;