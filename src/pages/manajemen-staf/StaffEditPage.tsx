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
  const staff = staffData?.staff; // Changed from 'employee' to 'staff'
  const fullName = staff ? `${staff.first_name || ''} ${staff.last_name || ''}`.trim() : 'Edit Staf'; // Changed from 'employee' to 'staff'

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

  if (error || !staffData || !staff) { // Changed from 'employee' to 'staff'
    toast.showError('Gagal memuat data staf untuk diedit atau staf tidak ditemukan.');
    navigate('/dashboard/staf');
    return null;
  }

  // Prepare initialData for StaffForm
  const initialFormData = {
    id: staffData.id,
    staff: { // Changed from 'employee' to 'staff'
      first_name: staff.first_name, // Changed from 'employee' to 'staff'
      last_name: staff.last_name, // Changed from 'employee' to 'staff'
      code: staff.code, // Changed from 'employee' to 'staff'
      nik: staff.nik, // Changed from 'employee' to 'staff'
      phone: staff.phone, // Changed from 'employee' to 'staff'
      address: staff.address, // Changed from 'employee' to 'staff'
      zip_code: staff.zip_code, // Changed from 'employee' to 'staff'
    },
    email: staff.email, // Corrected: Access email from staff object
    roles: staffData.roles,
    username: staffData.username, // Tambahkan username dari staffData
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