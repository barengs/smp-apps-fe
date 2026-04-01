import React, { useState } from 'react';
import { useGetViolationReportQuery } from '@/store/slices/pesantrenReportApi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Printer, Search, ShieldAlert, FileText } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const LaporanPelanggaranPage: React.FC = () => {
  const [dateRange, setDateRange] = useState({
    start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
  });

  const { data, isLoading, isFetching, error } = useGetViolationReportQuery(dateRange);

  const handlePrint = () => {
    window.print();
  };

  const getSeverityColor = (level?: string) => {
    switch (level?.toLowerCase()) {
      case 'berat': return 'destructive';
      case 'sedang': return 'warning';
      case 'ringan': return 'secondary';
      default: return 'outline';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center print:hidden">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Laporan Pelanggaran</h1>
          <p className="text-muted-foreground">Monitoring kedisiplinan santri</p>
        </div>
        <Button variant="outline" onClick={handlePrint} disabled={isFetching}>
          <Printer className="mr-2 h-4 w-4" /> Cetak Laporan
        </Button>
      </div>

      {/* Filter Section - Print Hidden */}
      <Card className="print:hidden">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="start_date">Tanggal Mulai</Label>
              <Input
                id="start_date"
                type="date"
                value={dateRange.start_date}
                onChange={(e) => setDateRange(prev => ({ ...prev, start_date: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">Tanggal Akhir</Label>
              <Input
                id="end_date"
                type="date"
                value={dateRange.end_date}
                onChange={(e) => setDateRange(prev => ({ ...prev, end_date: e.target.value }))}
              />
            </div>
            <div className="flex gap-2">
              {isFetching && <Loader2 className="animate-spin h-5 w-5 text-muted-foreground" />}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Print-only Header */}
      <div className="hidden print:block text-center border-b pb-4 mb-6">
        <h1 className="text-2xl font-bold uppercase">LAPORAN KEDISIPLINAN SANTRI</h1>
        <p className="text-lg">Periode: {dateRange.start_date} s/d {dateRange.end_date}</p>
        <p className="text-sm text-muted-foreground">Dicetak pada: {new Date().toLocaleString('id-ID')}</p>
      </div>

      {error ? (
        <Card className="border-destructive">
          <CardContent className="pt-6 text-center text-destructive">
            Gagal mengambil data laporan pelanggaran.
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Stats Aggregation Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-destructive" />
                Statistik Pelanggaran per Kategori
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[250px]">
              {data?.stats && data.stats.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.stats} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#ef4444" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground italic">
                  Tidak ada data pelanggaran di periode ini.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Detailed Table */}
          <Card>
            <CardHeader className="print:pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Daftar Rincian Pelanggaran
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Nama Santri</TableHead>
                    <TableHead>Asrama</TableHead>
                    <TableHead>Jenis Pelanggaran</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead className="print:hidden">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.list.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium whitespace-nowrap">
                        {new Date(item.violation_date).toLocaleDateString('id-ID')}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{item.student.first_name} {item.student.last_name}</div>
                        <div className="text-xs text-muted-foreground">NIS: {item.student.nis}</div>
                      </TableCell>
                      <TableCell>{item.student.hostel?.name || '-'}</TableCell>
                      <TableCell>
                        <div className="font-medium">{item.violation.name}</div>
                        <div className="text-xs text-muted-foreground truncate max-w-[200px]">{item.description}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="text-sm">{item.violation.category.name}</span>
                          <Badge variant={getSeverityColor(item.violation.category.severity_level) as any} className="w-fit text-[10px] px-1.5 py-0">
                            {item.violation.category.severity_level}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="print:hidden">
                        <Badge variant="outline">Tercatat</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {data?.list.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground italic">
                        Tidak ada catatan pelanggaran ditemukan.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
