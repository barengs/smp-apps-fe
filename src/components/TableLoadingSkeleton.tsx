import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TableLoadingSkeletonProps {
  numRows?: number;
  numCols?: number;
}

const TableLoadingSkeleton: React.FC<TableLoadingSkeletonProps> = ({ numRows = 5, numCols = 6 }) => {
  return (
    <div className="space-y-4">
      {/* Top controls skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-full max-w-sm" />
        <div className="flex space-x-2">
          <Skeleton className="h-10 w-28 hidden sm:block" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-28" />
        </div>
      </div>

      {/* Table skeleton */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {Array.from({ length: numCols }).map((_, i) => (
                <TableHead key={i}>
                  <Skeleton className="h-5 w-full" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: numRows }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: numCols }).map((_, j) => (
                  <TableCell key={j} className="py-3">
                    <Skeleton className="h-5 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination controls skeleton */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <Skeleton className="h-8 w-32 hidden sm:block" />
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-24" />
      </div>
    </div>
  );
};

export default TableLoadingSkeleton;