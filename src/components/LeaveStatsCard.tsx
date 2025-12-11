"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart3, Clock, Shield, CheckCircle2, XCircle, AlertTriangle, LucideIcon } from 'lucide-react';
import CategoryPieChart from '@/components/CategoryPieChart';
import type { StudentLeaveStatistics } from '@/store/slices/studentLeaveApi';

type Props = {
  stats?: StudentLeaveStatistics;
  isLoading?: boolean;
};

const safeParse = (value?: string) => {
  if (!value || typeof value !== 'string') return null;
  try {
    return JSON.parse(value);
  } catch {
    try {
      const normalized = value.replace(/'/g, '"');
      return JSON.parse(normalized);
    } catch {
      return null;
    }
  }
};

const formatNumber = (n?: string | number) => {
  if (n === undefined || n === null) return '-';
  const num = typeof n === 'string' ? Number(n) : n;
  if (!Number.isFinite(num)) return String(n);
  return new Intl.NumberFormat('id-ID').format(num);
};

const StatItem = ({
  label,
  value,
  icon: Icon,
  colorClass,
}: {
  label: string;
  value?: string | number;
  icon: LucideIcon;
  colorClass: string;
}) => (
  <div className="flex items-center justify-between rounded-md border p-3">
    <div className="flex items-center gap-2">
      <Icon className={`h-4 w-4 ${colorClass}`} />
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
    <span className="font-semibold">{formatNumber(value)}</span>
  </div>
);

const LeaveStatsCard: React.FC<Props> = ({ stats, isLoading }) => {
  const typeBreakdown = React.useMemo(() => {
    const src = stats?.leave_type_breakdown;
    if (Array.isArray(src)) return src;
    const parsed = typeof src === 'string' ? safeParse(src) : null;
    if (Array.isArray(parsed)) return parsed as Array<{ name?: string; total?: string | number }>;
    return [];
  }, [stats?.leave_type_breakdown]);

  const status = stats?.status_breakdown ?? {};

  return (
    <Card>
      <CardHeader className="space-y-1.5">
        <CardTitle>Statistik Perizinan</CardTitle>
        <CardDescription>Ringkasan perizinan terbaru</CardDescription>
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
            <Skeleton className="h-64 w-full" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">Total Perizinan</span>
            </div>
            <div className="text-3xl font-bold">{formatNumber(stats?.total_leaves)}</div>

            <div className="grid grid-cols-2 gap-2">
              <StatItem label="Pending" value={status.pending} icon={AlertTriangle} colorClass="text-yellow-600" />
              <StatItem label="Disetujui" value={status.approved} icon={CheckCircle2} colorClass="text-green-600" />
              <StatItem label="Ditolak" value={status.rejected} icon={XCircle} colorClass="text-red-600" />
              <StatItem label="Selesai" value={status.completed} icon={CheckCircle2} colorClass="text-blue-600" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <StatItem label="Terlambat Kembali" value={stats?.overdue_count} icon={Clock} colorClass="text-orange-600" />
              <StatItem label="Dengan Penalti" value={stats?.with_penalty_count} icon={Shield} colorClass="text-purple-600" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                <div className="text-sm text-muted-foreground">Per jenis izin</div>
              </div>
              {typeBreakdown.length > 0 ? (
                <CategoryPieChart data={typeBreakdown} title="Jumlah" />
              ) : (
                <div className="text-sm text-muted-foreground">Tidak ada data.</div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LeaveStatsCard;