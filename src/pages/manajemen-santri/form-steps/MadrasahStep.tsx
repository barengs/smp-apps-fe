"use client";

import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetEducationLevelsQuery } from '@/store/slices/educationApi';

const MadrasahStep: React.FC = () => {
  const { control } = useFormContext();
  const { data: educationLevelsResponse, isLoading: isLoadingEducationLevels, isError: isErrorEducationLevels } = useGetEducationLevelsQuery({});
  const educationLevels = educationLevelsResponse || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Langkah 4: Informasi Pendidikan Madrasah (Opsional)</CardTitle>
          <CardDescription>Isi informasi pendidikan madrasah terakhir santri jika ada.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={control}
              name="sekolahAsalMadrasah"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Madrasah Asal</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Contoh: MI Al-Hidayah" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="jenjangSebelumnyaMadrasah"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jenjang Pendidikan Madrasah</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value === '' ? undefined : field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih jenjang pendidikan" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isLoadingEducationLevels && <SelectItem value="loading" disabled>Memuat...</SelectItem>}
                      {isErrorEducationLevels && <SelectItem value="error" disabled>Gagal memuat.</SelectItem>}
                      {educationLevels.map((level) => (
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
              name="alamatSekolahMadrasah"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Alamat Madrasah Asal</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Contoh: Jl. Pendidikan No. 10" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={control}
              name="certificateNumberMadrasah"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nomor Ijazah Madrasah (Opsional)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Contoh: 001/IJZ/MI/2023" />
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

export default MadrasahStep;