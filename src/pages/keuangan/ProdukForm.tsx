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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useCreateProdukBankMutation, useUpdateProdukBankMutation, ProdukBank, CreateUpdateProdukBankRequest } from '@/store/slices/produkBankApi';
import * as toast from '@/utils/toast';

interface ProdukFormProps {
  isOpen: boolean;
  onClose: () => void;
  produk: ProdukBank | null;
}

const formSchema = z.object({
  product_name: z.string().min(3, 'Nama produk minimal 3 karakter'),
  product_type: z.enum(['SAVINGS', 'CHECKING', 'LOAN', 'TIME_DEPOSIT'], { // Diperbarui
    required_error: 'Jenis produk harus dipilih',
  }),
  interest_rate: z.coerce.number().min(0, 'Suku bunga tidak boleh negatif'),
  admin_fee: z.coerce.number().min(0, 'Biaya administrasi tidak boleh negatif'),
  is_active: z.boolean().default(true),
});

const ProdukForm: React.FC<ProdukFormProps> = ({ isOpen, onClose, produk }) => {
  const [createProduk, { isLoading: isCreating }] = useCreateProdukBankMutation();
  const [updateProduk, { isLoading: isUpdating }] = useUpdateProdukBankMutation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      product_name: '',
      product_type: undefined,
      interest_rate: 0,
      admin_fee: 0,
      is_active: true,
    },
  });

  useEffect(() => {
    if (produk) {
      form.reset({
        product_name: produk.product_name,
        product_type: produk.product_type,
        interest_rate: produk.interest_rate,
        admin_fee: produk.admin_fee,
        is_active: produk.is_active,
      });
    } else {
      form.reset({
        product_name: '',
        product_type: undefined,
        interest_rate: 0,
        admin_fee: 0,
        is_active: true,
      });
    }
  }, [produk, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (produk) {
        await updateProduk({ id: produk.product_code, data: values as CreateUpdateProdukBankRequest }).unwrap();
        toast.showSuccess('Produk berhasil diperbarui');
      } else {
        await createProduk(values as CreateUpdateProdukBankRequest).unwrap();
        toast.showSuccess('Produk berhasil ditambahkan');
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
          <DialogTitle>{produk ? 'Edit Produk' : 'Tambah Produk'}</DialogTitle>
          <DialogDescription>
            {produk ? 'Ubah detail produk di bawah ini.' : 'Isi detail untuk produk baru.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="product_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Produk</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: Tabungan Santri" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="product_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jenis Produk</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih jenis produk" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="SAVINGS">Simpanan (Savings)</SelectItem>
                      <SelectItem value="CHECKING">Giro (Checking)</SelectItem>
                      <SelectItem value="LOAN">Pinjaman (Loan)</SelectItem>
                      <SelectItem value="TIME_DEPOSIT">Deposito Berjangka (Time Deposit)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="interest_rate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Suku Bunga (%)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="admin_fee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Biaya Administrasi</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Status Aktif</FormLabel>
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

export default ProdukForm;