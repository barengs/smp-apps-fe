import React, { useState } from 'react';
import WaliSantriLayout from '@/layouts/WaliSantriLayout';
import { useGetBillsByAccountQuery } from '@/store/slices/bankApi';
import { useGetSantriByParentNikQuery, useGetProfileDetailsQuery } from '@/store/slices/authApi';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/store/slices/authSlice';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formatRp = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value || 0);
};

interface StudentItem {
  id: number;
  nis: string;
  first_name: string;
  last_name: string;
}

export default function TagihanPage() {
  const currentUser = useSelector(selectCurrentUser);
  const storedNik = currentUser?.profile?.nik;

  const { data: profileData, isLoading: isProfileLoading } = useGetProfileDetailsQuery(undefined, {
    skip: !!storedNik,
  });

  const nik = storedNik || profileData?.data?.profile?.nik;

  const { data: santriData, isLoading: isSantriLoading } = useGetSantriByParentNikQuery(nik || '', {
    skip: !nik,
  });

  const students: StudentItem[] = santriData?.data?.student || [];
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');

  // Default ke santri pertama jika belum dipilih
  const currentStudent = students.find((s) => String(s.id) === selectedStudentId) || students[0];
  const targetNis = currentStudent?.nis;

  const { data: billsResponse, isLoading: isBillsLoading } = useGetBillsByAccountQuery(targetNis || '', {
    skip: !targetNis,
  });

  const isLoading = isProfileLoading || isSantriLoading;
  const billsData = billsResponse?.data;
  const bills = billsData?.bills || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-500 hover:bg-green-600">Lunas</Badge>;
      case 'partial':
        return <Badge variant="outline" className="text-orange-500 border-orange-500">Bayar Sebagian</Badge>;
      case 'overdue':
        return <Badge variant="destructive">Jatuh Tempo (Menunggak)</Badge>;
      case 'unpaid':
        return <Badge variant="secondary">Belum Dibayar</Badge>;
      case 'waived':
        return <Badge variant="outline">Dibebaskan (Beasiswa)</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <WaliSantriLayout title="Informasi Tagihan" role="wali-santri">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Informasi Tagihan Santri</h2>
            <p className="text-muted-foreground text-sm">
              Rincian paket pendidikan bulanan, status pembayaran, dan rekap tunggakan.
            </p>
          </div>

          {students.length > 1 && (
            <div className="w-full sm:w-[240px]">
              <Select
                value={selectedStudentId || String(currentStudent?.id || '')}
                onValueChange={(val) => setSelectedStudentId(val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Santri" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.first_name} {s.last_name} ({s.nis})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-28 w-full" />
            </div>
            <Skeleton className="h-64 w-full" />
          </div>
        ) : !currentStudent ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Tidak Ada Data Santri</AlertTitle>
            <AlertDescription>
              Belum ada data santri aktif yang terhubung dengan akun Wali Santri Anda.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            {/* Banner Peringatan Tunggakan jika Ada */}
            {billsData?.has_arrears && (
              <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-900">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <AlertTitle className="text-red-800 font-semibold">
                  Terdapat Tunggakan Pembayaran — {currentStudent.first_name}
                </AlertTitle>
                <AlertDescription className="mt-2 text-red-700 text-sm">
                  Terdapat tunggakan sebesar <strong>{formatRp(billsData.total_arrears)}</strong> ({billsData.overdue_months_count} bulan, periode {billsData.oldest_overdue_period} s.d {billsData.newest_overdue_period}).
                  <br />
                  <span className="font-semibold text-red-800">
                    Perhatian: Santri yang masih menunggak saat masa Ujian Triwulan tidak dapat diterbitkan kartu ujiannya.
                  </span>
                </AlertDescription>
              </Alert>
            )}

            {!billsData?.has_arrears && bills.length > 0 && (
              <Alert className="bg-green-50 border-green-200 text-green-900">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <AlertTitle className="text-green-800 font-semibold">Status Keuangan Tertib</AlertTitle>
                <AlertDescription className="text-green-700 text-sm">
                  Alhamdulillah, seluruh tagihan telah dilunasi tepat waktu. Santri memenuhi syarat administratif ujian.
                </AlertDescription>
              </Alert>
            )}

            {/* Rekap Saldo & Tunggakan */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Tunggakan Jatuh Tempo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600">
                    {formatRp(billsData?.total_arrears || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {billsData?.overdue_months_count || 0} periode tagihan lewat batas bayar
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Belum Dibayar</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {formatRp(billsData?.total_unpaid_all || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Termasuk tagihan periode aktif berjalan
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Tabel Riwayat Tagihan */}
            <Card>
              <CardHeader>
                <CardTitle>Riwayat Tagihan Bulanan ({currentStudent.first_name})</CardTitle>
                <CardDescription>
                  NIS Rekening: <span className="font-mono font-medium text-foreground">{currentStudent.nis || '-'}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isBillsLoading ? (
                  <div className="space-y-2 py-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : bills.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">
                    <Clock className="h-10 w-10 mx-auto mb-3 opacity-20" />
                    <p>Belum ada daftar tagihan yang diterbitkan untuk santri ini.</p>
                  </div>
                ) : (
                  <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                      <thead className="[&_tr]:border-b">
                        <tr className="border-b transition-colors hover:bg-muted/50">
                          <th className="h-12 px-4 text-left font-medium text-muted-foreground">Periode</th>
                          <th className="h-12 px-4 text-left font-medium text-muted-foreground">Jatuh Tempo</th>
                          <th className="h-12 px-4 text-right font-medium text-muted-foreground">Tagihan</th>
                          <th className="h-12 px-4 text-right font-medium text-muted-foreground">Terbayar</th>
                          <th className="h-12 px-4 text-right font-medium text-muted-foreground">Sisa</th>
                          <th className="h-12 px-4 text-center font-medium text-muted-foreground">Status</th>
                        </tr>
                      </thead>
                      <tbody className="[&_tr:last-child]:border-0">
                        {bills.map((bill) => (
                          <tr key={bill.id} className="border-b transition-colors hover:bg-muted/50">
                            <td className="p-4 font-medium">{bill.period}</td>
                            <td className="p-4 text-muted-foreground">
                              {bill.due_date ? new Date(bill.due_date).toLocaleDateString('id-ID') : '-'}
                            </td>
                            <td className="p-4 text-right">{formatRp(bill.amount)}</td>
                            <td className="p-4 text-right text-green-600">{formatRp(bill.paid_amount)}</td>
                            <td className="p-4 text-right font-semibold">
                              {bill.remaining > 0 ? (
                                <span className={bill.is_overdue ? 'text-red-600' : 'text-orange-500'}>
                                  {formatRp(bill.remaining)}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </td>
                            <td className="p-4 text-center">
                              {getStatusBadge(bill.status)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </WaliSantriLayout>
  );
}
