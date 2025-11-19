import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type AsramaDetailProps = {
  isOpen: boolean;
  onClose: () => void;
  asrama?: {
    id: number;
    name: string;
    description?: string;
    program?: { id?: number; name?: string };
    capacity?: number;
    headName?: string;
  };
};

const AsramaDetailModal: React.FC<AsramaDetailProps> = ({ isOpen, onClose, asrama }) => {
  const programName = asrama?.program?.name ?? '-';
  const headName = asrama?.headName ?? undefined;
  const capacity = asrama?.capacity ?? '-';
  const description = asrama?.description || '-';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Detail Asrama</DialogTitle>
          <DialogDescription>Informasi ringkas mengenai asrama yang dipilih.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1 text-sm text-muted-foreground">Nama Asrama</div>
            <div className="sm:col-span-2 font-medium">{asrama?.name ?? '-'}</div>

            <div className="sm:col-span-1 text-sm text-muted-foreground">Program</div>
            <div className="sm:col-span-2 font-medium">{programName}</div>

            <div className="sm:col-span-1 text-sm text-muted-foreground">Kepala</div>
            <div className="sm:col-span-2">
              {headName ? (
                <Badge className="font-medium">{headName}</Badge>
              ) : (
                <Badge variant="secondary" className="font-medium">Belum ada</Badge>
              )}
            </div>

            <div className="sm:col-span-1 text-sm text-muted-foreground">Kapasitas</div>
            <div className="sm:col-span-2 font-medium">{capacity}</div>

            <div className="sm:col-span-1 text-sm text-muted-foreground">Deskripsi</div>
            <div className="sm:col-span-2">{description}</div>
          </div>

          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose}>Tutup</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AsramaDetailModal;