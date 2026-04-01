import React, { useState } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useGetMutasiNasabahQuery } from "@/store/slices/reportApi";
import { formatCurrency } from "@/utils/formatCurrency";
import { format, subMonths } from "date-fns";
import { id } from "date-fns/locale";
import { Search, Loader2, UserCircle, Receipt, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import * as toast from "@/utils/toast";

const LaporanMutasiNasabahPage: React.FC = () => {
  const [accountNumber, setAccountNumber] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState(format(subMonths(new Date(), 1), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const { data, isLoading, isFetching, error } = useGetMutasiNasabahQuery(
    { accountNumber: searchQuery, start_date: startDate, end_date: endDate },
    { skip: !searchQuery }
  );

  const handleSearch = () => {
    if (!accountNumber) {
      toast.showError("Masukkan NIS Santri terlebih dahulu.");
      return;
    }
    setSearchQuery(accountNumber);
  };

  const movements = data?.data || [];
  const account = data?.account;

  return (
    <DashboardLayout title="Laporan Mutasi Nasabah" role="administrasi">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Mutasi Rekening Santri</h1>
            <p className="text-muted-foreground">Detail histori debit dan kredit per santri (Buku Tabungan).</p>
          </div>
        </div>

        <Card className="border-primary/20">
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium">Nomor Rekening / NIS Santri</label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Masukkan NIS Santri..." 
                    value={accountNumber} 
                    onChange={(e) => setAccountNumber(e.target.value)} 
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <Button onClick={handleSearch} disabled={isLoading || isFetching}>
                    {isLoading || isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
                    Cari
                  </Button>
                </div>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Dari Tanggal</label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Sampai Tanggal</label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {account && (
              <div className="mb-6 p-4 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <UserCircle className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{account.customer_name}</h3>
                    <p className="text-sm text-muted-foreground font-mono uppercase tracking-widest">{account.account_number} • {account.status}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Saldo Terkini</p>
                  <p className="text-2xl font-bold text-primary">{formatCurrency(parseFloat(account.balance))}</p>
                </div>
              </div>
            )}

            {!searchQuery && (
              <div className="h-48 flex flex-col items-center justify-center text-center opacity-40">
                <Receipt className="h-12 w-12 mb-4" />
                <p>Silakan cari NIS santri untuk melihat mutasi.</p>
              </div>
            )}

            {searchQuery && (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                      <TableHead className="w-[120px]">Tanggal</TableHead>
                      <TableHead>Keterangan</TableHead>
                      <TableHead className="text-right">Debit</TableHead>
                      <TableHead className="text-right">Kredit</TableHead>
                      <TableHead className="text-right">Saldo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movements.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          Tidak ada mutasi ditemukan pada periode ini.
                        </TableCell>
                      </TableRow>
                    ) : (
                      movements.map((move) => (
                        <TableRow key={move.id} className="hover:bg-muted/30">
                          <TableCell className="text-xs">
                            {format(new Date(move.created_at), "dd/MM/yyyy", { locale: id })}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {move.type === 'debit' ? <ArrowDownCircle className="h-3 w-3 text-red-500 shrink-0" /> : <ArrowUpCircle className="h-3 w-3 text-emerald-500 shrink-0" />}
                              <span className="text-sm font-medium">{move.description}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right text-red-500 font-mono text-xs">
                            {move.type === 'debit' ? formatCurrency(move.amount) : "-"}
                          </TableCell>
                          <TableCell className="text-right text-emerald-600 font-mono text-xs">
                            {move.type === 'credit' ? formatCurrency(move.amount) : "-"}
                          </TableCell>
                          <TableCell className="text-right font-bold font-mono text-xs">
                            {formatCurrency(move.balance_after)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
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

export default LaporanMutasiNasabahPage;
