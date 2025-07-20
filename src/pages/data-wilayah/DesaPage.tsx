import React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import DesaTable from './DesaTable.tsx';

const DesaPage: React.FC = () => {
  return (
    <DashboardLayout title="Manajemen Desa" role="administrasi">
      <div className="container mx-auto py-4 px-4">
        <h2 className="text-3xl font-bold mb-6">Daftar Desa</h2>
        <Card>
          <CardHeader>
            <CardTitle>Informasi Desa</CardTitle>
            <CardDescription>Kelola daftar desa yang tersedia di sistem.</CardDescription>
          </CardHeader>
          <CardContent>
            <DesaTable />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DesaPage;