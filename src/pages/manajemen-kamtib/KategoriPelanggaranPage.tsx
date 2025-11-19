import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import KategoriPelanggaranTable from './KategoriPelanggaranTable';
import CustomBreadcrumb, { BreadcrumbItemData } from '@/components/CustomBreadcrumb';

const KategoriPelanggaranPage: React.FC = () => {
  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: 'Tata Tertib', href: '/dashboard/manajemen-kamtib/pelanggaran' },
    { label: 'Kategori Pelanggaran' },
  ];

  return (
    <DashboardLayout title="Kategori Pelanggaran" role="administrasi">
      <CustomBreadcrumb items={breadcrumbItems} />
      <Card>
        <CardHeader>
          <CardTitle>Kategori Pelanggaran</CardTitle>
          <CardDescription>Kelola kategori pelanggaran (CRUD) untuk tata tertib.</CardDescription>
        </CardHeader>
        <CardContent>
          <KategoriPelanggaranTable />
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default KategoriPelanggaranPage;