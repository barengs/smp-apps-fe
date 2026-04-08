"use client";

import React, { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { SantriFormValues } from '../form-schemas';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { CustomCalendar } from '@/components/CustomCalendar'; // Menggunakan CustomCalendar
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLazyCheckStudentByNikQuery } from '@/store/slices/calonSantriApi';
import { toast } from 'sonner';

// Helper function untuk memetakan jenis kelamin dari API
const mapJenisKelaminFromApi = (jenisKelaminApi: string): 'L' | 'P' => {
  const lower = (jenisKelaminApi || '').toLowerCase();
  if (lower.startsWith('l') || lower === 'male' || lower === 'laki-laki') {
    return 'L';
  }
  return 'P';
};

interface SantriProfileStepProps {
  isEditMode?: boolean;
  initialVillageName?: string;
}

const SantriProfileStep: React.FC<SantriProfileStepProps> = ({ isEditMode = false, initialVillageName }) => {
  const { control, watch, setValue, getValues } = useFormContext<SantriFormValues>();
  const checkedNik = React.useRef<string | null>(null);
  const isInitialEditModeFetch = React.useRef(isEditMode);
  
  const nikSantriValue = watch('nikSantri'); // Watch nikSantri field

  // Lazy query untuk cek NIK santri (data tanggal lahir, tempat lahir, dan desa)
  const [
    triggerCheckNik,
    { data: nikCheckData, isLoading: isLoadingNikCheck, isError: isErrorNikCheck, error: nikCheckError, reset: resetNikCheck },
  ] = useLazyCheckStudentByNikQuery();

  // Trigger cek NIK ketika 16 digit
  useEffect(() => {
    if (nikSantriValue && nikSantriValue.length === 16) {
      // Hanya picu jika NIK berbeda dari yang sudah dicek
      if (nikSantriValue !== checkedNik.current) {
        triggerCheckNik(nikSantriValue);
        checkedNik.current = nikSantriValue; // Tandai NIK ini sudah dicek
      }
    } else {
      // Hanya reset status pengecekan; JANGAN mengosongkan nilai yang sudah diisi dari server
      checkedNik.current = null;
      resetNikCheck();
    }
  }, [nikSantriValue, triggerCheckNik, resetNikCheck]);

  // Tangani respons cek NIK
  useEffect(() => {
    let toastId: string | number | undefined;

    if (isLoadingNikCheck) {
      if (!(isEditMode && isInitialEditModeFetch.current)) {
        toastId = toast.loading('Mengecek NIK Santri...');
      }
    }

    if (nikCheckData) {
      if (toastId) toast.dismiss(toastId);
      if (nikCheckData.success) {
        if (isEditMode && isInitialEditModeFetch.current) {
          const currentVillageCode = getValues('villageCode');
          
          if (currentVillageCode) {
            // Re-apply value after options loaded to fix Shadcn Select race condition
            setValue('villageCode', currentVillageCode, { shouldDirty: false });
          } else if (nikCheckData.desa && nikCheckData.desa.length > 0) {
            // Auto-fill if it was empty from database
            setValue('villageCode', nikCheckData.desa[0].code, { shouldValidate: true });
          }

          // Auto-fill other fields if they were initially empty in DB
          if (!getValues('tempatLahir') && nikCheckData.tempat_lahir) {
            setValue('tempatLahir', nikCheckData.tempat_lahir, { shouldValidate: true });
          }
          if (!getValues('tanggalLahir') && nikCheckData.tanggal_lahir) {
            setValue('tanggalLahir', new Date(nikCheckData.tanggal_lahir), { shouldValidate: true });
          }
          if (!getValues('jenisKelamin') && nikCheckData.jenis_kelamin) {
            setValue('jenisKelamin', mapJenisKelaminFromApi(nikCheckData.jenis_kelamin), { shouldValidate: true });
          }

          isInitialEditModeFetch.current = false;
        } else {
          // Isi otomatis tanggal lahir, tempat lahir, jenis kelamin, dan desa (pakai desa pertama jika ada)
          const jenisKelaminShort = mapJenisKelaminFromApi(nikCheckData.jenis_kelamin);
          setValue('jenisKelamin', jenisKelaminShort, { shouldValidate: true });
          if (nikCheckData.tanggal_lahir) {
            setValue('tanggalLahir', new Date(nikCheckData.tanggal_lahir), { shouldValidate: true });
          }
          if (nikCheckData.tempat_lahir) {
            setValue('tempatLahir', nikCheckData.tempat_lahir, { shouldValidate: true });
          }
          if (nikCheckData.desa && nikCheckData.desa.length > 0) {
            setValue('villageCode', nikCheckData.desa[0].code, { shouldValidate: true });
            toast.success('Data NIK ditemukan', {
              description: `Tanggal & tempat lahir diisi otomatis. Desa: ${nikCheckData.desa[0].name}.`,
            });
          } else {
            toast.info('Data NIK ditemukan tanpa desa.', {
              description: 'Silakan pilih desa/kelurahan secara manual.',
            });
          }
        }
      } else {
        if (!(isEditMode && isInitialEditModeFetch.current)) {
          toast.info('Data tidak ditemukan untuk NIK ini.', {
            description: 'Silakan isi data secara manual.',
          });
        }
        isInitialEditModeFetch.current = false;
      }
    }

    if (isErrorNikCheck) {
      if (toastId) toast.dismiss(toastId);
      if (!(isEditMode && isInitialEditModeFetch.current)) {
        // @ts-ignore
        const msg = nikCheckError?.data?.message || 'Terjadi kesalahan pada server.';
        toast.error('Gagal mengecek NIK', { description: msg });
      }
      isInitialEditModeFetch.current = false;
    }
  }, [nikCheckData, isLoadingNikCheck, isErrorNikCheck, nikCheckError, setValue, getValues, isEditMode]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Langkah 2: Profil Santri</CardTitle>
          <CardDescription>Isi informasi pribadi santri. NIK Santri akan dicek secara otomatis untuk mengisi data desa/kelurahan.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={control}
              name="firstNameSantri"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Depan Santri</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Contoh: Ahmad" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="lastNameSantri"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Belakang Santri</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Contoh: Fauzi" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="nikSantri"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>NIK Santri</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Contoh: 3201xxxxxxxxxxxx" maxLength={16} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="tempatLahir"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tempat Lahir</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Contoh: Jakarta" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="tanggalLahir"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Tanggal Lahir</FormLabel>
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
                            format(field.value, "PPP", { locale: id })
                          ) : (
                            <span>Pilih tanggal lahir</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CustomCalendar // Menggunakan CustomCalendar di sini
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
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
              control={control}
              name="jenisKelamin"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Jenis Kelamin</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex flex-row space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="L" />
                        </FormControl>
                        <FormLabel className="font-normal">Laki-laki</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="P" />
                        </FormControl>
                        <FormLabel className="font-normal">Perempuan</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="villageCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Desa/Kelurahan</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue 
                          placeholder={
                            field.value
                              ? (nikCheckData?.desa?.find((v) => v.code === field.value)?.name || initialVillageName || field.value)
                              : 'Pilih Desa/Kelurahan'
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isLoadingNikCheck ? (
                        <SelectItem value="loading" disabled>Memuat desa/kelurahan...</SelectItem>
                      ) : isErrorNikCheck ? (
                        <SelectItem value="error" disabled>Gagal memuat data.</SelectItem>
                      ) : nikCheckData?.desa && nikCheckData.desa.length > 0 ? (
                        nikCheckData.desa.map((village) => (
                          <SelectItem key={village.id} value={village.code}>
                            {village.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-data" disabled>Tidak ada data desa/kelurahan.</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="alamatSantri"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alamat Lengkap Santri</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Contoh: Jl. Raya No. 123, RT 001/RW 002" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SantriProfileStep;