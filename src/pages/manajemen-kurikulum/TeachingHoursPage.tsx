import React, { useState, useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import { MoreHorizontal } from 'lucide-react';

import DashboardLayout from '@/layouts/DashboardLayout';
import { DataTable } from '@/components/DataTable';
import CustomBreadcrumb from '@/components/CustomBreadcrumb';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useGetTahunAjaranQuery } from '@/store/slices/tahunAjaranApi';
import { AcademicYear } from '@/types/pendidikan';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// NOTE: Ini adalah tipe data placeholder. Perlu disesuaikan dengan API sebenarnya.
interface TeachingHour {
  id: string;
  teacherName: string;
  teacherId: string;
  subjectName: string;
  subjectId: string;
  totalHours: number;
}

// Data contoh untuk demonstrasi. Nantinya akan diganti dengan data dari API.
const mockData: TeachingHour[] = [
  { id: '1', teacherName: 'Dr. Budi Santoso', teacherId: 'T001', subjectName: 'Matematika Wajib', subjectId: 'M01', totalHours: 24 },
  { id: '2', teacherName: 'Dr. Budi Santoso', teacherId: 'T001', subjectName: 'Fisika', subjectId: 'F01', totalHours: 18 },
  { id: '3', teacherName: 'Prof. Citra Lestari', teacherId: 'T002', subjectName: 'Bahasa Indonesia', subjectId: 'B01', totalHours: 22 },
  { id: '4', teacherName: 'Prof. Citra Lestari', teacherId: 'T002', subjectName: 'Sejarah Indonesia', subjectId: 'S01', totalHours: 16 },
  { id: '5', teacherName: 'Ahmad Dahlan, S.Pd.', teacherId: 'T003', subjectName: 'Pendidikan Agama Islam', subjectId: 'A01', totalHours: 20 },
  { id: '6', teacherName: 'Ahmad Dahlan, S.Pd.', teacherId: 'T003', subjectName: 'Bahasa Arab', subjectId: 'B02', totalHours: 20 },
  { id: '7', teacherName: 'Siti Aminah, M.Kom.', teacherId: 'T004', subjectName: 'Informatika', subjectId: 'I01', totalHours: 24 },
];

const TeachingHoursPage: React.FC = () => {
  const { t } = useTranslation();
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string | undefined>();

  const { data: academicYears, isLoading: isLoadingAcademicYears } = useGetTahunAjaranQuery();

  // TODO: Ganti mockData dengan data dari API. API kemungkinan akan menerima `academicYearId`.
  const { data, isLoading, isError } = {
    data: mockData,
    isLoading: false,
    isError: false,
  };

  const breadcrumbItems = [
    { label: t('sidebar.curriculum'), href: '#' },
    { label: t('sidebar.teachingHours') },
  ];

  const columns: ColumnDef<TeachingHour>[] = useMemo(() => [
    {
      id: 'no',
      header: 'No',
      cell: ({ row, table }) => {
        const pageIndex = (table.getState().pagination.pageIndex || 0);
        const pageSize = table.getState().pagination.pageSize;
        return pageIndex * pageSize + row.index + 1;
      },
      size: 50,
    },
    {
      accessorKey: 'teacherName',
      header: t('teachingHoursPage.teacherName'),
    },
    {
      accessorKey: 'subjectName',
      header: t('teachingHoursPage.subjectName'),
    },
    {
      accessorKey: 'totalHours',
      header: t('teachingHoursPage.totalHours'),
      cell: ({ row }) => (
        <div className="text-center">
          <Badge variant="secondary">{row.original.totalHours} Jam</Badge>
        </div>
      ),
      size: 150,
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const teachingHour = row.original;
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
                <DropdownMenuItem onClick={() => alert(`Lihat detail untuk ${teachingHour.teacherName}`)}>
                  {t('actions.viewDetails')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
      size: 100,
    },
  ], [t]);

  if (isError) {
    return (
      <DashboardLayout title={t('sidebar.teachingHours')} role="administrasi">
        <div className="container mx-auto p-4 text-center">
          <p>{t('teachingHoursPage.error')}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={t('sidebar.teachingHours')} role="administrasi">
      <div className="container mx-auto p-4">
        <CustomBreadcrumb items={breadcrumbItems} />
        
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>{t('sidebar.teachingHours')}</CardTitle>
            <CardDescription>{t('teachingHoursPage.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <label htmlFor="academic-year-select" className="block text-sm font-medium text-gray-700 mb-1">
                {t('sidebar.academicYear')}
              </label>
              {isLoadingAcademicYears ? (
                <Skeleton className="h-10 w-full md:w-1/4" />
              ) : (
                <Select
                  value={selectedAcademicYear}
                  onValueChange={setSelectedAcademicYear}
                >
                  <SelectTrigger id="academic-year-select" className="w-full md:w-1/4">
                    <SelectValue placeholder={t('teachingHoursPage.selectAcademicYear')} />
                  </SelectTrigger>
                  <SelectContent>
                    {academicYears?.map((year: AcademicYear) => (
                      <SelectItem key={year.id} value={String(year.id)}>
                        {`${year.year} - ${t(((year.semester || '') as string).toLowerCase() as 'ganjil' | 'genap')}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <DataTable
              columns={columns}
              data={data || []}
              isLoading={isLoading}
              exportFileName="jam_mengajar"
              exportTitle={t('sidebar.teachingHours')}
              filterableColumns={{
                teacherName: { placeholder: t('teachingHoursPage.filterByTeacher') },
                subjectName: { placeholder: t('teachingHoursPage.filterBySubject') },
              }}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default TeachingHoursPage;