"use client";

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download, Upload, FileSpreadsheet } from 'lucide-react';
import * as toast from '@/utils/toast';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImported?: () => void;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const WaliSantriImportDialog: React.FC<Props> = ({ open, onOpenChange, onImported }) => {
  const [file, setFile] = React.useState<File | null>(null);
  const [isDownloading, setIsDownloading] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);

  const base = React.useMemo(() => {
    const b = API_BASE_URL || '';
    return b.endsWith('/') ? b : `${b}/`;
  }, []);

  const getAuthHeader = () => {
    const token = localStorage.getItem('token') || '';
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const handleDownloadTemplate = async () => {
    setIsDownloading(true);
    try {
      const resp = await fetch(`${base}main/parent/import/template`, {
        method: 'GET',
        headers: {
          Accept: 'application/octet-stream',
          ...getAuthHeader(),
        },
      });
      if (!resp.ok) {
        throw new Error(`Gagal mengunduh template. Status: ${resp.status}`);
      }
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      // Gunakan nama dari header jika tersedia
      const cd = resp.headers.get('Content-Disposition') || '';
      const matched = cd.match(/filename\*?=(?:UTF-8'')?["']?([^"';]+)["']?/i);
      a.download = matched?.[1] || 'template-wali-santri.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.showSuccess('Template berhasil diunduh.');
    } catch (err) {
      console.error(err);
      toast.showError('Gagal mengunduh template. Silakan coba lagi.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.showError('Pilih file Excel/CSV terlebih dahulu.');
      return;
    }
    setIsUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const resp = await fetch(`${base}main/parent/import`, {
        method: 'POST',
        headers: {
          ...getAuthHeader(),
          // Biarkan browser set Content-Type untuk FormData
        } as any,
        body: form,
      });
      if (!resp.ok) {
        const txt = await resp.text().catch(() => '');
        throw new Error(txt || `Gagal mengunggah file. Status: ${resp.status}`);
      }
      toast.showSuccess('Impor wali santri berhasil.');
      onOpenChange(false);
      setFile(null);
      onImported?.();
    } catch (err) {
      console.error(err);
      toast.showError('Gagal mengunggah file. Pastikan format sesuai template.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!isUploading && !isDownloading) onOpenChange(v); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Impor Wali Santri</DialogTitle>
          <DialogDescription>Unggah file Excel (.xlsx) atau CSV sesuai template yang disediakan.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={handleDownloadTemplate} disabled={isDownloading}>
              <Download className="h-4 w-4 mr-2" />
              {isDownloading ? 'Mengunduh...' : 'Unduh Template'}
            </Button>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Pilih File</label>
            <Input
              type="file"
              accept=".xlsx,.csv"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            {file ? (
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                {file.name}
              </div>
            ) : (
              <div className="text-xs text-muted-foreground">Format yang didukung: .xlsx, .csv</div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isUploading || isDownloading}>
            Batal
          </Button>
          <Button type="button" onClick={handleUpload} disabled={!file || isUploading || isDownloading}>
            <Upload className="h-4 w-4 mr-2" />
            {isUploading ? 'Mengunggah...' : 'Unggah'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WaliSantriImportDialog;