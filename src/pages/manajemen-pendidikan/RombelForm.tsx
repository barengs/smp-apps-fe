import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Combobox } from '@/components/ui/combobox';
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
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { showSuccess, showError } from '@/utils/toast'; // Updated import
import { useCreateClassGroupMutation, useUpdateClassGroupMutation, useGetClassGroupAdvisorsQuery, type CreateUpdateClassGroupRequest } from '@/store/slices/classGroupApi';
import { useGetClassroomsQuery } from '@/store/slices/classroomApi';
import { useGetInstitusiPendidikanQuery } from '@/store/slices/institusiPendidikanApi';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

const formSchema = z.object({
  educational_institution_id: z.number({
    required_error: 'Institusi pendidikan harus dipilih.',
  }),
  name: z.string().min(2, {
    message: 'Nama Rombel harus minimal 2 karakter.',
  }),
  classroom_id: z.number({
    required_error: 'Kelas harus dipilih.',
  }),
  // Wali Kelas dipetakan ke advisor_id dan dikirim ke backend
  advisor_id: z.number().nullable().optional(),
});

interface RombelFormProps {
  initialData?: {
    id: number;
    name: string;
    classroom_id: number;
    advisor_id?: number | null;
  };
  onSuccess: () => void;
  onCancel: () => void;
}

const RombelForm: React.FC<RombelFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const [createClassGroup, { isLoading: isCreating }] = useCreateClassGroupMutation();
  const [updateClassGroup, { isLoading: isUpdating }] = useUpdateClassGroupMutation();
  const { data: classroomsData, isLoading: isLoadingClassrooms } = useGetClassroomsQuery();
  const { data: institutionsData, isLoading: isLoadingInstitutions } = useGetInstitusiPendidikanQuery({ page: 1, per_page: 100 });
  const { data: advisorsData, isLoading: isLoadingAdvisors } = useGetClassGroupAdvisorsQuery();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      educational_institution_id: undefined,
      name: '',
      classroom_id: undefined,
      advisor_id: undefined,
    },
  });

  // Ambil nilai institusi terpilih untuk memfilter kelas
  const selectedInstitutionId = form.watch('educational_institution_id');

  // Filter kelas berdasarkan institusi yang dipilih
  const filteredClassrooms = React.useMemo(() => {
    const all = classroomsData?.data ?? [];
    if (!selectedInstitutionId) return [];
    return all.filter((c) => {
      const instId = (c as any).educational_institution_id ?? (c as any).school?.id ?? null;
      return Number(instId) === Number(selectedInstitutionId);
    });
  }, [classroomsData, selectedInstitutionId]);

  // Reset kelas ketika institusi berubah
  React.useEffect(() => {
    form.setValue('classroom_id', undefined, { shouldValidate: true, shouldDirty: true });
  }, [selectedInstitutionId]);

  // Saat edit: set institusi berdasar kelas yang terpilih jika tersedia
  React.useEffect(() => {
    if (!initialData || !classroomsData?.data?.length) return;
    const existingInst = form.getValues('educational_institution_id');
    if (existingInst) return;
    const currentClassroom = classroomsData.data.find((c) => c.id === initialData.classroom_id);
    const derivedInst =
      (currentClassroom as any)?.educational_institution_id ??
      (currentClassroom as any)?.school?.id ??
      undefined;
    if (derivedInst) {
      form.setValue('educational_institution_id', Number(derivedInst), { shouldValidate: true });
    }
  }, [initialData, classroomsData, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // Hanya kirim field yang didukung API untuk saat ini
    const payload: CreateUpdateClassGroupRequest = {
      name: values.name,
      classroom_id: values.classroom_id,
      advisor_id: values.advisor_id ?? null,
    };

    try {
      if (initialData) {
        await updateClassGroup({ id: initialData.id, data: payload }).unwrap();
        showSuccess(`Rombel "${values.name}" berhasil diperbarui.`); // Updated call
      } else {
        await createClassGroup(payload).unwrap();
        showSuccess(`Rombel "${values.name}" berhasil ditambahkan.`); // Updated call
      }
      onSuccess();
    } catch (err) {
      const fetchError = err as FetchBaseQueryError;
      const errorMessage = (fetchError.data as { message?: string })?.message || 'Gagal menyimpan rombel.';
      showError(errorMessage); // Updated call
    }
  };

  const isSubmitting = isCreating || isUpdating;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Institusi Pendidikan - ditempatkan paling atas */}
        <FormField
          control={form.control}
          name="educational_institution_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Institusi Pendidikan</FormLabel>
              <FormControl>
                <Select
                  onValueChange={(value) => field.onChange(parseInt(value, 10))}
                  defaultValue={field.value ? String(field.value) : ''}
                  disabled={isLoadingInstitutions}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih institusi pendidikan..." />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingInstitutions ? (
                      <div className="p-2">Memuat institusi...</div>
                    ) : (
                      institutionsData?.map((inst) => (
                        <SelectItem key={inst.id} value={String(inst.id)}>
                          {inst.institution_name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Kelas - dipindah tepat di bawah Institusi, dan difilter */}
        <FormField
          control={form.control}
          name="classroom_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kelas</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(parseInt(value, 10))}
                defaultValue={field.value ? String(field.value) : ""}
                disabled={isLoadingClassrooms || !selectedInstitutionId}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={!selectedInstitutionId ? "Pilih institusi terlebih dahulu..." : "Pilih kelas..."} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {isLoadingClassrooms ? (
                    <div className="p-2">Memuat kelas...</div>
                  ) : (
                    filteredClassrooms.map((classroom) => (
                      <SelectItem key={classroom.id} value={String(classroom.id)}>
                        {classroom.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Nama Rombel - dipindah di bawah Kelas */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Rombel</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: Rombel Tahfidz 2024" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="advisor_id"
          render={({ field }) => {
            const advisorOptions =
              advisorsData?.data?.map((a) => ({
                value: a.id,
                label: [a.first_name, a.last_name].filter(Boolean).join(' ').trim(),
              })) ?? [];
            return (
              <FormItem>
                <FormLabel>Wali Kelas</FormLabel>
                <FormControl>
                  <Combobox
                    options={advisorOptions}
                    value={field.value as number | undefined}
                    onChange={(val) => field.onChange(val as number)}
                    placeholder="Pilih wali kelas (opsional)..."
                    searchPlaceholder="Cari wali kelas..."
                    notFoundMessage="Tidak ada wali kelas."
                    disabled={isLoadingAdvisors}
                    isLoading={isLoadingAdvisors}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Batal
          </Button>
          <Button type="submit" variant="success" disabled={isSubmitting}>
            {isSubmitting ? 'Menyimpan...' : (initialData ? 'Simpan Perubahan' : 'Tambah Rombel')}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default RombelForm;