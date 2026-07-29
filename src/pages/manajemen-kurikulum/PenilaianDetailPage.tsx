import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import CustomBreadcrumb from '@/components/CustomBreadcrumb';
import { Award, ArrowLeft, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import {
    useGetAssessmentDetailQuery,
    useSaveAssessmentScoresMutation
} from '@/store/slices/assessmentApi';
import { useGetAcademicQuartersQuery } from '@/store/slices/tahunAjaranApi';
import { showSuccess, showError, showLoading, dismissToast } from '@/utils/toast';

const PenilaianDetailPage: React.FC = () => {
    const { detailId } = useParams<{ detailId: string }>();
    const navigate = useNavigate();
    const [quarterId, setQuarterId] = useState<string>('');

    const parsedDetailId = parseInt(detailId || '0', 10);

    const { data: detailResponse, isLoading, refetch } = useGetAssessmentDetailQuery(
        { detailId: parsedDetailId, academic_quarter_id: quarterId },
        { skip: !parsedDetailId }
    );
    const [saveScores, { isLoading: isSaving }] = useSaveAssessmentScoresMutation();

    const detailData = detailResponse?.data;

    // Get Academic Year ID from detail to fetch Quarters
    const academicYearId = detailData?.detail?.class_schedule?.academic_year_id;

    // Fetch Quarters
    const { data: quartersRes } = useGetAcademicQuartersQuery(
        { academic_year_id: academicYearId },
        { skip: !academicYearId }
    );
    const quarters = quartersRes?.data || [];

    // Set default quarter
    useEffect(() => {
        if (quarters.length > 0 && !quarterId) {
            const activeQuarter = quarters.find(q => q.active);
            if (activeQuarter) {
                setQuarterId(activeQuarter.id.toString());
            } else {
                setQuarterId(quarters[0].id.toString());
            }
        }
    }, [quarters, quarterId]);
    const students = detailData?.students || [];
    const assessments = detailData?.assessments || {};

    const { register, control, handleSubmit, reset, watch } = useForm({
        defaultValues: {
            assessments: [] as any[]
        }
    });

    const { fields } = useFieldArray({
        control,
        name: "assessments"
    });

    const watchedAssessments = watch("assessments") || [];

    useEffect(() => {
        if (students.length > 0) {
            const formAssessments = students.map((s: any) => {
                const studentAsst = assessments[s.id] || {};
                return {
                    student_id: s.id,
                    first_name: s.first_name,
                    last_name: s.last_name || '',
                    final_score: studentAsst.final_score !== null && studentAsst.final_score !== undefined ? parseFloat(studentAsst.final_score) : '',
                };
            });
            reset({ assessments: formAssessments });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [students, assessments, reset]);

    const breadcrumbItems = [
        { label: 'Kurikulum', href: '/dashboard/manajemen-kurikulum/penilaian', icon: <Award className="h-4 w-4" /> },
        { label: 'Penilaian', href: '/dashboard/manajemen-kurikulum/penilaian' },
        { label: 'Detail' },
    ];

    const getPredikat = (scoreVal: number | string | null | undefined) => {
        if (scoreVal === '' || scoreVal === null || scoreVal === undefined) return '-';
        const num = Number(scoreVal);
        if (isNaN(num)) return '-';
        if (num >= 90) return 'A';
        if (num >= 80) return 'B';
        if (num >= 70) return 'C';
        return 'D';
    };

    const onSubmit = async (data: any) => {
        const toastId = showLoading('Menyimpan nilai...');

        const cleanedAssessments = data.assessments.map((a: any) => {
            const val = a.final_score;
            const numVal = (val !== '' && val !== null && val !== undefined) ? parseFloat(val) : 0;
            return {
                student_id: a.student_id,
                final_score: numVal,
                final_knowledge_score: numVal,
                final_skill_score: numVal,
                attitude_spiritual: null,
                attitude_social: null,
                attitude_description: null,
                knowledge_scores: {},
                skill_scores: {}
            };
        });

        try {
            await saveScores({
                class_schedule_detail_id: parsedDetailId,
                academic_quarter_id: Number(quarterId),
                assessments: cleanedAssessments
            }).unwrap();
            dismissToast(toastId);
            showSuccess('Nilai berhasil disimpan');
            refetch();
        } catch (e) {
            dismissToast(toastId);
            showError('Gagal menyimpan nilai');
        }
    };

    if (isLoading) return <DashboardLayout title="Memuat..." role="administrasi"><div className="p-4">Memuat data...</div></DashboardLayout>;
    if (!detailData) return <DashboardLayout title="Error" role="administrasi"><div className="p-4">Data tidak ditemukan</div></DashboardLayout>;

    const detailInfo = detailData.detail;
    const teacher = detailInfo?.teacher;
    const classroom = detailInfo?.classroom;
    const study = detailInfo?.study;

    return (
        <DashboardLayout title="Detail Penilaian" role="administrasi">
            <div className="container mx-auto py-4 px-4 space-y-6">
                <CustomBreadcrumb items={breadcrumbItems} />

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Input Nilai Siswa</h2>
                        <p className="text-muted-foreground">Kelola nilai akhir pelajaran secara langsung untuk kelas ini.</p>
                    </div>
                    <div className="flex space-x-2">
                        <Select value={quarterId} onValueChange={setQuarterId}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Pilih Kuartal" />
                            </SelectTrigger>
                            <SelectContent>
                                {quarters.map((q: any) => (
                                    <SelectItem key={q.id} value={q.id.toString()}>
                                        {q.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button onClick={() => navigate(-1)} variant="secondary">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Kembali
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader className="pb-4">
                        <CardTitle>Evaluasi: {study?.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            <div className="flex flex-col space-y-1">
                                <span className="text-sm font-medium text-muted-foreground">Guru Pengampu</span>
                                <span className="font-semibold">{teacher?.first_name} {teacher?.last_name}</span>
                            </div>
                            <div className="flex flex-col space-y-1">
                                <span className="text-sm font-medium text-muted-foreground">Kelas</span>
                                <span className="font-semibold">{classroom?.name} ({detailInfo?.classGroup?.name})</span>
                            </div>
                            <div className="flex flex-col space-y-1">
                                <span className="text-sm font-medium text-muted-foreground">Siswa</span>
                                <span className="font-semibold">{students.length} Orang</span>
                            </div>
                        </div>

                        <Separator className="my-4" />

                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="rounded-md border p-0 overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-muted/40">
                                        <TableRow>
                                            <TableHead className="w-12 text-center">No</TableHead>
                                            <TableHead className="min-w-[250px]">Nama Siswa</TableHead>
                                            <TableHead className="w-36 text-center">Nilai Akhir</TableHead>
                                            <TableHead className="w-36 text-center">Predikat</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {fields.map((field, index) => {
                                            const scoreVal = watchedAssessments[index]?.final_score;
                                            const predikat = getPredikat(scoreVal);
                                            let badgeColor = 'bg-gray-100 text-gray-800';
                                            if (predikat === 'A') badgeColor = 'bg-green-100 text-green-800';
                                            else if (predikat === 'B') badgeColor = 'bg-blue-100 text-blue-800';
                                            else if (predikat === 'C') badgeColor = 'bg-yellow-100 text-yellow-800';
                                            else if (predikat === 'D') badgeColor = 'bg-red-100 text-red-800';

                                            return (
                                                <TableRow key={field.id}>
                                                    <TableCell className="text-center">{index + 1}</TableCell>
                                                    <TableCell className="font-medium whitespace-nowrap">{(field as any).first_name} {(field as any).last_name}</TableCell>
                                                    <TableCell>
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            max="100"
                                                            className="h-8 text-center w-24 mx-auto font-bold"
                                                            {...register(`assessments.${index}.final_score`)}
                                                        />
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {predikat !== '-' ? (
                                                            <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${badgeColor}`}>
                                                                {predikat}
                                                            </div>
                                                        ) : (
                                                            '-'
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                        {fields.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">Tidak ada siswa di kelas ini</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                            <div className="bg-muted p-4 rounded-md text-sm mt-4">
                                <p className="font-semibold mb-1">Catatan Predikat:</p>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    <div><span className="font-bold text-green-600">A</span> : 90 - 100 (Sangat Baik)</div>
                                    <div><span className="font-bold text-blue-600">B</span> : 80 - 89 (Baik)</div>
                                    <div><span className="font-bold text-yellow-600">C</span> : 70 - 79 (Cukup)</div>
                                    <div><span className="font-bold text-red-600">D</span> : &lt; 70 (Perlu Bimbingan)</div>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end">
                                <Button type="submit" disabled={isSaving}>
                                    <Save className="w-4 h-4 mr-2" />
                                    Simpan Semua Nilai
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default PenilaianDetailPage;
