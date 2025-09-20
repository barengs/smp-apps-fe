import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useGetEmployeeByIdQuery } from '@/store/slices/employeeApi';
import * as toast from '@/utils/toast';
import StaffForm from './StaffForm';
import CustomBreadcrumb, { type BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { Briefcase, UsersRound, User, Edit } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const StaffEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const staffId = parseInt(id || '', 10);

  if (isNaN(staffId)) {
    toast.showError('ID staf tidak valid.');
    navigate('/dashboard/staf');
    return null;
  }

  const { data: responseData, error, isLoading } = useGetEmployeeByIdQuery(staffId);

  const staffData = responseData?.data;
  const fullName = staffData ? `${staffData.first_name || ''} ${staffData.last_name || ''}`.trim() : 'Edit Staf';

  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: 'Manajemen Staf', href: '/dashboard/staf', icon: <Briefcase className="h-4 w-4" /> },
    { label: 'Daftar Staf', href: '/dashboard/staf', icon: <UsersRound className="h-4 w-4" /> },
    { label: fullName, href: `/dashboard/staf/${staffId}`, icon: <User className="h-4 w-4" /> },
    { label: 'Edit', icon: <Edit className="h-4 w-4" /> },
  ];

  const handleSuccess = () => {
    toast.showSuccess('Data staf berhasil diperbarui.');
    navigate(`/dashboard/staf/${staffId}`); // Navigate back to detail page
  };

  const handleCancel = () => {
    navigate(`/dashboard/staf/${staffId}`); // Navigate back to detail page
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Edit Staf" role="administrasi">
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
              <Skeleton className="h-24 w-full" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="flex justify-end space-x-2">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !staffData) {
    toast.showError('Gagal memuat data staf untuk diedit atau staf tidak ditemukan.');
    navigate('/dashboard/staf');
    return null;
  }

  // Prepare initialData for StaffForm
  const initialFormData = {
    id: staffData.id,
    staff: {
      first_name: staffData.first_name,
      last_name: staffData.last_name,
      code: staffData.code,
      nik: staffData.nik,
      phone: staffData.phone,
      address: staffData.address,
      zip_code: staffData.zip_code,
    },
    email: staffData.email,
    roles: staffData.user?.roles || [],
    username: staffData.user?.name || '',
  };

  return (
    <DashboardLayout title="Edit Staf" role="administrasi">
      <div className="container mx-auto pb-4 px-4">
        <CustomBreadcrumb items={breadcrumbItems} />
        <Card>
          <CardHeader>
            <CardTitle>Edit Informasi Staf</CardTitle>
            <CardDescription>Ubah detail staf ini.</CardDescription>
          </CardHeader>
          <CardContent>
            <StaffForm
              initialData={initialFormData}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StaffEditPage;