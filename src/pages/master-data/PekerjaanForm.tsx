import React from 'react';
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
import * as toast from '@/utils/toast';
import { useCreatePekerjaanMutation, useUpdatePekerjaanMutation, type CreateUpdatePekerjaanRequest } from '@/store/slices/pekerjaanApi';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { SerializedError } from '@reduxjs/toolkit';
import type { Pekerjaan } from '@/store/slices/pekerjaanApi';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Nama Pekerjaan harus minimal 2 karakter.',
  }),
  code: z.string().min(1, {
    message: 'Kode harus diisi.',
  }),
  description: z.string().optional(),
});

interface PekerjaanFormProps {
  initialData?: Pekerjaan;
  onSuccess: () => void;
  onCancel: () => void;
}

const PekerjaanForm: React.FC<PekerjaanFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const [createPekerjaan, { isLoading: isCreating }] = useCreatePekerjaanMutation();
  const [updatePekerjaan, { isLoading: isUpdating }] = useUpdatePekerjaanMutation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: '',
      code: '',
      description: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const payload: CreateUpdatePekerjaanRequest = {
      name: values.name,
      code: values.code,
      description: values.description || '',
    };

    try {
      if (initialData) {
        await updatePekerjaan({ id: initialData.id, data: payload }).unwrap();
        toast.showSuccess(`Pekerjaan "${values.name}" berhasil diperbarui.`);
      } else {
        await createPekerjaan(payload).unwrap();
        toast.showSuccess(`Pekerjaan "${values.name}" berhasil ditambahkan.`);
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
      toast.showError(`Gagal menyimpan pekerjaan: ${errorMessage}`);
    }
  };

  const isSubmitting = isCreating || isUpdating;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Pekerjaan</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: Petani" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kode</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: PTN" {...field} />
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
                <Textarea placeholder="Deskripsi singkat pekerjaan..." {...field} />
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
            {isSubmitting ? 'Menyimpan...' : (initialData ? 'Simpan Perubahan' : 'Tambah Pekerjaan')}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PekerjaanForm;