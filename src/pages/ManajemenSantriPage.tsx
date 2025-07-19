import React from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
            <p>Di sini akan ditampilkan daftar santri pesantren.</p>
            <div className="mt-4 p-4 border rounded-md bg-gray-50">
              <p className="text-gray-600">Fitur daftar santri akan segera hadir.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ManajemenSantriPage;