import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from 'lucide-react';

const WaliSantriStep = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Langkah 1: Informasi Wali Santri</CardTitle>
        <CardDescription>Cari wali santri yang sudah terdaftar berdasarkan NIK atau input data wali baru.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="search" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="search">Cari Wali Santri</TabsTrigger>
            <TabsTrigger value="new">Input Wali Baru</TabsTrigger>
          </TabsList>
          <TabsContent value="search">
            <div className="space-y-4 py-4">
              <Label htmlFor="nik-search">Cari Berdasarkan NIK</Label>
              <div className="flex w-full max-w-sm items-center space-x-2">
                <Input type="text" id="nik-search" placeholder="Masukkan NIK Wali Santri..." />
                <Button type="button">
                  <Search className="h-4 w-4 mr-2" /> Cek NIK
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Jika wali santri sudah terdaftar, data akan terisi otomatis.
              </p>
            </div>
          </TabsContent>
          <TabsContent value="new">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nik">NIK</Label>
                <Input id="nik" placeholder="Contoh: 320xxxxxxxxxxxxx" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nama-wali">Nama Lengkap Wali</Label>
                <Input id="nama-wali" placeholder="Contoh: Budi Santoso" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telepon">Nomor Telepon</Label>
                <Input id="telepon" placeholder="Contoh: 081234567890" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pekerjaan">Pekerjaan</Label>
                <Input id="pekerjaan" placeholder="Contoh: Wiraswasta" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="alamat-wali">Alamat Lengkap</Label>
                <Input id="alamat-wali" placeholder="Contoh: Jl. Merdeka No. 10, Jakarta" />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default WaliSantriStep;