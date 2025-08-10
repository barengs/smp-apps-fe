import React, { useState, useMemo } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import CustomBreadcrumb from '@/components/CustomBreadcrumb';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Newspaper, PlusCircle, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import {
  useGetBeritaQuery,
  useCreateBeritaMutation,
  useUpdateBeritaMutation,
  useDeleteBeritaMutation,
} from '@/store/slices/beritaApi';
import { showSuccess, showError } from '@/utils/toast';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import BeritaForm from './BeritaForm';
import TableLoadingSkeleton from '@/components/TableLoadingSkeleton';
import type { Berita } from '@/types/informasi';

const BeritaPage: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [selectedBerita, setSelectedBerita] = useState<Berita | undefined>(undefined);

  const { data: beritaData, isLoading, isError, error } = useGetBeritaQuery();
  const [createBerita, { isLoading: isCreating }] = useCreateBeritaMutation();
  const [updateBerita, { isLoading: isUpdating }] = useUpdateBeritaMutation();
  const [deleteBerita] = useDeleteBeritaMutation();

  const handleAdd = () => {
    setSelectedBerita(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (berita: Berita) => {
    setSelectedBerita(berita);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (berita: Berita) => {
    setSelectedBerita(berita);
    setIsConfirmDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedBerita) return;
    try {
      await deleteBerita(selectedBerita.id).unwrap();
      showSuccess(`Berita "${selectedBerita.title}" berhasil dihapus.`);
      setIsConfirmDeleteOpen(false);
      setSelectedBerita(undefined);
    } catch (err) {
      showError('Gagal menghapus berita.');
      console.error(err);
    }
  };

  const handleFormSubmit = async (formData: FormData) => {
    try {
      if (selectedBerita) {
        // Gunakan POST dengan _method=PUT untuk update dengan file
        formData.append('_method', 'PUT');
        await updateBerita({ id: selectedBerita.id, data: formData }).unwrap();
        showSuccess('Berita berhasil diperbarui.');
      } else {
        await createBerita(formData).unwrap();
        showSuccess('Berita berhasil ditambahkan.');
      }
      setIsFormOpen(false);
      setSelectedBerita(undefined);
    } catch (err) {
      showError('Gagal menyimpan berita.');
      console.error(err);
    }
  };

  const columns = useMemo<ColumnDef<Berita>[]>(() => [
    {
      accessorKey: 'title',
      header: 'Judul',
      cell: ({ row }) => <div className="font-medium">{row.original.title}</div>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge variant={status === 'published' ? 'default' : 'secondary'}>
            {status === 'published' ? 'Published' : 'Draft'}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'created_at',
      header: 'Tanggal Dibuat',
      cell: ({ row }) => format(new Date(row.original.created_at), 'dd MMMM yyyy', { locale: id }),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const berita = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Buka menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleEdit(berita)}>
                <Pencil className="mr-2 h-4 w-4" />
                <span>Edit</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDeleteClick(berita)} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Hapus</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ], []);

  const breadcrumbItems = [
    { label: 'Informasi', icon: <Newspaper className="h-4 w-4" /> },
    { label: 'Berita' },
  ];

  if (isError) {
    return (
      <DashboardLayout title="Manajemen Berita" role="administrasi">
        <div className="text-center py-10 text-red-500">
          Error memuat data berita. Silakan coba lagi nanti.
          <pre>{JSON.stringify(error)}</pre>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Manajemen Berita" role="administrasi">
      <CustomBreadcrumb items={breadcrumbItems} />
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Daftar Berita</CardTitle>
              <CardDescription>Kelola berita dan pengumuman yang ditampilkan di sistem.</CardDescription>
            </div>
            <Button onClick={handleAdd}>
              <PlusCircle className="mr-2 h-4 w-4" /> Tambah Berita
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableLoadingSkeleton />
          ) : (
            <DataTable
              columns={columns}
              data={beritaData?.data || []}
              exportFileName="daftar_berita"
              exportTitle="Daftar Berita"
            />
          )}
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>{selectedBerita ? 'Edit Berita' : 'Tambah Berita Baru'}</DialogTitle>
            <DialogDescription>
              Isi detail berita di bawah ini. Klik simpan jika sudah selesai.
            </DialogDescription>
          </DialogHeader>
          <BeritaForm
            initialData={selectedBerita}
            onSuccess={handleFormSubmit}
            onCancel={() => setIsFormOpen(false)}
            isLoading={isCreating || isUpdating}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={isConfirmDeleteOpen} onOpenChange={setIsConfirmDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Ini akan menghapus berita secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default BeritaPage;