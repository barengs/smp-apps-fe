import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import { UserPlus, MoreHorizontal, Check, X, Edit } from 'lucide-react';

import DashboardLayout from '@/layouts/DashboardLayout';
import CustomBreadcrumb, { type BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { DataTable } from '@/components/DataTable';
import { Badge } from '@/components/ui/badge';
import { useGetCalonSantriQuery } from '@/store/slices/calonSantriApi';
import { CalonSantri } from '@/types/calonSantri';
import TableLoadingSkeleton from '@/components/TableLoadingSkeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import * as toast from '@/utils/toast';

const CalonSantriPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: apiResponse, isLoading, isError, error } = useGetCalonSantriQuery();

  const calonSantriData = apiResponse?.data?.data || [];

  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: 'Dashboard', href: '/dashboard/administrasi' },
    { label: 'Pendaftaran Santri Baru', icon: <UserPlus className="h-4 w-4" /> },
  ];

  const handleRowClick = (santri: CalonSantri) => {
    navigate(`/dashboard/calon-santri/${santri.id}`);
  };

  const handleEdit = (santri: CalonSantri) => {
    navigate(`/dashboard/pendaftaran-santri/${santri.id}/edit`);
  };

  const handleAccept = (santri: CalonSantri) => {
    toast.showWarning(`Fitur "Terima" untuk ${santri.first_name} akan segera tersedia.`);
  };

  const handleReject = (santri: CalonSantri) => {
    toast.showWarning(`Fitur "Tolak" untuk ${santri.first_name} akan segera tersedia.`);
  };

  const columns: ColumnDef<CalonSantri>[] = [
    {
      accessorKey: 'registration_number',
      header: 'No. Pendaftaran',
    },
    {
      accessorFn: row => `${row.first_name} ${row.last_name}`.toUpperCase(),
      id: 'nama_lengkap',
      header: 'Nama Lengkap',
    },
    {
      accessorKey: 'previous_school',
      header: 'Asal Sekolah',
    },
    {
      accessorKey: 'created_at',
      header: 'Tanggal Daftar',
      cell: ({ row }) => {
        const date = new Date(row.original.created_at);
        return date.toLocaleDateString('id-ID');
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;
        let variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' = 'secondary'; // Tambahkan varian baru
        if (status === 'diterima') variant = 'success'; // Gunakan 'success' untuk diterima
        if (status === 'ditolak') variant = 'destructive';
        if (status === 'pending') variant = 'warning'; // Gunakan 'warning' untuk pending
        return <Badge variant={variant} className="capitalize">{status}</Badge>;
      },
    },
    {
      accessorKey: 'payment_status',
      header: 'Status Pembayaran',
      cell: ({ row }) => {
        const paymentStatus = row.original.payment_status;
        let variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' = 'secondary'; // Tambahkan varian baru
        if (paymentStatus === 'paid') variant = 'success'; // Gunakan 'success' untuk paid
        if (paymentStatus === 'pending') variant = 'warning'; // Gunakan 'warning' untuk pending
        if (paymentStatus === 'failed') variant = 'destructive';
        return <Badge variant={variant} className="capitalize">{paymentStatus}</Badge>;
      },
    },
    {
      id: 'actions',
      header: 'Aksi',
      cell: ({ row }) => {
        const santri = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="sr-only">Buka menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Aksi</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(santri);
                }}
              >
                <Edit className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  handleAccept(santri);
                }}
              >
                <Check className="mr-2 h-4 w-4" /> Terima
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  handleReject(santri);
                }}
                className="text-red-600"
              >
                <X className="mr-2 h-4 w-4" /> Tolak
              </DropdownMenuItem>
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
                data={calonSantriData}
                exportFileName="calon_santri"
                exportTitle="Data Calon Santri"
                onAddData={handleAddData}
                onRowClick={handleRowClick}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CalonSantriPage;