"use client";

import React, { useRef, useState, useCallback } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UploadCloud, Image as ImageIcon, X } from 'lucide-react';
import * as toast from '@/utils/toast';

interface PhotoDropzoneProps {
  value?: string | File | null;
  onChange: (file: File | null) => void;
}

const PhotoDropzone: React.FC<PhotoDropzoneProps> = ({ value, onChange }) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.showError('File harus berupa gambar.');
      return;
    }
    onChange(file);
    toast.showSuccess('Foto berhasil dipilih.');
  };

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  }, []);

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
    e.target.value = '';
  };

  const clearPhoto = () => {
    onChange(null);
    toast.showSuccess('Foto dihapus.');
  };

  // Generate preview URL
  const previewUrl = React.useMemo(() => {
    if (!value) return null;
    if (typeof value === 'string') return value;
    return URL.createObjectURL(value);
  }, [value]);

  // Cleanup object URL
  React.useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <Card className="border-dashed">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Foto Profil</CardTitle>
        <CardDescription>Tarik & letakkan gambar ke area ini atau pilih file.</CardDescription>
      </CardHeader>
      <CardContent>
        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          className={`group relative w-full rounded-md border ${isDragOver ? 'border-blue-500 bg-blue-50' : 'border-muted'} flex items-center justify-center overflow-hidden`}
        >
          {previewUrl ? (
            <div className="flex items-center justify-center py-4">
              <div
                className="rounded-md shadow-sm border border-muted"
                style={{ width: '4cm', height: '6cm' }}
              >
                <img
                  src={previewUrl}
                  alt="Preview Foto"
                  className="h-full w-full object-cover rounded-md"
                />
              </div>
            </div>
          ) : (
            <div className="flex h-48 w-full flex-col items-center justify-center text-center">
              <ImageIcon className="mb-2 h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Belum ada foto.</p>
              <p className="text-xs text-muted-foreground">Unggah gambar dengan drag & drop atau tekan tombol pilih file.</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onFileChange}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
        >
          <UploadCloud className="mr-2 h-4 w-4" />
          Pilih File
        </Button>
        {value && (
          <Button type="button" variant="ghost" onClick={clearPhoto} className="text-red-600 hover:text-red-700 hover:bg-red-50">
            <X className="mr-2 h-4 w-4" />
            Hapus Foto
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default PhotoDropzone;