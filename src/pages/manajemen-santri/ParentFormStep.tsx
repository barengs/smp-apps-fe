import React, { useEffect, useState } from 'react';
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
import { showSuccess, showError, showWarning } from '@/utils/toast'; // Updated import
import { useLazyGetParentByNikQuery } from '@/store/slices/parentApi';
import { useGetProvincesQuery } from '@/store/slices/provinceApi';
import { useGetCitiesQuery } from '@/store/slices/cityApi';
import { useGetDistrictsQuery } from '@/store/slices/districtApi';
import { useGetVillagesQuery } from '@/store/slices/villageApi';
import SelectedPhotoCard from '@/components/SelectedPhotoCard';
import { UploadCloud } from 'lucide-react'; // Import UploadCloud icon

export const parentFormSchema = z.object({
  first_name: z.string().min(2, {
    message: 'Nama depan harus minimal 2 karakter.',
  }),
  last_name: z.string().nullable().optional(),
  email: z.string().email({
    message: 'Email tidak valid.',
  }),
  kk: z.string().min(1, {
    message: 'Nomor Kartu Keluarga tidak boleh kosong.',
  }),
  nik: z.string().min(16, {
    message: 'NIK harus 16 karakter.',
  }).max(16, {
    message: 'NIK harus 16 karakter.',
  }),
  gender: z.enum(['L', 'P'], {
    required_error: 'Jenis kelamin harus dipilih.',
  }),
  parent_as: z.string().min(1, {
    message: 'Status wali harus dipilih.',
  }),
  phone: z.string().nullable().optional(),
  card_address: z.string().nullable().optional(),
  domicile_address: z.string().nullable().optional(),
  province_code: z.string().nullable().optional(),
  city_code: z.string().nullable().optional(),
  district_code: z.string().nullable().optional(),
  village_code: z.string().nullable().optional(),
  occupation: z.string().nullable().optional(),
  education: z.string().nullable().optional(),
  photo: z.instanceof(File).nullable().optional().or(z.string().url().nullable().optional()),
});

type ParentFormValues = z.infer<typeof parentFormSchema>;

interface ParentFormStepProps {
  initialData?: Partial<ParentFormValues>;
  onNext: (data: ParentFormValues) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const ParentFormStep: React.FC<ParentFormStepProps> = ({ initialData, onNext, onCancel, isSubmitting }) => {
  const form = useForm<ParentFormValues>({
    resolver: zodResolver(parentFormSchema),
    defaultValues: {
      first_name: initialData?.first_name || '',
      last_name: initialData?.last_name || null,
      email: initialData?.email || '',
      kk: initialData?.kk || '',
      nik: initialData?.nik || '',
      gender: initialData?.gender || 'L',
      parent_as: initialData?.parent_as || '',
      phone: initialData?.phone || null,
      card_address: initialData?.card_address || null,
      domicile_address: initialData?.domicile_address || null,
      province_code: initialData?.province_code || null,
      city_code: initialData?.city_code || null,
      district_code: initialData?.district_code || null,
      village_code: initialData?.village_code || null,
      occupation: initialData?.occupation || null,
      education: initialData?.education || null,
      photo: initialData?.photo || null,
    },
  });

  const [triggerGetParentByNik, { data: existingParentData, isLoading: isLoadingExistingParent, isFetching: isFetchingExistingParent }] = useLazyGetParentByNikQuery();
  const { data: provincesData, isLoading: isLoadingProvinces } = useGetProvincesQuery();
  const { data: citiesData, isLoading: isLoadingCities } = useGetCitiesQuery(undefined, { skip: !form.watch('province_code') });
  const { data: districtsData, isLoading: isLoadingDistricts } = useGetDistrictsQuery(undefined, { skip: !form.watch('city_code') });
  const { data: villagesData, isLoading: isLoadingVillages } = useGetVillagesQuery(undefined, { skip: !form.watch('district_code') });

  const [photoPreviewFile, setPhotoPreviewFile] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (initialData?.photo instanceof File) {
      setPhotoPreviewFile(initialData.photo);
      setPhotoPreviewUrl(null);
    } else if (typeof initialData?.photo === 'string') {
      setPhotoPreviewUrl(initialData.photo);
      setPhotoPreviewFile(null);
    } else {
      setPhotoPreviewFile(null);
      setPhotoPreviewUrl(null);
    }
  }, [initialData?.photo]);

  const nikValue = form.watch('nik');

  useEffect(() => {
    const fetchParent = async () => {
      if (nikValue && nikValue.length === 16) {
        try {
          const response = await triggerGetParentByNik(nikValue).unwrap();
          if (response.data) {
            showWarning('Data wali santri ditemukan berdasarkan NIK.'); // Updated call
            form.reset({
              ...form.getValues(), // Keep current form values for fields not in API response
              first_name: response.data.first_name || '',
              last_name: response.data.last_name || null,
              email: response.data.email || '',
              kk: response.data.kk || '',
              nik: response.data.nik || '',
              gender: response.data.gender || 'L',
              parent_as: response.data.parent_as || '',
              phone: response.data.phone || null,
              card_address: response.data.card_address || null,
              domicile_address: response.data.domicile_address || null,
              // Note: API response for region codes might need mapping to province/city/district/village codes
              // For simplicity, these are not auto-filled from API for now.
              occupation: response.data.occupation || null,
              education: response.data.education || null,
              photo: response.data.photo || null,
            });
            if (response.data.photo) {
              setPhotoPreviewUrl(response.data.photo);
              setPhotoPreviewFile(null);
            }
          } else {
            showWarning('Tidak ada data wali santri ditemukan dengan NIK ini.'); // Updated call
          }
        } catch (err) {
          // Handle 404 or other errors if parent not found
          showWarning('Tidak ada data wali santri ditemukan dengan NIK ini.'); // Updated call
          // Optionally clear fields if NIK search fails
          // form.reset({ ...form.getValues(), first_name: '', last_name: '', email: '' });
        }
      }
    };

    const handler = setTimeout(() => {
      fetchParent();
    }, 500); // Debounce NIK input

    return () => {
      clearTimeout(handler);
    };
  }, [nikValue, triggerGetParentByNik, form]);

  const onSubmit = (values: ParentFormValues) => {
    onNext(values);
  };

  const parentAsOptions = ['Ayah', 'Ibu', 'Wali Lain'];
  const educationLevels = ['SD', 'SMP', 'SMA', 'Diploma', 'Sarjana', 'Magister', 'Doktor'];
  const occupations = ['PNS', 'Swasta', 'Wiraswasta', 'Petani', 'Nelayan', 'Lainnya'];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="nik"
            render={({ field }) => (
              <FormItem>
                <FormLabel>NIK</FormLabel>
                <FormControl>
                  <Input placeholder="Contoh: 3273xxxxxxxxxxxxxx" {...field} disabled={isLoadingExistingParent || isFetchingExistingParent} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="kk"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nomor Kartu Keluarga (KK)</FormLabel>
                <FormControl>
                  <Input placeholder="Contoh: 3273xxxxxxxxxxxxxx" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Depan</FormLabel>
                <FormControl>
                  <Input placeholder="Contoh: Budi" {...field} />
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
                  <Input placeholder="Contoh: Santoso" {...field} value={field.value || ''} />
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
                <Input placeholder="contoh@email.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Jenis Kelamin</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ''}>
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
            name="parent_as"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status Wali</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ''}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih status wali" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {parentAsOptions.map(option => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="card_address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Alamat KTP (Opsional)</FormLabel>
                <FormControl>
                  <Textarea placeholder="Alamat sesuai KTP..." {...field} value={field.value || ''} className="min-h-[60px]" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="domicile_address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Alamat Domisili (Opsional)</FormLabel>
                <FormControl>
                  <Textarea placeholder="Alamat domisili saat ini..." {...field} value={field.value || ''} className="min-h-[60px]" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="occupation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pekerjaan (Opsional)</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ''}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih pekerjaan" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {occupations.map(option => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="education"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pendidikan Terakhir (Opsional)</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ''}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih pendidikan" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {educationLevels.map(option => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="photo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Foto Wali (Opsional)</FormLabel>
              <div className="flex gap-4 items-start">
                <SelectedPhotoCard photoFile={photoPreviewFile} photoUrl={photoPreviewUrl} name="Foto Wali" />
                <div className="flex-1">
                  <div
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-md cursor-pointer bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700"
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      e.currentTarget.classList.add('border-primary', 'bg-gray-100', 'dark:bg-gray-700');
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      e.currentTarget.classList.remove('border-primary', 'bg-gray-100', 'dark:bg-gray-700');
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      e.currentTarget.classList.remove('border-primary', 'bg-gray-100', 'dark:bg-gray-700');
                      const files = e.dataTransfer.files;
                      if (files && files.length > 0) {
                        const file = files[0];
                        field.onChange(file);
                        setPhotoPreviewFile(file);
                        setPhotoPreviewUrl(null);
                      }
                    }}
                    onClick={() => document.getElementById('parent-photo-upload')?.click()}
                  >
                    <UploadCloud className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground text-center">
                      Seret & lepas file di sini atau <span className="font-medium text-primary">Pilih file</span>
                    </p>
                    {photoPreviewFile && (
                      <p className="text-xs text-muted-foreground mt-1">{photoPreviewFile.name}</p>
                    )}
                  </div>
                  <FormControl>
                    <Input
                      id="parent-photo-upload"
                      type="file"
                      accept="image/*"
                      className="hidden" // Hide the actual input
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          const file = e.target.files[0];
                          field.onChange(file);
                          setPhotoPreviewFile(file);
                          setPhotoPreviewUrl(null);
                        } else {
                          field.onChange(null);
                          setPhotoPreviewFile(null);
                          setPhotoPreviewUrl(null);
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </div>
              </div>
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Batal
          </Button>
          <Button type="submit" disabled={isSubmitting || isLoadingExistingParent || isFetchingExistingParent}>
            {isSubmitting ? 'Melanjutkan...' : 'Lanjut'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ParentFormStep;