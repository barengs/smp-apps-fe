import React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import AsramaTable from './AsramaTable';
import CustomBreadcrumb, { type BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { Home, BedDouble } from 'lucide-react';

const AsramaPage: React.FC = () => {
  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: 'Kepesantrenan', href: '/dashboard/kepesantrenan/asrama', icon: <Home className="h-4 w-4" /> },
    { label: 'Asrama', icon: <BedDouble className="h-4 w-4" /> },
  ];

  return (
    <DashboardLayout title="Manajemen Asrama" role="administrasi">
      <div className="container mx-auto py-4 px-4">
        <CustomBreadcrumb items={breadcrumbItems} />
        <Card>
          <CardHeader>
            <CardTitle>Informasi Asrama</CardTitle>
            <CardDescription>Kelola daftar asrama yang tersedia di sistem.</CardDescription>
          </CardHeader>
          <CardContent>
            <AsramaTable />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AsramaPage;