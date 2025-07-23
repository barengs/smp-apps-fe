import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import * as toast from '@/utils/toast';
import { useCreateCityMutation, useUpdateCityMutation, type CreateUpdateCityRequest } from '@/store/slices/cityApi';
import { useGetProvincesQuery } from '@/store/slices/provinceApi';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { SerializedError } from '@reduxjs/toolkit';
import { Skeleton } from '@/components/ui/skeleton';

const formSchema = z.object({
  code: z.string().min(1, {
    message: 'Kode Kota tidak boleh kosong.',
  }),
  name: z.string().min(2, {
    message: 'Nama Kota harus minimal 2 karakter.',
  }),
  province_code: z.string().min(1, {
    message: 'Provinsi harus dipilih.',
  }),
});

interface KotaFormProps {
  initialData?: {
    id: number;
    code: string;
    name: string;
    province_code: string;
  };
  onSuccess: () => void;
  onCancel: () => void;
}

const KotaForm: React.FC<KotaFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const [createCity, { isLoading: isCreating }] = useCreateCityMutation();
  const [updateCity, { isLoading: isUpdating }] = useUpdateCityMutation();
  const { data: provincesData, isLoading: isLoadingProvinces } = useGetProvincesQuery();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      code: '',
      name: '',
      province_code: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (initialData) {
        await updateCity({ id: initialData.id, data: values as CreateUpdateCityRequest }).unwrap();
        toast.showSuccess(`Kota "${values.name}" berhasil diperbarui.`);
      } else {
        await createCity(values as CreateUpdateCityRequest).unwrap();
        toast.showSuccess(`Kota "${values.name}" berhasil ditambahkan.`);
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
      toast.showError(`Gagal menyimpan kota: ${errorMessage}`);
    }
  };

  const isSubmitting = isCreating || isUpdating;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="province_code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Provinsi</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingProvinces}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih provinsi..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {isLoadingProvinces ? (
                    <div className="p-2">Memuat provinsi...</div>
                  ) : (
                    provincesData?.map((province) => (
                      <SelectItem key={province.code} value={province.code}>
                        {province.name}
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
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kode Kota</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: 3273" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Kota</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: Kota Bandung" {...field} />
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
            {isSubmitting ? 'Menyimpan...' : (initialData ? 'Simpan Perubahan' : 'Tambah Kota')}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default KotaForm;