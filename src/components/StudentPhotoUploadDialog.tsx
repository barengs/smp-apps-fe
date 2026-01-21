"use client";

import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { UploadCloud, Image as ImageIcon, Camera, RefreshCw } from 'lucide-react';
import { useUpdateStudentPhotoMutation } from '@/store/slices/studentApi';
import * as toast from '@/utils/toast';
import { compressImage } from '@/utils/imageCompression';
import Webcam from 'react-webcam';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface StudentPhotoUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: number;
  currentPhotoUrl?: string;
  onUploaded?: () => void;
}

// Utility to convert Data URL to File object
const dataURLtoFile = (dataurl: string, filename: string): File => {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
};

const StudentPhotoUploadDialog: React.FC<StudentPhotoUploadDialogProps> = ({
  open,
  onOpenChange,
  studentId,
  currentPhotoUrl,
  onUploaded,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [updatePhoto, { isLoading }] = useUpdateStudentPhotoMutation();
  
  // Camera states
  const [isCameraMode, setIsCameraMode] = useState(false);
  const webcamRef = useRef<Webcam>(null);
  const [cameraImage, setCameraImage] = useState<string | null>(null);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setPreviewUrl(null);
    }
  }, [file]);

  // Reset state on close
  useEffect(() => {
    if (!open) {
      setFile(null);
      setCameraImage(null);
      setIsCameraMode(false);
    }
  }, [open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    processFile(f);
    e.target.value = '';
  };

  const processFile = (f: File | null) => {
    if (f && !f.type.startsWith('image/')) {
      toast.showError('File harus berupa gambar.');
      return;
    }
    
    if (f) {
      const sizeKB = Math.round(f.size / 1024);
      if (sizeKB > 2048) {
        toast.showInfo('Ukuran foto besar, mengompresi...');
        compressImage(f, { maxSizeKB: 2048, maxWidth: 1600, maxHeight: 1600, quality: 0.9 })
          .then((compressed) => {
            const newSizeKB = Math.round(compressed.size / 1024);
            if (newSizeKB > 2048) {
              toast.showError(`Foto masih terlalu besar setelah kompres (${newSizeKB} KB). Coba pilih foto lain.`);
              setFile(null);
            } else {
              toast.showSuccess(`Foto dikompresi dari ${Math.round(sizeKB / 1024)} MB menjadi ${Math.round(newSizeKB / 1024)} MB.`);
              setFile(compressed);
            }
          })
          .catch(() => {
            toast.showError('Gagal mengompresi foto. Coba pilih foto lain.');
            setFile(null);
          });
      } else {
        setFile(f);
      }
    } else {
      setFile(null);
    }
  };

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCameraImage(imageSrc);
      const capturedFile = dataURLtoFile(imageSrc, `camera_capture_${Date.now()}.jpg`);
      processFile(capturedFile);
    }
  }, [webcamRef]);

  const retake = () => {
    setCameraImage(null);
    setFile(null);
  };

  const handleSubmit = async () => {
    if (!file) {
      toast.showError('Silakan pilih file foto atau ambil foto terlebih dahulu.');
      return;
    }
    await updatePhoto({ id: studentId, photo: file }).unwrap();
    toast.showSuccess('Foto santri berhasil diperbarui.');
    onOpenChange(false);
    setFile(null);
    setCameraImage(null);
    if (onUploaded) onUploaded();
  };

  const displayUrl = useMemo(() => previewUrl || currentPhotoUrl || null, [previewUrl, currentPhotoUrl]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Perbarui Foto Santri</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="upload" className="w-full" onValueChange={(val) => setIsCameraMode(val === 'camera')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload File</TabsTrigger>
            <TabsTrigger value="camera">Ambil Foto</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="space-y-4 p-4 border rounded-md mt-2">
            <div className="w-full flex items-center justify-center">
              <div className="border rounded-md overflow-hidden bg-muted relative" style={{ width: '200px', height: '266px' }}>
                {displayUrl ? (
                  <img src={displayUrl} alt="Preview Foto" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                    <ImageIcon className="h-10 w-10" />
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex gap-2 justify-center">
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="student-photo-input" />
              <Button variant="outline" type="button" onClick={() => document.getElementById('student-photo-input')?.click()}>
                <UploadCloud className="mr-2 h-4 w-4" />
                Pilih File
              </Button>
              {file && (
                <Button variant="ghost" type="button" onClick={() => setFile(null)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                  Hapus Foto
                </Button>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="camera" className="space-y-4 p-4 border rounded-md mt-2">
            <div className="w-full flex flex-col items-center justify-center space-y-4">
              <div className="border rounded-md overflow-hidden bg-black relative" style={{ width: '100%', maxWidth: '320px', aspectRatio: '3/4' }}>
                {cameraImage ? (
                  <img src={cameraImage} alt="Captured" className="h-full w-full object-cover" />
                ) : (
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{ facingMode: "user", aspectRatio: 0.75 }}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              
              <div className="flex gap-2 justify-center">
                {cameraImage ? (
                  <Button variant="outline" type="button" onClick={retake}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Ambil Ulang
                  </Button>
                ) : (
                  <Button variant="primary" type="button" onClick={capture}>
                    <Camera className="mr-2 h-4 w-4" />
                    Ambil Foto
                  </Button>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" type="button" onClick={() => onOpenChange(false)} disabled={isLoading}>Batal</Button>
          <Button variant="success" type="button" onClick={handleSubmit} disabled={isLoading || !file}>
            {isLoading ? 'Mengunggah...' : 'Simpan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StudentPhotoUploadDialog;