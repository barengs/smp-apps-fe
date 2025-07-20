import React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import KotaTable from './KotaTable.tsx';

const KotaPage: React.FC = () => {
  return (
    <DashboardLayout title="Manajemen Kota" role="administrasi">
      <div className="container mx-auto py-4 px-4">
        <h2 className="text-3xl font-bold mb-6">Daftar Kota</h2>
        <Card>
          <CardHeader>
            <CardTitle>Informasi Kota</CardTitle>
            <CardDescription>Kelola daftar kota yang tersedia di sistem.</CardDescription>
          </CardHeader>
          <CardContent>
            <KotaTable />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default KotaPage;