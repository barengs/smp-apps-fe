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
import { useGetProgramsQuery } from '@/store/slices/programApi';
import type { CreateUpdateStudentRequest } from '@/store/slices/studentApi';

export const studentFormSchema = z.object({
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

type StudentFormValues = z.infer<typeof studentFormSchema>;

interface StudentFormStepProps {
  initialData?: Partial<StudentFormValues>;
  onBack: () => void;
  onSubmit: (data: StudentFormValues) => void;
  isSubmitting: boolean;
}

const StudentFormStep: React.FC<StudentFormStepProps> = ({ initialData, onBack, onSubmit, isSubmitting }) => {
  const { data: programsData, isLoading: isLoadingPrograms } = useGetProgramsQuery();

  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      first_name: initialData?.first_name || '',
      last_name: initialData?.last_name || null,
      nis: initialData?.nis || '',
      nik: initialData?.nik || null,
      period: initialData?.period || '',
      gender: initialData?.gender || 'L',
      status: initialData?.status || 'Aktif',
      program_id: initialData?.program_id,
      born_in: initialData?.born_in || null,
      born_at: initialData?.born_at ? new Date(initialData.born_at) : null,
      address: initialData?.address || null,
      phone: initialData?.phone || null,
      photo: initialData?.photo || null,
    },
  });

  const availablePrograms = programsData || [];
  const studentStatuses = ['Aktif', 'Non-Aktif', 'Lulus', 'Cuti'];

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
                <FormLabel>NIK (Opsional)</FormLabel>
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
                <FormLabel>Telepon (Opsional)</FormLabel>
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
                <FormLabel>URL Foto (Opsional)</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com/foto.jpg" {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>
            Kembali
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Menyimpan...' : 'Tambah Santri'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default StudentFormStep;