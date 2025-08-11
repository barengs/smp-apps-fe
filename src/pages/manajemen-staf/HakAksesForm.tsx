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
import * as toast from '@/utils/toast';
import { Textarea } from '@/components/ui/textarea';
import { useCreatePermissionMutation, useUpdatePermissionMutation, type CreateUpdatePermissionRequest } from '@/store/slices/permissionApi';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { SerializedError } from '@reduxjs/toolkit';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Nama Hak Akses harus minimal 2 karakter.',
  }),
  description: z.string().optional(),
});

interface HakAksesFormProps {
  initialData?: {
    id: number;
    name: string;
    description: string;
  };
  onSuccess: () => void;
  onCancel: () => void;
}

const HakAksesForm: React.FC<HakAksesFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const [createPermission, { isLoading: isCreating }] = useCreatePermissionMutation();
  const [updatePermission, { isLoading: isUpdating }] = useUpdatePermissionMutation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: '',
      description: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const payload: CreateUpdatePermissionRequest = {
      name: values.name,
      description: values.description,
    };

    try {
      if (initialData) {
        await updatePermission({ id: initialData.id, data: payload }).unwrap();
        toast.showSuccess(`Hak Akses "${values.name}" berhasil diperbarui.`);
      } else {
        await createPermission(payload).unwrap();
        toast.showSuccess(`Hak Akses "${values.name}" berhasil ditambahkan.`);
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
      toast.showError(`Gagal menyimpan hak akses: ${errorMessage}`);
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
              <FormLabel>Nama Hak Akses</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: manage-users" {...field} />
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
                <Textarea placeholder="Deskripsi singkat hak akses ini..." {...field} />
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
            {isSubmitting ? 'Menyimpan...' : (initialData ? 'Simpan Perubahan' : 'Tambah Hak Akses')}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default HakAksesForm;