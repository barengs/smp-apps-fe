import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { Kegiatan } from './JadwalKegiatanPage';

const formSchema = z.object({
  name: z.string().min(3, { message: 'Nama kegiatan harus memiliki minimal 3 karakter.' }),
  description: z.string().optional(),
  date: z.date({ required_error: 'Tanggal kegiatan harus diisi.' }),
});

type FormValues = z.infer<typeof formSchema>;

interface JadwalKegiatanFormProps {
  initialData?: Kegiatan;
  selectedDate?: Date;
  onSuccess: (data: FormValues) => void;
  onCancel: () => void;
  isInitiallyViewMode?: boolean; // New prop
}

const JadwalKegiatanForm: React.FC<JadwalKegiatanFormProps> = ({ initialData, selectedDate, onSuccess, onCancel, isInitiallyViewMode }) => {
  const [isEditingMode, setIsEditingMode] = useState(!isInitiallyViewMode); // Control disabled state

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      date: initialData?.date || selectedDate || new Date(),
    },
  });

  // Reset form and editing mode when initialData changes (e.g., when opening for a different event)
  React.useEffect(() => {
    form.reset({
      name: initialData?.name || '',
      description: initialData?.description || '',
      date: initialData?.date || selectedDate || new Date(),
    });
    setIsEditingMode(!isInitiallyViewMode);
  }, [initialData, selectedDate, isInitiallyViewMode, form]);

  const onSubmit = (values: FormValues) => {
    onSuccess(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Kegiatan</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: Pengajian Bulanan" {...field} disabled={!isEditingMode} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Tanggal</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                      disabled={!isEditingMode} // Disable date picker
                    >
                      {field.value ? (
                        format(field.value, "PPP", { locale: id })
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
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date < new Date("1900-01-01") || !isEditingMode} // Disable calendar interaction
                    initialFocus
                    locale={id}
                  />
                </PopoverContent>
              </Popover>
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
                <Textarea placeholder="Deskripsi singkat kegiatan..." {...field} disabled={!isEditingMode} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Batal
          </Button>
          {initialData && !isEditingMode && ( // Show Edit button only if initialData exists and not in editing mode
            <Button type="button" onClick={() => setIsEditingMode(true)}>
              Edit
            </Button>
          )}
          <Button type="submit" disabled={!isEditingMode}> {/* Disable submit button if not in editing mode */}
            {initialData ? 'Simpan Perubahan' : 'Tambah Kegiatan'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default JadwalKegiatanForm;