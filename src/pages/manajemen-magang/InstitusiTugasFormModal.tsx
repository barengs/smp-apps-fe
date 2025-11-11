"use client";

import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useTranslation } from 'react-i18next';
import * as toast from '@/utils/toast';

export type InstitusiTugas = {
  id: number;
  name: string;
  address?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  notes?: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  initialData?: InstitusiTugas | null;
  onSave: (data: InstitusiTugas) => void;
};

const InstitusiTugasFormModal: React.FC<Props> = ({ isOpen, onClose, initialData, onSave }) => {
  const { t } = useTranslation();
  const [name, setName] = React.useState(initialData?.name ?? '');
  const [address, setAddress] = React.useState(initialData?.address ?? '');
  const [contactPerson, setContactPerson] = React.useState(initialData?.contactPerson ?? '');
  const [phone, setPhone] = React.useState(initialData?.phone ?? '');
  const [email, setEmail] = React.useState(initialData?.email ?? '');
  const [notes, setNotes] = React.useState(initialData?.notes ?? '');

  React.useEffect(() => {
    setName(initialData?.name ?? '');
    setAddress(initialData?.address ?? '');
    setContactPerson(initialData?.contactPerson ?? '');
    setPhone(initialData?.phone ?? '');
    setEmail(initialData?.email ?? '');
    setNotes(initialData?.notes ?? '');
  }, [initialData, isOpen]);

  const handleSave = () => {
    if (!name.trim()) {
      toast.showError('Nama institusi wajib diisi.');
      return;
    }
    const payload: InstitusiTugas = {
      id: initialData?.id ?? Date.now(),
      name: name.trim(),
      address: address.trim() || undefined,
      contactPerson: contactPerson.trim() || undefined,
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      notes: notes.trim() || undefined,
    };
    onSave(payload);
    toast.showSuccess(initialData ? 'Institusi berhasil diperbarui.' : 'Institusi berhasil ditambahkan.');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Institusi Tugas' : 'Tambah Institusi Tugas'}</DialogTitle>
          <DialogDescription>
            Lengkapi informasi institusi tugas santri. Data disimpan sementara (tanpa koneksi backend).
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label>Nama Institusi</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="contoh: SMP Al-Falah" />
          </div>
          <div className="grid gap-2">
            <Label>Alamat</Label>
            <Textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Jl. Contoh No. 123, Kota" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Penanggung Jawab</Label>
              <Input value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} placeholder="Nama penanggung jawab" />
            </div>
            <div className="grid gap-2">
              <Label>No. Telepon</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08xxxxxxxxxx" />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@contoh.com" />
          </div>
          <div className="grid gap-2">
            <Label>Catatan</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Keterangan tambahan..." />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{t('lessonHoursForm.cancelButton')}</Button>
          <Button onClick={handleSave}>{t('lessonHoursForm.saveButton')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InstitusiTugasFormModal;