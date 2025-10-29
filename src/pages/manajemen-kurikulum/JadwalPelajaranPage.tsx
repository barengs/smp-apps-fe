import React, { useState, useMemo } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import CustomBreadcrumb, { type BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { BookCopy, CalendarClock } from 'lucide-react';
import { DataTable } from '@/components/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import LessonScheduleForm from './LessonScheduleForm';
import { useGetClassSchedulesQuery, type ClassScheduleData } from '@/store/slices/classScheduleApi';
import TableLoadingSkeleton from '@/components/TableLoadingSkeleton';

const JadwalPelajaranPage: React.FC = () => {
  const { t } = useTranslation();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { data: schedulesResponse, isLoading, isError } = useGetClassSchedulesQuery({});

  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: t('sidebar.curriculum'), href: '/dashboard/manajemen-kurikulum/kenaikan-kelas', icon: <BookCopy className="h-4 w-4" /> },
    { label: t('sidebar.lessonSchedule'), icon: <CalendarClock className="h-4 w-4" /> },
  ];

  // Flatten the nested structure for the table
  const flattenScheduleData = (schedules: ClassScheduleData[]) => {
    const flattened: any[] = [];
    schedules.forEach(schedule => {
      schedule.details.forEach(detail => {
        flattened.push({
          id: detail.id,
          education: schedule.education,
          classroom: detail.classroom,
          class_group: detail.class_group,
          day: detail.day,
          study: detail.study,
          teacher: detail.teacher,
          lesson_hour: detail.lesson_hour,
          session: schedule.session,
          status: schedule.status,
        });
      });
    });
    return flattened;
  };

  const columns: ColumnDef<any>[] = [
    {
      id: 'education',
      accessorFn: (row: any) => row?.education?.institution_name || '',
      header: t('lessonSchedulePage.educationLevel'),
      cell: ({ getValue }) => {
        const name = (getValue() as string) || '';
        return name ? <div className="capitalize">{name}</div> : <div className="text-gray-400">-</div>;
      },
    },
    {
      accessorKey: 'classroom.name',
      header: t('lessonSchedulePage.class'),
      cell: ({ row }) => <div className="capitalize">{row.original.classroom.name}</div>,
    },
    {
      accessorKey: 'class_group.name',
      header: t('lessonSchedulePage.classGroup'),
      cell: ({ row }) => <div className="capitalize">{row.original.class_group.name}</div>,
    },
    {
      accessorKey: 'day',
      header: t('lessonSchedulePage.day'),
      cell: ({ row }) => <div className="capitalize">{row.getValue('day')}</div>,
    },
    {
      accessorKey: 'study.name',
      header: t('lessonSchedulePage.subject'),
      cell: ({ row }) => <div className="capitalize">{row.original.study.name}</div>,
    },
    {
      accessorKey: 'teacher',
      header: t('lessonSchedulePage.teacher'),
      cell: ({ row }) => {
        const teacher = row.original.teacher;
        const teacherName = `${teacher.first_name} ${teacher.last_name}`.trim();
        return <div className="capitalize">{teacherName}</div>;
      },
    },
    {
      accessorKey: 'lesson_hour',
      header: t('lessonSchedulePage.time'),
      cell: ({ row }) => {
        const lessonHour = row.original.lesson_hour;
        // Add null safety check
        if (!lessonHour) {
          return <div className="text-gray-400">-</div>;
        }
        return <div className="capitalize">{`${lessonHour.start_time} - ${lessonHour.end_time}`}</div>;
      },
    },
  ];

  const handleAddSchedule = () => {
    setIsFormOpen(true);
  };

  const data = React.useMemo(() => {
    const raw: ClassScheduleData[] =
      (Array.isArray(schedulesResponse) ? schedulesResponse : schedulesResponse?.data) || [];
    return flattenScheduleData(raw);
  }, [schedulesResponse]);

  // Siapkan opsi filter unik dari data yang sudah diratakan
  const educationOptions = useMemo(
    () =>
      Array.from(
        new Set(
          (data || [])
            .map((r: any) => r?.education?.institution_name)
            .filter((v: any): v is string => typeof v === 'string' && v.trim() !== '')
        )
      ).map((name) => ({ label: name, value: name })),
    [data]
  );
  const classOptions = useMemo(
    () =>
      Array.from(
        new Set(
          (data || [])
            .map((r: any) => r?.classroom?.name)
            .filter((v: any): v is string => typeof v === 'string' && v.trim() !== '')
        )
      ).map((name) => ({ label: name, value: name })),
    [data]
  );
  const classGroupOptions = useMemo(
    () =>
      Array.from(
        new Set(
          (data || [])
            .map((r: any) => r?.class_group?.name)
            .filter((v: any): v is string => typeof v === 'string' && v.trim() !== '')
        )
      ).map((name) => ({ label: name, value: name })),
    [data]
  );
  const dayOptions = useMemo(
    () =>
      Array.from(
        new Set(
          (data || [])
            .map((r: any) => r?.day)
            .filter((v: any): v is string => typeof v === 'string' && v.trim() !== '')
        )
      ).map((name) => ({ label: name, value: name })),
    [data]
  );

  return (
    <DashboardLayout title={t('sidebar.lessonSchedule')} role="administrasi">
      <div className="container mx-auto py-4 px-4">
        <CustomBreadcrumb items={breadcrumbItems} />
        <Card>
          <CardHeader>
            <CardTitle>{t('sidebar.lessonSchedule')}</CardTitle>
            <CardDescription>{t('lessonSchedulePage.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <TableLoadingSkeleton numRows={8} />
            ) : isError ? (
              <div className="text-center text-red-500">Gagal memuat data jadwal pelajaran.</div>
            ) : (
              <DataTable
                columns={columns}
                data={data}
                exportFileName="JadwalPelajaran"
                exportTitle={t('sidebar.lessonSchedule')}
                onAddData={handleAddSchedule}
                addButtonLabel="Tambah Jadwal Pelajaran"
                filterableColumns={{
                  education: {
                    type: 'select',
                    placeholder: t('lessonSchedulePage.educationLevel'),
                    options: educationOptions,
                  },
                  'classroom.name': {
                    type: 'select',
                    placeholder: t('lessonSchedulePage.class'),
                    options: classOptions,
                  },
                  'class_group.name': {
                    type: 'select',
                    placeholder: t('lessonSchedulePage.classGroup'),
                    options: classGroupOptions,
                  },
                  day: {
                    type: 'select',
                    placeholder: t('lessonSchedulePage.day'),
                    options: dayOptions,
                  },
                }}
              />
            )}
          </CardContent>
        </Card>
      </div>
      <LessonScheduleForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
      />
    </DashboardLayout>
  );
};

export default JadwalPelajaranPage;