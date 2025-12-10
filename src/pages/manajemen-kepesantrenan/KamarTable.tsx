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
}

export const KamarTable: React.FC<KamarTableProps> = ({ data, onEdit, onDelete, pagination, onPaginationChange, pageCount, sorting, onSortingChange }) => {
  const navigate = useNavigate();

  const handleAddData = () => {
    navigate('/dashboard/manajemen-kepesantrenan/kamar/tambah');
  };

  const columns: ColumnDef<Room>[] = [
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
            <Button variant="ghost" className="h-8 w-8 p-0">
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
    data={data}
    exportFileName="data_kamar"
    exportTitle="Data Kamar"
    sorting={sorting}
    onSortingChange={onSortingChange}
  />;
};