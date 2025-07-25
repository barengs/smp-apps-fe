import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { PlusCircle, Calendar as CalendarIcon } from 'lucide-react';
import JadwalKegiatanForm from './JadwalKegiatanForm';
import CustomBreadcrumb, { type BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { showSuccess, showError, showWarning } from '@/utils/toast';
import EventCalendar from '../../components/EventCalendar';
import KegiatanList from '../../components/KegiatanList';
import { useGetActivitiesQuery, useCreateActivityMutation, useUpdateActivityMutation, useDeleteActivityMutation } from '@/store/slices/activityApi';
import { format } from 'date-fns';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { SerializedError } from '@reduxjs/toolkit';

// Type guard kustom untuk isFetchBaseQueryError
function isFetchBaseQueryError(error: unknown): error is FetchBaseQueryError {
  return typeof error === 'object' && error != null && 'status' in error;
}

export interface Kegiatan {
  id: number;
  date: Date;
  name: string; // Changed from title
  description?: string;
  status: 'Selesai' | 'Belum Selesai'; // Frontend status
}

const JadwalKegiatanPage: React.FC = () => {
  const { data: activitiesData, isLoading, isError, error, refetch } = useGetActivitiesQuery();
  const [createActivity, { isLoading: isCreating }] = useCreateActivityMutation();
  const [updateActivity, { isLoading: isUpdating }] = useUpdateActivityMutation();
  const [deleteActivity, { isLoading: isDeleting }] = useDeleteActivityMutation();

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingKegiatan, setEditingKegiatan] = useState<Kegiatan | undefined>(undefined);

  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: 'Jadwal Kegiatan', icon: <CalendarIcon className="h-4 w-4" /> },
  ];

  const kegiatanList: Kegiatan[] = React.useMemo(() => {
    if (!activitiesData?.data) return [];
    return activitiesData.data.map(apiKegiatan => ({
      id: apiKegiatan.id,
      date: new Date(apiKegiatan.date), // Changed from activity_date
      name: apiKegiatan.name, // Changed from title
      description: apiKegiatan.description,
      status: apiKegiatan.status === 'inactive' ? 'Selesai' : 'Belum Selesai', // Map API status to frontend status
    }));
  }, [activitiesData]);

  // Effect untuk menampilkan toast error
  useEffect(() => {
    if (isError) {
      let errorMessage = "Terjadi kesalahan tidak dikenal.";
      if (isFetchBaseQueryError(error)) {
        if (error.data && typeof error.data === 'object' && 'message' in error.data) {
          errorMessage = (error.data as { message: string }).message;
        } else {
          errorMessage = JSON.stringify(error.data);
        }
      } else if (error && 'message' in error) {
        errorMessage = error.message;
      }
      showError(`Gagal memuat kegiatan: ${errorMessage}`);
    }
  }, [isError, error]);

  const handleSaveKegiatan = async (kegiatan: { name: string; description?: string; date: Date }) => { // Changed from title
    try {
      const formattedDate = format(kegiatan.date, 'yyyy-MM-dd');

      if (editingKegiatan) {
        const apiStatus = editingKegiatan.status === 'Selesai' ? 'inactive' : 'active'; // Map frontend status to API status
        await updateActivity({
          id: editingKegiatan.id,
          data: {
            name: kegiatan.name, // Changed from title
            description: kegiatan.description,
            date: formattedDate, // Changed from activity_date
            status: apiStatus, // Changed from is_completed
          }
        }).unwrap();
        showSuccess(`Kegiatan "${kegiatan.name}" berhasil diperbarui.`); // Changed from title
      } else {
        await createActivity({
          name: kegiatan.name, // Changed from title
          description: kegiatan.description,
          date: formattedDate, // Changed from activity_date
          status: 'active', // Default status for new activities
        }).unwrap();
        showSuccess(`Kegiatan "${kegiatan.name}" berhasil ditambahkan.`); // Changed from title
      }
      setIsDialogOpen(false);
      setEditingKegiatan(undefined);
      refetch();
    } catch (err) {
      console.error("Failed to save kegiatan:", err);
      let errorMessage = "Terjadi kesalahan tidak dikenal saat menyimpan kegiatan.";
      if (isFetchBaseQueryError(err)) {
        if (err.data && typeof err.data === 'object' && 'message' in err.data) {
          errorMessage = (err.data as { message: string }).message;
        } else {
          errorMessage = JSON.stringify(err.data);
        }
      } else if (err && typeof err === 'object' && 'message' in err) {
        errorMessage = (err as { message: string }).message;
      }
      showError(`Gagal menyimpan kegiatan: ${errorMessage}`);
    }
  };

  const handleDateClick = (date: Date) => {
    setEditingKegiatan(undefined);
    setSelectedDate(date);
    setIsDialogOpen(true);
  };

  const handleEditKegiatan = (kegiatan: Kegiatan) => {
    setEditingKegiatan(kegiatan);
    setSelectedDate(kegiatan.date);
    setIsDialogOpen(true);
  };

  const handleToggleStatus = async (id: number) => {
    const kegiatanToUpdate = kegiatanList.find(k => k.id === id);
    if (!kegiatanToUpdate) return;

    const newFrontendStatus = kegiatanToUpdate.status === 'Selesai' ? 'Belum Selesai' : 'Selesai';
    const newApiStatus = newFrontendStatus === 'Selesai' ? 'inactive' : 'active'; // Map frontend status to API status

    try {
      await updateActivity({
        id: id,
        data: {
          status: newApiStatus, // Changed from is_completed
        }
      }).unwrap();
      showWarning(`Status kegiatan "${kegiatanToUpdate.name}" telah diperbarui menjadi ${newFrontendStatus}.`); // Changed from title
      refetch();
    } catch (err) {
      console.error("Failed to toggle status:", err);
      showError("Gagal memperbarui status kegiatan. Silakan coba lagi.");
    }
  };

  const handleDeleteKegiatan = async (id: number) => {
    const kegiatanToDelete = kegiatanList.find(k => k.id === id);
    if (!kegiatanToDelete) return;

    try {
      await deleteActivity(id).unwrap();
      showSuccess(`Kegiatan "${kegiatanToDelete.name}" telah dihapus.`); // Changed from title
      refetch();
    } catch (err) {
      console.error("Failed to delete kegiatan:", err);
      showError("Gagal menghapus kegiatan. Silakan coba lagi.");
    }
  };

  return (
    <DashboardLayout title="Jadwal Kegiatan" role="administrasi">
      <div className="container mx-auto pb-4 px-4">
        <CustomBreadcrumb items={breadcrumbItems} />
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Kalender Kegiatan</CardTitle>
                <CardDescription>Lihat dan kelola jadwal kegiatan pesantren.</CardDescription>
              </div>
              <Button onClick={() => handleDateClick(new Date())}>
                <PlusCircle className="mr-2 h-4 w-4" /> Tambah Kegiatan
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="text-center text-muted-foreground py-4">
                Sedang memuat data kegiatan. Mohon tunggu...
              </div>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <EventCalendar 
                  kegiatanList={kegiatanList} 
                  onDateClick={handleDateClick}
                  onEventClick={handleEditKegiatan}
                />
              </div>
              <div className="lg:col-span-1">
                <KegiatanList
                  kegiatanList={kegiatanList}
                  onToggleStatus={handleToggleStatus}
                  onDelete={handleDeleteKegiatan}
                  onEdit={handleEditKegiatan}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingKegiatan ? 'Edit Kegiatan' : 'Tambah Kegiatan Baru'}</DialogTitle>
            <DialogDescription>
              Isi detail kegiatan di bawah ini.
            </DialogDescription>
          </DialogHeader>
          <JadwalKegiatanForm
            selectedDate={selectedDate}
            initialData={editingKegiatan}
            onSuccess={handleSaveKegiatan}
            onCancel={() => {
              setIsDialogOpen(false);
              setEditingKegiatan(undefined);
            }}
          />
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default JadwalKegiatanPage;