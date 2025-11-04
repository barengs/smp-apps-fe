import React, { useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast'; // Updated import
import { DataTable } from '../../components/DataTable';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
} from '@/components/ui/alert-dialog';
import RombelForm from './RombelForm';
import { useGetClassGroupsQuery, useDeleteClassGroupMutation } from '@/store/slices/classGroupApi';
import { useGetClassroomsQuery } from '@/store/slices/classroomApi';
import { useGetInstitusiPendidikanQuery } from '@/store/slices/institusiPendidikanApi';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import TableLoadingSkeleton from '../../components/TableLoadingSkeleton';
import { useLocalPagination } from '@/hooks/useLocalPagination';

interface Rombel {
  id: number;
  name: string;
  classroom_id: number;
  classroom: {
    name: string;
  };
  advisor?: {
    first_name: string;
    last_name: string;
  } | null;
}

const RombelTable: React.FC = () => {
  const { data: classGroupsData, error, isLoading } = useGetClassGroupsQuery();
  const [deleteClassGroup] = useDeleteClassGroupMutation();
  const { data: classroomsData } = useGetClassroomsQuery();
  const { data: institutionsData } = useGetInstitusiPendidikanQuery({ page: 1, per_page: 200 });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRombel, setEditingRombel] = useState<Rombel | undefined>(undefined);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [rombelToDelete, setRombelToDelete] = useState<Rombel | undefined>(undefined);

  const rombels: Rombel[] = useMemo(() => {
    return classGroupsData?.data || [];
  }, [classGroupsData]);

  const classroomToInstitutionId = useMemo(() => {
    const map = new Map<number, number | null>();
    (classroomsData?.data ?? []).forEach((c: any) => {
      const instIdAny = c?.educational_institution_id ?? c?.school?.id ?? null;
      const instId = instIdAny !== null && instIdAny !== undefined ? Number(instIdAny) : null;
      map.set(Number(c.id), instId);
    });
    return map;
  }, [classroomsData]);

  const instNameById = useMemo(() => {
    const map = new Map<number, string>();
    (institutionsData ?? []).forEach((inst: any) => {
      map.set(Number(inst.id), inst.institution_name);
    });
    return map;
  }, [institutionsData]);

  const { paginatedData, pagination, setPagination, pageCount } = useLocalPagination<Rombel>(rombels);

  const handleAddData = () => {
    setEditingRombel(undefined);
    setIsModalOpen(true);
  };

  const handleEditData = (rombel: Rombel) => {
    setEditingRombel(rombel);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (rombel: Rombel) => {
    setRombelToDelete(rombel);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (rombelToDelete) {
      try {
        await deleteClassGroup(rombelToDelete.id).unwrap();
        showSuccess(`Rombel "${rombelToDelete.name}" berhasil dihapus.`);
      } catch (err) {
        const fetchError = err as FetchBaseQueryError;
        const errorMessage = (fetchError.data as { message?: string })?.message || 'Gagal menghapus rombel.';
        showError(errorMessage);
      } finally {
        setRombelToDelete(undefined);
        setIsDeleteDialogOpen(false);
      }
    }
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    setEditingRombel(undefined);
  };

  const handleFormCancel = () => {
    setIsModalOpen(false);
    setEditingRombel(undefined);
  };

  const columns: ColumnDef<Rombel>[] = useMemo(
    () => [
      {
        id: 'institution',
        header: 'Institusi Pendidikan',
        accessorFn: (row) => {
          const instId = classroomToInstitutionId.get(row.classroom_id) ?? null;
          if (instId == null) return '';
          return instNameById.get(instId) ?? '';
        },
        cell: ({ row }) => {
          const instId = classroomToInstitutionId.get(row.original.classroom_id) ?? null;
          const name = instId == null ? '' : instNameById.get(instId) ?? '';
          return <span>{name !== '' ? name : '-'}</span>;
        },
      },
      {
        accessorFn: row => row.classroom.name,
        id: 'classroomName',
        header: 'Kelas',
      },
      {
        accessorKey: 'name',
        header: 'Nama Rombel',
      },
      {
        accessorFn: row =>
          row.advisor
            ? `${row.advisor.first_name ?? ''} ${row.advisor.last_name ?? ''}`.trim()
            : '',
        id: 'homeroom_teacher',
        header: 'Wali Kelas',
        cell: ({ row }) => {
          const adv = row.original.advisor;
          const fullName = adv
            ? [adv.first_name, adv.last_name].filter(Boolean).join(' ').trim()
            : '';
          return <span>{fullName !== '' ? fullName : '-'}</span>;
        },
      },
      {
        id: 'actions',
        header: 'Aksi',
        cell: ({ row }) => {
          const rombel = row.original;
          return (
            <div className="flex space-x-2">
              <Button
                variant="outline"
                className="h-8 px-2 text-xs"
                onClick={() => handleEditData(rombel)}
              >
                <Edit className="h-4 w-4 mr-1" /> Edit
              </Button>
            </div>
          );
        },
      },
    ],
    [classroomToInstitutionId, instNameById]
  );

  if (isLoading) return <TableLoadingSkeleton numCols={4} />;

  const isNotFound = error && (error as FetchBaseQueryError).status === 404;
  if (error && !isNotFound) {
    return <div>Error: Gagal memuat data. Silakan coba lagi nanti.</div>;
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={paginatedData}
        exportFileName="data_rombel"
        exportTitle="Data Rombongan Belajar"
        onAddData={handleAddData}
        addButtonLabel="Tambah Rombel"
        pageCount={pageCount}
        pagination={pagination}
        onPaginationChange={setPagination}
      />

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingRombel ? 'Edit Rombel' : 'Tambah Rombel Baru'}</DialogTitle>
            <DialogDescription>
              {editingRombel ? 'Ubah detail rombel ini.' : 'Isi detail untuk rombel baru.'}
            </DialogDescription>
          </DialogHeader>
          <RombelForm
            initialData={editingRombel}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Ini akan menghapus rombel{' '}
              <span className="font-semibold text-foreground">"{rombelToDelete?.name}"</span> secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>Lanjutkan</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default RombelTable;