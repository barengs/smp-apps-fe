import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import CustomBreadcrumb from '@/components/CustomBreadcrumb';
import InstitusiPendidikanTable from './InstitusiPendidikanTable';

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
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">Institusi Pendidikan</h1>
          <p className="text-muted-foreground">Kelola data institusi pendidikan</p>
        </div>
      </div>
      <InstitusiPendidikanTable />
    </DashboardLayout>
  );
};

export default InstitusiPendidikanPage;