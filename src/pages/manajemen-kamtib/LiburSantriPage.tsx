import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, Printer, LogOut, LogIn, Search, Filter } from 'lucide-react';
import {
    useGetHolidayPeriodsQuery,
    useGetHolidayStudentsQuery,
    useToggleRequirementMutation,
    useCheckoutStudentMutation,
    useCheckinStudentMutation
} from '@/store/slices/holidayApi';
import { useGetStudentCardSettingsQuery } from '@/store/slices/studentCardApi';
import { useGetProgramsQuery } from '@/store/slices/programApi';
import { showSuccess, showError } from '@/utils/toast';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useParams, useNavigate } from 'react-router-dom';
import CustomBreadcrumb from '@/components/CustomBreadcrumb';
import { format } from 'date-fns';
import { openHolidayPermitPdf } from '@/components/HolidayPermitPdf';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const LiburSantriPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: periodsResponse } = useGetHolidayPeriodsQuery();
    const periods = periodsResponse?.data || [];
    const { data: settingsResponse } = useGetStudentCardSettingsQuery();
    const settings = settingsResponse?.data;
    const STORAGE_BASE_URL = import.meta.env.VITE_STORAGE_BASE_URL as string;
    const kopSuratUrl = settings?.kop_surat ? `${STORAGE_BASE_URL}${settings.kop_surat}` : undefined;
    
    const { data: programsResponse } = useGetProgramsQuery({ per_page: 100 });
    const programs = programsResponse?.data || [];

    const selectedPeriod = useMemo(() => {
        if (periods.length === 0) return null;
        if (id) {
            const found = periods.find(p => String(p.id) === String(id));
            if (found) return found;
        }
        return periods.find(p => p.status === 'active') || periods[0];
    }, [periods, id]);

    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [programId, setProgramId] = useState<string>('all');
    const [page, setPage] = useState(1);
    const perPage = 10;

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, programId]);

    const { data: studentsResponse, isLoading } = useGetHolidayStudentsQuery(
        { 
            id: selectedPeriod?.id || 0, 
            search: debouncedSearch, 
            program_id: programId === 'all' ? '' : programId, 
            page, 
            per_page: perPage 
        },
        { skip: !selectedPeriod?.id }
    );

    const [toggleRequirement] = useToggleRequirementMutation();
    const [checkout] = useCheckoutStudentMutation();
    const [checkin] = useCheckinStudentMutation();


    const handleToggle = async (studentId: number, requirementId: number) => {
        if (!selectedPeriod) return;
        try {
            await toggleRequirement({ periodId: selectedPeriod.id, studentId, requirementId }).unwrap();
        } catch (err) {
            showError('Gagal memperbarui status');
        }
    };

    const handleCheckout = async (studentId: number) => {
        if (!selectedPeriod) return;
        try {
            await checkout({ periodId: selectedPeriod.id, studentId }).unwrap();
            showSuccess('Kepulangan dicatat');
        } catch (err: any) {
            showError(err.data?.message || 'Gagal mencatat kepulangan');
        }
    };

    const handleCheckin = async (studentId: number) => {
        if (!selectedPeriod) return;
        try {
            await checkin({ periodId: selectedPeriod.id, studentId }).unwrap();
            showSuccess('Kedatangan dicatat');
        } catch (err: any) {
            showError(err.data?.message || 'Gagal mencatat kedatangan');
        }
    };

    const rawStudents = studentsResponse?.data || [];
    const isServerPaginated = studentsResponse && studentsResponse.total !== undefined;
    const totalStudents = isServerPaginated ? studentsResponse.total : rawStudents.length;
    const lastPage = isServerPaginated ? studentsResponse.last_page : Math.ceil(totalStudents / perPage);
    const currentPage = isServerPaginated ? studentsResponse.current_page : page;
    const filteredStudents = isServerPaginated ? rawStudents : rawStudents.slice((page - 1) * perPage, page * perPage);

    const breadcrumbItems = [
        { label: 'Manajemen Kamtib', href: '#' },
        { label: 'Libur Santri', icon: <Printer className="h-4 w-4" /> }
    ];

    if (!selectedPeriod && !isLoading) {
        return (
            <DashboardLayout title="Libur Santri" role="administrasi">
                <div className="container mx-auto p-4">
                    <Card>
                        <CardContent className="py-10 text-center">
                            <h3 className="text-lg font-medium">Tidak ada periode libur aktif</h3>
                            <p className="text-muted-foreground mt-2">Silakan buat periode libur terlebih dahulu di Manajemen Libur.</p>
                        </CardContent>
                    </Card>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Verifikasi Libur" role="administrasi">
            <div className="container mx-auto p-4 space-y-4">
                <CustomBreadcrumb items={breadcrumbItems} />

                <div className="flex flex-col md:flex-row gap-4">
                    <Card className="flex-1">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle>{selectedPeriod?.name}</CardTitle>
                                    <CardDescription>
                                        Waktu Libur: {selectedPeriod && format(new Date(selectedPeriod.start_date), 'dd MMMM')} s/d {selectedPeriod && format(new Date(selectedPeriod.end_date), 'dd MMMM yyyy')}
                                    </CardDescription>
                                </div>
                                <select
                                    className="bg-background border rounded px-2 py-1 text-sm"
                                    value={selectedPeriod?.id}
                                    onChange={(e) => navigate(`/dashboard/manajemen-kamtib/libur-santri/${e.target.value}`)}
                                >
                                    {periodsResponse?.data.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="relative flex-1">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Cari nama santri atau NIS..."
                                        className="pl-8"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <Select value={programId} onValueChange={setProgramId}>
                                    <SelectTrigger className="w-[200px] sm:w-[250px]">
                                        <SelectValue placeholder="Semua Program" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Program</SelectItem>
                                        {programs.map(p => (
                                            <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-muted text-muted-foreground font-medium border-b">
                                        <tr>
                                            <th className="px-4 py-3">Nama Santri</th>
                                            {selectedPeriod?.requirements.map(req => (
                                                <th key={req.id} className="px-4 py-3 text-center">{req.name}</th>
                                            ))}
                                            <th className="px-4 py-3 text-center">Status Pulang/Kembali</th>
                                            <th className="px-4 py-3 text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {isLoading ? (
                                            <tr><td colSpan={10} className="text-center py-10">Memuat data santri...</td></tr>
                                        ) : filteredStudents?.length === 0 ? (
                                            <tr><td colSpan={10} className="text-center py-10 text-muted-foreground italic">Data tidak ditemukan</td></tr>
                                        ) : filteredStudents?.map((student) => (
                                            <tr key={student.id} className="hover:bg-muted/50 transition-colors">
                                                <td className="px-4 py-4">
                                                    <div className="font-medium">{student.name}</div>
                                                    <div className="text-xs text-muted-foreground">{student.nis}</div>
                                                </td>
                                                {student.requirements.map(req => (
                                                    <td key={req.id} className="px-4 py-4 text-center">
                                                        <Button
                                                            onClick={() => handleToggle(student.id, req.id)}
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 w-8 p-0"
                                                        >
                                                            {req.is_met ? (
                                                                <CheckCircle2 className="h-5 w-5 text-success" />
                                                            ) : (
                                                                <Circle className="h-5 w-5 text-muted-foreground/30" />
                                                            )}
                                                        </Button>
                                                    </td>
                                                ))}
                                                <td className="px-4 py-4 text-center">
                                                    <div className="flex flex-col items-center gap-1">
                                                        {student.check?.checkout_at ? (
                                                            <Badge variant="success" className="text-[10px]">
                                                                Pulang: {format(new Date(student.check.checkout_at), 'dd/MM HH:mm')}
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="outline" className="text-[10px]">Belum Pulang</Badge>
                                                        )}
                                                        {student.check?.checkin_at && (
                                                            <Badge variant="default" className="text-[10px]">
                                                                Kembali: {format(new Date(student.check.checkin_at), 'dd/MM HH:mm')}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 text-right space-x-2">
                                                    <div className="flex justify-end gap-2">
                                                        {!student.check?.checkout_at ? (
                                                            <Button
                                                                disabled={!student.is_all_met}
                                                                onClick={() => handleCheckout(student.id)}
                                                                size="sm"
                                                                variant="outline"
                                                                className="h-8 text-[11px]"
                                                            >
                                                                <LogOut className="mr-1 h-3 w-3" /> Checkout
                                                            </Button>
                                                        ) : !student.check?.checkin_at ? (
                                                            <Button
                                                                onClick={() => handleCheckin(student.id)}
                                                                size="sm"
                                                                variant="outline"
                                                                className="h-8 text-[11px]"
                                                            >
                                                                <LogIn className="mr-1 h-3 w-3" /> Checkin
                                                            </Button>
                                                        ) : null}

                                                        <Button
                                                            disabled={!student.is_all_met}
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 w-8 p-0"
                                                            title="Cetak Surat Izin"
                                                            onClick={() => selectedPeriod && openHolidayPermitPdf(selectedPeriod, student, kopSuratUrl)}
                                                        >
                                                            <Printer className="h-4 w-4 text-blue-600" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {totalStudents > 0 && (
                                <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-4 border-t gap-4">
                                    <div className="text-sm text-muted-foreground">
                                        Menampilkan {((currentPage - 1) * perPage) + 1} - {Math.min(currentPage * perPage, totalStudents)} dari {totalStudents} santri
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPage(p => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        <div className="flex items-center justify-center text-sm font-medium px-2">
                                            Halaman {currentPage} / {lastPage}
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPage(p => Math.min(lastPage, p + 1))}
                                            disabled={currentPage === lastPage}
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default LiburSantriPage;
