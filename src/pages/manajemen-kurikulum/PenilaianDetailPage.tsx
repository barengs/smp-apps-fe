import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import CustomBreadcrumb from '@/components/CustomBreadcrumb';
import { Award, ArrowLeft, Save, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import {
    useGetAssessmentDetailQuery,
    useGetAssessmentFormulaQuery,
    useSaveAssessmentScoresMutation,
    AssessmentComponent
} from '@/store/slices/assessmentApi';
import PenilaianFormulaDialog from './PenilaianFormulaDialog';
import { showSuccess, showError, showLoading, dismissToast } from '@/utils/toast';

const PenilaianDetailPage: React.FC = () => {
    const { detailId } = useParams<{ detailId: string }>();
    const navigate = useNavigate();
    const [semester, setSemester] = useState<'1' | '2'>('1');
    const [isFormulaDialogOpen, setFormulaDialogOpen] = useState(false);

    const parsedDetailId = parseInt(detailId || '0', 10);

    const { data: detailResponse, isLoading, refetch } = useGetAssessmentDetailQuery({ detailId: parsedDetailId, semester });
    const { data: formulaResponse, refetch: refetchFormula } = useGetAssessmentFormulaQuery(parsedDetailId);
    const [saveScores, { isLoading: isSaving }] = useSaveAssessmentScoresMutation();

    const formula = formulaResponse?.data;
    const detailData = detailResponse?.data;
    const students = detailData?.students || [];
    const assessments = detailData?.assessments || {};

    const knowledgeComponents: AssessmentComponent[] = Array.isArray(formula?.knowledge_formula)
        ? formula.knowledge_formula
        : [];

    const skillComponents: AssessmentComponent[] = Array.isArray(formula?.skill_formula)
        ? formula.skill_formula
        : [];

    const { register, control, handleSubmit, reset } = useForm({
        defaultValues: {
            assessments: [] as any[]
        }
    });

    const { fields } = useFieldArray({
        control,
        name: "assessments"
    });

    useEffect(() => {
        if (students.length > 0) {
            const formAssessments = students.map((s: any) => {
                const studentAsst = assessments[s.id] || {};
                const assessmentScoresList = studentAsst.assessment_scores || [];

                // Convert list back to Map of component -> score
                const scoresMap: Record<string, number> = {};
                assessmentScoresList.forEach((as: any) => {
                    scoresMap[as.component] = parseFloat(as.score);
                });

                const formData: any = {
                    student_id: s.id,
                    first_name: s.first_name,
                    last_name: s.last_name || '',
                    attitude_spiritual: studentAsst.attitude_spiritual || '',
                    attitude_social: studentAsst.attitude_social || '',
                    attitude_description: studentAsst.attitude_description || '',
                    final_knowledge_score: studentAsst.final_knowledge_score || '',
                    final_skill_score: studentAsst.final_skill_score || '',
                    final_score: studentAsst.final_score || '',
                    knowledge_scores: {},
                    skill_scores: {}
                };

                // Map knowledge components to formData
                knowledgeComponents.forEach(kc => {
                    formData.knowledge_scores[kc.name] = scoresMap[kc.name] || '';
                });

                // Map skill components to formData
                skillComponents.forEach(sc => {
                    formData.skill_scores[sc.name] = scoresMap[sc.name] || '';
                });

                return formData;
            });
            reset({ assessments: formAssessments });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [students, assessments, formula, reset]);

    const breadcrumbItems = [
        { label: 'Kurikulum', href: '/dashboard/manajemen-kurikulum/penilaian', icon: <Award className="h-4 w-4" /> },
        { label: 'Penilaian', href: '/dashboard/manajemen-kurikulum/penilaian' },
        { label: 'Detail' },
    ];

    const onSubmit = async (data: any) => {
        const toastId = showLoading('Menyimpan nilai...');

        const cleanedAssessments = data.assessments.map((a: any) => {
            const cleanData: any = {
                student_id: a.student_id,
                knowledge_scores: {},
                skill_scores: {},
                attitude_spiritual: a.attitude_spiritual || null,
                attitude_social: a.attitude_social || null,
                attitude_description: a.attitude_description || null,
                final_knowledge_score: 0,
                final_skill_score: 0,
                final_score: 0
            };

            let totalKnowledgeScore = 0;
            let totalSkillScore = 0;

            // Process Knowledge Scores dynamically
            knowledgeComponents.forEach(kc => {
                const val = a.knowledge_scores?.[kc.name];
                if (val !== undefined && val !== '') {
                    const numVal = parseFloat(val);
                    cleanData.knowledge_scores[kc.name] = numVal;
                    totalKnowledgeScore += (numVal * kc.weight / 100);
                }
            });
            cleanData.final_knowledge_score = totalKnowledgeScore;

            // Process Skill Scores dynamically
            skillComponents.forEach(sc => {
                const val = a.skill_scores?.[sc.name];
                if (val !== undefined && val !== '') {
                    const numVal = parseFloat(val);
                    cleanData.skill_scores[sc.name] = numVal;
                    totalSkillScore += (numVal * sc.weight / 100);
                }
            });
            cleanData.final_skill_score = totalSkillScore;

            // Simple calculation of final score (Assume 50-50 logic if both exist, otherwise 100% of the active one)
            // TODO: Configurable final ratio if needed.
            let activeCount = 0;
            if (knowledgeComponents.length > 0) activeCount++;
            if (skillComponents.length > 0) activeCount++;

            cleanData.final_score = activeCount > 0
                ? (totalKnowledgeScore + totalSkillScore) / activeCount
                : 0;

            return cleanData;
        });

        try {
            await saveScores({
                class_schedule_detail_id: parsedDetailId,
                semester,
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
                        <p className="text-muted-foreground">Kelola nilai pengetahuan, keterampilan, dan sikap untuk mata pelajaran ini.</p>
                    </div>
                    <div className="flex space-x-2">
                        <Select value={semester} onValueChange={(v) => setSemester(v as '1' | '2')}>
                            <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Semester" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1">Semester Ganjil</SelectItem>
                                <SelectItem value="2">Semester Genap</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline" onClick={() => setFormulaDialogOpen(true)}>
                            <Settings className="w-4 h-4 mr-2" />
                            Atur Rumus
                        </Button>
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
                                <span className="text-sm font-medium text-muted-foreground">Kurikulum</span>
                                <Badge variant="outline" className="w-fit">{formula?.name || 'Belum Diatur'}</Badge>
                            </div>
                            <div className="flex flex-col space-y-1">
                                <span className="text-sm font-medium text-muted-foreground">Siswa</span>
                                <span className="font-semibold">{students.length} Orang</span>
                            </div>
                        </div>

                        <Separator className="my-4" />

                        {formula ? (
                            <form onSubmit={handleSubmit(onSubmit)}>
                                <Tabs defaultValue="pengetahuan" className="w-full">
                                    <TabsList className="grid w-full grid-cols-4 mb-4">
                                        <TabsTrigger value="pengetahuan">Pengetahuan</TabsTrigger>
                                        <TabsTrigger value="keterampilan">Keterampilan</TabsTrigger>
                                        <TabsTrigger value="sikap">Sikap</TabsTrigger>
                                        <TabsTrigger value="rekap">Rekapitulasi</TabsTrigger>
                                    </TabsList>

                                    {/* TAB PENGETAHUAN */}
                                    <TabsContent value="pengetahuan" className="space-y-4">
                                        <div className="rounded-md border p-0 overflow-x-auto">
                                            <Table>
                                                <TableHeader className="bg-muted/40">
                                                    <TableRow>
                                                        <TableHead className="w-12 text-center">No</TableHead>
                                                        <TableHead className="min-w-[200px]">Nama Siswa</TableHead>
                                                        {knowledgeComponents?.map((comp, idx) => (
                                                            <TableHead key={idx} className="w-24 text-center">
                                                                {comp.name}<br />
                                                                <span className="text-xs font-normal">({comp.weight}%)</span>
                                                            </TableHead>
                                                        ))}
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {fields.map((field, index) => (
                                                        <TableRow key={field.id}>
                                                            <TableCell className="text-center">{index + 1}</TableCell>
                                                            <TableCell className="font-medium whitespace-nowrap">{(field as any).first_name} {(field as any).last_name}</TableCell>
                                                            {knowledgeComponents?.map((comp, compIdx) => (
                                                                <TableCell key={compIdx}>
                                                                    <Input
                                                                        type="number"
                                                                        min="0"
                                                                        max="100"
                                                                        className="h-8 text-center"
                                                                        {...register(`assessments.${index}.knowledge_scores.${comp.name}`)}
                                                                    />
                                                                </TableCell>
                                                            ))}
                                                        </TableRow>
                                                    ))}
                                                    {fields.length === 0 && (
                                                        <TableRow>
                                                            <TableCell colSpan={knowledgeComponents.length + 2} className="text-center h-24 text-muted-foreground">Tidak ada siswa di kelas ini</TableCell>
                                                        </TableRow>
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </TabsContent>

                                    {/* TAB KETERAMPILAN */}
                                    <TabsContent value="keterampilan" className="space-y-4">
                                        <div className="rounded-md border p-0 overflow-x-auto">
                                            <Table>
                                                <TableHeader className="bg-muted/40">
                                                    <TableRow>
                                                        <TableHead className="w-12 text-center">No</TableHead>
                                                        <TableHead className="min-w-[200px]">Nama Siswa</TableHead>
                                                        {skillComponents?.map((comp, idx) => (
                                                            <TableHead key={idx} className="w-24 text-center">
                                                                {comp.name}<br />
                                                                <span className="text-xs font-normal">({comp.weight}%)</span>
                                                            </TableHead>
                                                        ))}
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {fields.map((field, index) => (
                                                        <TableRow key={field.id}>
                                                            <TableCell className="text-center">{index + 1}</TableCell>
                                                            <TableCell className="font-medium whitespace-nowrap">{(field as any).first_name} {(field as any).last_name}</TableCell>
                                                            {skillComponents?.map((comp, compIdx) => (
                                                                <TableCell key={compIdx}>
                                                                    <Input
                                                                        type="number"
                                                                        min="0"
                                                                        max="100"
                                                                        className="h-8 text-center"
                                                                        {...register(`assessments.${index}.skill_scores.${comp.name}`)}
                                                                    />
                                                                </TableCell>
                                                            ))}
                                                        </TableRow>
                                                    ))}
                                                    {fields.length === 0 && (
                                                        <TableRow>
                                                            <TableCell colSpan={skillComponents.length + 2} className="text-center h-24 text-muted-foreground">Tidak ada siswa di kelas ini</TableCell>
                                                        </TableRow>
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </TabsContent>

                                    {/* TAB SIKAP */}
                                    <TabsContent value="sikap" className="space-y-4">
                                        <div className="rounded-md border p-0 overflow-x-auto">
                                            <Table>
                                                <TableHeader className="bg-muted/40">
                                                    <TableRow>
                                                        <TableHead className="w-12 text-center">No</TableHead>
                                                        <TableHead className="min-w-[200px]">Nama Siswa</TableHead>
                                                        <TableHead className="w-[140px] text-center">Sikap Spiritual</TableHead>
                                                        <TableHead className="w-[140px] text-center">Sikap Sosial</TableHead>
                                                        <TableHead>Deskripsi (Catatan Wali/Guru)</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {fields.map((field, index) => (
                                                        <TableRow key={field.id}>
                                                            <TableCell className="text-center">{index + 1}</TableCell>
                                                            <TableCell className="font-medium whitespace-nowrap">{(field as any).first_name} {(field as any).last_name}</TableCell>
                                                            <TableCell>
                                                                <Select
                                                                    value={(field as any).attitude_spiritual}
                                                                    onValueChange={(v) => register(`assessments.${index}.attitude_spiritual`).onChange({ target: { value: v } })}
                                                                >
                                                                    <SelectTrigger className="h-8"><SelectValue placeholder="Pilih..." /></SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="A">Sangat Baik (A)</SelectItem>
                                                                        <SelectItem value="B">Baik (B)</SelectItem>
                                                                        <SelectItem value="C">Cukup (C)</SelectItem>
                                                                        <SelectItem value="D">Kurang (D)</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Select
                                                                    value={(field as any).attitude_social}
                                                                    onValueChange={(v) => register(`assessments.${index}.attitude_social`).onChange({ target: { value: v } })}
                                                                >
                                                                    <SelectTrigger className="h-8"><SelectValue placeholder="Pilih..." /></SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="A">Sangat Baik (A)</SelectItem>
                                                                        <SelectItem value="B">Baik (B)</SelectItem>
                                                                        <SelectItem value="C">Cukup (C)</SelectItem>
                                                                        <SelectItem value="D">Kurang (D)</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </TableCell>
                                                            <TableCell><Input className="h-8" placeholder="Opsional..." {...register(`assessments.${index}.attitude_description`)} /></TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </TabsContent>

                                    {/* TAB REKAP */}
                                    <TabsContent value="rekap" className="space-y-4">
                                        <div className="rounded-md border p-0 overflow-x-auto">
                                            <Table>
                                                <TableHeader className="bg-muted/40">
                                                    <TableRow>
                                                        <TableHead className="w-12 text-center">No</TableHead>
                                                        <TableHead className="min-w-[200px]">Nama Siswa</TableHead>
                                                        <TableHead className="text-center">Nilai Pengetahuan</TableHead>
                                                        <TableHead className="text-center">Nilai Keterampilan</TableHead>
                                                        <TableHead className="text-center">Nilai Akhir</TableHead>
                                                        <TableHead className="text-center">Predikat</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {fields.map((field, index) => {
                                                        const kScore = (field as any).final_knowledge_score;
                                                        const sScore = (field as any).final_skill_score;
                                                        const fScore = (field as any).final_score;

                                                        const kScoreNum = kScore !== '' && kScore !== null && kScore !== undefined ? Number(kScore) : null;
                                                        const sScoreNum = sScore !== '' && sScore !== null && sScore !== undefined ? Number(sScore) : null;
                                                        const fScoreNum = fScore !== '' && fScore !== null && fScore !== undefined ? Number(fScore) : null;

                                                        let predikat = '-';
                                                        let badgeColor = 'bg-gray-100 text-gray-800';

                                                        if (fScoreNum !== null) {
                                                            if (fScoreNum >= 90) { predikat = 'A'; badgeColor = 'bg-green-100 text-green-800'; }
                                                            else if (fScoreNum >= 80) { predikat = 'B'; badgeColor = 'bg-blue-100 text-blue-800'; }
                                                            else if (fScoreNum >= 70) { predikat = 'C'; badgeColor = 'bg-yellow-100 text-yellow-800'; }
                                                            else { predikat = 'D'; badgeColor = 'bg-red-100 text-red-800'; }
                                                        }

                                                        return (
                                                            <TableRow key={field.id}>
                                                                <TableCell className="text-center">{index + 1}</TableCell>
                                                                <TableCell className="font-medium whitespace-nowrap">{(field as any).first_name} {(field as any).last_name}</TableCell>
                                                                <TableCell className="text-center font-semibold">{kScoreNum !== null ? kScoreNum.toFixed(2) : '-'}</TableCell>
                                                                <TableCell className="text-center font-semibold">{sScoreNum !== null ? sScoreNum.toFixed(2) : '-'}</TableCell>
                                                                <TableCell className="text-center font-bold text-primary">{fScoreNum !== null ? fScoreNum.toFixed(2) : '-'}</TableCell>
                                                                <TableCell className="text-center">
                                                                    {predikat !== '-' ? <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${badgeColor}`}>{predikat}</div> : '-'}
                                                                </TableCell>
                                                            </TableRow>
                                                        )
                                                    })}
                                                </TableBody>
                                            </Table>
                                        </div>
                                        <div className="bg-muted p-4 rounded-md text-sm">
                                            <p className="font-semibold mb-1">Catatan Predikat:</p>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                                <div><span className="font-bold text-green-600">A</span> : 90 - 100 (Sangat Baik)</div>
                                                <div><span className="font-bold text-blue-600">B</span> : 80 - 89 (Baik)</div>
                                                <div><span className="font-bold text-yellow-600">C</span> : 70 - 79 (Cukup)</div>
                                                <div><span className="font-bold text-red-600">D</span> : &lt; 70 (Perlu Bimbingan)</div>
                                            </div>
                                        </div>
                                    </TabsContent>
                                </Tabs>

                                <div className="mt-6 flex justify-end">
                                    <Button type="submit" disabled={isSaving}>
                                        <Save className="w-4 h-4 mr-2" />
                                        Simpan Semua Nilai
                                    </Button>
                                </div>
                            </form>
                        ) : (
                            <div className="py-12 text-center text-muted-foreground">
                                <Settings className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                                <h3 className="text-lg font-semibold text-foreground">Rumus Penilaian Belum Diatur</h3>
                                <p className="mt-1 mb-4">Silakan atur rumus penilaian (komponen dan bobotnya) terlebih dahulu sebelum memasukkan nilai.</p>
                                <Button onClick={() => setFormulaDialogOpen(true)}>
                                    Atur Rumus Sekarang
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <PenilaianFormulaDialog
                isOpen={isFormulaDialogOpen}
                onClose={() => setFormulaDialogOpen(false)}
                detailId={parsedDetailId}
                initialData={formula}
                onSaved={refetchFormula}
            />
        </DashboardLayout>
    );
};

export default PenilaianDetailPage;
