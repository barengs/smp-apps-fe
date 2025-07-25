import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const SantriProfileStep = () => {
  const [date, setDate] = React.useState<Date>();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Langkah 2: Profil Calon Santri</CardTitle>
        <CardDescription>Lengkapi data diri calon santri dengan benar.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nama-santri">Nama Lengkap Santri</Label>
            <Input id="nama-santri" placeholder="Contoh: Ahmad Fauzi" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nisn">NISN (Nomor Induk Siswa Nasional)</Label>
            <Input id="nisn" placeholder="Jika ada" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nik-santri">NIK Santri</Label>
            <Input id="nik-santri" placeholder="Contoh: 320xxxxxxxxxxxxx" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tempat-lahir">Tempat Lahir</Label>
            <Input id="tempat-lahir" placeholder="Contoh: Bandung" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tanggal-lahir">Tanggal Lahir</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pilih tanggal</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label htmlFor="jenis-kelamin">Jenis Kelamin</Label>
            <Select>
              <SelectTrigger id="jenis-kelamin">
                <SelectValue placeholder="Pilih Jenis Kelamin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="L">Laki-laki</SelectItem>
                <SelectItem value="P">Perempuan</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="alamat-santri">Alamat Lengkap</Label>
            <Input id="alamat-santri" placeholder="Contoh: Jl. Cendrawasih No. 5, Bandung" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SantriProfileStep;