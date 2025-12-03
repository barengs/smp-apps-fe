"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetStudentViolationReportQuery } from "@/store/slices/studentViolationApi";
import { CalendarDays, MapPin, AlertTriangle, Flag, Gavel } from "lucide-react";

type TimelineItem = {
  id: number;
  name: string;
  categoryName?: string;
  point?: number | string;
  status?: string;
  location?: string | null;
  violation_date?: string;
  violation_time?: string;
  sanctions?: Array<any>;
};

const formatDate = (iso?: string) => {
  if (!iso) return "-";
  const d = new Date(iso);
  return isNaN(d.getTime())
    ? "-"
    : d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
};

const formatDateTime = (iso?: string, time?: string) => {
  const datePart = formatDate(iso);
  return time ? `${datePart} ${time}` : datePart;
};

const severityVariant = (name?: string): BadgeProps["variant"] => {
  const n = (name || "").toLowerCase();
  if (n.includes("berat")) return "destructive";
  if (n.includes("sedang")) return "warning";
  if (n.includes("ringan")) return "secondary";
  return "outline";
};

const statusVariant = (status?: string): BadgeProps["variant"] => {
  const s = (status || "").toLowerCase();
  if (s === "active" || s === "verified") return "success";
  if (s === "processed" || s === "completed") return "secondary";
  if (s === "cancelled") return "destructive";
  return "outline";
};

import type { BadgeProps } from "@/components/ui/badge";

interface Props {
  studentId: number;
}

const SantriViolationTimeline: React.FC<Props> = ({ studentId }) => {
  const { data, isLoading, isError } = useGetStudentViolationReportQuery(studentId);

  const violations: TimelineItem[] = React.useMemo(() => {
    const raw = Array.isArray((data as any)?.violations) ? ((data as any).violations as any[]) : [];
    return raw
      .map((v: any): TimelineItem => ({
        id: typeof v?.id === "string" ? Number(v.id) : v?.id ?? 0,
        name: v?.violation?.name ?? "-",
        categoryName: v?.violation?.category?.name,
        point:
          typeof v?.violation?.point === "string" ? Number(v.violation.point) : v?.violation?.point,
        status: v?.status,
        location: v?.location ?? null,
        violation_date: v?.violation_date,
        violation_time: v?.violation_time,
        sanctions: Array.isArray(v?.sanctions) ? v.sanctions : [],
      }))
      .sort((a, b) => {
        const da = a.violation_date ? new Date(a.violation_date).getTime() : 0;
        const db = b.violation_date ? new Date(b.violation_date).getTime() : 0;
        return db - da;
      });
  }, [data]);

  const summary = (data as any)?.summary;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-6 w-28" />
        </div>
        <div className="relative pl-6">
          <div className="absolute left-2 top-0 bottom-0 w-px bg-muted" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="relative mb-4">
              <div className="absolute left-0 top-2 h-2 w-2 rounded-full bg-muted" />
              <div className="rounded-md border p-3">
                <Skeleton className="h-5 w-2/3 mb-2" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-md border p-3 text-sm text-destructive">
        Gagal memuat riwayat pelanggaran.
      </div>
    );
  }

  if (!violations.length) {
    return <div className="text-sm text-muted-foreground">Tidak ada riwayat pelanggaran.</div>;
  }

  return (
    <div className="space-y-4">
      {/* Ringkasan */}
      {summary ? (
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="gap-1">
            <Flag className="h-3 w-3" />
            Total Pelanggaran: {summary.total_violations ?? "-"}
          </Badge>
          <Badge variant="warning" className="gap-1">
            <AlertTriangle className="h-3 w-3" />
            Total Poin: {summary.total_points ?? "-"}
          </Badge>
          <Badge variant="success" className="gap-1">
            Verified/Processed: {(summary.processed ?? 0) as any}
          </Badge>
        </div>
      ) : null}

      {/* Timeline */}
      <div className="relative pl-6">
        <div className="absolute left-2 top-0 bottom-0 w-px bg-muted" />
        {violations.map((item) => {
          const sanctionNames =
            item.sanctions && item.sanctions.length
              ? item.sanctions
                  .map((s: any) => s?.sanction?.name)
                  .filter(Boolean)
                  .join(", ")
              : null;

          return (
            <div key={item.id} className="relative mb-4">
              <div className="absolute left-0 top-2 h-2 w-2 rounded-full bg-primary" />
              <div className="rounded-md border p-3">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="font-semibold">{item.name}</div>
                  <div className="flex flex-wrap items-center gap-2">
                    {item.categoryName ? (
                      <Badge variant={severityVariant(item.categoryName)} className="capitalize">
                        {item.categoryName}
                      </Badge>
                    ) : null}
                    {item.status ? (
                      <Badge variant={statusVariant(item.status)} className="capitalize">
                        {item.status}
                      </Badge>
                    ) : null}
                    {item.point != null ? (
                      <Badge variant="outline">Poin: {item.point}</Badge>
                    ) : null}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    <span>{formatDateTime(item.violation_date, item.violation_time)}</span>
                  </div>
                  {item.location ? (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{item.location}</span>
                    </div>
                  ) : null}
                  {sanctionNames ? (
                    <div className="flex items-center gap-2 sm:col-span-2">
                      <Gavel className="h-4 w-4" />
                      <span className="text-foreground">
                        Sanksi: <span className="font-medium">{sanctionNames}</span>
                      </span>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SantriViolationTimeline;