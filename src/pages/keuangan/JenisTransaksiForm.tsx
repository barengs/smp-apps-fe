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
import { useGetDetailAccountsQuery } from '@/store/slices/coaApi'; // Import the new hook

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
  default_debit_coa: z.string().nullable().optional(), // Renamed field
  default_credit_coa: z.string().nullable().optional(), // Renamed field
});

const JenisTransaksiForm: React.FC<JenisTransaksiFormProps> = ({ isOpen, onClose, transactionType }) => {
  const [createTransactionType, { isLoading: isCreating }] = useCreateTransactionTypeMutation();
  const [updateTransactionType, { isLoading: isUpdating }] = useUpdateTransactionTypeMutation();
  const { data: detailAccounts, isLoading: isLoadingDetailAccounts, isError: isErrorDetailAccounts } = useGetDetailAccountsQuery();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: '',
      name: '',
      category: undefined, // Set to undefined for Select to show placeholder
      is_debit: false,
      is_credit: false,
      default_debit_coa: null, // Default to null
      default_credit_coa: null, // Default to null
    },
  });

  useEffect(() => {
    if (transactionType) {
      form.reset({
        ...transactionType,
        default_debit_coa: transactionType.default_debit_coa || null,
        default_credit_coa: transactionType.default_credit_coa || null,
      });
    } else {
      form.reset({
        code: '',
        name: '',
        category: undefined,
        is_debit: false,
        is_credit: false,
        default_debit_coa: null,
        default_credit_coa: null,
      });
    }
  }, [transactionType, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const payload: CreateUpdateTransactionTypeRequest = {
        code: values.code,
        name: values.name,
        category: values.category,
        is_debit: values.is_debit,
        is_credit: values.is_credit,
        default_debit_coa: values.default_debit_coa === "" ? null : values.default_debit_coa,
        default_credit_coa: values.default_credit_coa === "" ? null : values.default_credit_coa,
      };

      if (transactionType) {
        await updateTransactionType({ id: transactionType.id, data: payload }).unwrap();
        toast.showSuccess('Jenis transaksi berhasil diperbarui');
      } else {
        await createTransactionType(payload).unwrap();
        toast.showSuccess('Jenis transaksi berhasil ditambahkan');
      }
      onClose();
    } catch (error) {
      toast.showError('Terjadi kesalahan');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]"> {/* Increased max-width */}
        <DialogHeader>
          <DialogTitle>{transactionType ? 'Edit Jenis Transaksi' : 'Tambah Jenis Transaksi'}</DialogTitle>
          <DialogDescription>
            {transactionType ? 'Ubah detail jenis transaksi di bawah ini.' : 'Isi detail untuk jenis transaksi baru.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> {/* New row for COA fields */}
              <FormField
                control={form.control}
                name="default_debit_coa" // Renamed field
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>COA Debit Default (Opsional)</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value === "__NULL__" ? null : value)}
                      value={field.value === null ? "__NULL__" : field.value || ""}
                      disabled={isLoadingDetailAccounts || isErrorDetailAccounts}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih akun COA Debit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="__NULL__">Tidak ada</SelectItem>
                        {isLoadingDetailAccounts ? (
                          <SelectItem value="loading" disabled>Memuat akun detail...</SelectItem>
                        ) : isErrorDetailAccounts ? (
                          <SelectItem value="error" disabled>Gagal memuat akun detail.</SelectItem>
                        ) : (
                          (detailAccounts || []).map((item) => (
                            <SelectItem key={item.coa_code} value={item.coa_code}>
                              {item.coa_code} - {item.account_name}
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
                name="default_credit_coa" // Renamed field
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>COA Credit Default (Opsional)</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value === "__NULL__" ? null : value)}
                      value={field.value === null ? "__NULL__" : field.value || ""}
                      disabled={isLoadingDetailAccounts || isErrorDetailAccounts}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih akun COA Credit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="__NULL__">Tidak ada</SelectItem>
                        {isLoadingDetailAccounts ? (
                          <SelectItem value="loading" disabled>Memuat akun detail...</SelectItem>
                        ) : isErrorDetailAccounts ? (
                          <SelectItem value="error" disabled>Gagal memuat akun detail.</SelectItem>
                        ) : (
                          (detailAccounts || []).map((item) => (
                            <SelectItem key={item.coa_code} value={item.coa_code}>
                              {item.coa_code} - {item.account_name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
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