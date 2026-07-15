"use client";

import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import type { SanctionType } from '@/store/slices/sanctionTypeApi';

interface JenisSanksiFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: SanctionType | null;
  onSave: (data: {
    name: string;
    description: string;
    is_active: boolean;
  }) => void;
}

const JenisSanksiFormDialog: React.FC<JenisSanksiFormDialogProps> = ({
  open,
  onOpenChange,
  initialData,
  onSave,
}) => {
  const [name, setName] = React.useState(initialData?.name ?? '');
  const [description, setDescription] = React.useState(initialData?.description ?? '');
  const [isActive, setIsActive] = React.useState(initialData?.is_active ?? true);

  React.useEffect(() => {
    setName(initialData?.name ?? '');
    setDescription(initialData?.description ?? '');
    setIsActive(initialData?.is_active ?? true);
  }, [initialData, open]);

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      description: description.trim(),
      is_active: isActive,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Jenis Sanksi' : 'Tambah Jenis Sanksi'}</DialogTitle>
          <DialogDescription>
            {initialData ? 'Ubah detail jenis sanksi.' : 'Isi detail untuk menambahkan jenis sanksi baru.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm mb-1">Nama</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Contoh: Pembinaan" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm mb-1">Deskripsi</label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Keterangan singkat" />
          </div>
          <div className="md:col-span-2 flex items-center gap-3">
            <Switch checked={isActive} onCheckedChange={setIsActive} />
            <span className="text-sm">Aktif</span>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit}>{initialData ? 'Simpan Perubahan' : 'Tambah'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default JenisSanksiFormDialog;