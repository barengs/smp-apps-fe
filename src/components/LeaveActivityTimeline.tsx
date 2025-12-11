"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetStudentLeaveActivityHistoryQuery } from "@/store/slices/studentLeaveApi";
import { Clock, User, Activity } from "lucide-react";

interface Props {
  leaveId: number;
}

const toLabel = (status?: string) =>
  String(status || "-")
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

const statusVariant = (status?: string): "success" | "warning" | "destructive" | "secondary" | "outline" | "default" => {
  const s = String(status || "").toLowerCase();
  if (s === "approved" || s === "returned" || s === "completed") return "success";
  if (s === "pending" || s === "requested" || s === "in_progress") return "warning";
  if (s === "rejected" || s === "cancelled" || s === "overdue") return "destructive";
  return "secondary";
};

const LeaveActivityTimeline: React.FC<Props> = ({ leaveId }) => {
  const { data, isLoading, isError } = useGetStudentLeaveActivityHistoryQuery(leaveId, { skip: isNaN(leaveId) });

  return (
    <Card>
      <CardHeader className="p-6">
        <CardTitle>Riwayat Perizinan</CardTitle>
        <CardDescription>Aktivitas dokumen izin secara kronologis.</CardDescription>
        {data?.status ? (
          <div className="mt-2">
            <Badge variant={statusVariant(data.status)} className="capitalize">
              {toLabel(data.status)}
            </Badge>
          </div>
        ) : null}
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : isError ? (
          <div className="text-sm text-destructive">Gagal memuat riwayat perizinan.</div>
        ) : !data?.activities?.length ? (
          <div className="text-sm text-muted-foreground">Belum ada aktivitas.</div>
        ) : (
          <div className="relative pl-6">
            <div className="absolute left-2 top-0 bottom-0 w-px bg-muted" />
            {data.activities.map((act) => (
              <div key={act.id} className="relative mb-3">
                <div className="absolute left-0 top-2 h-2 w-2 rounded-full bg-primary" />
                <div className="rounded-md border p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-primary" />
                      <span className="font-medium">{act.description || toLabel(act.activity_type)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{act.timestamp}</span>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground flex flex-wrap items-center gap-3">
                    {act.actor?.name ? (
                      <span className="flex items-center gap-1">
                        <User className="h-3.5 w-3.5" />
                        <span className="text-foreground">{act.actor.name}</span>
                        {act.role_display ? <span className="text-muted-foreground">• {act.role_display}</span> : null}
                      </span>
                    ) : null}
                    {act.ip_address ? <span>IP: {act.ip_address}</span> : null}
                  </div>
                  {act.metadata ? (
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {Object.entries(act.metadata).map(([key, val]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-muted-foreground">{toLabel(key)}</span>
                          <span className="font-medium">{String(val)}</span>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LeaveActivityTimeline;