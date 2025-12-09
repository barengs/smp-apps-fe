"use client";

import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import type { LeaveType } from '@/store/slices/leaveTypeApi';

interface TipeIzinFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: LeaveType | null;
  onSave: (data: {
    name: string;
    description: string;
    requires_approval: boolean;
    max_duration_days: number;
    is_active: boolean;
  }) => void;
}

const TipeIzinFormDialog: React.FC<TipeIzinFormDialogProps> = ({
  open,
  onOpenChange,
  initialData,
  onSave,
}) => {
  const [name, setName] = React.useState(initialData?.name ?? '');
  const [description, setDescription] = React.useState(initialData?.description ?? '');
  const [requiresApproval, setRequiresApproval] = React.useState(initialData?.requires_approval ?? true);
  const [maxDurationDays, setMaxDurationDays] = React.useState<number>(initialData?.max_duration_days ?? 1);
  const [isActive, setIsActive] = React.useState(initialData?.is_active ?? true);

  React.useEffect(() => {
    setName(initialData?.name ?? '');
    setDescription(initialData?.description ?? '');
    setRequiresApproval(initialData?.requires_approval ?? true);
    setMaxDurationDays(initialData?.max_duration_days ?? 1);
    setIsActive(initialData?.is_active ?? true);
  }, [initialData, open]);

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      description: description.trim(),
      requires_approval: requiresApproval,
      max_duration_days: Number(maxDurationDays) || 0,
      is_active: isActive,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Tipe Izin' : 'Tambah Tipe Izin'}</DialogTitle>
          <DialogDescription>
            {initialData ? 'Ubah detail tipe izin.' : 'Isi detail untuk menambahkan tipe izin baru.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm mb-1">Nama</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Contoh: Izin Keluarga" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm mb-1">Deskripsi</label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Keterangan singkat" />
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={requiresApproval} onCheckedChange={setRequiresApproval} />
            <span className="text-sm">Butuh Persetujuan</span>
          </div>
          <div>
            <label className="block text-sm mb-1">Durasi Maks (hari)</label>
            <Input type="number" value={maxDurationDays} onChange={(e) => setMaxDurationDays(parseInt(e.target.value || '0', 10))} />
          </div>
          <div className="flex items-center gap-3">
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

export default TipeIzinFormDialog;