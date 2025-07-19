import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Nama harus minimal 2 karakter.',
  }),
  email: z.string().email({
    message: 'Email tidak valid.',
  }),
  role: z.string().min(2, {
    message: 'Peran harus minimal 2 karakter.',
  }),
  status: z.enum(['Aktif', 'Cuti', 'Tidak Aktif'], {
    message: 'Status tidak valid.',
  }),
});

interface StaffFormProps {
  initialData?: {
    id: string;
    name: string;
    email: string;
    role: string;
    status: 'Aktif' | 'Cuti' | 'Tidak Aktif'; // Perbaikan: Menggunakan tipe literal union
  };
  onSuccess: () => void;
  onCancel: () => void;
}

const StaffForm: React.FC<StaffFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: '',
      email: '',
      role: '',
      status: 'Aktif',
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (initialData) {
      toast.success(`Staf "${values.name}" berhasil diperbarui.`);
    } else {
      toast.success(`Staf "${values.name}" berhasil ditambahkan.`);
    }
    onSuccess();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Lengkap</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: Budi Santoso" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="contoh@pesantren.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Peran</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: Guru Fiqih" {...field} />
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
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Aktif">Aktif</SelectItem>
                  <SelectItem value="Cuti">Cuti</SelectItem>
                  <SelectItem value="Tidak Aktif">Tidak Aktif</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Batal
          </Button>
          <Button type="submit">
            {initialData ? 'Simpan Perubahan' : 'Tambah Staf'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default StaffForm;