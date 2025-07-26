import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Berita } from '@/types/informasi';

const formSchema = z.object({
  title: z.string().min(3, { message: 'Judul berita harus memiliki minimal 3 karakter.' }),
  content: z.string().min(10, { message: 'Konten berita harus memiliki minimal 10 karakter.' }),
  status: z.enum(['published', 'draft'], { required_error: 'Status harus dipilih.' }),
});

type FormValues = z.infer<typeof formSchema>;

interface BeritaFormProps {
  initialData?: Berita;
  onSuccess: (data: FormValues) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const BeritaForm: React.FC<BeritaFormProps> = ({ initialData, onSuccess, onCancel, isLoading }) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || '',
      content: initialData?.content || '',
      status: initialData?.status || 'draft',
    },
  });

  const onSubmit = (values: FormValues) => {
    onSuccess(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Judul Berita</FormLabel>
              <FormControl>
                <Input placeholder="Masukkan judul berita" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Konten</FormLabel>
              <FormControl>
                <Textarea placeholder="Tulis konten berita di sini..." {...field} rows={10} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status publikasi" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Batal
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Menyimpan...' : (initialData ? 'Simpan Perubahan' : 'Tambah Berita')}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default BeritaForm;