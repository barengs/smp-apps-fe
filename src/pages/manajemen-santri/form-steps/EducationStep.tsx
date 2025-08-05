"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import Webcam from 'react-webcam';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { UploadCloud, Camera } from 'lucide-react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { SantriFormValues } from '../form-schemas';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { showError } from '@/utils/toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetEducationLevelsQuery } from '@/store/slices/educationApi';

interface EducationStepProps {
  // form: any; // Dihapus karena menggunakan useFormContext
}

const EducationStep: React.FC<EducationStepProps> = () => { // Menghapus { form }
  const { control, watch, setValue } = useFormContext<SantriFormValues>();
  const [preview, setPreview] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const webcamRef = useRef<Webcam>(null);

  const fotoSantriFile = watch('fotoSantri');

  // Fetch education levels
  const { data: educationLevelsResponse, isLoading: isLoadingEducationLevels, isError: isErrorEducationLevels } = useGetEducationLevelsQuery();
  const educationLevels = educationLevelsResponse?.data || [];

  useEffect(() => {
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

  // Helper function to convert base64 data URL to a File object
  const dataURLtoFile = (dataurl: string, filename: string): File | null => {
    const arr = dataurl.split(',');
    if (arr.length < 2) { return null; }
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) { return null; }
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const handleCapturePhoto = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        const img = new Image();
        img.src = imageSrc;
        img.onload = () => {
          const video = webcamRef.current?.video;
          if (!video) {
            showError("Gagal mengakses stream video.");
            return;
          }

          const videoWidth = video.videoWidth;
          const videoHeight = video.videoHeight;

          // Target aspect ratio for 3x4 photo (width:height)
          const targetAspectRatio = 3 / 4;

          let croppedWidth, croppedHeight, sx, sy;

          // Determine the largest 3:4 rectangle that fits within the video feed
          if (videoWidth / videoHeight > targetAspectRatio) {
            // Video is wider than 3:4, limit by height
            croppedHeight = videoHeight;
            croppedWidth = croppedHeight * targetAspectRatio;
            sx = (videoWidth - croppedWidth) / 2;
            sy = 0;
          } else {
            // Video is taller or equal to 3:4, limit by width
            croppedWidth = videoWidth;
            croppedHeight = croppedWidth / targetAspectRatio;
            sx = 0;
            sy = (videoHeight - croppedHeight) / 2;
          }

          const canvas = document.createElement('canvas');
          canvas.width = croppedWidth;
          canvas.height = croppedHeight;
          const ctx = canvas.getContext('2d');

          if (ctx) {
            ctx.drawImage(img, sx, sy, croppedWidth, croppedHeight, 0, 0, croppedWidth, croppedHeight);
            const croppedImageSrc = canvas.toDataURL('image/jpeg');
            const file = dataURLtoFile(croppedImageSrc, `capture-${Date.now()}.jpg`);
            if (file) {
              setValue('fotoSantri', file, { shouldValidate: true });
              setIsCameraOpen(false); // Close dialog on capture
            } else {
              showError("Gagal mengonversi gambar yang dipotong. Coba lagi.");
            }
          } else {
            showError("Gagal membuat konteks kanvas.");
          }
        };
        img.onerror = () => {
          showError("Gagal memuat gambar dari kamera.");
        };
      } else {
        showError("Gagal mengambil gambar. Coba lagi.");
      }
    }
  }, [webcamRef, setValue]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Langkah 3: Informasi Pendidikan & Foto</CardTitle>
          <CardDescription>Isi informasi pendidikan terakhir dan unggah pas foto santri.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Data Pendidikan & Identitas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                name="certificateNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nomor Ijazah</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Contoh: 001/IJZ/SMP/2023" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                    <Select onValueChange={field.onChange} value={field.value === '' ? undefined : field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih jenjang pendidikan" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingEducationLevels && (
                          <SelectItem value="loading" disabled>Memuat jenjang pendidikan...</SelectItem>
                        )}
                        {isErrorEducationLevels && (
                          <SelectItem value="error" disabled>Gagal memuat data.</SelectItem>
                        )}
                        {!isLoadingEducationLevels && !isErrorEducationLevels && educationLevels.length === 0 && (
                          <SelectItem value="no-data" disabled>Tidak ada data jenjang pendidikan.</SelectItem>
                        )}
                        {educationLevels.map((level) => {
                          // Validasi untuk memastikan id adalah angka dan name tidak kosong
                          if (typeof level.id !== 'number' || isNaN(level.id) || !level.name || level.name.trim() === '') {
                            console.warn('Melewatkan jenjang pendidikan yang tidak valid (ID tidak valid atau nama kosong):', level);
                            return null; // Lewati rendering item ini
                          }
                          return (
                            <SelectItem key={level.id} value={level.id.toString()}>
                              {level.name}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
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
              <div className="flex-grow space-y-2">
                <FormField
                  control={control}
                  name="fotoSantri"
                  render={({ field }) => (
                    <FormItem>
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
                <Dialog open={isCameraOpen} onOpenChange={setIsCameraOpen}>
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline" className="w-full" onClick={() => setIsCameraOpen(true)}>
                      <Camera className="mr-2 h-4 w-4" />
                      Ambil Foto dari Kamera
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[625px]">
                    <DialogHeader>
                      <DialogTitle>Ambil Foto</DialogTitle>
                      <DialogDescription>Posisikan wajah Anda di tengah dan klik 'Ambil Gambar'.</DialogDescription>
                    </DialogHeader>
                    <div className="relative w-full bg-muted flex items-center justify-center rounded-md overflow-hidden">
                      <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        className="w-full h-auto"
                        videoConstraints={{
                          width: 1280,
                          height: 720,
                          facingMode: "user"
                        }}
                      />
                      {/* Center point indicators */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        {/* Plus sign */}
                        <div className="absolute w-6 h-px bg-white opacity-70" />
                        <div className="absolute h-6 w-px bg-white opacity-70" />
                        {/* Corner brackets */}
                        <div className="absolute top-0 left-0 w-1/4 h-1/4 border-l-2 border-t-2 border-white opacity-70" />
                        <div className="absolute top-0 right-0 w-1/4 h-1/4 border-r-2 border-t-2 border-white opacity-70" />
                        <div className="absolute bottom-0 left-0 w-1/4 h-1/4 border-l-2 border-b-2 border-white opacity-70" />
                        <div className="absolute bottom-0 right-0 w-1/4 h-1/4 border-r-2 border-b-2 border-white opacity-70" />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsCameraOpen(false)}>Batal</Button>
                      <Button onClick={handleCapturePhoto}>Ambil Gambar</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
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