import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import DashboardLayout from '@/layouts/DashboardLayout';
import CustomBreadcrumb from '@/components/CustomBreadcrumb';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetClassSchedulesQuery, useUpdatePresenceMutation, useSaveAttendanceMutation } from '@/store/slices/classScheduleApi';
import { showError, showSuccess, showLoading, dismissToast } from '@/utils/toast';
import { BookCopy, UserCheck, ArrowLeft, Save } from 'lucide-react';

type AttendanceStatus = 'hadir' | 'sakit' | 'izin' | 'alpha';
type FormData = {
  attendances: Record<string, AttendanceStatus>;
  description: Record<string, string>;
};

const PresensiFormPage: React.FC = () => {
  const { detailId, meetingNumber } = useParams<{ detailId: string; meetingNumber: string }>();
  const navigate = useNavigate();
  const { register, handleSubmit, setValue, watch, reset } = useForm<FormData>();

  const { data: schedulesResponse, isLoading: isLoadingSchedules } = useGetClassSchedulesQuery({});
  const [updatePresence, { isLoading: isSaving }] = useUpdatePresenceMutation();
  const [saveAttendance] = useSaveAttendanceMutation();

  const parentSchedule = useMemo(() => {
    if (!schedulesResponse || !detailId) return null;
    const schedulesArray = Array.isArray(schedulesResponse)
      ? schedulesResponse
      : schedulesResponse.data || [];
    for (const s of schedulesArray) {
      if (s.details?.some((d) => d.id === parseInt(detailId, 10))) {
        return s;
      }
    }
    return null;
  }, [schedulesResponse, detailId]);

  const { detail, students, currentMeetingSchedule } = useMemo(() => {
    const emptyResult = { detail: null, students: [] as Array<{ id: number; first_name?: string; last_name?: string }>, currentMeetingSchedule: null as any };
    if (!parentSchedule || !detailId || !meetingNumber) {
      return emptyResult;
    }
    const currentDetail = parentSchedule.details.find(d => d.id === parseInt(detailId, 10));
    if (!currentDetail) {
      return emptyResult;
    }
    const studentList = currentDetail.students || [];
    const meetingNum = parseInt(meetingNumber, 10);
    const currentMeeting = currentDetail.meeting_schedules?.find(ms => parseInt(ms.meeting_sequence as any, 10) === meetingNum) || null;
    return {
      detail: currentDetail,
      students: studentList,
      currentMeetingSchedule: currentMeeting,
    };
  }, [parentSchedule, detailId, meetingNumber]);

  useEffect(() => {
    if (students.length > 0) {
      const defaultValues: Record<string, AttendanceStatus> = {};
      const defaultDescriptions: Record<string, string> = {};
      students.forEach(student => {
        const existingPresence = currentMeetingSchedule?.presences?.find(p => parseInt(p.student_id, 10) === student.id);
        defaultValues[student.id] = (existingPresence?.status || 'hadir').toLowerCase() as AttendanceStatus;
        defaultDescriptions[student.id] = existingPresence?.description || '';
      });
      reset({ attendances: defaultValues });
      Object.entries(defaultDescriptions).forEach(([studentId, description]) => {
        setValue(`description.${studentId}` as any, description);
      });
    }
  }, [students, currentMeetingSchedule, reset, setValue]);

  const watchedAttendances = watch('attendances');
  const watchedDescriptions = watch('description');

  // Add useEffect to monitor form state changes
  useEffect(() => {
    console.log('=== Form state changed ===');
    console.log('Watched attendances:', watchedAttendances);
    console.log('Watched descriptions:', watchedDescriptions);
  }, [watchedAttendances, watchedDescriptions]);

  const onSubmit = async (data: any) => {
    const toastId = showLoading('Menyimpan presensi...');
    try {
      if (currentMeetingSchedule) {
        const presenceList = {
          presences: Object.entries(data.attendances).map(([student_id, status]) => ({
            student_id: parseInt(student_id, 10),
            meeting_schedule_id: currentMeetingSchedule.id,
            status: status as AttendanceStatus,
            description: data.description?.[student_id] || null,
          })),
        };
        await updatePresence(presenceList).unwrap();
      } else {
        const toUpper = { hadir: 'Hadir', sakit: 'Sakit', izin: 'Izin', alpha: 'Alfa' } as const;
        const payload = {
          schedule_detail_id: detail.id,
          meeting_number: parseInt(meetingNumber as string, 10),
          attendances: Object.entries(data.attendances).map(([student_id, status]) => ({
            student_id: parseInt(student_id, 10),
            status: toUpper[status as AttendanceStatus],
          })),
        };
        await saveAttendance(payload).unwrap();
      }
      dismissToast(toastId);
      showSuccess('Data presensi berhasil disimpan!');
      navigate(-1);
    } catch (error) {
      dismissToast(toastId);
      showError('Gagal menyimpan data presensi.');
      console.error("Failed to save attendance:", error);
    }
  };

  const breadcrumbItems = [
    { label: 'Kurikulum', icon: <BookCopy className="h-4 w-4" /> },
    { label: 'Presensi', href: '/dashboard/manajemen-kurikulum/presensi', icon: <UserCheck className="h-4 w-4" /> },
    { label: 'Detail Presensi', href: `/dashboard/manajemen-kurikulum/presensi/${detailId}` },
    { label: `Presensi Pertemuan ke-${meetingNumber}` },
  ];

  const isLoading = isLoadingSchedules;

  if (isLoading) {
    return <DashboardLayout title="Formulir Presensi" role="administrasi"><Skeleton className="h-96 w-full" /></DashboardLayout>;
  }

  if (!detail) {
    return (
      <DashboardLayout title="Error" role="administrasi">
        <div className="p-4 text-center">
          <p>Data jadwal tidak ditemukan.</p>
          <Button onClick={() => navigate(-1)} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={`Presensi Pertemuan ke-${meetingNumber}`} role="administrasi">
      <div className="container mx-auto py-4 px-4 space-y-4">
        <div className="flex justify-between items-center">
          <CustomBreadcrumb items={breadcrumbItems} />
          <Button onClick={() => navigate(-1)} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>Presensi Pertemuan ke-{meetingNumber}</CardTitle>
              <CardDescription>
                Isi kehadiran untuk mata pelajaran {detail.study?.name} di kelas {detail.classroom?.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="h-10">
                      <TableHead className="w-[50px] py-1">No</TableHead>
                      <TableHead className="py-1">Nama Siswa</TableHead>
                      <TableHead className="w-[200px] py-1">Status Kehadiran</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.length > 0 ? (
                      students.map((student, index) => {
                        const currentStatus = watchedAttendances?.[student.id] || 'hadir';
                        const currentDescription = watchedDescriptions?.[student.id] || '';
                        const isDescriptionEnabled = currentStatus !== 'hadir';
                        
                        console.log(`Rendering student ${student.id}:`, {
                          currentStatus,
                          currentDescription,
                          isDescriptionEnabled,
                          watchedDescriptions: watchedDescriptions
                        });
                        
                        return (
                          <TableRow key={student.id} className="h-8">
                            <TableCell className="py-1 px-2 text-sm">{index + 1}</TableCell>
                            <TableCell className="font-medium py-1 px-2 text-sm">
                              {`${student.first_name || ''} ${student.last_name || ''}`.trim()}
                            </TableCell>
                            <TableCell className="py-1 px-2">
                              <Select
                                value={currentStatus}
                                onValueChange={(value: AttendanceStatus) => {
                                  setValue(`attendances.${student.id}`, value);
                                  // Reset description when status changes to hadir
                                  if (value === 'hadir') {
                                    setValue(`description.${student.id}` as any, '');
                                  }
                                }}
                              >
                                <SelectTrigger className="h-8 text-sm">
                                  <SelectValue placeholder="Pilih Status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="hadir">Hadir</SelectItem>
                                  <SelectItem value="sakit">Sakit</SelectItem>
                                  <SelectItem value="izin">Izin</SelectItem>
                                  <SelectItem value="alpha">Alfa</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell className="py-1 px-2">
                              <Input
                                {...register(`description.${student.id}` as any)}
                                placeholder={isDescriptionEnabled ? "Masukkan keterangan" : "Keterangan tidak perlu"}
                                disabled={!isDescriptionEnabled}
                                className="h-8 text-sm"
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-2">
                          Tidak ada siswa di rombel ini.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="flex justify-end mt-6">
                <Button type="submit" disabled={isSaving}>
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving ? 'Menyimpan...' : 'Simpan'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default PresensiFormPage;