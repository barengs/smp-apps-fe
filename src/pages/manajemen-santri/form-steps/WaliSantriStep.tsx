"use client";

import React, { useEffect, useState } from 'react';
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
import { toast } from 'sonner';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const WaliSantriStep = () => {
  // API Hooks
  const { data: pekerjaanList, isLoading: isPekerjaanLoading, isError: isPekerjaanError } = useGetPekerjaanQuery();
  const [triggerGetParent, { data: parentData, isLoading: isParentLoading, isSuccess, isError: isParentError }] = useLazyGetParentByNikQuery();

  // Form State
  const [nik, setNik] = useState('');
  const [kk, setKk] = useState(''); // New state for KK
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState<'L' | 'P' | ''>(''); // New state for Gender
  const [parentAs, setParentAs] = useState(''); // New state for Parent As
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState(''); // New state for Email
  const [alamatKtp, setAlamatKtp] = useState('');
  const [alamatDomisili, setAlamatDomisili] = useState('');
  
  // Combobox State
  const [pekerjaanOpen, setPekerjaanOpen] = useState(false);
  const [pekerjaanValue, setPekerjaanValue] = useState('');

  // Handler untuk perubahan input NIK
  const handleNikChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newNik = e.target.value.replace(/\D/g, ''); // Hanya izinkan angka
    setNik(newNik);
    if (newNik.length === 16) {
      triggerGetParent(newNik);
    }
  };

  // Efek untuk menangani hasil dari API call
  useEffect(() => {
    if (isSuccess && parentData?.data) {
      const data = parentData.data;
      toast.success('Data wali santri ditemukan.');
      setKk(data.kk || ''); // Set KK
      setFirstName(data.first_name);
      setLastName(data.last_name || '');
      setGender(data.gender || ''); // Set Gender
      setParentAs(data.parent_as || ''); // Set Parent As
      setPhone(data.phone || '');
      setEmail(data.email || ''); // Set Email
      setAlamatKtp(data.card_address || '');
      // Jika alamat domisili kosong, gunakan alamat KTP
      setAlamatDomisili(data.domicile_address || data.card_address || '');

      // Mencocokkan pekerjaan dari API dengan daftar pekerjaan
      if (data.occupation && pekerjaanList) {
        const foundPekerjaan = pekerjaanList.find(p => p.name.toLowerCase() === data.occupation?.toLowerCase());
        if (foundPekerjaan) {
          setPekerjaanValue(foundPekerjaan.id.toString());
        } else {
          setPekerjaanValue(''); // Reset jika tidak cocok
        }
      }
    } else if (isParentError) {
      toast.error('Data wali tidak ditemukan. Silakan isi formulir secara manual.');
      // Clear fields if data not found
      setKk('');
      setFirstName('');
      setLastName('');
      setGender('');
      setParentAs('');
      setPhone('');
      setEmail('');
      setAlamatKtp('');
      setAlamatDomisili('');
      setPekerjaanValue('');
    }
  }, [isSuccess, isParentError, parentData, pekerjaanList]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Langkah 1: Informasi Wali Santri</CardTitle>
        <CardDescription>Masukkan NIK wali santri untuk mencari data yang sudah terdaftar. Jika tidak ditemukan, Anda bisa mengisi data baru di bawah.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nik">NIK</Label>
              <div className="relative">
                <Input
                  id="nik"
                  placeholder="Contoh: 320xxxxxxxxxxxxx"
                  value={nik}
                  onChange={handleNikChange}
                  maxLength={16}
                />
                {isParentLoading && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-muted-foreground" />
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Data wali santri akan terisi otomatis jika NIK ditemukan.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="kk">Nomor Kartu Keluarga (KK)</Label>
              <Input id="kk" placeholder="Contoh: 320xxxxxxxxxxxxx" value={kk} onChange={(e) => setKk(e.target.value)} maxLength={16} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first-name-wali">Nama Depan Wali</Label>
              <Input id="first-name-wali" placeholder="Contoh: Budi" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last-name-wali">Nama Belakang Wali (opsional)</Label>
              <Input id="last-name-wali" placeholder="Contoh: Santoso" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Jenis Kelamin</Label>
              <RadioGroup value={gender} onValueChange={(val) => setGender(val as 'L' | 'P' | '')} className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="L" id="gender-l" />
                  <Label htmlFor="gender-l">Laki-laki</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="P" id="gender-p" />
                  <Label htmlFor="gender-p">Perempuan</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label htmlFor="parent-as">Sebagai Wali</Label>
              <RadioGroup value={parentAs} onValueChange={setParentAs} className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ayah" id="parent-as-ayah" />
                  <Label htmlFor="parent-as-ayah">Ayah</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ibu" id="parent-as-ibu" />
                  <Label htmlFor="parent-as-ibu">Ibu</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="wali" id="parent-as-wali" />
                  <Label htmlFor="parent-as-wali">Wali Lainnya</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label htmlFor="telepon">Nomor Telepon</Label>
              <Input id="telepon" placeholder="Contoh: 081234567890" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="Contoh: nama@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pekerjaan">Pekerjaan</Label>
              {isPekerjaanLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : isPekerjaanError ? (
                <Input placeholder="Gagal memuat pekerjaan" disabled />
              ) : (
                <Popover open={pekerjaanOpen} onOpenChange={setPekerjaanOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={pekerjaanOpen}
                      className="w-full justify-between font-normal"
                    >
                      {pekerjaanValue
                        ? pekerjaanList?.find((p) => p.id.toString() === pekerjaanValue)?.name
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
                            onSelect={() => {
                              setPekerjaanValue(pekerjaanValue === pekerjaan.id.toString() ? '' : pekerjaan.id.toString());
                              setPekerjaanOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                pekerjaanValue === pekerjaan.id.toString() ? "opacity-100" : "opacity-0"
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
            <div className="space-y-2">
              <Label htmlFor="alamat-ktp">Alamat Sesuai KTP</Label>
              <Input id="alamat-ktp" placeholder="Contoh: Jl. Merdeka No. 10, Jakarta Pusat" value={alamatKtp} onChange={(e) => setAlamatKtp(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="alamat-domisili">Alamat Domisili (opsional)</Label>
              <Input id="alamat-domisili" placeholder="Contoh: Jl. Pahlawan No. 5, Bandung" value={alamatDomisili} onChange={(e) => setAlamatDomisili(e.target.value)} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WaliSantriStep;