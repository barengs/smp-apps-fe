import React, { useState, useRef } from 'react';
import { useGetAttendanceStatsQuery } from '@/store/slices/pesantrenReportApi';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Printer, CalendarCheck, Percent } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { generateStatistikPresensiPdf } from '@/components/reports/StatistikPresensiPdf';
import { useGetStudentCardSettingsQuery } from '@/store/slices/studentCardApi';
import { imageUrlToBase64, getFullStorageUrl } from '@/utils/pdfExport';

export const StatistikPresensiPage: React.FC = () => {
  const [dateRange, setDateRange] = useState({
    start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
  });

  const { data, isLoading, isFetching, error } = useGetAttendanceStatsQuery(dateRange);
  const { data: settingsResponse } = useGetStudentCardSettingsQuery();

  const handlePrintPdf = async () => {
    if (!data) return;
    
    const settings = settingsResponse?.data;
    let kopSuratUrl: string | undefined = undefined;

    if (settings?.kop_surat) {
      const fullUrl = getFullStorageUrl(settings.kop_surat);
      if (fullUrl) {
        kopSuratUrl = await imageUrlToBase64(fullUrl) || fullUrl;
      }
    } else {
      const fallbackUrl = `${window.location.origin}/images/KOP PESANTREN.png`;
      kopSuratUrl = await imageUrlToBase64(fallbackUrl) || fallbackUrl;
    }

    await generateStatistikPresensiPdf(data, dateRange, kopSuratUrl);
  };

  const getPercentageColor = (percent: number) => {
    if (percent >= 90) return 'text-green-600 dark:text-green-400';
    if (percent >= 75) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <DashboardLayout title="Statistik Presensi" role="administrasi">
      <div className="container mx-auto py-6 px-4 space-y-6">
        <div className="flex justify-between items-center print:hidden">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Statistik Presensi</h1>
            <p className="text-muted-foreground">Grafik dan persentase kehadiran santri per mata pelajaran/kelas</p>
          </div>
          <Button variant="outline" onClick={handlePrintPdf} disabled={isFetching}>
            <Printer className="mr-2 h-4 w-4" /> Cetak Laporan (PDF)
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

        {error ? (
          <Card className="border-destructive">
            <CardContent className="pt-6 text-center text-destructive">
              Gagal mengambil data statistik presensi.
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Attendance Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Percent className="h-5 w-5 text-primary" />
                  Grafik Tingkat Kehadiran Per Mata Pelajaran (%)
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                {data?.attendance && data.attendance.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.attendance}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="study_name" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip 
                         formatter={(value: number) => [`${value}%`, 'Persentase Kehadiran']}
                      />
                      <Bar dataKey="percentage" radius={[4, 4, 0, 0]}>
                        {data.attendance.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.percentage >= 90 ? '#10b981' : entry.percentage >= 75 ? '#f59e0b' : '#ef4444'} 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground italic">
                    Tidak ada catatan presensi di periode ini.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Detailed Table */}
            <Card>
              <CardHeader className="print:pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CalendarCheck className="h-5 w-5 text-primary" />
                  Ringkasan Kehadiran
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mata Pelajaran / Bidang</TableHead>
                      <TableHead className="text-right">Hadir</TableHead>
                      <TableHead className="text-right">Izin</TableHead>
                      <TableHead className="text-right">Sakit</TableHead>
                      <TableHead className="text-right">Alfa</TableHead>
                      <TableHead className="text-right">Total Jam</TableHead>
                      <TableHead className="text-right font-bold">Presensi (%)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.attendance.map((row, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{row.study_name}</TableCell>
                        <TableCell className="text-right">{row.present}</TableCell>
                        <TableCell className="text-right">{row.permit}</TableCell>
                        <TableCell className="text-right">{row.sick}</TableCell>
                        <TableCell className="text-right">{row.absent}</TableCell>
                        <TableCell className="text-right">{row.total}</TableCell>
                        <TableCell className={`text-right font-bold ${getPercentageColor(row.percentage)}`}>
                          {row.percentage}%
                        </TableCell>
                      </TableRow>
                    ))}
                    {data?.attendance.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground italic">
                          Tidak ada catatan presensi ditemukan.
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
    </DashboardLayout>
  );
};

