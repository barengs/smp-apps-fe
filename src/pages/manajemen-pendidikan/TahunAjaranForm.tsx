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
  FormDescription,
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
import { Switch } from '@/components/ui/switch';
import * as toast from '@/utils/toast';
import { useCreateTahunAjaranMutation, useUpdateTahunAjaranMutation, type CreateUpdateTahunAjaranRequest } from '@/store/slices/tahunAjaranApi';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { SerializedError } from '@reduxjs/toolkit';

const formSchema = z.object({
  year: z.string().regex(/^\d{4}\/\d{4}$/, {
    message: 'Format tahun ajaran harus YYYY/YYYY (contoh: 2023/2024).',
  }),
  semester: z.enum(['Ganjil', 'Genap'], {
    required_error: 'Semester harus dipilih.',
  }),
  active: z.boolean().default(false),
  description: z.string().optional(),
});

interface TahunAjaranFormProps {
  initialData?: {
    id: number;
    year: string;
    semester: 'Ganjil' | 'Genap';
    active: boolean;
    description: string | null;
  };
  onSuccess: () => void;
  onCancel: () => void;
}

const TahunAjaranForm: React.FC<TahunAjaranFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const [createTahunAjaran, { isLoading: isCreating }] = useCreateTahunAjaranMutation();
  const [updateTahunAjaran, { isLoading: isUpdating }] = useUpdateTahunAjaranMutation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? { ...initialData, description: initialData.description || '' } : {
      year: '',
      semester: undefined,
      active: false,
      description: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const payload: CreateUpdateTahunAjaranRequest = {
      year: values.year,
      semester: values.semester,
      active: values.active,
      description: values.description,
    };

    try {
      if (initialData) {
        await updateTahunAjaran({ id: initialData.id, data: payload }).unwrap();
        toast.showSuccess(`Tahun Ajaran "${values.year} - ${values.semester}" berhasil diperbarui.`);
      } else {
        await createTahunAjaran(payload).unwrap();
        toast.showSuccess(`Tahun Ajaran "${values.year} - ${values.semester}" berhasil ditambahkan.`);
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
      toast.showError(`Gagal menyimpan tahun ajaran: ${errorMessage}`);
    }
  };

  const isSubmitting = isCreating || isUpdating;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="year"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tahun Ajaran</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: 2023/2024" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="semester"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Semester</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih semester" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Ganjil">Ganjil</SelectItem>
                  <SelectItem value="Genap">Genap</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Status Aktif</FormLabel>
                <FormDescription>
                  Jadikan tahun ajaran ini sebagai tahun ajaran yang aktif.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
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
                <Textarea placeholder="Deskripsi singkat (opsional)..." {...field} />
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
            {isSubmitting ? 'Menyimpan...' : (initialData ? 'Simpan Perubahan' : 'Tambah Tahun Ajaran')}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default TahunAjaranForm;