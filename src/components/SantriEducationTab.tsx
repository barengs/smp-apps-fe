import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GraduationCap, ExternalLink } from 'lucide-react';

interface Props {
  studentId: number;
}

const SantriEducationTab: React.FC<Props> = () => {
  const tarbiyahWebUrl = import.meta.env.VITE_TARBIYAH_WEB_URL || 'http://localhost:8002';

  const handleOpenTarbiyah = () => {
    window.open(tarbiyahWebUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card className="border-dashed bg-muted/30">
      <CardContent className="pt-6 pb-6 text-center space-y-3">
        <div className="mx-auto w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <GraduationCap className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-semibold">Manajemen Pendidikan & Akademik</h4>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Data rombel, kelas KBM, jadwal pelajaran, presensi harian, dan raport santri dikelola secara terpusat melalui Sistem Tarbiyah.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-xs"
          onClick={handleOpenTarbiyah}
        >
          <span>Buka Portal Tarbiyah</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default SantriEducationTab;
