import React from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const HakAksesPage: React.FC = () => {
  return (
    <DashboardLayout title="Manajemen Hak Akses" role="administrasi">
      <div className="container mx-auto py-4">
        <h2 className="text-3xl font-bold mb-6">Pengaturan Hak Akses</h2>
        <Card>
          <CardHeader>
            <CardTitle>Daftar Hak Akses</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Di sini akan ditampilkan pengaturan hak akses untuk berbagai peran.</p>
            {/* Placeholder for access control list, roles, or other components */}
            <div className="mt-4 p-4 border rounded-md bg-gray-50">
              <p className="text-gray-600">Fitur pengaturan hak akses akan segera hadir.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default HakAksesPage;