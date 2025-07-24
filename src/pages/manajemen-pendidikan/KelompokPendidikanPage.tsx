import React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import CustomBreadcrumb, { type BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { GraduationCap, Compass } from 'lucide-react';
import KelompokPendidikanTable from './KelompokPendidikanTable';

const KelompokPendidikanPage: React.FC = () => {
  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: 'Manajemen Pendidikan', href: '/dashboard/pendidikan/program', icon: <GraduationCap className="h-4 w-4" /> },
    { label: 'Kelompok Pendidikan', icon: <Compass className="h-4 w-4" /> },
  ];

  return (
    <DashboardLayout title="Manajemen Kelompok Pendidikan" role="administrasi">
      <div className="container mx-auto py-4 px-4">
        <CustomBreadcrumb items={breadcrumbItems} />
        <Card>
          <CardHeader>
            <CardTitle>Informasi Kelompok Pendidikan</CardTitle>
            <CardDescription>Kelola daftar kelompok pendidikan yang tersedia di sistem.</CardDescription>
          </CardHeader>
          <CardContent>
            <KelompokPendidikanTable />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default KelompokPendidikanPage;