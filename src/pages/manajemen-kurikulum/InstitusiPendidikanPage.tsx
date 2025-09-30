import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import CustomBreadcrumb from '@/components/CustomBreadcrumb';
import InstitusiPendidikanTable from './InstitusiPendidikanTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const InstitusiPendidikanPage: React.FC = () => {
  const breadcrumbs = [
    {
      label: 'Dashboard',
      href: '/dashboard/administrasi',
    },
    {
      label: 'Manajemen Kurikulum',
    },
    {
      label: 'Institusi Pendidikan',
      href: '/dashboard/manajemen-kurikulum/institusi-pendidikan',
    },
  ];

  return (
    <DashboardLayout title="Institusi Pendidikan" role="administrasi">
      <CustomBreadcrumb items={breadcrumbs} />
      <Card>
        <CardHeader>
          <CardTitle>Institusi Pendidikan</CardTitle>
          <p className="text-sm text-muted-foreground">Kelola data institusi pendidikan</p>
        </CardHeader>
        <CardContent>
          <InstitusiPendidikanTable />
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default InstitusiPendidikanPage;