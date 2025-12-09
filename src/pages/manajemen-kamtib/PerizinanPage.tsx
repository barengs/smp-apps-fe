"use client";

import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import CustomBreadcrumb from '@/components/CustomBreadcrumb';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTranslation } from 'react-i18next';
import { useGetStudentsQuery, type Student } from '@/store/slices/studentApi';
import { useGetStudentLeavesQuery, type StudentLeave } from '@/store/slices/studentLeaveApi';
import { DataTable } from '@/components/DataTable';
import type { ColumnDef } from '@tanstack/react-table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import * as toast from '@/utils/toast';

const IssuePermissionDialog: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  students: Student[];
}> = ({ open, onOpenChange, students }) => {
  const { t } = useTranslation();
  const [studentId, setStudentId] = React.useState<string>('');
  const [permitType, setPermitType] = React.useState('');
  const [startDate, setStartDate] = React.useState('');
  const [startTime, setStartTime] = React.useState('');
  const [expectedReturnDate, setExpectedReturnDate] = React.useState('');
  const [expectedReturnTime, setExpectedReturnTime] = React.useState('');
  const [destination, setDestination] = React.useState('');
  const [purpose, setPurpose] = React.useState('');
  const [officer, setOfficer] = React.useState('');

  const reset = () => {
    setStudentId('');
    setPermitType('');
    setStartDate('');
    setStartTime('');
    setExpectedReturnDate('');
    setExpectedReturnTime('');
    setDestination('');
    setPurpose('');
    setOfficer('');
  };

  const handleSave = () => {
    if (!studentId || !permitType || !startDate || !startTime || !officer) {
      toast.showError(t('permission.form.validationRequired'));
      return;
    }
    // Simulasi: tampilkan toast sukses dan tutup dialog
    toast.showSuccess(t('permission.form.issueSuccess'));
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('permission.form.issue.title')}</DialogTitle>
          <DialogDescription>{t('permission.form.issue.desc')}</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">{t('permission.form.student')}</label>
            <Select value={studentId} onValueChange={setStudentId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t('permission.form.selectStudent')} />
              </SelectTrigger>
              <SelectContent>
                {students.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>
                    {s.nis} — {s.first_name}{s.last_name ? ' ' + s.last_name : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm mb-1">{t('permission.form.permitType')}</label>
            <Input value={permitType} onChange={(e) => setPermitType(e.target.value)} placeholder={t('permission.form.permitTypePlaceholder')} />
          </div>
          <div>
            <label className="block text-sm mb-1">{t('permission.form.startDate')}</label>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">{t('permission.form.startTime')}</label>
            <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">{t('permission.form.expectedReturnDate')}</label>
            <Input type="date" value={expectedReturnDate} onChange={(e) => setExpectedReturnDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">{t('permission.form.expectedReturnTime')}</label>
            <Input type="time" value={expectedReturnTime} onChange={(e) => setExpectedReturnTime(e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm mb-1">{t('permission.form.destination')}</label>
            <Input value={destination} onChange={(e) => setDestination(e.target.value)} placeholder={t('permission.form.destinationPlaceholder')} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm mb-1">{t('permission.form.purpose')}</label>
            <Input value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder={t('permission.form.purposePlaceholder')} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm mb-1">{t('permission.form.officer')}</label>
            <Input value={officer} onChange={(e) => setOfficer(e.target.value)} placeholder={t('permission.form.officerPlaceholder')} />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave}>{t('actions.save')}</Button>
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
  const { data: students = [] } = useGetStudentsQuery({ page: 1, per_page: 200 });
  const { data: leaves = [], isFetching: isFetchingLeaves } = useGetStudentLeavesQuery({ page: 1, per_page: 200 });

  const [issueOpen, setIssueOpen] = React.useState(false);
  const [returnOpen, setReturnOpen] = React.useState(false);

  const columns: ColumnDef<StudentLeave>[] = [
    { header: 'NIS', id: 'nis', accessorFn: (row) => row.student?.nis ?? '-' },
    { header: 'Nama', id: 'name', accessorFn: (row) => row.student?.name ?? '-' },
    { header: 'Jenis Izin', id: 'leave_type', accessorFn: (row) => row.leave_type?.name ?? '-' },
    { header: 'Mulai', id: 'start', accessorFn: (row) => row.start_date },
    { header: 'Kembali (perkiraan)', id: 'expected_return', accessorFn: (row) => row.expected_return_date || '-' },
    { header: 'Tujuan', accessorKey: 'destination' },
    { header: 'Status', accessorKey: 'status' },
    { header: 'Pengembalian', id: 'return', accessorFn: (row) => row.actual_return_date || '-' },
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