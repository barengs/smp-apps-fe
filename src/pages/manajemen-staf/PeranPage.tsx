import React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PeranTable from './PeranTable'; // Import the new PeranTable

const PeranPage: React.FC = () => {
  return (
    <DashboardLayout title="Manajemen Peran" role="administrasi">
      <div className="container mx-auto py-4 px-4">
        <h2 className="text-2xl font-bold mb-4">Daftar Peran Pengguna</h2>
        <Card>
          <CardHeader>
            <CardTitle>Definisi Peran</CardTitle>
          </CardHeader>
          <CardContent>
            <PeranTable /> {/* Render the PeranTable component */}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PeranPage;