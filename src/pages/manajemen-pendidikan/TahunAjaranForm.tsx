import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import * as toast from '@/utils/toast';
import { useCreateTahunAjaranMutation, useUpdateTahunAjaranMutation, type CreateUpdateTahunAjaranRequest } from '@/store/slices/tahunAjaranApi';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { SerializedError } from '@reduxjs/toolkit';
import { DatePicker } from '@/components/ui/datepicker';

const formSchema = z.object({
  year: z.string().regex(/^\d{4}\/\d{4}$/, {
    message: 'Format tahun ajaran harus YYYY/YYYY (contoh: 2023/2024).',
  }),
  type: z.enum(['Semester', 'Triwulan'], {
    errorMap: () => ({ message: 'Tipe harus dipilih.' }),
  }),
  periode: z.string().min(1, { message: 'Periode harus dipilih.' }),
  start_date: z.date({
    required_error: 'Tanggal mulai harus dipilih.',
  }),
  end_date: z.date({
    required_error: 'Tanggal akhir harus dipilih.',
  }),
  active: z.boolean().default(false),
  description: z.string().optional(),
}).refine((data) => data.end_date > data.start_date, {
  message: 'Tanggal akhir harus setelah tanggal mulai.',
  path: ['end_date'],
});

interface TahunAjaranFormProps {
  initialData?: {
    id: number;
    year: string;
    type?: string;
    periode?: string;
    start_date?: string;
    end_date?: string;
    active: boolean;
    description: string | null;
  };
  onSuccess: () => void;
  onCancel: () => void;
}

const TahunAjaranForm: React.FC<TahunAjaranFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const [createTahunAjaran, { isLoading: isCreating }] = useCreateTahunAjaranMutation();
  const [updateTahunAjaran, { isLoading: isUpdating }] = useUpdateTahunAjaranMutation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      ...initialData,
      description: initialData.description || '',
      type: (initialData.type as 'Semester' | 'Triwulan') || 'Semester',
      periode: initialData.periode || '',
      start_date: initialData.start_date ? new Date(initialData.start_date) : undefined,
      end_date: initialData.end_date ? new Date(initialData.end_date) : undefined,
    } : {
      year: '',
      type: 'Semester',
      periode: '',
      start_date: undefined,
      end_date: undefined,
      active: false,
      description: '',
    },
  });

  const typeValue = form.watch('type');
  const periodeValue = form.watch('periode');

  useEffect(() => {
    if (typeValue === 'Semester' && periodeValue && !['Ganjil', 'Genap'].includes(periodeValue)) {
      form.setValue('periode', '');
    } else if (typeValue === 'Triwulan' && periodeValue && !['Cawu 1', 'Cawu 2', 'Cawu 3'].includes(periodeValue)) {
      form.setValue('periode', '');
    }
  }, [typeValue, form, periodeValue]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const payload: CreateUpdateTahunAjaranRequest = {
      year: values.year,
      type: values.type,
      periode: values.periode,
      start_date: values.start_date.toISOString().split('T')[0],
      end_date: values.end_date.toISOString().split('T')[0],
      active: values.active,
      description: values.description,
    };

    try {
      if (initialData) {
        await updateTahunAjaran({ id: initialData.id, data: payload }).unwrap();
        toast.showSuccess(`Tahun Ajaran "${values.year}" berhasil diperbarui.`);
      } else {
        await createTahunAjaran(payload).unwrap();
        toast.showSuccess(`Tahun Ajaran "${values.year}" berhasil ditambahkan.`);
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
      toast.showError(`Gagal menyimpan tahun ajaran: ${errorMessage}`);
    }
  };

  const isSubmitting = isCreating || isUpdating;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="year"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tahun Ajaran</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: 2023/2024" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <SelectItem value="Semester">Semester</SelectItem>
                    <SelectItem value="Triwulan">Triwulan</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="periode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Periode</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih periode" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {typeValue === 'Semester' && (
                      <>
                        <SelectItem value="Ganjil">Ganjil</SelectItem>
                        <SelectItem value="Genap">Genap</SelectItem>
                      </>
                    )}
                    {typeValue === 'Triwulan' && (
                      <>
                        <SelectItem value="Cawu 1">Cawu 1</SelectItem>
                        <SelectItem value="Cawu 2">Cawu 2</SelectItem>
                        <SelectItem value="Cawu 3">Cawu 3</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="start_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mulai</FormLabel>
                <DatePicker
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Pilih tanggal mulai"
                />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="end_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Akhir</FormLabel>
                <DatePicker
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Pilih tanggal akhir"
                />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Status Aktif</FormLabel>
                <FormDescription>
                  Jadikan tahun ajaran ini sebagai tahun ajaran yang aktif.
                </FormDescription>
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
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deskripsi</FormLabel>
              <FormControl>
                <Textarea placeholder="Deskripsi singkat (opsional)..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Batal
          </Button>
          <Button type="submit" variant="success" disabled={isSubmitting}>
            {isSubmitting ? 'Menyimpan...' : (initialData ? 'Simpan Perubahan' : 'Tambah Tahun Ajaran')}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default TahunAjaranForm;