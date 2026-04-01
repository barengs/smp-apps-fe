import React, { useEffect } from 'react';
import WaliSantriLayout from '@/layouts/WaliSantriLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '@/store/slices/authSlice';
import { useNavigate } from 'react-router-dom';

const WaliSantriDashboard: React.FC = () => {
  const { t } = useTranslation();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <WaliSantriLayout title="Dashboard Wali Santri" role="wali-santri">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sisa Saldo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp 1.500.000</div>
            <p className="text-xs text-muted-foreground">+Rp 500.000 dari bulan lalu</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Up Terakhir</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp 500.000</div>
            <p className="text-xs text-muted-foreground">12 Februari 2026</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status Santri</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Aktif</div>
            <p className="text-xs text-muted-foreground">Kuartal / Periode 2025/2026</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Histori Pembayaran</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { date: '12 Feb 2026', desc: 'SPP Februari 2026', amount: 'Rp 350.000', status: 'Lunas' },
                { date: '10 Jan 2026', desc: 'SPP Januari 2026', amount: 'Rp 350.000', status: 'Lunas' },
                { date: '15 Dec 2025', desc: 'Uang Gedung Term 2', amount: 'Rp 1.000.000', status: 'Lunas' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium">{item.desc}</p>
                    <p className="text-sm text-muted-foreground">{item.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{item.amount}</p>
                    <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">{item.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Riwayat Pelanggaran</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
              {[
                { date: '05 Feb 2026', desc: 'Terlambat masuk sekolah', point: 5 },
                { date: '20 Jan 2026', desc: 'Tidak membawa buku paket', point: 2 },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium">{item.desc}</p>
                    <p className="text-sm text-muted-foreground">{item.date}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-red-500">{item.point} Poin</span>
                  </div>
                </div>
              ))}
               {/* Fallback if empty */}
               <div className="hidden text-center text-muted-foreground py-4">
                 Tidak ada data pelanggaran.
               </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 lg:col-span-2">
           <CardHeader>
            <CardTitle>Riwayat Aktivitas Santri</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
              {[
                { date: '14 Feb 2026', title: 'Mengikuti Kejuaraan Futsal', desc: 'Mewakili sekolah dalam turnamen tingkat kabupaten.' },
                { date: '10 Feb 2026', title: 'Peminjaman Buku', desc: 'Meminjam buku "Sejarah Islam" di perpustakaan.' },
                 { date: '01 Feb 2026', title: 'Setoran Hafalan', desc: 'Menyelesaikan setoran hafalan Juz 30.' },
              ].map((item, i) => (
                <div key={i} className="flex flex-col md:flex-row md:items-start justify-between border-b pb-4 last:border-0 last:pb-0 gap-2">
                  <div className="flex-1">
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                   <div className="text-sm text-muted-foreground md:text-right whitespace-nowrap">
                    {item.date}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </WaliSantriLayout>
  );
};

export default WaliSantriDashboard;