import React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import KecamatanTable from './KecamatanTable.tsx';

const KecamatanPage: React.FC = () => {
  return (
    <DashboardLayout title="Manajemen Kecamatan" role="administrasi">
      <div className="container mx-auto py-4 px-4">
        <h2 className="text-3xl font-bold mb-6">Daftar Kecamatan</h2>
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