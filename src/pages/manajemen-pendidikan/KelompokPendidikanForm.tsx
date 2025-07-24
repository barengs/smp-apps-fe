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
import { Input } from '@/components/ui/input';
import { useAddEducationClassMutation } from '@/store/slices/educationClassApi';
import * as toast from '@/utils/toast';
import { KelompokPendidikan } from '@/types/pendidikan'; // Menggunakan alias path

const formSchema = z.object({
  code: z.string().min(1, { message: 'Kode tidak boleh kosong.' }),
  name: z.string().min(1, { message: 'Nama tidak boleh kosong.' }),
});

interface KelompokPendidikanFormProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: KelompokPendidikan | null;
}

const KelompokPendidikanForm: React.FC<KelompokPendidikanFormProps> = ({
  isOpen,
  onClose,
  initialData,
}) => {
  const [addEducationClass, { isLoading: isAdding }] = useAddEducationClassMutation();
  // const [updateEducationClass, { isLoading: isUpdating }] = useUpdateEducationClassMutation(); // Untuk fitur edit nanti

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: '',
      name: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    } else {
      form.reset({ code: '', name: '' });
    }
  }, [initialData, form, isOpen]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (initialData) {
        // Logika untuk update
        // await updateEducationClass({ id: initialData.id, ...values }).unwrap();
        toast.showSuccess('Data berhasil diperbarui!');
      } else {
        await addEducationClass(values).unwrap();
        toast.showSuccess('Data berhasil ditambahkan!');
      }
      onClose();
    } catch (error) {
      toast.showError('Terjadi kesalahan saat menyimpan data.');
      console.error(error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Edit Kelompok Pendidikan' : 'Tambah Kelompok Pendidikan'}
          </DialogTitle>
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
                    <Input placeholder="Contoh: SDIT" {...field} />
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
                  <FormLabel>Nama Kelompok Pendidikan</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: Sekolah Dasar Islam Terpadu" {...field} />
                  </FormControl>
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
              <Button type="submit" disabled={isAdding}>
                Simpan
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default KelompokPendidikanForm;