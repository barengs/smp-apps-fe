import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea'; // Textarea mungkin tidak lagi diperlukan jika deskripsi dihapus
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { showSuccess, showError } from '@/utils/toast';
import { useCreateEducationGroupMutation, useUpdateEducationGroupMutation, type CreateUpdateEducationGroupRequest } from '@/store/slices/educationGroupApi';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

const formSchema = z.object({
  code: z.string().min(2, { // Menambahkan validasi untuk 'code'
    message: 'Kode Kelompok Pendidikan harus minimal 2 karakter.',
  }),
  name: z.string().min(2, {
    message: 'Nama Kelompok Pendidikan harus minimal 2 karakter.',
  }),
  // 'description' dihapus dari skema
});

interface KelompokPendidikanFormProps {
  initialData?: {
    code: string; // Mengganti 'id' dengan 'code'
    name: string;
    // 'description' dihapus
  };
  onSuccess: () => void;
  onCancel: () => void;
}

const KelompokPendidikanForm: React.FC<KelompokPendidikanFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const [createEducationGroup, { isLoading: isCreating }] = useCreateEducationGroupMutation();
  const [updateEducationGroup, { isLoading: isUpdating }] = useUpdateEducationGroupMutation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      code: '', // Menambahkan default value untuk 'code'
      name: '',
      // 'description' dihapus
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (initialData) {
        await updateEducationGroup({ code: initialData.code, data: values as CreateUpdateEducationGroupRequest }).unwrap(); // Menggunakan 'code'
        showSuccess(`Kelompok Pendidikan "${values.name}" berhasil diperbarui.`);
      } else {
        await createEducationGroup(values as CreateUpdateEducationGroupRequest).unwrap();
        showSuccess(`Kelompok Pendidikan "${values.name}" berhasil ditambahkan.`);
      }
      onSuccess();
    } catch (err) {
      const fetchError = err as FetchBaseQueryError;
      const errorMessage = (fetchError.data as { message?: string })?.message || 'Gagal menyimpan kelompok pendidikan.';
      showError(errorMessage);
    }
  };

  const isSubmitting = isCreating || isUpdating;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="code" // Menambahkan field untuk 'code'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kode Kelompok Pendidikan</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: KLP001" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Kelompok Pendidikan</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: Kelompok Tahfidz" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Field 'description' dihapus */}
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Batal
          </Button>
          <Button type="submit" variant="success" disabled={isSubmitting}>
            {isSubmitting ? 'Menyimpan...' : (initialData ? 'Simpan Perubahan' : 'Tambah Kelompok Pendidikan')}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default KelompokPendidikanForm;