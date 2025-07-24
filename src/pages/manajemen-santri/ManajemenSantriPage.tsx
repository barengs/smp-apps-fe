import React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SantriTable from './SantriTable';
import CustomBreadcrumb, { type BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { Users, UserCheck, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const ManajemenSantriPage: React.FC = () => {
  const navigate = useNavigate();

  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: 'Manajemen Santri', href: '/dashboard/santri', icon: <Users className="h-4 w-4" /> },
    { label: 'Daftar Santri', icon: <UserCheck className="h-4 w-4" /> },
  ];

  const handleAddSantri = () => {
    navigate('/dashboard/santri/add');
  };

  return (
    <DashboardLayout title="Manajemen Santri" role="administrasi">
      <div className="container mx-auto pb-4 px-4">
        <CustomBreadcrumb items={breadcrumbItems} />
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Informasi Santri</CardTitle>
            <Button onClick={handleAddSantri}>
              <PlusCircle className="mr-2 h-4 w-4" /> Tambah Santri Baru
            </Button>
          </CardHeader>
          <CardContent>
            <SantriTable onAddData={handleAddSantri} />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ManajemenSantriPage;