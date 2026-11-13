import React from 'react';
import { useGetStudentEducationHistoryQuery } from '@/store/slices/studentApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  GraduationCap,
  Calendar,
  Home,
  UserCheck,
  ExternalLink,
  Award,
  AlertCircle,
  Clock,
  BookOpen,
} from 'lucide-react';

interface Props {
  studentId: number;
}

const SantriEducationTab: React.FC<Props> = ({ studentId }) => {
  const { data: response, isLoading, isError, refetch } = useGetStudentEducationHistoryQuery(studentId);
  const tarbiyahWebUrl = import.meta.env.VITE_TARBIYAH_WEB_URL || 'http://localhost:8002';

  const eduData = response?.data;
  const currentClass = eduData?.current_class;
  const history = eduData?.history || [];
  const reports = eduData?.reports || [];
  const isOffline = eduData?.is_offline;

  const handleOpenTarbiyah = () => {
    window.open(tarbiyahWebUrl, '_blank', 'noopener,noreferrer');
  };

  const getStatusBadge = (status: string) => {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'aktif':
        return <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white capitalize">Aktif</Badge>;
      case 'lulus':
        return <Badge className="bg-blue-600 hover:bg-blue-700 text-white capitalize">Lulus</Badge>;
      case 'pindah_level':
        return <Badge variant="secondary" className="capitalize">Pindah Level</Badge>;
      case 'mutasi':
        return <Badge variant="outline" className="capitalize">Mutasi</Badge>;
      default:
        return <Badge variant="outline" className="capitalize">{status || 'Selesai'}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-28 w-full rounded-lg" />
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="border-destructive/30 bg-destructive/5">
        <CardContent className="pt-6 pb-6 text-center space-y-3">
          <AlertCircle className="mx-auto h-8 w-8 text-destructive" />
          <p className="text-sm font-medium text-destructive">
            Gagal mengambil riwayat pendidikan dari sistem Tarbiyah.
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Coba Lagi
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Banner Peringatan jika Service Tarbiyah Offline */}
      {isOffline && (
        <div className="flex items-center gap-2 p-3 text-xs rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400">
          <Clock className="h-4 w-4 shrink-0" />
          <span>Layanan akademik Tarbiyah sedang offline. Menampilkan data fallback.</span>
        </div>
      )}

      {/* Rombel / Kelas Aktif Saat Ini */}
      {currentClass ? (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <BookOpen className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-base">Kelas & Rombel Aktif</CardTitle>
                  <p className="text-xs text-muted-foreground">Status penempatan KBM tahun ajaran berjalan</p>
                </div>
              </div>
              {getStatusBadge(currentClass.status)}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-1">
              <div>
                <span className="text-xs text-muted-foreground block">Rombel / Kelas:</span>
                <span className="font-semibold text-foreground">
                  {currentClass.class_group}
                  {currentClass.grade_level ? ` (${currentClass.grade_level})` : ''}
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Lembaga / Jenjang:</span>
                <span className="font-medium text-foreground">{currentClass.institution}</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Ruang & TA:</span>
                <span className="font-medium text-foreground">
                  {currentClass.classroom} • TA {currentClass.academic_year}
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Wali Kelas:</span>
                <span className="font-medium text-foreground flex items-center gap-1.5">
                  <UserCheck className="h-3.5 w-3.5 text-primary" />
                  {currentClass.homeroom_teacher}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed bg-muted/20">
          <CardContent className="py-6 text-center text-sm text-muted-foreground">
            Santri ini belum memiliki penempatan rombel aktif pada tahun ajaran ini.
          </CardContent>
        </Card>
      )}

      {/* Riwayat Nilai & Rapor Singkat */}
      {reports.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <Award className="h-4 w-4 text-primary" />
            <span>Rekap Rapor Digital Terakhir</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {reports.map((report) => (
              <Card key={report.id} className="p-3 bg-card">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="outline" className="text-xs">
                    {report.quarter}
                  </Badge>
                  <span className="text-xs text-muted-foreground">TA {report.academic_year}</span>
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-xs text-muted-foreground block">Nilai Rata-rata</span>
                    <span className="text-lg font-bold text-primary">{report.average_score ?? '-'}</span>
                  </div>
                  {report.rank && (
                    <Badge variant="secondary" className="text-xs">
                      Peringkat #{report.rank}
                    </Badge>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Timeline Riwayat Pendidikan & Kelas */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-primary" />
          <span>Riwayat Penempatan Kelas & Jenjang</span>
        </h4>

        {history.length === 0 ? (
          <div className="text-sm text-muted-foreground py-4 text-center italic">
            Belum ada catatan riwayat kelas yang terekam di sistem Tarbiyah.
          </div>
        ) : (
          <div className="relative pl-6 space-y-4">
            <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-border" />
            {history.map((item) => (
              <div key={item.id} className="relative">
                <div className="absolute -left-6 top-1.5 h-3 w-3 rounded-full border-2 border-background bg-primary" />
                <div className="rounded-lg border p-4 bg-card space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="font-semibold text-sm flex items-center gap-2">
                      <span>{item.institution}</span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-primary">{item.class_group}</span>
                    </div>
                    {getStatusBadge(item.status)}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-muted-foreground pt-1 border-t">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>TA: {item.academic_year}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Home className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>Ruang: {item.classroom}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <UserCheck className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>Wali: {item.homeroom_teacher}</span>
                    </div>
                  </div>

                  {item.note && (
                    <p className="text-xs text-muted-foreground/80 italic pt-1">
                      Catatan: {item.note}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Portal Link ke Tarbiyah */}
      <div className="pt-2 flex justify-end">
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-xs"
          onClick={handleOpenTarbiyah}
        >
          <span>Buka Portal E-Rapor & Akademik (Tarbiyah)</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
};

export default SantriEducationTab;
