import React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Users, Briefcase, GraduationCap, UserCheck } from 'lucide-react';
import { useGetDashboardStatsQuery } from '@/store/slices/dashboardApi';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';

const StatCard: React.FC<{ title: string; value: number; icon: React.ReactNode; description?: string }> = ({ title, value, icon, description }) => (
  <Card className="transition-all hover:shadow-md">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </CardContent>
  </Card>
);

const StatCardSkeleton: React.FC = () => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-6 w-6" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-7 w-1/3 mb-2" />
      <Skeleton className="h-3 w-full" />
    </CardContent>
  </Card>
);

const AdministrasiDashboard: React.FC = () => {
  const { data: dashboardData, error, isLoading } = useGetDashboardStatsQuery();

  return (
    <DashboardLayout title="Dashboard Administrasi" role="administrasi">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : error ? (
          <div className="col-span-full text-red-500">Gagal memuat data statistik.</div>
        ) : (
          <>
            <Link to="/dashboard/santri">
              <StatCard
                title="Total Santri"
                value={dashboardData?.santri ?? 0}
                icon={<Users className="h-6 w-6 text-muted-foreground" />}
                description="Jumlah santri aktif saat ini"
              />
            </Link>
            <Link to="/dashboard/staf">
              <StatCard
                title="Total Asatidz"
                value={dashboardData?.asatidz ?? 0}
                icon={<Briefcase className="h-6 w-6 text-muted-foreground" />}
                description="Jumlah staf pengajar"
              />
            </Link>
            <StatCard
              title="Total Alumni"
              value={dashboardData?.alumni ?? 0}
              icon={<GraduationCap className="h-6 w-6 text-muted-foreground" />}
              description="Jumlah santri yang telah lulus"
            />
            <StatCard
              title="Guru Tugas"
              value={dashboardData?.tugasan ?? 0}
              icon={<UserCheck className="h-6 w-6 text-muted-foreground" />}
              description="Santri yang sedang magang"
            />
          </>
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Tindakan Cepat</h2>
        <div className="flex flex-wrap gap-4">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Tambah Santri Baru
          </Button>
          <Button variant="outline">
            Lihat Laporan Keuangan
          </Button>
          <Button variant="secondary">
            Kelola Pengumuman
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdministrasiDashboard;