import React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import KelasTable from './KelasTable';
import CustomBreadcrumb, { type BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { GraduationCap, School } from 'lucide-react';

const KelasPage: React.FC = () => {
  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: 'Manajemen Pendidikan', href: '/dashboard/pendidikan/program', icon: <GraduationCap className="h-4 w-4" /> },
    { label: 'Kelas', icon: <School className="h-4 w-4" /> },
  ];

  return (
    <DashboardLayout title="Manajemen Kelas" role="administrasi">
      <div className="container mx-auto py-4 px-4">
        <CustomBreadcrumb items={breadcrumbItems} />
        <Card>
          <CardHeader>
            <CardTitle>Informasi Kelas</CardTitle>
            <CardDescription>Kelola daftar kelas yang tersedia di sistem.</CardDescription>
          </CardHeader>
          <CardContent>
            <KelasTable />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default KelasPage;