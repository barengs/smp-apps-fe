"use client";

import React from 'react';
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

interface WaliSantriStepProps {
  // form: any; // Dihapus karena menggunakan useFormContext
}

const WaliSantriStep: React.FC<WaliSantriStepProps> = () => { // Menghapus { form }
  const { control } = useFormContext<SantriFormValues>();

  const { data: pekerjaanResponse, isLoading: isLoadingPekerjaan, isError: isErrorPekerjaan } = useGetPekerjaanQuery();
  const pekerjaanList = pekerjaanResponse || []; // FIX: Mengakses langsung pekerjaanResponse karena sudah berupa array

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Langkah 1: Data Wali Santri</CardTitle>
          <CardDescription>Isi informasi pribadi wali santri.</CardDescription>
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
              name="parentAs"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Peran Sebagai</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
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
              name="alamatKtp"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
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
                <FormItem className="md:col-span-2">
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