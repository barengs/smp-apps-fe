import React from 'react';
import { useGetStudentClassesQuery } from '@/store/slices/studentClassApi';
import { Skeleton } from '@/components/ui/skeleton';
import { GraduationCap, Calendar, Home } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Props {
  studentId: number;
}

const SantriEducationTab: React.FC<Props> = ({ studentId }) => {
  const { data, isLoading, isError } = useGetStudentClassesQuery({ student_id: studentId, per_page: 50 });

  const classes = data?.data || [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return <div className="text-sm text-destructive">Gagal memuat riwayat pendidikan (kelas).</div>;
  }

  if (classes.length === 0) {
    return <div className="text-sm text-muted-foreground">Tidak ada riwayat pendidikan.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="relative pl-6">
        <div className="absolute left-2 top-0 bottom-0 w-px bg-muted" />
        {classes.map((item) => (
          <div key={item.id} className="relative mb-4">
            <div className="absolute left-0 top-2 h-2 w-2 rounded-full bg-primary" />
            <div className="rounded-md border p-3">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="font-semibold flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  {item.educations?.institution_name || '-'}
                </div>
                {item.approval_status && (
                  <Badge variant={item.approval_status === 'approved' ? 'success' : 'outline'} className="capitalize">
                    {item.approval_status}
                  </Badge>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>TA: {item.academic_years?.year || '-'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  <span>Kelas: {item.classrooms?.name || '-'} {item.class_group?.name ? `(${item.class_group.name})` : ''}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SantriEducationTab;
