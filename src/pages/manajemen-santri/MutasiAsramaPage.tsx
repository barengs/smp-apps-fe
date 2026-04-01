import React, { useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useGetStudentsQuery } from '@/store/slices/studentApi';
import { DataTable } from '@/components/DataTable';
import TableLoadingSkeleton from '@/components/TableLoadingSkeleton';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Briefcase, Building2, UserCircle, ArrowRightLeft } from 'lucide-react';
import CustomBreadcrumb from '@/components/CustomBreadcrumb';
import BulkAssignRoomDialog from '@/components/BulkAssignRoomDialog';
import AssignRoomDialog from '@/components/AssignRoomDialog';
import { Badge } from '@/components/ui/badge';

interface MutasiSantri {
  id: number;
  fullName: string;
  nis: string;
  programName: string;
  hostelName: string;
  roomName: string;
}

const MutasiAsramaPage: React.FC = () => {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [activeStudentId, setActiveStudentId] = useState<number | null>(null);

  const { data: students, isLoading, refetch } = useGetStudentsQuery({ per_page: 10000 });

  const santriList: MutasiSantri[] = useMemo(() => {
    if (Array.isArray(students)) {
      return students.map((s) => ({
        id: s.id,
        fullName: `${s.first_name} ${s.last_name || ''}`.trim(),
        nis: s.nis,
        programName: s.program?.name ?? '-',
        hostelName: s.hostel?.name ?? 'Belum diatur',
        roomName: (s as any)?.current_room?.room_name ?? 'Belum diatur',
      }));
    }
    return [];
  }, [students]);

  const toggleSelectAll = () => {
    if (selectedIds.length === santriList.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(santriList.map((s) => s.id));
    }
  };

  const toggleSelectOne = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const columns: ColumnDef<MutasiSantri>[] = useMemo(
    () => [
      {
        id: 'selection',
        header: () => (
          <Checkbox
            checked={selectedIds.length === santriList.length && santriList.length > 0}
            onCheckedChange={toggleSelectAll}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={selectedIds.includes(row.original.id)}
            onCheckedChange={() => toggleSelectOne(row.original.id)}
            onClick={(e) => e.stopPropagation()}
          />
        ),
      },
      {
        accessorKey: 'fullName',
        header: 'Nama Santri',
      },
      {
        accessorKey: 'nis',
        header: 'NIS',
      },
      {
        accessorKey: 'programName',
        header: 'Program',
        cell: ({ row }) => <Badge variant="outline">{row.original.programName}</Badge>,
      },
      {
        accessorKey: 'hostelName',
        header: 'Asrama Saat Ini',
        cell: ({ row }) => (
          <span className={row.original.hostelName === 'Belum diatur' ? 'text-muted-foreground' : ''}>
            {row.original.hostelName}
          </span>
        ),
      },
      {
        accessorKey: 'roomName',
        header: 'Kamar Saat Ini',
        cell: ({ row }) => (
          <span className={row.original.roomName === 'Belum diatur' ? 'text-muted-foreground' : ''}>
            {row.original.roomName}
          </span>
        ),
      },
      {
        id: 'actions',
        header: 'Aksi',
        cell: ({ row }) => (
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setActiveStudentId(row.original.id);
              setIsAssignDialogOpen(true);
            }}
          >
            Mutasi
          </Button>
        ),
      },
    ],
    [selectedIds, santriList]
  );

  const filterOptions = useMemo(() => {
    const programs = new Set<string>();
    const hostels = new Set<string>();
    const rooms = new Set<string>();

    santriList.forEach((s) => {
      if (s.programName !== '-') programs.add(s.programName);
      if (s.hostelName !== 'Belum diatur') hostels.add(s.hostelName);
      if (s.roomName !== 'Belum diatur') rooms.add(s.roomName);
    });

    return {
      programs: Array.from(programs).map((v) => ({ label: v, value: v })),
      hostels: Array.from(hostels).map((v) => ({ label: v, value: v })),
      rooms: Array.from(rooms).map((v) => ({ label: v, value: v })),
    };
  }, [santriList]);

  const breadcrumbItems = [
    { label: 'Manajemen Santri', href: '/dashboard/santri', icon: <UserCircle className="h-4 w-4" /> },
    { label: 'Mutasi Asrama', icon: <ArrowRightLeft className="h-4 w-4" /> },
  ];

  return (
    <DashboardLayout title="Mutasi Asrama" role="administrasi">
      <div className="container mx-auto pb-6 px-4">
        <CustomBreadcrumb items={breadcrumbItems} />
        
        <div className="mb-4 flex justify-between items-center">
            <div>
                 <h2 className="text-2xl font-bold tracking-tight">Manajemen Mutasi Asrama</h2>
                 <p className="text-muted-foreground">Pindahkan santri antar asrama dan kamar dengan mudah.</p>
            </div>
            {selectedIds.length > 0 && (
                <Button onClick={() => setIsBulkDialogOpen(true)} variant="primary">
                    <ArrowRightLeft className="mr-2 h-4 w-4" />
                    Mutasi Massal ({selectedIds.length} Santri)
                </Button>
            )}
        </div>

        {isLoading ? (
          <TableLoadingSkeleton numCols={6} />
        ) : (
          <DataTable
            columns={columns}
            data={santriList}
            filterableColumns={{
              programName: { type: 'select', placeholder: 'Program', options: filterOptions.programs },
              hostelName: { type: 'select', placeholder: 'Asrama', options: filterOptions.hostels },
              roomName: { type: 'select', placeholder: 'Kamar', options: filterOptions.rooms },
            }}
            searchPlaceholder="Cari nama atau NIS..."
            totalItems={santriList.length}
          />
        )}
      </div>

      <BulkAssignRoomDialog
        open={isBulkDialogOpen}
        onOpenChange={setIsBulkDialogOpen}
        studentIds={selectedIds}
        onSuccess={() => {
            setSelectedIds([]);
            refetch();
        }}
      />

      {activeStudentId && (
        <AssignRoomDialog
          open={isAssignDialogOpen}
          onOpenChange={(open) => {
            setIsAssignDialogOpen(open);
            if (!open) setActiveStudentId(null);
          }}
          studentId={activeStudentId}
        />
      )}
    </DashboardLayout>
  );
};

export default MutasiAsramaPage;
