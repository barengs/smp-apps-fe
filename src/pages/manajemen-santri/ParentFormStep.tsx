import React, { useEffect, useState, useCallback } from 'react';
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
import SelectedPhotoCard from '@/components/SelectedPhotoCard';
import { useLazyGetParentByNikQuery } from '@/store/slices/parentApi';
import { toast } from 'sonner';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

export const parentFormSchema = z.object({
  first_name: z.string().min(2, {
    message: 'Nama depan harus minimal 2 karakter.',
  }),
  last_name: z.string().nullable().optional(),
  email: z.string().email({
    message: 'Email tidak valid.',
  }),
  kk: z.string()
    .regex(/^\d+$/, { message: 'Nomor KK hanya boleh angka.' })
    .length(16, { message: 'Nomor KK harus 16 digit.' }),
  nik: z.string()
    .regex(/^\d+$/, { message: 'NIK hanya boleh angka.' })
    .length(16, { message: 'NIK harus 16 digit.' }),
  gender: z.enum(['L', 'P'], {
    required_error: 'Jenis kelamin harus dipilih.',
  }),
  parent_as: z.string().min(1, {
    message: 'Status wali harus dipilih.',
  }),
  phone: z.string().nullable().optional(),
  card_address: z.string().nullable().optional(),
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
      photo: initialData?.photo || null,
    },
  });

  const parentAsOptions = ['Ayah', 'Ibu', 'Wali'];

  const [photoPreviewFile, setPhotoPreviewFile] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [isParentDataFound, setIsParentDataFound] = useState(false);

  const [triggerGetParentByNik, { isFetching: isCheckingNik }] = useLazyGetParentByNikQuery();

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

  const handleNikChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const nik = event.target.value;
    form.setValue('nik', nik);

    if (nik.length === 16) {
      const loadingToastId = toast.loading('Mencari data wali santri...');
      try {
        const { data: apiResponse, error: apiError } = await triggerGetParentByNik(nik);
        toast.dismiss(loadingToastId);

        console.log("API Response:", apiResponse); // Log the full response
        console.log("API Error:", apiError); // Log any error

        if (apiResponse?.data) {
          const parentDataFromApi = apiResponse.data;
          console.log("Parent Data from API:", parentDataFromApi); // Log the extracted data

          form.setValue('first_name', parentDataFromApi.first_name);
          form.setValue('last_name', parentDataFromApi.last_name);
          form.setValue('email', parentDataFromApi.email || ''); // Ensure email is string
          form.setValue('kk', parentDataFromApi.kk.trim()); // Trim to remove potential BOM
          form.setValue('nik', parentDataFromApi.nik); // Ensure NIK is also set from API response
          form.setValue('gender', parentDataFromApi.gender);
          form.setValue('parent_as', parentDataFromApi.parent_as); // This is the field user mentioned
          form.setValue('phone', parentDataFromApi.phone || null);
          form.setValue('card_address', parentDataFromApi.card_address || null); // This is the field user mentioned
          form.setValue('photo', parentDataFromApi.photo || null);
          setPhotoPreviewUrl(parentDataFromApi.photo || null);
          setPhotoPreviewFile(null);

          setIsParentDataFound(true);
          toast.success('Data wali sudah ada dan diisi otomatis.');
        } else if (apiError) {
          const fetchError = apiError as FetchBaseQueryError;
          if (fetchError.status === 404) {
            toast.info('Data wali tidak ditemukan. Silakan isi secara manual.');
          } else {
            const errorMessage = (fetchError.data as { message?: string })?.message || 'Terjadi kesalahan saat mencari data wali.';
            toast.error(errorMessage);
          }
          setIsParentDataFound(false);
          // Clear fields if no data found or error, but keep the entered NIK
          form.reset(); // Reset all fields to default values
          form.setValue('nik', nik); // Keep the NIK that was just typed
          setPhotoPreviewFile(null);
          setPhotoPreviewUrl(null);
        }
      } catch (err) {
        toast.dismiss(loadingToastId);
        console.error("Unexpected error during NIK check:", err); // Log unexpected errors
        toast.error('Terjadi kesalahan saat memproses pencarian NIK.');
        setIsParentDataFound(false);
        // Clear fields on unexpected error, but keep the entered NIK
        form.reset(); // Reset all fields to default values
        form.setValue('nik', nik); // Keep the NIK that was just typed
        setPhotoPreviewFile(null);
        setPhotoPreviewUrl(null);
      }
    } else {
      setIsParentDataFound(false);
      // Only reset if data was previously found and NIK is now invalid
      if (isParentDataFound) {
        form.reset(); // Reset all fields to default values
        form.setValue('nik', nik); // Keep the NIK that was just typed
        setPhotoPreviewFile(null);
        setPhotoPreviewUrl(null);
      }
    }
  }, [form, triggerGetParentByNik, isParentDataFound]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onNext)} className="space-y-4">
        {/* Identifikasi */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <FormField
            control={form.control}
            name="nik"
            render={({ field }) => (
              <FormItem>
                <FormLabel>NIK Wali</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Contoh: 3273xxxxxxxxxxxxxx"
                    {...field}
                    onChange={handleNikChange}
                    disabled={isCheckingNik || isSubmitting}
                  />
                </FormControl>
                {isCheckingNik && <p className="text-sm text-muted-foreground mt-1">Mencari data...</p>}
                {isParentDataFound && <p className="text-sm text-green-600 mt-1">Data wali sudah ada.</p>}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Informasi Pribadi */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Depan Wali</FormLabel>
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
                <FormLabel>Nama Belakang Wali (Opsional)</FormLabel>
                <FormControl>
                  <Input placeholder="Contoh: Santoso" {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Jenis Kelamin Wali</FormLabel>
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
            name="parent_as"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status Wali</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
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

        {/* Informasi Kontak */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Wali</FormLabel>
                <FormControl>
                  <Input placeholder="contoh@email.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telepon Wali (Opsional)</FormLabel>
                <FormControl>
                  <Input placeholder="Contoh: 081234567890" {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Alamat dan Foto berdampingan */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="card_address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Alamat Wali (Opsional)</FormLabel>
                <FormControl>
                  <Textarea placeholder="Alamat lengkap wali..." {...field} value={field.value || ''} className="min-h-[120px]" />
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
                <FormLabel>Foto Wali (Opsional)</FormLabel>
                <div className="flex gap-4 items-start">
                  <SelectedPhotoCard photoFile={photoPreviewFile} photoUrl={photoPreviewUrl} />
                  <div className="flex-1">
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/*"
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
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Batal
          </Button>
          <Button type="submit" disabled={isSubmitting || isCheckingNik}>
            Lanjut ke Data Santri
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ParentFormStep;