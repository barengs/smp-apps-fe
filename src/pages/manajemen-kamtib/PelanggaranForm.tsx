import React from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import * as toast from '@/utils/toast';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { SerializedError } from '@reduxjs/toolkit';
import type { Violation, CreateUpdateViolationRequest } from '@/store/slices/violationApi';
import { useCreateViolationMutation, useUpdateViolationMutation } from '@/store/slices/violationApi';
import { useGetViolationCategoriesQuery } from '@/store/slices/violationCategoryApi';

const formSchema = z.object({
  category_id: z.coerce.number().int().min(0, { message: 'Kategori tidak valid.' }),
  name: z.string().min(2, { message: 'Nama pelanggaran harus minimal 2 karakter.' }),
  description: z.string().optional(),
  point: z.coerce.number().int().min(0, { message: 'Poin minimal 0.' }),
  is_active: z.boolean(),
});

interface PelanggaranFormProps {
  initialData?: Violation;
  onSuccess: () => void;
  onCancel: () => void;
}

const PelanggaranForm: React.FC<PelanggaranFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const [createViolation, { isLoading: isCreating }] = useCreateViolationMutation();
  const [updateViolation, { isLoading: isUpdating }] = useUpdateViolationMutation();
  const { data: categories } = useGetViolationCategoriesQuery();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      category_id: 0,
      name: '',
      description: '',
      point: 0,
      is_active: true,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const payload: CreateUpdateViolationRequest = {
      category_id: values.category_id,
      name: values.name,
      description: values.description || '',
      point: values.point,
      is_active: values.is_active,
    };

    try {
      if (initialData) {
        await updateViolation({ id: initialData.id, data: payload }).unwrap();
        toast.showSuccess(`Pelanggaran "${values.name}" berhasil diperbarui.`);
      } else {
        await createViolation(payload).unwrap();
        toast.showSuccess(`Pelanggaran "${values.name}" berhasil ditambahkan.`);
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
      toast.showError(`Gagal menyimpan pelanggaran: ${errorMessage}`);
    }
  };

  const isSubmitting = isCreating || isUpdating;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="category_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kategori</FormLabel>
              <FormControl>
                <Select
                  value={String(field.value ?? '')}
                  onValueChange={(val) => field.onChange(Number(val))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {(categories ?? []).map((cat) => (
                      <SelectItem key={cat.id} value={String(cat.id)}>
                        {cat.name}
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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Pelanggaran</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: Terlambat masuk kelas" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="point"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Poin</FormLabel>
                <FormControl>
                  <Input type="number" min={0} placeholder="Contoh: 5" {...field} />
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
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deskripsi</FormLabel>
              <FormControl>
                <Textarea placeholder="Deskripsi singkat pelanggaran..." {...field} />
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
            {isSubmitting ? 'Menyimpan...' : (initialData ? 'Simpan Perubahan' : 'Tambah Pelanggaran')}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PelanggaranForm;