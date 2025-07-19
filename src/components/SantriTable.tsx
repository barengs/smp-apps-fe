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
import { ChevronDown, FileDown, Search, PlusCircle, Edit } from 'lucide-react'; // Menghapus Trash2
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Santri {
  id: string;
  name: string;
  nis: string; // Nomor Induk Santri
  class: string;
  dormitory: string; // Kolom baru: Asrama
  status: string;
}

const dummySantriData: Santri[] = [
  { id: 'S001', name: 'Fatimah Az-Zahra', nis: '2023001', class: 'VII A', dormitory: 'Putri A', status: 'Aktif' },
  { id: 'S002', name: 'Muhammad Al-Fatih', nis: '2023002', class: 'VII B', dormitory: 'Putra B', status: 'Aktif' },
  { id: 'S003', name: 'Aisyah Humaira', nis: '2023003', class: 'VIII A', dormitory: 'Putri C', status: 'Aktif' },
  { id: 'S004', name: 'Abdullah bin Umar', nis: '2023004', class: 'VIII B', dormitory: 'Putra A', status: 'Aktif' },
  { id: 'S005', name: 'Khadijah Kubra', nis: '2023005', class: 'IX A', dormitory: 'Putri B', status: 'Aktif' },
  { id: 'S006', name: 'Ali bin Abi Thalib', nis: '2023006', class: 'IX B', dormitory: 'Putra C', status: 'Aktif' },
  { id: 'S007', name: 'Zainab binti Muhammad', nis: '2023007', class: 'X IPA', dormitory: 'Putri A', status: 'Aktif' },
  { id: 'S008', name: 'Umar bin Khattab', nis: '2023008', class: 'X IPS', dormitory: 'Putra B', status: 'Aktif' },
  { id: 'S009', name: 'Ruqayyah binti Muhammad', nis: '2023009', class: 'XI IPA', dormitory: 'Putri C', status: 'Cuti' },
  { id: 'S010', name: 'Utsman bin Affan', nis: '2023010', class: 'XI IPS', dormitory: 'Putra A', status: 'Aktif' },
];

type ColumnWithAccessorKey<TData> = ColumnDef<TData> & {
  accessorKey: keyof TData;
};

function hasAccessorKey<TData>(
  column: ColumnDef<TData>
): column is ColumnWithAccessorKey<TData> {
  return 'accessorKey' in column;
}

const SantriTable: React.FC = () => {
  const [data] = useState<Santri[]>(dummySantriData);
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const columns = useMemo<ColumnDef<Santri>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Nama',
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: 'nis',
        header: 'NIS',
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: 'class',
        header: 'Kelas',
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: 'dormitory', // Kolom baru
        header: 'Asrama', // Header untuk kolom baru
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
          const santri = row.original;
          return (
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.info(`Mengedit santri: ${santri.name}`)}
              >
                <Edit className="h-4 w-4 mr-1" /> Edit
              </Button>
              {/* Tombol Hapus dihilangkan */}
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
        pageSize: 5,
      },
    },
  });

  const handleExportPdf = () => {
    toast.info('Mengekspor data ke PDF...');
    const doc = new jsPDF();
    const title = "Data Santri Pesantren";
    const date = new Date().toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const exportableColumns = columns.filter(
      (col): col is ColumnWithAccessorKey<Santri> =>
        hasAccessorKey(col) && col.id !== 'actions'
    );

    const headers = exportableColumns.map(col => String(col.header));

    const tableData = table.getRowModel().rows.map(row => {
      return exportableColumns.map(col => String(row.original[col.accessorKey as keyof Santri]));
    });

    if (tableData.length === 0) {
      toast.error('Tidak ada data untuk diekspor ke PDF.');
      return;
    }

    doc.setFontSize(18);
    doc.text(title, 14, 15);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Tanggal Cetak: ${date}`, 14, 22);

    autoTable(doc, {
      head: [headers],
      body: tableData,
      startY: 30,
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 8, cellPadding: 3 },
      margin: { top: 10, right: 10, bottom: 10, left: 10 },
    });
    doc.save("data_santri.pdf");
    toast.success('Data berhasil diekspor ke PDF!');
  };

  const handleExportExcel = () => {
    toast.info('Mengekspor data ke Excel...');
    const dataToExport = table.getRowModel().rows.map(row => {
      const rowData: { [key: string]: any } = {};
      const exportableColumns = columns.filter(
        (col): col is ColumnWithAccessorKey<Santri> =>
          hasAccessorKey(col) && col.id !== 'actions'
      );

      exportableColumns.forEach(col => {
        const header = String(col.header);
        rowData[header] = String(row.original[col.accessorKey as keyof Santri]);
      });
      return rowData;
    });

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Santri");
    XLSX.writeFile(wb, "data_santri.xlsx");
    toast.success('Data berhasil diekspor ke Excel!');
  };

  const handleAddData = () => {
    toast.info('Membuka form tambah data santri...');
    // Implementasi logika untuk membuka form tambah data santri
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari santri..."
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

export default SantriTable;