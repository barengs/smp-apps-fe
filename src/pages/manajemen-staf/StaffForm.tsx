import React, { useMemo, useState } from 'react';
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
  FormDescription,
} from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ChevronDown, Eye, EyeOff, Check } from 'lucide-react';
import * as toast from '@/utils/toast';
import { useCreateEmployeeMutation, useUpdateEmployeeMutation, type CreateUpdateEmployeeRequest } from '@/store/slices/employeeApi';
import { useGetRolesQuery } from '@/store/slices/roleApi';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { SerializedError } from '@reduxjs/toolkit';
import { Progress } from '@/components/ui/progress';
import ActionButton from '@/components/ActionButton';

const formSchema = z.object({
  first_name: z.string().min(2, { message: 'Nama depan harus minimal 2 karakter.' }),
  last_name: z.string().nullable().optional(),
  email: z.string().email({ message: 'Email tidak valid.' }),
  code: z.string().optional(),
  nik: z.string().min(16, { message: 'NIK harus 16 digit.' }).max(16, { message: 'NIK harus 16 digit.' }).optional().or(z.literal('')),
  phone: z.string().min(10, { message: 'Nomor telepon minimal 10 digit.' }).optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  zip_code: z.string().optional().or(z.literal('')),
  role_ids: z.array(z.number()).min(1, { message: 'Setidaknya satu peran harus dipilih.' }),
  username: z.string().min(3, { message: 'Username harus minimal 3 karakter.' }),
  password: z.string()
    .min(6, { message: 'Password harus minimal 6 karakter.' })
    .regex(/(?=.*[A-Z])/, { message: 'Password harus mengandung setidaknya 1 huruf kapital.' })
    .regex(/(?=.*\d)/, { message: 'Password harus mengandung setidaknya 1 angka.' })
    .optional()
    .or(z.literal('')),
  password_confirmation: z.string().optional().or(z.literal('')),
}).refine(data => {
  if (data.password && data.password !== data.password_confirmation) {
    return false;
  }
  return true;
}, {
  message: 'Konfirmasi password tidak cocok',
  path: ['password_confirmation'],
});

type FormValues = z.infer<typeof formSchema>;

const steps = [
  { id: 'Data Diri', fields: ['first_name', 'last_name', 'nik', 'phone', 'code'] },
  { id: 'Alamat', fields: ['address', 'zip_code'] },
  { id: 'Akun & Kredensial', fields: ['email', 'role_ids', 'username', 'password'] },
];

interface StaffFormProps {
  initialData?: {
    id: number;
    staff: { // Changed from 'employee' to 'staff'
      first_name: string;
      last_name: string;
      code: string;
      nik: string;
      phone: string;
      address: string;
      zip_code: string;
    };
    email: string;
    roles: { name: string }[];
    username: string;
  };
  onSuccess: () => void;
  onCancel: () => void;
}

const StaffForm: React.FC<StaffFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [createEmployee, { isLoading: isCreating }] = useCreateEmployeeMutation();
  const [updateEmployee, { isLoading: isUpdating }] = useUpdateEmployeeMutation();
  const { data: rolesData, isLoading: isLoadingRoles } = useGetRolesQuery();
  const [showPassword, setShowPassword] = useState(false);

  const availableRoles = useMemo(() => {
    if (!rolesData?.data) return [];
    return rolesData.data.map(role => ({ id: role.id, name: role.name }));
  }, [rolesData]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: 'onTouched',
    defaultValues: initialData ? {
      first_name: initialData.staff.first_name, // Changed from 'employee' to 'staff'
      last_name: initialData.staff.last_name, // Changed from 'employee' to 'staff'
      email: initialData.email,
      code: initialData.staff.code, // Changed from 'employee' to 'staff'
      nik: initialData.staff.nik || '', // Changed from 'employee' to 'staff'
      phone: initialData.staff.phone || '', // Changed from 'employee' to 'staff'
      address: initialData.staff.address || '', // Changed from 'employee' to 'staff'
      zip_code: initialData.staff.zip_code || '', // Changed from 'employee' to 'staff'
      role_ids: initialData.roles.map(initialRole => availableRoles.find(ar => ar.name === initialRole.name)?.id).filter(Boolean) as number[] || [],
      username: initialData.username || '',
      password: '',
      password_confirmation: '',
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
      username: '',
      password: '',
      password_confirmation: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    // Konversi role_ids (number[]) menjadi roles (string[])
    const selectedRoleNames = values.role_ids.map(id => availableRoles.find(role => role.id === id)?.name).filter(Boolean) as string[];

    const payload: CreateUpdateEmployeeRequest = {
      first_name: values.first_name,
      last_name: values.last_name || '', // Ensure last_name is always a string
      email: values.email,
      code: values.code, // This will be an empty string if not provided, or existing code if editing
      roles: selectedRoleNames, // Menggunakan nama peran
      username: values.username,
      nik: values.nik || undefined,
      phone: values.phone || undefined,
      address: values.address || undefined,
      zip_code: values.zip_code || undefined,
      password: values.password || undefined,
      password_confirmation: values.password_confirmation || undefined,
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

  const handleNext = async () => {
    const fields = steps[currentStep].fields as (keyof FormValues)[];
    const isValid = await form.trigger(fields);
    if (isValid) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
  };

  const isSubmitting = isCreating || isUpdating;

  // Helper function to toggle role selection
  const handleRoleToggle = (roleId: number, currentFieldValues: number[], onChange: (value: number[]) => void) => {
    const currentValues = new Set(currentFieldValues);
    if (currentValues.has(roleId)) {
      currentValues.delete(roleId);
    } else {
      currentValues.add(roleId);
    }
    onChange(Array.from(currentValues));
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Stepper UI */}
        <div className="space-y-2">
          <div className="flex justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex-1 text-center">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center mx-auto font-semibold text-sm",
                    currentStep > index ? "bg-green-500 text-white" :
                    currentStep === index ? "bg-blue-500 text-white" :
                    "bg-gray-200 text-gray-600"
                  )}
                >
                  {currentStep > index ? <Check size={18} /> : index + 1}
                </div>
                <p className={cn(
                  "text-xs mt-1",
                  currentStep >= index ? "font-semibold text-foreground" : "text-muted-foreground"
                )}>
                  {step.id}
                </p>
              </div>
            ))}
          </div>
          <Progress value={((currentStep) / (steps.length - 1)) * 100} className="w-full h-2" />
        </div>

        {/* Form Fields */}
        <div className="min-h-[250px]">
          {currentStep === 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="first_name" render={({ field }) => (<FormItem><FormLabel>Nama Depan</FormLabel><FormControl><Input placeholder="Contoh: Ahmad" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="last_name" render={({ field }) => (<FormItem><FormLabel>Nama Belakang (Opsional)</FormLabel><FormControl><Input placeholder="Contoh: Fulan" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>)} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="nik" render={({ field }) => (<FormItem><FormLabel>NIK (Opsional)</FormLabel><FormControl><Input placeholder="Contoh: 3273xxxxxxxxxxxx" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabel>Telepon (Opsional)</FormLabel><FormControl><Input placeholder="Contoh: 081234567890" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>)} />
              </div>
              <FormField control={form.control} name="code" render={({ field }) => (<FormItem><FormLabel>Kode Staf</FormLabel><FormControl><Input placeholder="Contoh: STF001" {...field} disabled={true} /></FormControl><FormMessage /></FormItem>)} />
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-4">
              <FormField control={form.control} name="address" render={({ field }) => (<FormItem><FormLabel>Alamat (Opsional)</FormLabel><FormControl><Textarea placeholder="Alamat lengkap staf..." {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="zip_code" render={({ field }) => (<FormItem><FormLabel>Kode Pos (Opsional)</FormLabel><FormControl><Input placeholder="Contoh: 40123" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>)} />
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="contoh@email.com" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="username" render={({ field }) => (<FormItem><FormLabel>Username</FormLabel><FormControl><Input placeholder="Contoh: ahmad.fulan" {...field} /></FormControl><FormMessage /></FormItem>)} />
              </div>
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
                            {isLoadingRoles ? (
                              "Memuat peran..."
                            ) : field.value && field.value.length > 0 ? (
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
                            ) : (
                              "Pilih peran..."
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
                                onSelect={() => handleRoleToggle(role.id, field.value, field.onChange)}
                              >
                                <Checkbox
                                  checked={field.value?.includes(role.id)}
                                  onCheckedChange={(checked) => handleRoleToggle(role.id, field.value, field.onChange)}
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
              <FormField control={form.control} name="password" render={({ field }) => { const passwordValue = form.watch('password') as string; const hasMinLength = passwordValue.length >= 6; const hasUppercase = /[A-Z]/.test(passwordValue); const hasNumber = /\d/.test(passwordValue); const isPasswordValid = hasMinLength && hasUppercase && hasNumber; return (<FormItem><FormLabel>Password (Opsional)</FormLabel><FormControl><div className="relative"><Input type={showPassword ? "text" : "password"} placeholder="********" {...field} value={field.value as string || ''} className="pr-10" /><Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" onClick={() => setShowPassword(!showPassword)}>{showPassword ? (<EyeOff className="h-4 w-4 text-muted-foreground" />) : (<Eye className="h-4 w-4 text-muted-foreground" />)}</Button></div></FormControl><FormDescription className="text-xs mt-1">Min. 6 karakter, 1 huruf kapital, 1 angka. {passwordValue && (<span className={cn("ml-1", isPasswordValid ? "text-green-500" : "text-red-500")}>({hasMinLength ? '✓' : '✗'} 6+, {hasUppercase ? '✓' : '✗'} A-Z, {hasNumber ? '✓' : '✗'} 0-9)</span>)}</FormDescription><FormMessage /></FormItem>); }} />
              <FormField control={form.control} name="password_confirmation" render={({ field }) => (<FormItem><FormLabel>Konfirmasi Password (Opsional)</FormLabel><FormControl><div className="relative"><Input type={showPassword ? "text" : "password"} placeholder="********" {...field} value={field.value as string || ''} className="pr-10" /><Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" onClick={() => setShowPassword(!showPassword)}>{showPassword ? (<EyeOff className="h-4 w-4 text-muted-foreground" />) : (<Eye className="h-4 w-4 text-muted-foreground" />)}</Button></div></FormControl><FormMessage /></FormItem>)} />
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4">
          <div>
            <ActionButton type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Batal
            </ActionButton>
          </div>
          <div className="flex space-x-2">
            {currentStep > 0 && (
              <ActionButton type="button" variant="outline" onClick={handlePrevious} disabled={isSubmitting}>
                Kembali
              </ActionButton>
            )}
            {currentStep < steps.length - 1 && (
              <ActionButton type="button" variant="primary" onClick={handleNext}>
                Lanjut
              </ActionButton>
            )}
            {currentStep === steps.length - 1 && (
              <ActionButton type="submit" variant="success" isLoading={isSubmitting}>
                {initialData ? 'Simpan Perubahan' : 'Tambah Staf'}
              </ActionButton>
            )}
          </div>
        </div>
      </form>
    </Form>
  );
};

export default StaffForm;