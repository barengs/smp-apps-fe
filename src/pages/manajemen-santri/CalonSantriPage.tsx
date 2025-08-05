import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import { UserPlus } from 'lucide-react';

import DashboardLayout from '@/layouts/DashboardLayout';
import CustomBreadcrumb, { type BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { DataTable } from '@/components/DataTable';
import { Badge } from '@/components/ui/badge';
import { useGetCalonSantriQuery } from '@/store/slices/calonSantriApi';
import { CalonSantri } from '@/types/calonSantri';
import TableLoadingSkeleton from '@/components/TableLoadingSkeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

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
        let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'secondary';
        if (status === 'diterima') variant = 'default';
        if (status === 'ditolak') variant = 'destructive';
        return <Badge variant={variant} className="capitalize">{status}</Badge>;
      },
    },
    // Kolom 'Aksi' dihapus karena fungsionalitasnya dipindahkan ke onRowClick
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
                onRowClick={handleRowClick} // Meneruskan fungsi handleRowClick
              />
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CalonSantriPage;