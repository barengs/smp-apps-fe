import React from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/datepicker';
import { Combobox } from '@/components/ui/combobox';
import * as toast from '@/utils/toast';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { SerializedError } from '@reduxjs/toolkit';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { selectCurrentUser } from '@/store/slices/authSlice';
import { useGetStudentsQuery } from '@/store/slices/studentApi';
import { useGetViolationsQuery } from '@/store/slices/violationApi';
import { useGetTahunAjaranQuery, useGetActiveTahunAjaranQuery } from '@/store/slices/tahunAjaranApi';
import {
  useCreateStudentViolationReportMutation,
  useUpdateStudentViolationMutation,
} from '@/store/slices/studentViolationApi';
import type { StudentViolation, CreateStudentViolationReportRequest } from '@/store/slices/studentViolationApi';

const formSchema = z.object({
  student_id: z.coerce.number().int().min(1, { message: 'Santri wajib dipilih.' }),
  violation_id: z.coerce.number().int().min(1, { message: 'Pelanggaran wajib dipilih.' }),
  academic_year_id: z.coerce.number().int().min(1, { message: 'Tahun ajaran wajib dipilih.' }),
  violation_date: z.date({ required_error: 'Tanggal pelanggaran wajib diisi.' }),
  violation_time: z.string().min(1, { message: 'Waktu pelanggaran wajib diisi.' }),
  location: z.string().optional(),
  description: z.string().optional(),
  reported_by: z.coerce.number().int().min(1, { message: 'Pelapor tidak diketahui.' }),
  notes: z.string().optional(),
});

interface LaporanFormProps {
  initialData?: StudentViolation;
  onSuccess: () => void;
  onCancel: () => void;
}

const LaporanForm: React.FC<LaporanFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const currentUser = useSelector((state: RootState) => selectCurrentUser(state));
  const reportedBy = Number(currentUser?.id ?? 0);

  const { data: students = [] } = useGetStudentsQuery({ page: 1, per_page: 200 });
  const { data: violations = [] } = useGetViolationsQuery();
  const { data: academicYears = [] } = useGetTahunAjaranQuery();
  const { data: activeYear } = useGetActiveTahunAjaranQuery();

  const [createReport, { isLoading: isCreating }] = useCreateStudentViolationReportMutation();
  const [updateReport, { isLoading: isUpdating }] = useUpdateStudentViolationMutation();

  const defaultValues: z.infer<typeof formSchema> = initialData
    ? {
        student_id: initialData.student_id,
        violation_id: initialData.violation_id,
        academic_year_id: initialData.academic_year_id,
        violation_date: new Date(initialData.violation_date),
        violation_time: initialData.violation_time || '',
        location: initialData.location || '',
        description: initialData.description || '',
        reported_by: initialData.reported_by || reportedBy,
        notes: initialData.notes || '',
      }
    : {
        student_id: 0,
        violation_id: 0,
        academic_year_id: activeYear?.id ?? 0,
        violation_date: new Date(),
        violation_time: '',
        location: '',
        description: '',
        reported_by: reportedBy || 0,
        notes: '',
      };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const studentOptions = students.map((s) => ({
    value: s.id,
    label: `${s.nis} — ${s.first_name}${s.last_name ? ' ' + s.last_name : ''}`,
  }));
  const violationOptions = violations.map((v) => ({
    value: v.id,
    label: `${v.name} (${v.point} poin)`,
  }));

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const payload: CreateStudentViolationReportRequest = {
      student_id: values.student_id,
      violation_id: values.violation_id,
      academic_year_id: values.academic_year_id,
      violation_date: values.violation_date.toISOString(),
      violation_time: values.violation_time,
      location: values.location || undefined,
      description: values.description || undefined,
      reported_by: values.reported_by,
      notes: values.notes || undefined,
    };

    try {
      if (initialData) {
        await updateReport({ id: initialData.id, data: payload }).unwrap();
        toast.showSuccess('Laporan pelanggaran berhasil diperbarui.');
      } else {
        await createReport(payload).unwrap();
        toast.showSuccess('Laporan pelanggaran berhasil ditambahkan.');
      }
      onSuccess();
    } catch (err: unknown) {
      let errorMessage = 'Terjadi kesalahan tidak dikenal.';
      if (typeof err === 'object' && err !== null) {
        if ('status' in err) {
          const fetchError = err as FetchBaseQueryError;
          if (fetchError.data && typeof fetchError.data === 'object' && 'message' in fetchError.data) {
            errorMessage = (fetchError.data as { message: string }).message;
          } else {
            errorMessage = 'Gagal memproses permintaan.';
          }
        } else if ('message' in err) {
          errorMessage = (err as SerializedError).message ?? 'Error tidak diketahui';
        }
      }
      toast.showError(`Gagal menyimpan laporan: ${errorMessage}`);
    }
  };

  const isSubmitting = isCreating || isUpdating;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="student_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Santri</FormLabel>
                <FormControl>
                  <Combobox
                    options={studentOptions}
                    value={field.value}
                    onChange={(val) => field.onChange(Number(val))}
                    placeholder="Pilih santri..."
                    searchPlaceholder="Cari santri..."
                    notFoundMessage="Santri tidak ditemukan."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="violation_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pelanggaran</FormLabel>
                <FormControl>
                  <Combobox
                    options={violationOptions}
                    value={field.value}
                    onChange={(val) => field.onChange(Number(val))}
                    placeholder="Pilih pelanggaran..."
                    searchPlaceholder="Cari pelanggaran..."
                    notFoundMessage="Pelanggaran tidak ditemukan."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="academic_year_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tahun Ajaran</FormLabel>
                <FormControl>
                  <Select
                    value={String(field.value || '')}
                    onValueChange={(val) => field.onChange(Number(val))}
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
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="violation_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tanggal Pelanggaran</FormLabel>
                <FormControl>
                  <DatePicker value={field.value} onValueChange={field.onChange} placeholder="Pilih tanggal" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="violation_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Waktu Pelanggaran</FormLabel>
                <FormControl>
                  <Input type="time" placeholder="HH:MM" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lokasi</FormLabel>
                <FormControl>
                  <Input placeholder="Misal: Kelas 7A" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deskripsi</FormLabel>
              <FormControl>
                <Textarea placeholder="Tuliskan detail pelanggaran..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Catatan</FormLabel>
              <FormControl>
                <Textarea placeholder="Catatan tambahan (opsional)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Batal
          </Button>
          <Button type="submit" variant="success" disabled={isSubmitting}>
            {isSubmitting ? 'Menyimpan...' : (initialData ? 'Simpan Perubahan' : 'Tambah Laporan')}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default LaporanForm;