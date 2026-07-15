import React, { useEffect, useMemo, useState } from 'react';
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
import { cn, dataURLtoFile } from '@/lib/utils';
import { ChevronDown, Eye, EyeOff, Check } from 'lucide-react';
import { DatePicker } from '@/components/ui/datepicker';
import { format } from 'date-fns';
import ProfilePhotoCard from '@/components/ProfilePhotoCard';
import * as toast from '@/utils/toast';
import { useCreateEmployeeMutation, useUpdateEmployeeMutation, type CreateUpdateEmployeeRequest } from '@/store/slices/employeeApi';
import { useGetRolesQuery } from '@/store/slices/roleApi';
import { useGetInstitusiPendidikanQuery } from '@/store/slices/institusiPendidikanApi';
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
  nip: z.string().optional().or(z.literal('')),
  birth_place: z.string().optional().or(z.literal('')),
  birth_date: z.date().nullable().optional(),
  phone: z.string().min(10, { message: 'Nomor telepon minimal 10 digit.' }).optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  zip_code: z.string().optional().or(z.literal('')),
  role_ids: z.array(z.number()).min(1, { message: 'Setidaknya satu peran harus dipilih.' }),
  educational_institution_ids: z.array(z.number()).optional(),
  gender: z.enum(['Laki-laki', 'Perempuan'], { required_error: 'Jenis kelamin harus dipilih.' }),
  photo: z.string().optional().or(z.literal('')),

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
  { id: 'Data Diri', fields: ['first_name', 'last_name', 'nik', 'nip', 'birth_place', 'birth_date', 'phone', 'code', 'gender', 'photo'] },

  { id: 'Alamat', fields: ['address', 'zip_code'] },
  { id: 'Akun & Kredensial', fields: ['email', 'role_ids', 'educational_institution_ids', 'username', 'password'] },
];

interface StaffFormProps {
  initialData?: {
    id: number;
    staff: {
      id: number;
      first_name: string;
      last_name: string;
      code: string;
      nik: string;
      nip?: string | null;
      birth_place?: string | null;
      birth_date?: string | null;
      phone: string;
      address: string;
      zip_code: string;
      gender?: string | null;
      photo?: string | null;
      educational_institutions?: any[];
    };
    email: string;
    roles: { id?: number; name: string }[];
    name: string;  // username / name in users table
  };
  onSuccess: () => void;
  onCancel: () => void;
}

const StaffForm: React.FC<StaffFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [createEmployee, { isLoading: isCreating }] = useCreateEmployeeMutation();
  const [updateEmployee, { isLoading: isUpdating }] = useUpdateEmployeeMutation();
  const { data: rolesData = [], isLoading: isLoadingRoles } = useGetRolesQuery({});
  const { data: institutionsData = [], isLoading: isLoadingInstitutions } = useGetInstitusiPendidikanQuery({ page: 1, per_page: 100 });
  const [showPassword, setShowPassword] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const availableRoles = useMemo(() => rolesData.map(role => ({ id: role.id, name: role.name })), [rolesData]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: 'onTouched',
    defaultValues: initialData ? {
      first_name: initialData.staff.first_name,
      last_name: initialData.staff.last_name,
      email: initialData.email,
      code: initialData.staff.code,
      nik: initialData.staff.nik || '',
      nip: initialData.staff.nip || '',
      birth_place: initialData.staff.birth_place || '',
      birth_date: initialData.staff.birth_date ? new Date(initialData.staff.birth_date) : null,
      phone: initialData.staff.phone || '',
      address: initialData.staff.address || '',
      zip_code: initialData.staff.zip_code || '',
      // Map DB enum 'L'/'P' to display labels
      gender: (initialData.staff.gender === 'P' || initialData.staff.gender === 'Perempuan')
        ? 'Perempuan'
        : 'Laki-laki',
      role_ids: [],
      educational_institution_ids: initialData.staff.educational_institutions?.map((ei: any) => ei.id) || [],
      username: initialData.name || '',
      password: '',
      password_confirmation: '',
      photo: initialData.staff.photo || '',
    } : {
      first_name: '',
      last_name: '',
      email: '',
      code: '',
      nik: '',
      nip: '',
      birth_place: '',
      birth_date: null,
      phone: '',
      address: '',
      zip_code: '',
      role_ids: [],
      educational_institution_ids: [],
      gender: 'Laki-laki' as const,
      username: '',
      password: '',
      password_confirmation: '',
      photo: '',
    },
  });

  // Handle photo loading preview
  useEffect(() => {
    if (initialData?.staff.photo) {
      const buildPhotoUrl = (photo?: string | null): string | null => {
        if (!photo) return null;
        const src = String(photo).trim();
        if (src.startsWith('data:') || /^https?:\/\//.test(src)) return src;
        if (src.startsWith('/storage/')) return `${window.location.origin}${src}`;
        if (src.startsWith('uploads/')) {
          const base = (import.meta.env.VITE_STORAGE_BASE_URL as string) || `${window.location.origin}/storage/`;
          const safeBase = base.endsWith('/') ? base : `${base}/`;
          return `${safeBase}${src}`;
        }
        const base = (import.meta.env.VITE_STORAGE_BASE_URL as string) || `${window.location.origin}/storage/`;
        const safeBase = base.endsWith('/') ? base : `${base}/`;
        return `${safeBase}uploads/logos/large/${src}`;
      };
      setPhotoPreview(buildPhotoUrl(initialData.staff.photo));
    } else {
      setPhotoPreview(null);
    }
  }, [initialData]);

  const handleCapture = (imageSrc: string) => {
    form.setValue('photo', imageSrc, { shouldValidate: true });
    setPhotoPreview(imageSrc);
  };

  // Set role_ids begitu daftar roles tersedia dan initialData ada.
  useEffect(() => {
    if (!initialData) return;
    if (!availableRoles.length) return;
    const current = form.getValues('role_ids') || [];
    if (current.length > 0) return; // jangan override jika user sudah mengubah
    const ids = initialData.roles
      .map((r) => {
        // Prioritas cocok berdasarkan id jika tersedia, fallback ke name
        const byId = r.id ? availableRoles.find((ar) => ar.id === r.id) : undefined;
        if (byId) return byId.id;
        const byName = availableRoles.find((ar) => ar.name === r.name);
        return byName?.id;
      })
      .filter((id): id is number => typeof id === 'number');
    if (ids.length > 0) {
      form.setValue('role_ids', ids, { shouldValidate: true, shouldDirty: false });
    }
  }, [initialData, availableRoles, form]);

  const onSubmit = async (values: FormValues) => {
    // Konversi role_ids (number[]) menjadi roles (string[])
    const selectedRoleNames = values.role_ids.map(id => availableRoles.find(role => role.id === id)?.name).filter(Boolean) as string[];

    const formData = new FormData();
    formData.append('first_name', values.first_name);
    formData.append('last_name', values.last_name || '');
    formData.append('email', values.email);
    formData.append('code', values.code || '');
    formData.append('username', values.username);
    formData.append('gender', values.gender === 'Perempuan' ? 'P' : 'L');
    if (values.nik) formData.append('nik', values.nik);
    if (values.nip) formData.append('nip', values.nip);
    if (values.phone) formData.append('phone', values.phone);
    if (values.address) formData.append('address', values.address);
    if (values.zip_code) formData.append('zip_code', values.zip_code);
    if (values.birth_place) formData.append('birth_place', values.birth_place);
    if (values.birth_date) formData.append('birth_date', format(values.birth_date, 'yyyy-MM-dd'));

    selectedRoleNames.forEach(roleName => {
      formData.append('roles[]', roleName);
    });

    if (values.educational_institution_ids && values.educational_institution_ids.length > 0) {
      values.educational_institution_ids.forEach(id => {
        formData.append('educational_institution_ids[]', String(id));
      });
    }

    if (values.password) {
      formData.append('password', values.password);
      formData.append('password_confirmation', values.password_confirmation || '');
    }

    if (typeof values.photo === 'string' && values.photo.startsWith('data:')) {
      const ext = values.photo.includes('image/jpeg') || values.photo.includes('image/jpg') ? 'jpg' : 'png';
      const file = dataURLtoFile(values.photo, `photo.${ext}`);
      formData.append('photo', file);
    }

    try {
      if (initialData) {
        // Penting: gunakan staff.id untuk update
        await updateEmployee({ id: initialData.staff.id, data: formData as any }).unwrap();
        toast.showSuccess(`Data staf "${values.first_name}" berhasil diperbarui.`);
      } else {
        await createEmployee(formData as any).unwrap();
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

  const handleInstitutionToggle = (instId: number, currentFieldValues: number[] | undefined, onChange: (value: number[]) => void) => {
    const currentValues = new Set(currentFieldValues || []);
    if (currentValues.has(instId)) {
      currentValues.delete(instId);
    } else {
      currentValues.add(instId);
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="md:col-span-1 flex flex-col items-center">
                <FormField
                  control={form.control}
                  name="photo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-center block mb-2">Foto Profil</FormLabel>
                      <FormControl>
                        <div className="flex flex-col items-center gap-4">
                          <ProfilePhotoCard photoUrl={photoPreview} onCapture={handleCapture} />
                          <div className="text-sm text-muted-foreground">atau</div>
                          <Input
                            type="file"
                            className="max-w-xs"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  const result = reader.result as string;
                                  field.onChange(result);
                                  setPhotoPreview(result);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="md:col-span-3 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="first_name" render={({ field }) => (<FormItem><FormLabel>Nama Depan</FormLabel><FormControl><Input placeholder="Contoh: Ahmad" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="last_name" render={({ field }) => (<FormItem><FormLabel>Nama Belakang (Opsional)</FormLabel><FormControl><Input placeholder="Contoh: Fulan" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>)} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="nik" render={({ field }) => (<FormItem><FormLabel>NIK (Opsional)</FormLabel><FormControl><Input placeholder="Contoh: 3273xxxxxxxxxxxx" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabel>Telepon (Opsional)</FormLabel><FormControl><Input placeholder="Contoh: 081234567890" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>)} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="code" render={({ field }) => (<FormItem><FormLabel>Kode Staf</FormLabel><FormControl><Input placeholder="Contoh: STF001" {...field} disabled={true} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="nip" render={({ field }) => (<FormItem><FormLabel>NIP (Opsional)</FormLabel><FormControl><Input placeholder="Contoh: 1990xxxxxxxxxxxx" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>)} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="birth_place" render={({ field }) => (<FormItem><FormLabel>Tempat Lahir (Opsional)</FormLabel><FormControl><Input placeholder="Contoh: Pamekasan" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="birth_date" render={({ field }) => (
                    <FormItem className="flex flex-col justify-end">
                      <FormLabel className="mb-2">Tanggal Lahir (Opsional)</FormLabel>
                      <FormControl>
                        <DatePicker value={field.value || undefined} onValueChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jenis Kelamin</FormLabel>
                      <div className="flex gap-4 mt-2">
                        {['Laki-laki', 'Perempuan'].map((opt) => (
                          <label key={opt} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              value={opt}
                              checked={field.value === opt}
                              onChange={() => field.onChange(opt)}
                              className="accent-blue-500"
                            />
                            <span className="text-sm">{opt}</span>
                          </label>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
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
              <FormField
                control={form.control}
                name="educational_institution_ids"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Institusi Pendidikan (Opsional)</FormLabel>
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
                            disabled={isLoadingInstitutions}
                          >
                            {isLoadingInstitutions ? (
                              "Memuat institusi..."
                            ) : field.value && field.value.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {field.value.map((instId) => {
                                  const inst = institutionsData.find(r => r.id === instId);
                                  return inst ? (
                                    <Badge key={inst.id} variant="secondary">
                                      {inst.institution_name}
                                    </Badge>
                                  ) : null;
                                })}
                              </div>
                            ) : (
                              "Pilih institusi..."
                            )}
                            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                        <Command>
                          <CommandInput placeholder="Cari institusi..." />
                          <CommandEmpty>Tidak ada institusi ditemukan.</CommandEmpty>
                          <CommandGroup>
                            {institutionsData.map((inst) => (
                              <CommandItem
                                key={inst.id}
                                onSelect={() => handleInstitutionToggle(inst.id, field.value, field.onChange)}
                              >
                                <Checkbox
                                  checked={field.value?.includes(inst.id)}
                                  onCheckedChange={(checked) => handleInstitutionToggle(inst.id, field.value, field.onChange)}
                                  className="mr-2"
                                />
                                {inst.institution_name}
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