import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Account, CreateUpdateAccountRequest } from '@/types/keuangan';
import { useGetStudentsQuery } from '@/store/slices/studentApi';
import { useGetProdukBankQuery } from '@/store/slices/produkBankApi';
import { Combobox } from '@/components/ui/combobox';
import { ProdukBank } from '@/store/slices/produkBankApi';

interface RekeningFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<CreateUpdateAccountRequest>) => void;
  initialData?: Account | null;
  isLoading: boolean;
}

const formSchema = z.object({
  customer_id: z.number({ required_error: 'Santri harus dipilih.' }),
  product_id: z.number({ required_error: 'Produk bank harus dipilih.' }),
  status: z.enum(['ACTIVE', 'INACTIVE', 'FROZEN', 'CLOSED'], {
    required_error: 'Status harus dipilih.',
  }),
  open_date: z.date({ required_error: 'Tanggal buka harus diisi.' }),
});

export const RekeningForm: React.FC<RekeningFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading,
}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const { data: studentsData, isLoading: isLoadingStudents } = useGetStudentsQuery();
  const { data: produkBankData, isLoading: isLoadingProduk } = useGetProdukBankQuery();

  useEffect(() => {
    if (initialData) {
      form.reset({
        customer_id: initialData.customer_id,
        product_id: initialData.product_id,
        status: initialData.status,
        open_date: new Date(initialData.open_date),
      });
    } else {
      form.reset({
        customer_id: undefined,
        product_id: undefined,
        status: 'ACTIVE',
        open_date: new Date(),
      });
    }
  }, [initialData, form, isOpen]);

  const studentOptions = React.useMemo(() => {
    return studentsData?.data.map((student) => ({
      value: student.id,
      label: `${student.first_name} (${student.nis})`,
    })) ?? [];
  }, [studentsData]);

  const produkBankOptions = React.useMemo(() => {
    // Asumsi produk memiliki ID numerik, meskipun tidak didefinisikan secara eksplisit di tipe ProdukBank
    return produkBankData?.data.map((p: ProdukBank & { id: number }) => ({
      value: p.id,
      label: p.product_name,
    })) ?? [];
  }, [produkBankData]);

  const handleFormSubmit = (values: z.infer<typeof formSchema>) => {
    const baseRequestData = {
      ...values,
      open_date: format(values.open_date, 'yyyy-MM-dd'),
    };
    
    if (initialData) {
        // Hanya kirim field yang berubah saat update
        const changedData: Partial<CreateUpdateAccountRequest> = {};
        if (baseRequestData.product_id !== initialData.product_id) changedData.product_id = baseRequestData.product_id;
        if (baseRequestData.status !== initialData.status) changedData.status = baseRequestData.status;
        if (baseRequestData.open_date !== initialData.open_date) changedData.open_date = baseRequestData.open_date;
        onSubmit(changedData);
    } else {
        // Untuk akun baru, semua field diperlukan. Type assertion digunakan karena Zod menjamin validasi.
        onSubmit(baseRequestData as CreateUpdateAccountRequest);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Rekening' : 'Tambah Rekening'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="customer_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Santri</FormLabel>
                  <FormControl>
                    <Combobox
                      options={studentOptions}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Pilih Santri..."
                      searchPlaceholder="Cari santri..."
                      disabled={isLoadingStudents || !!initialData}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="product_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Produk Bank</FormLabel>
                  <Select onValueChange={(value) => field.onChange(Number(value))} value={String(field.value)} disabled={isLoadingProduk}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih produk" />
                      </SelectTrigger>
                    </FormControl>
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
                  <Select onValueChange={field.onChange} value={field.value}>
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
                <FormItem className="flex flex-col">
                  <FormLabel>Tanggal Buka</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'PPP')
                          ) : (
                            <span>Pilih tanggal</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Batal
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};