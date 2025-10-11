import React, { useState } from 'react';
import { useGetAccountsQuery } from '@/store/slices/accountApi';
import { RekeningTable } from './RekeningTable';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Account } from '@/types/keuangan';
import { RekeningForm } from './RekeningForm';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import DashboardLayout from '@/layouts/DashboardLayout';
import CustomBreadcrumb from '@/components/CustomBreadcrumb';

const RekeningPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: apiResponse, isLoading, refetch } = useGetAccountsQuery();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [deletingAccount, setDeletingAccount] = useState<Account | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEdit = (account: Account) => {
    setEditingAccount(account);
    setIsFormOpen(true);
  };

  const handleDelete = (account: Account) => {
    setDeletingAccount(account);
  };

  const handleViewDetails = (account: Account) => {
    navigate(`/dashboard/bank-santri/rekening/${account.account_number}`);
  };

  const handleFormSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      // Handle submit logic here
      console.log('Submit data:', data);
      toast.success('Data rekening berhasil disimpan');
      setIsFormOpen(false);
      setEditingAccount(null);
      refetch();
    } catch (error) {
      toast.error('Gagal menyimpan data rekening');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (deletingAccount) {
      try {
        // Implement delete logic here
        toast.success('Rekening berhasil dihapus');
        refetch();
      } catch (error) {
        toast.error('Gagal menghapus rekening');
      } finally {
        setDeletingAccount(null);
      }
    }
  };

  const breadcrumbItems = [
    { label: 'Bank Santri', href: '/dashboard/bank-santri' },
    { label: 'Rekening' }
  ];

  return (
    <DashboardLayout title="Manajemen Rekening" role="administrasi">
      <div className="container mx-auto py-6 space-y-6">
        <CustomBreadcrumb items={breadcrumbItems} />
        
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Manajemen Rekening</h1>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Rekening
          </Button>
        </div>

        <RekeningTable
          data={apiResponse || []}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onViewDetails={handleViewDetails}
        />

        {isFormOpen && (
          <RekeningForm
            isOpen={isFormOpen}
            onClose={() => {
              setIsFormOpen(false);
              setEditingAccount(null);
            }}
            onSubmit={handleFormSubmit}
            initialData={editingAccount}
            isLoading={isSubmitting}
          />
        )}

        <AlertDialog open={!!deletingAccount} onOpenChange={() => setDeletingAccount(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
              <AlertDialogDescription>
                Apakah Anda yakin ingin menghapus rekening {deletingAccount?.account_number}?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
                Hapus
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
};

export default RekeningPage;