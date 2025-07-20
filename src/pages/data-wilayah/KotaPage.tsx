import React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import KotaTable from './KotaTable.tsx';
import CustomBreadcrumb, { type BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { Map, Building2 } from 'lucide-react';

const KotaPage: React.FC = () => {
  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: 'Data Wilayah', href: '/dashboard/wilayah/provinsi', icon: <Map className="h-4 w-4" /> },
    { label: 'Kota', icon: <Building2 className="h-4 w-4" /> },
  ];

  return (
    <DashboardLayout title="Manajemen Kota" role="administrasi">
      <div className="container mx-auto py-4 px-4">
        <CustomBreadcrumb items={breadcrumbItems} />
        <Card>
          <CardHeader>
            <CardTitle>Informasi Kota</CardTitle>
            <CardDescription>Kelola daftar kota yang tersedia di sistem.</CardDescription>
          </CardHeader>
          <CardContent>
            <KotaTable />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default KotaPage;