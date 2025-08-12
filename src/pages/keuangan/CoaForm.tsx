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
import { useCreateCoaMutation, useUpdateCoaMutation, useGetCoaQuery, Coa, CreateUpdateCoaRequest } from '@/store/slices/coaApi';
import * as toast from '@/utils/toast';

interface CoaFormProps {
  isOpen: boolean;
  onClose: () => void;
  coa: Coa | null;
}

const formSchema = z.object({
  kode_akun: z.string().min(1, 'Kode akun tidak boleh kosong'),
  nama_akun: z.string().min(3, 'Nama akun minimal 3 karakter'),
  posisi_akun: z.enum(['debit', 'kredit'], { required_error: 'Posisi akun harus dipilih' }),
  kategori_akun: z.enum(['aset', 'liabilitas', 'ekuitas', 'pendapatan', 'beban'], { required_error: 'Kategori akun harus dipilih' }),
  parent_id: z.coerce.number().optional().nullable(),
  saldo_awal: z.coerce.number().min(0, 'Saldo awal tidak boleh negatif'),
  status: z.enum(['aktif', 'tidak_aktif'], { required_error: 'Status harus dipilih' }),
});

const CoaForm: React.FC<CoaFormProps> = ({ isOpen, onClose, coa }) => {
  const [createCoa, { isLoading: isCreating }] = useCreateCoaMutation();
  const [updateCoa, { isLoading: isUpdating }] = useUpdateCoaMutation();
  const { data: coaList } = useGetCoaQuery();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      kode_akun: '',
      nama_akun: '',
      posisi_akun: undefined,
      kategori_akun: undefined,
      parent_id: null,
      saldo_awal: 0,
      status: 'aktif',
    },
  });

  useEffect(() => {
    if (coa) {
      form.reset({
        ...coa,
        parent_id: coa.parent_id || null,
      });
    } else {
      form.reset({
        kode_akun: '',
        nama_akun: '',
        posisi_akun: undefined,
        kategori_akun: undefined,
        parent_id: null,
        saldo_awal: 0,
        status: 'aktif',
      });
    }
  }, [coa, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (coa) {
        await updateCoa({ id: coa.id, data: values as CreateUpdateCoaRequest }).unwrap();
        toast.showSuccess('Akun berhasil diperbarui');
      } else {
        await createCoa(values as CreateUpdateCoaRequest).unwrap();
        toast.showSuccess('Akun berhasil ditambahkan');
      }
      onClose();
    } catch (error) {
      toast.showError('Terjadi kesalahan');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{coa ? 'Edit Akun (COA)' : 'Tambah Akun (COA)'}</DialogTitle>
          <DialogDescription>
            {coa ? 'Ubah detail akun di bawah ini.' : 'Isi detail untuk akun baru.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="kode_akun"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kode Akun</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: 1-10100" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nama_akun"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Akun</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: Kas" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="kategori_akun"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kategori Akun</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="aset">Aset</SelectItem>
                      <SelectItem value="liabilitas">Liabilitas</SelectItem>
                      <SelectItem value="ekuitas">Ekuitas</SelectItem>
                      <SelectItem value="pendapatan">Pendapatan</SelectItem>
                      <SelectItem value="beban">Beban</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="posisi_akun"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Posisi Saldo Normal</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Pilih posisi" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="debit">Debit</SelectItem>
                      <SelectItem value="kredit">Kredit</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="parent_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Akun Induk (Parent)</FormLabel>
                  <Select onValueChange={(value) => field.onChange(value ? parseInt(value) : null)} defaultValue={field.value?.toString()}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Pilih akun induk (opsional)" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">Tidak ada</SelectItem>
                      {coaList?.data.map((item) => (
                        <SelectItem key={item.id} value={item.id.toString()}>
                          {item.kode_akun} - {item.nama_akun}
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
              name="saldo_awal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Saldo Awal</FormLabel>
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
                      <SelectTrigger><SelectValue placeholder="Pilih status" /></SelectTrigger>
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
              <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
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

export default CoaForm;