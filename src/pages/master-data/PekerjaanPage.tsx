import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';

const PekerjaanPage: React.FC = () => {
  return (
    <DashboardLayout title="Master Data Pekerjaan" role="administrasi">
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Manajemen Data Pekerjaan</h1>
        <p>Ini adalah halaman untuk mengelola data pekerjaan.</p>
        {/* Konten untuk manajemen pekerjaan akan ditambahkan di sini */}
      </div>
    </DashboardLayout>
  );
};

export default PekerjaanPage;