import React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import ProvinsiTable from './ProvinsiTable.tsx';

const ProvinsiPage: React.FC = () => {
  return (
    <DashboardLayout title="Manajemen Provinsi" role="administrasi">
      <div className="container mx-auto py-4 px-4">
        <h2 className="text-3xl font-bold mb-6">Daftar Provinsi</h2>
        <Card>
          <CardHeader>
            <CardTitle>Informasi Provinsi</CardTitle>
            <CardDescription>Kelola daftar provinsi yang tersedia di sistem.</CardDescription>
          </CardHeader>
          <CardContent>
            <ProvinsiTable />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ProvinsiPage;