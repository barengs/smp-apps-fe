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
import { toast } from 'sonner';

const formSchema = z.object({
  roleName: z.string().min(2, {
    message: 'Nama Peran harus minimal 2 karakter.',
  }),
  description: z.string().optional(),
  usersCount: z.number().min(0, {
    message: 'Jumlah Pengguna tidak boleh negatif.',
  }).default(0),
});

interface PeranFormProps {
  initialData?: {
    id: string;
    roleName: string;
    description: string;
    usersCount: number;
  };
  onSuccess: () => void;
  onCancel: () => void;
}

const PeranForm: React.FC<PeranFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      ...initialData,
      usersCount: initialData.usersCount, // Ensure number type
    } : {
      roleName: '',
      description: '',
      usersCount: 0,
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (initialData) {
      toast.success(`Peran "${values.roleName}" berhasil diperbarui.`);
    } else {
      toast.success(`Peran "${values.roleName}" berhasil ditambahkan.`);
    }
    onSuccess();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="roleName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Peran</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: Guru" {...field} />
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
                <Textarea placeholder="Deskripsi singkat peran ini..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="usersCount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Jumlah Pengguna</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="0"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Batal
          </Button>
          <Button type="submit">
            {initialData ? 'Simpan Perubahan' : 'Tambah Peran'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PeranForm;