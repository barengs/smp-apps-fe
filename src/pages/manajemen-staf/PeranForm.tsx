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
import { toast } from 'sonner';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';
import { dummyHakAksesData } from './HakAksesTable'; // Import dummy data for access rights
import { useCreateRoleMutation, useUpdateRoleMutation } from '@/store/apiSlice'; // Import RTK Query mutations
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { SerializedError } from '@reduxjs/toolkit';

const formSchema = z.object({
  name: z.string().min(2, { // Changed from roleName to name
    message: 'Nama Peran harus minimal 2 karakter.',
  }),
  description: z.string().optional(),
  accessRights: z.array(z.string()).optional(),
});

interface PeranFormProps {
  initialData?: {
    id: number;
    roleName: string; // Still roleName here for mapping from PeranTable
    description: string;
    usersCount: number;
    accessRights: string[];
  };
  onSuccess: () => void;
  onCancel: () => void;
}

const PeranForm: React.FC<PeranFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const [createRole, { isLoading: isCreating }] = useCreateRoleMutation();
  const [updateRole, { isLoading: isUpdating }] = useUpdateRoleMutation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      name: initialData.roleName, // Map initialData.roleName to form's name
      description: initialData.description,
      accessRights: initialData.accessRights || [],
    } : {
      name: '', // Changed from roleName to name
      description: '',
      accessRights: [],
    },
  });

  const availableAccessRights = dummyHakAksesData.map(ha => ({
    value: ha.permission,
    label: ha.permission,
  }));

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (initialData) {
        await updateRole({ id: initialData.id, data: { name: values.name } }).unwrap();
        toast.success(`Peran "${values.name}" berhasil diperbarui.`);
      } else {
        await createRole({ name: values.name }).unwrap();
        toast.success(`Peran "${values.name}" berhasil ditambahkan.`);
      }
      onSuccess();
    } catch (err: unknown) { // Menggunakan 'unknown' untuk penanganan tipe yang lebih aman
      let errorMessage = 'Terjadi kesalahan tidak dikenal.';

      if (typeof err === 'object' && err !== null) {
        if ('status' in err) {
          const fetchError = err as FetchBaseQueryError;
          if (typeof fetchError.status === 'number') {
            // HTTP error (e.g., 400, 500)
            if (fetchError.data && typeof fetchError.data === 'object' && 'message' in fetchError.data) {
              errorMessage = (fetchError.data as { message: string }).message;
            } else {
              errorMessage = `Error ${fetchError.status}: ${JSON.stringify(fetchError.data || {})}`;
            }
          } else if (typeof fetchError.status === 'string' && 'error' in fetchError) {
            // RTK Query specific errors like 'FETCH_ERROR', 'PARSING_ERROR', 'TIMEOUT_ERROR'
            errorMessage = fetchError.error;
          } else {
            // Fallback for other FetchBaseQueryError types if any, or unexpected structure
            errorMessage = `Error: ${JSON.stringify(fetchError)}`;
          }
        } else if ('message' in err && typeof (err as SerializedError).message === 'string') {
          // SerializedError (internal Redux Toolkit Query error)
          errorMessage = (err as SerializedError).message;
        } else {
          // Fallback for other unknown object errors
          errorMessage = `Terjadi kesalahan: ${JSON.stringify(err)}`;
        }
      } else if (typeof err === 'string') {
        errorMessage = err;
      }

      toast.error(`Gagal menyimpan peran: ${errorMessage}`);
    }
  };

  const isSubmitting = isCreating || isUpdating;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name" // Changed from roleName to name
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Peran</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: Guru" {...field} />
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
                <Textarea placeholder="Deskripsi singkat peran ini..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="accessRights"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Hak Akses</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "w-full justify-between",
                        !field.value?.length && "text-muted-foreground"
                      )}
                    >
                      {field.value && field.value.length > 0
                        ? (
                            <div className="flex flex-wrap gap-1">
                              {field.value.map((item) => (
                                <Badge key={item} variant="secondary">
                                  {item}
                                </Badge>
                              ))}
                            </div>
                          )
                        : "Pilih hak akses..."}
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <Command>
                    <CommandInput placeholder="Cari hak akses..." />
                    <CommandEmpty>Tidak ada hak akses ditemukan.</CommandEmpty>
                    <CommandGroup>
                      {availableAccessRights.map((option) => (
                        <CommandItem
                          key={option.value}
                          onSelect={() => {
                            const currentValues = new Set(field.value);
                            if (currentValues.has(option.value)) {
                              currentValues.delete(option.value);
                            } else {
                              currentValues.add(option.value);
                            }
                            field.onChange(Array.from(currentValues));
                          }}
                        >
                          <Checkbox
                            checked={field.value?.includes(option.value)}
                            onCheckedChange={(checked) => {
                              const currentValues = new Set(field.value);
                              if (checked) {
                                currentValues.add(option.value);
                              } else {
                                currentValues.delete(option.value);
                              }
                              field.onChange(Array.from(currentValues));
                            }}
                            className="mr-2"
                          />
                          {option.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Batal
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Menyimpan...' : (initialData ? 'Simpan Perubahan' : 'Tambah Peran')}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PeranForm;