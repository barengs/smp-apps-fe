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
import type { CreateUpdateParentRequest } from '@/store/slices/parentApi';

export const parentFormSchema = z.object({
  first_name: z.string().min(2, {
    message: 'Nama depan harus minimal 2 karakter.',
  }),
  last_name: z.string().nullable().optional(),
  email: z.string().email({
    message: 'Email tidak valid.',
  }),
  kk: z.string().min(1, {
    message: 'Nomor KK tidak boleh kosong.',
  }),
  nik: z.string().min(1, {
    message: 'NIK tidak boleh kosong.',
  }),
  gender: z.enum(['L', 'P'], {
    required_error: 'Jenis kelamin harus dipilih.',
  }),
  parent_as: z.string().min(1, {
    message: 'Status wali harus dipilih.',
  }),
  phone: z.string().nullable().optional(),
  card_address: z.string().nullable().optional(),
  photo: z.string().url({ message: 'URL foto tidak valid.' }).nullable().optional(),
});

type ParentFormValues = z.infer<typeof parentFormSchema>;

interface ParentFormStepProps {
  initialData?: Partial<CreateUpdateParentRequest>;
  onNext: (data: ParentFormValues) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const ParentFormStep: React.FC<ParentFormStepProps> = ({ initialData, onNext, onCancel, isSubmitting }) => {
  const form = useForm<ParentFormValues>({
    resolver: zodResolver(parentFormSchema),
    defaultValues: {
      first_name: initialData?.first_name || '',
      last_name: initialData?.last_name || null,
      email: initialData?.email || '',
      kk: initialData?.kk || '',
      nik: initialData?.nik || '',
      gender: initialData?.gender || 'L',
      parent_as: initialData?.parent_as || '',
      phone: initialData?.phone || null,
      card_address: initialData?.card_address || null,
      photo: initialData?.photo || null,
    },
  });

  const parentAsOptions = ['Ayah', 'Ibu', 'Wali'];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onNext)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Depan Wali</FormLabel>
                <FormControl>
                  <Input placeholder="Contoh: Budi" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Belakang Wali (Opsional)</FormLabel>
                <FormControl>
                  <Input placeholder="Contoh: Santoso" {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="kk"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nomor Kartu Keluarga (KK)</FormLabel>
                <FormControl>
                  <Input placeholder="Contoh: 3273xxxxxxxxxxxxxx" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="nik"
            render={({ field }) => (
              <FormItem>
                <FormLabel>NIK Wali</FormLabel>
                <FormControl>
                  <Input placeholder="Contoh: 3273xxxxxxxxxxxxxx" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Wali</FormLabel>
              <FormControl>
                <Input placeholder="contoh@email.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Jenis Kelamin Wali</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih jenis kelamin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="L">Laki-Laki</SelectItem>
                    <SelectItem value="P">Perempuan</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="parent_as"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status Wali</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih status wali" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {parentAsOptions.map(option => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telepon Wali (Opsional)</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: 081234567890" {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="card_address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Alamat Wali (Opsional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Alamat lengkap wali..." {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="photo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL Foto Wali (Opsional)</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/foto_wali.jpg" {...field} value={field.value || ''} />
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
            Lanjut ke Data Santri
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ParentFormStep;