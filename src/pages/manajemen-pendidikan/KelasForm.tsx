import React, { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
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
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { showSuccess, showError } from '@/utils/toast';
import { useCreateClassroomMutation, useUpdateClassroomMutation, useGetClassroomsQuery, type CreateUpdateClassroomRequest } from '@/store/slices/classroomApi';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { SerializedError } from '@reduxjs/toolkit';
import { useGetInstitusiPendidikanQuery } from '@/store/slices/institusiPendidikanApi';

const formSchema = z.object({
  educational_institution_id: z.number().min(1, {
    message: 'Lembaga Pendidikan harus dipilih.',
  }),
  name: z.string().min(1, {
    message: 'Nama Kelas harus diisi.',
  }),
  description: z.string().optional(),
});

interface KelasFormProps {
  initialData?: {
    id: number;
    name: string;
    educational_institution_id: number | null;
    description: string;
  };
  onSuccess: () => void;
  onCancel: () => void;
}

const KelasForm: React.FC<KelasFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const [createClassroom, { isLoading: isCreating }] = useCreateClassroomMutation();
  const [updateClassroom, { isLoading: isUpdating }] = useUpdateClassroomMutation();
  const { data: institutionsData, isLoading: isLoadingInstitutions } = useGetInstitusiPendidikanQuery();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      name: initialData.name,
      description: initialData.description,
      educational_institution_id: initialData.educational_institution_id || 0,
    } : {
      name: '',
      description: '',
      educational_institution_id: 0,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const payload: CreateUpdateClassroomRequest = {
      name: values.name,
      description: values.description,
      educational_institution_id: values.educational_institution_id,
    };

    try {
      if (initialData) {
        await updateClassroom({ id: initialData.id, data: payload }).unwrap();
        showSuccess(`Kelas "${values.name}" berhasil diperbarui.`);
      } else {
        await createClassroom(payload).unwrap();
        showSuccess(`Kelas "${values.name}" berhasil ditambahkan.`);
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
            errorMessage = `Error: Gagal memproses permintaan.`;
          }
        } else if ('message' in err) {
          errorMessage = (err as SerializedError).message ?? 'Error tidak diketahui';
        }
      }
      showError(`Gagal menyimpan kelas: ${errorMessage}`);
    }
  };

  const isSubmitting = isCreating || isUpdating;
  const institutions = institutionsData || [];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="educational_institution_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lembaga Pendidikan <span className="text-red-500">*</span></FormLabel>
              <Select
                onValueChange={(value) => field.onChange(parseInt(value, 10))}
                value={String(field.value)}
                disabled={isLoadingInstitutions}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih lembaga pendidikan..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {isLoadingInstitutions ? (
                    <div className="p-2">Memuat lembaga...</div>
                  ) : (
                    institutions.map((institution) => (
                      <SelectItem key={institution.id} value={String(institution.id)}>
                        {institution.institution_name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Kelas <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input placeholder="Contoh: Kelas 7A" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deskripsi</FormLabel>
              <FormControl>
                <Textarea placeholder="Deskripsi singkat kelas ini..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Batal
          </Button>
          <Button type="submit" variant="success" disabled={isSubmitting}>
            {isSubmitting ? 'Menyimpan...' : (initialData ? 'Simpan Perubahan' : 'Tambah Kelas')}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default KelasForm;