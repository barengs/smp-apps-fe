import React, { useState, useEffect } from 'react'; // Import useState and useEffect
import DashboardLayout from '../../layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Users, Briefcase, GraduationCap, UserCheck, UserPlus } from 'lucide-react'; // Import UserPlus
import { useGetDashboardStatsQuery } from '@/store/slices/dashboardApi';
import { useGetCalonSantriQuery } from '@/store/slices/calonSantriApi'; // Import useGetCalonSantriQuery
import { Skeleton } from '@/components/ui/skeleton';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import EventCalendar from '@/components/EventCalendar';
import { useGetActivitiesQuery } from '@/store/slices/activityApi';
import { Kegiatan } from '@/types/kegiatan';
import { format } from 'date-fns';
import ActivityDetailModal from '@/components/ActivityDetailModal';
import { useSelector } from 'react-redux'; // Import useSelector
import { selectIsAuthenticated } from '@/store/slices/authSlice'; // Import selectIsAuthenticated

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
  const isAuthenticated = useSelector(selectIsAuthenticated); // Dapatkan status autentikasi
  const navigate = useNavigate(); // Inisialisasi useNavigate

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/'); // Arahkan ke halaman utama jika belum login
    }
  }, [isAuthenticated, navigate]);

  const { data: dashboardData, error, isLoading } = useGetDashboardStatsQuery();
  const { data: activitiesData, isLoading: isLoadingActivities, isError: isErrorActivities } = useGetActivitiesQuery();
  const { data: calonSantriData, isLoading: isLoadingCalonSantri, isError: isErrorCalonSantri } = useGetCalonSantriQuery(); // Fetch calon santri data

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false); // State untuk modal
  const [selectedKegiatan, setSelectedKegiatan] = useState<Kegiatan | null>(null); // State untuk kegiatan yang dipilih

  const kegiatanList: Kegiatan[] = React.useMemo(() => {
    if (!activitiesData?.data) return [];
    return activitiesData.data.map(apiKegiatan => ({
      id: apiKegiatan.id,
      date: new Date(apiKegiatan.date),
      name: apiKegiatan.name,
      description: apiKegiatan.description,
      status: apiKegiatan.status === 'inactive' ? 'Selesai' : 'Belum Selesai',
    }));
  }, [activitiesData]);

  const handleDateClick = (date: Date) => {
    console.log('Date clicked on dashboard calendar:', format(date, 'yyyy-MM-dd'));
  };

  const handleEventClick = (kegiatan: Kegiatan) => {
    setSelectedKegiatan(kegiatan);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedKegiatan(null);
  };

  if (!isAuthenticated) {
    return null; // Jangan render apa pun jika tidak diautentikasi (pengalihan akan terjadi)
  }

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
                value={dashboardData?.data?.santri ?? 0} // Mengakses melalui .data
                icon={<Users className="h-6 w-6 text-muted-foreground" />}
                description="Jumlah santri aktif saat ini"
              />
            </Link>
            <Link to="/dashboard/staf">
              <StatCard
                title="Total Asatidz"
                value={dashboardData?.data?.asatidz ?? 0} // Mengakses melalui .data
                icon={<Briefcase className="h-6 w-6 text-muted-foreground" />}
                description="Jumlah staf pengajar"
              />
            </Link>
            {isLoadingCalonSantri ? (
              <StatCardSkeleton />
            ) : isErrorCalonSantri ? (
              <div className="col-span-1 text-red-500">Gagal memuat data calon santri.</div>
            ) : (
              <Link to="/dashboard/pendaftaran-santri">
                <StatCard
                  title="Total Santri Baru"
                  value={calonSantriData?.data?.total ?? 0} // Mengakses total dari data paginasi
                  icon={<UserPlus className="h-6 w-6 text-muted-foreground" />}
                  description="Jumlah pendaftar santri baru"
                />
              </Link>
            )}
            <StatCard
              title="Guru Tugas"
              value={dashboardData?.data?.tugasan ?? 0} // Mengakses melalui .data
              icon={<UserCheck className="h-6 w-6 text-muted-foreground" />}
              description="Santri yang sedang magang"
            />
          </>
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Tindakan Cepat</h2>
        <div className="flex flex-wrap gap-4">
          <Link to="/dashboard/pendaftaran-santri/add">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Tambah Santri Baru
            </Button>
          </Link>
          <Button variant="outline">
            Lihat Laporan Keuangan
          </Button>
          <Link to="/dashboard/berita">
            <Button variant="outline">
              Kelola Pengumuman
            </Button>
          </Link>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Jadwal Kegiatan</h2>
        {isLoadingActivities ? (
          <div className="text-center text-muted-foreground py-4">
            Memuat jadwal kegiatan...
          </div>
        ) : isErrorActivities ? (
          <div className="text-red-500">Gagal memuat jadwal kegiatan.</div>
        ) : (
          <div className="w-full lg:w-1/2">
            <EventCalendar
              kegiatanList={kegiatanList}
              onDateClick={handleDateClick}
              onEventClick={handleEventClick}
            />
          </div>
        )}
      </div>

      <ActivityDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        kegiatan={selectedKegiatan}
      />
    </DashboardLayout>
  );
};

export default AdministrasiDashboard;