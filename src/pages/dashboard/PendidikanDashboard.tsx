import React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BookOpen, Building, Layers, Users, Loader2 } from 'lucide-react';
import { useGetPendidikanStatisticsQuery } from '../../store/slices/dashboardApi';

const PendidikanDashboard: React.FC = () => {
  const { data: response, isLoading, isError } = useGetPendidikanStatisticsQuery();

  if (isLoading) {
    return (
      <DashboardLayout title="Dashboard Manajemen Pendidikan" role="administrasi">
        <div className="flex h-[400px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (isError || !response || response.status !== 'success') {
    return (
      <DashboardLayout title="Dashboard Manajemen Pendidikan" role="administrasi">
        <div className="p-4 bg-red-50 text-red-600 rounded-lg">
          Gagal memuat data statistik pendidikan.
        </div>
      </DashboardLayout>
    );
  }

  const stats = response.data;

  return (
    <DashboardLayout title="Dashboard Manajemen Pendidikan" role="administrasi">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Manajemen Pendidikan</h2>
        <p className="text-gray-500">Ringkasan struktur organisasi pendidikan dan institusi.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Program</CardTitle>
            <BookOpen className="h-6 w-6 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_programs}</div>
          </CardContent>
        </Card>

        <Card className="transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jenjang / Institusi</CardTitle>
            <Building className="h-6 w-6 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_institutions}</div>
          </CardContent>
        </Card>

        <Card className="transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tingkat Kelas</CardTitle>
            <Layers className="h-6 w-6 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_classrooms}</div>
          </CardContent>
        </Card>

        <Card className="transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rombel</CardTitle>
            <Users className="h-6 w-6 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_class_groups}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 mb-6">
        {/* Distribusi Rombel per Institusi */}
        <Card>
          <CardHeader>
            <CardTitle>Sebaran Kelas & Rombel Berdasarkan Institusi</CardTitle>
            <CardDescription>Menampilkan daftar institusi pendidikan berserta informasi jumlah tingkat kelas dan kelompok belajarnya.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.institution_distribution.length > 0 ? (
                stats.institution_distribution.map((inst) => (
                  <div key={inst.id} className="p-4 border rounded-xl flex flex-col gap-3 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3 border-b pb-3">
                      <div className="bg-emerald-100 p-2 rounded-lg">
                        <Building className="h-5 w-5 text-emerald-600" />
                      </div>
                      <h4 className="font-semibold text-gray-800">{inst.name}</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm pt-1">
                      <div className="flex flex-col">
                        <span className="text-gray-500 mb-1">Tingkatan Kelas</span>
                        <div className="font-bold flex items-center gap-1">
                          <Layers className="h-3.5 w-3.5 text-blue-500" />
                          <span>{inst.classroom_count} Kelas</span>
                        </div>
                      </div>
                      <div className="flex flex-col border-l pl-2">
                        <span className="text-gray-500 mb-1">Total Rombel</span>
                        <div className="font-bold flex items-center gap-1">
                          <Users className="h-3.5 w-3.5 text-orange-500" />
                          <span>{inst.rombel_count} Rombel</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-8 text-center text-gray-500">
                  Tidak ada data institusi yang tersedia
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PendidikanDashboard;
