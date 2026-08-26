import React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldAlert, LogOut, FileWarning, CalendarCheck, PlaneTakeoff, PlaneLanding, Loader2 } from 'lucide-react';
import { useGetKamtibStatisticsQuery } from '../../store/slices/dashboardApi';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useGetKamtibHolidayStudentsQuery } from '../../store/slices/dashboardApi';
import { useState } from 'react';

const HolidayStudentsModal = ({ 
  isOpen, 
  onClose, 
  status, 
  title 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  status: 'checkout' | 'checkin' | 'not_returned' | null,
  title: string
}) => {
  const { data: response, isLoading } = useGetKamtibHolidayStudentsQuery(status || '', {
    skip: !status || !isOpen
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-hidden mt-4">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <ScrollArea className="h-[60vh] rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">No</TableHead>
                    <TableHead>NIS</TableHead>
                    <TableHead>Nama Lengkap</TableHead>
                    <TableHead>Asrama (Kamar)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {response?.data?.length ? (
                    response.data.map((student, index) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>{student.nis}</TableCell>
                        <TableCell>{student.full_name}</TableCell>
                        <TableCell>{student.room_name}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                        Tidak ada data santri.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const KamtibDashboard: React.FC = () => {
  const { data: response, isLoading, isError } = useGetKamtibStatisticsQuery();
  const [modalStatus, setModalStatus] = useState<'checkout' | 'checkin' | 'not_returned' | null>(null);
  const [modalTitle, setModalTitle] = useState('');

  const handleOpenModal = (status: 'checkout' | 'checkin' | 'not_returned', title: string) => {
    setModalStatus(status);
    setModalTitle(title);
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Dashboard Manajemen Kamtib" role="administrasi">
        <div className="flex h-[400px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (isError || !response || response.status !== 'success') {
    return (
      <DashboardLayout title="Dashboard Manajemen Kamtib" role="administrasi">
        <div className="p-4 bg-red-50 text-red-600 rounded-lg">
          Gagal memuat data statistik.
        </div>
      </DashboardLayout>
    );
  }

  const stats = response.data;
  const holiday = stats.holiday;

  // Calculate return progress
  let returnProgress = 0;
  if (holiday && holiday.checkout_count > 0) {
    returnProgress = Math.round((holiday.checkin_count / holiday.checkout_count) * 100);
  }

  return (
    <DashboardLayout title="Dashboard Manajemen Kamtib" role="administrasi">
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pelanggaran Hari Ini</CardTitle>
            <ShieldAlert className="h-6 w-6 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.violations_today}</div>
            <p className="text-xs text-muted-foreground mt-1">Santri melanggar tata tertib hari ini</p>
          </CardContent>
        </Card>

        <Card className="transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Izin Aktif</CardTitle>
            <FileWarning className="h-6 w-6 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active_leaves}</div>
            <p className="text-xs text-muted-foreground mt-1">Santri sedang dalam masa izin hari ini</p>
          </CardContent>
        </Card>

        <Card className="transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status Liburan</CardTitle>
            <CalendarCheck className="h-6 w-6 text-blue-500" />
          </CardHeader>
          <CardContent>
            {holiday ? (
              <>
                <div className="text-2xl font-bold truncate" title={holiday.title}>{holiday.title}</div>
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {holiday.start_date} s/d {holiday.end_date}
                </p>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">Tidak Ada</div>
                <p className="text-xs text-muted-foreground mt-1">Belum ada agenda libur aktif</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Holiday Progress Section */}
        <Card className="lg:col-span-1 flex flex-col">
          <CardHeader>
            <CardTitle>Pantauan Kepulangan Libur</CardTitle>
            <CardDescription>
              {holiday ? `Statistik untuk: ${holiday.title}` : 'Tidak ada data liburan aktif'}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center">
            {holiday ? (
              <div className="space-y-6">
                <div 
                  className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                  onClick={() => handleOpenModal('checkout', 'Daftar Santri Sudah Pulang')}
                >
                  <div className="flex items-center gap-2">
                    <PlaneTakeoff className="h-5 w-5 text-gray-500" />
                    <span className="text-sm font-medium text-gray-600">Sudah Pulang</span>
                  </div>
                  <span className="text-xl font-bold">{holiday.checkout_count}</span>
                </div>
                
                <div 
                  className="flex items-center justify-between p-2 hover:bg-green-50 rounded-lg cursor-pointer transition-colors"
                  onClick={() => handleOpenModal('checkin', 'Daftar Santri Sudah Kembali')}
                >
                  <div className="flex items-center gap-2">
                    <PlaneLanding className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-600">Sudah Kembali</span>
                  </div>
                  <span className="text-xl font-bold text-green-600">{holiday.checkin_count}</span>
                </div>

                <div 
                  className="flex items-center justify-between p-2 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                  onClick={() => handleOpenModal('not_returned', 'Daftar Santri Belum Kembali')}
                >
                  <div className="flex items-center gap-2">
                    <LogOut className="h-5 w-5 text-red-500" />
                    <span className="text-sm font-medium text-gray-600">Belum Kembali</span>
                  </div>
                  <span className="text-xl font-bold text-red-500">{holiday.not_returned_count}</span>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between mb-2 text-sm font-medium">
                    <span>Progress Kembali</span>
                    <span>{returnProgress}%</span>
                  </div>
                  <Progress value={returnProgress} className="h-2" />
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                Data kepulangan santri akan muncul di sini saat ada libur aktif.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Charts Section */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Tren 6 Bulan Terakhir</CardTitle>
            <CardDescription>Grafik perbandingan Pelanggaran dan Perizinan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats.trends.violations.map((item, index) => ({
                    name: item.name,
                    pelanggaran: item.total,
                    izin: stats.trends.leaves[index]?.total || 0,
                  }))}
                  margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{fill: 'rgba(0,0,0,0.05)'}} 
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  />
                  <Legend />
                  <Bar dataKey="pelanggaran" name="Pelanggaran" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={30} />
                  <Bar dataKey="izin" name="Perizinan" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <HolidayStudentsModal 
        isOpen={modalStatus !== null} 
        onClose={() => setModalStatus(null)} 
        status={modalStatus} 
        title={modalTitle} 
      />
    </DashboardLayout>
  );
};

export default KamtibDashboard;
