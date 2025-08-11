import React, { useState } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import CustomBreadcrumb from '@/components/CustomBreadcrumb';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, MapPin, UserCheck, Users } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/DataTable';
import { GuruTugas } from '@/types/guruTugas';
import * as toast from '@/utils/toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import GuruTugasForm from './GuruTugasForm'; // Import the new form

const GuruTugasPage: React.FC = () => {
  const { t } = useTranslation();
  const [isFormOpen, setIsFormOpen] = useState(false); // State to control dialog visibility

  const breadcrumbItems = [
    { label: t('sidebar.santriManagement'), href: "/dashboard/santri", icon: <Users className="h-4 w-4" /> },
    { label: t('sidebar.teacherAssignment'), icon: <User className="h-4 w-4" /> },
  ];

  // Define columns for the Guru Tugas table
  const columns: ColumnDef<GuruTugas>[] = [
    {
      accessorKey: "no",
      header: "No",
      cell: ({ row }) => row.index + 1, // Auto-incrementing number
    },
    {
      accessorKey: "nis",
      header: "NIS",
    },
    {
      accessorKey: "nama",
      header: "Nama",
    },
    {
      accessorKey: "periode",
      header: "Periode",
    },
    {
      accessorKey: "wilayahTugas",
      header: "Wilayah Tugas",
    },
    {
      accessorKey: "penanggungJawab",
      header: "Penanggung Jawab",
    },
  ];

  // Dummy data for the table
  const data: GuruTugas[] = [
    { id: "1", nis: "GT001", nama: "Ustadz Budi", periode: "2023/2024", wilayahTugas: "Jakarta", penanggungJawab: "Kepala Sekolah" },
    { id: "2", nis: "GT002", nama: "Ustadzah Fatimah", periode: "2023/2024", wilayahTugas: "Bandung", penanggungJawab: "Kepala Sekolah" },
    { id: "3", nis: "GT003", nama: "Ustadz Ahmad", periode: "2023/2024", wilayahTugas: "Surabaya", penanggungJawab: "Kepala Sekolah" },
    { id: "4", nis: "GT004", nama: "Ustadzah Siti", periode: "2023/2024", wilayahTugas: "Yogyakarta", penanggungJawab: "Kepala Sekolah" },
    { id: "5", nis: "GT005", nama: "Ustadz Hasan", periode: "2023/2024", wilayahTugas: "Semarang", penanggungJawab: "Kepala Sekolah" },
    { id: "6", nis: "GT006", nama: "Ustadzah Aisyah", periode: "2023/2024", wilayahTugas: "Malang", penanggungJawab: "Kepala Sekolah" },
    { id: "7", nis: "GT007", nama: "Ustadz Ali", periode: "2023/2024", wilayahTugas: "Bogor", penanggungJawab: "Kepala Sekolah" },
    { id: "8", nis: "GT008", nama: "Ustadzah Khadijah", periode: "2023/2024", wilayahTugas: "Depok", penanggungJawab: "Kepala Sekolah" },
    { id: "9", nis: "GT009", nama: "Ustadz Umar", periode: "2023/2024", wilayahTugas: "Bekasi", penanggungJawab: "Kepala Sekolah" },
    { id: "10", nis: "GT010", nama: "Ustadzah Zainab", periode: "2023/2024", wilayahTugas: "Tangerang", penanggungJawab: "Kepala Sekolah" },
  ];

  // Calculate totals for the info cards
  const totalGuruTugas = data.length;
  const totalWilayah = new Set(data.map(item => item.wilayahTugas)).size;
  const totalPenanggungJawab = new Set(data.map(item => item.penanggungJawab)).size;

  const handleAssignment = () => {
    setIsFormOpen(true); // Open the form dialog
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    // Optionally, refetch data or update table if needed
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
  };

  return (
    <DashboardLayout title={t('sidebar.teacherAssignment')} role="administrasi">
      <div className="container mx-auto px-4 pb-4"> {/* Added this wrapper div */}
        <CustomBreadcrumb items={breadcrumbItems} />
        <Card>
          <CardHeader>
            <CardTitle>{t('teacherAssignment.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-grow">
                <DataTable
                  columns={columns}
                  data={data}
                  exportFileName="DataGuruTugas"
                  exportTitle="Data Guru Tugas"
                  onAssignment={handleAssignment}
                />
              </div>
              <div className="flex flex-col gap-4 lg:w-1/4">
                <Card className="bg-success/10">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-success">
                      Total Guru Tugas
                    </CardTitle>
                    <User className="h-6 w-6 text-success" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-success">{totalGuruTugas}</div>
                    <p className="text-xs text-success-foreground">
                      Jumlah keseluruhan guru yang ditugaskan
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
                    <p className="text-xs text-info-foreground">
                      Jumlah wilayah tugas
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-warning/10">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-warning">
                      Total Penanggung Jawab
                    </CardTitle>
                    <UserCheck className="h-6 w-6 text-warning" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-warning">{totalPenanggungJawab}</div>
                    <p className="text-xs text-warning-foreground">
                      Jumlah penanggung jawab
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assignment Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
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