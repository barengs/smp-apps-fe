import React, { useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { RekeningTable } from './RekeningTable';
import { RekeningForm } from './RekeningForm';
import { useGetAccountsQuery, useCreateAccountMutation, useUpdateAccountMutation, useDeleteAccountMutation } from '@/store/slices/accountApi';
import { Account, CreateUpdateAccountRequest } from '@/types/keuangan';
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
} from '@/components/ui/alert-dialog';
import TableLoadingSkeleton from '@/components/TableLoadingSkeleton';
import CustomBreadcrumb, { type BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { Briefcase, Banknote } from 'lucide-react';

const RekeningPage: React.FC = () => {
  const { data: accounts, isLoading, isError, error } = useGetAccountsQuery(); // Data langsung berupa array
  const [createAccount, { isLoading: isCreating }] = useCreateAccountMutation();
  const [updateAccount, { isLoading: isUpdating }] = useUpdateAccountMutation();
  const [deleteAccount, { isLoading: isDeleting }] = useDeleteAccountMutation();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);

  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: 'Keuangan', href: '/dashboard/keuangan', icon: <Briefcase className="h-4 w-4" /> },
    { label: 'Rekening', icon: <Banknote className="h-4 w-4" /> },
  ];

  const handleAdd = () => {
    setSelectedAccount(null);
    setIsFormOpen(true);
  };

  const handleEdit = (account: Account) => {
    setSelectedAccount(account);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (account: Account) => {
    setAccountToDelete(account);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (accountToDelete) {
      try {
        await deleteAccount(accountToDelete.account_number).unwrap();
        toast.showSuccess('Rekening berhasil dihapus');
      } catch (err) {
        toast.showError('Gagal menghapus rekening');
      } finally {
        setIsDeleteDialogOpen(false);
        setAccountToDelete(null);
      }
    }
  };

  const handleFormSubmit = async (data: Partial<CreateUpdateAccountRequest>) => {
    try {
      if (selectedAccount) {
        await updateAccount({ accountNumber: selectedAccount.account_number, data }).unwrap();
        toast.showSuccess('Rekening berhasil diperbarui');
      } else {
        await createAccount(data as CreateUpdateAccountRequest).unwrap();
        toast.showSuccess('Rekening berhasil ditambahkan');
      }
      setIsFormOpen(false);
    } catch (err) {
      toast.showError('Gagal menyimpan rekening');
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Manajemen Rekening" role="administrasi">
        <div className="container mx-auto py-4 px-4">
          <CustomBreadcrumb items={breadcrumbItems} />
          <Card>
            <CardHeader>
              <CardTitle>Daftar Rekening</CardTitle>
            </CardHeader>
            <CardContent>
              <TableLoadingSkeleton numCols={6} />
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (isError) {
    console.error("Error fetching accounts:", error);
    toast.showError("Gagal memuat data rekening.");
    return (
      <DashboardLayout title="Manajemen Rekening" role="administrasi">
        <div className="container mx-auto py-4 px-4">
          <CustomBreadcrumb items={breadcrumbItems} />
          <Card>
            <CardHeader>
              <CardTitle>Daftar Rekening</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-500">Terjadi kesalahan saat memuat data rekening.</p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Manajemen Rekening" role="administrasi">
      <div className="container mx-auto py-4 px-4">
        <CustomBreadcrumb items={breadcrumbItems} />
        <Card>
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle>Daftar Rekening</CardTitle>
            <Button onClick={handleAdd}>
              <PlusCircle className="mr-2 h-4 w-4" /> Tambah Rekening
            </Button>
          </CardHeader>
          <CardContent>
            <RekeningTable data={accounts || []} onEdit={handleEdit} onDelete={handleDeleteClick} />
          </CardContent>
        </Card>

        <RekeningForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleFormSubmit}
          initialData={selectedAccount}
          isLoading={isCreating || isUpdating}
        />

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
              <AlertDialogDescription>
                Tindakan ini tidak dapat dibatalkan. Ini akan menghapus rekening{' '}
                <span className="font-semibold text-foreground">"{accountToDelete?.account_number}"</span> secara permanen.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmDelete} disabled={isDeleting}>
                {isDeleting ? 'Menghapus...' : 'Lanjutkan'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
};

export default RekeningPage;