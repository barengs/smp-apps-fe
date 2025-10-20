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

const EducationStep: React.FC = () => {
  const { control } = useFormContext();
  const { data: educationLevelsResponse, isLoading: isLoadingEducationLevels, isError: isErrorEducationLevels } = useGetEducationLevelsQuery({});
  const educationLevels = educationLevelsResponse || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Langkah 3: Informasi Pendidikan Formal</CardTitle>
          <CardDescription>Isi informasi pendidikan formal terakhir dan identitas pendidikan santri.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={control}
              name="nisn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>NISN</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Contoh: 0012345678" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="certificateNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nomor Ijazah (Opsional)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Contoh: 001/IJZ/SMP/2023" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="sekolahAsal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Sekolah Asal</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Contoh: SMP Negeri 1 Jakarta" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="jenjangSebelumnya"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jenjang Pendidikan</FormLabel>
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
              name="alamatSekolah"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Alamat Sekolah Asal</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Contoh: Jl. Budi Utomo No. 1, Jakarta Pusat" />
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

export default EducationStep;