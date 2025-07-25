import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGetPekerjaanQuery } from '@/store/slices/pekerjaanApi';
import { Skeleton } from '@/components/ui/skeleton';

const WaliSantriStep = () => {
  const { data: pekerjaanList, isLoading, isError } = useGetPekerjaanQuery();

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
                <Select>
                  <SelectTrigger id="pekerjaan">
                    <SelectValue placeholder="Pilih Pekerjaan" />
                  </SelectTrigger>
                  <SelectContent>
                    {pekerjaanList?.map((pekerjaan) => (
                      <SelectItem key={pekerjaan.id} value={pekerjaan.id.toString()}>
                        {pekerjaan.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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