import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart3, AlertTriangle, CheckCircle2, Cog, XCircle, Users, LucideIcon } from 'lucide-react';
import CategoryBarChart from '@/components/CategoryBarChart';
import TopViolatorsChart from '@/components/TopViolatorsChart';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

// Update tipe agar cocok dengan data backend (string/number/array)
type ViolationStats = {
  total_violations: string | number;
  by_status?: {
    pending?: string | number;
    verified?: string | number;
    processed?: string | number;
    cancelled?: string | number;
  };
  by_category?: string | Array<{ category?: string; name?: string; total?: string | number }>;
  top_violators?: string | Array<{ id?: string | number; first_name?: string; last_name?: string | null; nis?: string; total_violations?: string | number }>;
};

type Props = {
  stats?: ViolationStats;
  isLoading?: boolean;
};

// Helper: aman untuk parse JSON string
const safeParse = (value?: string) => {
  if (!value || typeof value !== 'string') return null;
  try {
    return JSON.parse(value);
  } catch {
    // Fallback jika backend kadang memakai single quotes
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
  if (Number.isNaN(num)) return String(n);
  return new Intl.NumberFormat('id-ID').format(num);
};

type CategoryItem = { category?: string; name?: string; total?: string | number };
type TopViolator = { id?: string | number; first_name?: string; last_name?: string | null; nis?: string; total_violations?: string | number };

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

const ViolationStatsCard: React.FC<Props> = ({ stats, isLoading }) => {
  // Olah data kategori: dukung array langsung atau string JSON
  const categories: CategoryItem[] = React.useMemo(() => {
    const src = stats?.by_category;
    if (Array.isArray(src)) return src as CategoryItem[];
    const parsed = typeof src === 'string' ? safeParse(src) : null;
    if (Array.isArray(parsed)) return parsed as CategoryItem[];
    if (parsed && typeof parsed === 'object') {
      return Object.entries(parsed as Record<string, string | number>).map(([key, val]) => ({
        category: key,
        total: val,
      }));
    }
    return [];
  }, [stats?.by_category]);

  // Olah data top violators: dukung array langsung atau string JSON
  const topViolators: TopViolator[] = React.useMemo(() => {
    const src = stats?.top_violators;
    if (Array.isArray(src)) return (src as TopViolator[]).slice(0, 10);
    const parsed = typeof src === 'string' ? safeParse(src) : null;
    if (Array.isArray(parsed)) return (parsed as TopViolator[]).slice(0, 10);
    return [];
  }, [stats?.top_violators]);

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
            <div className="text-3xl font-bold">{formatNumber(stats?.total_violations)}</div>

            <div className="grid grid-cols-2 gap-2">
              <StatItem label="Pending" value={stats?.by_status?.pending} icon={AlertTriangle} colorClass="text-yellow-600" />
              <StatItem label="Terverifikasi" value={stats?.by_status?.verified} icon={CheckCircle2} colorClass="text-green-600" />
              <StatItem label="Diproses" value={stats?.by_status?.processed} icon={Cog} colorClass="text-blue-600" />
              <StatItem label="Dibatalkan" value={stats?.by_status?.cancelled} icon={XCircle} colorClass="text-red-600" />
            </div>

            {/* Per kategori (Chart) */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                <div className="text-sm text-muted-foreground">Per kategori</div>
              </div>
              {categories.length > 0 ? (
                <CategoryBarChart data={categories} title="Jumlah" />
              ) : (
                <div className="text-sm text-muted-foreground">Tidak ada data.</div>
              )}
            </div>

            {/* Pelanggar terbanyak (Chart) */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <div className="text-sm text-muted-foreground">Pelanggar terbanyak</div>
              </div>
              {topViolators.length > 0 ? (
                <TopViolatorsChart data={topViolators} title="Pelanggaran" />
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

export default ViolationStatsCard;