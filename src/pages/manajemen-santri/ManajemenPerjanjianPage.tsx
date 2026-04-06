import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ColumnDef, PaginationState } from '@tanstack/react-table';
import DashboardLayout from '../../layouts/DashboardLayout';
import { DataTable } from '../../components/DataTable';
import { useListStudentAgreementsQuery, Student } from '@/store/slices/studentApi';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileEdit, CheckCircle2, Circle } from 'lucide-react';
import CustomBreadcrumb from '@/components/CustomBreadcrumb';
import { Users, FileText } from 'lucide-react';

const ManajemenPerjanjianPage: React.FC = () => {
  const navigate = useNavigate();
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [search, setSearch] = useState('');

  const { data: response, isLoading, isFetching } = useListStudentAgreementsQuery({
    page: pagination.pageIndex + 1,
    per_page: pagination.pageSize,
    search: search === '' ? undefined : search,
  });

  const students = response?.data?.data || [];
  const totalItems = response?.data?.total || 0;
  const pageCount = response?.data?.last_page || 0;

  const breadcrumbItems = [
    { label: 'Manajemen Santri', href: '/dashboard/santri', icon: <Users className="h-4 w-4" /> },
    { label: 'Manajemen Perjanjian', icon: <FileText className="h-4 w-4" /> },
  ];

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Nama Santri',
        cell: ({ row }) => `${row.original.first_name} ${row.original.last_name || ''}`.trim(),
      },
      {
        accessorKey: 'nis',
        header: 'NIS',
      },
      {
        accessorKey: 'program.name',
        header: 'Program',
        cell: ({ row }) => row.original.program?.name || '-',
      },
      {
        id: 'step1',
        header: 'Step 1: Kontrak',
        cell: ({ row }) => {
          const agreed = row.original.agreement?.contract_agreed;
          return agreed ? (
            <Badge variant="success" className="gap-1">
              <CheckCircle2 className="h-3 w-3" /> Selesai
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1 text-muted-foreground">
              <Circle className="h-3 w-3" /> Pending
            </Badge>
          );
        },
      },
      {
        id: 'step2',
        header: 'Step 2: Taat UU',
        cell: ({ row }) => {
          const agreed = row.original.agreement?.compliance_agreed;
          return agreed ? (
            <Badge variant="success" className="gap-1">
              <CheckCircle2 className="h-3 w-3" /> Selesai
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1 text-muted-foreground">
              <Circle className="h-3 w-3" /> Pending
            </Badge>
          );
        },
      },
      {
        id: 'step3',
        header: 'Step 3: Tes Urin',
        cell: ({ row }) => {
          const agreed = row.original.agreement?.urine_test_agreed;
          return agreed ? (
            <Badge variant="success" className="gap-1">
              <CheckCircle2 className="h-3 w-3" /> Selesai
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1 text-muted-foreground">
              <Circle className="h-3 w-3" /> Pending
            </Badge>
          );
        },
      },
      {
        id: 'actions',
        header: 'Aksi',
        cell: ({ row }) => (
          <Button
            variant="outline"
            size="sm"
            className="border-primary text-primary hover:bg-primary/5"
            onClick={() => navigate(`/dashboard/santri/${row.original.id}/agreement`)}
          >
            <FileEdit className="h-4 w-4 mr-1" /> Kelola
          </Button>
        )
      }
    ],
    [navigate]
  );

  return (
    <DashboardLayout title="Manajemen Perjanjian" role="administrasi">
      <div className="container mx-auto py-4 px-4 space-y-6">
        <CustomBreadcrumb items={breadcrumbItems} />
        
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Daftar Perjanjian Santri</h2>
              <p className="text-muted-foreground">
                Lacak kemajuan perjanjian kontrak, ketaatan hukum, dan tes urin setiap santri.
              </p>
            </div>
          </div>

          <DataTable
            columns={columns}
            data={students}
            isLoading={isLoading || isFetching}
            pagination={pagination}
            onPaginationChange={setPagination}
            pageCount={pageCount}
            totalItems={totalItems}
            onSearchChange={setSearch}
            searchQuery={search}
            searchPlaceholder="Cari nama atau NIS santri..."
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ManajemenPerjanjianPage;
