import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'; // Import Select components
import { useCreateTransactionTypeMutation, useUpdateTransactionTypeMutation } from '@/store/slices/transactionTypeApi';
import { TransactionType, CreateUpdateTransactionTypeRequest } from '@/types/keuangan';
import * as toast from '@/utils/toast';

interface JenisTransaksiFormProps {
  isOpen: boolean;
  onClose: () => void;
  transactionType: TransactionType | null;
}

const formSchema = z.object({
  code: z.string().min(1, 'Kode harus diisi'),
  name: z.string().min(3, 'Nama jenis transaksi minimal 3 karakter'),
  category: z.enum(['transfer', 'payment', 'cash_operation', 'fee'], { // Diperbarui menjadi huruf kecil
    required_error: 'Kategori harus dipilih.',
  }),
  is_debit: z.boolean().default(false),
  is_credit: z.boolean().default(false),
});

const JenisTransaksiForm: React.FC<JenisTransaksiFormProps> = ({ isOpen, onClose, transactionType }) => {
  const [createTransactionType, { isLoading: isCreating }] = useCreateTransactionTypeMutation();
  const [updateTransactionType, { isLoading: isUpdating }] = useUpdateTransactionTypeMutation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: '',
      name: '',
      category: undefined, // Set to undefined for Select to show placeholder
      is_debit: false,
      is_credit: false,
    },
  });

  useEffect(() => {
    if (transactionType) {
      form.reset(transactionType);
    } else {
      form.reset({
        code: '',
        name: '',
        category: undefined,
        is_debit: false,
        is_credit: false,
      });
    }
  }, [transactionType, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (transactionType) {
        await updateTransactionType({ id: transactionType.id, data: values as CreateUpdateTransactionTypeRequest }).unwrap();
        toast.showSuccess('Jenis transaksi berhasil diperbarui');
      } else {
        await createTransactionType(values as CreateUpdateTransactionTypeRequest).unwrap();
        toast.showSuccess('Jenis transaksi berhasil ditambahkan');
      }
      onClose();
    } catch (error) {
      toast.showError('Terjadi kesalahan');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{transactionType ? 'Edit Jenis Transaksi' : 'Tambah Jenis Transaksi'}</DialogTitle>
          <DialogDescription>
            {transactionType ? 'Ubah detail jenis transaksi di bawah ini.' : 'Isi detail untuk jenis transaksi baru.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kode</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: TRF-01" {...field} />
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
                  <FormLabel>Nama Jenis Transaksi</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: Transfer Antar Bank" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kategori</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kategori" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="transfer">Transfer</SelectItem>
                      <SelectItem value="payment">Pembayaran</SelectItem>
                      <SelectItem value="cash_operation">Operasi Tunai</SelectItem>
                      <SelectItem value="fee">Biaya</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-4">
              <FormField
                control={form.control}
                name="is_debit"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm flex-1">
                    <div className="space-y-0.5">
                      <FormLabel>Debit?</FormLabel>
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
              <FormField
                control={form.control}
                name="is_credit"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm flex-1">
                    <div className="space-y-0.5">
                      <FormLabel>Kredit?</FormLabel>
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
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Batal
              </Button>
              <Button type="submit" disabled={isCreating || isUpdating}>
                {(isCreating || isUpdating) ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default JenisTransaksiForm;