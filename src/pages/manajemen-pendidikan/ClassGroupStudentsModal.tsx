import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useGetClassGroupStudentsQuery } from '@/store/slices/studentClassApi';
import type { Student } from '@/store/slices/studentApi';
import { DataTable } from '@/components/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import TableLoadingSkeleton from '@/components/TableLoadingSkeleton';
import { Button } from '@/components/ui/button';
import { FileText, Download, Loader2 } from 'lucide-react';
import { useGetStudentCardSettingsQuery } from '@/store/slices/studentCardApi';
import { useGetControlPanelSettingsQuery } from '@/store/slices/controlPanelApi';
import { imageUrlToBase64, getFullStorageUrl } from '@/utils/pdfExport';
import { generateRombelStudentsPdf } from '@/components/reports/RombelStudentsPdf';

interface ClassGroupStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  classGroupId: number | null;
  classGroupName: string;
}

const ClassGroupStudentsModal: React.FC<ClassGroupStudentsModalProps> = ({
  isOpen,
  onClose,
  classGroupId,
  classGroupName,
}) => {
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const { data: settingsResponse } = useGetStudentCardSettingsQuery();
  const { data: controlPanelData } = useGetControlPanelSettingsQuery();

  const { data: students, isLoading, error } = useGetClassGroupStudentsQuery(classGroupId!, {
    skip: classGroupId === null,
  });

  const handleExportPdf = async () => {
    if (!students || students.length === 0) return;
    setIsExportingPdf(true);
    try {
      const settings = settingsResponse?.data;
      let kopSuratUrl: string | undefined = undefined;

      if (settings?.kop_surat) {
        const fullUrl = getFullStorageUrl(settings.kop_surat);
        if (fullUrl) {
          kopSuratUrl = (await imageUrlToBase64(fullUrl)) || fullUrl;
        }
      } else {
        const fallbackUrl = `${window.location.origin}/images/KOP PESANTREN.png`;
        kopSuratUrl = (await imageUrlToBase64(fallbackUrl)) || fallbackUrl;
      }

      await generateRombelStudentsPdf(classGroupName, students, kopSuratUrl);
    } catch (err) {
      console.error('Gagal export PDF:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleExportExcel = async () => {
    if (!students || students.length === 0) return;
    const { exportRombelStudentsToExcel } = await import('@/utils/export');
    const appSettings = controlPanelData?.data;
    exportRombelStudentsToExcel({
      classGroupName,
      students,
      institutionName: appSettings?.app_name || 'PONDOK PESANTREN',
      institutionAddress: appSettings?.app_address,
      fileName: `Daftar_Santri_Rombel_${classGroupName.replace(/\s+/g, '_')}`,
    });
  };

  const columns: ColumnDef<Student>[] = [
    {
      accessorKey: 'nis',
      header: 'NIS',
    },
    {
      id: 'name',
      header: 'Nama Siswa',
      accessorFn: (row: Student) => `${row.first_name || ''} ${row.last_name || ''}`.trim(),
    },
    {
      accessorKey: 'gender',
      header: 'Jenis Kelamin',
      cell: ({ row }) => {
        const g = row.original?.gender;
        return g === 'L' ? 'Laki-laki' : (g === 'P' ? 'Perempuan' : '-');
      },
    },
    {
      accessorKey: 'address',
      header: 'Alamat',
      cell: ({ row }) => {
        const s = row.original;
        if (s?.address && s.address.trim()) return s.address;
        const region = [s?.village, s?.district].filter(Boolean).join(', ');
        return region || '-';
      },
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Daftar Siswa - Rombel: {classGroupName}</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto py-4">
          {isLoading ? (
            <TableLoadingSkeleton numCols={4} />
          ) : error ? (
            <div className="text-red-500 text-center py-4">
              Gagal memuat data siswa.
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={students || []}
              exportImportElement={
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleExportPdf}
                    variant="outline"
                    size="sm"
                    disabled={isExportingPdf || !students?.length}
                  >
                    {isExportingPdf ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin text-red-500" />
                    ) : (
                      <FileText className="mr-2 h-4 w-4 text-red-500" />
                    )}
                    Export PDF
                  </Button>
                  <Button
                    onClick={handleExportExcel}
                    variant="outline"
                    size="sm"
                    disabled={!students?.length}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export Excel
                  </Button>
                </div>
              }
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClassGroupStudentsModal;
