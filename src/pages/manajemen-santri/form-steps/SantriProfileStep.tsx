import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { SantriFormValues } from '../form-schemas';

interface SantriProfileStepProps {
  form: any;
}

const SantriProfileStep: React.FC<SantriProfileStepProps> = ({ form }) => {
  const { control } = useFormContext<SantriFormValues>();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Langkah 2: Profil Calon Santri</CardTitle>
        <CardDescription>Lengkapi data diri calon santri dengan benar.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control}
            name="firstNameSantri"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Depan</FormLabel>
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
                <FormLabel>Nama Belakang</FormLabel>
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
                <FormLabel>NISN (Nomor Induk Siswa Nasional)</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Jika ada" />
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
                <FormLabel>NIK</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Contoh: 320xxxxxxxxxxxxx" maxLength={16} />
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
                  <Input {...field} placeholder="Contoh: Bandung" />
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
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, "PPP") : <span>Pilih tanggal</span>}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
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
                      <SelectValue placeholder="Pilih Jenis Kelamin" />
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
                <FormLabel>Alamat Lengkap</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Contoh: Jl. Cendrawasih No. 5, Bandung" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default SantriProfileStep;