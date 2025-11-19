import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart3, AlertTriangle, CheckCircle2, Cog, XCircle, LucideIcon } from 'lucide-react';

type ViolationStats = {
  total_violations: string;
  by_status?: {
    pending?: string;
    verified?: string;
    processed?: string;
    cancelled?: string;
  };
  by_category?: string;
  top_violators?: string;
};

type Props = {
  stats?: ViolationStats;
  isLoading?: boolean;
};

const StatItem = ({
  label,
  value,
  icon: Icon,
  colorClass,
}: {
  label: string;
  value?: string;
  icon: LucideIcon;
  colorClass: string;
}) => (
  <div className="flex items-center justify-between rounded-md border p-3">
    <div className="flex items-center gap-2">
      <Icon className={`h-4 w-4 ${colorClass}`} />
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
    <span className="font-semibold">{value ?? '-'}</span>
  </div>
);

const ViolationStatsCard: React.FC<Props> = ({ stats, isLoading }) => {
  return (
    <Card>
      <CardHeader className="space-y-1.5">
        <CardTitle>Statistik Pelanggaran</CardTitle>
        <CardDescription>Ringkasan status pelanggaran terkini</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-24" />
            <div className="grid grid-cols-2 gap-2">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">Total Pelanggaran</span>
            </div>
            <div className="text-3xl font-bold">{stats?.total_violations ?? '-'}</div>

            <div className="grid grid-cols-2 gap-2">
              <StatItem label="Pending" value={stats?.by_status?.pending} icon={AlertTriangle} colorClass="text-yellow-600" />
              <StatItem label="Terverifikasi" value={stats?.by_status?.verified} icon={CheckCircle2} colorClass="text-green-600" />
              <StatItem label="Diproses" value={stats?.by_status?.processed} icon={Cog} colorClass="text-blue-600" />
              <StatItem label="Dibatalkan" value={stats?.by_status?.cancelled} icon={XCircle} colorClass="text-red-600" />
            </div>

            {typeof stats?.by_category !== 'undefined' && (
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Per kategori</div>
                <div className="text-sm break-words">
                  {typeof stats?.by_category === 'string' ? stats?.by_category : JSON.stringify(stats?.by_category)}
                </div>
              </div>
            )}

            {typeof stats?.top_violators !== 'undefined' && (
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Pelanggar terbanyak</div>
                <div className="text-sm break-words">
                  {typeof stats?.top_violators === 'string' ? stats?.top_violators : JSON.stringify(stats?.top_violators)}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ViolationStatsCard;