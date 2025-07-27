import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, UserPlus, Users } from 'lucide-react';

import DashboardLayout from '@/layouts/DashboardLayout';
import CustomBreadcrumb, { type BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { DataTable } from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useGetCalonSantriQuery } from '@/store/slices/calonSantriApi';
import { CalonSantri } from '@/types/calonSantri';
import TableLoadingSkeleton from '@/components/TableLoadingSkeleton';

const CalonSantriPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: calonSantri, isLoading, isError, error } = useGetCalonSantriQuery();

  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: 'Manajemen Santri', href: '/dashboard/santri', icon: <Users className="h-4 w-4" /> },
    { label: 'Pendaftaran Santri Baru', icon: <UserPlus className="h-4 w-4" /> },
  ];

  const columns: ColumnDef<CalonSantri>[] = [
    {
      accessorKey: 'nomor_pendaftaran',
      header: 'No. Pendaftaran',
    },
    {
      accessorKey: 'nama_lengkap',
      header: 'Nama Lengkap',
    },
    {
      accessorKey: 'asal_sekolah',
      header: 'Asal Sekolah',
    },
    {
      accessorKey: 'tanggal_daftar',
      header: 'Tanggal Daftar',
      cell: ({ row }) => {
        const date = new Date(row.original.tanggal_daftar);
        return date.toLocaleDateString('id-ID');
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;
        let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'secondary';
        if (status === 'diterima') variant = 'default';
        if (status === 'ditolak') variant = 'destructive';
        return <Badge variant={variant} className="capitalize">{status}</Badge>;
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const santri = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Buka menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Aksi</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigate(`/dashboard/santri/pendaftaran/${santri.id}`)}>
                Lihat Detail
              </DropdownMenuItem>
              <DropdownMenuItem>Terima</DropdownMenuItem>
              <DropdownMenuItem>Tolak</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const handleAddData = () => {
    navigate('/dashboard/santri/add');
  };

  if (isError) {
    console.error("Error fetching calon santri:", error);
    return (
      <DashboardLayout title="Pendaftaran Santri Baru" role="administrasi">
        <div className="text-red-500">Terjadi kesalahan saat memuat data. Silakan cek konsol untuk detail.</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Pendaftaran Santri Baru" role="administrasi">
      <div className="container mx-auto py-4 px-4">
        <CustomBreadcrumb items={breadcrumbItems} />
        <div className="py-4">
          {isLoading ? (
            <TableLoadingSkeleton />
          ) : (
            <DataTable
              columns={columns}
              data={calonSantri || []}
              exportFileName="calon_santri"
              exportTitle="Data Calon Santri"
              onAddData={handleAddData}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CalonSantriPage;