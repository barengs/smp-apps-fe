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
import { useCreateProdukBankMutation, useUpdateProdukBankMutation, ProdukBank, CreateUpdateProdukBankRequest, ProdukType } from '@/store/slices/produkBankApi';
import * as toast from '@/utils/toast';

interface ProdukFormProps {
  isOpen: boolean;
  onClose: () => void;
  produk: ProdukBank | null;
}

const formSchema = z.object({
  product_code: z.string().min(1, 'Kode produk harus diisi').optional(),
  product_name: z.string().min(3, 'Nama produk minimal 3 karakter'),
  product_type: z.enum(['Tabungan', 'Deposito', 'Pinjaman'], {
    required_error: 'Jenis produk harus dipilih',
  }),
  interest_rate: z.coerce.number().min(0, 'Suku bunga tidak boleh negatif'),
  admin_fee: z.coerce.number().min(0, 'Biaya administrasi tidak boleh negatif'),
  opening_fee: z.coerce.number().min(0, 'Biaya pembukaan tidak boleh negatif'), // New field
  is_active: z.boolean().default(true),
});

const ProdukForm: React.FC<ProdukFormProps> = ({ isOpen, onClose, produk }) => {
  const [createProduk, { isLoading: isCreating }] = useCreateProdukBankMutation();
  const [updateProduk, { isLoading: isUpdating }] = useUpdateProdukBankMutation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      product_code: '',
      product_name: '',
      product_type: undefined,
      interest_rate: 0,
      admin_fee: 0,
      opening_fee: 0, // Default value for new product
      is_active: true,
    },
  });

  useEffect(() => {
    if (produk) {
      form.reset({
        product_code: produk.product_code,
        product_name: produk.product_name,
        product_type: produk.product_type as ProdukType,
        interest_rate: parseFloat(produk.interest_rate),
        admin_fee: parseFloat(produk.admin_fee),
        opening_fee: parseFloat(produk.opening_fee), // Set opening_fee for existing product
        is_active: produk.is_active,
      });
    } else {
      form.reset({
        product_code: '',
        product_name: '',
        product_type: undefined,
        interest_rate: 0,
        admin_fee: 0,
        opening_fee: 0, // Clear for new product
        is_active: true,
      });
    }
  }, [produk, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (produk) {
        const { product_code, ...dataWithoutCode } = values;
        // Menggunakan produk.id.toString() sebagai ID untuk update
        await updateProduk({ id: produk.id.toString(), data: dataWithoutCode as CreateUpdateProdukBankRequest }).unwrap();
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
              name="product_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kode Produk</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Contoh: PROD-001"
                      {...field}
                      readOnly={!!produk}
                      required={!produk}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                      <SelectItem value="Tabungan">Tabungan</SelectItem>
                      <SelectItem value="Deposito">Deposito</SelectItem>
                      <SelectItem value="Pinjaman">Pinjaman</SelectItem>
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
              name="opening_fee" // New field
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Biaya Pembukaan</FormLabel>
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