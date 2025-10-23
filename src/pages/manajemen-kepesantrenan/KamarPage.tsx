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
import { PaginationState, SortingState } from '@tanstack/react-table'; // Import PaginationState, SortingState

const KamarPage: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([]);

  const { data: roomsResponse, isLoading: isGetLoading, isError, isFetching } = useGetRoomsQuery({
    page: pagination.pageIndex + 1,
    per_page: pagination.pageSize,
    sort_by: sorting.length > 0 ? sorting[0].id : undefined,
    sort_order: sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : undefined,
  });
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
            <Button onClick={() => handleFormOpen()}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Tambah Kamar
            </Button>
          </CardHeader>
          <CardContent>
            {isGetLoading || isFetching ? (
              <TableLoadingSkeleton />
            ) : isError ? (
              <div className="text-red-500 text-center my-4">Gagal memuat data kamar.</div>
            ) : (
              // Gunakan pagination manual hanya jika backend mengembalikan metadata paginasi valid
              (() => {
                const isServerPaginated =
                  !!roomsResponse &&
                  typeof roomsResponse.last_page === 'number' &&
                  typeof roomsResponse.current_page === 'number' &&
                  roomsResponse.last_page >= 1;
                const normalizedData = roomsResponse?.data || [];
                return (
                  <KamarTable
                    data={normalizedData}
                    onEdit={handleFormOpen}
                    onDelete={handleDeleteConfirmOpen}
                    pagination={isServerPaginated ? pagination : undefined}
                    onPaginationChange={isServerPaginated ? setPagination : undefined}
                    pageCount={isServerPaginated ? roomsResponse!.last_page : undefined}
                    sorting={sorting}
                    onSortingChange={setSorting}
                  />
                );
              })()
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