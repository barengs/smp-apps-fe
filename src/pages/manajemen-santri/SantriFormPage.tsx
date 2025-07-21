import React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import CustomBreadcrumb, { type BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { Users, UserPlus } from 'lucide-react';
import SantriForm from './SantriForm';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetStudentByIdQuery } from '@/store/slices/studentApi';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

const SantriFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const santriId = isEditMode ? parseInt(id || '', 10) : undefined;

  const { data: responseData, isLoading, error } = useGetStudentByIdQuery(santriId!, {
    skip: !isEditMode, // Skip query if not in edit mode
  });

  const santriData = responseData?.data;

  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: 'Manajemen Santri', href: '/dashboard/santri', icon: <Users className="h-4 w-4" /> },
    { label: 'Daftar Santri', href: '/dashboard/santri', icon: <UserPlus className="h-4 w-4" /> },
    { label: isEditMode ? 'Edit Santri' : 'Tambah Santri', icon: <UserPlus className="h-4 w-4" /> },
  ];

  if (isEditMode && isLoading) {
    return (
      <DashboardLayout title="Memuat Santri..." role="administrasi">
        <div className="container mx-auto py-4 px-4">
          <CustomBreadcrumb items={breadcrumbItems} />
          <Card>
            <CardHeader>
              <Skeleton className="h-7 w-1/3" />
              <Skeleton className="h-4 w-2/3" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-24 w-full" />
              <div className="flex justify-end space-x-2">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-32" />
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (isEditMode && error) {
    toast.error('Gagal memuat data santri untuk diedit.');
    navigate('/dashboard/santri');
    return null;
  }

  const handleSuccess = () => {
    navigate('/dashboard/santri');
  };

  const handleCancel = () => {
    navigate('/dashboard/santri');
  };

  return (
    <DashboardLayout title={isEditMode ? "Edit Data Santri" : "Tambah Data Santri"} role="administrasi">
      <div className="container mx-auto pb-4 px-4">
        <CustomBreadcrumb items={breadcrumbItems} />
        <Card>
          <CardHeader>
            <CardTitle>{isEditMode ? "Edit Data Santri" : "Tambah Data Santri"}</CardTitle>
            <CardDescription>
              {isEditMode ? "Ubah informasi detail santri ini." : "Isi formulir di bawah untuk menambahkan santri baru."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SantriForm
              initialData={isEditMode ? santriData : undefined}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SantriFormPage;