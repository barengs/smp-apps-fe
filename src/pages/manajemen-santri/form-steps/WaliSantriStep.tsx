"use client";

import React, { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGetPekerjaanQuery } from '@/store/slices/pekerjaanApi';
import { Skeleton } from '@/components/ui/skeleton';
import { useLazyGetParentByNikQuery } from '@/store/slices/parentApi';
import { toast } from 'react-toastify';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { SantriFormValues } from '../form-schemas';

interface WaliSantriStepProps {
  form: any; // Pass the form object from react-hook-form
}

const WaliSantriStep: React.FC<WaliSantriStepProps> = ({ form }) => {
  const { control, setValue, trigger } = useFormContext<SantriFormValues>();
  
  // API Hooks
  const { data: pekerjaanList, isLoading: isPekerjaanLoading, isError: isPekerjaanError } = useGetPekerjaanQuery();
  const [triggerGetParent, { data: parentData, isLoading: isParentLoading, isSuccess, isError: isParentError }] = useLazyGetParentByNikQuery();

  // Combobox State
  const [pekerjaanOpen, setPekerjaanOpen] = useState(false);

  // Handler untuk perubahan input NIK
  const handleNikChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newNik = e.target.value.replace(/\D/g, ''); // Hanya izinkan angka
    setValue('nik', newNik);
    if (newNik.length === 16) {
      triggerGetParent(newNik);
    }
  };

  // Efek untuk menangani hasil dari API call
  useEffect(() => {
    if (isSuccess) {
      if (parentData?.data && Object.keys(parentData.data).length > 0) {
        const data = parentData.data;
        toast.success('Data wali santri ditemukan.');
        setValue('kk', data.kk || '');
        setValue('firstName', data.first_name);
        setValue('lastName', data.last_name || '');
        
        // Fix for gender
        const validGenders = ['L', 'P'];
        if (data.gender && validGenders.includes(data.gender)) {
          setValue('gender', data.gender as 'L' | 'P');
        } else {
          setValue('gender', undefined); // Set to undefined if not valid, let Zod handle required_error
        }

        // Fix for parentAs
        const validParentAs = ['ayah', 'ibu', 'wali'];
        if (data.parent_as && validParentAs.includes(data.parent_as)) {
          setValue('parentAs', data.parent_as as 'ayah' | 'ibu' | 'wali');
        } else {
          setValue('parentAs', undefined); // Set to undefined if not valid, let Zod handle required_error
        }

        setValue('phone', data.phone || '');
        setValue('email', data.email || '');
        setValue('alamatKtp', data.card_address || '');
        setValue('alamatDomisili', data.domicile_address || data.card_address || '');

        if (data.occupation && pekerjaanList) {
          const foundPekerjaan = pekerjaanList.find(p => p.name.toLowerCase() === data.occupation?.toLowerCase());
          if (foundPekerjaan) {
            setValue('pekerjaanValue', foundPekerjaan.id.toString());
          } else {
            setValue('pekerjaanValue', '');
          }
        }
        // Trigger validation for all fields after auto-filling
        trigger();
      } else {
        toast.error('Data wali belum ada, silahkan isi manual.');
      }
    } else if (isParentError) {
      toast.error('Terjadi kesalahan saat mencari data wali. Silakan coba lagi.');
    }
  }, [isSuccess, isParentError, parentData, pekerjaanList, setValue, trigger]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Langkah 1: Informasi Wali Santri</CardTitle>
        <CardDescription>Masukkan NIK wali santri untuk mencari data yang sudah terdaftar. Jika tidak ditemukan, Anda bisa mengisi data baru di bawah.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={control}
              name="nik"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>NIK</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        placeholder="Contoh: 320xxxxxxxxxxxxx"
                        onChange={handleNikChange}
                        maxLength={16}
                      />
                      {isParentLoading && (
                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-muted-foreground" />
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="kk"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nomor Kartu Keluarga (KK)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Contoh: 320xxxxxxxxxxxxx" maxLength={16} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Depan</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Contoh: Budi" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Belakang (opsional)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Contoh: Santoso" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="gender"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Jenis Kelamin</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="L" />
                        </FormControl>
                        <FormLabel className="font-normal">Laki-laki</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2">
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
              name="parentAs"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Sebagai Wali</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="ayah" />
                        </FormControl>
                        <FormLabel className="font-normal">Ayah</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="ibu" />
                        </FormControl>
                        <FormLabel className="font-normal">Ibu</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="wali" />
                        </FormControl>
                        <FormLabel className="font-normal">Wali Lainnya</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nomor Telepon</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Contoh: 081234567890" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" placeholder="Contoh: nama@example.com" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="pekerjaanValue"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Pekerjaan</FormLabel>
                  {isPekerjaanLoading ? (
                    <Skeleton className="h-10 w-full" />
                  ) : isPekerjaanError ? (
                    <Input placeholder="Gagal memuat pekerjaan" disabled />
                  ) : (
                    <Popover open={pekerjaanOpen} onOpenChange={setPekerjaanOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full justify-between font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value
                              ? pekerjaanList?.find((p) => p.id.toString() === field.value)?.name
                              : "Pilih Pekerjaan..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                        <Command>
                          <CommandInput placeholder="Cari pekerjaan..." />
                          <CommandEmpty>Tidak ada pekerjaan ditemukan.</CommandEmpty>
                          <CommandGroup>
                            {pekerjaanList?.map((pekerjaan) => (
                              <CommandItem
                                key={pekerjaan.id}
                                value={pekerjaan.name}
                                onSelect={() => {
                                  setValue('pekerjaanValue', pekerjaan.id.toString());
                                  setPekerjaanOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    field.value === pekerjaan.id.toString() ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {pekerjaan.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="alamatKtp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alamat Sesuai KTP</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Contoh: Jl. Merdeka No. 10, Jakarta Pusat" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="alamatDomisili"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alamat Domisili (opsional)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Contoh: Jl. Pahlawan No. 5, Bandung" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WaliSantriStep;