"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UploadCloud } from 'lucide-react';

const EducationStep = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedImage(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Langkah 3: Informasi Pendidikan & Foto</CardTitle>
          <CardDescription>Isi informasi pendidikan terakhir dan unggah pas foto santri.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Pendidikan Terakhir</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sekolah-asal">Nama Sekolah Asal</Label>
                <Input id="sekolah-asal" placeholder="Contoh: SMP Negeri 1 Jakarta" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jenjang-sebelumnya">Jenjang Pendidikan</Label>
                <Input id="jenjang-sebelumnya" placeholder="Contoh: SMP/Mts" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="alamat-sekolah">Alamat Sekolah Asal</Label>
                <Input id="alamat-sekolah" placeholder="Contoh: Jl. Budi Utomo No. 1, Jakarta Pusat" />
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">Unggah Foto Santri</h3>
            <div className="flex items-start gap-4">
              <Label
                htmlFor="dropzone-file"
                className="flex flex-col items-center justify-center flex-grow h-64 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                  <p className="mb-2 text-sm text-muted-foreground">
                    <span className="font-semibold">Klik untuk mengunggah</span> atau seret dan lepas
                  </p>
                  <p className="text-xs text-muted-foreground">Pas Foto 3x4 (MAX. 2MB)</p>
                </div>
                <Input id="dropzone-file" type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
              </Label>
              {/* Photo Preview */}
              <div className="flex-shrink-0 w-[113px] h-[151px] border rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                {selectedImage ? (
                  <img src={selectedImage} alt="Foto Santri Preview" className="object-cover w-full h-full" />
                ) : (
                  <span className="text-muted-foreground text-xs text-center p-2">Pratinjau Foto</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EducationStep;