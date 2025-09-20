import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  useCreateCoaMutation,
  useUpdateCoaMutation,
  useGetHeaderAccountsQuery,
} from '@/store/slices/coaApi';
import * as toast from '@/utils/toast';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { Coa } from '@/store/slices/coaApi';

const formSchema = z.object({
  coa_code: z.string().min(1, 'Kode COA wajib diisi'),
  account_name: z.string().min(1, 'Nama akun wajib diisi'),
  account_type: z.enum(['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE']),
  level: z.enum(['HEADER', 'SUBHEADER', 'DETAIL']),
  parent_coa_code: z.string().optional(),
  is_postable: z.boolean(),
});

interface CoaFormProps {
  initialData?: Coa;
  onSuccess: () => void;
  onCancel: () => void;
}

const CoaForm: React.FC<CoaFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const [createCoa] = useCreateCoaMutation();
  const [updateCoa] = useUpdateCoaMutation();
  const { data: headerAccounts } = useGetHeaderAccountsQuery();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      coa_code: initialData?.coa_code || '',
      account_name: initialData?.account_name || '',
      account_type: initialData?.account_type || 'ASSET',
      level: initialData?.level || 'HEADER',
      parent_coa_code: initialData?.parent_coa_code || '',
      is_postable: initialData?.is_postable === 1 || false, // Convert 0/1 to boolean
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const formData = {
        ...values,
        is_postable: values.is_postable ? 1 : 0, // Convert boolean to 0/1
      };

      if (initialData) {
        await updateCoa({ id: initialData.coa_code, data: formData }).unwrap();
        toast.showSuccess('COA berhasil diperbarui.');
      } else {
        await createCoa(formData).unwrap();
        toast.showSuccess('COA berhasil ditambahkan.');
      }
      onSuccess();
    } catch (err) {
      const fetchError = err as FetchBaseQueryError;
      const errorMessage = (fetchError.data as { message?: string })?.message || 'Gagal menyimpan COA.';
      toast.showError(errorMessage);
    }
  };

  const accountTypeOptions = [
    { value: 'ASSET', label: 'Aset' },
    { value: 'LIABILITY', label: 'Kewajiban' },
    { value: 'EQUITY', label: 'Ekuitas' },
    { value: 'REVENUE', label: 'Pendapatan' },
    { value: 'EXPENSE', label: 'Beban' },
  ];

  const levelOptions = [
    { value: 'HEADER', label: 'Header' },
    { value: 'SUBHEADER', label: 'Sub Header' },
    { value: 'DETAIL', label: 'Detail' },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="coa_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kode COA</FormLabel>
                <FormControl>
                  <Input placeholder="Masukkan kode COA" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="account_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Akun</FormLabel>
                <FormControl>
                  <Input placeholder="Masukkan nama akun" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="account_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipe Akun</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih tipe akun" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {accountTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
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
            name="level"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Level</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih level" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {levelOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
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
          name="parent_coa_code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Akun Induk (Opsional)</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ''}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih akun induk" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="">Tidak ada</SelectItem>
                  {headerAccounts?.map((account) => (
                    <SelectItem key={account.coa_code} value={account.coa_code}>
                      {account.coa_code} - {account.account_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>Pilih akun induk jika COA ini adalah sub-akun</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_postable"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Dapat Diposting</FormLabel>
                <FormDescription>
                  Aktifkan jika akun ini dapat digunakan untuk transaksi
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Batal
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Menyimpan...' : (initialData ? 'Perbarui' : 'Tambah')}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CoaForm;