import React from 'react';
import { ColumnDef, PaginationState, SortingState } from '@tanstack/react-table';
import { DataTable } from '@/components/DataTable';
import { Room } from '@/types/kepesantrenan';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface KamarTableProps {
  data: Room[];
  onEdit: (room: Room) => void;
  onDelete: (room: Room) => void;
  pagination?: PaginationState;
  onPaginationChange?: (updater: PaginationState) => void;
  pageCount?: number;
  sorting?: SortingState;
  onSortingChange?: (updater: SortingState) => void;
  exportImportElement?: React.ReactNode;
}

export const KamarTable: React.FC<KamarTableProps> = ({ 
  data, 
  onEdit, 
  onDelete, 
  sorting, 
  onSortingChange, 
  exportImportElement,
  pagination: parentPagination,
  onPaginationChange: parentOnPaginationChange,
  pageCount: parentPageCount
}) => {
  const navigate = useNavigate();

  // NEW: local pagination state (terkontrol)
  const [localPagination, setLocalPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const pagination = parentPagination || localPagination;
  const onPaginationChange = parentOnPaginationChange || setLocalPagination;

  // NEW: hitung total halaman dari data lokal
  const totalItems = Array.isArray(data) ? data.length : 0;
  const pageCount = Math.max(Math.ceil(totalItems / pagination.pageSize), 1);

  // NEW: slice data sesuai halaman
  const start = pagination.pageIndex * pagination.pageSize;
  const pagedData = Array.isArray(data) ? data.slice(start, start + pagination.pageSize) : [];

  const columns: ColumnDef<Room>[] = [
    {
      id: 'no',
      header: 'No',
      cell: ({ row }) => {
        return (pagination.pageIndex * pagination.pageSize) + row.index + 1;
      },
    },
    {
      accessorKey: 'name',
      header: 'Nama Kamar',
    },
    {
      accessorFn: (row) => row.hostel?.name,
      header: 'Asrama',
    },
    {
      accessorKey: 'capacity',
      header: 'Kapasitas',
    },
    {
      accessorKey: 'is_active',
      header: 'Status',
      cell: ({ row }) => {
        const isActive = row.original.is_active;
        return (
          <Badge variant={isActive ? 'default' : 'destructive'}>
            {isActive ? 'Aktif' : 'Tidak Aktif'}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(row.original)}>Edit</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(row.original)}>Hapus</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return <DataTable
    columns={columns}
    data={pagedData}
    exportFileName="data_kamar"
    exportTitle="Data Kamar"
    // Mode manual: parent mengontrol pagination (lokal)
    pagination={pagination}
    onPaginationChange={onPaginationChange}
    pageCount={parentPageCount || pageCount}
    sorting={sorting}
    onSortingChange={onSortingChange}
    exportImportElement={exportImportElement}
  />;
};