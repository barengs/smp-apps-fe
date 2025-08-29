import React from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAddTransactionMutation } from '@/store/slices/bankApi';
import * as toast from '@/utils/toast';

const formSchema = z.object({
  destination_account: z.string().min(1, 'Nomor rekening tujuan harus diisi.'),
  transaction_type: z.enum(['deposit', 'withdrawal'], {
    required_error: 'Tipe transaksi harus dipilih.',
  }),
  amount: z.coerce.number().min(1, 'Jumlah harus lebih dari 0.'),
  description: z.string().min(1, 'Deskripsi harus diisi.'),
});

interface TransaksiFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const TransaksiForm: React.FC<TransaksiFormProps> = ({ isOpen, onClose }) => {
  const [addTransaction, { isLoading }] = useAddTransactionMutation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      destination_account: '',
      transaction_type: 'deposit',
      amount: 0,
      description: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // Explicitly construct the object to ensure all properties are present and typed correctly
      const transactionData = {
        destination_account: values.destination_account,
        transaction_type: values.transaction_type,
        amount: values.amount.toString(), // Convert amount to string before sending to API
        description: values.description,
      };
      await addTransaction(transactionData).unwrap();
      toast.showSuccess('Transaksi berhasil ditambahkan.');
      form.reset();
      onClose();
    } catch (error) {
      toast.showError('Gagal menambahkan transaksi.');
      console.error(error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tambah Transaksi Baru</DialogTitle>
          <DialogDescription>
            Isi detail transaksi di bawah ini.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="destination_account"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nomor Rekening Tujuan</FormLabel>
                  <FormControl>
                    <Input placeholder="Masukkan nomor rekening tujuan" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="transaction_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipe Transaksi</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih tipe transaksi" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="deposit">Deposit (Setoran)</SelectItem>
                      <SelectItem value="withdrawal">Withdrawal (Penarikan)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jumlah (Rp)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Masukkan jumlah" {...field} />
                  </FormControl>
                  <FormMessage />
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
                    <Textarea placeholder="Contoh: Setoran bulanan" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Batal
              </Button>
              <Button type="submit" variant="success" disabled={isLoading}>
                {isLoading ? 'Menyimpan...' : 'Simpan Transaksi'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default TransaksiForm;