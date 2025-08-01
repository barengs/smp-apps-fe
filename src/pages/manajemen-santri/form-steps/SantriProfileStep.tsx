"use client";

import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { SantriFormValues } from '../form-schemas';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';

interface SantriProfileStepProps {
  form: any;
}

const SantriProfileStep: React.FC<SantriProfileStepProps> = ({ form }) => {
  const { control } = useFormContext<SantriFormValues>();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Langkah 2: Profil Santri</CardTitle>
          <CardDescription>Isi informasi pribadi santri.</CardDescription>
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
              name="nikSantri"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>NIK Santri</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Contoh: 3201xxxxxxxxxxxx" />
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
                            format(field.value, "PPP")
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
                        captionLayout="dropdown" // Enable dropdown for month and year
                        fromYear={1900} // Set a reasonable start year
                        toYear={new Date().getFullYear()} // Set current year as end year
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
                <FormItem>
                  <FormLabel>Jenis Kelamin</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih jenis kelamin" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="L">Laki-laki</SelectItem>
                      <SelectItem value="P">Perempuan</SelectItem>
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
                <FormItem className="md:col-span-2">
                  <FormLabel>Alamat Lengkap Santri</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Contoh: Jl. Raya No. 1, RT 01/RW 02, Desa/Kel. Contoh, Kec. Contoh, Kab/Kota Contoh, Provinsi Contoh" />
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