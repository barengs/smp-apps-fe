import React, { useState } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import CustomBreadcrumb from '@/components/CustomBreadcrumb';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, MapPin, UserCheck, Users, Building } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/DataTable';
import { InternshipListItem } from '@/types/guruTugas';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import GuruTugasForm from './GuruTugasForm';
import { useGetInternshipsQuery } from '@/store/slices/internshipApi';
import TableLoadingSkeleton from '@/components/TableLoadingSkeleton';

const GuruTugasPage: React.FC = () => {
  const { t } = useTranslation();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data: internshipResponse, isLoading, isError, error } = useGetInternshipsQuery();

  const breadcrumbItems = [
    { label: 'Manajemen Santri', href: "/dashboard/santri", icon: <Users className="h-4 w-4" /> },
    { label: 'Guru Tugas', icon: <User className="h-4 w-4" /> },
  ];

  const columns: ColumnDef<InternshipListItem>[] = [
    {
      accessorKey: "no",
      header: "No",
      cell: ({ row }) => row.index + 1,
    },
    {
      accessorKey: "student.nis",
      header: "NIS",
    },
    {
      accessorKey: "student.nama",
      header: "Nama",
    },
    {
      accessorKey: "academic_year.name",
      header: "Periode",
    },
    {
      accessorKey: "city.name",
      header: "Wilayah Tugas",
    },
    {
      accessorKey: "partner.name",
      header: "Institusi",
    },
    {
      accessorKey: "supervisor.name",
      header: "Penanggung Jawab",
    },
    {
        accessorKey: "status",
        header: "Status",
    },
  ];

  const data = internshipResponse?.data ?? [];

  const totalGuruTugas = data.length;
  const totalWilayah = new Set(data.map(item => item.city.name)).size;
  const totalInstitusi = new Set(data.map(item => item.partner.name)).size;

  const handleAssignment = () => {
    setIsFormOpen(true);
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
  };

  const renderContent = () => {
    if (isLoading) {
      return <TableLoadingSkeleton />;
    }
    if (isError) {
      return <div className="text-center py-10 text-red-500">Error: Gagal memuat data.</div>;
    }
    return (
      <DataTable
        columns={columns}
        data={data}
        exportFileName="DataGuruTugas"
        exportTitle="Data Guru Tugas"
        onAssignment={handleAssignment}
      />
    );
  };

  return (
    <DashboardLayout title="Guru Tugas" role="administrasi">
      <div className="container mx-auto px-4 pb-4">
        <CustomBreadcrumb items={breadcrumbItems} />
        <Card>
          <CardHeader>
            <CardTitle>Data Guru Tugas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-grow">
                {renderContent()}
              </div>
              <div className="flex flex-col gap-4 lg:w-1/4">
                <Card className="bg-success/10">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-success">
                      Total Santri Bertugas
                    </CardTitle>
                    <User className="h-6 w-6 text-success" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-success">{totalGuruTugas}</div>
                    <p className="text-xs text-foreground">
                      Jumlah keseluruhan santri yang ditugaskan
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-info/10">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-info">
                      Total Wilayah Tugas
                    </CardTitle>
                    <MapPin className="h-6 w-6 text-info" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-info">{totalWilayah}</div>
                    <p className="text-xs text-foreground">
                      Jumlah wilayah tugas yang berbeda
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-warning/10">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-warning">
                      Total Institusi
                    </CardTitle>
                    <Building className="h-6 w-6 text-warning" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-warning">{totalInstitusi}</div>
                    <p className="text-xs text-warning-foreground">
                      Jumlah institusi magang yang berbeda
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Formulir Penugasan</DialogTitle>
            <DialogDescription>
              Isi detail penugasan guru tugas.
            </DialogDescription>
          </DialogHeader>
          <GuruTugasForm onSuccess={handleFormSuccess} onCancel={handleFormCancel} />
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default GuruTugasPage;