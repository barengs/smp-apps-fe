import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import CustomBreadcrumb from '@/components/CustomBreadcrumb';
import PaketPembayaranTable from './PaketPembayaranTable';

const PaketPembayaranPage: React.FC = () => {
  const breadcrumbItems = [
    { label: 'Bank Santri' },
    { label: 'Paket Pembayaran' },
  ];

  return (
    <DashboardLayout title="Paket Pembayaran & Tagihan" role="administrasi">
      <CustomBreadcrumb items={breadcrumbItems} />
      <div className="p-4 border border-gray-200 rounded-lg shadow-sm mt-4 bg-white">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-800">Manajemen Paket Pembayaran</h2>
          <p className="text-sm text-gray-500">
            Definisikan paket rincian pembayaran (SPP, asrama, uang saku) yang dapat dipilih wali santri saat top-up.
          </p>
        </div>
        <PaketPembayaranTable />
      </div>
    </DashboardLayout>
  );
};

export default PaketPembayaranPage;
