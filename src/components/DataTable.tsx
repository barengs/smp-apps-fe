import React from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  PaginationState,
  SortingState,
  ExpandedState,
  getExpandedRowModel,
  FilterFn,
} from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Download } from 'lucide-react';
import { exportToExcel } from '@/utils/export';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Tambah tipe konfigurasi filter agar mendukung select
type FilterConfig = {
  placeholder?: string;
  type?: 'input' | 'select';
  options?: { label: string; value: string }[];
};

// Filter tepat: nilai kolom harus sama persis dengan nilai filter (case-insensitive)
const exactMatchFilter: FilterFn<any> = (row, columnId, filterValue) => {
  if (filterValue == null || filterValue === '') return true;
  const value = row.getValue(columnId);
  if (value == null) return false;
  const v = String(value).trim().toLowerCase();
  const f = String(filterValue).trim().toLowerCase();
  return v === f;
};

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  exportFileName?: string;
  exportTitle?: string;
  onRowClick?: (row: TData) => void;

  onAddData?: () => void;
  addButtonLabel?: string;
  onImportData?: () => void;
  onAssignment?: () => void;

  // Ubah tipe filterableColumns agar mendukung select
  filterableColumns?: Record<string, FilterConfig>;

  sorting?: SortingState;
  onSortingChange?: (updater: SortingState) => void;

  pageCount?: number;
  pagination?: PaginationState;
  onPaginationChange?: (updater: PaginationState) => void;

  isLoading?: boolean;
  
  // Add support for expandable rows
  expanded?: ExpandedState;
  onExpandedChange?: (updater: ExpandedState) => void;
  getSubRows?: (row: TData) => TData[] | undefined;

  // Aksi tambahan di sisi kiri (sebelah pencarian/filters)
  leftActions?: React.ReactNode;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  exportFileName,
  exportTitle,
  onRowClick,
  onAddData,
  addButtonLabel,
  onImportData,
  onAssignment,
  filterableColumns,
  sorting,
  onSortingChange,
  pageCount,
  pagination,
  onPaginationChange,
  isLoading,
  expanded,
  onExpandedChange,
  getSubRows,
  leftActions,
}: DataTableProps<TData, TValue>) {
  // Hapus penguncian pagination default; gunakan hanya saat manual pagination aktif
  // const defaultPagination: PaginationState = {
  //   pageIndex: 0,
  //   pageSize: 10,
  // };

  const manualPaginationEnabled = typeof pageCount === 'number' && pageCount >= 0 && !!pagination && !!onPaginationChange;

  // Tambah state pencarian global
  const [globalSearch, setGlobalSearch] = React.useState<string>('');

  // Filter data secara lokal berdasarkan pencarian global (kecuali kolom Aksi)
  const processedData = React.useMemo(() => {
    if (!globalSearch) return data;
    const search = globalSearch.toLowerCase();
    const excludedIds = new Set(['aksi', 'action', 'actions']);

    return (data as any[]).filter((row) => {
      for (const col of columns as any[]) {
        const id = (col.id as string) || (col.accessorKey as string) || '';
        if (!id) continue;
        if (excludedIds.has(id.toLowerCase())) continue;

        let value: any;

        // Jika kolom memiliki accessorFn, gunakan itu untuk mendapatkan nilai yang ditampilkan
        if (typeof (col as any).accessorFn === 'function') {
          try {
            value = (col as any).accessorFn(row);
          } catch {
            value = undefined;
          }
        } else {
          // Jika tidak, gunakan path accessorKey/id pada objek row
          const path = (col.accessorKey as string) || id;
          value = row;
          if (path) {
            for (const key of path.split('.')) {
              value = value?.[key];
            }
          }
        }

        if (value == null) continue;

        const str =
          typeof value === 'string'
            ? value
            : typeof value === 'number' || typeof value === 'boolean'
            ? String(value)
            : typeof value === 'object'
            ? JSON.stringify(value)
            : '';

        if (str.toLowerCase().includes(search)) return true;
      }
      return false;
    });
  }, [data, columns, globalSearch]);

  // Tetapkan filterFn='exact' untuk kolom yang dikonfigurasi sebagai select
  const processedColumns = React.useMemo(() => {
    return (columns as ColumnDef<TData, TValue>[]).map((col: any) => {
      const id = (col.id as string) || (col.accessorKey as string);
      if (id && filterableColumns && filterableColumns[id]?.type === 'select') {
        return { ...col, filterFn: 'exact' } as ColumnDef<TData, TValue>;
      }
      return col as ColumnDef<TData, TValue>;
    });
  }, [columns, filterableColumns]);

  const table = useReactTable({
    data: processedData,
    columns: processedColumns,
    state: {
      sorting: sorting,
      expanded: expanded,
      ...(manualPaginationEnabled ? { pagination: pagination! } : {}),
    },
    onSortingChange,
    onPaginationChange: manualPaginationEnabled ? onPaginationChange : undefined,
    onExpandedChange,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    manualPagination: manualPaginationEnabled,
    pageCount: manualPaginationEnabled ? pageCount : undefined,
    getSubRows: getSubRows || ((row: any) => row.subRows),
    // Daftarkan filter kustom agar bisa direferensikan dengan id 'exact'
    filterFns: { exact: exactMatchFilter },
    initialState: {
      pagination: { pageIndex: 0, pageSize: 10 },
    },
  });

  // Early return jika table belum siap
  if (!table) {
    return <Skeleton className="h-64 w-full" />;
  }

  // Ambil seluruh baris setelah sorting & filtering (bukan hanya halaman saat ini)
  const allRows = table.getRowModel().rows;

  const handleExport = () => {
    if (exportFileName && exportTitle) {
      exportToExcel(data as Record<string, any>[], exportFileName, exportTitle);
    }
  };

  // Handle page size change
  const handlePageSizeChange = (value: string) => {
    const newPageSize = parseInt(value);
    if (manualPaginationEnabled) {
      onPaginationChange!({
        pageIndex: 0,
        pageSize: newPageSize,
      });
    } else {
      table.setPageSize(newPageSize);
      table.setPageIndex(0);
    }
  };

  // Get current page info — hanya gunakan prop saat manual mode
  const currentPageSize = manualPaginationEnabled
    ? pagination!.pageSize
    : table.getState().pagination.pageSize;
  const currentPageIndex = manualPaginationEnabled
    ? pagination!.pageIndex
    : table.getState().pagination.pageIndex;

  // Hitung total halaman dari hasil filter agar navigasi akurat
  const computedTotalPageCount = manualPaginationEnabled
    ? Math.ceil(allRows.length / Math.max(currentPageSize, 1))
    : table.getPageCount();
  const shownTotalPageCount = Math.max((computedTotalPageCount as number) || 0, 1);

  // Handle pagination button clicks — panggil parent hanya saat manual mode
  const handleFirstPage = () => {
    if (manualPaginationEnabled) {
      onPaginationChange!({ pageIndex: 0, pageSize: currentPageSize });
    } else {
      table.setPageIndex(0);
    }
  };

  const handlePreviousPage = () => {
    if (manualPaginationEnabled) {
      onPaginationChange!({ pageIndex: currentPageIndex - 1, pageSize: currentPageSize });
    } else {
      table.previousPage();
    }
  };

  const handleNextPage = () => {
    if (manualPaginationEnabled) {
      onPaginationChange!({ pageIndex: currentPageIndex + 1, pageSize: currentPageSize });
    } else {
      table.nextPage();
    }
  };

  const handleLastPage = () => {
    const lastPage = shownTotalPageCount - 1;
    if (manualPaginationEnabled) {
      onPaginationChange!({ pageIndex: lastPage, pageSize: currentPageSize });
    } else {
      table.setPageIndex(lastPage);
    }
  };

  // Baris yang ditampilkan: lakukan slicing manual setelah filter
  const displayedRows = manualPaginationEnabled
    ? allRows.slice(
        currentPageIndex * currentPageSize,
        currentPageIndex * currentPageSize + currentPageSize
      )
    : table.getRowModel().rows;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Cari data..."
            value={globalSearch}
            onChange={(event) => setGlobalSearch(event.target.value)}
            className="max-w-sm"
          />

          {/* Render filter tambahan: input atau select sesuai konfigurasi */}
          {filterableColumns &&
            Object.entries(filterableColumns).map(([columnId, cfg]) => {
              // Cari kolom secara aman agar tidak memicu error saat id tidak ditemukan
              const colInstance = table.getAllColumns().find((c) => c.id === columnId);
              const currentValue = colInstance?.getFilterValue() as string | undefined;

              // Untuk filter bertipe select, gunakan pencocokan tepat agar tidak ada match substring
              if (cfg.type === 'select' && colInstance) {
                // filterFn telah di-set statis di processedColumns untuk kolom select
              }

              if (cfg.type === 'select' && cfg.options && Array.isArray(cfg.options)) {
                const CLEAR_FILTER_VALUE = '__ALL__';
                const safeOptions = [
                  { label: 'Semua', value: CLEAR_FILTER_VALUE },
                  ...cfg.options.filter((opt) => opt.value !== ''),
                ];

                return (
                  <Select
                    key={columnId}
                    value={currentValue ?? undefined}
                    onValueChange={(value) => {
                      if (!colInstance) return;
                      colInstance.setFilterValue(value === CLEAR_FILTER_VALUE ? undefined : value);
                    }}
                  >
                    <SelectTrigger className="w-40 h-8">
                      <SelectValue placeholder={cfg.placeholder || `Pilih ${columnId}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {safeOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                );
              }

              // Default ke input jika tidak diset atau bukan select
              return (
                <Input
                  key={columnId}
                  placeholder={cfg.placeholder || `Filter ${columnId}`}
                  value={currentValue}
                  onChange={(event) =>
                    colInstance?.setFilterValue(event.target.value)
                  }
                  className="max-w-sm"
                />
              );
            })}
          {leftActions ? <div className="ml-2">{leftActions}</div> : null}
        </div>

        <div className="flex items-center gap-2">
          {exportFileName && exportTitle && (
            <Button onClick={handleExport} variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export Excel
            </Button>
          )}
          {onImportData && (
            <Button onClick={onImportData} variant="outline" size="sm">
              Import
            </Button>
          )}
          {onAssignment && (
            <Button onClick={onAssignment} variant="outline" size="sm">
              Penugasan
            </Button>
          )}
          {onAddData && (
            <Button onClick={onAddData} size="sm">
              {addButtonLabel || 'Tambah Data'}
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-md border">
        {isLoading ? (
          <Skeleton className="h-48 w-full" />
        ) : (
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {displayedRows?.length ? (
                displayedRows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    onClick={() => onRowClick?.(row.original)}
                    className={onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}
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
                    Tidak ada data.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">Baris per halaman:</span>
          <Select value={currentPageSize.toString()} onValueChange={handlePageSizeChange}>
            <SelectTrigger className="w-20 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleFirstPage}
            disabled={currentPageIndex === 0}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousPage}
            disabled={currentPageIndex === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-gray-700">
            Halaman {currentPageIndex + 1} dari {shownTotalPageCount}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={currentPageIndex >= shownTotalPageCount - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLastPage}
            disabled={currentPageIndex >= shownTotalPageCount - 1}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}