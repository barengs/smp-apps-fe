import React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StaffTable from './StaffTable'; // Updated import path

const StafPage: React.FC = () => {
  return (
    <DashboardLayout title="Manajemen Staf" role="administrasi">
      <div className="container mx-auto pb-4 px-4">
        <h2 className="text-3xl font-bold mb-6">Daftar Staf</h2>
        <Card>
          <CardHeader>
            <CardTitle>Informasi Staf</CardTitle>
          </CardHeader>
          <CardContent>
            <StaffTable /> {/* Render the StaffTable component */}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StafPage;