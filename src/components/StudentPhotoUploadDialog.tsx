"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { UploadCloud, Image as ImageIcon } from 'lucide-react';
import { useUpdateStudentPhotoMutation } from '@/store/slices/studentApi';
import * as toast from '@/utils/toast';

interface StudentPhotoUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: number;
  currentPhotoUrl?: string;
  onUploaded?: () => void;
}

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    if (f && !f.type.startsWith('image/')) {
      toast.showError('File harus berupa gambar.');
      e.target.value = '';
      return;
    }
    setFile(f);
    e.target.value = '';
  };

  const handleSubmit = async () => {
    if (!file) {
      toast.showError('Silakan pilih file foto terlebih dahulu.');
      return;
    }
    await updatePhoto({ id: studentId, photo: file }).unwrap();
    toast.showSuccess('Foto santri berhasil diperbarui.');
    onOpenChange(false);
    setFile(null);
    if (onUploaded) onUploaded();
  };

  const displayUrl = useMemo(() => previewUrl || currentPhotoUrl || null, [previewUrl, currentPhotoUrl]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Perbarui Foto Santri</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="w-full flex items-center justify-center">
            <div className="border rounded-md overflow-hidden bg-muted" style={{ width: '200px', height: '266px' }}>
              {displayUrl ? (
                <img src={displayUrl} alt="Preview Foto" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                  <ImageIcon className="h-10 w-10" />
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2">
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
        </div>
        <DialogFooter>
          <Button variant="outline" type="button" onClick={() => onOpenChange(false)} disabled={isLoading}>Batal</Button>
          <Button variant="success" type="button" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Mengunggah...' : 'Simpan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StudentPhotoUploadDialog;