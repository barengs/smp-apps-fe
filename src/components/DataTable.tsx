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
} from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Download } from 'lucide-react';
import { exportToExcel } from '@/utils/export';
import { Skeleton } from '@/components/ui/skeleton';

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

  filterableColumns?: Record<string, { placeholder?: string }>;

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
}: DataTableProps<TData, TValue>) {
  // Set default pagination state jika tidak ada
  const defaultPagination: PaginationState = {
    pageIndex: 0,
    pageSize: 10,
  };

  const manualPaginationEnabled = typeof pageCount === 'number' && pageCount >= 0 && !!pagination;

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting: sorting,
      pagination: pagination || defaultPagination,
      expanded: expanded,
    },
    onSortingChange,
    onPaginationChange,
    onExpandedChange,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    manualPagination: manualPaginationEnabled,
    pageCount: manualPaginationEnabled ? pageCount : undefined,
    getSubRows: getSubRows || ((row: any) => row.subRows),
  });

  // Early return jika table belum siap
  if (!table) {
    return <Skeleton className="h-64 w-full" />;
  }

  const handleExport = () => {
    if (exportFileName && exportTitle) {
      exportToExcel(data as Record<string, any>[], exportFileName, exportTitle);
    }
  };

  // Ambil kolom pertama yang valid dari table instance, bukan dari definisi ColumnDef
  const firstLeafColumnId = table.getAllLeafColumns()[0]?.id;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {firstLeafColumnId && (
            <Input
              placeholder="Cari data..."
              value={(table.getColumn(firstLeafColumnId)?.getFilterValue() as string) ?? ''}
              onChange={(event) =>
                table.getColumn(firstLeafColumnId)?.setFilterValue(event.target.value)
              }
              className="max-w-sm"
            />
          )}

          {/* Render input filter tambahan bila disediakan */}
          {filterableColumns &&
            Object.entries(filterableColumns).map(([columnId, cfg]) => (
              <Input
                key={columnId}
                placeholder={cfg.placeholder || `Filter ${columnId}`}
                value={(table.getColumn(columnId)?.getFilterValue() as string) ?? ''}
                onChange={(event) =>
                  table.getColumn(columnId)?.setFilterValue(event.target.value)
                }
                className="max-w-sm"
              />
            ))}
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
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
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

      <div className="flex items-center justify-end space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.firstPage?.()}
          disabled={!table.getCanPreviousPage?.()}
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage?.()}
          disabled={!table.getCanPreviousPage?.()}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm text-gray-700">
          Halaman {table.getState().pagination?.pageIndex + 1 || 1} dari {table.getPageCount?.() || 1}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage?.()}
          disabled={!table.getCanNextPage?.()}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.lastPage?.()}
          disabled={!table.getCanNextPage?.()}
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}