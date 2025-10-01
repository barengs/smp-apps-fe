import React, { useState, useEffect } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  VisibilityState,
  ColumnFiltersState,
  getFacetedRowModel,
  getFacetedUniqueValues,
  PaginationState,
  getExpandedRowModel,
  type ExpandedState,
  type Row,
  SortingState, // Import SortingState
  getSortedRowModel, // Import getSortedRowModel
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
import { ChevronDown, FileDown, Search, PlusCircle, Upload, FileText } from 'lucide-react';
import * as toast from '@/utils/toast';
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

interface FilterableColumn {
  placeholder: string;
}

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  exportFileName: string;
  exportTitle: string;
  onAddData?: () => void;
  onImportData?: () => void;
  onRowClick?: (rowData: TData) => void;
  filterableColumns?: Record<string, FilterableColumn>;
  manualPagination?: boolean;
  pageCount?: number;
  pagination?: PaginationState;
  onPaginationChange?: React.Dispatch<React.SetStateAction<PaginationState>>;
  isLoading?: boolean;
  onAssignment?: () => void;
  renderSubComponent?: (props: { row: Row<TData> }) => React.ReactElement;
  getRowId?: (originalRow: TData) => string;
  expanded?: ExpandedState;
  onExpandedChange?: (updater: React.SetStateAction<ExpandedState>) => void;
  sorting?: SortingState;
  onSortingChange?: (updater: React.SetStateAction<SortingState>) => void;
  addButtonLabel?: string;
}

function hasAccessorKey<TData>(
  column: ColumnDef<TData>
): column is ColumnDef<TData> & { accessorKey: keyof TData } {
  return 'accessorKey' in column;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  exportFileName,
  exportTitle,
  onAddData,
  onImportData,
  onRowClick,
  filterableColumns = {},
  manualPagination = false,
  pageCount: controlledPageCount,
  pagination: controlledPagination,
  onPaginationChange: setControlledPagination,
  isLoading = false,
  onAssignment,
  renderSubComponent,
  getRowId,
  expanded,
  onExpandedChange,
  sorting,
  onSortingChange,
  addButtonLabel = 'Tambah Data',
}: DataTableProps<TData, TValue>) {
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [internalSorting, setInternalSorting] = useState<SortingState>([]); // State internal untuk sorting

  const [internalPagination, setInternalPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const currentPaginationState = manualPagination ? controlledPagination : internalPagination;
  const currentSetPaginationState = manualPagination ? setControlledPagination : setInternalPagination;
  const effectivePaginationState = currentPaginationState || { pageIndex: 0, pageSize: 10 };
  const effectiveSortingState = sorting || internalSorting; // Gunakan sorting dari prop atau internal

  const table = useReactTable({
    data,
    columns,
    getRowId,
    state: {
      globalFilter,
      columnVisibility,
      columnFilters,
      pagination: effectivePaginationState,
      expanded: expanded || {},
      sorting: effectiveSortingState, // Tambahkan sorting ke state
    },
    manualPagination,
    onPaginationChange: currentSetPaginationState,
    onExpandedChange: onExpandedChange,
    onSortingChange: onSortingChange || setInternalSorting, // Gunakan onSortingChange dari prop atau internal
    getExpandedRowModel: getExpandedRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getSortedRowModel: getSortedRowModel(), // Tambahkan getSortedRowModel
    getSubRows: (row) => (row as any).subRows, // Menambahkan ini secara eksplisit
  });

  const exportToPdf = (allData: boolean) => {
    const exportData = allData && !manualPagination ? data : table.getRowModel().rows.map(row => row.original);
    const fileNameSuffix = allData && !manualPagination ? '_semua' : '';
    const toastMessage = allData && !manualPagination ? 'Mengekspor semua data ke PDF...' : 'Mengekspor tampilan saat ini ke PDF...';

    toast.showWarning(toastMessage);
    const doc = new jsPDF();
    const date = new Date().toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const exportableColumns = columns.filter(
      (col): col is ColumnDef<TData> & { accessorKey: keyof TData } =>
        hasAccessorKey(col) && col.id !== 'actions' && col.id !== 'expander'
    );

    const headers = exportableColumns.map(col => String(col.header));

    const tableData = exportData.map(item => {
      return exportableColumns.map(col => {
        const value = item[col.accessorKey];
        return value !== null && value !== undefined ? String(value) : '';
      });
    });

    if (tableData.length === 0) {
      toast.showError('Tidak ada data untuk diekspor ke PDF.');
      return;
    }

    doc.setFontSize(18);
    doc.text(exportTitle, 14, 15);
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
    toast.showSuccess('Data berhasil diekspor ke PDF!');
    doc.save(`${exportFileName}${fileNameSuffix}.pdf`);
  };

  const exportToExcel = (allData: boolean) => {
    const exportData = allData && !manualPagination ? data : table.getRowModel().rows.map(row => row.original);
    const fileNameSuffix = allData && !manualPagination ? '_semua' : '';
    const toastMessage = allData && !manualPagination ? 'Mengekspor semua data ke Excel...' : 'Mengekspor tampilan saat ini ke Excel...';

    toast.showWarning(toastMessage);
    const dataToExport = exportData.map(item => {
      const rowData: { [key: string]: any } = {};
      const exportableColumns = columns.filter(
        (col): col is ColumnDef<TData> & { accessorKey: keyof TData } =>
          hasAccessorKey(col) && col.id !== 'actions' && col.id !== 'expander'
      );

      exportableColumns.forEach(col => {
        const header = String(col.header);
        const value = item[col.accessorKey];
        rowData[header] = value !== null && value !== undefined ? String(value) : '';
      });
      return rowData;
    });

    if (dataToExport.length === 0) {
      toast.showError('Tidak ada data untuk diekspor ke Excel.');
      return;
    }

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, exportTitle);
    toast.showSuccess('Data berhasil diekspor ke Excel!');
    XLSX.writeFile(wb, `${exportFileName}${fileNameSuffix}.xlsx`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {onAddData && (
            <Button variant="success" onClick={onAddData}>
              <PlusCircle className="mr-2 h-4 w-4" /> {addButtonLabel}
            </Button>
          )}
          {onAssignment && (
            <Button onClick={onAssignment}>
              <FileText className="mr-2 h-4 w-4" /> Kenaikan Kelas
            </Button>
          )}
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari..."
              value={globalFilter ?? ''}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className="pl-9"
            />
          </div>
          {Object.keys(filterableColumns).map((columnId) => {
            const column = table.getColumn(columnId);
            if (!column) return null;

            const facetedValues = column.getFacetedUniqueValues();
            const sortedValues = Array.from(facetedValues.keys()).sort();

            // Define a placeholder for empty string values
            const EMPTY_VALUE_PLACEHOLDER = '__EMPTY_VALUE__';

            return (
              <Select
                key={columnId}
                onValueChange={(selectedValue) => {
                  const filterValue = selectedValue === 'all'
                    ? undefined
                    : (selectedValue === EMPTY_VALUE_PLACEHOLDER ? '' : selectedValue);
                  column.setFilterValue(filterValue);
                }}
                value={
                  (column.getFilterValue() === '' && column.getFilterValue() !== undefined)
                    ? EMPTY_VALUE_PLACEHOLDER
                    : (column.getFilterValue() as string) ?? 'all'
                }
              >
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder={filterableColumns[columnId].placeholder} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  {sortedValues.map((value) => (
                    <SelectItem
                      key={value === '' ? EMPTY_VALUE_PLACEHOLDER : value}
                      value={value === '' ? EMPTY_VALUE_PLACEHOLDER : value}
                    >
                      {value === '' ? '(Kosong)' : value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            );
          })}
        </div>
        <div className="flex space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
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
          
          {onImportData && (
            <Button variant="outline" onClick={onImportData}>
              <Upload className="mr-2 h-4 w-4" /> Impor
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Ekspor <FileDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Ekspor Tampilan Saat Ini</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => exportToPdf(false)}>
                Ekspor ke PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToExcel(false)}>
                Ekspor ke Excel
              </DropdownMenuItem>
              {!manualPagination && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Ekspor Semua Data</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => exportToPdf(true)}>
                    Ekspor Semua ke PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => exportToExcel(true)}>
                    Ekspor Semua ke Excel
                  </DropdownMenuItem>
                </>
              )}
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
                    <TableHead 
                      key={header.id} 
                      className={header.column.id === 'expander' ? "w-10" : ""} // Menambahkan lebar tetap
                      {...{
                        onClick: header.column.getCanSort()
                          ? header.column.getToggleSortingHandler()
                          : undefined,
                      }}
                    >
                      <div className="flex items-center">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                        {header.column.getCanSort() && (
                          <span className="ml-2">
                            {{
                              asc: ' 🔼',
                              desc: ' 🔽',
                            }[header.column.getIsSorted() as string] ?? ''}
                          </span>
                        )}
                      </div>
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Memuat data...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <React.Fragment key={row.id}>
                  <TableRow
                    data-state={row.getIsSelected() && 'selected'}
                    onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                    className={onRowClick ? "cursor-pointer hover:bg-muted/50" : ""}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell 
                        key={cell.id} 
                        className={cell.column.id === 'expander' ? "py-2 pr-0 w-10" : "py-2"} // Menambahkan lebar tetap
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                  {renderSubComponent && row.getIsExpanded() && (
                    <TableRow>
                      <TableCell colSpan={row.getVisibleCells().length} className="p-0">
                        {renderSubComponent({ row })}
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
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
              setTimeout(() => {
                currentSetPaginationState && currentSetPaginationState({
                  pageIndex: 0,
                  pageSize: Number(value),
                });
              }, 0);
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
}