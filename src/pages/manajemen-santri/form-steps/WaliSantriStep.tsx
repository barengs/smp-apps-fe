"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGetPekerjaanQuery } from '@/store/slices/pekerjaanApi';
import { Skeleton } from '@/components/ui/skeleton';

const WaliSantriStep = () => {
  const { data: pekerjaanList, isLoading, isError } = useGetPekerjaanQuery();
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Langkah 1: Informasi Wali Santri</CardTitle>
        <CardDescription>Masukkan NIK wali santri untuk mencari data yang sudah terdaftar. Jika tidak ditemukan, Anda bisa mengisi data baru di bawah.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="nik">NIK</Label>
            <Input id="nik" placeholder="Contoh: 320xxxxxxxxxxxxx" />
            <p className="text-sm text-muted-foreground">
              Data wali santri akan terisi otomatis jika NIK ditemukan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first-name-wali">Nama Depan Wali</Label>
              <Input id="first-name-wali" placeholder="Contoh: Budi" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last-name-wali">Nama Belakang Wali</Label>
              <Input id="last-name-wali" placeholder="Contoh: Santoso" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telepon">Nomor Telepon</Label>
              <Input id="telepon" placeholder="Contoh: 081234567890" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pekerjaan">Pekerjaan</Label>
              {isLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : isError ? (
                <Input id="pekerjaan" placeholder="Gagal memuat pekerjaan" disabled />
              ) : (
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-full justify-between"
                    >
                      {value
                        ? pekerjaanList?.find((pekerjaan) => pekerjaan.id.toString() === value)?.name
                        : "Pilih Pekerjaan..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
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
                            onSelect={(currentValue) => {
                              setValue(currentValue === value ? "" : pekerjaan.id.toString());
                              setOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                value === pekerjaan.id.toString() ? "opacity-100" : "opacity-0"
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
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="alamat-ktp">Alamat Sesuai KTP</Label>
              <Input id="alamat-ktp" placeholder="Contoh: Jl. Merdeka No. 10, Jakarta Pusat" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="alamat-domisili">Alamat Domisili</Label>
              <Input id="alamat-domisili" placeholder="Contoh: Jl. Pahlawan No. 5, Bandung" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WaliSantriStep;