import React, { useMemo } from 'react';
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
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';
import * as toast from '@/utils/toast';
import { useCreateEmployeeMutation, useUpdateEmployeeMutation, type CreateUpdateEmployeeRequest } from '@/store/slices/employeeApi';
import { useGetRolesQuery } from '@/store/slices/roleApi';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { SerializedError } from '@reduxjs/toolkit';

const formSchema = z.object({
  first_name: z.string().min(2, { message: 'Nama depan harus minimal 2 karakter.' }),
  last_name: z.string().nullable().optional(),
  email: z.string().email({ message: 'Email tidak valid.' }),
  code: z.string().min(1, { message: 'Kode staf tidak boleh kosong.' }),
  nik: z.string().min(16).max(16, { message: 'NIK harus 16 digit.' }).optional().or(z.literal('')),
  phone: z.string().min(10, { message: 'Nomor telepon minimal 10 digit.' }).optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  zip_code: z.string().optional().or(z.literal('')),
  role_ids: z.array(z.number()).min(1, { message: 'Setidaknya satu peran harus dipilih.' }),
});

interface StaffFormProps {
  initialData?: {
    id: number;
    employee: {
      first_name: string;
      last_name: string;
      code: string;
      nik: string;
      phone: string;
      address: string;
      zip_code: string;
    };
    email: string;
    roles: { id: number; name: string; guard_name: string }[];
  };
  onSuccess: () => void;
  onCancel: () => void;
}

const StaffForm: React.FC<StaffFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const [createEmployee, { isLoading: isCreating }] = useCreateEmployeeMutation();
  const [updateEmployee, { isLoading: isUpdating }] = useUpdateEmployeeMutation();
  const { data: rolesData, isLoading: isLoadingRoles } = useGetRolesQuery();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      first_name: initialData.employee.first_name,
      last_name: initialData.employee.last_name,
      email: initialData.email,
      code: initialData.employee.code,
      nik: initialData.employee.nik || '',
      phone: initialData.employee.phone || '',
      address: initialData.employee.address || '',
      zip_code: initialData.employee.zip_code || '',
      role_ids: initialData.roles.map(role => role.id),
    } : {
      first_name: '',
      last_name: '',
      email: '',
      code: '',
      nik: '',
      phone: '',
      address: '',
      zip_code: '',
      role_ids: [],
    },
  });

  const availableRoles = useMemo(() => {
    if (!rolesData?.data) return [];
    return rolesData.data.map(role => ({
      id: role.id,
      name: role.name,
    }));
  }, [rolesData]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const payload: CreateUpdateEmployeeRequest = {
      first_name: values.first_name,
      last_name: values.last_name,
      email: values.email,
      code: values.code,
      nik: values.nik || undefined,
      phone: values.phone || undefined,
      address: values.address || undefined,
      zip_code: values.zip_code || undefined,
      role_ids: values.role_ids,
    };

    try {
      if (initialData) {
        await updateEmployee({ id: initialData.id, data: payload }).unwrap();
        toast.showSuccess(`Data staf "${values.first_name}" berhasil diperbarui.`);
      } else {
        await createEmployee(payload).unwrap();
        toast.showSuccess(`Staf "${values.first_name}" berhasil ditambahkan.`);
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
      toast.showError(`Gagal menyimpan data staf: ${errorMessage}`);
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
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="contoh@email.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kode Staf</FormLabel>
                <FormControl>
                  <Input placeholder="Contoh: STF001" {...field} />
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
                  <Input placeholder="Contoh: 3273xxxxxxxxxxxx" {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
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
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Alamat (Opsional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Alamat lengkap staf..." {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="zip_code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kode Pos (Opsional)</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: 40123" {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role_ids"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Peran</FormLabel>
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
                      disabled={isLoadingRoles}
                    >
                      {isLoadingRoles ? "Memuat peran..." : (
                        field.value && field.value.length > 0
                          ? (
                              <div className="flex flex-wrap gap-1">
                                {field.value.map((roleId) => {
                                  const role = availableRoles.find(r => r.id === roleId);
                                  return role ? (
                                    <Badge key={role.id} variant="secondary">
                                      {role.name}
                                    </Badge>
                                  ) : null;
                                })}
                              </div>
                            )
                          : "Pilih peran..."
                      )}
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <Command>
                    <CommandInput placeholder="Cari peran..." />
                    <CommandEmpty>Tidak ada peran ditemukan.</CommandEmpty>
                    <CommandGroup>
                      {availableRoles.map((role) => (
                        <CommandItem
                          key={role.id}
                          onSelect={() => {
                            const currentValues = new Set(field.value);
                            if (currentValues.has(role.id)) {
                              currentValues.delete(role.id);
                            } else {
                              currentValues.add(role.id);
                            }
                            field.onChange(Array.from(currentValues));
                          }}
                        >
                          <Checkbox
                            checked={field.value?.includes(role.id)}
                            onCheckedChange={(checked) => {
                              const currentValues = new Set(field.value);
                              if (checked) {
                                currentValues.add(role.id);
                              } else {
                                currentValues.delete(role.id);
                              }
                              field.onChange(Array.from(currentValues));
                            }}
                            className="mr-2"
                          />
                          {role.name}
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
            {isSubmitting ? 'Menyimpan...' : (initialData ? 'Simpan Perubahan' : 'Tambah Staf')}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default StaffForm;