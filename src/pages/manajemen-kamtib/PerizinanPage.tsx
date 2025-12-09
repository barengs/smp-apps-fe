"use client";

import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import CustomBreadcrumb from '@/components/CustomBreadcrumb';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save, Printer, Edit } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTranslation } from 'react-i18next';
import { useGetStudentsQuery, type Student } from '@/store/slices/studentApi';
import { useGetStudentLeavesQuery, type StudentLeave, useCreateStudentLeaveMutation } from '@/store/slices/studentLeaveApi';
import { useGetLeaveTypesQuery } from '@/store/slices/leaveTypeApi';
import { useGetTahunAjaranQuery, useGetActiveTahunAjaranQuery } from '@/store/slices/tahunAjaranApi';
import { DataTable } from '@/components/DataTable';
import type { ColumnDef } from '@tanstack/react-table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Combobox } from '@/components/ui/combobox';
import { Badge } from '@/components/ui/badge';
import * as toast from '@/utils/toast';

const IssuePermissionDialog: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  students: Student[];
  onCreated?: () => void; // TAMBAH: callback setelah sukses kirim
}> = ({ open, onOpenChange, students, onCreated }) => {
  const { t } = useTranslation();
  const { data: leaveTypes = [] } = useGetLeaveTypesQuery({ page: 1, per_page: 200 });
  const { data: years = [] } = useGetTahunAjaranQuery();
  const { data: activeYear } = useGetActiveTahunAjaranQuery();

  const [studentId, setStudentId] = React.useState<string>('');
  const [leaveTypeId, setLeaveTypeId] = React.useState<string>('');
  const [academicYearId, setAcademicYearId] = React.useState<string>('');
  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');
  const [reason, setReason] = React.useState('');
  const [destination, setDestination] = React.useState('');
  const [contactPerson, setContactPerson] = React.useState('');
  const [contactPhone, setContactPhone] = React.useState('');
  const [notes, setNotes] = React.useState('');

  React.useEffect(() => {
    if (activeYear?.id) setAcademicYearId(String(activeYear.id));
  }, [activeYear]);

  const reset = () => {
    setStudentId('');
    setLeaveTypeId('');
    setAcademicYearId('');
    setStartDate('');
    setEndDate('');
    setReason('');
    setDestination('');
    setContactPerson('');
    setContactPhone('');
    setNotes('');
  };

  // TAMBAH: mutation untuk create student leave
  const [createStudentLeave, { isLoading: isCreating }] = useCreateStudentLeaveMutation();

  const handleSave = async () => {
    if (!studentId || !leaveTypeId || !academicYearId || !startDate || !endDate) {
      toast.showError(t('permission.form.validationRequired'));
      return;
    }

    const payload = {
      student_id: Number(studentId),
      leave_type_id: Number(leaveTypeId),
      academic_year_id: Number(academicYearId),
      start_date: new Date(`${startDate}T00:00:00Z`).toISOString(),
      end_date: new Date(`${endDate}T00:00:00Z`).toISOString(),
      reason,
      destination,
      contact_person: contactPerson,
      contact_phone: contactPhone,
      notes,
    };

    // KIRIM KE BACKEND
    await createStudentLeave(payload).unwrap();
    toast.showSuccess(t('permission.form.issueSuccess'));
    reset();
    onOpenChange(false);
    onCreated?.();
  };

  const handleSaveAndPrint = async () => {
    if (!studentId || !leaveTypeId || !academicYearId || !startDate || !endDate) {
      toast.showError(t('permission.form.validationRequired'));
      return;
    }

    const payload = {
      student_id: Number(studentId),
      leave_type_id: Number(leaveTypeId),
      academic_year_id: Number(academicYearId),
      start_date: new Date(`${startDate}T00:00:00Z`).toISOString(),
      end_date: new Date(`${endDate}T00:00:00Z`).toISOString(),
      reason,
      destination,
      contact_person: contactPerson,
      contact_phone: contactPhone,
      notes,
    };

    // KIRIM KE BACKEND, lalu print
    await createStudentLeave(payload).unwrap();
    toast.showSuccess(t('permission.form.issueSuccess'));
    reset();
    onOpenChange(false);
    onCreated?.();
    setTimeout(() => window.print(), 300);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl md:max-w-2xl lg:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{t('permission.form.issue.title')}</DialogTitle>
          <DialogDescription>{t('permission.form.issue.desc')}</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">{t('permission.form.student')}</label>
            <Combobox
              options={students.map((s) => ({
                value: String(s.id),
                label: `${s.nis} — ${s.first_name}${s.last_name ? ' ' + s.last_name : ''}`,
              }))}
              value={studentId}
              onChange={(val) => setStudentId(String(val))}
              placeholder={t('permission.form.selectStudent')}
              isLoading={false /* gunakan loading dari parent */}
            />
          </div>

          <div>
            <label className="block text-sm mb-1">{t('sidebar.leaveType')}</label>
            <Select value={leaveTypeId} onValueChange={setLeaveTypeId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t('permission.form.permitType')} />
              </SelectTrigger>
              <SelectContent>
                {leaveTypes.map((lt) => (
                  <SelectItem key={lt.id} value={String(lt.id)}>
                    {lt.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm mb-1">Tahun Ajaran</label>
            <Select value={academicYearId} onValueChange={setAcademicYearId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t('teachingHoursPage.selectAcademicYear')} />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y.id} value={String(y.id)}>
                    {y.year} {y.type ? `(${t(y.type.toLowerCase()) || y.type})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm mb-1">{t('permission.form.startDate')}</label>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm mb-1">Tanggal Selesai</label>
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm mb-1">{t('permission.form.destination')}</label>
            <Input value={destination} onChange={(e) => setDestination(e.target.value)} placeholder={t('permission.form.destinationPlaceholder')} />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm mb-1">Alasan</label>
            <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Contoh: Mengunjungi keluarga" />
          </div>

          <div>
            <label className="block text-sm mb-1">Kontak</label>
            <Input value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} placeholder="Nama kontak" />
          </div>
          <div>
            <label className="block text-sm mb-1">Nomor Kontak</label>
            <Input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="Contoh: 08123456789" />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm mb-1">{t('permission.form.notes')}</label>
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t('permission.form.notesPlaceholder')} />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave} className="gap-2" disabled={isCreating}>
            <Save className="h-4 w-4" />
            {t('actions.save')}
          </Button>
          <Button onClick={handleSaveAndPrint} variant="outline" className="gap-2" disabled={isCreating}>
            <Printer className="h-4 w-4" />
            Simpan dan Print
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const ReturnReportDialog: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leaves: StudentLeave[];
}> = ({ open, onOpenChange, leaves }) => {
  const { t } = useTranslation();
  const openLeaves = leaves.filter((l) => !l.actual_return_date);

  const [selectedLeaveId, setSelectedLeaveId] = React.useState<string>('');
  const [returnDate, setReturnDate] = React.useState('');
  const [returnTime, setReturnTime] = React.useState('');
  const [officer, setOfficer] = React.useState('');
  const [notes, setNotes] = React.useState('');

  const reset = () => {
    setSelectedLeaveId('');
    setReturnDate('');
    setReturnTime('');
    setOfficer('');
    setNotes('');
  };

  const handleSave = () => {
    if (!selectedLeaveId || !returnDate || !returnTime || !officer) {
      toast.showError(t('permission.form.validationRequired'));
      return;
    }
    // Simulasi: tampilkan toast sukses dan tutup dialog
    toast.showSuccess(t('permission.form.returnSuccess'));
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('permission.form.return.title')}</DialogTitle>
          <DialogDescription>{t('permission.form.return.desc')}</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm mb-1">{t('permission.form.permitId')}</label>
            <Select value={selectedLeaveId} onValueChange={setSelectedLeaveId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t('permission.form.permitIdPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {openLeaves.length === 0 ? (
                  <SelectItem value="__none__" disabled>
                    Tidak ada perizinan aktif
                  </SelectItem>
                ) : (
                  openLeaves.map((l) => (
                    <SelectItem key={l.id} value={String(l.id)}>
                      {l.student.nis} — {l.student.name} — {l.leave_type?.name} — {l.start_date}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm mb-1">{t('permission.form.returnDate')}</label>
            <Input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">{t('permission.form.returnTime')}</label>
            <Input type="time" value={returnTime} onChange={(e) => setReturnTime(e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm mb-1">{t('permission.form.officer')}</label>
            <Input value={officer} onChange={(e) => setOfficer(e.target.value)} placeholder={t('permission.form.officerPlaceholder')} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm mb-1">{t('permission.form.notes')}</label>
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t('permission.form.notesPlaceholder')} />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave}>{t('actions.save')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const PerizinanPage: React.FC = () => {
  const { t } = useTranslation();
  const { data: students = [], isFetching: isFetchingStudents } = useGetStudentsQuery({ page: 1, per_page: 200 });
  const { data: leaves = [], isFetching: isFetchingLeaves, refetch: refetchLeaves } = useGetStudentLeavesQuery({ page: 1, per_page: 200 });

  const [issueOpen, setIssueOpen] = React.useState(false);
  const [returnOpen, setReturnOpen] = React.useState(false);

  const columns: ColumnDef<StudentLeave>[] = [
    { header: 'NIS', id: 'nis', accessorFn: (row) => row.student?.nis ?? '-' },
    { header: 'Nama', id: 'name', accessorFn: (row) => row.student?.name ?? '-' },
    { header: 'Jenis Izin', id: 'leave_type', accessorFn: (row) => row.leave_type?.name ?? '-' },
    { header: 'Mulai', id: 'start', accessorFn: (row) => row.start_date },
    { header: 'Kembali (perkiraan)', id: 'expected_return', accessorFn: (row) => row.expected_return_date || '-' },
    {
      header: 'Status',
      id: 'status',
      cell: ({ row }) => {
        const statusRaw = (row.original.status || '').toLowerCase();
        const statusVariant =
          statusRaw === 'approved' || statusRaw === 'returned' || statusRaw === 'completed'
            ? 'success'
            : statusRaw === 'pending' || statusRaw === 'requested' || statusRaw === 'in_progress'
            ? 'warning'
            : statusRaw === 'rejected' || statusRaw === 'cancelled' || statusRaw === 'overdue'
            ? 'destructive'
            : 'secondary';
        const label =
          statusRaw
            ? statusRaw.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
            : '-';
        return <Badge variant={statusVariant as any}>{label}</Badge>;
      },
    },
    { header: 'Pengembalian', id: 'return', accessorFn: (row) => row.actual_return_date || '-' },
    {
      header: 'Aksi',
      id: 'actions',
      cell: ({ row }) => {
        const leave = row.original;
        return (
          <div className="flex items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              aria-label="Print izin"
              onClick={() => window.print()}
              title="Print"
            >
              <Printer className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              aria-label="Edit izin"
              onClick={() => console.log('Edit leave', leave.id)}
              title="Edit"
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  const leftActions = (
    <div className="flex items-center gap-2">
      <Button onClick={() => setIssueOpen(true)} size="sm">
        {t('permission.tabs.issue')}
      </Button>
      <Button onClick={() => setReturnOpen(true)} variant="outline" size="sm">
        {t('permission.tabs.return')}
      </Button>
    </div>
  );

  return (
    <DashboardLayout title={t('sidebar.permission')} role="administrasi">
      <div className="container mx-auto pt-2 pb-4 px-4">
        <CustomBreadcrumb
          items={[
            { label: t('sidebar.securityManagement'), href: '/dashboard/manajemen-kamtib/pelanggaran' },
            { label: t('sidebar.permission') },
          ]}
        />
        <Card>
          <CardHeader>
            <CardTitle>{t('permissionPage.title')}</CardTitle>
            <CardDescription>{t('permissionPage.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={leaves}
              isLoading={isFetchingLeaves}
              exportFileName="data-perizinan"
              exportTitle="Data Perizinan Santri"
              leftActions={leftActions}
            />
          </CardContent>
        </Card>

        <IssuePermissionDialog
          open={issueOpen}
          onOpenChange={setIssueOpen}
          students={students}
          onCreated={() => refetchLeaves()} // Refresh data setelah sukses
        />
        <ReturnReportDialog
          open={returnOpen}
          onOpenChange={setReturnOpen}
          leaves={leaves}
        />
      </div>
    </DashboardLayout>
  );
};

export default PerizinanPage;