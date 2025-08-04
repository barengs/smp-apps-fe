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
import { CalonSantri, PaginatedResponse } from '@/types/calonSantri'; // Import PaginatedResponse
import TableLoadingSkeleton from '@/components/TableLoadingSkeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const CalonSantriPage: React.FC = () => {
  const navigate = useNavigate();
  // Destructure data correctly, it will be PaginatedResponse<CalonSantri>
  const { data: paginatedCalonSantri, isLoading, isError, error } = useGetCalonSantriQuery();

  // Extract the actual array of santri data from the paginated response
  const calonSantriData = paginatedCalonSantri?.data || [];

  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: 'Dashboard', href: '/dashboard/administrasi' },
    { label: 'Pendaftaran Santri Baru', icon: <UserPlus className="h-4 w-4" /> },
  ];

  const columns: ColumnDef<CalonSantri>[] = [
    {
      accessorKey: 'registration_number', // Changed from nomor_pendaftaran
      header: 'No. Pendaftaran',
    },
    {
      accessorFn: row => `${row.first_name} ${row.last_name}`, // Combine first_name and last_name
      id: 'nama_lengkap', // Give it a unique ID for the column
      header: 'Nama Lengkap',
    },
    {
      accessorKey: 'previous_school', // Changed from asal_sekolah
      header: 'Asal Sekolah',
    },
    {
      accessorKey: 'created_at', // Changed from tanggal_daftar
      header: 'Tanggal Daftar',
      cell: ({ row }) => {
        const date = new Date(row.original.created_at); // Use created_at
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
              <DropdownMenuItem onClick={() => navigate(`/dashboard/pendaftaran-santri/${santri.id}`)}>
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
    navigate('/dashboard/pendaftaran-santri/add');
  };

  if (isError) {
    console.error("Error fetching calon santri:", error);
    return (
      <DashboardLayout title="Pendaftaran Calon Santri" role="administrasi">
        <div className="text-red-500">Terjadi kesalahan saat memuat data. Silakan cek konsol untuk detail.</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Pendaftaran Calon Santri" role="administrasi">
      <div className="container mx-auto px-4 pb-4">
        <CustomBreadcrumb items={breadcrumbItems} />
        <Card>
          <CardHeader>
            <CardTitle>Pendaftaran Calon Santri</CardTitle>
            <CardDescription>Kelola daftar calon santri yang mendaftar di sistem.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <TableLoadingSkeleton />
            ) : (
              <DataTable
                columns={columns}
                data={calonSantriData} // Pass the extracted data array
                exportFileName="calon_santri"
                exportTitle="Data Calon Santri"
                onAddData={handleAddData}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CalonSantriPage;