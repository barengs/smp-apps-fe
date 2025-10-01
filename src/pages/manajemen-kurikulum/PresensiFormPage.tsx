import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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

    const toastId = showLoading(t('presenceForm.saving'));
    try {
      await saveAttendance({
        schedule_detail_id: parseInt(detailId, 10),
        meeting_number: parseInt(meetingNumber, 10),
        attendances: attendancePayload,
      }).unwrap();
      dismissToast(toastId);
      showSuccess(t('presenceForm.saveSuccess'));
      navigate(-1);
    } catch (error) {
      dismissToast(toastId);
      showError(t('presenceForm.saveError'));
      console.error("Failed to save attendance:", error);
    }
  };

  const breadcrumbItems = [
    { label: t('sidebar.curriculum'), icon: <BookCopy className="h-4 w-4" /> },
    { label: t('sidebar.presence'), href: '/dashboard/manajemen-kurikulum/presensi', icon: <UserCheck className="h-4 w-4" /> },
    { label: t('presenceForm.detailTitle'), href: `/dashboard/manajemen-kurikulum/presensi/${detailId}` },
    { label: t('presenceForm.formTitle', { meeting: meetingNumber }) },
  ];

  if (isLoadingSchedules) {
    return <DashboardLayout title={t('presenceForm.loadingTitle')} role="administrasi"><Skeleton className="h-96 w-full" /></DashboardLayout>;
  }

  if (!detail || !schedule) {
    return (
      <DashboardLayout title="Error" role="administrasi">
        <div className="p-4 text-center">
          <p>{t('presenceForm.dataNotFound')}</p>
          <Button onClick={() => navigate(-1)} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> {t('actions.back')}
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={t('presenceForm.formTitle', { meeting: meetingNumber })} role="administrasi">
      <div className="container mx-auto py-4 px-4 space-y-4">
        <div className="flex justify-between items-center">
          <CustomBreadcrumb items={breadcrumbItems} />
          <Button onClick={() => navigate(-1)} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> {t('actions.back')}
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>{t('presenceForm.formTitle', { meeting: meetingNumber })}</CardTitle>
              <CardDescription>{t('presenceForm.description', { subject: detail.study?.name, class: detail.classroom?.name })}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">No</TableHead>
                      <TableHead>{t('presenceForm.studentName')}</TableHead>
                      <TableHead className="w-[200px]">{t('presenceForm.status')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.length > 0 ? (
                      students.map((student, index) => (
                        <TableRow key={student.id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell className="font-medium">
                            {`${student.first_name || ''} ${student.last_name || ''}`.trim()}
                          </TableCell>
                          <TableCell>
                            <Select
                              value={watchedAttendances?.[student.id] || 'Hadir'}
                              onValueChange={(value: AttendanceStatus) => setValue(`attendances.${student.id}`, value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder={t('presenceForm.selectStatus')} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Hadir">{t('presence.present')}</SelectItem>
                                <SelectItem value="Sakit">{t('presence.sick')}</SelectItem>
                                <SelectItem value="Izin">{t('presence.permission')}</SelectItem>
                                <SelectItem value="Alfa">{t('presence.absent')}</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center">
                          {t('presenceForm.noStudents')}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="flex justify-end mt-6">
                <Button type="submit" disabled={isSaving}>
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving ? t('presenceForm.saving') : t('actions.save')}
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