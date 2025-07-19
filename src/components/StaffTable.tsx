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
import { ChevronDown, FileDown, Search, PlusCircle, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // Mengimpor autoTable secara langsung
import * as XLSX from 'xlsx';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Import Select components

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

// Define a type that explicitly has accessorKey
type ColumnWithAccessorKey<TData> = ColumnDef<TData> & {
  accessorKey: keyof TData;
};

// Type guard to check if a column has accessorKey
function hasAccessorKey<TData>(
  column: ColumnDef<TData>
): column is ColumnWithAccessorKey<TData> {
  return 'accessorKey' in column;
}

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
      {
        id: 'actions',
        header: 'Aksi',
        cell: ({ row }) => {
          const staff = row.original;
          return (
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.info(`Mengedit staf: ${staff.name}`)}
              >
                <Edit className="h-4 w-4 mr-1" /> Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => toast.error(`Menghapus staf: ${staff.name}`)}
              >
                <Trash2 className="h-4 w-4 mr-1" /> Hapus
              </Button>
            </div>
          );
        },
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
    const doc = new jsPDF();

    // Filter out the 'actions' column and ensure remaining columns have accessorKey
    const exportableColumns = columns.filter(
      (col): col is ColumnWithAccessorKey<Staff> =>
        hasAccessorKey(col) && col.id !== 'actions'
    );

    const headers = exportableColumns.map(col => {
      return String(col.header);
    });

    const tableData = table.getRowModel().rows.map(row => {
      return exportableColumns.map(col => {
        // Now 'col' is guaranteed to have 'accessorKey'
        return String(row.original[col.accessorKey as keyof Staff]);
      });
    });

    console.log("PDF Headers:", headers);
    console.log("PDF Table Data:", tableData);

    if (tableData.length === 0) {
      toast.error('Tidak ada data untuk diekspor ke PDF.');
      return;
    }

    autoTable(doc, { // Menggunakan autoTable sebagai fungsi terpisah
      head: [headers],
      body: tableData,
      startY: 20,
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 8, cellPadding: 3 },
      margin: { top: 10, right: 10, bottom: 10, left: 10 },
    });
    doc.save("data_staf.pdf");
    toast.success('Data berhasil diekspor ke PDF!');
  };

  const handleExportExcel = () => {
    toast.info('Mengekspor data ke Excel...');
    const dataToExport = table.getRowModel().rows.map(row => {
      const rowData: { [key: string]: any } = {};
      // Filter out the 'actions' column and ensure remaining columns have accessorKey
      const exportableColumns = columns.filter(
        (col): col is ColumnWithAccessorKey<Staff> =>
          hasAccessorKey(col) && col.id !== 'actions'
      );

      exportableColumns.forEach(col => {
        const header = String(col.header);
        // Now 'col' is guaranteed to have 'accessorKey'
        rowData[header] = String(row.original[col.accessorKey as keyof Staff]);
      });
      return rowData;
    });

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Staf");
    XLSX.writeFile(wb, "data_staf.xlsx");
    toast.success('Data berhasil diekspor ke Excel!');
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
          <Button onClick={handleAddData}>
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
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Baris per halaman</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[5, 10, 20, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <span className="flex items-center gap-1 text-sm text-muted-foreground">
          Halaman{' '}
          <strong>
            {table.getState().pagination.pageIndex + 1} dari{' '}
            {table.getPageCount()}
          </strong>
        </span>
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
      </div>
    </div>
  );
};

export default StaffTable;