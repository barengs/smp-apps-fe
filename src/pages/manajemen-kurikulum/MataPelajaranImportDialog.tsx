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
import { useImportStudiesMutation } from '@/store/slices/studyApi';
import { showSuccess, showError } from '@/utils/toast';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { Download } from 'lucide-react';

interface MataPelajaranImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const MataPelajaranImportDialog: React.FC<MataPelajaranImportDialogProps> = ({ isOpen, onClose }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importStudies, { isLoading }] = useImportStudiesMutation();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.type === 'application/vnd.ms-excel') {
        setSelectedFile(file);
      } else {
        showError('Format file tidak valid. Harap unggah file Excel (.xlsx atau .xls).');
        setSelectedFile(null);
        if (event.target) {
            event.target.value = '';
        }
      }
    }
  };

  const handleDownloadTemplate = () => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    const templateUrl = `${baseUrl}/master/study/import/template`;
    
    window.open(templateUrl, '_blank');
  };

  const handleImport = async () => {
    if (!selectedFile) {
      showError('Silakan pilih file untuk diimpor.');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const result = await importStudies(formData).unwrap();
      showSuccess(result.message || 'Data mata pelajaran berhasil diimpor.');
      onClose();
    } catch (err) {
      const fetchError = err as FetchBaseQueryError;
      const errorMessage = (fetchError.data as { message?: string })?.message || 'Gagal mengimpor data.';
      showError(errorMessage);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Impor Data Mata Pelajaran</DialogTitle>
          <DialogDescription>
            Pilih file Excel untuk mengimpor data mata pelajaran secara massal. Pastikan format file sesuai dengan template yang disediakan.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex flex-col space-y-2">
            <Label>Langkah 1: Unduh Template</Label>
            <Button variant="info" onClick={handleDownloadTemplate}>
              <Download className="mr-2 h-4 w-4" />
              Unduh Template Excel
            </Button>
          </div>
          <div className="flex flex-col space-y-2">
            <Label htmlFor="excel-file">Langkah 2: Unggah File</Label>
            <Input
              id="excel-file"
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileChange}
              className="cursor-pointer"
            />
            {selectedFile && <p className="text-sm text-muted-foreground">File dipilih: {selectedFile.name}</p>}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Batal
          </Button>
          <Button onClick={handleImport} variant="success" disabled={!selectedFile || isLoading}>
            {isLoading ? 'Mengimpor...' : 'Impor Data'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MataPelajaranImportDialog;