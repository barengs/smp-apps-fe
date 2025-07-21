import React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import CustomBreadcrumb, { type BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { Users, UserPlus } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetStudentByIdQuery } from '@/store/slices/studentApi';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import SantriWizardForm from './SantriWizardForm'; // Import the new wizard form

const SantriFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const santriId = isEditMode ? parseInt(id || '', 10) : undefined;

  // Note: The wizard form is currently designed for ADDING new santri/parent.
  // For EDIT mode, you would need to fetch both parent and student data
  // and pass them as initialData to the respective steps of the wizard.
  // For simplicity, this implementation will only support 'add' via wizard.
  // 'Edit' will still use the old single-form approach if it were to be re-implemented.
  // For now, we'll disable edit mode for the wizard.
  if (isEditMode) {
    toast.info("Mode edit untuk santri saat ini tidak didukung oleh formulir wizard. Silakan gunakan fitur detail untuk melihat.");
    navigate('/dashboard/santri');
    return null;
  }

  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: 'Manajemen Santri', href: '/dashboard/santri', icon: <Users className="h-4 w-4" /> },
    { label: 'Daftar Santri', href: '/dashboard/santri', icon: <UserPlus className="h-4 w-4" /> },
    { label: 'Tambah Santri', icon: <UserPlus className="h-4 w-4" /> },
  ];

  const handleSuccess = () => {
    navigate('/dashboard/santri');
  };

  const handleCancel = () => {
    navigate('/dashboard/santri');
  };

  return (
    <DashboardLayout title="Tambah Data Santri" role="administrasi">
      <div className="container mx-auto pb-4 px-4">
        <CustomBreadcrumb items={breadcrumbItems} />
        <SantriWizardForm
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </DashboardLayout>
  );
};

export default SantriFormPage;