import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import DashboardLayout from '@/layouts/DashboardLayout';
import CustomBreadcrumb from '@/components/CustomBreadcrumb';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetClassSchedulesQuery, useSaveAttendanceMutation } from '@/store/slices/classScheduleApi';
import { showError, showSuccess, showLoading, dismissToast } from '@/utils/toast';
import { BookCopy, UserCheck, ArrowLeft, Save } from 'lucide-react';

type AttendanceStatus = 'Hadir' | 'Sakit' | 'Izin' | 'Alfa';
type FormData = {
  attendances: Record<string, AttendanceStatus>;
};

const PresensiFormPage: React.FC = () => {
  const { detailId, meetingNumber } = useParams<{ detailId: string; meetingNumber: string }>();
  const navigate = useNavigate();
  const { register, handleSubmit, setValue, watch } = useForm<FormData>();

  const { data: schedulesResponse, isLoading: isLoadingSchedules } = useGetClassSchedulesQuery();
  const [saveAttendance, { isLoading: isSaving }] = useSaveAttendanceMutation();

  const { schedule, detail } = useMemo(() => {
    if (!schedulesResponse?.data || !detailId) return { schedule: null, detail: null };
    for (const s of schedulesResponse.data) {
      const d = s.details.find((d) => d.id === parseInt(detailId, 10));
      if (d) return { schedule: s, detail: d };
    }
    return { schedule: null, detail: null };
  }, [schedulesResponse, detailId]);

  const students = useMemo(() => detail?.students || [], [detail]);

  useEffect(() => {
    if (students.length > 0) {
      students.forEach(student => {
        register(`attendances.${student.id}`);
        // TODO: Fetch existing attendance data and set default value here
        setValue(`attendances.${student.id}`, 'Hadir');
      });
    }
  }, [students, register, setValue]);

  const watchedAttendances = watch('attendances');

  const onSubmit = async (data: FormData) => {
    if (!detailId || !meetingNumber) return;

    const attendancePayload = Object.entries(data.attendances).map(([student_id, status]) => ({
      student_id: parseInt(student_id, 10),
      status,
    }));

    const toastId = showLoading('Menyimpan presensi...');
    try {
      await saveAttendance({
        schedule_detail_id: parseInt(detailId, 10),
        meeting_number: parseInt(meetingNumber, 10),
        attendances: attendancePayload,
      }).unwrap();
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

  if (isLoadingSchedules) {
    return <DashboardLayout title="Formulir Presensi" role="administrasi"><Skeleton className="h-96 w-full" /></DashboardLayout>;
  }

  if (!detail || !schedule) {
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
                      students.map((student, index) => (
                        <TableRow key={student.id} className="h-8">
                          <TableCell className="py-1 px-2 text-sm">{index + 1}</TableCell>
                          <TableCell className="font-medium py-1 px-2 text-sm">
                            {`${student.first_name || ''} ${student.last_name || ''}`.trim()}
                          </TableCell>
                          <TableCell className="py-1 px-2">
                            <Select
                              value={watchedAttendances?.[student.id] || 'Hadir'}
                              onValueChange={(value: AttendanceStatus) => setValue(`attendances.${student.id}`, value)}
                            >
                              <SelectTrigger className="h-8 text-sm">
                                <SelectValue placeholder="Pilih Status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Hadir">Hadir</SelectItem>
                                <SelectItem value="Sakit">Sakit</SelectItem>
                                <SelectItem value="Izin">Izin</SelectItem>
                                <SelectItem value="Alfa">Alfa</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-2">
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