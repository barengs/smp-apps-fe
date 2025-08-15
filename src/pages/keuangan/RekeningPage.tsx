import React, { useState } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import CustomBreadcrumb, { BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Landmark, Wallet } from 'lucide-react';
import { useGetAccountsQuery, useDeleteAccountMutation } from '@/store/slices/accountApi';
import TableLoadingSkeleton from '@/components/TableLoadingSkeleton';
import { RekeningTable } from './RekeningTable';
import RekeningForm from './RekeningForm';
import { Account } from '@/types/keuangan';
import * as toast from '@/utils/toast';

const RekeningPage: React.FC = () => {
  const { data: accountData, isLoading, isError, refetch } = useGetAccountsQuery();
  const [deleteAccount, { isLoading: isDeleting }] = useDeleteAccountMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | undefined>(undefined);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);

  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: 'Bank Santri', href: '/dashboard/bank-santri/transaksi', icon: <Landmark className="h-4 w-4" /> },
    { label: 'Rekening', icon: <Wallet className="h-4 w-4" /> },
  ];

  const handleAddData = () => {
    setEditingAccount(undefined);
    setIsModalOpen(true);
  };

  const handleEditData = (account: Account) => {
    setEditingAccount(account);
    setIsModalOpen(true);
  };

  const handleDeleteData = (account: Account) => {
    setAccountToDelete(account);
    setIsConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (accountToDelete) {
      try {
        await deleteAccount(accountToDelete.id).unwrap();
        toast.showSuccess('Rekening berhasil dihapus.');
        setIsConfirmDeleteOpen(false);
        setAccountToDelete(null);
      } catch (err) {
        toast.showError('Gagal menghapus rekening.');
      }
    }
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    setEditingAccount(undefined);
    refetch();
  };

  return (
    <DashboardLayout title="Manajemen Rekening" role="administrasi">
      <CustomBreadcrumb items={breadcrumbItems} />
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Daftar Rekening</CardTitle>
              <CardDescription>Kelola semua rekening yang terdaftar di sistem.</CardDescription>
            </div>
            <Button onClick={handleAddData}>Tambah Rekening</Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableLoadingSkeleton numCols={6} />
          ) : isError || !accountData ? (
            <div className="text-center text-red-500">Gagal memuat data rekening.</div>
          ) : (
            <RekeningTable
              data={accountData.data}
              onEdit={handleEditData}
              onDelete={handleDeleteData}
            />
          )}
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingAccount ? 'Edit Rekening' : 'Tambah Rekening Baru'}</DialogTitle>
            <DialogDescription>
              {editingAccount ? 'Ubah detail rekening ini.' : 'Isi detail untuk rekening baru.'}
            </DialogDescription>
          </DialogHeader>
          <RekeningForm
            initialData={editingAccount}
            onSuccess={handleFormSuccess}
            onCancel={() => setIsModalOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={isConfirmDeleteOpen} onOpenChange={setIsConfirmDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Penghapusan</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus rekening nomor {accountToDelete?.account_number}? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} disabled={isDeleting}>
              {isDeleting ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default RekeningPage;