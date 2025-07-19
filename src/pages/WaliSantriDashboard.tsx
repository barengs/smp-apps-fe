import React from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const WaliSantriDashboard: React.FC = () => {
  return (
    <DashboardLayout title="Dashboard Wali Santri">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informasi Santri</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Nama: Ahmad Fulan</p>
            <p>Kelas: X IPA</p>
            <p>Status: Aktif</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Nilai Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Matematika: 90</p>
            <p>Bahasa Arab: 85</p>
            <p>Fiqih: 92</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Absensi</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Hadir: 20 hari</p>
            <p>Izin: 1 hari</p>
            <p>Sakit: 0 hari</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pengumuman</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Tidak ada pengumuman baru.</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default WaliSantriDashboard;