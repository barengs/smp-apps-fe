import React, { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
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
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, Info } from 'lucide-react';
import { PaymentPackage, CreateUpdatePaymentPackageRequest } from '@/types/keuangan';
import { useCreatePaymentPackageMutation, useUpdatePaymentPackageMutation } from '@/store/slices/paymentPackageApi';
import * as toast from '@/utils/toast';

const itemSchema = z.object({
  item_name: z.string().min(1, 'Nama item wajib diisi'),
  category: z.enum(['pendidikan', 'asrama', 'konsumsi', 'kesehatan', 'saku', 'lainnya']),
  amount: z.coerce.number().min(0, 'Nominal tidak boleh negatif'),
  is_saku: z.boolean().default(false),
});

const formSchema = z.object({
  package_code: z.string().min(1, 'Kode paket wajib diisi'),
  package_name: z.string().min(1, 'Nama paket wajib diisi'),
  description: z.string().optional(),
  academic_year: z.string().optional(),
  semester: z.enum(['ganjil', 'genap']).optional(),
  is_active: z.boolean().default(true),
  items: z.array(itemSchema).min(1, 'Minimal satu item harus ditambahkan'),
});

type FormValues = z.infer<typeof formSchema>;

interface PaketPembayaranFormProps {
  isOpen: boolean;
  onClose: () => void;
  paket?: PaymentPackage | null;
}

const PaketPembayaranForm: React.FC<PaketPembayaranFormProps> = ({ isOpen, onClose, paket }) => {
  const [createPaket, { isLoading: isCreating }] = useCreatePaymentPackageMutation();
  const [updatePaket, { isLoading: isUpdating }] = useUpdatePaymentPackageMutation();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      package_code: '',
      package_name: '',
      description: '',
      academic_year: '',
      semester: 'ganjil',
      is_active: true,
      items: [{ item_name: 'Uang Saku', category: 'saku', amount: 0, is_saku: true }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  useEffect(() => {
    if (paket) {
      form.reset({
        package_code: paket.package_code,
        package_name: paket.package_name,
        description: paket.description || '',
        academic_year: paket.academic_year || '',
        semester: (paket.semester as 'ganjil' | 'genap') || 'ganjil',
        is_active: paket.is_active,
        items: paket.items?.map(item => ({
          item_name: item.item_name,
          category: item.category,
          amount: parseFloat(item.amount),
          is_saku: item.is_saku,
        })) || [],
      });
    } else {
      form.reset({
        package_code: '',
        package_name: '',
        description: '',
        academic_year: '',
        semester: 'ganjil',
        is_active: true,
        items: [{ item_name: 'Uang Saku', category: 'saku', amount: 0, is_saku: true }],
      });
    }
  }, [paket, form, isOpen]);

  const onSubmit = async (values: FormValues) => {
    try {
      if (paket) {
        await updatePaket({ id: paket.id, data: values as CreateUpdatePaymentPackageRequest }).unwrap();
        toast.showSuccess('Paket berhasil diperbarui');
      } else {
        await createPaket(values as CreateUpdatePaymentPackageRequest).unwrap();
        toast.showSuccess('Paket berhasil dibuat');
      }
      onClose();
    } catch (err: any) {
      toast.showError(err?.data?.message || 'Terjadi kesalahan');
    }
  };

  const totalAmount = form.watch('items').reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const sakuAmount = form.watch('items').reduce((sum, item) => sum + (item.is_saku ? (Number(item.amount) || 0) : 0), 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{paket ? 'Edit Paket Pembayaran' : 'Tambah Paket Pembayaran'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="package_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kode Paket</FormLabel>
                    <FormControl>
                      <Input placeholder="PKT-2025-A" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="package_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Paket</FormLabel>
                    <FormControl>
                      <Input placeholder="Paket A Semester 1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="academic_year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tahun Ajaran</FormLabel>
                    <FormControl>
                      <Input placeholder="2024/2025" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="semester"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Semester</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih semester" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ganjil">Ganjil</SelectItem>
                        <SelectItem value="genap">Genap</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <FormLabel className="text-base font-semibold">Rincian Item Paket</FormLabel>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => append({ item_name: '', category: 'pendidikan', amount: 0, is_saku: false })}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Tambah Item
                </Button>
              </div>

              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-12 gap-3 items-end border p-3 rounded-md relative group">
                  <div className="col-span-4">
                    <FormField
                      control={form.control}
                      name={`items.${index}.item_name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Nama Item</FormLabel>
                          <FormControl>
                            <Input placeholder="mis: SPP" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="col-span-3">
                    <FormField
                      control={form.control}
                      name={`items.${index}.category`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Kategori</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="pendidikan">Pendidikan</SelectItem>
                              <SelectItem value="asrama">Asrama</SelectItem>
                              <SelectItem value="konsumsi">Konsumsi</SelectItem>
                              <SelectItem value="kesehatan">Kesehatan</SelectItem>
                              <SelectItem value="saku">Uang Saku</SelectItem>
                              <SelectItem value="lainnya">Lainnya</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="col-span-3">
                    <FormField
                      control={form.control}
                      name={`items.${index}.amount`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Nominal (Rp)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="col-span-1 flex justify-center pb-2">
                    <FormField
                      control={form.control}
                      name={`items.${index}.is_saku`}
                      render={({ field }) => (
                        <FormItem className="flex flex-col items-center space-y-1">
                          <FormLabel className="text-[10px]">Saku?</FormLabel>
                          <FormControl>
                            <Checkbox 
                              checked={field.value} 
                              onCheckedChange={field.onChange} 
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="col-span-1 flex justify-center pb-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-700 h-9 w-9"
                      onClick={() => remove(index)}
                      disabled={fields.length <= 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              
              <FormMessage>{form.formState.errors.items?.message}</FormMessage>

              <div className="bg-slate-50 p-4 rounded-lg space-y-2 border border-slate-200">
                <div className="flex justify-between text-sm">
                  <span>Total Nominal Paket:</span>
                  <span className="font-bold">Rp {totalAmount.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-sm text-blue-600">
                  <div className="flex items-center">
                    <span>Dialokasikan ke Uang Saku:</span>
                    <Info className="h-3 w-3 ml-1 cursor-help" title="Dana ini akan tetap mengendap di rekening santri dan bisa ditarik di koperasi" />
                  </div>
                  <span className="font-semibold">Rp {sakuAmount.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-sm text-green-600 border-t pt-2 mt-2">
                  <span>Dana yang Akan Terpotong:</span>
                  <span className="font-bold">Rp {(totalAmount - sakuAmount).toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>

            <DialogFooter className="pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose} disabled={isCreating || isUpdating}>
                Batal
              </Button>
              <Button type="submit" disabled={isCreating || isUpdating}>
                {isCreating || isUpdating ? 'Menyimpan...' : (paket ? 'Simpan Perubahan' : 'Buat Paket')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default PaketPembayaranForm;
