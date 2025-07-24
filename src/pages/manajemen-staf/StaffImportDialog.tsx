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
import { Download, UploadCloud } from 'lucide-react';
import { showSuccess, showError, showLoading, dismissToast } from '@/utils/toast'; // Updated import

interface StaffImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const StaffImportDialog: React.FC<StaffImportDialogProps> = ({ isOpen, onClose, onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };

  const handleDownloadTemplate = () => {
    const headers = ["first_name", "last_name", "email", "role_names"];
    const exampleRow = ["Budi", "Santoso", "budi.s@example.com", "Guru,Keamanan"];
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + exampleRow.join(",") + "\n";
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "template_import_staf.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSuccess("Template berhasil diunduh."); // Updated call
  };

  const handleImport = async () => {
    if (!file) {
      showError('Silakan pilih file untuk diimpor.'); // Updated call
      return;
    }

    const loadingToast = showLoading('Mengimpor data staf...'); // Updated call
    setIsImporting(true);

    // Simulasi panggilan API untuk impor
    // Di aplikasi nyata, Anda akan menggunakan FormData untuk mengirim file ke endpoint API khusus.
    // const formData = new FormData();
    // formData.append('file', file);
    // await importStaffMutation(formData).unwrap();
    
    setTimeout(() => {
      setIsImporting(false);
      dismissToast(loadingToast); // Updated call
      showSuccess('Data staf berhasil diimpor! (Simulasi)'); // Updated call
      onSuccess();
      setFile(null); // Reset input file
    }, 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Impor Data Staf</DialogTitle>
          <DialogDescription>
            Unggah file CSV untuk mengimpor data staf. Untuk kolom 'role_names', pisahkan beberapa peran dengan koma.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="file-upload">Pilih File CSV</Label>
            <Input id="file-upload" type="file" accept=".csv" onChange={handleFileChange} />
            {file && <p className="text-sm text-muted-foreground mt-1">File dipilih: {file.name}</p>}
          </div>
          <div>
            <Button variant="link" className="p-0 h-auto text-sm" onClick={handleDownloadTemplate}>
              <Download className="mr-2 h-4 w-4" />
              Unduh Template
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isImporting}>Batal</Button>
          <Button onClick={handleImport} disabled={isImporting || !file}>
            {isImporting ? 'Mengimpor...' : <><UploadCloud className="mr-2 h-4 w-4" /> Impor</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StaffImportDialog;