import React, { useState, useMemo } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import CustomBreadcrumb, { BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { BookCopy, Award, Printer, Users } from 'lucide-react';
import { DataTable } from '@/components/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { useGetClassGroupDetailsQuery } from '@/store/slices/classGroupApi';
import { useGetClassStudentsForReportQuery } from '@/store/slices/reportCardApi';
import { useGetActiveTahunAjaranQuery, useGetTahunAjaranQuery } from '@/store/slices/tahunAjaranApi';
import TableLoadingSkeleton from '@/components/TableLoadingSkeleton';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const RaportPage: React.FC = () => {
    const navigate = useNavigate();
    const [selectedClassGroupId, setSelectedClassGroupId] = useState<number | null>(null);
    const [selectedSemester, setSelectedSemester] = useState<string>('1');
    const [selectedAcademicYearId, setSelectedAcademicYearId] = useState<string>('');

    const breadcrumbItems: BreadcrumbItemData[] = [
        { label: 'Kurikulum', href: '/dashboard/manajemen-kurikulum/raport', icon: <BookCopy className="h-4 w-4" /> },
        { label: 'Cetak Raport', icon: <Award className="h-4 w-4" /> },
    ];

    // Get active academic year for initial default
    const { data: activeAcademicYear } = useGetActiveTahunAjaranQuery();

    // Fetch all academic years for selection
    const { data: academicYears = [] } = useGetTahunAjaranQuery();

    React.useEffect(() => {
        if (activeAcademicYear && !selectedAcademicYearId) {
            setSelectedAcademicYearId(activeAcademicYear.id.toString());
        }
    }, [activeAcademicYear, selectedAcademicYearId]);

    // Get all Class Groups filtered by selected year
    const { data: classGroupRes, isLoading: isLoadingClassGroups } = useGetClassGroupDetailsQuery(
        selectedAcademicYearId ? { academic_year_id: Number(selectedAcademicYearId) } : undefined,
        { skip: !selectedAcademicYearId }
    );
    const classGroups = classGroupRes?.data || [];

    // Get students if a class is selected
    const { data: studentsRes, isLoading: isLoadingStudents, isFetching: isFetchingStudents } = useGetClassStudentsForReportQuery(
        { classGroupId: selectedClassGroupId!, semester: selectedSemester, academic_year_id: selectedAcademicYearId },
        { skip: !selectedClassGroupId || !selectedAcademicYearId }
    );
    const studentsData = studentsRes?.data?.students || [];

    const classColumns: ColumnDef<any>[] = useMemo(() => [
        { accessorKey: 'name', header: 'Nama Rombel' },
        { accessorKey: 'classroom.name', header: 'Kelas' },
        { accessorKey: 'advisor.user.name', header: 'Wali Kelas', cell: ({ row }: any) => row.original.advisor?.user?.name || 'Belum Ditentukan' },
        { accessorKey: 'total_students', header: 'Total Siswa' },
        {
            id: 'actions',
            header: 'Aksi',
            cell: ({ row }: any) => (
                <Button variant="outline" size="sm" onClick={() => setSelectedClassGroupId(row.original.id)}>
                    <Users className="h-4 w-4 mr-2" />
                    Pilih Kelas
                </Button>
            ),
        },
    ], []);

    const studentColumns: ColumnDef<any>[] = useMemo(() => [
        { accessorKey: 'nisn', header: 'NISN' },
        { accessorKey: 'first_name', header: 'Nama Depan' },
        { accessorKey: 'last_name', header: 'Nama Belakang' },
        {
            id: 'actions',
            header: 'Aksi',
            cell: ({ row }: any) => (
                <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate(`/dashboard/manajemen-kurikulum/raport/${selectedClassGroupId}/cetak/${row.original.id}?semester=${selectedSemester}&academic_year_id=${selectedAcademicYearId}`)}
                >
                    <Printer className="h-4 w-4 mr-2" />
                    Buka Raport
                </Button>
            ),
        },
    ], [navigate, selectedClassGroupId, selectedSemester, selectedAcademicYearId]);

    return (
        <DashboardLayout title="Manajemen Raport" role="administrasi">
            <div className="container mx-auto py-4 px-4 space-y-6">
                <CustomBreadcrumb items={breadcrumbItems} />

                {/* PILIH KELAS */}
                {!selectedClassGroupId ? (
                    <Card>
                        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <CardTitle>Pilih Rombel / Kelas</CardTitle>
                                <CardDescription>Pilih rombongan belajar untuk melihat daftar siswa dan mencetak raport.</CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">Tahun Ajaran:</span>
                                <Select value={selectedAcademicYearId} onValueChange={setSelectedAcademicYearId}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Pilih Tahun Ajaran" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {academicYears.map((ay: any) => (
                                            <SelectItem key={ay.id} value={ay.id.toString()}>
                                                {ay.year} {ay.periode ? `(${ay.periode})` : ''}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {isLoadingClassGroups ? (
                                <TableLoadingSkeleton />
                            ) : (
                                <DataTable
                                    columns={classColumns}
                                    data={classGroups}
                                    searchPlaceholder="Cari kelas..."
                                    totalItems={classGroups.length}
                                />
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    /* PILIH SISWA */
                    <Card>
                        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <CardTitle>Daftar Siswa</CardTitle>
                                <CardDescription>
                                    Kelas: <strong>{classGroups.find((c: any) => c.id === selectedClassGroupId)?.name}</strong>.
                                    Pilih siswa untuk melihat dan mencetak raport.
                                </CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">Semester:</span>
                                <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                                    <SelectTrigger className="w-[120px]">
                                        <SelectValue placeholder="Semester" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">Ganjil (1)</SelectItem>
                                        <SelectItem value="2">Genap (2)</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button variant="outline" onClick={() => setSelectedClassGroupId(null)}>
                                    Kembali ke Daftar Kelas
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {isLoadingStudents || isFetchingStudents ? (
                                <TableLoadingSkeleton />
                            ) : (
                                <DataTable
                                    columns={studentColumns}
                                    data={studentsData}
                                    searchPlaceholder="Cari siswa..."
                                    totalItems={studentsData.length}
                                />
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </DashboardLayout>
    );
};

export default RaportPage;
