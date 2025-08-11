import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MataPelajaran } from '@/types/pendidikan';
import { useCreateStudyMutation, useUpdateStudyMutation } from '@/store/slices/studyApi';
import * as toast from '@/utils/toast';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(1, { message: 'Nama mata pelajaran harus diisi.' }),
  description: z.string().optional(),
});

interface MataPelajaranFormProps {
  initialData?: MataPelajaran;
  onSuccess: () => void;
}

const MataPelajaranForm: React.FC<MataPelajaranFormProps> = ({ initialData, onSuccess }) => {
  const [createStudy, { isLoading: isCreating }] = useCreateStudyMutation();
  const [updateStudy, { isLoading: isUpdating }] = useUpdateStudyMutation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        description: initialData.description || '',
      });
    } else {
      form.reset({
        name: '',
        description: '',
      });
    }
  }, [initialData, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (initialData) {
        await updateStudy({ id: initialData.id, ...values }).unwrap();
        toast.showSuccess('Mata pelajaran berhasil diperbarui!');
      } else {
        await createStudy(values).unwrap();
        toast.showSuccess('Mata pelajaran berhasil ditambahkan!');
      }
      onSuccess();
    } catch (error) {
      toast.showError('Terjadi kesalahan. Silakan coba lagi.');
      console.error(error);
    }
  };

  const isLoading = isCreating || isUpdating;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Mata Pelajaran</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: Matematika" {...field} />
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
                <Textarea placeholder="Deskripsi singkat mata pelajaran" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button type="submit" variant="success" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? 'Simpan Perubahan' : 'Simpan'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default MataPelajaranForm;