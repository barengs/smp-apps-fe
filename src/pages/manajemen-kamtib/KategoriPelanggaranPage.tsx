import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import KategoriPelanggaranTable from './KategoriPelanggaranTable';

const KategoriPelanggaranPage: React.FC = () => {
  return (
    <DashboardLayout title="Kategori Pelanggaran" role="administrasi">
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