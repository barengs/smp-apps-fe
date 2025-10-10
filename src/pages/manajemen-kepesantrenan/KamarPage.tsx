import React, { useState } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import CustomBreadcrumb, { BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Bed } from 'lucide-react';
import { useGetRoomsQuery, useCreateRoomMutation, useUpdateRoomMutation, useDeleteRoomMutation } from '@/store/slices/roomApi';
import { KamarTable } from './KamarTable'; // Re-import to ensure it's picked up
import { KamarForm } from './KamarForm'; // Re-import to ensure it's picked up
import { Room, CreateUpdateRoomRequest } from '@/types/kepesantrenan';
import * as toast from '@/utils/toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import TableLoadingSkeleton from '@/components/TableLoadingSkeleton';

const KamarPage: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const { data: roomsData, isLoading: isGetLoading, isError } = useGetRoomsQuery();
  const [createRoom, { isLoading: isCreateLoading }] = useCreateRoomMutation();
  const [updateRoom, { isLoading: isUpdateLoading }] = useUpdateRoomMutation();
  const [deleteRoom] = useDeleteRoomMutation();

  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: 'Dashboard', href: '/dashboard/administrasi' },
    { label: 'Kepesantrenan' },
    { label: 'Kamar', icon: <Bed className="h-4 w-4" /> },
  ];

  const handleFormOpen = (room?: Room) => {
    setSelectedRoom(room || null);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setSelectedRoom(null);
    setIsFormOpen(false);
  };

  const handleDeleteConfirmOpen = (room: Room) => {
    setSelectedRoom(room);
    setIsConfirmOpen(true);
  };

  const handleDeleteConfirmClose = () => {
    setSelectedRoom(null);
    setIsConfirmOpen(false);
  };

  const handleSubmit = async (data: CreateUpdateRoomRequest) => {
    try {
      if (selectedRoom) {
        await updateRoom({ id: selectedRoom.id, data }).unwrap();
        toast.showSuccess('Kamar berhasil diperbarui.');
      } else {
        await createRoom(data).unwrap();
        toast.showSuccess('Kamar berhasil ditambahkan.');
      }
      handleFormClose();
    } catch (err) {
      toast.showError('Terjadi kesalahan saat menyimpan kamar.');
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (selectedRoom) {
      try {
        await deleteRoom(selectedRoom.id).unwrap();
        toast.showSuccess('Kamar berhasil dihapus.');
        handleDeleteConfirmClose();
      } catch (err) {
        toast.showError('Terjadi kesalahan saat menghapus kamar.');
        console.error(err);
      }
    }
  };

  return (
    <DashboardLayout title="Manajemen Kamar" role="administrasi">
      <div className="container mx-auto px-4 pb-4">
        <CustomBreadcrumb items={breadcrumbItems} />
        <Card>
          <CardHeader className="flex flex-row justify-between items-center">
            <div>
              <CardTitle>Manajemen Kamar</CardTitle>
              <CardDescription>Kelola semua kamar yang ada di setiap asrama.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {isGetLoading ? (
              <TableLoadingSkeleton />
            ) : isError ? (
              <div className="text-red-500 text-center my-4">Gagal memuat data kamar.</div>
            ) : (
              <KamarTable
                data={roomsData?.data || []}
                onEdit={handleFormOpen}
                onDelete={handleDeleteConfirmOpen}
              />
            )}
          </CardContent>
        </Card>
      </div>
      <KamarForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSubmit={handleSubmit}
        initialData={selectedRoom}
        isLoading={isCreateLoading || isUpdateLoading}
      />
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini akan menghapus data kamar secara permanen.
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

export default KamarPage;