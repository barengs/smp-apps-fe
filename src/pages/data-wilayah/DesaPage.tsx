import React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import DesaTable from './DesaTable.tsx';
import CustomBreadcrumb, { type BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { Map, Home } from 'lucide-react';

const DesaPage: React.FC = () => {
  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: 'Data Wilayah', href: '/dashboard/wilayah/provinsi', icon: <Map className="h-4 w-4" /> },
    { label: 'Desa', icon: <Home className="h-4 w-4" /> },
  ];

  return (
    <DashboardLayout title="Manajemen Desa" role="administrasi">
      <div className="container mx-auto py-4 px-4">
        <CustomBreadcrumb items={breadcrumbItems} />
        <Card>
          <CardHeader>
            <CardTitle>Informasi Desa</CardTitle>
            <CardDescription>Kelola daftar desa yang tersedia di sistem.</CardDescription>
          </CardHeader>
          <CardContent>
            <DesaTable />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DesaPage;