"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UploadCloud, Camera } from 'lucide-react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { SantriFormValues } from '../form-schemas';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogClose, DialogDescription } from '@/components/ui/dialog'; // Import DialogDescription
import { showError } from '@/utils/toast';

interface EducationStepProps {
  form: any;
}

const EducationStep: React.FC<EducationStepProps> = ({ form }) => {
  const { control, watch, setValue } = useFormContext<SantriFormValues>();
  const [preview, setPreview] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isVideoReady, setIsVideoReady] = useState(false); // New state for video readiness
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const fotoSantriFile = watch('fotoSantri');

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

  // Cleanup stream on component unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const handleOpenCamera = async () => {
    setIsVideoReady(false); // Reset video readiness when opening camera
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        // Listen for 'playing' event to ensure video is actually streaming
        videoRef.current.onplaying = () => {
          setIsVideoReady(true);
        };
        videoRef.current.play().catch(err => {
          console.error("Error playing video:", err);
          showError("Gagal memutar video kamera. Coba lagi.");
          handleCloseCamera();
        });
      }
      setIsCameraOpen(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
      showError("Tidak dapat mengakses kamera. Pastikan Anda telah memberikan izin.");
      setIsCameraOpen(false);
    }
  };

  const handleCloseCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setStream(null);
    setIsCameraOpen(false);
    setIsVideoReady(false); // Reset video readiness when closing camera
  };

  const handleCapturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!isVideoReady || !video || !canvas) { // Check isVideoReady before proceeding
      showError("Video stream belum siap. Mohon tunggu sebentar atau coba lagi.");
      console.error("Video stream not ready for capture.");
      return;
    }

    // Ensure video dimensions are available
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      showError("Video stream tidak memiliki dimensi yang valid. Coba lagi.");
      console.error("Video dimensions are 0, cannot capture.");
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    
    if (!context) {
      showError("Gagal mendapatkan konteks 2D dari kanvas.");
      console.error("Canvas context is null.");
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
        setValue('fotoSantri', file, { shouldValidate: true });
        handleCloseCamera(); 
      } else {
        console.error("Failed to create blob from canvas.");
        showError("Gagal mengambil gambar. Coba lagi.");
      }
    }, 'image/jpeg');
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
                <Dialog open={isCameraOpen} onOpenChange={(open) => !open && handleCloseCamera()}>
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline" className="w-full" onClick={handleOpenCamera}>
                      <Camera className="mr-2 h-4 w-4" />
                      Ambil Foto dari Kamera
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[625px]">
                    <DialogHeader>
                      <DialogTitle>Ambil Foto</DialogTitle>
                      <DialogDescription>Posisikan wajah Anda di tengah dan klik 'Ambil Gambar'.</DialogDescription> {/* Added DialogDescription */}
                    </DialogHeader>
                    <div className="flex flex-col items-center">
                      <video ref={videoRef} autoPlay playsInline className="w-full h-auto rounded-md bg-muted" />
                      <canvas ref={canvasRef} className="hidden" />
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={handleCloseCamera}>Batal</Button>
                      <Button onClick={handleCapturePhoto} disabled={!isVideoReady}>Ambil Gambar</Button> {/* Disable if video not ready */}
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