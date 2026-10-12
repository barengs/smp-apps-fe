import React, { useMemo, useState, useEffect, useRef } from 'react'; // Import useState, useEffect, useRef
import { ColumnDef, SortingState, PaginationState, ColumnFiltersState } from '@tanstack/react-table'; // Import PaginationState, ColumnFiltersState
import { Button } from '@/components/ui/button';
import { CreditCard, Edit, FileText, RefreshCw } from 'lucide-react';
import * as toast from '@/utils/toast';
import { DataTable } from '../../components/DataTable';
import { useGetStudentsQuery, useExportStudentsMutation, useBackupStudentsMutation } from '@/store/slices/studentApi';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import TableLoadingSkeleton from '../../components/TableLoadingSkeleton';
import { useNavigate } from 'react-router-dom';
import RoomAssignDialog from '@/components/RoomAssignDialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Download, Upload, DatabaseBackup } from 'lucide-react';
import SantriImportDialog from './SantriImportDialog';
import { usePermissions } from '@/hooks/usePermissions';

// ---------------------------------------------------------------------------
// Persistensi state tabel ke sessionStorage
// Berguna agar saat kembali dari halaman detail santri, posisi halaman,
// pencarian, dan filter tidak hilang sehingga tabel langsung tampil tanpa
// menunggu loading skeleton yang lama.
// ---------------------------------------------------------------------------
const SESSION_KEY = 'santri_table_state';

interface SantriTableSessionState {
  pagination: PaginationState;
  search: string;
  filters: ColumnFiltersState;
}

const DEFAULT_SESSION_STATE: SantriTableSessionState = {
  pagination: { pageIndex: 0, pageSize: 10 },
  search: '',
  filters: [],
};

function readSessionState(): SantriTableSessionState {
  if (typeof window === 'undefined') return DEFAULT_SESSION_STATE;
  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY);
    if (!raw) return DEFAULT_SESSION_STATE;
    const parsed = JSON.parse(raw) as Partial<SantriTableSessionState>;
    return {
      pagination: {
        pageIndex: Number(parsed.pagination?.pageIndex ?? 0),
        pageSize: Number(parsed.pagination?.pageSize ?? 10),
      },
      search: typeof parsed.search === 'string' ? parsed.search : '',
      filters: Array.isArray(parsed.filters) ? parsed.filters : [],
    };
  } catch {
    return DEFAULT_SESSION_STATE;
  }
}

function writeSessionState(state: SantriTableSessionState) {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(state));
  } catch {
    // Abaikan jika storage penuh/di-block
  }
}

// Interface for the data displayed in the table
interface Santri {
  id: number;
  fullName: string;
  nis: string;
  roomName: string;
  assignedRoomName?: string;
  period: string;
  gender?: string;
  status: string;
  programName: string;
  address: string;
  className: string;
  hasActiveCard: boolean;
  activeCardNumber?: string;
  created_at: string;
  updated_at: string;
}

interface SantriTableProps {
  onAddData?: () => void;
}

const SantriTable: React.FC<SantriTableProps> = ({ onAddData }) => {
  const navigate = useNavigate();
  const [sorting, setSorting] = useState<SortingState>([{ id: 'created_at', desc: true }]);
  const [importOpen, setImportOpen] = useState(false);
  const [exportStudents, { isLoading: isExporting }] = useExportStudentsMutation();
  const [backupStudents, { isLoading: isBackingUp }] = useBackupStudentsMutation();
  const { canCreate, canEdit } = usePermissions();

  // Pulihkan state tabel dari sessionStorage (pagination, search, filters)
  const [sessionState] = useState<SantriTableSessionState>(() => readSessionState());
  const [pagination, setPagination] = useState<PaginationState>(sessionState.pagination);
  const [search, setSearch] = useState<string>(sessionState.search);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(sessionState.filters);

  // Simpan state tabel ke sessionStorage setiap kali berubah
  // (dijalankan setelah render agar tidak memblokir paint)
  const hasMountedRef = useRef(false);
  useEffect(() => {
    // Jangan menimpa sessionStorage saat mount pertama (baru saja dibaca)
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }
    writeSessionState({ pagination, search, filters: columnFilters });
  }, [pagination, search, columnFilters]);

  const handleExport = async () => {
    const loadingId = toast.showLoading('Mengunduh data export...');
    try {
      const blob = await exportStudents().unwrap();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Data_Santri_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.showSuccess('Export berhasil diunduh');
    } catch (error) {
      toast.showError('Gagal melakukan export data');
      console.error(error);
    } finally {
      toast.dismissToast(loadingId);
    }
  };

  const handleBackup = async () => {
    const loadingId = toast.showLoading('Mengunduh backup data...');
    try {
      const blob = await backupStudents().unwrap();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Backup_Santri_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.showSuccess('Backup berhasil diunduh');
    } catch (error) {
      toast.showError('Gagal melakukan backup data');
      console.error(error);
    } finally {
      toast.dismissToast(loadingId);
    }
  };

  // Ambil semua data tanpa server-side pagination (limit tinggi untuk client-side pagination)
  const { data: students, error, isLoading, isFetching, refetch } = useGetStudentsQuery({ per_page: 10000 });

  const santriList: Santri[] = useMemo(() => {
    if (Array.isArray(students)) {
      const mapped = students.map((student) => ({
        id: student.id,
        fullName: `${student.first_name} ${student.last_name || ''}`.trim(),
        nis: student.nis,
        roomName: student.hostel?.name ?? 'Belum diatur',
        assignedRoomName: student?.current_room?.room_name ?? '',
        period: student.period,
        gender:
          student.gender === 'L'
            ? 'Laki-Laki'
            : student.gender === 'P'
              ? 'Perempuan'
              : 'Tidak Diketahui',
        status: student.status,
        programName: student.program ? student.program.name : '',
        address: student.address || '-',
        className: student.current_class?.class_name || student.education_class?.name || '-',
        hasActiveCard: Boolean((student.active_student_card || student.activeStudentCard || student.card)?.is_active),
        activeCardNumber: (student.active_student_card || student.activeStudentCard || student.card)?.card_number,
        created_at: student.created_at,
        updated_at: student.updated_at,
      }));
      // Urutkan berdasarkan tanggal dibuat (terbaru di atas)
      // Bandingkan sebagai string ISO agar tidak memanggil new Date().getTime()
      // pada setiap iterasi (lebih hemat untuk ~15.000 baris)
      mapped.sort((a, b) => (a.created_at < b.created_at ? 1 : a.created_at > b.created_at ? -1 : 0));
      return mapped;
    }
    return [];
  }, [students]);

  // Tambah opsi filter unik untuk Periode, Status, dan Program
  const periodOptions = useMemo(
    () => {
      const set = new Set<string>();
      santriList.forEach(s => { if (s.period) set.add(s.period); });
      return Array.from(set).map(v => ({ label: v, value: v }));
    },
    [santriList]
  );

  const statusOptions = useMemo(
    () => {
      const set = new Set<string>();
      santriList.forEach(s => { if (s.status) set.add(s.status); });
      return Array.from(set).map(v => ({ label: v, value: v }));
    },
    [santriList]
  );

  const programOptions = useMemo(
    () => {
      const set = new Set<string>();
      santriList.forEach(s => { if (s.programName) set.add(s.programName); });
      return Array.from(set).map(v => ({ label: v, value: v }));
    },
    [santriList]
  );

  // Opsi filter unik untuk Kamar
  const roomOptions = useMemo(
    () => {
      const set = new Set<string>();
      santriList.forEach(s => { if (s.roomName) set.add(s.roomName); });
      return Array.from(set).map(v => ({ label: v, value: v }));
    },
    [santriList]
  );

  const handleRowClick = (santri: Santri) => {
    navigate(`/dashboard/santri/${santri.id}`);
  };

  const columns: ColumnDef<Santri>[] = useMemo(
    () => [
      {
        accessorKey: 'nis',
        header: 'NIS',
      },
      {
        accessorKey: 'fullName',
        header: 'Nama Lengkap',
      },
      {
        accessorKey: 'address',
        header: 'Alamat',
      },
      {
        accessorKey: 'programName',
        header: 'Program',
      },
      {
        accessorKey: 'roomName',
        header: 'Asrama (Kamar)',
        cell: ({ row }) => {
          const roomName = row.original.roomName || 'Belum diatur';
          const assigned = row.original.assignedRoomName;
          
          return (
            <div className="flex flex-col">
              <span className={roomName === 'Belum diatur' ? 'text-muted-foreground' : 'font-medium'}>
                {roomName}
              </span>
              {assigned ? (
                <span className="text-xs text-muted-foreground">{assigned}</span>
              ) : (
                <div
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                  className="mt-1"
                >
                  <RoomAssignDialog
                    studentId={row.original.id}
                    triggerLabel="Tentukan Kamar"
                  />
                </div>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: 'className',
        header: 'Kelas',
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const { status, hasActiveCard, activeCardNumber } = row.original;
          return (
            <div className="flex items-center gap-2 whitespace-nowrap">
              <span className="text-xs font-semibold text-foreground">{status}</span>
              <span
                className="inline-flex items-center"
                title={
                  hasActiveCard
                    ? activeCardNumber
                      ? `Kartu aktif: ${activeCardNumber}`
                      : 'Sudah memiliki kartu aktif'
                    : 'Belum memiliki kartu'
                }
              >
                <CreditCard
                  className={`h-4 w-4 ${hasActiveCard ? 'text-emerald-600' : 'text-slate-300'}`}
                />
              </span>
            </div>
          );
        },
      },

      {
        id: 'actions',
        header: 'Aksi',
        cell: ({ row }) => {
          const santri = row.original;
          if (!canEdit) return <span className="text-muted-foreground text-xs">No Access</span>;
          return (
            <div className="flex space-x-2">
              <Button
                variant="outline"
                className="h-8 px-2 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/dashboard/santri/${santri.id}/edit`);
                }}
              >
                <Edit className="h-4 w-4 mr-1" /> Edit
              </Button>
              <Button
                variant="outline"
                className="h-8 px-2 text-xs border-primary text-primary hover:bg-primary/5"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/dashboard/santri/${santri.id}/agreement`);
                }}
              >
                <FileText className="h-4 w-4 mr-1" /> Perjanjian
              </Button>
            </div>
          );
        },
      },
    ],
    [navigate, canEdit]
  );

  // Tampilkan skeleton HANYA saat load awal benar-benar kosong.
  // Saat hanya background revalidation (isFetching=true tapi data sudah ada),
  // tetap tampilkan tabel agar pengguna tidak menunggu loading berulang.
  if (isLoading && santriList.length === 0) {
    return <TableLoadingSkeleton numCols={8} />;
  }

  const isNotFound =
    error != null &&
    typeof error === 'object' &&
    'status' in error &&
    (error as FetchBaseQueryError).status === 404;

  if (error && !isNotFound) {
    return <div>Error: Gagal memuat data santri.</div>;
  }

  // Indikator ringan ketika sedang sinkronisasi latar belakang (tanpa menutupi tabel)
  const showSyncIndicator = isFetching && santriList.length > 0;

  return (
    <>
      {showSyncIndicator && (
        <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
          <span>Sinkronisasi data terbaru...</span>
        </div>
      )}
      <DataTable
        columns={columns}
        data={santriList}
        exportFileName="data_santri"
        exportTitle="Data Santri Pesantren"
        onRowClick={handleRowClick}
        filterableColumns={{
          period: { type: 'select', placeholder: 'Periode', options: periodOptions },
          status: { type: 'select', placeholder: 'Status', options: statusOptions },
          programName: { type: 'select', placeholder: 'Program', options: programOptions },
          roomName: { type: 'select', placeholder: 'Kamar', options: roomOptions },
        }}
        onAddData={canCreate ? onAddData : undefined}
        onSortingChange={setSorting}
        totalItems={santriList.length}
        addButtonLabel="Tambah Santri"
        initialPagination={sessionState.pagination}
        pagination={pagination}
        onPaginationChange={setPagination}
        initialSearch={sessionState.search}
        searchQuery={search}
        onSearchChange={setSearch}
        initialColumnFilters={sessionState.filters}
        columnFilters={columnFilters}
        onColumnFiltersChange={setColumnFilters}
        exportImportElement={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Import / Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => setImportOpen(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Import
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExport} disabled={isExporting}>
                <Download className="h-4 w-4 mr-2" />
                {isExporting ? 'Exporting...' : 'Export (XLSX)'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleBackup} disabled={isBackingUp}>
                <DatabaseBackup className="h-4 w-4 mr-2" />
                {isBackingUp ? 'Backing up...' : 'Backup (CSV)'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />

      <SantriImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        onImported={async () => {
          const loadingId = toast.showLoading('Memuat data terbaru...');
          await refetch();
          toast.dismissToast(loadingId);
          toast.showSuccess('Data santri berhasil diimpor dan diperbarui.');
        }}
      />
    </>
  );
};

export default SantriTable;