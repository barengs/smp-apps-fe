import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Room, CreateUpdateRoomRequest } from '@/types/kepesantrenan';
import { useGetHostelsQuery } from '@/store/slices/hostelApi';
import { Combobox } from '@/components/ui/combobox';

const formSchema = z.object({
  name: z.string().min(1, 'Nama kamar wajib diisi'),
  hostel_id: z.number({ required_error: 'Asrama wajib dipilih' }),
  capacity: z.coerce.number().min(1, 'Kapasitas harus lebih dari 0'),
  description: z.string().optional(),
  is_active: z.boolean().default(true),
});

interface KamarFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateUpdateRoomRequest) => void;
  initialData: Room | null;
  isLoading: boolean;
}

export const KamarForm: React.FC<KamarFormProps> = ({ isOpen, onClose, onSubmit, initialData, isLoading }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      hostel_id: undefined,
      capacity: 0,
      description: '',
      is_active: true,
    },
  });

  const { data: hostelsData, isLoading: isHostelsLoading } = useGetHostelsQuery();

  const hostelOptions = hostelsData?.data.map(hostel => ({
    value: hostel.id,
    label: hostel.name,
  })) || [];

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        hostel_id: initialData.hostel_id,
        capacity: initialData.capacity,
        description: initialData.description,
        is_active: initialData.is_active,
      });
    } else {
      form.reset({
        name: '',
        hostel_id: undefined,
        capacity: 0,
        description: '',
        is_active: true,
      });
    }
  }, [initialData, form]);

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values as CreateUpdateRoomRequest); // Type assertion
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Kamar' : 'Tambah Kamar'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Kamar</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: Kamar A1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="hostel_id"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Asrama</FormLabel>
                  <Combobox
                    options={hostelOptions}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Pilih Asrama..."
                    searchPlaceholder="Cari asrama..."
                    isLoading={isHostelsLoading}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kapasitas</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Jumlah kapasitas" {...field} />
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
                    <Textarea placeholder="Deskripsi singkat kamar" {...field} />
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
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
              <Button type="submit" disabled={isLoading}>{isLoading ? 'Menyimpan...' : 'Simpan'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};