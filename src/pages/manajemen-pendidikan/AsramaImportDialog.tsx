import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useImportHostelsMutation } from '@/store/slices/hostelApi';
import { showSuccess, showError } from '@/utils/toast';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

interface AsramaImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const AsramaImportDialog: React.FC<AsramaImportDialogProps> = ({ isOpen, onClose }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importHostels, { isLoading }] = useImportHostelsMutation();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      showError('Silakan pilih file untuk diimpor.');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      await importHostels(formData).unwrap();
      showSuccess('Data asrama berhasil diimpor.');
      onClose();
    } catch (err) {
      const fetchError = err as FetchBaseQueryError;
      const errorMessage = (fetchError.data as { message?: string })?.message || 'Gagal mengimpor data.';
      showError(errorMessage);
    }
  };

  const API_BASE_URL = 'https://api.smp.barengsaya.com';
  const TEMPLATE_DOWNLOAD_URL = `${API_BASE_URL}/master/hostel/import/template`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Impor Data Asrama</DialogTitle>
          <DialogDescription>
            Pilih file Excel untuk mengimpor data asrama secara massal. Pastikan format file sesuai dengan template yang disediakan.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="file">File Excel (.xlsx, .xls)</Label>
            <Input id="file" type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
          </div>
          <div>
            <a
              href={TEMPLATE_DOWNLOAD_URL}
              download
              className="text-sm text-blue-600 hover:underline"
            >
              Unduh Template Impor
            </a>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Batal
          </Button>
          <Button onClick={handleImport} disabled={!selectedFile || isLoading}>
            {isLoading ? 'Mengimpor...' : 'Impor Data'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AsramaImportDialog;