import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import CustomBreadcrumb, { type BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { UserCheck } from 'lucide-react';

const PenugasanGuruPage: React.FC = () => {
  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: 'Dashboard', href: '/dashboard/administrasi' },
    { label: 'Manajemen Kurikulum', href: '/dashboard/manajemen-kurikulum/mata-pelajaran' },
    { label: 'Penugasan Guru', icon: <UserCheck className="h-4 w-4" /> },
  ];

  return (
    <DashboardLayout title="Penugasan Guru" role="administrasi">
      <div className="container mx-auto px-4 pb-4">
        <CustomBreadcrumb items={breadcrumbItems} />
        <Card>
          <CardHeader>
            <CardTitle>Manajemen Penugasan Guru</CardTitle>
            <CardDescription>Halaman ini akan digunakan untuk mengelola penugasan guru.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Konten untuk manajemen penugasan guru akan ditambahkan di sini.</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PenugasanGuruPage;