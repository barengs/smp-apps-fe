import React, { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import { MoreHorizontal, PlusCircle } from 'lucide-react';

import DashboardLayout from '@/layouts/DashboardLayout';
import { DataTable } from '@/components/DataTable';
import CustomBreadcrumb from '@/components/CustomBreadcrumb';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { JamPelajaran } from '@/types/kurikulum';
import { Badge } from '@/components/ui/badge';

// Data contoh untuk demonstrasi. Nantinya akan diganti dengan data dari API.
const mockJamPelajaran: JamPelajaran[] = [
  { id: 1, lesson_hour: 1, start_time: '07:00', end_time: '07:45', description: 'Pelajaran Pagi' },
  { id: 2, lesson_hour: 2, start_time: '07:45', end_time: '08:30', description: 'Pelajaran Pagi' },
  { id: 3, lesson_hour: 3, start_time: '08:30', end_time: '09:15', description: 'Pelajaran Pagi' },
  { id: 4, lesson_hour: 4, start_time: '09:15', end_time: '10:00', description: 'Pelajaran Pagi' },
  { id: 5, lesson_hour: 0, start_time: '10:00', end_time: '10:15', description: 'Istirahat' },
  { id: 6, lesson_hour: 5, start_time: '10:15', end_time: '11:00', description: 'Pelajaran Siang' },
  { id: 7, lesson_hour: 6, start_time: '11:00', end_time: '11:45', description: 'Pelajaran Siang' },
  { id: 8, lesson_hour: 7, start_time: '11:45', end_time: '12:30', description: 'Pelajaran Siang' },
];

const JamPelajaranPage: React.FC = () => {
  const { t } = useTranslation();

  // TODO: Ganti dengan hook dari RTK Query setelah API tersedia
  const { data, isLoading, isError } = {
    data: mockJamPelajaran,
    isLoading: false,
    isError: false,
  };

  const breadcrumbItems = [
    { label: t('sidebar.curriculum'), href: '#' },
    { label: t('sidebar.lessonHours') },
  ];

  const columns: ColumnDef<JamPelajaran>[] = useMemo(() => [
    {
      accessorKey: 'lesson_hour',
      header: t('lessonHoursPage.lessonHour'),
      cell: ({ row }) => {
        const jam = row.original;
        return jam.lesson_hour === 0 ? <Badge variant="outline">Istirahat</Badge> : `Jam ke-${jam.lesson_hour}`;
      },
      size: 100,
    },
    {
      accessorKey: 'start_time',
      header: t('lessonHoursPage.startTime'),
      size: 150,
    },
    {
      accessorKey: 'end_time',
      header: t('lessonHoursPage.endTime'),
      size: 150,
    },
    {
      accessorKey: 'description',
      header: t('lessonHoursPage.description'),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const jam = row.original;
        return (
          <div className="text-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Buka menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{t('actions.title')}</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => alert(`Edit jam ${jam.id}`)}>
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => alert(`Hapus jam ${jam.id}`)} className="text-destructive">
                  Hapus
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
      size: 100,
    },
  ], [t]);

  const handleAddData = () => {
    // TODO: Implement navigation to form or show a dialog
    alert('Tambah data jam pelajaran baru');
  };

  if (isError) {
    return (
      <DashboardLayout title={t('sidebar.lessonHours')} role="administrasi">
        <div className="container mx-auto p-4 text-center">
          <p>Gagal memuat data jam pelajaran.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={t('sidebar.lessonHours')} role="administrasi">
      <div className="container mx-auto p-4">
        <CustomBreadcrumb items={breadcrumbItems} />
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>{t('lessonHoursPage.title')}</CardTitle>
            <CardDescription>{t('lessonHoursPage.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={data || []}
              isLoading={isLoading}
              exportFileName="jam_pelajaran"
              exportTitle={t('lessonHoursPage.title')}
              onAddData={handleAddData}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default JamPelajaranPage;