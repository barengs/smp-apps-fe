import React from 'react';
import DashboardLayout from '../layouts/DashboardLayout.tsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const StafPage: React.FC = () => {
  return (
    <DashboardLayout title="Manajemen Staf" role="administrasi">
      <div className="container mx-auto pb-4 px-4"> {/* Changed py-4 to pb-4 to remove top padding */}
        <h2 className="text-3xl font-bold mb-6">Daftar Staf</h2>
        <Card>
          <CardHeader>
            <CardTitle>Informasi Staf</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Di sini akan ditampilkan daftar staf pesantren.</p>
            {/* Placeholder for staf list, table, or other components */}
            <div className="mt-4 p-4 border rounded-md bg-gray-50">
              <p className="text-gray-600">Fitur daftar staf akan segera hadir.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StafPage;