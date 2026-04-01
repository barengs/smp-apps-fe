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
import { useImportHostelsMutation, useDownloadHostelTemplateMutation } from '@/store/slices/hostelApi';
import { showSuccess, showError, showLoading, dismissToast } from '@/utils/toast';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { Download } from 'lucide-react';

interface AsramaImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const AsramaImportDialog: React.FC<AsramaImportDialogProps> = ({ isOpen, onClose }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<{
    success_count: number;
    failure_count: number;
    errors: string[];
  } | null>(null);
  const [importHostels, { isLoading }] = useImportHostelsMutation();
  const [downloadTemplate, { isLoading: isDownloading }] = useDownloadHostelTemplateMutation();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      setImportResult(null);
    }
  };

  const handleDownloadTemplate = async () => {
    const loadingId = showLoading('Mengunduh template...');
    try {
      const blob = await downloadTemplate().unwrap();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'template_import_asrama.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showSuccess('Template berhasil diunduh');
    } catch (err) {
      showError('Gagal mengunduh template.');
      console.error(err);
    } finally {
      dismissToast(loadingId);
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
      const response = await importHostels(formData).unwrap();
      const successCount = response?.data?.success_count ?? 0;
      const failureCount = response?.data?.failure_count ?? 0;
      const errors = response?.data?.errors ?? [];

      setImportResult({
        success_count: successCount,
        failure_count: failureCount,
        errors: errors,
      });

      if (failureCount === 0) {
        showSuccess(`Import berhasil. Seluruh ${successCount} data telah diimpor.`);
        setSelectedFile(null);
        setTimeout(onClose, 1500);
      } else {
        showError(`Import selesai dengan ${failureCount} kesalahan.`);
      }
    } catch (err) {
      const fetchError = err as FetchBaseQueryError;
      const errorMessage = (fetchError.data as { message?: string })?.message || 'Gagal mengimpor data.';
      showError(errorMessage);
    }
  };

  const handleClose = () => {
    setImportResult(null);
    setSelectedFile(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Impor Data Asrama</DialogTitle>
          <DialogDescription>
            Pilih file Excel untuk mengimpor data asrama secara massal. Pastikan format file sesuai dengan template yang disediakan.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!importResult ? (
            <>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="file">File Excel (.xlsx, .xls, .csv)</Label>
                <Input 
                  id="file" 
                  type="file" 
                  accept=".xlsx, .xls, .csv" 
                  onChange={handleFileChange} 
                  disabled={isLoading}
                />
              </div>
              <div>
                <Button
                  variant="link"
                  className="p-0 h-auto text-blue-600 font-normal"
                  onClick={handleDownloadTemplate}
                  disabled={isDownloading}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Unduh Template Impor
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-muted p-3 rounded-md">
                <div className="text-sm font-medium">Hasil Import:</div>
                <div className="flex gap-3 text-sm">
                  <span className="text-green-600 font-semibold">Berhasil: {importResult.success_count}</span>
                  <span className="text-red-600 font-semibold">Gagal: {importResult.failure_count}</span>
                </div>
              </div>

              {importResult.errors.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-red-600 font-semibold">Daftar Kesalahan:</Label>
                  <div className="max-h-[200px] overflow-y-auto border rounded-md p-2 bg-red-50 text-xs font-mono space-y-1">
                    {importResult.errors.map((err, idx) => (
                      <div key={idx} className="border-b last:border-0 pb-1 text-red-700">
                        • {err}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => {
                  setImportResult(null);
                  setSelectedFile(null);
                }}
              >
                Coba Lagi / Pilih File Baru
              </Button>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Tutup
          </Button>
          {!importResult && (
            <Button onClick={handleImport} disabled={!selectedFile || isLoading}>
              {isLoading ? 'Mengimpor...' : 'Impor Data'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AsramaImportDialog;