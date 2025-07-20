import React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import HakAksesTable from './HakAksesTable'; // Import the new HakAksesTable

const HakAksesPage: React.FC = () => {
  return (
    <DashboardLayout title="Manajemen Hak Akses" role="administrasi">
      <div className="container mx-auto py-4 px-4">
        <h2 className="text-2xl font-bold mb-4">Pengaturan Hak Akses</h2>
        <Card>
          <CardHeader>
            <CardTitle>Daftar Hak Akses</CardTitle>
          </CardHeader>
          <CardContent>
            <HakAksesTable /> {/* Render the HakAksesTable component */}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default HakAksesPage;