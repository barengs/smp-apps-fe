"use client";

import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import CustomBreadcrumb from '@/components/CustomBreadcrumb';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTranslation } from 'react-i18next';
import { useGetStudentsQuery, type Student } from '@/store/slices/studentApi';
import { DataTable } from '@/components/DataTable';
import type { ColumnDef } from '@tanstack/react-table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import * as toast from '@/utils/toast';

type PermissionRecordStatus = 'issued' | 'returned';

type PermissionRecord = {
  id: number;
  studentId: number;
  nis: string;
  name: string;
  permitType: string;
  startDate: string;
  startTime: string;
  expectedReturnDate?: string;
  expectedReturnTime?: string;
  destination?: string;
  purpose?: string;
  officer: string;
  status: PermissionRecordStatus;
  returnDate?: string;
  returnTime?: string;
  returnOfficer?: string;
  notes?: string;
  createdAt: string;
};

const normalizeTime = (raw?: string) => {
  const src = String(raw || '').trim();
  const m = src.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (m) return `${String(m[1]).padStart(2, '0')}:${m[2]}`;
  const d = new Date(src);
  if (!isNaN(d.getTime())) return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  if (src.includes(':')) {
    const [h, mm] = src.split(':');
    return `${String(Number(h)).padStart(2, '0')}:${String(Number(mm)).padStart(2, '0')}`;
  }
  return '00:00';
};

const IssuePermissionDialog: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  students: Student[];
  onSave: (record: PermissionRecord) => void;
}> = ({ open, onOpenChange, students, onSave }) => {
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
    const s = students.find((x) => String(x.id) === studentId);
    if (!s) {
      toast.showError(t('permission.form.validationRequired'));
      return;
    }
    const name = `${s.first_name}${s.last_name ? ' ' + s.last_name : ''}`;
    const record: PermissionRecord = {
      id: Date.now(),
      studentId: s.id,
      nis: s.nis,
      name,
      permitType,
      startDate,
      startTime: normalizeTime(startTime),
      expectedReturnDate: expectedReturnDate || undefined,
      expectedReturnTime: expectedReturnTime ? normalizeTime(expectedReturnTime) : undefined,
      destination: destination || undefined,
      purpose: purpose || undefined,
      officer,
      status: 'issued',
      createdAt: new Date().toISOString(),
    };
    onSave(record);
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
  records: PermissionRecord[];
  onSave: (recordId: number, update: Pick<PermissionRecord, 'returnDate' | 'returnTime' | 'returnOfficer' | 'notes'>) => void;
}> = ({ open, onOpenChange, records, onSave }) => {
  const { t } = useTranslation();
  const issuedRecords = records.filter((r) => r.status === 'issued');

  const [selectedRecordId, setSelectedRecordId] = React.useState<string>('');
  const [returnDate, setReturnDate] = React.useState('');
  const [returnTime, setReturnTime] = React.useState('');
  const [officer, setOfficer] = React.useState('');
  const [notes, setNotes] = React.useState('');

  const reset = () => {
    setSelectedRecordId('');
    setReturnDate('');
    setReturnTime('');
    setOfficer('');
    setNotes('');
  };

  const handleSave = () => {
    if (!selectedRecordId || !returnDate || !returnTime || !officer) {
      toast.showError(t('permission.form.validationRequired'));
      return;
    }
    const idNum = Number(selectedRecordId);
    onSave(idNum, {
      returnDate,
      returnTime: normalizeTime(returnTime),
      returnOfficer: officer,
      notes: notes || undefined,
    });
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
            <Select value={selectedRecordId} onValueChange={setSelectedRecordId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t('permission.form.permitIdPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {issuedRecords.length === 0 ? (
                  <SelectItem value="__none__" disabled>
                    Tidak ada perizinan aktif
                  </SelectItem>
                ) : (
                  issuedRecords.map((r) => (
                    <SelectItem key={r.id} value={String(r.id)}>
                      {r.nis} — {r.name} — {r.permitType} — {r.startDate} {r.startTime}
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
  const { data: students = [], isFetching } = useGetStudentsQuery({ page: 1, per_page: 200 });

  const [records, setRecords] = React.useState<PermissionRecord[]>([]);
  const [issueOpen, setIssueOpen] = React.useState(false);
  const [returnOpen, setReturnOpen] = React.useState(false);

  const columns: ColumnDef<PermissionRecord>[] = [
    { header: 'NIS', accessorKey: 'nis' },
    { header: 'Nama', accessorKey: 'name' },
    { header: 'Jenis Izin', accessorKey: 'permitType' },
    {
      header: 'Mulai',
      id: 'start',
      accessorFn: (row) => `${row.startDate} ${row.startTime}`,
    },
    {
      header: 'Kembali (perkiraan)',
      id: 'expected_return',
      accessorFn: (row) => `${row.expectedReturnDate ?? '-'} ${row.expectedReturnTime ?? ''}`.trim(),
    },
    { header: 'Tujuan', accessorKey: 'destination' },
    { header: 'Petugas', accessorKey: 'officer' },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: ({ getValue }) => {
        const v = getValue() as PermissionRecordStatus;
        return v === 'returned' ? 'Sudah Kembali' : 'Izin Aktif';
      },
    },
    {
      header: 'Pengembalian',
      id: 'return',
      accessorFn: (row) => (row.returnDate ? `${row.returnDate} ${row.returnTime ?? ''}`.trim() : '-'),
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

  const handleAddRecord = (rec: PermissionRecord) => {
    setRecords((prev) => [rec, ...prev]);
  };

  const handleReturnUpdate = (recordId: number, update: Pick<PermissionRecord, 'returnDate' | 'returnTime' | 'returnOfficer' | 'notes'>) => {
    setRecords((prev) =>
      prev.map((r) =>
        r.id === recordId
          ? {
              ...r,
              status: 'returned',
              returnDate: update.returnDate,
              returnTime: update.returnTime,
              returnOfficer: update.returnOfficer,
              notes: update.notes,
            }
          : r
      )
    );
  };

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
            <DataTable<PermissionRecord, unknown>
              columns={columns}
              data={records}
              isLoading={isFetching}
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
          onSave={handleAddRecord}
        />
        <ReturnReportDialog
          open={returnOpen}
          onOpenChange={setReturnOpen}
          records={records}
          onSave={handleReturnUpdate}
        />
      </div>
    </DashboardLayout>
  );
};

export default PerizinanPage;