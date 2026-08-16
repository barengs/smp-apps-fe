import React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';

const PendidikanDashboard: React.FC = () => {
  return (
    <DashboardLayout title="Dashboard Manajemen Pendidikan" role="administrasi">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Manajemen Pendidikan</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Selamat datang di Dashboard Manajemen Pendidikan.</p>
          </CardContent>
        </Card>
      </div>
      <div className="p-4 bg-white dark:bg-zinc-900 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Informasi</h2>
        <p className="text-sm text-gray-500">Modul ini digunakan untuk mengelola data pendidikan seperti Program, Tahun Ajaran, Jenjang, Kelas, dan Rombel.</p>
      </div>
    </DashboardLayout>
  );
};

export default PendidikanDashboard;
