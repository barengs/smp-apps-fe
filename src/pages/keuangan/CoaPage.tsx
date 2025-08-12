import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import CustomBreadcrumb from '@/components/CustomBreadcrumb';
import CoaTable from './CoaTable';

const CoaPage: React.FC = () => {
  const breadcrumbItems = [
    { label: 'Bank Santri' },
    { label: 'COA' },
  ];

  return (
    <DashboardLayout title="Bagan Akun Standar (COA)" role="administrasi">
      <CustomBreadcrumb items={breadcrumbItems} />
      <div className="p-4 border border-gray-200 rounded-lg shadow-sm mt-4">
        <CoaTable />
      </div>
    </DashboardLayout>
  );
};

export default CoaPage;