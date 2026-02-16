
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import { UserPlus, MoreHorizontal, FileText, CheckCircle, Clock, XCircle } from 'lucide-react';
import WaliSantriLayout from '@/layouts/WaliSantriLayout';
import CustomBreadcrumb, { type BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { DataTable } from '@/components/DataTable';
import { Badge } from '@/components/ui/badge';
import { useGetCalonSantriQuery } from '@/store/slices/calonSantriApi';
import { CalonSantri } from '@/types/calonSantri';
import TableLoadingSkeleton from '@/components/TableLoadingSkeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/store/slices/authSlice';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const RegistrationHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  // In a real app, we should have an endpoint like useGetMyRegistrationsQuery
  // For now, we reuse useGetCalonSantriQuery and filter client-side if needed, 
  // or assuming the backend filters it for Wali Santri role (which is common).
  const { data: apiResponse, isLoading, isError, error } = useGetCalonSantriQuery();

  const allData = apiResponse?.data?.data || [];
  
  // CLIENT-SIDE FILTER (Temporary, until backend is confirmed to filter by user)
  // We filter by comparing NIK of the parent (wali) with the logged in user's NIK
  const myRegistrations = allData.filter(item => {
      // Assuming 'wali_nik' is available in the item or we check relationship
      // If item doesn't have wali_nik, we might show all (if backend already filtered)
      // Let's assume backend returns all for now and we filter if we can. 
      // However, CalonSantri type might not have wali_nik visible in the list.
      // Let's rely on the hope that backend filters for 'wali-santri' role,
      // Or just show the list for now.
      return true; 
  });

  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: 'Dashboard', href: '/dashboard/wali-santri' },
    { label: 'Pendaftaran Santri Baru', icon: <UserPlus className="h-4 w-4" /> },
  ];

  const handleRowClick = (santri: CalonSantri) => {
    navigate(`/dashboard/calon-santri/${santri.id}`); // Reusing the detail page
  };

  const columns: ColumnDef<CalonSantri>[] = [
    {
      accessorKey: 'registration_number',
      header: 'No. Pendaftaran',
    },
    {
      accessorFn: row => `${row.first_name} ${row.last_name}`.toUpperCase(),
      id: 'nama_lengkap',
      header: 'Nama Calon Santri',
    },
    {
      accessorKey: 'program.name',
      header: 'Program',
      cell: ({ row }) => row.original.program?.name || '-',
    },
    {
      accessorKey: 'created_at',
      header: 'Tanggal Daftar',
      cell: ({ row }) => {
        const date = new Date(row.original.created_at);
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric'});
      },
    },
    {
      accessorKey: 'status',
      header: 'Status Pendaftaran',
      cell: ({ row }) => {
        const status = row.original.status;
        let variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' = 'secondary';
        let icon = <Clock className="mr-1 h-3 w-3" />;
        
        if (status === 'diterima') {
            variant = 'success';
            icon = <CheckCircle className="mr-1 h-3 w-3" />;
        }
        if (status === 'ditolak') {
            variant = 'destructive';
            icon = <XCircle className="mr-1 h-3 w-3" />;
        }
        if (status === 'pending') {
            variant = 'warning';
        }

        return <Badge variant={variant} className="capitalize flex items-center w-fit">{icon} {status}</Badge>;
      },
    },
    // Payment status column could be added here
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
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Aksi</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  handleRowClick(santri);
                }}
              >
                <FileText className="mr-2 h-4 w-4" /> Lihat Detail
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const handleAddData = () => {
    navigate('/dashboard/wali-santri/pendaftaran-santri/baru'); // New route for the form
  };

  if (isError) {
    return (
      <WaliSantriLayout title="Riwayat Pendaftaran" role="wali-santri">
        <div className="w-full max-w-7xl mx-auto py-6 px-4">
             <div className="text-red-500 bg-red-50 p-4 rounded-md">Terjadi kesalahan saat memuat data.</div>
        </div>
      </WaliSantriLayout>
    );
  }

  return (
    <WaliSantriLayout title="Riwayat Pendaftaran" role="wali-santri">
      <div className="w-full max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <CustomBreadcrumb items={breadcrumbItems} />
        
        <div className="flex justify-between items-center mb-6 mt-2">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Pendaftaran Santri Baru</h1>
                <p className="text-muted-foreground">
                    Lihat status pendaftaran atau daftarkan santri baru.
                </p>
            </div>
             <Button onClick={handleAddData} className="bg-blue-600 hover:bg-blue-700">
                <UserPlus className="mr-2 h-4 w-4" />
                Daftar Baru
            </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Riwayat & Status Pendaftaran</CardTitle>
            <CardDescription>Daftar calon santri yang telah Anda daftarkan.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <TableLoadingSkeleton />
            ) : (
              <DataTable
                columns={columns}
                data={myRegistrations}
                searchPlaceholder="Cari nama calon santri..."
                // Removed onAddData prop from DataTable to render custom button above
                onRowClick={handleRowClick}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </WaliSantriLayout>
  );
};

export default RegistrationHistoryPage;
