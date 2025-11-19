import React from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import * as toast from '@/utils/toast';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { SerializedError } from '@reduxjs/toolkit';
import type { ViolationCategory, CreateUpdateViolationCategoryRequest } from '@/store/slices/violationCategoryApi';
import { useCreateViolationCategoryMutation, useUpdateViolationCategoryMutation } from '@/store/slices/violationCategoryApi';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Nama harus minimal 2 karakter.' }),
  description: z.string().optional(),
  severity_level: z.coerce.number().int().min(1, { message: 'Tingkat keparahan minimal 1.' }),
  is_active: z.boolean(),
});

interface KategoriPelanggaranFormProps {
  initialData?: ViolationCategory;
  onSuccess: () => void;
  onCancel: () => void;
}

const KategoriPelanggaranForm: React.FC<KategoriPelanggaranFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const [createCategory, { isLoading: isCreating }] = useCreateViolationCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateViolationCategoryMutation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: '',
      description: '',
      severity_level: 1,
      is_active: true,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const payload: CreateUpdateViolationCategoryRequest = {
      name: values.name,
      description: values.description || '',
      severity_level: values.severity_level,
      is_active: values.is_active,
    };

    try {
      if (initialData) {
        await updateCategory({ id: initialData.id, data: payload }).unwrap();
        toast.showSuccess(`Kategori "${values.name}" berhasil diperbarui.`);
      } else {
        await createCategory(payload).unwrap();
        toast.showSuccess(`Kategori "${values.name}" berhasil ditambahkan.`);
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
      toast.showError(`Gagal menyimpan kategori: ${errorMessage}`);
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
              <FormLabel>Nama Kategori</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: Kedisiplinan" {...field} />
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
                <Textarea placeholder="Deskripsi kategori..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="severity_level"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tingkat Keparahan</FormLabel>
                <FormControl>
                  <Input type="number" min={1} placeholder="Contoh: 1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="is_active"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between space-y-0">
                <FormLabel>Aktif</FormLabel>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Batal
          </Button>
          <Button type="submit" variant="success" disabled={isSubmitting}>
            {isSubmitting ? 'Menyimpan...' : (initialData ? 'Simpan Perubahan' : 'Tambah Kategori')}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default KategoriPelanggaranForm;