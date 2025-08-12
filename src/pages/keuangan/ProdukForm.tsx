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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateProdukBankMutation, useUpdateProdukBankMutation, ProdukBank, CreateUpdateProdukBankRequest } from '@/store/slices/produkBankApi';
import * as toast from '@/utils/toast';

interface ProdukFormProps {
  isOpen: boolean;
  onClose: () => void;
  produk: ProdukBank | null;
}

const formSchema = z.object({
  nama_produk: z.string().min(3, 'Nama produk minimal 3 karakter'),
  deskripsi: z.string().min(10, 'Deskripsi minimal 10 karakter'),
  jenis_produk: z.enum(['simpanan', 'pembiayaan'], {
    required_error: 'Jenis produk harus dipilih',
  }),
  saldo_minimum: z.coerce.number().min(0, 'Saldo minimum tidak boleh negatif'),
  biaya_administrasi: z.coerce.number().min(0, 'Biaya administrasi tidak boleh negatif'),
  status: z.enum(['aktif', 'tidak_aktif'], {
    required_error: 'Status harus dipilih',
  }),
});

const ProdukForm: React.FC<ProdukFormProps> = ({ isOpen, onClose, produk }) => {
  const [createProduk, { isLoading: isCreating }] = useCreateProdukBankMutation();
  const [updateProduk, { isLoading: isUpdating }] = useUpdateProdukBankMutation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nama_produk: '',
      deskripsi: '',
      jenis_produk: undefined,
      saldo_minimum: 0,
      biaya_administrasi: 0,
      status: 'aktif',
    },
  });

  useEffect(() => {
    if (produk) {
      form.reset(produk);
    } else {
      form.reset({
        nama_produk: '',
        deskripsi: '',
        jenis_produk: undefined,
        saldo_minimum: 0,
        biaya_administrasi: 0,
        status: 'aktif',
      });
    }
  }, [produk, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (produk) {
        await updateProduk({ id: produk.id, data: values as CreateUpdateProdukBankRequest }).unwrap();
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
              name="nama_produk"
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
              name="deskripsi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Jelaskan tentang produk ini" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="jenis_produk"
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
                      <SelectItem value="simpanan">Simpanan</SelectItem>
                      <SelectItem value="pembiayaan">Pembiayaan</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="saldo_minimum"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Saldo Minimum</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="biaya_administrasi"
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
                      <SelectItem value="aktif">Aktif</SelectItem>
                      <SelectItem value="tidak_aktif">Tidak Aktif</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
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