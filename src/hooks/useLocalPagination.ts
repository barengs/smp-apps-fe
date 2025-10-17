import { useMemo, useState } from 'react';
import { PaginationState } from '@tanstack/react-table';

export function useLocalPagination<T>(data: T[], initialPageSize: number = 10) {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: initialPageSize,
  });

  const paginatedData = useMemo(() => {
    const start = pagination.pageIndex * pagination.pageSize;
    return data.slice(start, start + pagination.pageSize);
  }, [data, pagination]);

  const pageCount = useMemo(() => {
    if (!data || data.length === 0) return 0;
    return Math.ceil(data.length / pagination.pageSize);
  }, [data, pagination.pageSize]);

  return { paginatedData, pagination, setPagination, pageCount };
}