import React, { useState } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useGetRekapKasirQuery } from "@/store/slices/reportApi";
import { formatCurrency } from "@/utils/formatCurrency";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Receipt, Wallet, Banknote, Loader2, ArrowUpRight, ArrowDownLeft, FileCheck } from "lucide-react";

const LaporanRekapKasirPage: React.FC = () => {
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const { data: response, isLoading, isFetching } = useGetRekapKasirQuery({ date });
  const report = response?.data;

  const totalIncome = report?.income?.reduce((acc, curr) => acc + parseFloat(curr.total.toString()), 0) || 0;
  const totalExpense = report?.expense?.reduce((acc, curr) => acc + parseFloat(curr.total.toString()), 0) || 0;
  const net = totalIncome - totalExpense;

  return (
    <DashboardLayout title="Rekapitulasi Kasir" role="administrasi">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Rekapitulasi Harian Kasir</h1>
            <p className="text-muted-foreground">Laporan ringkas untuk proses tutup buku harian.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="grid gap-1">
              <label className="text-xs font-semibold uppercase text-muted-foreground">Pilih Tanggal</label>
              <Input 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)} 
                className="w-full md:w-[180px]"
              />
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Uang Masuk</CardTitle>
              <ArrowDownLeft className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">{formatCurrency(totalIncome)}</div>
              <p className="text-xs text-muted-foreground mt-1">Setoran & Top-up</p>
            </CardContent>
          </Card>
          <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Uang Keluar</CardTitle>
              <ArrowUpRight className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{formatCurrency(totalExpense)}</div>
              <p className="text-xs text-muted-foreground mt-1">Penarikan & Belanja</p>
            </CardContent>
          </Card>
          <Card className="border-primary bg-primary/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium font-bold text-primary tracking-widest uppercase">Posisi Kas Netto</CardTitle>
              <Wallet className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{formatCurrency(net)}</div>
              <p className="text-xs text-muted-foreground mt-1">Estimasi kas fisik hari ini</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                <Banknote className="h-4 w-4 text-emerald-700" />
              </div>
              <div>
                <CardTitle className="text-base uppercase tracking-wider">Rincian Pendapatan</CardTitle>
                <CardDescription>Detail dana masuk per-jenis layanan.</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  {report?.income?.length === 0 && (
                    <TableRow><TableCell className="text-center italic opacity-40">Tidak ada dana masuk.</TableCell></TableRow>
                  )}
                  {report?.income?.map((item) => (
                    <TableRow key={item.name} className="hover:bg-emerald-50/10">
                      <TableCell className="font-medium text-xs">{item.name}</TableCell>
                      <TableCell className="text-right font-mono font-bold text-emerald-600">
                        {formatCurrency(parseFloat(item.total.toString()))}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="border-t-2 font-bold bg-emerald-50/10">
                    <TableCell>TOTAL DEPOSIT</TableCell>
                    <TableCell className="text-right text-emerald-700">{formatCurrency(totalIncome)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-red-100 flex items-center justify-center">
                <Receipt className="h-4 w-4 text-red-700" />
              </div>
              <div>
                <CardTitle className="text-base uppercase tracking-wider">Rincian Pengeluaran</CardTitle>
                <CardDescription>Detail dana keluar per-jenis layanan.</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  {report?.expense?.length === 0 && (
                    <TableRow><TableCell className="text-center italic opacity-40">Tidak ada dana keluar.</TableCell></TableRow>
                  )}
                  {report?.expense?.map((item) => (
                    <TableRow key={item.name} className="hover:bg-red-50/10">
                      <TableCell className="font-medium text-xs font-semibold">{item.name}</TableCell>
                      <TableCell className="text-right font-mono font-bold text-red-600">
                        {formatCurrency(parseFloat(item.total.toString()))}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="border-t-2 font-bold bg-red-50/10">
                    <TableCell>TOTAL WITHDRAWAL</TableCell>
                    <TableCell className="text-right text-red-700">{formatCurrency(totalExpense)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-center p-8 bg-muted/20 border border-dashed rounded-xl">
           <div className="text-center max-w-md">
              <FileCheck className="h-10 w-10 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-bold mb-2">Siap Tutup Buku?</h3>
              <p className="text-sm text-muted-foreground mb-6">Pastikan fisik uang di kasir sesuai dengan <strong>Posisi Kas Netto</strong> hari ini ({formatCurrency(net)}). Silakan cetak rekap ini untuk arsip fisik bank.</p>
              <div className="flex gap-2 justify-center">
                 <Button>Cetak Rekap Kasir</Button>
                 <Button variant="outline">Tutup Shift</Button>
              </div>
           </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LaporanRekapKasirPage;
