"use client";

import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UploadCloud } from 'lucide-react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { SantriFormValues } from '../form-schemas';

interface EducationStepProps {
  form: any;
}

const EducationStep: React.FC<EducationStepProps> = ({ form }) => {
  const { control, watch } = useFormContext<SantriFormValues>();
  const [preview, setPreview] = useState<string | null>(null);

  const fotoSantriFile = watch('fotoSantri');

  React.useEffect(() => {
    if (fotoSantriFile && fotoSantriFile instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(fotoSantriFile);
    } else {
      setPreview(null);
    }
  }, [fotoSantriFile]);

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
                    <FormControl>
                      <Input {...field} placeholder="Contoh: SMP/Mts" />
                    </FormControl>
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
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">Unggah Foto Santri</h3>
            <div className="flex items-start gap-4">
              <FormField
                control={control}
                name="fotoSantri"
                render={({ field }) => (
                  <FormItem className="flex-grow">
                    <FormLabel
                      htmlFor="dropzone-file"
                      className="flex flex-col items-center justify-center w-full h-[151px] border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                        <p className="mb-2 text-sm text-muted-foreground">
                          <span className="font-semibold">Klik untuk mengunggah</span> atau seret
                        </p>
                        <p className="text-xs text-muted-foreground">Pas Foto 3x4 (MAX. 2MB)</p>
                      </div>
                      <FormControl>
                        <Input
                          id="dropzone-file"
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => field.onChange(e.target.files ? e.target.files[0] : null)}
                        />
                      </FormControl>
                    </FormLabel>
                    <FormMessage className="mt-2" />
                  </FormItem>
                )}
              />
              <div className="flex-shrink-0 w-[113px] h-[151px] border rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                {preview ? (
                  <img src={preview} alt="Foto Santri Preview" className="object-cover w-full h-full" />
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