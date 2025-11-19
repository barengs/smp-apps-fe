"use client";

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/datepicker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ActionButton from '@/components/ActionButton';
import { Combobox } from '@/components/ui/combobox';
import { useGetStudentsQuery } from '@/store/slices/studentApi';
import { useGetViolationsQuery } from '@/store/slices/violationApi';
import { useGetTahunAjaranQuery, useGetActiveTahunAjaranQuery } from '@/store/slices/tahunAjaranApi';
import { useCreateStudentViolationReportMutation, useUpdateStudentViolationMutation, StudentViolation } from '@/store/slices/studentViolationApi';
import * as toast from '@/utils/toast';
import { format } from 'date-fns';

interface StudentViolationFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: StudentViolation | null;
  onSuccess?: () => void;
}

const StudentViolationFormDialog: React.FC<StudentViolationFormDialogProps> = ({ open, onOpenChange, initialData, onSuccess }) => {
  const isEdit = !!initialData?.id;

  const [studentId, setStudentId] = React.useState<number | undefined>(initialData?.student_id);
  const [violationId, setViolationId] = React.useState<number | undefined>(initialData?.violation_id);
  const [academicYearId, setAcademicYearId] = React.useState<number | undefined>(initialData?.academic_year_id);
  const [violationDate, setViolationDate] = React.useState<Date | undefined>(initialData?.violation_date ? new Date(initialData.violation_date) : new Date());
  const [violationTime, setViolationTime] = React.useState<string>(initialData?.violation_time || '');
  const [location, setLocation] = React.useState<string>(initialData?.location || '');
  const [description, setDescription] = React.useState<string>(initialData?.description || '');
  const [notes, setNotes] = React.useState<string>(initialData?.notes || '');

  const { data: students = [] } = useGetStudentsQuery({ page: 1, per_page: 200 });
  const { data: violations = [] } = useGetViolationsQuery();
  const { data: academicYears = [] } = useGetTahunAjaranQuery();
  const { data: activeYear } = useGetActiveTahunAjaranQuery();

  React.useEffect(() => {
    if (activeYear?.id && !academicYearId) {
      setAcademicYearId(activeYear.id);
    }
  }, [activeYear, academicYearId]);

  React.useEffect(() => {
    if (!open) {
      // reset local state when dialog closes
      setStudentId(initialData?.student_id);
      setViolationId(initialData?.violation_id);
      setAcademicYearId(initialData?.academic_year_id ?? activeYear?.id);
      setViolationDate(initialData?.violation_date ? new Date(initialData.violation_date) : new Date());
      setViolationTime(initialData?.violation_time || '');
      setLocation(initialData?.location || '');
      setDescription(initialData?.description || '');
      setNotes(initialData?.notes || '');
    }
  }, [open, initialData, activeYear]);

  const studentOptions = students.map((s) => ({
    value: s.id,
    label: `${s.nis} — ${s.first_name}${s.last_name ? ' ' + s.last_name : ''}`,
  }));

  const violationOptions = violations.map((v) => ({
    value: v.id,
    label: `${v.name} (${v.point} poin)`,
  }));

  const [createReport, { isLoading: isCreating }] = useCreateStudentViolationReportMutation();
  const [updateReport, { isLoading: isUpdating }] = useUpdateStudentViolationMutation();

  const handleSubmit = async () => {
    if (!studentId || !violationId || !academicYearId || !violationDate || !violationTime) {
      toast.showError('Lengkapi semua field wajib.');
      return;
    }

    const payload = {
      student_id: studentId,
      violation_id: violationId,
      academic_year_id: academicYearId,
      violation_date: violationDate.toISOString(),
      violation_time: violationTime,
      location: location || undefined,
      description: description || undefined,
      reported_by: 0, // backend dapat menentukan dari token; jika perlu, kirim dari halaman induk
      notes: notes || undefined,
    };

    const loadingId = toast.showLoading(isEdit ? 'Memperbarui laporan...' : 'Menyimpan laporan...');
    try {
      if (isEdit && initialData?.id) {
        await updateReport({ id: initialData.id, data: payload }).unwrap();
        toast.showSuccess('Laporan berhasil diperbarui!');
      } else {
        await createReport(payload).unwrap();
        toast.showSuccess('Laporan pelanggaran berhasil disimpan!');
      }
      onOpenChange(false);
      onSuccess?.();
    } finally {
      toast.dismissToast(loadingId);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Laporan Pelanggaran' : 'Tambah Laporan Pelanggaran'}</DialogTitle>
          <DialogDescription>Isi form di bawah untuk {isEdit ? 'mengubah' : 'mencatat'} pelanggaran santri.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Santri</label>
            <Combobox
              options={studentOptions}
              value={studentId}
              onChange={(val) => setStudentId(Number(val))}
              placeholder="Pilih santri..."
              searchPlaceholder="Cari santri..."
              notFoundMessage="Santri tidak ditemukan."
              isLoading={false}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Pelanggaran</label>
            <Combobox
              options={violationOptions}
              value={violationId}
              onChange={(val) => setViolationId(Number(val))}
              placeholder="Pilih pelanggaran..."
              searchPlaceholder="Cari pelanggaran..."
              notFoundMessage="Pelanggaran tidak ditemukan."
              isLoading={false}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Tahun Ajaran</label>
              <Select
                value={academicYearId ? String(academicYearId) : undefined}
                onValueChange={(val) => setAcademicYearId(Number(val))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih tahun ajaran" />
                </SelectTrigger>
                <SelectContent>
                  {academicYears.map((ay) => (
                    <SelectItem key={ay.id} value={String(ay.id)}>
                      {ay.year} — {ay.type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Tanggal Pelanggaran</label>
              <DatePicker
                value={violationDate}
                onValueChange={setViolationDate}
                placeholder="Pilih tanggal"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Waktu Pelanggaran</label>
              <Input
                type="time"
                value={violationTime}
                onChange={(e) => setViolationTime(e.target.value)}
                placeholder="HH:MM"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Lokasi</label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Misal: Kelas 7A"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Deskripsi</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tuliskan detail pelanggaran..."
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Catatan</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Catatan tambahan (opsional)"
            />
          </div>
        </div>

        <DialogFooter className="mt-4">
          <ActionButton
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Batal
          </ActionButton>
          <ActionButton
            variant="primary"
            onClick={handleSubmit}
            isLoading={isCreating || isUpdating}
          >
            {isEdit ? 'Simpan Perubahan' : 'Simpan Laporan'}
          </ActionButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StudentViolationFormDialog;