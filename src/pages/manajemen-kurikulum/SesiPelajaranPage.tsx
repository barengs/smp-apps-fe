import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import CustomBreadcrumb, { type BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { BookCopy, Sun, MoreHorizontal } from 'lucide-react';
import { DataTable } from '@/components/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import * as toast from '@/utils/toast';
import { 
  useGetLessonSessionsQuery, 
  useAddLessonSessionMutation, 
  useUpdateLessonSessionMutation, 
  useDeleteLessonSessionMutation,
  type LessonSession
} from '@/store/slices/lessonSessionApi';
import TableLoadingSkeleton from '@/components/TableLoadingSkeleton';

const SesiPelajaranPage: React.FC = () => {
  const { t } = useTranslation();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<LessonSession | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [order, setOrder] = useState<number>(1);
  const [isActive, setIsActive] = useState(true);

  // API Hooks
  const { data: sessions, isLoading, isError } = useGetLessonSessionsQuery();
  const [addSession, { isLoading: isAdding }] = useAddLessonSessionMutation();
  const [updateSession, { isLoading: isUpdating }] = useUpdateLessonSessionMutation();
  const [deleteSession] = useDeleteLessonSessionMutation();

  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: t('sidebar.curriculum'), href: '/dashboard/manajemen-kurikulum', icon: <BookCopy className="h-4 w-4" /> },
    { label: 'Sesi Pelajaran', icon: <Sun className="h-4 w-4" /> },
  ];

  const columns: ColumnDef<LessonSession>[] = [
    {
      accessorKey: 'name',
      header: 'Nama Sesi',
    },
    {
      accessorKey: 'description',
      header: 'Deskripsi',
      cell: ({ row }) => row.getValue('description') || '-',
    },
    {
      accessorKey: 'order',
      header: 'Urutan',
    },
    {
      accessorKey: 'is_active',
      header: 'Status',
      cell: ({ row }) => (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${row.getValue('is_active') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {row.getValue('is_active') ? 'Aktif' : 'Tidak Aktif'}
        </span>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const session = row.original;
        return (
          <div className="text-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Buka menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleOpenForm(session)}>
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDelete(session)} className="text-destructive">
                  Hapus
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
      size: 100,
    },
  ];

  const handleOpenForm = (session?: LessonSession) => {
    if (session) {
      setEditingSession(session);
      setName(session.name);
      setDescription(session.description || '');
      setOrder(session.order);
      setIsActive(session.is_active);
    } else {
      setEditingSession(null);
      setName('');
      setDescription('');
      setOrder(1);
      setIsActive(true);
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingSession(null);
  };

  const handleSubmit = async () => {
    if (!name) {
      toast.showError('Nama sesi wajib diisi');
      return;
    }

    const payload = {
      name,
      description,
      order,
      is_active: isActive,
    };

    try {
      if (editingSession) {
        await updateSession({ ...payload, id: editingSession.id }).unwrap();
        toast.showSuccess('Sesi pelajaran berhasil diperbarui');
      } else {
        await addSession(payload).unwrap();
        toast.showSuccess('Sesi pelajaran berhasil ditambahkan');
      }
      handleCloseForm();
    } catch (error: any) {
      toast.showError(error?.data?.message || 'Terjadi kesalahan saat menyimpan data');
    }
  };

  const handleDelete = async (row: LessonSession) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus sesi ${row.name}?`)) {
      try {
        await deleteSession(row.id).unwrap();
        toast.showSuccess('Sesi pelajaran berhasil dihapus');
      } catch (error: any) {
        toast.showError(error?.data?.message || 'Gagal menghapus sesi');
      }
    }
  };

  return (
    <DashboardLayout title="Sesi Pelajaran" role="administrasi">
      <div className="container mx-auto py-4 px-4">
        <CustomBreadcrumb items={breadcrumbItems} />
        <Card>
          <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Sesi Pelajaran</CardTitle>
              <CardDescription>Kelola master data sesi pelajaran (Pagi, Siang, Sore, dll).</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <TableLoadingSkeleton numRows={5} />
            ) : isError ? (
              <div className="text-center text-red-500 py-4">Gagal memuat data sesi pelajaran.</div>
            ) : (
              <DataTable
                columns={columns}
                data={sessions || []}
                exportFileName="SesiPelajaran"
                exportTitle="Sesi Pelajaran"
                onAddData={() => handleOpenForm()}
                addButtonLabel="Tambah Sesi"
              />
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSession ? 'Edit Sesi Pelajaran' : 'Tambah Sesi Pelajaran'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nama Sesi <span className="text-red-500">*</span></Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Misal: Pagi"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="order">Urutan <span className="text-red-500">*</span></Label>
              <Input
                id="order"
                type="number"
                value={order}
                onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Deskripsi sesi pelajaran..."
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
              <Label htmlFor="is_active">Aktif</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseForm}>{t('cancelButton')}</Button>
            <Button onClick={handleSubmit} disabled={isAdding || isUpdating}>
              {isAdding || isUpdating ? 'Menyimpan...' : t('saveChanges')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default SesiPelajaranPage;
