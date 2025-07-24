import React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import CustomBreadcrumb, { type BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { Users, UserPlus } from 'lucide-react';
import SantriWizardForm from './SantriWizardForm';
import { useNavigate } from 'react-router-dom';
import { showWarning } from '@/utils/toast'; // Updated import

const SantriFormPage: React.FC = () => {
  const navigate = useNavigate();

  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: 'Manajemen Santri', href: '/dashboard/santri', icon: <Users className="h-4 w-4" /> },
    { label: 'Tambah Santri', icon: <UserPlus className="h-4 w-4" /> },
  ];

  const handleSuccess = () => {
    navigate('/dashboard/santri');
  };

  const handleCancel = () => {
    navigate('/dashboard/santri');
    showWarning('Penambahan santri dibatalkan.'); // Updated call
  };

  return (
    <DashboardLayout title="Tambah Santri Baru" role="administrasi">
      <div className="container mx-auto pb-4 px-4">
        <CustomBreadcrumb items={breadcrumbItems} />
        <SantriWizardForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    </DashboardLayout>
  );
};

export default SantriFormPage;