"use client";

import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Sanction, SanctionType, CreateUpdateSanctionRequest, useCreateSanctionMutation, useUpdateSanctionMutation } from '@/store/slices/sanctionApi';
import * as toast from '@/utils/toast';

type Props = {
  initialData?: Sanction | null;
  onSuccess: () => void;
  onCancel: () => void;
};

const sanctionTypes = ['peringatan', 'skorsing', 'pembinaan', 'denda', 'lainnya'] as const;

const formSchema = z.object({
  name: z.string().min(2, { message: 'Nama sanksi minimal 2 karakter.' }),
  description: z.string().optional(),
  type: z.enum(sanctionTypes, { message: 'Jenis sanksi tidak valid.' }),
  duration_days: z.coerce.number().int().min(1, { message: 'Durasi minimal 1 hari.' }),
  is_active: z.boolean(),
});

const SanksiForm: React.FC<Props> = ({ initialData, onSuccess, onCancel }) => {
  const [createSanction, { isLoading: isCreating }] = useCreateSanctionMutation();
  const [updateSanction, { isLoading: isUpdating }] = useUpdateSanctionMutation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          description: initialData.description ?? '',
          type: initialData.type,
          duration_days: initialData.duration_days,
          is_active: initialData.is_active,
        }
      : {
          name: '',
          description: '',
          type: 'peringatan',
          duration_days: 1,
          is_active: true,
        },
  });

  const isSubmitting = isCreating || isUpdating;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const payload: CreateUpdateSanctionRequest = {
      name: values.name,
      description: values.description ?? '',
      type: values.type as SanctionType,
      duration_days: values.duration_days,
      is_active: values.is_active,
    };

    try {
      if (initialData && initialData.id) {
        await updateSanction({ id: initialData.id, data: payload }).unwrap();
        toast.showSuccess('Sanksi berhasil diperbarui.');
      } else {
        await createSanction(payload).unwrap();
        toast.showSuccess('Sanksi berhasil ditambahkan.');
      }
      onSuccess();
    } catch (e) {
      toast.showError('Gagal menyimpan sanksi. Silakan coba lagi.');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Sanksi</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: Peringatan Tertulis" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Jenis Sanksi</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih jenis sanksi" />
                    </SelectTrigger>
                    <SelectContent>
                      {sanctionTypes.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t.charAt(0).toUpperCase() + t.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="duration_days"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Durasi (hari)</FormLabel>
                <FormControl>
                  <Input type="number" min={1} placeholder="Contoh: 3" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between space-y-0">
              <FormLabel>Aktif</FormLabel>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
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
                <Textarea placeholder="Deskripsi sanksi..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Batal
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Menyimpan...' : initialData ? 'Simpan Perubahan' : 'Tambah Sanksi'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default SanksiForm;