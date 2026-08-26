import React, { useState } from 'react';
import { useGetAccountsQuery } from '@/store/slices/accountApi';
import { RekeningTable } from './RekeningTable';
import { useNavigate } from 'react-router-dom';
import { Account } from '@/types/keuangan';
import DashboardLayout from '@/layouts/DashboardLayout';
import CustomBreadcrumb from '@/components/CustomBreadcrumb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PaginationState, SortingState } from '@tanstack/react-table';
import TableLoadingSkeleton from '@/components/TableLoadingSkeleton';

const RekeningPage: React.FC = () => {
  const navigate = useNavigate();

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([]);

  const { data: accountsResponse, isLoading, isFetching, refetch } = useGetAccountsQuery({
    page: pagination.pageIndex + 1,
    per_page: pagination.pageSize,
    sort_by: sorting.length > 0 ? sorting[0].id : undefined,
    sort_order: sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : undefined,
  });

  const handleViewDetails = (account: Account) => {
    navigate(`/dashboard/santri/rekening/${account.account_number}`);
  };

  const breadcrumbItems = [
    { label: 'Manajemen Santri', href: '/dashboard/santri' },
    { label: 'Rekening' }
  ];

  return (
    <DashboardLayout title="Manajemen Rekening" role="administrasi">
      <div className="container mx-auto px-4 pb-4">
        <CustomBreadcrumb items={breadcrumbItems} />
        
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl font-bold">Data Rekening Santri</CardTitle>
                <CardDescription>
                  Lihat daftar rekening bank santri
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading || isFetching ? (
              <TableLoadingSkeleton />
            ) : (
              (() => {
                const isServerPaginated =
                  !!accountsResponse &&
                  typeof accountsResponse.last_page === 'number' &&
                  accountsResponse.last_page >= 1 &&
                  typeof accountsResponse.current_page === 'number';
                const normalizedData = accountsResponse?.data || [];
                return (
                  <RekeningTable
                    data={normalizedData}
                    onViewDetails={handleViewDetails}
                    pagination={isServerPaginated ? pagination : undefined}
                    onPaginationChange={isServerPaginated ? setPagination : undefined}
                    pageCount={isServerPaginated ? accountsResponse!.last_page : undefined}
                    sorting={sorting}
                    onSortingChange={setSorting}
                  />
                );
              })()
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default RekeningPage;