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
import { useGetClassSchedulesQuery, useGetPresenceByScheduleIdQuery, useUpdatePresenceMutation } from '@/store/slices/classScheduleApi';
import { showError, showSuccess, showLoading, dismissToast } from '@/utils/toast';
import { BookCopy, UserCheck, ArrowLeft, Save } from 'lucide-react';

type AttendanceStatus = 'hadir' | 'sakit' | 'izin' | 'alpha';
type FormData = {
  attendances: Record<string, AttendanceStatus>;
};

const PresensiFormPage: React.FC = () => {
  const { detailId, meetingNumber } = useParams<{ detailId: string; meetingNumber: string }>();
  const navigate = useNavigate();
  const { register, handleSubmit, setValue, watch, reset } = useForm<FormData>();

  const { data: schedulesResponse, isLoading: isLoadingSchedules } = useGetClassSchedulesQuery();
  const [updatePresence, { isLoading: isSaving }] = useUpdatePresenceMutation();

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

  const { detail, students, currentMeetingSchedule } = useMemo(() => {
    const emptyResult = { detail: null, students: [], currentMeetingSchedule: null };
    if (!presenceResponse?.data || !detailId || !meetingNumber) {
      return emptyResult;
    }

    const scheduleData = presenceResponse.data;
    const currentDetail = scheduleData.details.find(d => d.id === parseInt(detailId, 10));

    if (!currentDetail) {
      return emptyResult;
    }

    const studentList = currentDetail.students || [];
    const meetingNum = parseInt(meetingNumber, 10);
    const currentMeeting = currentDetail.meeting_schedules?.find(ms => parseInt(ms.meeting_sequence, 10) === meetingNum);

    return {
      detail: currentDetail,
      students: studentList,
      currentMeetingSchedule: currentMeeting,
    };
  }, [presenceResponse, detailId, meetingNumber]);

  useEffect(() => {
    if (students.length > 0 && currentMeetingSchedule) {
      const defaultValues: Record<string, AttendanceStatus> = {};
      const defaultDescriptions: Record<string, string> = {};
      students.forEach(student => {
        const existingPresence = currentMeetingSchedule.presences?.find(p => parseInt(p.student_id, 10) === student.id);
        defaultValues[student.id] = (existingPresence?.status || 'hadir').toLowerCase() as AttendanceStatus;
        defaultDescriptions[student.id] = existingPresence?.description || ''; // Use existing description
      });
      
      reset({ 
        attendances: defaultValues
      });
      
      // Set description values separately
      Object.entries(defaultDescriptions).forEach(([studentId, description]) => {
        setValue(`description.${studentId}` as any, description);
      });
    }
  }, [students, currentMeetingSchedule, reset, setValue]);

  const watchedAttendances = watch('attendances');
  const watchedDescriptions = watch('descriptions' as any);

  const onSubmit = async (data: FormData) => {
    if (!currentMeetingSchedule) return;

    // Build the payload with description from form data
    const attendancePayload = Object.entries(data.attendances).map(([student_id, status]) => ({
      student_id: parseInt(student_id, 10),
      status,
      description: (data as any).description[student_id] || null, // Use type assertion
    }));

    // Use the payload that already contains the description
    const presenceList = {
      presences: attendancePayload.map((item) => ({
        student_id: item.student_id,
        meeting_schedule_id: currentMeetingSchedule.id,
        status: item.status,
        description: item.description, // Use description from item, not hardcoded null
      }))
    };

    const toastId = showLoading('Menyimpan presensi...');
    try {
      await updatePresence(presenceList).unwrap();
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

  const isLoading = isLoadingSchedules || isLoadingPresence;

  if (isLoading) {
    return <DashboardLayout title="Formulir Presensi" role="administrasi"><Skeleton className="h-96 w-full" /></DashboardLayout>;
  }

  if (!detail || !currentMeetingSchedule) {
    return (
      <DashboardLayout title="Error" role="administrasi">
        <div className="p-4 text-center">
          <p>Data jadwal atau pertemuan tidak ditemukan.</p>
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