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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { toast } from 'sonner';
import { useCreateStudentMutation, useUpdateStudentMutation, type CreateUpdateStudentRequest } from '@/store/slices/studentApi';
import { useGetProgramsQuery } from '@/store/slices/programApi';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { SerializedError } from '@reduxjs/toolkit';
import { Label } from '@/components/ui/label';

const formSchema = z.object({
  first_name: z.string().min(2, {
    message: 'Nama depan harus minimal 2 karakter.',
  }),
  last_name: z.string().nullable().optional(),
  nis: z.string().min(1, {
    message: 'NIS tidak boleh kosong.',
  }),
  nik: z.string().nullable().optional(),
  period: z.string().min(1, {
    message: 'Periode tidak boleh kosong.',
  }),
  gender: z.enum(['L', 'P'], {
    required_error: 'Jenis kelamin harus dipilih.',
  }),
  status: z.string().min(1, {
    message: 'Status tidak boleh kosong.',
  }),
  program_id: z.number({
    required_error: 'Program harus dipilih.',
  }),
  born_in: z.string().nullable().optional(),
  born_at: z.date().nullable().optional(),
  address: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  photo: z.string().url({ message: 'URL foto tidak valid.' }).nullable().optional(),
});

interface SantriFormProps {
  initialData?: {
    id: number;
    first_name: string;
    last_name: string | null;
    nis: string;
    nik: string | null;
    period: string;
    gender: 'L' | 'P';
    status: string;
    program: { id: number; name: string }; // Nested program object
    born_in?: string | null; // Updated to allow undefined
    born_at?: string | null; // Updated to allow undefined
    address?: string | null; // Updated to allow undefined
    phone?: string | null; // Updated to allow undefined
    photo?: string | null; // Updated to allow undefined
  };
  onSuccess: () => void;
  onCancel: () => void;
}

const SantriForm: React.FC<SantriFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const [createStudent, { isLoading: isCreating }] = useCreateStudentMutation();
  const [updateStudent, { isLoading: isUpdating }] = useUpdateStudentMutation();
  const { data: programsData, isLoading: isLoadingPrograms } = useGetProgramsQuery();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      first_name: initialData.first_name,
      last_name: initialData.last_name,
      nis: initialData.nis,
      nik: initialData.nik,
      period: initialData.period,
      gender: initialData.gender,
      status: initialData.status,
      program_id: initialData.program.id,
      born_in: initialData.born_in,
      born_at: initialData.born_at ? new Date(initialData.born_at) : null,
      address: initialData.address,
      phone: initialData.phone,
      photo: initialData.photo,
    } : {
      first_name: '',
      last_name: null,
      nis: '',
      nik: null,
      period: '',
      gender: 'L', // Default to Male
      status: 'Aktif', // Default status
      program_id: undefined,
      born_in: null,
      born_at: null,
      address: null,
      phone: null,
      photo: null,
    },
  });

  const availablePrograms = programsData || [];
  const studentStatuses = ['Aktif', 'Non-Aktif', 'Lulus', 'Cuti'];

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const payload: CreateUpdateStudentRequest = {
      first_name: values.first_name,
      last_name: values.last_name,
      nis: values.nis,
      nik: values.nik,
      period: values.period,
      gender: values.gender,
      status: values.status,
      program_id: values.program_id,
      born_in: values.born_in,
      born_at: values.born_at ? format(values.born_at, 'yyyy-MM-dd') : null,
      address: values.address,
      phone: values.phone,
      photo: values.photo,
    };

    try {
      if (initialData) {
        await updateStudent({ id: initialData.id, data: payload }).unwrap();
        toast.success(`Data santri "${values.first_name} ${values.last_name || ''}" berhasil diperbarui.`);
      } else {
        await createStudent(payload).unwrap();
        toast.success(`Santri "${values.first_name} ${values.last_name || ''}" berhasil ditambahkan.`);
      }
      onSuccess();
    } catch (err: unknown) {
      let errorMessage = 'Terjadi kesalahan tidak dikenal.';

      if (typeof err === 'object' && err !== null) {
        if ('status' in err) {
          const fetchError = err as FetchBaseQueryError;
          if (typeof fetchError.status === 'number') {
            if (fetchError.data && typeof fetchError.data === 'object' && 'message' in fetchError.data) {
              errorMessage = (fetchError.data as { message: string }).message;
            } else {
              errorMessage = `Error ${fetchError.status}: ${JSON.stringify(fetchError.data || {})}`;
            }
          } else if (typeof fetchError.status === 'string' && 'error' in fetchError) {
            errorMessage = fetchError.error;
          } else {
            errorMessage = `Error: ${JSON.stringify(fetchError)}`;
          }
        } else if ('message' in err && typeof (err as SerializedError).message === 'string') {
          errorMessage = (err as SerializedError).message;
        } else {
          errorMessage = `Terjadi kesalahan: ${JSON.stringify(err)}`;
        }
      } else if (typeof err === 'string') {
        errorMessage = err;
      }

      toast.error(`Gagal menyimpan data santri: ${errorMessage}`);
    }
  };

  const isSubmitting = isCreating || isUpdating;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Depan</FormLabel>
                <FormControl>
                  <Input placeholder="Contoh: Ahmad" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Belakang (Opsional)</FormLabel>
                <FormControl>
                  <Input placeholder="Contoh: Fulan" {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="nis"
            render={({ field }) => (
              <FormItem>
                <FormLabel>NIS</FormLabel>
                <FormControl>
                  <Input placeholder="Contoh: 2023001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="nik"
            render={({ field }) => (
              <FormItem>
                <FormLabel>NIK (Opsional)</FormLabel> {/* Fixed: Added closing tag */}
                <FormControl>
                  <Input placeholder="Contoh: 3273xxxxxxxxxxxxxx" {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Jenis Kelamin</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih jenis kelamin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="L">Laki-Laki</SelectItem>
                    <SelectItem value="P">Perempuan</SelectItem>
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
                    {studentStatuses.map(status => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
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
            name="program_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Program</FormLabel>
                <Select onValueChange={(value) => field.onChange(parseInt(value, 10))} value={field.value ? String(field.value) : ''} disabled={isLoadingPrograms}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih program..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {isLoadingPrograms ? (
                      <div className="p-2">Memuat program...</div>
                    ) : (
                      availablePrograms.map((program) => (
                        <SelectItem key={program.id} value={String(program.id)}>
                          {program.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="period"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Periode</FormLabel>
                <FormControl>
                  <Input placeholder="Contoh: 2023/2024" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="born_in"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tempat Lahir (Opsional)</FormLabel>
                <FormControl>
                  <Input placeholder="Contoh: Bandung" {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="born_at"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Tanggal Lahir (Opsional)</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP", { locale: localeId })
                        ) : (
                          <span>Pilih tanggal</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value || undefined}
                      onSelect={field.onChange}
                      disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                      initialFocus
                      locale={localeId}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Alamat (Opsional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Alamat lengkap santri..." {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telepon (Opsional)</FormLabel> {/* Fixed: Added closing tag */}
                <FormControl>
                  <Input placeholder="Contoh: 081234567890" {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="photo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL Foto (Opsional)</FormLabel> {/* Fixed: Added closing tag */}
                <FormControl>
                  <Input placeholder="https://example.com/foto.jpg" {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Batal
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Menyimpan...' : (initialData ? 'Simpan Perubahan' : 'Tambah Santri')}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default SantriForm;