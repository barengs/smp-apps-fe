import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import CustomBreadcrumb from '@/components/CustomBreadcrumb';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Landmark, 
  Users, 
  Wallet, 
  TrendingUp, 
  CreditCard, 
  ShoppingCart,
  ArrowUpRight,
  ArrowDownRight,
  ArrowUpCircle,
  FileText,
  Clock,
  Settings as SettingsIcon,
  Package,
  Layers
} from 'lucide-react';
import { useGetBankSummaryQuery } from '@/store/slices/dashboardBankApi';
import { formatCurrency } from '@/utils/formatCurrency';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

const BankSantriPage: React.FC = () => {
  const { data: summary, isLoading } = useGetBankSummaryQuery();

  const breadcrumbItems = [
    { label: 'Bank Santri' },
  ];

  const stats = [
    {
      title: 'Total Rekening Aktif',
      value: summary?.rekening?.total_aktif || 0,
      icon: <Users className="h-4 w-4 text-blue-600" />,
      description: 'Rekening santri terdaftar',
      color: 'bg-blue-50'
    },
    {
      title: 'Total Saldo Mengendap',
      value: formatCurrency(summary?.rekening?.total_saldo || 0),
      icon: <ArrowUpCircle className="h-4 w-4 text-purple-600" />,
      description: `${summary?.topup?.pending_count || 0} menunggu verifikasi`,
      color: 'bg-purple-50'
    },
    {
      title: 'Pembayaran Bulan Ini',
      value: formatCurrency(summary?.payment?.month_amount || 0),
      icon: <FileText className="h-4 w-4 text-orange-600" />,
      description: 'Total pendaftaran & paket',
      color: 'bg-orange-50'
    },
    {
      title: 'Transaksi Koperasi',
      value: formatCurrency(summary?.koperasi?.today_amount || 0),
      icon: <ShoppingCart className="h-4 w-4 text-pink-600" />,
      description: `${summary?.koperasi?.today_count || 0} transaksi hari ini`,
      color: 'bg-purple-50'
    }
  ];

  const quickLinks = [
    { label: 'Proses Pembayaran', icon: <CreditCard />, path: '/dashboard/bank-santri/pembayaran', color: 'bg-blue-600' },
    { label: 'Kasir Koperasi', icon: <ShoppingCart />, path: '/dashboard/bank-santri/koperasi', color: 'bg-indigo-600' },
    { label: 'Paket Pembayaran', icon: <Package />, path: '/dashboard/bank-santri/paket', color: 'bg-emerald-600' },
    { label: 'Verifikasi Top-Up', icon: <TrendingUp />, path: '/dashboard/bank-santri/top-up/verifikasi', color: 'bg-amber-600' },
    { label: 'Daftar Rekening', icon: <Users />, path: '/dashboard/bank-santri/rekening', color: 'bg-slate-700' },
    { label: 'Pengaturan Sistem', icon: <SettingsIcon />, path: '/dashboard/bank-santri/pengaturan', color: 'bg-rose-600' },
  ];

  return (
    <DashboardLayout title="Dashboard Bank Santri" role="administrasi">
      <CustomBreadcrumb items={breadcrumbItems} />
      
      <div className="container mx-auto p-4 space-y-6">
        
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, idx) => (
            <Card key={idx} className="border-none shadow-sm overflow-hidden bg-white">
              <CardContent className="p-0">
                <div className="flex items-center p-6 gap-4">
                  <div className={`p-3 rounded-2xl ${stat.color}`}>
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <h3 className="text-2xl font-bold tracking-tight">
                      {isLoading ? <Skeleton className="h-8 w-24" /> : stat.value}
                    </h3>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mt-1">{stat.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Chart Section */}
          <Card className="lg:col-span-2 shadow-sm border-none bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-8">
              <div className="space-y-1">
                <CardTitle className="text-xl font-bold">Tren Transaksi (7 Hari Terakhir)</CardTitle>
                <CardDescription>Perbandingan aliran dana masuk (Top-up) dan keluar (Debit/Koperasi).</CardDescription>
              </div>
              <div className="flex gap-2">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-xs text-muted-foreground font-medium">Masuk</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <span className="text-xs text-muted-foreground font-medium">Keluar</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                {isLoading ? (
                  <Skeleton className="h-full w-full rounded-lg" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={summary?.chart_7days || []}>
                      <defs>
                        <linearGradient id="colorCredit" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorDebit" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fontSize: 10, fill: '#64748b'}} 
                        dy={10}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fontSize: 10, fill: '#64748b'}}
                        tickFormatter={(val) => `Rp ${val/1000}k`}
                      />
                      <Tooltip 
                        contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                        formatter={(value: any) => formatCurrency(parseFloat(value))}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="total_credit" 
                        stroke="#3b82f6" 
                        strokeWidth={4}
                        fillOpacity={1} 
                        fill="url(#colorCredit)" 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="total_debit" 
                        stroke="#f43f5e" 
                        strokeWidth={4}
                        fillOpacity={1} 
                        fill="url(#colorDebit)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions & Navigation */}
          <div className="space-y-6">
            <Card className="shadow-sm border-none bg-white">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Akses Cepat</CardTitle>
                <CardDescription>Pintasan untuk manajemen harian.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3">
                {quickLinks.map((link, idx) => (
                  <Link key={idx} to={link.path}>
                    <Button variant="ghost" className="w-full h-auto p-4 flex-col gap-2 hover:bg-slate-50 border border-slate-100 rounded-xl">
                      <div className={`p-2 rounded-lg text-white ${link.color}`}>
                        {React.cloneElement(link.icon as React.ReactElement, { className: 'h-4 w-4' })}
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-tight text-slate-700">{link.label}</span>
                    </Button>
                  </Link>
                ))}
              </CardContent>
            </Card>

            {/* Recent Activity Mini List */}
            <Card className="shadow-sm border-none bg-white overflow-hidden">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  Aktivitas Terbaru
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-100">
                  {summary?.recent_topups?.length ? summary.recent_topups.map((topup: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors">
                      <div className={`p-2 rounded-full ${topup.status === 'success' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                        {topup.status === 'success' ? <ArrowUpRight className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold truncate uppercase">{topup.account?.customer_name || 'Santri'}</p>
                        <p className="text-[10px] text-muted-foreground">{topup.channel?.replace('_', ' ')}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-[11px] font-black ${topup.status === 'success' ? 'text-green-600' : 'text-amber-600'}`}>
                          +{formatCurrency(parseFloat(topup.amount))}
                        </p>
                      </div>
                    </div>
                  )) : (
                    <div className="p-8 text-center text-xs text-muted-foreground italic">Belum ada aktivitas hari ini.</div>
                  )}
                </div>
              </CardContent>
              <div className="bg-slate-50 p-3 text-center border-t">
                 <Link to="/dashboard/bank-santri/transaksi" className="text-[10px] font-bold text-primary uppercase hover:underline">Lihat Semua Transaksi</Link>
              </div>
            </Card>
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
};

export default BankSantriPage;