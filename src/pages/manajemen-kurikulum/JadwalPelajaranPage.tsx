import React, { useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import CustomBreadcrumb, { type BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { BookCopy, CalendarClock } from 'lucide-react';
import { DataTable } from '@/components/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import { showSuccess } from '@/utils/toast';

// Tipe data untuk jadwal pelajaran
interface LessonSchedule {
  id: string;
  educationLevel: string;
  class: string;
  classGroup: string;
  day: string;
  subject: string;
  teacher: string;
  time: string;
}

const JadwalPelajaranPage: React.FC = () => {
  const { t } = useTranslation();

  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: t('sidebar.curriculum'), href: '/dashboard/manajemen-kurikulum/kenaikan-kelas', icon: <BookCopy className="h-4 w-4" /> },
    { label: t('sidebar.lessonSchedule'), icon: <CalendarClock className="h-4 w-4" /> },
  ];

  // Mock data for lesson schedules
  const mockData: LessonSchedule[] = [
    { id: '1', educationLevel: 'SMP', class: 'VII A', classGroup: 'Reguler', day: 'Senin', subject: 'Matematika', teacher: 'Budi Santoso', time: '08:00 - 09:30' },
    { id: '2', educationLevel: 'SMP', class: 'VII B', classGroup: 'Reguler', day: 'Senin', subject: 'Bahasa Inggris', teacher: 'Siti Aminah', time: '09:30 - 11:00' },
    { id: '3', educationLevel: 'SMP', class: 'VIII A', classGroup: 'Unggulan', day: 'Selasa', subject: 'Fisika', teacher: 'Agus Wijaya', time: '10:00 - 11:30' },
    { id: '4', educationLevel: 'SMP', class: 'VIII B', classGroup: 'Reguler', day: 'Selasa', subject: 'Kimia', teacher: 'Dewi Lestari', time: '11:30 - 13:00' },
    { id: '5', educationLevel: 'SMA', class: 'X IPA 1', classGroup: 'Reguler', day: 'Rabu', subject: 'Biologi', teacher: 'Rina Fitriani', time: '08:00 - 09:30' },
    { id: '6', educationLevel: 'SMA', class: 'X IPS 1', classGroup: 'Reguler', day: 'Rabu', subject: 'Sejarah', teacher: 'Joko Susilo', time: '09:30 - 11:00' },
    { id: '7', educationLevel: 'SMP', class: 'VII A', classGroup: 'Reguler', day: 'Selasa', subject: 'Bahasa Arab', teacher: 'Ahmad Fauzi', time: '08:00 - 09:30' },
    { id: '8', educationLevel: 'SMP', class: 'IX C', classGroup: 'Unggulan', day: 'Kamis', subject: 'Pendidikan Agama Islam', teacher: 'Fatima Zahra', time: '13:00 - 14:30' },
  ];

  const columns: ColumnDef<LessonSchedule>[] = [
    {
      accessorKey: 'educationLevel',
      header: t('lessonSchedulePage.educationLevel'),
      cell: ({ row }) => <div className="capitalize">{row.getValue('educationLevel')}</div>,
    },
    {
      accessorKey: 'class',
      header: t('lessonSchedulePage.class'),
      cell: ({ row }) => <div className="capitalize">{row.getValue('class')}</div>,
    },
    {
      accessorKey: 'classGroup',
      header: t('lessonSchedulePage.classGroup'),
      cell: ({ row }) => <div className="capitalize">{row.getValue('classGroup')}</div>,
    },
    {
      accessorKey: 'day',
      header: t('lessonSchedulePage.day'),
      cell: ({ row }) => <div className="capitalize">{row.getValue('day')}</div>,
    },
    {
      accessorKey: 'subject',
      header: t('lessonSchedulePage.subject'),
      cell: ({ row }) => <div className="capitalize">{row.getValue('subject')}</div>,
    },
    {
      accessorKey: 'teacher',
      header: t('lessonSchedulePage.teacher'),
      cell: ({ row }) => <div className="capitalize">{row.getValue('teacher')}</div>,
    },
    {
      accessorKey: 'time',
      header: t('lessonSchedulePage.time'),
      cell: ({ row }) => <div className="capitalize">{row.getValue('time')}</div>,
    },
  ];

  const handleAddSchedule = () => {
    showSuccess(t('lessonSchedulePage.addScheduleSuccess'));
    // Logika untuk menambah jadwal baru
    console.log('Tambah Jadwal clicked!');
  };

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
            <DataTable
              columns={columns}
              data={mockData}
              exportFileName="JadwalPelajaran"
              exportTitle={t('sidebar.lessonSchedule')}
              onAddData={handleAddSchedule}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default JadwalPelajaranPage;