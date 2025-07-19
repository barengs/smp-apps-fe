import React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import WaliSantriTable from './WaliSantriTable'; // Import the new WaliSantriTable

const WaliSantriListPage: React.FC = () => {
  return (
    <DashboardLayout title="Manajemen Wali Santri" role="administrasi">
      <div className="container mx-auto pb-4 px-4">
        <h2 className="text-3xl font-bold mb-6">Daftar Wali Santri</h2>
        <Card>
          <CardHeader>
            <CardTitle>Informasi Wali Santri</CardTitle>
          </CardHeader>
          <CardContent>
            <WaliSantriTable /> {/* Render the WaliSantriTable component */}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default WaliSantriListPage;