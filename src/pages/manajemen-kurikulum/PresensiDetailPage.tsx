import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import CustomBreadcrumb, { type BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetClassSchedulesQuery } from '@/store/slices/classScheduleApi';
import { useGetStudentClassesQuery } from '@/store/slices/studentClassApi';
import { BookCopy, UserCheck, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

type AttendanceStatus = 'Hadir' | 'Sakit' | 'Izin' | 'Alfa' | 'Belum Diisi';

const PresensiDetailPage: React.FC = () => {
  const { detailId } = useParams<{ detailId: string }>();
  const navigate = useNavigate();

  const { data: schedulesResponse, isLoading: isLoadingSchedules } = useGetClassSchedulesQuery();
  const { data: studentClassesResponse, isLoading: isLoadingStudentClasses } = useGetStudentClassesQuery();

  const { schedule, detail } = useMemo(() => {
    if (!schedulesResponse?.data || !detailId) {
      return { schedule: null, detail: null };
    }
    for (const s of schedulesResponse.data) {
      const d = s.details.find((d) => d.id === parseInt(detailId, 10));
      if (d) {
        return { schedule: s, detail: d };
      }
    }
    return { schedule: null, detail: null };
  }, [schedulesResponse, detailId]);

  const students = useMemo(() => {
    if (!studentClassesResponse?.data || !detail?.class_group_id) {
      return [];
    }
    const studentClassGroup = studentClassesResponse.data.find(sc => 'class_group' in sc && sc.class_group && sc.class_group.id === parseInt(detail.class_group_id, 10));
    return studentClassGroup ? studentClassGroup.students : [];
  }, [studentClassesResponse, detail]);

  const [attendanceData, setAttendanceData] = useState<Record<string, Record<number, AttendanceStatus>>>({});

  const handleStatusChange = (studentId: number, meetingNumber: number, status: AttendanceStatus) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        [meetingNumber]: status,
      },
    }));
  };

  const isLoading = isLoadingSchedules || isLoadingStudentClasses;
  const meetingCount = 16; // Placeholder for number of meetings

  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: 'Kurikulum', icon: <BookCopy className="h-4 w-4" /> },
    { label: 'Presensi', href: '/dashboard/manajemen-kurikulum/presensi', icon: <UserCheck className="h-4 w-4" /> },
    { label: 'Detail Presensi' },
  ];

  if (isLoading) {
    return (
      <DashboardLayout title="Detail Presensi" role="administrasi">
        <div className="p-4 space-y-4">
          <Skeleton className="h-8 w-1/2" />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-1/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (!detail || !schedule) {
    return (
      <DashboardLayout title="Detail Presensi" role="administrasi">
        <div className="p-4 text-center">
          <p>Data presensi tidak ditemukan.</p>
          <Button onClick={() => navigate(-1)} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const getStatusColorClass = (status: AttendanceStatus) => {
    switch (status) {
      case 'Hadir': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
      case 'Sakit': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
      case 'Izin': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
      case 'Alfa': return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <DashboardLayout title="Detail Presensi" role="administrasi">
      <div className="container mx-auto py-4 px-4 space-y-4">
        <div className="flex justify-between items-center">
          <CustomBreadcrumb items={breadcrumbItems} />
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Detail Jadwal Pelajaran</CardTitle>
            <CardDescription>Informasi lengkap mengenai jadwal pelajaran yang dipilih.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="font-semibold text-muted-foreground">Tahun Ajaran</p>
                <p>{schedule.academic_year?.year || '-'}</p>
              </div>
              <div>
                <p className="font-semibold text-muted-foreground">Jenjang Pendidikan</p>
                <p>{schedule.education?.name || '-'}</p>
              </div>
              <div>
                <p className="font-semibold text-muted-foreground">Sesi</p>
                <p>{schedule.session || '-'}</p>
              </div>
              <div>
                <p className="font-semibold text-muted-foreground">Mata Pelajaran</p>
                <p>{detail.study?.name || '-'}</p>
              </div>
              <div>
                <p className="font-semibold text-muted-foreground">Kelas</p>
                <p>{detail.classroom?.name || '-'}</p>
              </div>
              <div>
                <p className="font-semibold text-muted-foreground">Rombel</p>
                <p>{detail.class_group?.name || '-'}</p>
              </div>
              <div>
                <p className="font-semibold text-muted-foreground">Guru Pengampu</p>
                <p>{`${detail.teacher?.first_name || ''} ${detail.teacher?.last_name || ''}`.trim() || '-'}</p>
              </div>
              <div>
                <p className="font-semibold text-muted-foreground">Jam Pelajaran</p>
                <p>{`${detail.lesson_hour?.start_time ? detail.lesson_hour.start_time.substring(0, 5) : ''} - ${detail.lesson_hour?.end_time ? detail.lesson_hour.end_time.substring(0, 5) : ''}`}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lembar Presensi</CardTitle>
            <CardDescription>Kelola kehadiran siswa untuk mata pelajaran ini.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative overflow-x-auto">
              <Table className="min-w-full border-collapse">
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky left-0 bg-background z-10 w-[250px] border-r">Nama Siswa</TableHead>
                    {Array.from({ length: meetingCount }, (_, i) => (
                      <TableHead key={i} className="text-center">P {i + 1}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.length > 0 ? (
                    students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="sticky left-0 bg-background z-10 font-medium border-r whitespace-nowrap">
                          {`${student.first_name || ''} ${student.last_name || ''}`.trim()}
                        </TableCell>
                        {Array.from({ length: meetingCount }, (_, i) => {
                          const meetingNumber = i + 1;
                          const status = attendanceData[student.id]?.[meetingNumber] || 'Belum Diisi';
                          return (
                            <TableCell key={i} className="p-1">
                              <Select
                                value={status}
                                onValueChange={(value: AttendanceStatus) => handleStatusChange(student.id, meetingNumber, value)}
                              >
                                <SelectTrigger className={cn("w-28 h-8 text-xs", getStatusColorClass(status))}>
                                  <SelectValue placeholder="Pilih Status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Belum Diisi">Belum Diisi</SelectItem>
                                  <SelectItem value="Hadir">Hadir</SelectItem>
                                  <SelectItem value="Sakit">Sakit</SelectItem>
                                  <SelectItem value="Izin">Izin</SelectItem>
                                  <SelectItem value="Alfa">Alfa</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={meetingCount + 1} className="text-center">
                        Tidak ada data siswa untuk rombel ini.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PresensiDetailPage;