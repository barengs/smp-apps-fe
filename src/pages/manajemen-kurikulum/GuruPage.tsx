import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import CustomBreadcrumb, { type BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { User } from 'lucide-react';

const GuruPage: React.FC = () => {
  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: 'Dashboard', href: '/dashboard/administrasi' },
    { label: 'Manajemen Kurikulum', href: '/dashboard/manajemen-kurikulum/mata-pelajaran' },
    { label: 'Guru', icon: <User className="h-4 w-4" /> },
  ];

  return (
    <DashboardLayout title="Manajemen Guru" role="administrasi">
      <div className="container mx-auto px-4 pb-4">
        <CustomBreadcrumb items={breadcrumbItems} />
        <Card>
          <CardHeader>
            <CardTitle>Manajemen Guru</CardTitle>
            <CardDescription>Kelola data guru di sini.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Halaman untuk manajemen data guru akan segera tersedia.</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default GuruPage;