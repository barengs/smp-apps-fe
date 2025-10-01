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
import { showSuccess, showError } from '@/utils/toast';
import { useCreateVillageMutation, useUpdateVillageMutation, type CreateUpdateVillageRequest } from '@/store/slices/villageApi';
import { useGetDistrictsQuery } from '@/store/slices/districtApi';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { SerializedError } from '@reduxjs/toolkit';

const formSchema = z.object({
  code: z.string().min(1, {
    message: 'Kode Desa tidak boleh kosong.',
  }),
  name: z.string().min(2, {
    message: 'Nama Desa harus minimal 2 karakter.',
  }),
  district_code: z.string().min(1, {
    message: 'Kecamatan harus dipilih.',
  }),
});

interface DesaFormProps {
  initialData?: {
    id: string;
    code: string;
    name: string;
    district_code: string;
  };
  onSuccess: () => void;
  onCancel: () => void;
}

const DesaForm: React.FC<DesaFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const [createVillage, { isLoading: isCreating }] = useCreateVillageMutation();
  const [updateVillage, { isLoading: isUpdating }] = useUpdateVillageMutation();
  const { data: districtsData, isLoading: isLoadingDistricts } = useGetDistrictsQuery();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      code: '',
      name: '',
      district_code: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (initialData) {
        await updateVillage({ id: Number(initialData.id), data: values as CreateUpdateVillageRequest }).unwrap();
        showSuccess(`Desa "${values.name}" berhasil diperbarui.`);
      } else {
        const result = await createVillage({
          code: values.code,
          name: values.name,
          district_code: values.district_code,
        }).unwrap();
        showSuccess(`Desa "${values.name}" berhasil ditambahkan.`);
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
      showError(`Gagal menyimpan desa: ${errorMessage}`);
    }
  };

  const isSubmitting = isCreating || isUpdating;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="district_code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kecamatan</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingDistricts}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kecamatan..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {isLoadingDistricts ? (
                    <div className="p-2">Memuat kecamatan...</div>
                  ) : (
                    districtsData?.map((district) => (
                      <SelectItem key={district.code} value={district.code}>
                        {district.name}
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
              <FormLabel>Kode Desa</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: 3273010001" {...field} />
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
              <FormLabel>Nama Desa</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: Sukajadi" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Batal
          </Button>
          <Button type="submit" variant="success" disabled={isSubmitting}>
            {isSubmitting ? 'Menyimpan...' : (initialData ? 'Simpan Perubahan' : 'Tambah Desa')}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default DesaForm;