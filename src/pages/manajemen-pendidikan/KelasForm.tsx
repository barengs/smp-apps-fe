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
import { toast } from 'sonner';
import { useCreateClassroomMutation, useUpdateClassroomMutation, useGetClassroomsQuery, type CreateUpdateClassroomRequest } from '@/store/slices/classroomApi';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { SerializedError } from '@reduxjs/toolkit';

const formSchema = z.object({
  name: z.string().min(1, {
    message: 'Nama Kelas harus diisi.',
  }),
  parent_id: z.number().nullable().optional(),
  description: z.string().optional(),
});

interface KelasFormProps {
  initialData?: {
    id: number;
    name: string;
    parent_id: number | null;
    description: string;
  };
  onSuccess: () => void;
  onCancel: () => void;
}

const KelasForm: React.FC<KelasFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const [createClassroom, { isLoading: isCreating }] = useCreateClassroomMutation();
  const [updateClassroom, { isLoading: isUpdating }] = useUpdateClassroomMutation();
  const { data: classroomsData, isLoading: isLoadingClassrooms } = useGetClassroomsQuery();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      name: initialData.name,
      description: initialData.description,
      parent_id: initialData.parent_id,
    } : {
      name: '',
      description: '',
      parent_id: null,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const payload: CreateUpdateClassroomRequest = {
      name: values.name,
      description: values.description,
      parent_id: values.parent_id,
    };

    try {
      if (initialData) {
        await updateClassroom({ id: initialData.id, data: payload }).unwrap();
        toast.success(`Kelas "${values.name}" berhasil diperbarui.`);
      } else {
        await createClassroom(payload).unwrap();
        toast.success(`Kelas "${values.name}" berhasil ditambahkan.`);
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
      toast.error(`Gagal menyimpan kelas: ${errorMessage}`);
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
              <FormLabel>Nama Kelas</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: Kelas 7A" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="parent_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Induk Kelas (Opsional)</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(value === 'none' ? null : parseInt(value, 10))}
                value={field.value ? String(field.value) : 'none'}
                disabled={isLoadingClassrooms}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih induk kelas..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">Tidak ada induk</SelectItem>
                  {isLoadingClassrooms ? (
                    <div className="p-2">Memuat kelas...</div>
                  ) : (
                    classroomsData?.data
                      ?.filter(c => !initialData || c.id !== initialData.id)
                      .map((classroom) => (
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
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Menyimpan...' : (initialData ? 'Simpan Perubahan' : 'Tambah Kelas')}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default KelasForm;