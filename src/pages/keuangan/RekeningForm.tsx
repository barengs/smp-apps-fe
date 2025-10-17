import React, { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Combobox } from '@/components/ui/combobox';
import { useGetStudentsQuery } from '@/store/slices/studentApi';
import { useGetProdukBankQuery } from '@/store/slices/produkBankApi';
import { CreateUpdateAccountRequest } from '@/types/keuangan';
import { format } from 'date-fns';

const formSchema = z.object({
  student_id: z.number({ required_error: 'Santri harus dipilih.' }), // Changed from customer_id to student_id
  product_id: z.number({ required_error: 'Produk bank harus dipilih.' }),
  status: z.enum(['ACTIVE', 'INACTIVE', 'FROZEN', 'CLOSED'], {
    required_error: 'Status harus dipilih.',
  }),
  open_date: z.date({ required_error: 'Tanggal buka harus diisi.' }),
});

interface RekeningFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<CreateUpdateAccountRequest>) => void;
  initialData: any;
  isLoading: boolean;
}

export const RekeningForm: React.FC<RekeningFormProps> = ({ isOpen, onClose, onSubmit, initialData, isLoading }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      student_id: initialData?.student_id, // Changed from customer_id to student_id
      product_id: initialData?.product_id,
      status: initialData?.status || 'ACTIVE',
      open_date: initialData?.open_date ? new Date(initialData.open_date) : new Date(),
    },
  });

  const { data: studentsData, isLoading: isStudentsLoading } = useGetStudentsQuery({});
  const { data: produkBankData, isLoading: isProdukLoading } = useGetProdukBankQuery();

  const santriOptions = useMemo(() => {
    return studentsData?.data.map(student => ({
      value: student.id,
      label: `${student.first_name} ${student.last_name || ''} (NIS: ${student.nis})`,
    })) || [];
  }, [studentsData]);

  const produkOptions = useMemo(() => {
    return produkBankData?.data.map(produk => ({
      value: produk.id,
      label: produk.product_name,
    })) || [];
  }, [produkBankData]);

  React.useEffect(() => {
    if (initialData) {
      form.reset({
        student_id: initialData.student_id, // Changed from customer_id to student_id
        product_id: initialData.product_id,
        status: initialData.status,
        open_date: new Date(initialData.open_date),
      });
    } else {
      form.reset({
        student_id: undefined, // Changed from customer_id to student_id
        product_id: undefined,
        status: 'ACTIVE',
        open_date: new Date(),
      });
    }
  }, [initialData, form]);

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit({
      ...values,
      open_date: format(values.open_date, 'yyyy-MM-dd'),
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Rekening' : 'Tambah Rekening'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="student_id" // Changed from customer_id to student_id
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Santri</FormLabel>
                  <Combobox
                    options={santriOptions}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Pilih Santri..."
                    searchPlaceholder="Cari santri..."
                    isLoading={isStudentsLoading}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="product_id"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Produk Bank</FormLabel>
                  <Combobox
                    options={produkOptions}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Pilih Produk Bank..."
                    searchPlaceholder="Cari produk..."
                    isLoading={isProdukLoading}
                  />
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
                      <SelectItem value="ACTIVE">Aktif</SelectItem>
                      <SelectItem value="INACTIVE">Tidak Aktif</SelectItem>
                      <SelectItem value="FROZEN">Dibekukan</SelectItem>
                      <SelectItem value="CLOSED">Ditutup</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="open_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tanggal Buka</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      value={format(field.value, 'yyyy-MM-dd')}
                      onChange={(e) => field.onChange(new Date(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
              <Button type="submit" disabled={isLoading}>{isLoading ? 'Menyimpan...' : 'Simpan'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};