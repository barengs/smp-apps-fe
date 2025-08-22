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
import { useCreateCoaMutation, useUpdateCoaMutation, useGetCoaQuery, Coa, CreateUpdateCoaRequest } from '@/store/slices/coaApi';
import * as toast from '@/utils/toast';

interface CoaFormProps {
  isOpen: boolean;
  onClose: () => void;
  coa: Coa | null;
}

const formSchema = z.object({
  coa_code: z.string().min(1, 'Kode COA tidak boleh kosong'),
  account_name: z.string().min(3, 'Nama akun minimal 3 karakter'),
  account_type: z.enum(['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE'], { required_error: 'Tipe akun harus dipilih' }),
  level: z.enum(['HEADER', 'SUBHEADER', 'DETAIL'], { required_error: 'Level akun harus dipilih' }), // New field
  parent_coa_code: z.string().optional().nullable(),
  is_postable: z.boolean().default(true),
});

const CoaForm: React.FC<CoaFormProps> = ({ isOpen, onClose, coa }) => {
  const [createCoa, { isLoading: isCreating }] = useCreateCoaMutation();
  const [updateCoa, { isLoading: isUpdating }] = useUpdateCoaMutation();
  const { data: coaList } = useGetCoaQuery();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      coa_code: '',
      account_name: '',
      account_type: undefined,
      level: undefined, // Default value for new account
      parent_coa_code: null,
      is_postable: true,
    },
  });

  useEffect(() => {
    if (coa) {
      form.reset({
        ...coa,
        parent_coa_code: coa.parent_coa_code || null,
      });
    } else {
      form.reset({
        coa_code: '',
        account_name: '',
        account_type: undefined,
        level: undefined, // Clear for new account
        parent_coa_code: null,
        is_postable: true,
      });
    }
  }, [coa, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (coa) {
        await updateCoa({ id: coa.coa_code, data: values as CreateUpdateCoaRequest }).unwrap();
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
              name="coa_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kode COA</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: 1-10100" {...field} disabled={!!coa} />
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
                    <Input placeholder="Contoh: Kas" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="account_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipe Akun</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Pilih tipe" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ASSET">Aset (Asset)</SelectItem>
                      <SelectItem value="LIABILITY">Kewajiban (Liability)</SelectItem>
                      <SelectItem value="EQUITY">Ekuitas (Equity)</SelectItem>
                      <SelectItem value="REVENUE">Pendapatan (Revenue)</SelectItem>
                      <SelectItem value="EXPENSE">Beban (Expense)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="level" // New field
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Level</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Pilih level" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="HEADER">Header</SelectItem>
                      <SelectItem value="SUBHEADER">Subheader</SelectItem>
                      <SelectItem value="DETAIL">Detail</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="parent_coa_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Akun Induk (Parent)</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value === "__NULL__" ? null : value)}
                    defaultValue={field.value === null ? "__NULL__" : field.value}
                  >
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Pilih akun induk (opsional)" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="__NULL__">Tidak ada</SelectItem>
                      {(coaList || []).map((item) => (
                        <SelectItem key={item.coa_code} value={item.coa_code}>
                          {item.coa_code} - {item.account_name}
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
              name="is_postable"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Dapat Diposting (Postable)</FormLabel>
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