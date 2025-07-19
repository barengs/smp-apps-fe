import React, { useState, useMemo } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, FileDown, Search, PlusCircle } from 'lucide-react'; // Import PlusCircle icon
import { toast } from 'sonner';

interface Staff {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

const dummyStaffData: Staff[] = [
  { id: '1', name: 'Budi Santoso', email: 'budi.s@pesantren.com', role: 'Guru Fiqih', status: 'Aktif' },
  { id: '2', name: 'Siti Aminah', email: 'siti.a@pesantren.com', role: 'Administrasi', status: 'Aktif' },
  { id: '3', name: 'Ahmad Fauzi', email: 'ahmad.f@pesantren.com', role: 'Guru Tahfidz', status: 'Aktif' },
  { id: '4', name: 'Dewi Lestari', email: 'dewi.l@pesantren.com', role: 'Bendahara', status: 'Aktif' },
  { id: '5', name: 'Joko Susilo', email: 'joko.s@pesantren.com', role: 'Guru Bahasa Arab', status: 'Aktif' },
  { id: '6', name: 'Nurul Huda', email: 'nurul.h@pesantren.com', role: 'Guru Hadits', status: 'Aktif' },
  { id: '7', name: 'Rina Wijaya', email: 'rina.w@pesantren.com', role: 'Pustakawan', status: 'Aktif' },
  { id: '8', name: 'Faisal Rahman', email: 'faisal.r@pesantren.com', role: 'Keamanan', status: 'Aktif' },
  { id: '9', name: 'Linda Sari', email: 'linda.s@pesantren.com', role: 'Guru Matematika', status: 'Cuti' },
  { id: '10', name: 'Hasan Basri', email: 'hasan.b@pesantren.com', role: 'Guru Sejarah Islam', status: 'Aktif' },
];

const StaffTable: React.FC = () => {
  const [data] = useState<Staff[]>(dummyStaffData);
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const columns = useMemo<ColumnDef<Staff>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Nama',
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: 'email',
        header: 'Email',
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: 'role',
        header: 'Peran',
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: (info) => info.getValue(),
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
      columnVisibility,
    },
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 5, // Default page size
      },
    },
  });

  const handleExportPdf = () => {
    toast.info('Mengekspor data ke PDF...');
    // Implementasi ekspor PDF di sini (membutuhkan library tambahan seperti jspdf)
    // Contoh: const doc = new jsPDF(); doc.text("Data Staf", 10, 10); doc.save("staf.pdf");
  };

  const handleExportExcel = () => {
    toast.info('Mengekspor data ke Excel...');
    // Implementasi ekspor Excel di sini (membutuhkan library tambahan seperti xlsx)
    // Contoh: const ws = XLSX.utils.json_to_sheet(data); const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "Staf"); XLSX.writeFile(wb, "staf.xlsx");
  };

  const handleAddData = () => {
    toast.info('Membuka form tambah data...');
    // Implementasi logika untuk membuka form tambah data
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari staf..."
            value={globalFilter ?? ''}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleAddData}> {/* Add new button here */}
            <PlusCircle className="mr-2 h-4 w-4" /> Tambah Data
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Kolom <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Ekspor <FileDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Ekspor Data</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleExportPdf}>
                Ekspor ke PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportExcel}>
                Ekspor ke Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Tidak ada hasil.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Sebelumnya
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Berikutnya
        </Button>
        <span className="flex items-center gap-1 text-sm text-muted-foreground">
          Halaman{' '}
          <strong>
            {table.getState().pagination.pageIndex + 1} dari{' '}
            {table.getPageCount()}
          </strong>
        </span>
      </div>
    </div>
  );
};

export default StaffTable;