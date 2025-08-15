import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { useGetAccountsQuery, useCreateAccountMutation, useUpdateAccountMutation, useDeleteAccountMutation } from '@/store/slices/accountApi';
import { RekeningTable } from './RekeningTable';
import { RekeningForm } from './RekeningForm';
import { Account, CreateUpdateAccountRequest } from '@/types/keuangan';
import * as toast from '@/utils/toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import TableLoadingSkeleton from '@/components/TableLoadingSkeleton';

const RekeningPage: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  
  const { data: accountsData, isLoading: isGetLoading, isError } = useGetAccountsQuery();
  const [createAccount, { isLoading: isCreateLoading }] = useCreateAccountMutation();
  const [updateAccount, { isLoading: isUpdateLoading }] = useUpdateAccountMutation();
  const [deleteAccount] = useDeleteAccountMutation();

  const handleFormOpen = (account?: Account) => {
    setSelectedAccount(account || null);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setSelectedAccount(null);
    setIsFormOpen(false);
  };

  const handleDeleteConfirmOpen = (account: Account) => {
    setSelectedAccount(account);
    setIsConfirmOpen(true);
  };

  const handleDeleteConfirmClose = () => {
    setSelectedAccount(null);
    setIsConfirmOpen(false);
  };

  const handleSubmit = async (data: Partial<CreateUpdateAccountRequest>) => {
    try {
      if (selectedAccount) {
        await updateAccount({ accountNumber: selectedAccount.account_number, data }).unwrap();
        toast.showSuccess('Rekening berhasil diperbarui.');
      } else {
        await createAccount(data as CreateUpdateAccountRequest).unwrap();
        toast.showSuccess('Rekening berhasil ditambahkan.');
      }
      handleFormClose();
    } catch (err) {
      toast.showError('Terjadi kesalahan saat menyimpan rekening.');
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (selectedAccount) {
      try {
        await deleteAccount(selectedAccount.account_number).unwrap();
        toast.showSuccess('Rekening berhasil dihapus.');
        handleDeleteConfirmClose();
      } catch (err) {
        toast.showError('Terjadi kesalahan saat menghapus rekening.');
        console.error(err);
      }
    }
  };

  return (
    <DashboardLayout title="Manajemen Rekening" role="administrasi">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Daftar Rekening</h1>
        <Button onClick={() => handleFormOpen()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Tambah Rekening
        </Button>
      </div>
      
      {isGetLoading ? (
        <TableLoadingSkeleton />
      ) : isError ? (
        <div className="text-red-500 text-center my-4">Gagal memuat data rekening. Silakan coba lagi.</div>
      ) : (
        <RekeningTable 
          data={accountsData?.data || []} 
          onEdit={handleFormOpen} 
          onDelete={handleDeleteConfirmOpen} 
        />
      )}

      <RekeningForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSubmit={handleSubmit}
        initialData={selectedAccount}
        isLoading={isCreateLoading || isUpdateLoading}
      />

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Ini akan menghapus rekening secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteConfirmClose}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default RekeningPage;