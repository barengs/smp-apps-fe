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
import { useImportEmployeeMutation } from '@/store/slices/employeeApi';
import * as toast from '@/utils/toast';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { Download } from 'lucide-react';

interface StaffImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const StaffImportDialog: React.FC<StaffImportDialogProps> = ({ open, onOpenChange, onSuccess }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importEmployee, { isLoading }] = useImportEmployeeMutation();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const validFileTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/vnd.ms-excel', // .xls
        'text/csv' // .csv
      ];

      if (validFileTypes.includes(file.type)) {
        setSelectedFile(file);
      } else {
        toast.showError('Format file tidak valid. Harap unggah file Excel (.xlsx atau .xls) atau CSV (.csv).');
        setSelectedFile(null);
        if (event.target) {
            event.target.value = '';
        }
      }
    }
  };

  const handleDownloadTemplate = () => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    const templateUrl = `${baseUrl}/employee/import/template`;
    
    window.open(templateUrl, '_blank');
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      toast.showError('Harap pilih file untuk diimpor.');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile, selectedFile.name);

    const toastId = toast.showLoading('Mengimpor data staf...');

    try {
      const result = await importEmployee(formData).unwrap();
      toast.dismissToast(toastId);
      toast.showSuccess(result.message || 'Data staf berhasil diimpor.');
      onSuccess();
    } catch (err) {
      toast.dismissToast(toastId);
      const fetchError = err as FetchBaseQueryError;
      const errorMessage = (fetchError.data as { message?: string })?.message || 'Gagal mengimpor data.';
      toast.showError(errorMessage);
    } finally {
        handleClose();
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onInteractOutside={handleClose} onEscapeKeyDown={handleClose}>
        <DialogHeader>
          <DialogTitle>Impor Data Staf</DialogTitle>
          <DialogDescription>
            Unggah file Excel atau CSV untuk mengimpor data staf secara massal. Pastikan format file sesuai dengan template yang disediakan.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex flex-col space-y-2">
            <Label>Langkah 1: Unduh Template</Label>
            <Button variant="outline" onClick={handleDownloadTemplate}>
              <Download className="mr-2 h-4 w-4" />
              Unduh Template Excel
            </Button>
          </div>
          <div className="flex flex-col space-y-2">
            <Label htmlFor="excel-file">Langkah 2: Unggah File</Label>
            <Input
              id="excel-file"
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileChange}
              className="cursor-pointer"
            />
            {selectedFile && <p className="text-sm text-muted-foreground">File dipilih: {selectedFile.name}</p>}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Batal</Button>
          <Button onClick={handleSubmit} disabled={!selectedFile || isLoading}>
            {isLoading ? 'Mengimpor...' : 'Impor Data'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StaffImportDialog;