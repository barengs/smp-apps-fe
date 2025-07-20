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
import { toast } from 'sonner';
import { useCreateDistrictMutation, useUpdateDistrictMutation, type CreateUpdateDistrictRequest } from '@/store/slices/districtApi';
import { useGetCitiesQuery } from '@/store/slices/cityApi';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { SerializedError } from '@reduxjs/toolkit';

const formSchema = z.object({
  code: z.string().min(1, {
    message: 'Kode Kecamatan tidak boleh kosong.',
  }),
  name: z.string().min(2, {
    message: 'Nama Kecamatan harus minimal 2 karakter.',
  }),
  city_code: z.string().min(1, {
    message: 'Kota harus dipilih.',
  }),
});

interface KecamatanFormProps {
  initialData?: {
    id: number;
    code: string;
    name: string;
    city_code: string;
  };
  onSuccess: () => void;
  onCancel: () => void;
}

const KecamatanForm: React.FC<KecamatanFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const [createDistrict, { isLoading: isCreating }] = useCreateDistrictMutation();
  const [updateDistrict, { isLoading: isUpdating }] = useUpdateDistrictMutation();
  const { data: citiesData, isLoading: isLoadingCities } = useGetCitiesQuery();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      code: '',
      name: '',
      city_code: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (initialData) {
        await updateDistrict({ id: initialData.id, data: values as CreateUpdateDistrictRequest }).unwrap();
        toast.success(`Kecamatan "${values.name}" berhasil diperbarui.`);
      } else {
        await createDistrict(values as CreateUpdateDistrictRequest).unwrap();
        toast.success(`Kecamatan "${values.name}" berhasil ditambahkan.`);
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
      toast.error(`Gagal menyimpan kecamatan: ${errorMessage}`);
    }
  };

  const isSubmitting = isCreating || isUpdating;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="city_code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kota</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingCities}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kota..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {isLoadingCities ? (
                    <div className="p-2">Memuat kota...</div>
                  ) : (
                    citiesData?.map((city) => (
                      <SelectItem key={city.code} value={city.code}>
                        {city.name}
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
              <FormLabel>Kode Kecamatan</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: 3273010" {...field} />
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
              <FormLabel>Nama Kecamatan</FormLabel>
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
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Menyimpan...' : (initialData ? 'Simpan Perubahan' : 'Tambah Kecamatan')}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default KecamatanForm;