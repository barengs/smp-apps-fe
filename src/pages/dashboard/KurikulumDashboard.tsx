import React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BookOpen, Users, GraduationCap, CalendarClock, UserCheck, UserX, Stethoscope, BriefcaseMedical, Loader2 } from 'lucide-react';
import { useGetKurikulumStatisticsQuery } from '../../store/slices/dashboardApi';
import { Progress } from '@/components/ui/progress';

const KurikulumDashboard: React.FC = () => {
  const { data: response, isLoading, isError } = useGetKurikulumStatisticsQuery();

  if (isLoading) {
    return (
      <DashboardLayout title="Dashboard Manajemen Kurikulum" role="administrasi">
        <div className="flex h-[400px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (isError || !response || response.status !== 'success') {
    return (
      <DashboardLayout title="Dashboard Manajemen Kurikulum" role="administrasi">
        <div className="p-4 bg-red-50 text-red-600 rounded-lg">
          Gagal memuat data statistik.
        </div>
      </DashboardLayout>
    );
  }

  const stats = response.data;
  const attendance = stats.attendance_today;

  return (
    <DashboardLayout title="Dashboard Manajemen Kurikulum" role="administrasi">
      
      {/* Header Info */}
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Tahun Ajaran: {stats.academic_year}</h2>
          <p className="text-gray-500">Ringkasan aktivitas akademik dan pengajaran hari ini.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pegawai & Guru</CardTitle>
            <Users className="h-6 w-6 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_teachers}</div>
          </CardContent>
        </Card>

        <Card className="transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Mata Pelajaran</CardTitle>
            <BookOpen className="h-6 w-6 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_subjects}</div>
          </CardContent>
        </Card>

        <Card className="transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rombongan Belajar</CardTitle>
            <GraduationCap className="h-6 w-6 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_rombel}</div>
          </CardContent>
        </Card>

        <Card className="transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Siswa Aktif</CardTitle>
            <Users className="h-6 w-6 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_students}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Attendance Matrix */}
        <Card className="lg:col-span-1 flex flex-col">
          <CardHeader>
            <CardTitle>Kehadiran Hari Ini</CardTitle>
            <CardDescription>
              Tingkat kehadiran siswa harian
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center">
            <div className="space-y-6">
              <div className="text-center mb-4">
                <div className="text-4xl font-extrabold text-blue-600 mb-2">
                  {attendance.rate}%
                </div>
                <p className="text-sm font-medium text-gray-500">Tingkat Kehadiran</p>
                <Progress value={attendance.rate} className="h-3 mt-3 w-full" />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-green-600">
                    <UserCheck className="h-4 w-4" />
                    <span className="text-sm font-semibold">Hadir</span>
                  </div>
                  <span className="text-lg font-bold">{attendance.hadir}</span>
                </div>
                
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-yellow-600">
                    <CalendarClock className="h-4 w-4" />
                    <span className="text-sm font-semibold">Izin</span>
                  </div>
                  <span className="text-lg font-bold">{attendance.izin}</span>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-blue-500">
                    <Stethoscope className="h-4 w-4" />
                    <span className="text-sm font-semibold">Sakit</span>
                  </div>
                  <span className="text-lg font-bold">{attendance.sakit}</span>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-red-500">
                    <UserX className="h-4 w-4" />
                    <span className="text-sm font-semibold">Alpa</span>
                  </div>
                  <span className="text-lg font-bold">{attendance.alpa}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rombel List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Sebaran Siswa Per Rombel</CardTitle>
            <CardDescription>Rincian data jumlah siswa pada masing-masing rombongan belajar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-[350px] overflow-y-auto pr-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {stats.rombel_details.length > 0 ? (
                  stats.rombel_details.map((rombel) => (
                    <div key={rombel.id} className="flex justify-between items-center p-3 border rounded-lg bg-gray-50/50">
                      <div>
                        <div className="font-semibold text-gray-800">{rombel.name}</div>
                        <div className="text-xs text-gray-500">Tingkat: {rombel.tingkat}</div>
                      </div>
                      <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-bold">
                        {rombel.student_count}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-6 text-gray-500">
                    Belum ada data rombongan belajar
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

    </DashboardLayout>
  );
};

export default KurikulumDashboard;
