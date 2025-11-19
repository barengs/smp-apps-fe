import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import CustomBreadcrumb, { BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/datepicker';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ActionButton from '@/components/ActionButton';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { selectCurrentUser } from '@/store/slices/authSlice';
import { Combobox } from '@/components/ui/combobox';
import { useGetStudentsQuery } from '@/store/slices/studentApi';
import { useGetViolationsQuery } from '@/store/slices/violationApi';
import { useGetTahunAjaranQuery, useGetActiveTahunAjaranQuery } from '@/store/slices/tahunAjaranApi';
import { useCreateStudentViolationReportMutation, useGetStudentViolationReportQuery } from '@/store/slices/studentViolationApi';
import * as toast from '@/utils/toast';

const LaporanPage: React.FC = () => {
  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: 'Tata Tertib', href: '/dashboard/manajemen-kamtib/pelanggaran' },
    { label: 'Laporan' },
  ];

  // State form
  const [studentId, setStudentId] = React.useState<number | undefined>(undefined);
  const [violationId, setViolationId] = React.useState<number | undefined>(undefined);
  const [academicYearId, setAcademicYearId] = React.useState<number | undefined>(undefined);
  const [violationDate, setViolationDate] = React.useState<Date | undefined>(new Date());
  const [violationTime, setViolationTime] = React.useState<string>(''); // HH:mm
  const [location, setLocation] = React.useState<string>('');
  const [description, setDescription] = React.useState<string>('');
  const [notes, setNotes] = React.useState<string>('');

  const currentUser = useSelector((state: RootState) => selectCurrentUser(state));
  const reportedBy = Number(currentUser?.id ?? 0);

  // Load dropdown data
  const { data: students = [] } = useGetStudentsQuery({ page: 1, per_page: 100 });
  const { data: violations = [] } = useGetViolationsQuery();
  const { data: academicYears = [] } = useGetTahunAjaranQuery();
  const { data: activeYear } = useGetActiveTahunAjaranQuery();

  React.useEffect(() => {
    if (activeYear?.id && !academicYearId) {
      setAcademicYearId(activeYear.id);
    }
  }, [activeYear, academicYearId]);

  // Report per student
  const { data: studentReport, isFetching: isFetchingReport } = useGetStudentViolationReportQuery(studentId as number, {
    skip: !studentId,
  });

  const [createReport, { isLoading: isCreating }] = useCreateStudentViolationReportMutation();

  const studentOptions = students.map((s) => ({
    value: s.id,
    label: `${s.nis} — ${s.first_name}${s.last_name ? ' ' + s.last_name : ''}`,
  }));

  const violationOptions = violations.map((v) => ({
    value: v.id,
    label: `${v.name} (${v.point} poin)`,
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !violationId || !academicYearId || !violationDate || !violationTime) {
      toast.showError('Lengkapi semua field wajib.');
      return;
    }

    const payload = {
      student_id: studentId,
      violation_id: violationId,
      academic_year_id: academicYearId,
      violation_date: violationDate.toISOString(),
      violation_time: violationTime,
      location: location || undefined,
      description: description || undefined,
      reported_by: reportedBy,
      notes: notes || undefined,
    };

    const loadingId = toast.showLoading('Menyimpan laporan pelanggaran...');
    try {
      await createReport(payload).unwrap();
      toast.showSuccess('Laporan pelanggaran berhasil disimpan!');
      // Refresh report
      if (studentId) {
        // Trigger refetch by resetting state (or rely on cache invalidation)
        // Using a small timeout to ensure backend update completes
        setTimeout(() => {
          // no-op; RTK Query invalidation triggers refetch automatically
        }, 300);
      }
      // Reset sebagian field (opsional)
      setViolationId(undefined);
      setViolationTime('');
      setLocation('');
      setDescription('');
      setNotes('');
    } finally {
      toast.dismissToast(loadingId);
    }
  };

  return (
    <DashboardLayout title="Laporan Pelanggaran" role="administrasi">
      <div className="container mx-auto pt-2 pb-4 px-4">
        <CustomBreadcrumb items={breadcrumbItems} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Form Pencatatan */}
          <Card>
            <CardHeader>
              <CardTitle>Catat Pelanggaran</CardTitle>
              <CardDescription>Isi form di bawah untuk mencatat pelanggaran santri.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Santri</label>
                    <Combobox
                      options={studentOptions}
                      value={studentId}
                      onChange={(val) => setStudentId(Number(val))}
                      placeholder="Pilih santri..."
                      searchPlaceholder="Cari santri..."
                      notFoundMessage="Santri tidak ditemukan."
                      isLoading={false}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Pelanggaran</label>
                    <Combobox
                      options={violationOptions}
                      value={violationId}
                      onChange={(val) => setViolationId(Number(val))}
                      placeholder="Pilih pelanggaran..."
                      searchPlaceholder="Cari pelanggaran..."
                      notFoundMessage="Pelanggaran tidak ditemukan."
                      isLoading={false}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Tahun Ajaran</label>
                    <Select
                      value={academicYearId ? String(academicYearId) : undefined}
                      onValueChange={(val) => setAcademicYearId(Number(val))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih tahun ajaran" />
                      </SelectTrigger>
                      <SelectContent>
                        {academicYears.map((ay) => (
                          <SelectItem key={ay.id} value={String(ay.id)}>
                            {ay.year} — {ay.type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Tanggal Pelanggaran</label>
                    <DatePicker
                      value={violationDate}
                      onValueChange={setViolationDate}
                      placeholder="Pilih tanggal"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Waktu Pelanggaran</label>
                    <Input
                      type="time"
                      value={violationTime}
                      onChange={(e) => setViolationTime(e.target.value)}
                      placeholder="HH:MM"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Lokasi</label>
                    <Input
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Misal: Kelas 7A"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Deskripsi</label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tuliskan detail pelanggaran..."
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Catatan</label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Catatan tambahan (opsional)"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="text-sm text-muted-foreground">
                    Dilaporkan oleh: <span className="font-medium">{currentUser?.name || 'User'}</span> (ID: {reportedBy || 0})
                  </div>
                  <ActionButton
                    type="submit"
                    variant="primary"
                    isLoading={isCreating}
                  >
                    Simpan Laporan
                  </ActionButton>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Ringkasan Laporan Per Santri */}
          <Card>
            <CardHeader>
              <CardTitle>Ringkasan Laporan</CardTitle>
              <CardDescription>
                Pilih santri untuk melihat ringkasan pelanggaran dan total poin.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!studentId ? (
                <div className="text-sm text-muted-foreground">Silakan pilih santri terlebih dahulu.</div>
              ) : isFetchingReport ? (
                <div className="text-sm">Memuat laporan...</div>
              ) : studentReport ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="rounded-md border p-3">
                      <div className="text-xs text-muted-foreground">Total Pelanggaran</div>
                      <div className="text-lg font-semibold">{studentReport.summary.total_violations}</div>
                    </div>
                    <div className="rounded-md border p-3">
                      <div className="text-xs text-muted-foreground">Total Poin</div>
                      <div className="text-lg font-semibold">{studentReport.summary.total_points}</div>
                    </div>
                    <div className="rounded-md border p-3">
                      <div className="text-xs text-muted-foreground">Pending</div>
                      <div className="text-lg font-semibold">{studentReport.summary.pending}</div>
                    </div>
                    <div className="rounded-md border p-3">
                      <div className="text-xs text-muted-foreground">Diproses</div>
                      <div className="text-lg font-semibold">{studentReport.summary.processed}</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium mb-2">Detail Pelanggaran</div>
                    <div className="rounded-md border p-3 max-h-64 overflow-auto text-sm whitespace-pre-wrap">
                      {studentReport.violations || 'Tidak ada detail pelanggaran.'}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">Laporan tidak tersedia.</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LaporanPage;