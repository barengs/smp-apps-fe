import React, { useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import { MoreHorizontal, PlusCircle } from 'lucide-react';

import DashboardLayout from '@/layouts/DashboardLayout';
import { DataTable } from '@/components/DataTable';
import CustomBreadcrumb from '@/components/CustomBreadcrumb';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { JamPelajaran } from '@/types/kurikulum';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import JamPelajaranForm from './JamPelajaranForm';
import { useGetLessonHoursQuery, useDeleteLessonHourMutation } from '@/store/slices/lessonHourApi';
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
import * as toast from '@/utils/toast';

// Data contoh untuk demonstrasi. Nantinya akan diganti dengan data dari API.
const mockJamPelajaran: JamPelajaran[] = [
  { id: 1, order: 1, start_time: '07:00', end_time: '07:45', name: 'Pelajaran Pagi' },
  { id: 2, order: 2, start_time: '07:45', end_time: '08:30', name: 'Pelajaran Pagi' },
  { id: 3, order: 3, start_time: '08:30', end_time: '09:15', name: 'Pelajaran Pagi' },
  { id: 4, order: 4, start_time: '09:15', end_time: '10:00', name: 'Pelajaran Pagi' },
  { id: 5, order: 0, start_time: '10:00', end_time: '10:15', name: 'Istirahat' },
  { id: 6, order: 5, start_time: '10:15', end_time: '11:00', name: 'Pelajaran Siang' },
  { id: 7, order: 6, start_time: '11:00', end_time: '11:45', name: 'Pelajaran Siang' },
  { id: 8, order: 7, start_time: '11:45', end_time: '12:30', name: 'Pelajaran Siang' },
];

const JamPelajaranPage: React.FC = () => {
  const { t } = useTranslation();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingJamPelajaran, setEditingJamPelajaran] = useState<JamPelajaran | undefined>(undefined);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingJamPelajaranId, setDeletingJamPelajaranId] = useState<number | null>(null);

  const { data, isLoading, isError, refetch } = useGetLessonHoursQuery();
  const [deleteLessonHour, { isLoading: isDeleting }] = useDeleteLessonHourMutation();

  const breadcrumbItems = [
    { label: t('sidebar.curriculum'), href: '#' },
    { label: t('sidebar.lessonHours') },
  ];

  const columns: ColumnDef<JamPelajaran>[] = useMemo(() => [
    {
      accessorKey: 'order',
      header: t('lessonHoursPage.lessonHour'),
      cell: ({ row }) => {
        const jam = row.original;
        return jam.order === 0 ? <Badge variant="outline">Istirahat</Badge> : `Jam ke-${jam.order}`;
      },
      size: 100,
    },
    {
      accessorKey: 'start_time',
      header: t('lessonHoursPage.startTime'),
      size: 150,
    },
    {
      accessorKey: 'end_time',
      header: t('lessonHoursPage.endTime'),
      size: 150,
    },
    {
      accessorKey: 'name',
      header: t('lessonHoursPage.description'),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const jam = row.original;
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
                <DropdownMenuLabel>{t('actions.title')}</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleEditData(jam)}>
                  {t('actions.edit')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDeleteConfirmation(jam.id)} className="text-destructive">
                  {t('actions.delete')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
      size: 100,
    },
  ], [t]);

  const handleAddData = () => {
    setEditingJamPelajaran(undefined);
    setIsFormOpen(true);
  };

  const handleEditData = (jam: JamPelajaran) => {
    setEditingJamPelajaran(jam);
    setIsFormOpen(true);
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingJamPelajaran(undefined);
    refetch();
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setEditingJamPelajaran(undefined);
  };

  const handleDeleteConfirmation = (id: number) => {
    setDeletingJamPelajaranId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (deletingJamPelajaranId) {
      try {
        await deleteLessonHour(deletingJamPelajaranId).unwrap();
        toast.showSuccess('Jam pelajaran berhasil dihapus.');
        setIsDeleteDialogOpen(false);
        setDeletingJamPelajaranId(null);
      } catch (error) {
        toast.showError('Gagal menghapus data.');
        console.error('Failed to delete lesson hour:', error);
      }
    }
  };

  if (isError) {
    return (
      <DashboardLayout title={t('sidebar.lessonHours')} role="administrasi">
        <div className="container mx-auto p-4 text-center">
          <p>Gagal memuat data jam pelajaran.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={t('sidebar.lessonHours')} role="administrasi">
      <div className="container mx-auto p-4">
        <CustomBreadcrumb items={breadcrumbItems} />
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>{t('lessonHoursPage.title')}</CardTitle>
            <CardDescription>{t('lessonHoursPage.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={data || []}
              isLoading={isLoading}
              exportFileName="jam_pelajaran"
              exportTitle={t('lessonHoursPage.title')}
              onAddData={handleAddData}
            />
          </CardContent>
        </Card>

        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingJamPelajaran ? t('lessonHoursForm.editTitle') : t('lessonHoursForm.addTitle')}
              </DialogTitle>
              <DialogDescription>
                {editingJamPelajaran ? t('lessonHoursForm.editDescription') : t('lessonHoursForm.addDescription')}
              </DialogDescription>
            </DialogHeader>
            <JamPelajaranForm
              initialData={editingJamPelajaran}
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
            />
          </DialogContent>
        </Dialog>

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Anda yakin?</AlertDialogTitle>
              <AlertDialogDescription>
                Tindakan ini tidak dapat dibatalkan. Ini akan menghapus data jam pelajaran secara permanen.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? 'Menghapus...' : 'Hapus'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
};

export default JamPelajaranPage;