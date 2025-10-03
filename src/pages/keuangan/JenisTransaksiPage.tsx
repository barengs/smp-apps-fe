import React, { useState } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import CustomBreadcrumb from '@/components/CustomBreadcrumb';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useGetTransactionTypesQuery, useDeleteTransactionTypeMutation } from '@/store/slices/transactionTypeApi';
import { JenisTransaksiTable } from './JenisTransaksiTable';
import JenisTransaksiForm from './JenisTransaksiForm';
import { TransactionType } from '@/types/keuangan';
import TableLoadingSkeleton from '@/components/TableLoadingSkeleton';
import * as toast from '@/utils/toast';
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

const breadcrumbItems = [
  { label: 'Dashboard', href: '/dashboard/administrasi' },
  { label: 'Master Bank' },
  { label: 'Jenis Transaksi' },
];

const JenisTransaksiPage: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = useState(false);
  const [selectedTransactionType, setSelectedTransactionType] = useState<TransactionType | null>(null);
  const [transactionTypeIdToDelete, setTransactionTypeIdToDelete] = useState<number | null>(null);

  const { data: paginatedResponse, isLoading, isError, error } = useGetTransactionTypesQuery();
  const [deleteTransactionType, { isLoading: isDeleting }] = useDeleteTransactionTypeMutation();

  const handleAdd = () => {
    setSelectedTransactionType(null);
    setIsFormOpen(true);
  };

  const handleEdit = (transactionType: TransactionType) => {
    setSelectedTransactionType(transactionType);
    setIsFormOpen(true);
  };

  const handleDelete = (id: number) => {
    setTransactionTypeIdToDelete(id);
    setIsConfirmDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (transactionTypeIdToDelete) {
      try {
        await deleteTransactionType(transactionTypeIdToDelete).unwrap();
        toast.showSuccess('Jenis transaksi berhasil dihapus');
        setTransactionTypeIdToDelete(null);
      } catch (err) {
        toast.showError('Gagal menghapus jenis transaksi');
      } finally {
        setIsConfirmDeleteDialogOpen(false);
      }
    }
  };

  const transactionTypes = paginatedResponse?.data || [];

  return (
    <DashboardLayout title="Jenis Transaksi" role="administrasi">
      <CustomBreadcrumb items={breadcrumbItems} />
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Jenis Transaksi</CardTitle>
              <CardDescription>Kelola jenis-jenis transaksi yang tersedia di sistem.</CardDescription>
            </div>
            <Button onClick={handleAdd}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Tambah Jenis Transaksi
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableLoadingSkeleton />
          ) : isError ? (
            <p className="text-red-500">Terjadi kesalahan saat memuat data.</p>
          ) : (
            <JenisTransaksiTable data={transactionTypes} onEdit={handleEdit} onDelete={handleDelete} />
          )}
        </CardContent>
      </Card>

      <JenisTransaksiForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        transactionType={selectedTransactionType}
      />

      <AlertDialog open={isConfirmDeleteDialogOpen} onOpenChange={setIsConfirmDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Ini akan menghapus jenis transaksi secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default JenisTransaksiPage;