import React from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PeranPage: React.FC = () => {
  return (
    <DashboardLayout title="Manajemen Peran" role="administrasi">
      <div className="container mx-auto py-4 px-4"> {/* Added px-4 to reduce horizontal padding */}
        <h2 className="text-3xl font-bold mb-6">Daftar Peran Pengguna</h2>
        <Card>
          <CardHeader>
            <CardTitle>Definisi Peran</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Di sini akan ditampilkan daftar peran pengguna yang tersedia.</p>
            {/* Placeholder for roles list, permissions, or other components */}
            <div className="mt-4 p-4 border rounded-md bg-gray-50">
              <p className="text-gray-600">Fitur manajemen peran akan segera hadir.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PeranPage;