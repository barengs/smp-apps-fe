"use client";

import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import CustomBreadcrumb from '@/components/CustomBreadcrumb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslation } from 'react-i18next';
import { useGetStudentsQuery, type Student } from '@/store/slices/studentApi';
import { DataTable } from '@/components/DataTable';
import type { ColumnDef } from '@tanstack/react-table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import * as toast from '@/utils/toast';

const DataSantriTab: React.FC = () => {
  const { t } = useTranslation();
  const { data: students = [], isFetching } = useGetStudentsQuery({ page: 1, per_page: 200 });

  // Buat opsi filter dinamis dari data
  const genderOptions = React.useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => s.gender && set.add(s.gender));
    return Array.from(set).map((g) => ({ label: g, value: g }));
  }, [students]);

  const statusOptions = React.useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => s.status && set.add(s.status));
    return Array.from(set).map((v) => ({ label: v, value: v }));
  }, [students]);

  const columns: ColumnDef<Student>[] = [
    { header: 'NIS', accessorKey: 'nis' },
    {
      header: 'Nama',
      id: 'name',
      accessorFn: (row) => `${row.first_name}${row.last_name ? ' ' + row.last_name : ''}`,
    },
    { header: 'NIK', accessorKey: 'nik' },
    { header: 'Jenis Kelamin', accessorKey: 'gender' },
    { header: 'Status', accessorKey: 'status' },
    {
      header: 'Program',
      id: 'program',
      accessorFn: (row) => row.program?.name ?? '-',
    },
    {
      header: 'Asrama',
      id: 'hostel',
      accessorFn: (row) => row.hostel?.name ?? '-',
    },
    {
      header: 'Kamar',
      id: 'room',
      accessorFn: (row) => row.current_room?.room_name ?? '-',
    },
  ];

  const filterableColumns = {
    gender: {
      type: 'select' as const,
      placeholder: 'Filter Gender',
      options: genderOptions,
    },
    status: {
      type: 'select' as const,
      placeholder: 'Filter Status',
      options: statusOptions,
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('permission.tabs.students')}</CardTitle>
        <CardDescription>{t('permissionPage.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={students}
          isLoading={isFetching}
          filterableColumns={filterableColumns}
          exportFileName="data-santri"
          exportTitle="Data Santri"
        />
      </CardContent>
    </Card>
  );
};

type IssueFormValues = {
  studentId: string;
  permitType: string;
  startDate: string;
  startTime: string;
  expectedReturnDate: string;
  expectedReturnTime: string;
  destination: string;
  purpose: string;
  officer: string;
};

const PerizinanFormTab: React.FC = () => {
  const { t } = useTranslation();
  const { data: students = [] } = useGetStudentsQuery({ page: 1, per_page: 200 });
  const [form, setForm] = React.useState<IssueFormValues>({
    studentId: '',
    permitType: '',
    startDate: '',
    startTime: '',
    expectedReturnDate: '',
    expectedReturnTime: '',
    destination: '',
    purpose: '',
    officer: '',
  });

  const onSubmit = () => {
    if (!form.studentId || !form.permitType || !form.startDate || !form.startTime || !form.officer) {
      toast.showError(t('permission.form.validationRequired'));
      return;
    }
    toast.showSuccess(t('permission.form.issueSuccess'));
    setForm({
      studentId: '',
      permitType: '',
      startDate: '',
      startTime: '',
      expectedReturnDate: '',
      expectedReturnTime: '',
      destination: '',
      purpose: '',
      officer: '',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('permission.form.issue.title')}</CardTitle>
        <CardDescription>{t('permission.form.issue.desc')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">{t('permission.form.student')}</label>
            <Select
              value={form.studentId}
              onValueChange={(v) => setForm((prev) => ({ ...prev, studentId: v }))}
            >
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
            <Input
              value={form.permitType}
              onChange={(e) => setForm((p) => ({ ...p, permitType: e.target.value }))}
              placeholder={t('permission.form.permitTypePlaceholder')}
            />
          </div>

          <div>
            <label className="block text-sm mb-1">{t('permission.form.startDate')}</label>
            <Input
              type="date"
              value={form.startDate}
              onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">{t('permission.form.startTime')}</label>
            <Input
              type="time"
              value={form.startTime}
              onChange={(e) => setForm((p) => ({ ...p, startTime: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm mb-1">{t('permission.form.expectedReturnDate')}</label>
            <Input
              type="date"
              value={form.expectedReturnDate}
              onChange={(e) => setForm((p) => ({ ...p, expectedReturnDate: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">{t('permission.form.expectedReturnTime')}</label>
            <Input
              type="time"
              value={form.expectedReturnTime}
              onChange={(e) => setForm((p) => ({ ...p, expectedReturnTime: e.target.value }))}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm mb-1">{t('permission.form.destination')}</label>
            <Input
              value={form.destination}
              onChange={(e) => setForm((p) => ({ ...p, destination: e.target.value }))}
              placeholder={t('permission.form.destinationPlaceholder')}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm mb-1">{t('permission.form.purpose')}</label>
            <Input
              value={form.purpose}
              onChange={(e) => setForm((p) => ({ ...p, purpose: e.target.value }))}
              placeholder={t('permission.form.purposePlaceholder')}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm mb-1">{t('permission.form.officer')}</label>
            <Input
              value={form.officer}
              onChange={(e) => setForm((p) => ({ ...p, officer: e.target.value }))}
              placeholder={t('permission.form.officerPlaceholder')}
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button onClick={onSubmit}>{t('actions.save')}</Button>
        </div>
      </CardContent>
    </Card>
  );
};

type ReturnFormValues = {
  studentId: string;
  permitId: string;
  returnDate: string;
  returnTime: string;
  officer: string;
  notes: string;
};

const PelaporanFormTab: React.FC = () => {
  const { t } = useTranslation();
  const { data: students = [] } = useGetStudentsQuery({ page: 1, per_page: 200 });

  const [form, setForm] = React.useState<ReturnFormValues>({
    studentId: '',
    permitId: '',
    returnDate: '',
    returnTime: '',
    officer: '',
    notes: '',
  });

  const onSubmit = () => {
    if (!form.studentId || !form.permitId || !form.returnDate || !form.returnTime || !form.officer) {
      toast.showError(t('permission.form.validationRequired'));
      return;
    }
    toast.showSuccess(t('permission.form.returnSuccess'));
    setForm({
      studentId: '',
      permitId: '',
      returnDate: '',
      returnTime: '',
      officer: '',
      notes: '',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('permission.form.return.title')}</CardTitle>
        <CardDescription>{t('permission.form.return.desc')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">{t('permission.form.student')}</label>
            <Select
              value={form.studentId}
              onValueChange={(v) => setForm((prev) => ({ ...prev, studentId: v }))}
            >
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
            <label className="block text-sm mb-1">{t('permission.form.permitId')}</label>
            <Input
              value={form.permitId}
              onChange={(e) => setForm((p) => ({ ...p, permitId: e.target.value }))}
              placeholder={t('permission.form.permitIdPlaceholder')}
            />
          </div>

          <div>
            <label className="block text-sm mb-1">{t('permission.form.returnDate')}</label>
            <Input
              type="date"
              value={form.returnDate}
              onChange={(e) => setForm((p) => ({ ...p, returnDate: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">{t('permission.form.returnTime')}</label>
            <Input
              type="time"
              value={form.returnTime}
              onChange={(e) => setForm((p) => ({ ...p, returnTime: e.target.value }))}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm mb-1">{t('permission.form.officer')}</label>
            <Input
              value={form.officer}
              onChange={(e) => setForm((p) => ({ ...p, officer: e.target.value }))}
              placeholder={t('permission.form.officerPlaceholder')}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm mb-1">{t('permission.form.notes')}</label>
            <Input
              value={form.notes}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              placeholder={t('permission.form.notesPlaceholder')}
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button onClick={onSubmit}>{t('actions.save')}</Button>
        </div>
      </CardContent>
    </Card>
  );
};

const PerizinanPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <DashboardLayout title={t('sidebar.permission')} role="administrasi">
      <div className="container mx-auto pt-2 pb-4 px-4">
        <CustomBreadcrumb
          items={[
            { label: t('sidebar.securityManagement'), href: '/dashboard/manajemen-kamtib/pelanggaran' },
            { label: t('sidebar.permission') },
          ]}
        />
        <Tabs defaultValue="students" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="students">{t('permission.tabs.students')}</TabsTrigger>
            <TabsTrigger value="issue">{t('permission.tabs.issue')}</TabsTrigger>
            <TabsTrigger value="return">{t('permission.tabs.return')}</TabsTrigger>
          </TabsList>
          <TabsContent value="students">
            <DataSantriTab />
          </TabsContent>
          <TabsContent value="issue">
            <PerizinanFormTab />
          </TabsContent>
          <TabsContent value="return">
            <PelaporanFormTab />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default PerizinanPage;