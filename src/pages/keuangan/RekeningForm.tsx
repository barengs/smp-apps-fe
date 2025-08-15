import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
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
import { useCreateAccountMutation, useUpdateAccountMutation } from '@/store/slices/accountApi';
import { useGetSantriQuery } from '@/store/slices/santriApi';
import { useGetProdukBankQuery } from '@/store/slices/produkBankApi'; // FIX: Corrected hook name
import { Account, CreateUpdateAccountRequest } from '@/types/keuangan';
import { Combobox } from '@/components/ui/combobox';

const formSchema = z.object({
  santri_id: z.number({ required_error: 'Santri harus dipilih.' }),
  produk_id: z.number({ required_error: 'Produk bank harus dipilih.' }),
  status: z.enum(['active', 'inactive', 'frozen'], {
    required_error: 'Status harus dipilih.',
  }),
});

interface RekeningFormProps {
  initialData?: Account;
  onSuccess: () => void;
  onCancel: () => void;
}

const RekeningForm: React.FC<RekeningFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const [createAccount, { isLoading: isCreating }] = useCreateAccountMutation();
  const [updateAccount, { isLoading: isUpdating }] = useUpdateAccountMutation();

  const { data: santriData, isLoading: isLoadingSantri } = useGetSantriQuery();
  const { data: produkData, isLoading: isLoadingProduk } = useGetProdukBankQuery(); // FIX: Corrected hook name

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      santri_id: initialData.santri.id,
      produk_id: initialData.produk.id,
      status: initialData.status,
    } : {
      santri_id: undefined, // FIX: Explicitly set for new forms
      produk_id: undefined, // FIX: Explicitly set for new forms
      status: 'active',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // FIX: values from form.handleSubmit will conform to formSchema, so direct assignment is fine
    const payload: CreateUpdateAccountRequest = values; 

    try {
      if (initialData) {
        await updateAccount({ id: initialData.id, data: payload }).unwrap();
        showSuccess(`Rekening berhasil diperbarui.`);
      } else {
        await createAccount(payload).unwrap();
        showSuccess(`Rekening berhasil dibuat.`);
      }
      onSuccess();
    } catch (err) {
      showError('Gagal menyimpan rekening.');
      console.error(err);
    }
  };

  const isSubmitting = isCreating || isUpdating;
  // FIX: Access data property from the response
  const santriOptions = santriData?.data.map(s => ({ value: s.id, label: `${s.nama} (${s.nis})` })) || [];
  const produkOptions = produkData?.data.map(p => ({ value: p.product_code, label: p.product_name })) || [];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="santri_id"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Santri</FormLabel>
              <Combobox
                options={santriOptions}
                value={field.value}
                onChange={field.onChange}
                placeholder="Cari santri..."
                searchPlaceholder="Ketik untuk mencari santri..."
                notFoundMessage="Santri tidak ditemukan."
                disabled={isLoadingSantri || !!initialData}
              />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="produk_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Produk Bank</FormLabel>
              <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={String(field.value)}>
                <FormControl>
                  <SelectTrigger disabled={isLoadingProduk}>
                    <SelectValue placeholder="Pilih produk bank" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {produkOptions.map(option => (
                    <SelectItem key={option.value} value={String(option.value)}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="inactive">Non-Aktif</SelectItem>
                  <SelectItem value="frozen">Dibekukan</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Batal
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Menyimpan...' : (initialData ? 'Simpan Perubahan' : 'Buat Rekening')}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default RekeningForm;