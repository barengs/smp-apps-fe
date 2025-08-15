import React from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import CustomBreadcrumb, { BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileText, Wallet, Receipt, Package, BarChart, LineChart, PieChart } from 'lucide-react';

interface ReportCard {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
}

const reportCards: ReportCard[] = [
  {
    title: 'Laporan Saldo Rekening',
    description: 'Melihat laporan saldo rekening semua santri secara rinci.',
    icon: <Wallet className="h-8 w-8 text-primary" />,
    href: '/dashboard/bank-santri/laporan/saldo-rekening',
  },
  {
    title: 'Laporan Transaksi',
    description: 'Melihat detail semua transaksi yang terjadi dalam periode tertentu.',
    icon: <Receipt className="h-8 w-8 text-primary" />,
    href: '/dashboard/bank-santri/laporan/transaksi',
  },
  {
    title: 'Laporan Produk Bank',
    description: 'Melihat laporan produk-produk bank santri yang tersedia.',
    icon: <Package className="h-8 w-8 text-primary" />,
    href: '/dashboard/bank-santri/laporan/produk',
  },
  {
    title: 'Laporan COA',
    description: 'Melihat laporan Chart of Accounts (COA) bank santri.',
    icon: <BarChart className="h-8 w-8 text-primary" />,
    href: '/dashboard/bank-santri/laporan/coa',
  },
  {
    title: 'Laporan Jenis Transaksi',
    description: 'Melihat laporan jenis-jenis transaksi yang ada.',
    icon: <LineChart className="h-8 w-8 text-primary" />,
    href: '/dashboard/bank-santri/laporan/jenis-transaksi',
  },
  {
    title: 'Laporan Statistik Keuangan',
    description: 'Analisis statistik keuangan bank santri.',
    icon: <PieChart className="h-8 w-8 text-primary" />,
    href: '/dashboard/bank-santri/laporan/statistik',
  },
];

const LaporanPage: React.FC = () => {
  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: 'Dashboard', href: '/dashboard/administrasi' },
    { label: 'Bank Santri' },
    { label: 'Laporan', icon: <FileText className="h-4 w-4" /> },
  ];

  return (
    <DashboardLayout title="Laporan Bank Santri" role="administrasi">
      <div className="container mx-auto px-4 pb-4">
        <CustomBreadcrumb items={breadcrumbItems} />
        <Card>
          <CardHeader>
            <CardTitle>Pilih Jenis Laporan</CardTitle>
            <CardDescription>Pilih jenis laporan keuangan yang ingin Anda lihat.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {reportCards.map((report, index) => (
                <Link to={report.href} key={index} className="block">
                  <Card className="h-full flex flex-col justify-between hover:shadow-lg transition-shadow duration-200 ease-in-out cursor-pointer">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-lg font-medium">{report.title}</CardTitle>
                      {report.icon}
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{report.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default LaporanPage;