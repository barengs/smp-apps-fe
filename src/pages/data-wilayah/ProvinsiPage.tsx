import React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import ProvinsiTable from './ProvinsiTable.tsx';
import CustomBreadcrumb, { type BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { Map, Landmark } from 'lucide-react';

const ProvinsiPage: React.FC = () => {
  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: 'Data Wilayah', href: '/dashboard/wilayah/provinsi', icon: <Map className="h-4 w-4" /> },
    { label: 'Provinsi', icon: <Landmark className="h-4 w-4" /> },
  ];

  return (
    <DashboardLayout title="Manajemen Provinsi" role="administrasi">
      <div className="container mx-auto py-4 px-4">
        <CustomBreadcrumb items={breadcrumbItems} />
        <Card>
          <CardHeader>
            <CardTitle>Informasi Provinsi</CardTitle>
            <CardDescription>Kelola daftar provinsi yang tersedia di sistem.</CardDescription>
          </CardHeader>
          <CardContent>
            <ProvinsiTable />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ProvinsiPage;