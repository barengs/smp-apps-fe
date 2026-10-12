import React, { useEffect, useState } from 'react';
import WaliSantriLayout from '@/layouts/WaliSantriLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { selectCurrentUser, selectIsAuthenticated } from '@/store/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import { useGetControlPanelSettingsQuery } from '@/store/slices/controlPanelApi';
import {
  useGetProfileDetailsQuery,
  useGetSantriByParentNikQuery,
  useGetStudentFinanceQuery,
  useGetStudentViolationsQuery,
  useGetStudentLeavesQuery,
  Santri,
} from '@/store/slices/authApi';
import ClassicInfoBox from '@/components/ClassicInfoBox';
import { Wallet, ArrowUpCircle, UserCheck, AlertTriangle, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const formatRp = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value || 0);
};

const formatDate = (dateString?: string | null) => {
  if (!dateString) return '-';
  try {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
};

const WaliSantriDashboard: React.FC = () => {
  const { t } = useTranslation();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const currentUser = useSelector(selectCurrentUser);
  const navigate = useNavigate();

  const { data: settingsResponse } = useGetControlPanelSettingsQuery();
  const settings = settingsResponse?.data;

  // Dapatkan NIK dari user atau fetch profile
  const storedNik = currentUser?.profile?.nik;
  const { data: profileData, isLoading: isProfileLoading } = useGetProfileDetailsQuery(undefined, {
    skip: !!storedNik,
  });
  const nik = storedNik || profileData?.data?.profile?.nik;

  // Dapatkan daftar santri yang terafiliasi dengan NIK wali
  const { data: santriData, isLoading: isSantriLoading } = useGetSantriByParentNikQuery(nik || '', {
    skip: !nik,
  });
  const students: Santri[] = santriData?.data?.student || [];

  const [selectedStudentId, setSelectedStudentId] = useState<string>('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const currentStudent = students.find((s) => String(s.id) === selectedStudentId) || students[0];
  const activeStudentId = currentStudent ? String(currentStudent.id) : '';

  // Data keuangan riil (via smpt proxy ke bank-santri)
  const { data: financeResponse, isLoading: isFinanceLoading } = useGetStudentFinanceQuery(activeStudentId, {
    skip: !activeStudentId,
  });

  // Data pelanggaran riil
  const { data: violationsResponse, isLoading: isViolationsLoading } = useGetStudentViolationsQuery(activeStudentId, {
    skip: !activeStudentId,
  });

  // Data perizinan riil
  const { data: leavesResponse, isLoading: isLeavesLoading } = useGetStudentLeavesQuery(activeStudentId, {
    skip: !activeStudentId,
  });

  if (!isAuthenticated) {
    return null;
  }

  const account = financeResponse?.data?.account;
  const arrears = financeResponse?.data?.arrears;
  const transactions = financeResponse?.data?.transactions || [];
  const violations = violationsResponse?.data || [];
  const leaves = leavesResponse?.data || [];

  // Cari transaksi top-up terbaru (tipe TOPUP / kredit / transfer masuk)
  const lastTopUpTx = transactions.find((t) => {
    const type = (t.transaction_type || '').toUpperCase();
    const desc = (t.description || '').toUpperCase();
    const dir = (t.direction || '').toLowerCase();
    return (
      type.includes('TOP') ||
      type.includes('DEPOSIT') ||
      desc.includes('TOP UP') ||
      desc.includes('TRANSFER') ||
      dir === 'credit' ||
      dir === 'in'
    );
  });

  // Ambil histori pembayaran (dari tagihan lunas atau transaksi debit pembayaran)
  const paidBills = (arrears?.bills || []).filter((b) => b.status === 'paid');

  return (
    <WaliSantriLayout title="Dashboard Wali Santri" role="wali-santri">
      {/* Header Selector Santri jika punya lebih dari 1 anak */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Selamat Datang, {currentUser?.name || 'Wali Santri'}
          </h1>
          <p className="text-muted-foreground text-sm">
            Pantau saldo saku, status akademik, perizinan, dan pembayaran putra/putri Anda.
          </p>
        </div>

        {students.length > 1 && (
          <div className="w-full sm:w-[260px]">
            <Select
              value={selectedStudentId || String(currentStudent?.id || '')}
              onValueChange={(val) => setSelectedStudentId(val)}
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Pilih Santri" />
              </SelectTrigger>
              <SelectContent>
                {students.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>
                    {s.first_name} {s.last_name || ''} ({s.nis})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Banner Tunggakan jika ada */}
      {arrears?.has_arrears && currentStudent && (
        <Alert variant="destructive" className="mb-6 bg-red-50 border-red-200 text-red-900">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <AlertTitle className="text-red-800 font-semibold">
            Terdapat Tunggakan Biaya Pendidikan — {currentStudent.first_name}
          </AlertTitle>
          <AlertDescription className="mt-1 text-red-700 text-sm">
            Total tunggakan sebesar <strong>{formatRp(arrears.total_arrears)}</strong> ({arrears.overdue_months_count} bulan, periode {arrears.oldest_overdue_period} s.d {arrears.newest_overdue_period}).
            Silakan lakukan pelunasan untuk kelancaran administrasi ujian.
          </AlertDescription>
        </Alert>
      )}

      {/* Ringkasan Statistik Utama */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {settings?.app_ui_style === 'classic' ? (
          <>
            <ClassicInfoBox 
              title="Sisa Saldo Rekening"
              value={account ? formatRp(account.balance) : isFinanceLoading ? 'Memuat...' : 'Rp 0'}
              icon={<Wallet />}
              color="blue"
            />
            <ClassicInfoBox 
              title="Top Up Terakhir"
              value={lastTopUpTx ? formatRp(lastTopUpTx.amount) : 'Belum Ada'}
              icon={<ArrowUpCircle />}
              color="green"
            />
            <ClassicInfoBox 
              title="Status Santri"
              value={currentStudent?.status || 'Aktif'}
              icon={<UserCheck />}
              color="yellow"
            />
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sisa Saldo Rekening</CardTitle>
                <Wallet className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                {isFinanceLoading ? (
                  <Skeleton className="h-8 w-32 mb-1" />
                ) : (
                  <div className="text-2xl font-bold text-blue-600">
                    {account ? formatRp(account.balance) : 'Rp 0'}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Status Rekening: {account?.status || 'Aktif'} • NIS {currentStudent?.nis || '-'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Top Up Terakhir</CardTitle>
                <ArrowUpCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                {isFinanceLoading ? (
                  <Skeleton className="h-8 w-32 mb-1" />
                ) : (
                  <div className="text-2xl font-bold text-green-600">
                    {lastTopUpTx ? formatRp(lastTopUpTx.amount) : 'Belum Ada'}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  {lastTopUpTx ? formatDate(lastTopUpTx.created_at) : 'Belum ada mutasi top-up'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Status Santri</CardTitle>
                <UserCheck className="h-4 w-4 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-800">
                  {currentStudent?.status || 'Aktif'}
                </div>
                <p className="text-xs text-muted-foreground truncate" title={currentStudent?.program?.name || '-'}>
                  {currentStudent?.program?.name || 'Program Pesantren'}
                  {currentStudent?.current_class ? ` • ${currentStudent.current_class.class_name}` : ''}
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Grid Konten Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Histori Pembayaran */}
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Histori Pembayaran Tagihan</CardTitle>
              <CardDescription>
                Tagihan pendidikan yang telah diselesaikan ({currentStudent?.first_name || '-'})
              </CardDescription>
            </div>
            <button
              onClick={() => navigate('/dashboard/wali-santri/tagihan')}
              className="text-xs text-blue-600 hover:underline font-medium"
            >
              Lihat Tagihan &rarr;
            </button>
          </CardHeader>
          <CardContent>
            {isFinanceLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : paidBills.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Belum ada riwayat tagihan terbayar.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {paidBills.slice(0, 5).map((bill) => (
                  <div key={bill.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium text-sm text-gray-900">Periode Tagihan {bill.period}</p>
                      <p className="text-xs text-muted-foreground">
                        Jatuh tempo: {formatDate(bill.due_date)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm text-gray-900">{formatRp(bill.paid_amount || bill.amount)}</p>
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-xs font-normal border-green-200">
                        Lunas
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Riwayat Pelanggaran */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>Riwayat Pelanggaran Santri</span>
            </CardTitle>
            <CardDescription>
              Catatan kedisiplinan santri selama masa studi
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isViolationsLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : violations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground bg-green-50/50 rounded-lg border border-dashed border-green-200">
                <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <p className="text-sm font-medium text-green-800">Alhamdulillah!</p>
                <p className="text-xs text-green-600">Tidak ada catatan pelanggaran yang tercatat.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {violations.slice(0, 5).map((v) => (
                  <div key={v.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium text-sm text-gray-900">{v.violation?.name || 'Pelanggaran'}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(v.date)} {v.sanction?.name ? `• Sanksi: ${v.sanction.name}` : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                        +{v.violation?.points || 0} Poin
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Riwayat Perizinan & Aktivitas */}
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Riwayat Perizinan Santri</CardTitle>
            <CardDescription>
              Daftar izin pulang, dispensasi, atau keluar lingkungan pesantren
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLeavesLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : leaves.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Belum ada riwayat perizinan santri.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {leaves.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3 last:border-0 last:pb-0 gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-gray-900">{item.leave_type?.name || 'Izin'}</span>
                        <Badge
                          variant={item.status === 'approved' ? 'default' : item.status === 'rejected' ? 'destructive' : 'secondary'}
                          className={`text-xs ${item.status === 'approved' ? 'bg-green-500 hover:bg-green-600' : ''}`}
                        >
                          {item.status === 'approved' ? 'Disetujui' : item.status === 'rejected' ? 'Ditolak' : 'Menunggu'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.reason || '-'}</p>
                    </div>
                    <div className="text-xs text-muted-foreground sm:text-right whitespace-nowrap">
                      {formatDate(item.start_date)} s.d {formatDate(item.end_date)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </WaliSantriLayout>
  );
};

export default WaliSantriDashboard;