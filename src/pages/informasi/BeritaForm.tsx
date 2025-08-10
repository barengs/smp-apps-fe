import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import RichTextEditor from '@/components/RichTextEditor';
import type { Berita } from '@/types/informasi';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const formSchema = z.object({
  title: z.string().min(3, { message: 'Judul berita harus memiliki minimal 3 karakter.' }),
  content: z.string().min(10, { message: 'Konten berita harus memiliki minimal 10 karakter.' }),
  status: z.enum(['published', 'draft'], { required_error: 'Status harus dipilih.' }),
  file: z
    .any()
    .optional()
    .refine((files) => !files || files?.length === 0 || files?.[0]?.size <= MAX_FILE_SIZE, `Ukuran file maksimal adalah 5MB.`)
    .refine(
      (files) => !files || files?.length === 0 || ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      "Hanya format .jpg, .jpeg, .png dan .webp yang didukung."
    ),
});

type FormValues = z.infer<typeof formSchema>;

interface BeritaFormProps {
  initialData?: Berita;
  onSuccess: (data: FormData) => void;
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
      file: undefined,
    },
  });

  const fileRef = form.register("file");

  const onSubmit = (values: FormValues) => {
    const formData = new FormData();
    formData.append('title', values.title);
    formData.append('content', values.content);
    formData.append('status', values.status);
    if (values.file && values.file.length > 0) {
      formData.append('file', values.file[0]);
    }
    onSuccess(formData);
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
                <RichTextEditor
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Tulis konten berita di sini..."
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="file"
          render={() => (
            <FormItem>
              <FormLabel>Gambar Unggulan (Opsional)</FormLabel>
              <FormControl>
                <Input 
                  type="file" 
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  {...fileRef}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {initialData?.image_url && (
            <div className="space-y-2">
                <FormLabel>Gambar Saat Ini</FormLabel>
                <img src={initialData.image_url} alt={initialData.title} className="w-full max-w-xs rounded-md border" />
            </div>
        )}
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
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