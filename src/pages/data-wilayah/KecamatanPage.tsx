import React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import KecamatanTable from './KecamatanTable.tsx';
import CustomBreadcrumb, { type BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { Map, Tent } from 'lucide-react';

const KecamatanPage: React.FC = () => {
  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: 'Data Wilayah', href: '/dashboard/wilayah/provinsi', icon: <Map className="h-4 w-4" /> },
    { label: 'Kecamatan', icon: <Tent className="h-4 w-4" /> },
  ];

  return (
    <DashboardLayout title="Manajemen Kecamatan" role="administrasi">
      <div className="container mx-auto py-4 px-4">
        <CustomBreadcrumb items={breadcrumbItems} />
        <Card>
          <CardHeader>
            <CardTitle>Informasi Kecamatan</CardTitle>
            <CardDescription>Kelola daftar kecamatan yang tersedia di sistem.</CardDescription>
          </CardHeader>
          <CardContent>
            <KecamatanTable />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default KecamatanPage;