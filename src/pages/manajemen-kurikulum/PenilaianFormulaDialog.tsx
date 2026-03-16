import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useSaveAssessmentFormulaMutation } from '@/store/slices/assessmentApi';
import { showSuccess, showError, showLoading, dismissToast } from '@/utils/toast';
import { Trash2, Plus } from 'lucide-react';

const assessmentComponentSchema = z.object({
    name: z.string().min(1, 'Nama komponen wajib diisi'),
    weight: z.number().min(0).max(100),
});

const formulaSchema = z.object({
    type: z.enum(['standar_k13', 'merdeka', 'custom']),
    knowledge_formula: z.array(assessmentComponentSchema).min(1, 'Minimal 1 komponen pengetahuan'),
    skill_formula: z.array(assessmentComponentSchema).min(1, 'Minimal 1 komponen keterampilan'),
    attendance_weight: z.number().min(0).max(100),
});

type FormulaFormValues = z.infer<typeof formulaSchema>;

const K13_TEMPLATE: FormulaFormValues = {
    type: 'standar_k13',
    knowledge_formula: [
        { name: 'Tugas Harian', weight: 20 },
        { name: 'Ulangan Harian', weight: 40 },
        { name: 'UTS', weight: 20 },
        { name: 'UAS', weight: 20 },
    ],
    skill_formula: [
        { name: 'Praktik', weight: 40 },
        { name: 'Proyek', weight: 40 },
        { name: 'Portfolio', weight: 20 },
    ],
    attendance_weight: 0,
};

const MERDEKA_TEMPLATE: FormulaFormValues = {
    type: 'merdeka',
    knowledge_formula: [
        { name: 'Tugas Harian', weight: 30 },
        { name: 'Sumatif Tengah', weight: 30 },
        { name: 'Sumatif Akhir', weight: 40 },
    ],
    skill_formula: [
        { name: 'Proyek', weight: 50 },
        { name: 'Portfolio', weight: 50 },
    ],
    attendance_weight: 0,
};

interface PenilaianFormulaDialogProps {
    isOpen: boolean;
    onClose: () => void;
    detailId: number;
    initialData?: any;
    onSaved?: () => void;
}

const PenilaianFormulaDialog: React.FC<PenilaianFormulaDialogProps> = ({
    isOpen,
    onClose,
    detailId,
    initialData,
    onSaved
}) => {
    const [saveFormula] = useSaveAssessmentFormulaMutation();
    const [totalKnowledge, setTotalKnowledge] = useState(100);
    const [totalSkill, setTotalSkill] = useState(100);

    const form = useForm<FormulaFormValues>({
        resolver: zodResolver(formulaSchema),
        defaultValues: K13_TEMPLATE,
    });

    const { register, control, watch, setValue, handleSubmit, reset } = form;

    const { fields: knowledgeFields, append: appendKnowledge, remove: removeKnowledge } = useFieldArray({
        control,
        name: "knowledge_formula"
    });

    const { fields: skillFields, append: appendSkill, remove: removeSkill } = useFieldArray({
        control,
        name: "skill_formula"
    });

    const watchType = watch('type');
    const watchKnowledge = watch('knowledge_formula');
    const watchSkill = watch('skill_formula');

    useEffect(() => {
        if (initialData) {
            reset({
                type: initialData.type || 'standar_k13',
                knowledge_formula: Array.isArray(initialData.knowledge_formula) && initialData.knowledge_formula.length > 0
                    ? initialData.knowledge_formula
                    : K13_TEMPLATE.knowledge_formula,
                skill_formula: Array.isArray(initialData.skill_formula) && initialData.skill_formula.length > 0
                    ? initialData.skill_formula
                    : K13_TEMPLATE.skill_formula,
                attendance_weight: initialData.attendance_weight || 0,
            });
        } else {
            reset(K13_TEMPLATE);
        }
    }, [initialData, reset]);

    useEffect(() => {
        const totalK = (watchKnowledge || []).reduce((acc, curr) => acc + (curr.weight || 0), 0);
        setTotalKnowledge(totalK);

        const totalS = (watchSkill || []).reduce((acc, curr) => acc + (curr.weight || 0), 0);
        setTotalSkill(totalS);
    }, [watchKnowledge, watchSkill]);

    const handleTypeChange = (value: string) => {
        setValue('type', value as any);
        if (value === 'standar_k13') {
            reset(K13_TEMPLATE);
        } else if (value === 'merdeka') {
            reset(MERDEKA_TEMPLATE);
        }
    };

    const isCustom = watchType === 'custom';

    const onSubmit = async (data: FormulaFormValues) => {
        if (totalKnowledge !== 100) {
            showError('Total bobot Pengetahuan harus 100%');
            return;
        }
        if (totalSkill !== 100) {
            showError('Total bobot Keterampilan harus 100%');
            return;
        }

        const payload = {
            class_schedule_detail_id: detailId,
            name: data.type === 'standar_k13' ? 'Standar K13' : data.type === 'merdeka' ? 'Merdeka Belajar' : 'Custom',
            type: data.type,
            knowledge_formula: data.knowledge_formula,
            skill_formula: data.skill_formula,
            attendance_weight: data.attendance_weight,
        };

        const toastId = showLoading('Menyimpan rumus penilaian...');
        try {
            await saveFormula(payload as any).unwrap();
            dismissToast(toastId);
            showSuccess('Rumus penilaian berhasil disimpan');
            if (onSaved) onSaved();
            onClose();
        } catch (error) {
            dismissToast(toastId);
            showError('Gagal menyimpan rumus penilaian');
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Pengaturan Rumus Penilaian</DialogTitle>
                    <DialogDescription>
                        Pilih standar kurikulum atau buat rumus kustom. Total bobot per aspek harus 100%.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Tipe Standar Penilaian</Label>
                            <Select value={watchType} onValueChange={handleTypeChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih Kurikulum" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="standar_k13">Standar K13</SelectItem>
                                    <SelectItem value="merdeka">Merdeka Belajar</SelectItem>
                                    <SelectItem value="custom">Custom</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Separator />

                        {/* Aspek Pengetahuan */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <Label className="text-base font-semibold">Komponen Pengetahuan</Label>
                                <span className={`text-sm font-medium ${totalKnowledge === 100 ? 'text-green-600' : 'text-red-500'}`}>
                                    Total Bobot: {totalKnowledge}%
                                </span>
                            </div>

                            <div className="space-y-2">
                                {knowledgeFields.map((field, index) => (
                                    <div key={field.id} className="flex items-center gap-2">
                                        <div className="flex-1">
                                            <Input
                                                placeholder="Nama Komponen (e.g., Tugas, Sumatif)"
                                                disabled={!isCustom}
                                                {...register(`knowledge_formula.${index}.name`)}
                                            />
                                        </div>
                                        <div className="w-24">
                                            <Input
                                                type="number"
                                                min="0"
                                                max="100"
                                                disabled={!isCustom}
                                                {...register(`knowledge_formula.${index}.weight`, { valueAsNumber: true })}
                                            />
                                        </div>
                                        <span className="text-sm w-4">%</span>
                                        {isCustom && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="text-red-500 hover:text-red-700"
                                                onClick={() => removeKnowledge(index)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {isCustom && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="mt-2"
                                    onClick={() => appendKnowledge({ name: '', weight: 0 })}
                                >
                                    <Plus className="w-4 h-4 mr-2" /> Tambah Komponen
                                </Button>
                            )}
                        </div>

                        <Separator />

                        {/* Aspek Keterampilan */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <Label className="text-base font-semibold">Komponen Keterampilan</Label>
                                <span className={`text-sm font-medium ${totalSkill === 100 ? 'text-green-600' : 'text-red-500'}`}>
                                    Total Bobot: {totalSkill}%
                                </span>
                            </div>

                            <div className="space-y-2">
                                {skillFields.map((field, index) => (
                                    <div key={field.id} className="flex items-center gap-2">
                                        <div className="flex-1">
                                            <Input
                                                placeholder="Nama Komponen (e.g., Praktik, Proyek)"
                                                disabled={!isCustom}
                                                {...register(`skill_formula.${index}.name`)}
                                            />
                                        </div>
                                        <div className="w-24">
                                            <Input
                                                type="number"
                                                min="0"
                                                max="100"
                                                disabled={!isCustom}
                                                {...register(`skill_formula.${index}.weight`, { valueAsNumber: true })}
                                            />
                                        </div>
                                        <span className="text-sm w-4">%</span>
                                        {isCustom && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="text-red-500 hover:text-red-700"
                                                onClick={() => removeSkill(index)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {isCustom && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="mt-2"
                                    onClick={() => appendSkill({ name: '', weight: 0 })}
                                >
                                    <Plus className="w-4 h-4 mr-2" /> Tambah Komponen
                                </Button>
                            )}
                        </div>

                        <Separator />

                        {/* Aspek Presensi (Opsional) */}
                        <div className="space-y-3">
                            <Label className="text-base font-semibold">Pengaruh Presensi Terhadap Nilai Akhir (%)</Label>
                            <div className="flex items-center space-x-2">
                                <Input type="number" min="0" max="50" className="w-[120px]" {...register('attendance_weight', { valueAsNumber: true })} />
                                <span className="text-sm text-muted-foreground">Persentase reduksi jika presensi kurang (misal: 10%)</span>
                            </div>
                        </div>

                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
                        <Button type="submit" disabled={totalKnowledge !== 100 || totalSkill !== 100}>
                            Simpan Rumus
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default PenilaianFormulaDialog;
