import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { showSuccess, showError } from '@/utils/toast';
import { useCreateMenuMutation, useUpdateMenuMutation, type CreateUpdateMenuRequest } from '@/store/slices/menuApi';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { SerializedError } from '@reduxjs/toolkit';
import { IconPicker } from '@/components/IconPicker';

const formSchema = z.object({
  title: z.string().min(2, {
    message: 'Judul harus minimal 2 karakter.',
  }),
  en_title: z.string().nullable().optional(),
  ar_title: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
  route: z.string().min(1, {
    message: 'Rute tidak boleh kosong.',
  }),
  type: z.enum(['main', 'sub-menu', 'external'], { // Diubah dari 'sub' menjadi 'sub-menu'
    required_error: 'Tipe harus dipilih.',
  }),
  position: z.enum(['sidebar', 'header', 'footer'], {
    required_error: 'Posisi harus dipilih.',
  }),
  status: z.enum(['active', 'inactive'], {
    required_error: 'Status harus dipilih.',
  }),
  order: z.preprocess(
    (val) => (val === "" ? null : Number(val)),
    z.number().int().min(0).nullable().optional()
  ),
});

interface MenuFormProps {
  initialData?: {
    id: number;
    title: string; // This is id_title
    en_title?: string | null;
    ar_title?: string | null;
    description: string | null;
    icon: string;
    route: string;
    type: string;
    position: string;
    status: string;
    order: number | null;
  };
  onSuccess: () => void;
  onCancel: () => void;
}

const MenuForm: React.FC<MenuFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const [createMenu, { isLoading: isCreating }] = useCreateMenuMutation();
  const [updateMenu, { isLoading: isUpdating }] = useUpdateMenuMutation(); 

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      title: initialData.title,
      en_title: initialData.en_title,
      ar_title: initialData.ar_title,
      description: initialData.description,
      icon: initialData.icon,
      route: initialData.route,
      type: initialData.type as "main" | "sub-menu" | "external", // Diubah dari 'sub' menjadi 'sub-menu'
      position: initialData.position as "sidebar" | "header" | "footer",
      status: initialData.status as "active" | "inactive",
      order: initialData.order,
    } : {
      title: '',
      en_title: '',
      ar_title: '',
      description: null,
      icon: null,
      route: '',
      type: 'main',
      position: 'sidebar',
      status: 'active',
      order: null,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const payload: CreateUpdateMenuRequest = {
      id_title: values.title,
      en_title: values.en_title,
      ar_title: values.ar_title,
      description: values.description,
      icon: values.icon || undefined,
      route: values.route,
      type: values.type,
      position: values.position,
      status: values.status,
      order: values.order,
    };

    console.log('Payload being sent for update:', payload);

    try {
      if (initialData) {
        await updateMenu({ id: initialData.id, data: payload }).unwrap(); 
        showSuccess(`Item navigasi "${values.title}" berhasil diperbarui.`);
      } else {
        await createMenu(payload).unwrap();
        showSuccess(`Item navigasi "${values.title}" berhasil ditambahkan.`);
      }
      onSuccess();
    } catch (err: unknown) {
      let errorMessage = 'Terjadi kesalahan tidak dikenal.';
      if (typeof err === 'object' && err !== null) {
        if ('status' in err) {
          const fetchError = err as FetchBaseQueryError;
          if (fetchError.data && typeof fetchError.data === 'object' && 'message' in fetchError.data) {
            errorMessage = (fetchError.data as { message: string }).message;
          } else {
            errorMessage = `Error: Gagal memproses permintaan.`;
          }
        } else if ('message' in err) {
          errorMessage = (err as SerializedError).message ?? 'Error tidak diketahui';
        }
      }
      showError(`Gagal menyimpan item navigasi: ${errorMessage}`);
    }
  };

  const isSubmitting = isCreating || isUpdating; 

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Judul</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: Dashboard Utama" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <FormField
              control={form.control}
              name="en_title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Judul (Inggris)</FormLabel>
                  <FormControl>
                    <Input placeholder="English Title" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="ar_title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Judul (Arab)</FormLabel>
                  <FormControl>
                    <Input placeholder="Arabic Title" {...field} value={field.value || ''} className="text-right" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>
        <FormField
          control={form.control}
          name="route"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rute</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: /dashboard/administrasi" {...field} disabled={!!initialData} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="icon"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Ikon (Opsional)</FormLabel>
              <FormControl>
                <IconPicker value={field.value || undefined} onChange={field.onChange} />
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
              <FormLabel>Deskripsi (Opsional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Deskripsi singkat item navigasi ini..." {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
            <FormItem>
              <FormLabel>Tipe</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih tipe" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="main">Utama</SelectItem>
                    <SelectItem value="sub-menu">Sub-Menu</SelectItem> {/* Diubah dari 'sub' menjadi 'sub-menu' */}
                    <SelectItem value="external">Eksternal</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
            </FormItem>
          )}
        />
          <FormField
            control={form.control}
            name="position"
            render={({ field }) => (
            <FormItem>
              <FormLabel>Posisi</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih posisi" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="sidebar">Sidebar</SelectItem>
                    <SelectItem value="header">Header</SelectItem>
                    <SelectItem value="footer">Footer</SelectItem>
                  </SelectContent>
                </Select>
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
                    <SelectItem value="active">Aktif</SelectItem>
                    <SelectItem value="inactive">Non-Aktif</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
            </FormItem>
          )}
        />
        </div>
        <FormField
          control={form.control}
          name="order"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Urutan (Opsional)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Contoh: 1" {...field} value={field.value === null ? '' : field.value} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Batal
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Menyimpan...' : (initialData ? 'Simpan Perubahan' : 'Tambah Item')}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default MenuForm;