import React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import TahunAjaranTable from './TahunAjaranTable';
import CustomBreadcrumb, { type BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { GraduationCap, Calendar } from 'lucide-react';

const TahunAjaranPage: React.FC = () => {
  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: 'Manajemen Pendidikan', href: '/dashboard/pendidikan/tahun-ajaran', icon: <GraduationCap className="h-4 w-4" /> },
    { label: 'Tahun Ajaran', icon: <Calendar className="h-4 w-4" /> },
  ];

  return (
    <DashboardLayout title="Manajemen Tahun Ajaran" role="administrasi">
      <div className="container mx-auto py-4 px-4">
        <CustomBreadcrumb items={breadcrumbItems} />
        <Card>
          <CardHeader>
            <CardTitle>Informasi Tahun Ajaran</CardTitle>
            <CardDescription>Kelola daftar tahun ajaran yang tersedia di sistem.</CardDescription>
          </CardHeader>
          <CardContent>
            <TahunAjaranTable />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default TahunAjaranPage;