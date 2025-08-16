"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import Webcam from 'react-webcam';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { UploadCloud, Camera, PlusCircle, X, FileCheck2 } from 'lucide-react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { SantriFormValues } from '../form-schemas';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { showError } from '@/utils/toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetProgramsQuery } from '@/store/slices/programApi';

const DocumentStep: React.FC = () => {
  const { control, watch, setValue } = useFormContext<SantriFormValues>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "optionalDocuments",
  });

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isPhotoCameraOpen, setIsPhotoCameraOpen] = useState(false);
  const [isDocCameraOpen, setIsDocCameraOpen] = useState(false);
  const webcamRef = useRef<Webcam>(null);

  const fotoSantriFile = watch('fotoSantri');
  const ijazahFile = watch('ijazahFile');
  const { data: programsResponse, isLoading: isLoadingPrograms, isError: isErrorPrograms } = useGetProgramsQuery();
  const programs = programsResponse || [];

  useEffect(() => {
    if (fotoSantriFile && fotoSantriFile instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(fotoSantriFile);
    } else {
      setPhotoPreview(null);
    }
  }, [fotoSantriFile]);

  const dataURLtoFile = (dataurl: string, filename: string): File | null => {
    const arr = dataurl.split(',');
    if (arr.length < 2) return null;
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) return null;
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new File([u8arr], filename, { type: mime });
  };

  const handleCapture = useCallback((type: 'fotoSantri' | 'ijazahFile') => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        const file = dataURLtoFile(imageSrc, `capture-${Date.now()}.jpg`);
        if (file) {
          setValue(type, file, { shouldValidate: true });
          if (type === 'fotoSantri') setIsPhotoCameraOpen(false);
          if (type === 'ijazahFile') setIsDocCameraOpen(false);
        } else {
          showError("Gagal mengonversi gambar. Coba lagi.");
        }
      } else {
        showError("Gagal mengambil gambar. Coba lagi.");
      }
    }
  }, [webcamRef, setValue]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Langkah 5: Dokumen & Program</CardTitle>
        <CardDescription>Pilih program, unggah foto, dan lampirkan dokumen yang diperlukan.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Section 1: Program & Photo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Program Pesantren</h3>
            <FormField
              control={control}
              name="programId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Program</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value === '' ? undefined : field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Pilih program pesantren" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isLoadingPrograms && <SelectItem value="loading" disabled>Memuat...</SelectItem>}
                      {isErrorPrograms && <SelectItem value="error" disabled>Gagal memuat.</SelectItem>}
                      {programs.map((program) => (
                        <SelectItem key={program.id} value={program.id.toString()}>{program.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Unggah Foto Santri</h3>
            <div className="flex items-start gap-4">
              <div className="flex-grow space-y-2">
                <FormField
                  control={control}
                  name="fotoSantri"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="photo-dropzone-file" className="flex flex-col items-center justify-center w-full h-[151px] border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                          <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Klik untuk mengunggah</span></p>
                          <p className="text-xs text-muted-foreground">Pas Foto 3x4 (MAX. 2MB)</p>
                        </div>
                        <FormControl>
                          <Input id="photo-dropzone-file" type="file" className="hidden" accept="image/*" onChange={(e) => field.onChange(e.target.files ? e.target.files[0] : null)} />
                        </FormControl>
                      </FormLabel>
                      <FormMessage className="mt-2" />
                    </FormItem>
                  )}
                />
                <Dialog open={isPhotoCameraOpen} onOpenChange={setIsPhotoCameraOpen}>
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline" className="w-full" onClick={() => setIsPhotoCameraOpen(true)}>
                      <Camera className="mr-2 h-4 w-4" /> Ambil Foto dari Kamera
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[625px]">
                    <DialogHeader><DialogTitle>Ambil Foto Santri</DialogTitle></DialogHeader>
                    <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" className="w-full h-auto rounded-md" />
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsPhotoCameraOpen(false)}>Batal</Button>
                      <Button onClick={() => handleCapture('fotoSantri')}>Ambil Gambar</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="flex-shrink-0 w-[113px] h-[151px] border rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                {photoPreview ? <img src={photoPreview} alt="Foto Santri Preview" className="object-cover w-full h-full" /> : <span className="text-muted-foreground text-xs text-center p-2">Pratinjau Foto</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Required Documents */}
        <div className="pt-8 border-t">
          <h3 className="text-lg font-medium mb-2">Dokumen Wajib</h3>
          <div className="flex items-start gap-4">
            <div className="flex-grow">
              <FormField
                control={control}
                name="ijazahFile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="doc-dropzone-file" className="flex flex-col items-center justify-center w-full min-h-[120px] p-4 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted">
                      {ijazahFile instanceof File && ijazahFile.size > 0 ? (
                        <div className="text-center text-success-foreground">
                          <FileCheck2 className="w-12 h-12 mx-auto mb-2 text-success" />
                          <p className="font-semibold">File Terpilih:</p>
                          <p className="text-sm">{ijazahFile.name}</p>
                        </div>
                      ) : (
                        <div className="text-center text-muted-foreground">
                          <UploadCloud className="w-10 h-10 mx-auto mb-3" />
                          <p className="mb-2 text-sm"><span className="font-semibold">Klik atau seret file ijazah ke sini</span></p>
                          <p className="text-xs">PNG, JPG, atau PDF (MAX. 2MB)</p>
                        </div>
                      )}
                      <FormControl>
                        <Input id="doc-dropzone-file" type="file" className="hidden" accept="image/*,application/pdf" onChange={(e) => field.onChange(e.target.files ? e.target.files[0] : null)} />
                      </FormControl>
                    </FormLabel>
                    <FormMessage className="mt-2" />
                  </FormItem>
                )}
              />
            </div>
            <Dialog open={isDocCameraOpen} onOpenChange={setIsDocCameraOpen}>
              <DialogTrigger asChild>
                <Button type="button" variant="outline" size="icon" className="flex-shrink-0 h-12 w-12 mt-6" onClick={() => setIsDocCameraOpen(true)}>
                  <Camera className="h-6 w-6" />
                  <span className="sr-only">Ambil Foto Dokumen</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[625px]">
                <DialogHeader><DialogTitle>Ambil Foto Ijazah</DialogTitle></DialogHeader>
                <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" className="w-full h-auto rounded-md" />
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDocCameraOpen(false)}>Batal</Button>
                  <Button onClick={() => handleCapture('ijazahFile')}>Ambil Gambar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Section 3: Optional Documents */}
        <div className="pt-8 border-t">
          <h3 className="text-lg font-medium mb-2">Dokumen Tambahan (Opsional)</h3>
          <div className="space-y-4">
            {fields.map((item, index) => (
              <div key={item.id} className="flex items-end gap-4 p-4 border rounded-md">
                <FormField
                  control={control}
                  name={`optionalDocuments.${index}.name`}
                  render={({ field }) => (
                    <FormItem className="flex-grow">
                      <FormLabel>Nama Dokumen</FormLabel>
                      <FormControl><Input {...field} placeholder="Contoh: Kartu Keluarga" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name={`optionalDocuments.${index}.file`}
                  render={({ field }) => (
                    <FormItem className="flex-grow">
                      <FormLabel>File Dokumen</FormLabel>
                      <FormControl><Input type="file" onChange={(e) => field.onChange(e.target.files ? e.target.files[0] : null)} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="button" variant="danger" size="icon" onClick={() => remove(index)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={() => append({ name: '', file: undefined })}>
              <PlusCircle className="mr-2 h-4 w-4" /> Tambah Dokumen
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentStep;