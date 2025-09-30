import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import CustomBreadcrumb, { type BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { BookCopy, UserCheck, Clock } from 'lucide-react';
import { DataTable } from '@/components/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { useGetClassSchedulesQuery } from '@/store/slices/classScheduleApi';
import { useGetTeachersQuery } from '@/store/slices/teacherApi';
import { useGetProgramsQuery } from '@/store/slices/programApi';
import { useGetEducationLevelsQuery } from '@/store/slices/educationApi';
import { useGetTahunAjaranQuery } from '@/store/slices/tahunAjaranApi';
import TableLoadingSkeleton from '@/components/TableLoadingSkeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PresensiData {
  id: number;
  mataPelajaran: string;
  guruPengampu: string;
  jenjangPendidikan: string;
  kelas: string;
  rombel: string;
  tahunAjaran: string;
  status: string;
}

// Tambahkan interface untuk Education yang benar
interface EducationInstitution {
  id: number;
  institution_name: string;
  [key: string]: any;
}

const PresensiPage: React.FC = () => {
  const navigate = useNavigate();
  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: 'Kurikulum', href: '/dashboard/manajemen-kurikulum/presensi', icon: <BookCopy className="h-4 w-4" /> },
    { label: 'Presensi', icon: <UserCheck className="h-4 w-4" /> },
  ];

  // Mengambil data dari API
  const { data: classSchedulesResponse, isLoading: isLoadingSchedules } = useGetClassSchedulesQuery();
  const { data: teachersResponse, isLoading: isLoadingTeachers } = useGetTeachersQuery();
  const { data: programsResponse, isLoading: isLoadingPrograms } = useGetProgramsQuery();
  const { data: educationLevelsResponse, isLoading: isLoadingEducationLevels } = useGetEducationLevelsQuery();
  const { data: academicYearsResponse, isLoading: isLoadingAcademicYears } = useGetTahunAjaranQuery();

  const isLoading = isLoadingSchedules || isLoadingTeachers || isLoadingPrograms || isLoadingEducationLevels || isLoadingAcademicYears;

  // Memproses data untuk tabel
  const presensiData = React.useMemo(() => {
    if (isLoading || !classSchedulesResponse || !teachersResponse || !programsResponse || !educationLevelsResponse || !academicYearsResponse) {
      return [];
    }

    if (!classSchedulesResponse.data || !Array.isArray(classSchedulesResponse.data)) {
      return [];
    }

    // Membuat peta untuk pencarian cepat
    const teacherMap = new Map(teachersResponse.data.map((t: any) => [t.staff.id, t]));
    const programMap = new Map(programsResponse.map((p: any) => [p.id, p]));
    const educationLevelMap = new Map((educationLevelsResponse as any).data.map((l: any) => [l.id, l]));
    const academicYearMap = new Map(academicYearsResponse.map((ay: any) => [ay.id, ay]));

    // Memproses data dari class schedules
    const processedData: PresensiData[] = [];
    
    classSchedulesResponse.data.forEach((schedule) => {
      if (schedule.details && Array.isArray(schedule.details)) {
        schedule.details.forEach((detail) => {
          const teacher = detail.teacher;
          const classroom = detail.classroom;
          const classGroup = detail.class_group;
          const study = detail.study;
          const academicYear = schedule.academic_year;
          const education = schedule.education; // Ambil data education dari schedule

          processedData.push({
            id: detail.id,
            mataPelajaran: study ? study.name : 'Tidak diketahui',
            guruPengampu: teacher ? `${teacher.first_name} ${teacher.last_name || ''}`.trim() : 'Tidak diketahui',
            jenjangPendidikan: education ? (education as any).institution_name : 'Tidak diketahui', // Gunakan any untuk menghindari konflik tipe
            kelas: classroom ? classroom.name : 'Tidak diketahui',
            rombel: classGroup ? classGroup.name : 'Tidak diketahui',
            tahunAjaran: academicYear ? (academicYear.year || (academicYear as any).name) : 'Tidak diketahui',
            status: 'Belum dimulai', // Status default
          });
        });
      }
    });

    return processedData;
  }, [classSchedulesResponse, teachersResponse, programsResponse, educationLevelsResponse, academicYearsResponse, isLoading]);

  // Kolom untuk tabel
  const columns: ColumnDef<PresensiData>[] = [
    {
      accessorKey: 'mataPelajaran',
      header: 'Mata Pelajaran',
    },
    {
      accessorKey: 'guruPengampu',
      header: 'Guru Pengampu',
    },
    {
      accessorKey: 'jenjangPendidikan',
      header: 'Jenjang Pendidikan',
    },
    {
      accessorKey: 'kelas',
      header: 'Kelas',
    },
    {
      accessorKey: 'rombel',
      header: 'Rombel',
    },
    {
      accessorKey: 'tahunAjaran',
      header: 'Tahun Ajaran',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        return (
          <Badge variant="secondary">{status}</Badge>
        );
      },
    },
    {
      id: 'actions',
      header: 'Aksi',
      cell: ({ row }) => {
        const data = row.original;
        return (
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleViewDetail(data)}
              className="h-8"
            >
              <Eye className="h-4 w-4 mr-1" />
              Detail
            </Button>
          </div>
        );
      },
    },
  ];

  // Fungsi untuk melihat detail presensi
  const handleViewDetail = (data: PresensiData) => {
    navigate(`/dashboard/manajemen-kurikulum/presensi/${data.id}`);
  };

  // Fungsi untuk menambah data presensi
  const handleAddData = () => {
    // Implementasi untuk menambah data presensi
    console.log('Menambah data presensi');
  };

  return (
    <DashboardLayout title="Manajemen Presensi" role="administrasi">
      <div className="container mx-auto py-4 px-4">
        <CustomBreadcrumb items={breadcrumbItems} />
        <Card>
          <CardHeader>
            <CardTitle>Presensi</CardTitle>
            <CardDescription>Daftar presensi berdasarkan jadwal pelajaran yang tersedia.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <TableLoadingSkeleton />
            ) : (
              <DataTable 
                columns={columns} 
                data={presensiData} 
                exportFileName="data-presensi" 
                exportTitle="Data Presensi"
                onAddData={handleAddData}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PresensiPage;