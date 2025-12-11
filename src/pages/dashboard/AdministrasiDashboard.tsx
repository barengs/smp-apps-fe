import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Users, Briefcase, GraduationCap, UserCheck, UserPlus } from 'lucide-react';
import { useGetDashboardStatsQuery } from '@/store/slices/dashboardApi';
import { useGetCalonSantriQuery } from '@/store/slices/calonSantriApi';
import { Skeleton } from '@/components/ui/skeleton';
import { Link, useNavigate } from 'react-router-dom';
import EventCalendar from '@/components/EventCalendar';
import { useGetActivitiesQuery } from '@/store/slices/activityApi';
import { Kegiatan } from '@/types/kegiatan';
import { format } from 'date-fns';
import ActivityDetailModal from '@/components/ActivityDetailModal';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '@/store/slices/authSlice';
import SantriGrowthChart from '@/components/SantriGrowthChart';
import { useGetBeritaQuery } from '@/store/slices/beritaApi';
import RunningText from '@/components/RunningText';
import ViolationStatsCard from '@/components/ViolationStatsCard';
import { useGetStudentViolationStatisticsQuery } from '@/store/slices/studentViolationApi';

const StatCard: React.FC<{ title: string; value: number; icon: React.ReactNode; description?: string; color?: string }> = ({ title, value, icon, description, color }) => (
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
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const { data: dashboardData, error, isLoading } = useGetDashboardStatsQuery();
  const { data: activitiesData, isLoading: isLoadingActivities, isError: isErrorActivities } = useGetActivitiesQuery();
  const { data: calonSantriData, isLoading: isLoadingCalonSantri, isError: isErrorCalonSantri } = useGetCalonSantriQuery();
  const { data: newsData, isLoading: isNewsLoading, isError: isNewsError } = useGetBeritaQuery();
  const { data: violationStats, isLoading: isLoadingViolationStats } = useGetStudentViolationStatisticsQuery();

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedKegiatan, setSelectedKegiatan] = useState<Kegiatan | null>(null);
  const [isRunningTextVisible, setIsRunningTextVisible] = useState(true);

  const handleCloseRunningText = () => {
    setIsRunningTextVisible(false);
  };

  const newsItemsForRunningText = React.useMemo(() => {
    if (newsData?.data) {
      return newsData.data.map(newsItem => ({ 
        id: newsItem.id, 
        title: newsItem.title 
      }));
    }
    return [];
  }, [newsData]);

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
    return null;
  }

  return (
    <DashboardLayout title="Dashboard Administrasi" role="administrasi">
      {/* Running Text Section - News Headlines */}
      {!isNewsLoading && !isNewsError && newsItemsForRunningText.length > 0 && isRunningTextVisible && (
        <div className="w-full mb-6 relative">
          <button
            onClick={handleCloseRunningText}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-gray-600 hover:text-gray-800 rounded-full p-1 transition-colors"
            aria-label="Tutup running text"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <RunningText items={newsItemsForRunningText} />
        </div>
      )}

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
                value={dashboardData?.data?.santri ?? 0}
                icon={<Users className="h-6 w-6" />}
                description="Jumlah santri aktif saat ini"
                color="text-blue-600"
              />
            </Link>
            <Link to="/dashboard/staf">
              <StatCard
                title="Total Asatidz"
                value={dashboardData?.data?.asatidz ?? 0}
                icon={<Briefcase className="h-6 w-6" />}
                description="Jumlah staf pengajar"
                color="text-green-600"
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
                  value={calonSantriData?.data?.total ?? 0}
                  icon={<UserPlus className="h-6 w-6" />}
                  description="Jumlah pendaftar santri baru"
                  color="text-orange-600"
              />
              </Link>
            )}
            <Link to="/dashboard/guru-tugas">
              <StatCard
                title="Guru Tugas"
                value={dashboardData?.data?.tugasan ?? 0}
                icon={<UserCheck className="h-6 w-6" />}
                description="Santri yang sedang magang"
                color="text-purple-600"
              />
            </Link>
          </>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Column: Santri Statistics + Violation Stats stacked */}
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold mb-4">Statistik Santri</h2>
            <SantriGrowthChart />
          </div>
          <ViolationStatsCard stats={violationStats} isLoading={isLoadingViolationStats} />
        </div>

        {/* Right Column: Quick Actions and Activity Schedule */}
        <div className="space-y-6">
          <div>
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

          <div>
            <h2 className="text-2xl font-bold mb-4">Jadwal Kegiatan</h2>
            {isLoadingActivities ? (
              <div className="text-center text-muted-foreground py-4">
                Memuat jadwal kegiatan...
              </div>
            ) : isErrorActivities ? (
              <div className="text-red-500">Gagal memuat jadwal kegiatan.</div>
            ) : (
              <div className="w-full">
                <EventCalendar
                  kegiatanList={kegiatanList}
                  onDateClick={handleDateClick}
                  onEventClick={handleEventClick}
                />
              </div>
            )}
          </div>
        </div>
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