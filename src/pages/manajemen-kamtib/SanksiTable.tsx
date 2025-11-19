"use client";

import React, { useMemo, useState } from 'react';
import { useGetSanctionsQuery, useDeleteSanctionMutation, Sanction } from '@/store/slices/sanctionApi';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Edit, Trash2, Plus } from 'lucide-react';
import SanksiForm from './SanksiForm';
import * as toast from '@/utils/toast';
import { Badge } from '@/components/ui/badge';

const SanksiTable: React.FC = () => {
  const { data, isLoading, error, refetch } = useGetSanctionsQuery();
  const [deleteSanction, { isLoading: isDeleting }] = useDeleteSanctionMutation();

  const sanctions: Sanction[] = useMemo(() => data ?? [], [data]);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Sanction | null>(null);

  const handleAdd = () => {
    setEditing(null);
    setOpen(true);
  };

  const handleEdit = (item: Sanction) => {
    setEditing(item);
    setOpen(true);
  };

  const handleDelete = async (item: Sanction) => {
    if (!confirm(`Hapus sanksi "${item.name}"?`)) return;
    try {
      await deleteSanction(item.id).unwrap();
      toast.showSuccess('Sanksi berhasil dihapus.');
    } catch {
      toast.showError('Gagal menghapus sanksi.');
    }
  };

  const onFormSuccess = () => {
    setOpen(false);
    setEditing(null);
    refetch();
  };

  const onFormCancel = () => {
    setOpen(false);
    setEditing(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Daftar Sanksi</h3>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Sanksi
        </Button>
      </div>

      {isLoading ? (
        <div className="text-sm text-muted-foreground">Memuat data sanksi...</div>
      ) : error ? (
        <div className="text-sm text-red-600">Gagal memuat data sanksi.</div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Jenis</TableHead>
                <TableHead>Durasi (hari)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead className="w-40">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sanctions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                    Tidak ada data.
                  </TableCell>
                </TableRow>
              ) : (
                sanctions.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="capitalize">{item.type}</TableCell>
                    <TableCell>{item.duration_days}</TableCell>
                    <TableCell>
                      {item.is_active ? (
                        <Badge variant="success">Aktif</Badge>
                      ) : (
                        <Badge variant="outline">Nonaktif</Badge>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[420px] truncate">{item.description}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" className="h-8 px-2 text-xs" onClick={() => handleEdit(item)}>
                          <Edit className="h-4 w-4 mr-1" /> Edit
                        </Button>
                        <Button
                          variant="outline-danger"
                          className="h-8 px-2 text-xs"
                          onClick={() => handleDelete(item)}
                          disabled={isDeleting}
                        >
                          <Trash2 className="h-4 w-4 mr-1" /> Hapus
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Sanksi' : 'Tambah Sanksi'}</DialogTitle>
          </DialogHeader>
          <SanksiForm initialData={editing} onSuccess={onFormSuccess} onCancel={onFormCancel} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SanksiTable;