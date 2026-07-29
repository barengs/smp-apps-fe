import React, { useState, useMemo } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import CustomBreadcrumb, { type BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { BookCopy, CalendarClock, Download, Upload, DatabaseBackup, Printer, Edit2, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import * as toast from '@/utils/toast';
import { DataTable } from '@/components/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import LessonScheduleForm from './LessonScheduleForm';
import { useGetClassSchedulesQuery, useExportClassSchedulesMutation, useBackupClassSchedulesMutation, useDeleteClassScheduleMutation, type ClassScheduleData } from '@/store/slices/classScheduleApi';
import { useGetActiveTahunAjaranQuery, useGetTahunAjaranQuery } from '@/store/slices/tahunAjaranApi';
import TableLoadingSkeleton from '@/components/TableLoadingSkeleton';
import { useNavigate } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useReactToPrint } from 'react-to-print';
import { PrintJadwalPelajaran } from './PrintJadwalPelajaran';
import { Badge } from '@/components/ui/badge';

const JadwalPelajaranPage: React.FC = () => {
  const { t } = useTranslation();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(null);
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState<string>('');
  const printComponentRef = React.useRef<HTMLDivElement>(null);

  // Get active academic year for initial default
  const { data: activeAcademicYear } = useGetActiveTahunAjaranQuery();
  // Fetch all academic years for selection
  const { data: academicYears = [] } = useGetTahunAjaranQuery();

  React.useEffect(() => {
    if (activeAcademicYear && !selectedAcademicYearId) {
      setSelectedAcademicYearId(activeAcademicYear.id.toString());
    }
  }, [activeAcademicYear, selectedAcademicYearId]);

  const { data: schedulesResponse, isLoading, isError } = useGetClassSchedulesQuery({
    academic_year_id: selectedAcademicYearId ? Number(selectedAcademicYearId) : undefined
  });
  const [exportClassSchedules, { isLoading: isExporting }] = useExportClassSchedulesMutation();
  const [backupClassSchedules, { isLoading: isBackingUp }] = useBackupClassSchedulesMutation();
  const [deleteClassSchedule] = useDeleteClassScheduleMutation();
  const navigate = useNavigate();

  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: t('sidebar.curriculum'), href: '/dashboard/manajemen-kurikulum/kenaikan-kelas', icon: <BookCopy className="h-4 w-4" /> },
    { label: t('sidebar.lessonSchedule'), icon: <CalendarClock className="h-4 w-4" /> },
  ];

  // Flatten the nested structure for the table
  const flattenScheduleData = (schedules: ClassScheduleData[]) => {
    const flattened: any[] = [];
    schedules.forEach(schedule => {
      schedule.details.forEach(detail => {
        flattened.push({
          id: detail.id,
          scheduleId: schedule.id,
          education: schedule.education,
          classroom: detail.classroom,
          class_group: detail.class_group,
          day: detail.day,
          study: detail.study,
          teacher: detail.teacher,
          lesson_hour: detail.lesson_hour,
          lesson_session: schedule.lesson_session?.name || '-',
          status: schedule.status,
        });
      });
    });
    return flattened;
  };

  const handleEdit = (scheduleId: number) => {
    setSelectedScheduleId(scheduleId);
    setIsFormOpen(true);
  };

  const handleDelete = async (scheduleId: number) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus jadwal ini? Semua detail dan pertemuan terkait akan ikut terhapus.')) {
      const loadingId = toast.showLoading('Menghapus jadwal...');
      try {
        await deleteClassSchedule(scheduleId).unwrap();
        toast.showSuccess('Jadwal berhasil dihapus');
      } catch (error: any) {
        console.error('Gagal menghapus jadwal:', error);
        toast.showError(error?.data?.message || 'Gagal menghapus jadwal');
      } finally {
        toast.dismissToast(loadingId);
      }
    }
  };

  const columns: ColumnDef<any>[] = [
    {
      id: 'education',
      accessorFn: (row: any) => row?.education?.institution_name || '',
      header: t('lessonSchedulePage.educationLevel'),
      cell: ({ getValue }) => {
        const name = (getValue() as string) || '';
        return name ? <div className="capitalize">{name}</div> : <div className="text-gray-400">-</div>;
      },
    },
    {
      id: 'classroom.name',
      accessorFn: (row: any) => row?.classroom?.name || '',
      header: t('lessonSchedulePage.class'),
      cell: ({ row }) => <div className="capitalize">{row.original.classroom?.name || '-'}</div>,
    },
    {
      id: 'class_group.name',
      accessorFn: (row: any) => row?.class_group?.name || '',
      header: t('lessonSchedulePage.classGroup'),
      cell: ({ row }) => <div className="capitalize">{row.original.class_group?.name || '-'}</div>,
    },
    {
      id: 'day',
      accessorKey: 'day',
      header: t('lessonSchedulePage.day'),
      cell: ({ row }) => <div className="capitalize">{row.getValue('day')}</div>,
    },
    {
      id: 'study.name',
      accessorFn: (row: any) => row?.study?.name || '',
      header: t('lessonSchedulePage.subject'),
      cell: ({ row }) => <div className="capitalize">{row.original.study?.name || '-'}</div>,
    },
    {
      id: 'teacher',
      accessorKey: 'teacher',
      header: t('lessonSchedulePage.teacher'),
      cell: ({ row }) => {
        const teacher = row.original.teacher;
        if (!teacher) return <div className="text-gray-400">-</div>;
        const teacherName = `${teacher.first_name || ''} ${teacher.last_name || ''}`.trim();
        return <div className="capitalize">{teacherName || '-'}</div>;
      },
    },
    {
      id: 'lesson_hour',
      accessorKey: 'lesson_hour',
      header: t('lessonSchedulePage.time'),
      cell: ({ row }) => {
        const lessonHour = row.original.lesson_hour;
        // Add null safety check
        if (!lessonHour) {
          return <div className="text-gray-400">-</div>;
        }
        return <div className="capitalize">{`${lessonHour.start_time} - ${lessonHour.end_time}`}</div>;
      },
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge variant={status === 'active' ? 'success' : 'secondary'}>
            {status === 'active' ? 'Aktif' : 'Belum Terbit'}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      header: 'Aksi',
      cell: ({ row }) => {
        const status = row.original.status;
        const scheduleId = row.original.scheduleId;
        const isActive = status === 'active';
        return (
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEdit(scheduleId)}
              disabled={isActive}
              title={isActive ? 'Jadwal sudah terbit/aktif tidak dapat diubah' : 'Edit Jadwal'}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-red-500 hover:text-red-700"
              onClick={() => handleDelete(scheduleId)}
              disabled={isActive}
              title={isActive ? 'Jadwal sudah terbit/aktif tidak dapat dihapus' : 'Hapus Jadwal'}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  const handleAddSchedule = () => {
    setSelectedScheduleId(null);
    setIsFormOpen(true);
  };

  const handleRowClick = (row: any) => {
    if (!row?.id) return;
    // Detil Jadwal menggunakan halaman Detil Presensi yang sudah ada
    navigate(`/dashboard/manajemen-kurikulum/presensi/${row.id}`);
  };

  const data = React.useMemo(() => {
    const raw: ClassScheduleData[] =
      (Array.isArray(schedulesResponse) ? schedulesResponse : schedulesResponse?.data) || [];
    return flattenScheduleData(raw);
  }, [schedulesResponse]);

  // Siapkan opsi filter unik dari data yang sudah diratakan
  const educationOptions = useMemo(
    () =>
      Array.from(
        new Set(
          (data || [])
            .map((r: any) => r?.education?.institution_name)
            .filter((v: any): v is string => typeof v === 'string' && v.trim() !== '')
        )
      ).map((name) => ({ label: name, value: name })),
    [data]
  );
  const classOptions = useMemo(
    () =>
      Array.from(
        new Set(
          (data || [])
            .map((r: any) => r?.classroom?.name)
            .filter((v: any): v is string => typeof v === 'string' && v.trim() !== '')
        )
      ).map((name) => ({ label: name, value: name })),
    [data]
  );
  const classGroupOptions = useMemo(
    () =>
      Array.from(
        new Set(
          (data || [])
            .map((r: any) => r?.class_group?.name)
            .filter((v: any): v is string => typeof v === 'string' && v.trim() !== '')
        )
      ).map((name) => ({ label: name, value: name })),
    [data]
  );
  const dayOptions = useMemo(
    () =>
      Array.from(
        new Set(
          (data || [])
            .map((r: any) => r?.day)
            .filter((v: any): v is string => typeof v === 'string' && v.trim() !== '')
        )
      ).map((name) => ({ label: name, value: name })),
    [data]
  );

  const handlePrint = useReactToPrint({
    contentRef: printComponentRef,
    documentTitle: `Jadwal_Pelajaran_${activeAcademicYear?.year || ''}`,
  });

  return (
    <DashboardLayout title={t('sidebar.lessonSchedule')} role="administrasi">
      <div className="container mx-auto py-4 px-4">
        <CustomBreadcrumb items={breadcrumbItems} />
        <Card>
          <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>{t('sidebar.lessonSchedule')}</CardTitle>
              <CardDescription>{t('lessonSchedulePage.description')}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Tahun Ajaran:</span>
              <Select value={selectedAcademicYearId} onValueChange={setSelectedAcademicYearId}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Pilih Tahun Ajaran" />
                </SelectTrigger>
                <SelectContent>
                  {academicYears.map((ay: any) => (
                    <SelectItem key={ay.id} value={ay.id.toString()}>
                      {ay.year} {ay.periode ? `(${ay.periode})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <TableLoadingSkeleton numRows={8} />
            ) : isError ? (
              <div className="text-center text-red-500">Gagal memuat data jadwal pelajaran.</div>
            ) : (
              <DataTable
                columns={columns}
                data={data}
                exportFileName="JadwalPelajaran"
                exportTitle={t('sidebar.lessonSchedule')}
                onAddData={handleAddSchedule}
                addButtonLabel="Tambah Jadwal Pelajaran"
                onRowClick={handleRowClick}
                exportImportElement={
                  <div className="flex items-center gap-2">
                    <Button variant="secondary" size="sm" onClick={handlePrint}>
                      <Printer className="h-4 w-4 lg:mr-2" />
                      <span className="hidden lg:inline">Cetak PDF</span>
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="secondary" size="sm" disabled={isExporting || isBackingUp}>
                          <Upload className="h-4 w-4 lg:mr-2" />
                          <span className="hidden lg:inline">Import / Export</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[200px] z-[60]">
                        {/* No import option yet */}
                        <DropdownMenuItem
                          onClick={async () => {
                            const loadingId = toast.showLoading('Mengunduh data export...');
                            try {
                              const blob = await exportClassSchedules().unwrap();
                              const url = window.URL.createObjectURL(blob);
                              const link = document.createElement('a');
                              link.href = url;
                              link.setAttribute('download', `Jadwal_Pelajaran_${new Date().toISOString().split('T')[0]}.xlsx`);
                              document.body.appendChild(link);
                              link.click();
                              link.remove();
                              toast.showSuccess('Export berhasil diunduh');
                            } catch (error) {
                              toast.showError('Gagal melakukan export data');
                              console.error(error);
                            } finally {
                              toast.dismissToast(loadingId);
                            }
                          }}
                          disabled={isExporting}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          {isExporting ? 'Exporting...' : 'Export (XLSX)'}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={async () => {
                            const loadingId = toast.showLoading('Mengunduh backup data...');
                            try {
                              const blob = await backupClassSchedules().unwrap();
                              const url = window.URL.createObjectURL(blob);
                              const link = document.createElement('a');
                              link.href = url;
                              link.setAttribute('download', `Backup_Jadwal_Pelajaran_${new Date().toISOString().split('T')[0]}.csv`);
                              document.body.appendChild(link);
                              link.click();
                              link.remove();
                              toast.showSuccess('Backup berhasil diunduh');
                            } catch (error) {
                              toast.showError('Gagal melakukan backup data');
                              console.error(error);
                            } finally {
                              toast.dismissToast(loadingId);
                            }
                          }}
                          disabled={isBackingUp}
                        >
                          <DatabaseBackup className="h-4 w-4 mr-2" />
                          {isBackingUp ? 'Backing up...' : 'Backup (CSV)'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                }
                filterableColumns={{
                  education: {
                    type: 'select',
                    placeholder: t('lessonSchedulePage.educationLevel'),
                    options: educationOptions,
                  },
                  'classroom.name': {
                    type: 'select',
                    placeholder: t('lessonSchedulePage.class'),
                    options: classOptions,
                  },
                  'class_group.name': {
                    type: 'select',
                    placeholder: t('lessonSchedulePage.classGroup'),
                    options: classGroupOptions,
                  },
                  day: {
                    type: 'select',
                    placeholder: t('lessonSchedulePage.day'),
                    options: dayOptions,
                  },
                }}
                // Let DataTable handle search, filters, and pagination internally
                totalItems={data.length}
              />
            )}
          </CardContent>
        </Card>
      </div>
      <LessonScheduleForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedScheduleId(null);
        }}
        scheduleId={selectedScheduleId}
      />
      <PrintJadwalPelajaran 
        ref={printComponentRef} 
        data={data} 
        academicYear={academicYears?.find((ay: any) => ay.id.toString() === selectedAcademicYearId)} 
      />
    </DashboardLayout>
  );
};

export default JadwalPelajaranPage;