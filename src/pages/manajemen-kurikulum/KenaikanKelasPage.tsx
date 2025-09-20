import React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import CustomBreadcrumb, { type BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { BookCopy, TrendingUp } from 'lucide-react';
import { useGetStudentsQuery } from '@/store/slices/studentApi';
import { useGetProgramsQuery } from '@/store/slices/programApi';
import { useGetEducationGroupsQuery } from '@/store/slices/educationGroupApi';
import { useGetEducationLevelsQuery } from '@/store/slices/educationApi';
import { DataTable } from '@/components/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import TableLoadingSkeleton from '@/components/TableLoadingSkeleton';

// Tipe data untuk baris tabel
interface PromotionData {
  id: number;
  siswa: string;
  tahunAjaran: string;
  kelas: string;
  jenjangPendidikan: string;
}

const KenaikanKelasPage: React.FC = () => {
  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: 'Kurikulum', href: '/dashboard/manajemen-kurikulum/kenaikan-kelas', icon: <BookCopy className="h-4 w-4" /> },
    { label: 'Kenaikan Kelas', icon: <TrendingUp className="h-4 w-4" /> },
  ];

  // Mengambil semua data yang diperlukan dari API
  const { data: studentsResponse, isLoading: isLoadingStudents } = useGetStudentsQuery();
  const { data: programsResponse, isLoading: isLoadingPrograms } = useGetProgramsQuery();
  const { data: groupsResponse, isLoading: isLoadingGroups } = useGetEducationGroupsQuery();
  const { data: levelsResponse, isLoading: isLoadingLevels } = useGetEducationLevelsQuery();

  const isLoading = isLoadingStudents || isLoadingPrograms || isLoadingGroups || isLoadingLevels;

  // Memproses dan menggabungkan data setelah semua selesai dimuat
  const promotionData = React.useMemo(() => {
    if (isLoading || !studentsResponse || !programsResponse || !groupsResponse || !levelsResponse) {
      return [];
    }

    // Asumsi struktur data response API
    const programs = programsResponse || [];
    const groups = (groupsResponse as any).data || [];
    const levels = (levelsResponse as any).data || [];

    // Membuat peta untuk pencarian cepat
    const programMap = new Map(programs.map((p: any) => [p.id, p]));
    const groupMap = new Map(groups.map((g: any) => [g.code, g]));
    const levelMap = new Map(levels.map((l: any) => [l.id, l]));

    return studentsResponse.data.map((student): PromotionData => {
      const program = programMap.get(student.program.id);
      const group = program ? groupMap.get((program as any).education_group_id) : undefined;
      const level = group ? levelMap.get((group as any).education_level_id) : undefined;

      return {
        id: student.id,
        siswa: `${student.first_name} ${student.last_name || ''}`.trim(),
        tahunAjaran: student.period,
        kelas: student.program.name,
        jenjangPendidikan: level ? (level as any).name : 'Tidak diketahui',
      };
    });
  }, [studentsResponse, programsResponse, groupsResponse, levelsResponse, isLoading]);

  // Mendefinisikan kolom untuk DataTable
  const columns: ColumnDef<PromotionData>[] = [
    {
      accessorKey: 'tahunAjaran',
      header: 'Tahun Ajaran',
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
      accessorKey: 'siswa',
      header: 'Siswa',
    },
  ];

  return (
    <DashboardLayout title="Manajemen Kenaikan Kelas" role="administrasi">
      <div className="container mx-auto py-4 px-4">
        <CustomBreadcrumb items={breadcrumbItems} />
        <Card>
          <CardHeader>
            <CardTitle>Kenaikan Kelas</CardTitle>
            <CardDescription>Daftar siswa aktif berdasarkan kelas untuk proses kenaikan kelas.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <TableLoadingSkeleton />
            ) : (
              <DataTable columns={columns} data={promotionData} exportFileName="data-kenaikan-kelas" exportTitle="Data Kenaikan Kelas" />
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default KenaikanKelasPage;