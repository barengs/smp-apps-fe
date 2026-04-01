import React, { useState } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useGetJurnalUmumQuery } from "@/store/slices/reportApi";
import { formatCurrency } from "@/utils/formatCurrency";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Search, Filter, BookText, FileDown, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const LaporanJurnalPage: React.FC = () => {
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = useGetJurnalUmumQuery({
    start_date: startDate,
    end_date: endDate,
    page: page,
  });

  const ledgers = data?.data?.data || [];

  return (
    <DashboardLayout title="Laporan Jurnal Umum" role="administrasi">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Jurnal Umum Perbankan</h1>
            <p className="text-muted-foreground">Monitoring seluruh mutasi ledger bank secara kronologis.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <FileDown className="h-4 w-4 mr-2" />
              Ekspor PDF
            </Button>
            <Button variant="outline" size="sm">
              <FileDown className="h-4 w-4 mr-2" />
              Excel
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col md:flex-row md:items-end gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Dari Tanggal</label>
                <Input 
                  type="date" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)} 
                  className="w-full md:w-[200px]"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Sampai Tanggal</label>
                <Input 
                  type="date" 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)} 
                  className="w-full md:w-[200px]"
                />
              </div>
              <Button onClick={() => setPage(1)} className="shrink-0">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border relative">
              {(isLoading || isFetching) && (
                <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10 backdrop-blur-[1px]">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              )}
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[180px]">Waktu / Ref</TableHead>
                    <TableHead>Keterangan / Transaksi</TableHead>
                    <TableHead>Kode COA</TableHead>
                    <TableHead>Nama Akun</TableHead>
                    <TableHead className="text-right">Debit</TableHead>
                    <TableHead className="text-right">Kredit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ledgers.length === 0 && !isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        Tidak ada data ditemukan pada periode ini.
                      </TableCell>
                    </TableRow>
                  ) : (
                    ledgers.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>
                          <div className="font-medium text-xs">
                            {format(new Date(entry.created_at), "dd MMM yyyy HH:mm", { locale: id })}
                          </div>
                          <div className="text-[10px] text-muted-foreground uppercase font-mono">
                            {entry.transaction?.reference_number || "-"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{entry.transaction?.transaction_type?.name || "Manual Journal"}</div>
                          <div className="text-xs text-muted-foreground italic truncate max-w-[200px]">
                            {entry.description}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono text-[10px]">
                            {entry.coa_code}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs uppercase font-medium">
                          {entry.account_name}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs">
                          {entry.debit > 0 ? formatCurrency(entry.debit) : "-"}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs text-orange-600 dark:text-orange-400">
                          {entry.credit > 0 ? formatCurrency(entry.credit) : "-"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            
            <div className="flex items-center justify-between space-x-2 py-4">
              <div className="text-sm text-muted-foreground">
                Menampilkan total {ledgers.length} baris jurnal
              </div>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Sebelumnya
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={ledgers.length < 50}
                >
                  Selanjutnya
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default LaporanJurnalPage;
