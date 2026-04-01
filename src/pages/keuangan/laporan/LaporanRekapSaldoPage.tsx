import React from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useGetRekapSaldoQuery } from "@/store/slices/reportApi";
import { formatCurrency } from "@/utils/formatCurrency";
import { Landmark, Users, CreditCard, Loader2, ArrowUpRight } from "lucide-react";

const LaporanRekapSaldoPage: React.FC = () => {
  const { data, isLoading } = useGetRekapSaldoQuery();

  const summaries = data?.data || [];
  const grandTotal = data?.total_all || 0;

  return (
    <DashboardLayout title="Rekapitulasi Saldo" role="administrasi">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Rekapitulasi Saldo Bank</h1>
          <p className="text-muted-foreground">Monitoring total kewajiban bank kepada seluruh santri berdasarkan produk tabungan.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Dana Kelolaan</CardTitle>
              <Landmark className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(grandTotal)}</div>
              <p className="text-xs text-muted-foreground mt-1">+0.0% dari bulan lalu</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Rekening Aktif</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summaries.reduce((acc, curr) => acc + curr.total_accounts, 0)}</div>
              <p className="text-xs text-muted-foreground mt-1">Santri terdaftar</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rasio Penarikan</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">Sehat</div>
              <p className="text-xs text-muted-foreground mt-1">Likuiditas terjaga</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Rincian per Produk Tabungan</CardTitle>
            <CardDescription>Pembagian saldo berdasarkan kategori produk yang dikelola.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Nama Produk</TableHead>
                      <TableHead className="text-center">Jumlah Rekening</TableHead>
                      <TableHead className="text-right">Total Saldo</TableHead>
                      <TableHead className="text-right">Persentase</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {summaries.map((item) => (
                      <TableRow key={item.product_name}>
                        <TableCell className="font-bold flex items-center gap-2">
                          <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                          {item.product_name}
                        </TableCell>
                        <TableCell className="text-center font-mono">
                          {item.total_accounts}
                        </TableCell>
                        <TableCell className="text-right font-bold text-primary">
                          {formatCurrency(item.total_balance)}
                        </TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground">
                          {((item.total_balance / grandTotal) * 100).toFixed(1)}%
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-muted/20 font-bold text-lg">
                      <TableCell colSpan={2} className="text-right">TOTAL KESELURUHAN</TableCell>
                      <TableCell className="text-right text-primary">{formatCurrency(grandTotal)}</TableCell>
                      <TableCell className="text-right">100%</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default LaporanRekapSaldoPage;
