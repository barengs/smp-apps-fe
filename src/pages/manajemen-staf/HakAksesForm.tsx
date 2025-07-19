import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  permission: z.string().min(2, {
    message: 'Hak Akses harus minimal 2 karakter.',
  }),
  description: z.string().optional(),
});

interface HakAksesFormProps {
  initialData?: {
    id: string;
    roleName: string;
    permission: string;
    description: string;
  };
  onSuccess: () => void;
  onCancel: () => void;
}

const HakAksesForm: React.FC<HakAksesFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      roleName: '',
      permission: '',
      description: '',
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (initialData) {
      toast.success(`Hak Akses "${values.roleName}" berhasil diperbarui.`);
    } else {
      toast.success(`Hak Akses "${values.roleName}" berhasil ditambahkan.`);
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
                <Input placeholder="Contoh: Administrasi" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="permission"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hak Akses</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: Full Access" {...field} />
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
          <Button type="button" variant="outline" onClick={onCancel}>
            Batal
          </Button>
          <Button type="submit">
            {initialData ? 'Simpan Perubahan' : 'Tambah Hak Akses'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default HakAksesForm;