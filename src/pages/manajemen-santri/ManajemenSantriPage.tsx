import React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SantriTable from '@/components/SantriTable'; // Import SantriTable

const ManajemenSantriPage: React.FC = () => {
  return (
    <DashboardLayout title="Manajemen Santri" role="administrasi">
      <div className="container mx-auto pb-4 px-4">
        <h2 className="text-3xl font-bold mb-6">Daftar Santri</h2>
        <Card>
          <CardHeader>
            <CardTitle>Informasi Santri</CardTitle>
          </CardHeader>
          <CardContent>
            <SantriTable /> {/* Render the SantriTable component */}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ManajemenSantriPage;