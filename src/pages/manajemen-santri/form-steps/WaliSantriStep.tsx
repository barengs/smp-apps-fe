"use client";

import React, { useEffect, useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { SantriFormValues } from '../form-schemas';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetPekerjaanQuery } from '@/store/slices/pekerjaanApi';
import { useLazyGetParentByNikQuery } from '@/store/slices/parentApi';
import { useGetEducationLevelsQuery } from '@/store/slices/educationApi';
import * as toast from '@/utils/toast';
import { Id } from 'react-toastify';

interface WaliSantriStepProps {}

const WaliSantriStep: React.FC<WaliSantriStepProps> = () => {
  const { control, setValue, watch } = useFormContext<SantriFormValues>();
  const loadingToastId = useRef<Id | null>(null);

  const { data: pekerjaanResponse, isLoading: isLoadingPekerjaan, isError: isErrorPekerjaan } = useGetPekerjaanQuery();
  const pekerjaanList = pekerjaanResponse || [];

  const { data: educationLevelsResponse, isLoading: isLoadingEducationLevels, isError: isErrorEducationLevels } = useGetEducationLevelsQuery();
  const educationLevelsList = educationLevelsResponse?.data || [];

  const [triggerGetParentByNik, { data: nikData, isLoading: isLoadingNik, isError: isErrorNik, error: nikError, isUninitialized }] = useLazyGetParentByNikQuery();

  const nikValue = watch('nik');

  useEffect(() => {
    if (nikValue && nikValue.length === 16) {
      triggerGetParentByNik(nikValue);
    }
  }, [nikValue, triggerGetParentByNik]);

  useEffect(() => {
    if (isLoadingNik) {
      if (!loadingToastId.current) {
        loadingToastId.current = toast.showLoading('Mengecek NIK...');
      }
    } else {
      if (isUninitialized) return;

      if (loadingToastId.current) {
        toast.dismissToast(loadingToastId.current);
        loadingToastId.current = null;
      }

      if (nikData && nikData.data) {
        toast.showSuccess('Data wali ditemukan. Formulir telah diisi secara otomatis.');
        const parentData = nikData.data;

        const kkValue = String(parentData.kk || '').trim();
        if (kkValue.match(/^\d{16}$/)) {
          setValue('kk', kkValue);
        } else {
          setValue('kk', '');
          toast.showWarning('Nomor KK dari data NIK tidak valid. Harap masukkan manual (16 digit).');
        }
        
        setValue('firstName', parentData.first_name);
        setValue('lastName', parentData.last_name || '');
        setValue('gender', parentData.gender);
        setValue('parentAs', parentData.parent_as as 'ayah' | 'ibu' | 'wali');
        setValue('phone', parentData.phone || '');
        setValue('email', parentData.email || '');
        setValue('alamatKtp', parentData.card_address || '');
        setValue('alamatDomisili', parentData.domicile_address || '');

        if (parentData.occupation && pekerjaanList.length > 0) {
          const foundPekerjaan = pekerjaanList.find(p => p.name === parentData.occupation);
          if (foundPekerjaan) {
            setValue('pekerjaanValue', foundPekerjaan.id.toString());
          }
        }

        if (parentData.education && educationLevelsList.length > 0) {
          const foundEducation = educationLevelsList.find(edu => edu.name === parentData.education);
          if (foundEducation) {
            setValue('educationValue', foundEducation.id.toString());
          }
        }
      } else if (isErrorNik) {
        // @ts-ignore
        if (nikError?.status === 404) {
          toast.showInfo('NIK belum terdaftar, silahkan isi data secara manual');
        } else {
          // @ts-ignore
          const errorMessage = nikError?.data?.message || 'Terjadi kesalahan pada server.';
          toast.showError(`Gagal mengecek NIK: ${errorMessage}`);
        }
      } else {
        // This handles the case where the API call was successful but returned no data.
        toast.showInfo('NIK belum terdaftar, silahkan isi data secara manual');
      }
    }
  }, [isLoadingNik, isErrorNik, nikData, nikError, setValue, pekerjaanList, educationLevelsList, isUninitialized]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Langkah 1: Data Wali Santri</CardTitle>
          <CardDescription>Isi informasi pribadi wali santri. NIK akan dicek secara otomatis setelah 16 digit terisi.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={control}
              name="nik"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>NIK Wali</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Contoh: 3201xxxxxxxxxxxx" maxLength={16} />
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
                    <Input {...field} placeholder="Contoh: 3201xxxxxxxxxxxx" maxLength={16} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Depan Wali</FormLabel>
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
                  <FormLabel>Nama Belakang Wali</FormLabel>
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
              name="parentAs"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Peran Sebagai</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex flex-row space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="ayah" />
                        </FormControl>
                        <FormLabel className="font-normal">Ayah</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="ibu" />
                        </FormControl>
                        <FormLabel className="font-normal">Ibu</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="wali" />
                        </FormControl>
                        <FormLabel className="font-normal">Wali</FormLabel>
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
                    <Input {...field} placeholder="Contoh: wali@example.com" type="email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="pekerjaanValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pekerjaan</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih pekerjaan" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isLoadingPekerjaan && (
                        <SelectItem value="loading" disabled>Memuat pekerjaan...</SelectItem>
                      )}
                      {isErrorPekerjaan && (
                        <SelectItem value="error" disabled>Gagal memuat data.</SelectItem>
                      )}
                      {!isLoadingPekerjaan && !isErrorPekerjaan && pekerjaanList.length === 0 && (
                        <SelectItem value="no-data" disabled>Tidak ada data pekerjaan.</SelectItem>
                      )}
                      {pekerjaanList.map((pekerjaan) => (
                        <SelectItem key={pekerjaan.id} value={pekerjaan.id.toString()}>
                          {pekerjaan.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="educationValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pendidikan Terakhir</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih pendidikan terakhir" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isLoadingEducationLevels && (
                        <SelectItem value="loading" disabled>Memuat jenjang pendidikan...</SelectItem>
                      )}
                      {isErrorEducationLevels && (
                        <SelectItem value="error" disabled>Gagal memuat data.</SelectItem>
                      )}
                      {!isLoadingEducationLevels && !isErrorEducationLevels && educationLevelsList.length === 0 && (
                        <SelectItem value="no-data" disabled>Tidak ada data jenjang pendidikan.</SelectItem>
                      )}
                      {educationLevelsList.map((level) => (
                        <SelectItem key={level.id} value={level.id.toString()}>
                          {level.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="alamatKtp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alamat Lengkap (Sesuai KTP)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Contoh: Jl. Merdeka No. 45, RT 001/RW 002" />
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
                  <FormLabel>Alamat Domisili (Jika Berbeda dengan KTP)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Contoh: Jl. Damai No. 10, RT 003/RW 004" />
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

export default WaliSantriStep;