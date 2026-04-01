import React, { useState } from 'react';
import { useGetLeaveReportQuery } from '@/store/slices/pesantrenReportApi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Printer, ClipboardList, TrendingUp } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const LaporanIzinPage: React.FC = () => {
  const [dateRange, setDateRange] = useState({
    start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
  });

  const { data, isLoading, isFetching, error } = useGetLeaveReportQuery(dateRange);

  const handlePrint = () => {
    window.print();
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'approved': return 'success';
      case 'active': return 'primary';
      case 'overdue': return 'destructive';
      case 'completed': return 'secondary';
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
          <h1 className="text-3xl font-bold tracking-tight">Laporan Perizinan</h1>
          <p className="text-muted-foreground">Monitoring peridzinan santri keluar/pulang</p>
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
            <div className="flex gap-2 items-center">
              {isFetching && <Loader2 className="animate-spin h-5 w-5 text-muted-foreground" />}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Print-only Header */}
      <div className="hidden print:block text-center border-b pb-4 mb-6">
        <h1 className="text-2xl font-bold uppercase">LAPORAN PERIZINAN SANTRI</h1>
        <p className="text-lg">Pesantren Terpadu - Periode: {dateRange.start_date} s/d {dateRange.end_date}</p>
        <p className="text-sm text-muted-foreground">Dicetak pada: {new Date().toLocaleString('id-ID')}</p>
      </div>

      {error ? (
        <Card className="border-destructive">
          <CardContent className="pt-6 text-center text-destructive">
            Gagal mengambil data laporan perizinan.
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Stats Aggregation Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Statistik Status Perizinan
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[200px]">
              {data?.stats && data.stats.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.stats}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="status" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground italic">
                  Tidak ada data peridzinan di periode ini.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Detailed Table */}
          <Card>
            <CardHeader className="print:pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-primary" />
                Daftar Izin Santri
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mulai</TableHead>
                    <TableHead>Sampai</TableHead>
                    <TableHead>Santri</TableHead>
                    <TableHead>Jenis Izin</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.list.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium whitespace-nowrap">
                        {new Date(item.start_date).toLocaleDateString('id-ID')}
                      </TableCell>
                      <TableCell className="font-medium whitespace-nowrap">
                        {new Date(item.end_date).toLocaleDateString('id-ID')}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{item.student.first_name} {item.student.last_name}</div>
                        <div className="text-xs text-muted-foreground">NIS: {item.student.nis}</div>
                      </TableCell>
                      <TableCell>{item.leave_type.name}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(item.status) as any}>
                          {item.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {data?.list.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground italic">
                        Tidak ada catatan perizinan ditemukan.
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
