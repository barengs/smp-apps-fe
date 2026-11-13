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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { showSuccess, showError } from '@/utils/toast';
import { useCreateHostelMutation, useUpdateHostelMutation, type CreateUpdateHostelRequest } from '@/store/slices/hostelApi';
import { useGetProgramsQuery } from '@/store/slices/programApi'; // Import hook untuk program
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { SerializedError } from '@reduxjs/toolkit';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Nama Asrama harus minimal 2 karakter.',
  }),
  description: z.string().optional(),
  program_id: z.coerce.number().min(1, {
    message: 'Program harus dipilih.',
  }),
  capacity: z.coerce.number().min(1, {
    message: 'Kapasitas harus lebih dari 0.',
  }),
});

interface AsramaFormProps {
  initialData?: {
    id: number;
    name: string;
    description: string;
    program: {
      id: number;
      name: string;
    };
    capacity: number;
  };
  onSuccess: () => void;
  onCancel: () => void;
}

const AsramaForm: React.FC<AsramaFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const [createHostel, { isLoading: isCreating }] = useCreateHostelMutation();
  const [updateHostel, { isLoading: isUpdating }] = useUpdateHostelMutation();
  const { data: programsData, isLoading: isLoadingPrograms } = useGetProgramsQuery({});

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      program_id: initialData?.program?.id || undefined,
      capacity: initialData?.capacity || undefined,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const payload: CreateUpdateHostelRequest = {
      name: values.name,
      description: values.description,
      capacity: values.capacity,
    };

    // Hanya tambahkan program_id jika nilainya valid (bukan undefined atau null)
    if (values.program_id !== undefined && values.program_id !== null) {
      payload.program_id = values.program_id;
    }

    try {
      if (initialData) {
        await updateHostel({ id: initialData.id, data: payload }).unwrap();
        showSuccess(`Asrama "${values.name}" berhasil diperbarui.`);
      } else {
        await createHostel(payload).unwrap();
        showSuccess(`Asrama "${values.name}" berhasil ditambahkan.`);
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
      showError(`Gagal menyimpan asrama: ${errorMessage}`);
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
              <FormLabel>Nama Asrama</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: Asrama Putra A" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="program_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Program</FormLabel>
              <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()} disabled={isLoadingPrograms || isSubmitting}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Program" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {isLoadingPrograms ? (
                    <SelectItem value="loading" disabled>Memuat program...</SelectItem>
                  ) : (
                    (programsData?.data || []).map((program) => (
                      <SelectItem key={program.id} value={program.id.toString()}>
                        {program.name}
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
          name="capacity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kapasitas</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Contoh: 50" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
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
              <FormLabel>Deskripsi (Opsional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Deskripsi singkat asrama ini..." {...field} />
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
            {isSubmitting ? 'Menyimpan...' : (initialData ? 'Simpan Perubahan' : 'Tambah Asrama')}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AsramaForm;