import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import CustomBreadcrumb from '@/components/CustomBreadcrumb';
import ProdukTable from './ProdukTable';

const ProdukPage: React.FC = () => {
  const breadcrumbItems = [
    { label: 'Bank Santri' },
    { label: 'Produk' },
  ];

  return (
    <DashboardLayout title="Produk Bank Santri" role="administrasi">
      <CustomBreadcrumb items={breadcrumbItems} />
      <div className="p-4 border border-gray-200 rounded-lg shadow-sm mt-4">
        <ProdukTable />
      </div>
    </DashboardLayout>
  );
};

export default ProdukPage;