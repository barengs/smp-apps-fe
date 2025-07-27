"use client";

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Kegiatan } from '@/types/kegiatan';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';

interface ActivityDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  kegiatan: Kegiatan | null;
}

const ActivityDetailModal: React.FC<ActivityDetailModalProps> = ({ isOpen, onClose, kegiatan }) => {
  if (!kegiatan) {
    return null; // Don't render if no activity is provided
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{kegiatan.name}</DialogTitle>
          <DialogDescription>Detail Kegiatan</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-sm font-medium col-span-1">Tanggal:</span>
            <span className="col-span-3">{format(kegiatan.date, 'PPP', { locale: id })}</span>
          </div>
          {kegiatan.description && (
            <div className="grid grid-cols-4 items-start gap-4">
              <span className="text-sm font-medium col-span-1">Deskripsi:</span>
              <span className="col-span-3 text-justify">{kegiatan.description}</span>
            </div>
          )}
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-sm font-medium col-span-1">Status:</span>
            <Badge variant={kegiatan.status === 'Selesai' ? 'default' : 'secondary'} className="col-span-3 w-fit">
              {kegiatan.status}
            </Badge>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ActivityDetailModal;