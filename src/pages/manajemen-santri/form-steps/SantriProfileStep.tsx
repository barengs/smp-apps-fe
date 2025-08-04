"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { SantriFormValues } from '../form-schemas';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
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
import { useLazyGetVillagesQuery, useLazyGetVillageByNikQuery } from '@/store/slices/villageApi';
import { toast } from 'sonner';

interface SantriProfileStepProps {
  // form: any; // Dihapus karena menggunakan useFormContext
}

const SantriProfileStep: React.FC<SantriProfileStepProps> = () => {
  const { control, watch, setValue } = useFormContext<SantriFormValues>();
  
  const nikSantriValue = watch('nikSantri'); // Watch nikSantri field
  const villageCodeValue = watch('villageCode'); // Watch villageCode field

  // Lazy hook for fetching all villages (only triggered when needed)
  const [triggerGetAllVillages, { data: allVillagesResponse, isLoading: isLoadingAllVillages, isError: isErrorAllVillages }] = useLazyGetVillagesQuery();
  const allVillages = allVillagesResponse?.data || [];

  // Hook for lazy fetching village data by NIK
  const [triggerGetVillageByNik, { data: villageNikData, isLoading: isLoadingVillageNik, isError: isErrorVillageNik, error: villageNikError, reset: resetVillageNikQuery }] = useLazyGetVillageByNikQuery();

  // State to control whether to show all villages for manual selection
  const [showAllVillagesForManualSelection, setShowAllVillagesForManualSelection] = useState(false);

  // Effect to trigger village lookup when nikSantri is 16 digits
  useEffect(() => {
    if (nikSantriValue && nikSantriValue.length === 16) {
      triggerGetVillageByNik(nikSantriValue);
      setShowAllVillagesForManualSelection(false); // Hide all villages while NIK lookup is active
    } else {
      // If NIK is not 16 digits or cleared, reset NIK lookup and hide all villages
      resetVillageNikQuery();
      setValue('villageCode', ''); // Clear village code if NIK is incomplete/cleared
      setShowAllVillagesForManualSelection(false);
    }
  }, [nikSantriValue, triggerGetVillageByNik, resetVillageNikQuery, setValue]);

  // Effect to handle village lookup response
  useEffect(() => {
    let toastId: string | number | undefined;

    if (isLoadingVillageNik) {
      toastId = toast.loading('Mengecek NIK Santri untuk data desa...');
    }

    if (villageNikData) { // Response received
      if (toastId) toast.dismiss(toastId);
      if (villageNikData.length > 0) {
        const foundVillage = villageNikData[0];
        toast.success('Data desa ditemukan.', {
          description: `Desa/Kelurahan: ${foundVillage.name} telah diisi.`,
        });
        setValue('villageCode', foundVillage.code);
        setShowAllVillagesForManualSelection(false);
      } else { // Empty array means not found
        toast.info('Data desa tidak ditemukan untuk NIK ini.', {
          description: 'Silakan pilih desa/kelurahan secara manual.',
        });
        setShowAllVillagesForManualSelection(true);
        triggerGetAllVillages({ page: 1, per_page: 9999 });
      }
    }

    if (isErrorVillageNik) {
      if (toastId) toast.dismiss(toastId);
      // @ts-ignore
      if (villageNikError?.status === 404) {
        toast.info('Data desa tidak ditemukan untuk NIK ini.', {
          description: 'Silakan pilih desa/kelurahan secara manual.',
        });
      } else {
        toast.error('Gagal mengecek data desa.', {
          // @ts-ignore
          description: villageNikError?.data?.message || 'Terjadi kesalahan pada server.',
        });
      }
      setShowAllVillagesForManualSelection(true);
      triggerGetAllVillages({ page: 1, per_page: 9999 });
    }
  }, [villageNikData, isLoadingVillageNik, isErrorVillageNik, villageNikError, setValue, triggerGetAllVillages]);

  // Determine which villages to display in the Select component
  const villagesToDisplay = useMemo(() => {
    let options = [];

    // Always include the village found by NIK if it exists
    const foundVillageByNik = villageNikData && villageNikData.length > 0 ? villageNikData[0] : null;
    if (foundVillageByNik) {
      options.push(foundVillageByNik);
    }

    // If manual selection is active, add all villages fetched by triggerGetAllVillages
    if (showAllVillagesForManualSelection) {
      options.push(...allVillages);
    }

    // Ensure the currently selected value is always in the options
    // This handles cases where the selected value might not be in the initial NIK result
    // or the allVillages list (e.g., if it was pre-filled or came from a different source).
    if (villageCodeValue && !options.some(v => v.code === villageCodeValue)) {
      // Try to find the selected village from either source (NIK data or all villages)
      const selectedVillage = foundVillageByNik?.code === villageCodeValue
        ? foundVillageByNik
        : allVillages.find(v => v.code === villageCodeValue);
      
      if (selectedVillage) {
        options.push(selectedVillage);
      }
    }

    // Remove duplicates and return
    return Array.from(new Map(options.map(item => [item.code, item])).values());
  }, [villageNikData, allVillages, showAllVillagesForManualSelection, villageCodeValue]);

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
                      <Calendar
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
                      defaultValue={field.value}
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
              name="alamatSantri"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Alamat Lengkap Santri</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Contoh: Jl. Raya No. 123, RT 001/RW 002" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="villageCode"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Desa/Kelurahan</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Desa/Kelurahan">
                          {field.value
                            ? villagesToDisplay.find((v) => v.code === field.value)?.name || 'Memuat...'
                            : 'Pilih Desa/Kelurahan'}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {villagesToDisplay.length > 0 ? (
                        villagesToDisplay.map((village) => (
                          <SelectItem key={village.code} value={village.code}>
                            {village.name}
                          </SelectItem>
                        ))
                      ) : isLoadingVillageNik ? (
                        <SelectItem value="loading-nik" disabled>Mengecek NIK...</SelectItem>
                      ) : showAllVillagesForManualSelection && isLoadingAllVillages ? (
                        <SelectItem value="loading-all" disabled>Memuat desa/kelurahan...</SelectItem>
                      ) : showAllVillagesForManualSelection && isErrorAllVillages ? (
                        <SelectItem value="error-all" disabled>Gagal memuat data.</SelectItem>
                      ) : (
                        <SelectItem value="no-data" disabled>Tidak ada data desa/kelurahan.</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
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