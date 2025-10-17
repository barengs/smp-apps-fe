import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import CustomBreadcrumb, { type BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetClassSchedulesQuery, useGetPresenceByScheduleIdQuery } from '@/store/slices/classScheduleApi';
import { BookCopy, UserCheck, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

const PresensiDetailPage: React.FC = () => {
  const { detailId } = useParams<{ detailId: string }>();
  const navigate = useNavigate();

  const { data: schedulesResponse, isLoading: isLoadingSchedules } = useGetClassSchedulesQuery({});

  const parentSchedule = useMemo(() => {
    if (!schedulesResponse?.data || !detailId) return null;
    for (const s of schedulesResponse.data) {
      if (s.details.some((d) => d.id === parseInt(detailId, 10))) {
        return s;
      }
    }
    return null;
  }, [schedulesResponse, detailId]);

  const { data: presenceResponse, isLoading: isLoadingPresence } = useGetPresenceByScheduleIdQuery(parentSchedule?.id, {
    skip: !parentSchedule?.id,
  });

  const { schedule, detail, students, presenceData, filledMeetings } = useMemo(() => {
    const emptyResult = { schedule: null, detail: null, students: [], presenceData: {}, filledMeetings: new Set() };
    if (!presenceResponse?.data || !detailId) {
      return emptyResult;
    }

    const scheduleData = presenceResponse.data;
    const currentDetail = scheduleData.details.find(d => d.id === parseInt(detailId, 10));

    if (!currentDetail) {
      return emptyResult;
    }

    const studentList = currentDetail.students || [];
    const newPresenceData: Record<number, Record<number, string>> = {};
    const newFilledMeetings = new Set<number>();

    studentList.forEach(student => {
      newPresenceData[student.id] = {};
    });

    currentDetail.meeting_schedules?.forEach(meeting => {
      const meetingNum = parseInt(meeting.meeting_sequence, 10);
      if (meeting.presences && meeting.presences.length > 0) {
        newFilledMeetings.add(meetingNum);
        meeting.presences.forEach(p => {
          const studentId = parseInt(p.student_id, 10);
          if (newPresenceData[studentId]) {
            newPresenceData[studentId][meetingNum] = p.status;
          }
        });
      }
    });

    return {
      schedule: scheduleData,
      detail: currentDetail,
      students: studentList,
      presenceData: newPresenceData,
      filledMeetings: newFilledMeetings,
    };
  }, [presenceResponse, detailId]);

  const isLoading = isLoadingSchedules || isLoadingPresence;
  const meetingCount = detail?.meeting_count || 16;

  const handleHeaderClick = (meetingNumber: number) => {
    navigate(`/dashboard/manajemen-kurikulum/presensi/${detailId}/pertemuan/${meetingNumber}`);
  };

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
                <p className="font-semibold text-muted-foreground">Tingkat Pendidikan</p>
                <p>{schedule.education?.institution_name || '-'}</p>
              </div>
              <div>
                <p className="font-semibold text-muted-foreground">Jenjang Pendidikan</p>
                <p>{schedule.education?.institution_name || '-'}</p>
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
            
            <Separator className="my-6" />
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Lembar Presensi</h3>
              <p className="text-sm text-muted-foreground mb-4">Klik tombol pertemuan (P) untuk mengisi atau mengubah presensi.</p>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="h-10">
                      <TableHead className="w-[250px] py-1">Nama Siswa</TableHead>
                      {Array.from({ length: meetingCount }, (_, i) => {
                        const meetingNumber = i + 1;
                        const isFilled = filledMeetings.has(meetingNumber);
                        const meetingData = detail?.meeting_schedules?.find(m => parseInt(m.meeting_sequence, 10) === meetingNumber);
                        const meetingDate = meetingData?.meeting_date;
                        const tooltipText = isFilled 
                          ? `Tanggal pertemuan: ${meetingDate ? new Date(meetingDate).toLocaleDateString('id-ID') : 'Tanggal tidak tersedia'}`
                          : 'Pertemuan belum terealisasi';
                        
                        return (
                          <TableHead key={i} className="text-center py-1 px-1">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div
                                    onClick={() => handleHeaderClick(meetingNumber)}
                                    className={cn(
                                      "inline-flex items-center justify-center w-12 h-7 text-xs font-medium rounded cursor-pointer transition-colors",
                                      isFilled 
                                        ? "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/50" 
                                        : "bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50"
                                    )}
                                  >
                                    P {meetingNumber}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{tooltipText}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableHead>
                        );
                      })}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.length > 0 ? (
                      students.map((student) => (
                        <TableRow key={student.id} className="h-8">
                          <TableCell className="font-medium py-1 px-2 text-sm">
                            {`${student.first_name || ''} ${student.last_name || ''}`.trim()}
                          </TableCell>
                          {Array.from({ length: meetingCount }, (_, i) => {
                            const meetingNumber = i + 1;
                            const status = presenceData[student.id]?.[meetingNumber] || '-';
                            return (
                              <TableCell key={i} className="text-center py-1 px-1">
                                <span className={cn("text-sm font-semibold", {
                                  "text-green-600": status === 'hadir',
                                  "text-yellow-600": status === 'sakit',
                                  "text-blue-600": status === 'izin',
                                  "text-red-600": status === 'alpha',
                                })}>
                                  {status}
                                </span>
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={meetingCount + 1} className="text-center py-2">
                          Tidak ada data siswa untuk rombel ini.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PresensiDetailPage;