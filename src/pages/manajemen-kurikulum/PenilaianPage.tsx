import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import CustomBreadcrumb, { type BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { BookCopy, Award, Eye } from 'lucide-react';
import { DataTable } from '@/components/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { useGetClassSchedulesQuery } from '@/store/slices/classScheduleApi';
import TableLoadingSkeleton from '@/components/TableLoadingSkeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface PenilaianData {
    id: number;
    mataPelajaran: string;
    guruPengampu: string;
    jenjangPendidikan: string;
    kelas: string;
    rombel: string;
    tahunAjaran: string;
    status: string;
}

const PenilaianPage: React.FC = () => {
    const navigate = useNavigate();
    const breadcrumbItems: BreadcrumbItemData[] = [
        { label: 'Kurikulum', href: '/dashboard/manajemen-kurikulum/penilaian', icon: <BookCopy className="h-4 w-4" /> },
        { label: 'Penilaian', icon: <Award className="h-4 w-4" /> },
    ];

    // Mengambil data jadwal kelas
    const { data: classSchedulesResponse, isLoading: isLoadingSchedules } = useGetClassSchedulesQuery({});

    // Memproses data untuk tabel
    const penilaianData = React.useMemo(() => {
        if (isLoadingSchedules || !classSchedulesResponse) {
            return [];
        }

        const schedulesArray =
            Array.isArray(classSchedulesResponse)
                ? classSchedulesResponse
                : Array.isArray(classSchedulesResponse.data)
                    ? classSchedulesResponse.data
                    : [];

        if (!schedulesArray.length) {
            return [];
        }

        const processedData: PenilaianData[] = [];

        schedulesArray.forEach((schedule) => {
            if (schedule.details && Array.isArray(schedule.details)) {
                // Hitung status penilaian berdasarkan tahun ajaran aktif dan status jadwal
                const isAcademicYearActive = schedule.academic_year?.active === true;
                const isScheduleActive = schedule.status === 'aktif' || schedule.status === 'active';
                const statusAvailable = (isAcademicYearActive && isScheduleActive) ? 'Aktif' : 'Belum Dimulai';

                schedule.details.forEach((detail) => {
                    const teacher = detail.teacher;
                    const classroom = detail.classroom;
                    const classGroup = detail.class_group;
                    const study = detail.study;
                    const academicYear = schedule.academic_year;
                    const education = schedule.education;

                    processedData.push({
                        id: detail.id,
                        mataPelajaran: study ? study.name : 'Tidak diketahui',
                        guruPengampu: teacher ? `${teacher.first_name} ${teacher.last_name || ''}`.trim() : 'Tidak diketahui',
                        jenjangPendidikan: education ? (education as any).institution_name : 'Tidak diketahui',
                        kelas: classroom ? classroom.name : 'Tidak diketahui',
                        rombel: classGroup ? classGroup.name : 'Tidak diketahui',
                        tahunAjaran: academicYear ? (academicYear.year || (academicYear as any).name) : 'Tidak diketahui',
                        status: statusAvailable,
                    });
                });
            }
        });

        return processedData;
    }, [classSchedulesResponse, isLoadingSchedules]);

    // Opsi filter unik untuk Kelas dan Rombel
    const kelasOptions = React.useMemo(
        () =>
            Array.from(
                new Set(
                    (penilaianData || [])
                        .map((r) => r.kelas)
                        .filter((v): v is string => typeof v === 'string' && v.trim() !== '')
                )
            ).map((name) => ({ label: name, value: name })),
        [penilaianData]
    );

    const rombelOptions = React.useMemo(
        () =>
            Array.from(
                new Set(
                    (penilaianData || [])
                        .map((r) => r.rombel)
                        .filter((v): v is string => typeof v === 'string' && v.trim() !== '')
                )
            ).map((name) => ({ label: name, value: name })),
        [penilaianData]
    );

    // Fungsi navigasi ke detail
    const handleNavigateDetail = (id: number) => {
        navigate(`/dashboard/manajemen-kurikulum/penilaian/${id}`);
    };

    const columns: ColumnDef<PenilaianData>[] = [
        { accessorKey: 'mataPelajaran', header: 'Mata Pelajaran' },
        { accessorKey: 'guruPengampu', header: 'Guru Pengampu' },
        { accessorKey: 'kelas', header: 'Kelas' },
        { accessorKey: 'rombel', header: 'Rombel' },
        { accessorKey: 'tahunAjaran', header: 'Tahun Ajaran' },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => {
                const isAktif = row.getValue('status') === 'Aktif';
                return (
                    <Badge
                        variant={isAktif ? 'default' : 'secondary'}
                        className={isAktif ? 'bg-green-500 hover:bg-green-600 text-white' : ''}
                    >
                        {row.getValue('status') as string}
                    </Badge>
                );
            },
        },
        {
            id: 'actions',
            header: 'Aksi',
            cell: ({ row }) => {
                return (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleNavigateDetail(row.original.id)}
                        className="h-8"
                    >
                        <Eye className="h-4 w-4 mr-1" />
                        Detail
                    </Button>
                );
            },
        },
    ];

    return (
        <DashboardLayout title="Manajemen Penilaian" role="administrasi">
            <div className="container mx-auto py-4 px-4">
                <CustomBreadcrumb items={breadcrumbItems} />
                <Card>
                    <CardHeader>
                        <CardTitle>Penilaian Akademik</CardTitle>
                        <CardDescription>Daftar mata pelajaran beserta kelas untuk mengatur penilaian siswa.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoadingSchedules ? (
                            <TableLoadingSkeleton />
                        ) : (
                            <DataTable
                                columns={columns}
                                data={penilaianData}
                                exportFileName="data-penilaian"
                                exportTitle="Data Penilaian"
                                onRowClick={(row) => handleNavigateDetail(row.id)}
                                filterableColumns={{
                                    kelas: { type: 'select', placeholder: 'Kelas', options: kelasOptions },
                                    rombel: { type: 'select', placeholder: 'Rombel', options: rombelOptions },
                                    status: {
                                        type: 'select',
                                        placeholder: 'Status',
                                        options: [
                                            { label: 'Aktif', value: 'Aktif' },
                                            { label: 'Belum Dimulai', value: 'Belum Dimulai' },
                                        ],
                                    },
                                }}
                            />
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default PenilaianPage;
