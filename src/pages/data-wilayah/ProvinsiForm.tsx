import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from 'sonner';
import { useCreateProvinceMutation, useUpdateProvinceMutation, type CreateUpdateProvinceRequest } from '@/store/slices/provinceApi';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { SerializedError } from '@reduxjs/toolkit';

const formSchema = z.object({
  code: z.string().min(1, {
    message: 'Kode Provinsi tidak boleh kosong.',
  }),
  name: z.string().min(2, {
    message: 'Nama Provinsi harus minimal 2 karakter.',
  }),
});

interface ProvinsiFormProps {
  initialData?: {
    id: number;
    code: string;
    name: string;
  };
  onSuccess: () => void;
  onCancel: () => void;
}

const ProvinsiForm: React.FC<ProvinsiFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const [createProvince, { isLoading: isCreating }] = useCreateProvinceMutation();
  const [updateProvince, { isLoading: isUpdating }] = useUpdateProvinceMutation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      code: '',
      name: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const payload: CreateUpdateProvinceRequest = {
      code: values.code,
      name: values.name,
    };

    try {
      if (initialData) {
        await updateProvince({ id: initialData.id, data: payload }).unwrap();
        toast.success(`Provinsi "${values.name}" berhasil diperbarui.`);
      } else {
        await createProvince(payload).unwrap();
        toast.success(`Provinsi "${values.name}" berhasil ditambahkan.`);
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
      toast.error(`Gagal menyimpan provinsi: ${errorMessage}`);
    }
  };

  const isSubmitting = isCreating || isUpdating;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kode Provinsi</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: 32" {...field} />
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
              <FormLabel>Nama Provinsi</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: Jawa Barat" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Batal
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Menyimpan...' : (initialData ? 'Simpan Perubahan' : 'Tambah Provinsi')}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ProvinsiForm;