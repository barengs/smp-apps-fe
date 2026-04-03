import React from 'react';
import { useGetStudentStatsQuery } from '@/store/slices/pesantrenReportApi';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Printer, Users, UserPlus, GraduationCap } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { generateStatistikSantriPdf } from '@/components/reports/StatistikSantriPdf';
import { useGetStudentCardSettingsQuery } from '@/store/slices/studentCardApi';
import { imageUrlToBase64, getFullStorageUrl } from '@/utils/pdfExport';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export const StatistikSantriPage: React.FC = () => {
  const { data, isLoading, error } = useGetStudentStatsQuery();
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

    await generateStatistikSantriPdf(data, kopSuratUrl);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6 text-center text-destructive">
          Gagal mengambil data statistik santri. Silakan coba lagi nanti.
        </CardContent>
      </Card>
    );
  }

  const genderData = data.by_gender.map(g => ({
    name: g.gender === 'L' ? 'Laki-laki' : 'Perempuan',
    value: g.count
  }));

  return (
    <DashboardLayout title="Statistik Santri" role="administrasi">
      <div className="container mx-auto py-6 px-4 space-y-6">
        {/* Header - Hidden on Print behavior is now handled by PDF */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Statistik Santri</h1>
            <p className="text-muted-foreground">
              Ringkasan data santri Tahun Ajaran {data.academic_year}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrintPdf}>
              <Printer className="mr-2 h-4 w-4" /> Cetak Laporan (PDF)
            </Button>
          </div>
        </div>

        {/* Page Content (Visible on screen) */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Santri Aktif</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.summary.active}</div>
              <p className="text-xs text-muted-foreground">Total santri terdaftar aktif</p>
            </CardContent>
          </Card>
          <Card className="bg-green-500/5 border-green-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Santri Baru</CardTitle>
              <UserPlus className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.summary.new}</div>
              <p className="text-xs text-muted-foreground">Tahun Ajaran ini</p>
            </CardContent>
          </Card>
          <Card className="bg-orange-500/5 border-orange-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tamat/Lulus</CardTitle>
              <GraduationCap className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.summary.graduated}</div>
              <p className="text-xs text-muted-foreground">Total kumulatif</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Hostel Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Distribusi per Asrama</CardTitle>
              <CardDescription>Jumlah santri aktif di setiap asrama</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.by_hostel}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="hostel_name" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Gender Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Rasio Gender</CardTitle>
              <CardDescription>Perbandingan santri laki-laki dan perempuan</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genderData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {genderData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

