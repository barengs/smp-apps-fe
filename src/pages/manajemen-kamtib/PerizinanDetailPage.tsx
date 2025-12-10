"use client";

import React from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import CustomBreadcrumb from "@/components/CustomBreadcrumb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { useParams, Link } from "react-router-dom";
import { useGetStudentLeaveByIdQuery, type StudentLeave } from "@/store/slices/studentLeaveApi";

const formatDate = (iso?: string) => {
  if (!iso) return "-";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : d.toLocaleString("id-ID");
};

const toYesNo = (v?: boolean) => (v ? "Ya" : "Tidak");

const statusVariant = (status?: string): "success" | "warning" | "destructive" | "secondary" | "outline" | "default" => {
  const s = String(status || "").toLowerCase();
  if (s === "approved" || s === "returned" || s === "completed") return "success";
  if (s === "pending" || s === "requested" || s === "in_progress") return "warning";
  if (s === "rejected" || s === "cancelled" || s === "overdue") return "destructive";
  return "secondary";
};

const PerizinanDetailPage: React.FC = () => {
  const { id } = useParams();
  const leaveId = Number(id);
  const { data: leave } = useGetStudentLeaveByIdQuery(leaveId, { skip: isNaN(leaveId) });

  const rows: Array<{ label: string; value: React.ReactNode }> = [
    { label: "Nama Santri", value: leave?.student?.name ?? "-" },
    { label: "NIS", value: leave?.student?.nis ?? "-" },
    { label: "Tahun Ajaran", value: leave?.academic_year?.name ?? "-" },
    { label: "Jenis Izin", value: leave?.leave_type?.name ?? "-" },
    { label: "Tanggal Mulai", value: formatDate(leave?.start_date) },
    { label: "Tanggal Selesai", value: formatDate(leave?.end_date) },
    { label: "Durasi (hari)", value: leave?.duration_days ?? "-" },
    { label: "Perkiraan Kembali", value: formatDate(leave?.expected_return_date) },
    { label: "Tanggal Kembali", value: formatDate(leave?.actual_return_date) },
    { label: "Tujuan", value: leave?.destination ?? "-" },
    { label: "Alasan", value: leave?.reason ?? "-" },
    { label: "Kontak", value: [leave?.contact_person, leave?.contact_phone].filter(Boolean).join(" · ") || "-" },
    {
      label: "Status",
      value: (
        <Badge variant={statusVariant(leave?.status)} className="capitalize">
          {String(leave?.status || "-").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
        </Badge>
      ),
    },
    { label: "Disetujui Oleh", value: leave?.approved_by?.name ?? "-" },
    { label: "Tanggal Persetujuan", value: formatDate(leave?.approved_at) },
    { label: "Catatan Persetujuan", value: leave?.approval_notes ?? "-" },
    { label: "Ada Sanksi?", value: toYesNo(leave?.has_penalty) },
    { label: "Terlambat?", value: toYesNo(leave?.is_overdue) },
    { label: "Hari Terlambat", value: leave?.days_late ?? "-" },
    { label: "Catatan", value: leave?.notes ?? "-" },
    { label: "Dibuat", value: formatDate(leave?.created_at) },
    { label: "Diperbarui", value: formatDate(leave?.updated_at) },
  ];

  return (
    <DashboardLayout title="Detail Perizinan" role="administrasi">
      <div className="container mx-auto pt-2 pb-4 px-4">
        <CustomBreadcrumb
          items={[
            { label: "Perizinan", href: "/dashboard/manajemen-kamtib/perizinan" },
            { label: "Detail Perizinan" },
          ]}
        />

        <Card>
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle>Detail Perizinan</CardTitle>
              <CardDescription>Informasi lengkap data perizinan santri.</CardDescription>
            </div>
            <ButtonRow />
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <table className="w-full text-sm">
                <tbody>
                  {rows.map((row, idx) => (
                    <tr key={idx} className="border-b last:border-0">
                      <td className="w-1/3 p-3 text-muted-foreground align-top">{row.label}</td>
                      <td className="p-3 font-medium align-top">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Report dari pengembalian izin */}
            <div className="rounded-md border p-3 mt-4">
              <div className="text-sm text-muted-foreground mb-2">Laporan Pengembalian</div>
              {leave?.report ? (
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tanggal Laporan</span>
                    <span className="font-medium">{formatDate(leave.report.report_date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Waktu Laporan</span>
                    <span className="font-medium">{leave.report.report_time ?? "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Catatan Laporan</span>
                    <span className="font-medium">{leave.report.report_notes ?? "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Kondisi</span>
                    <span className="font-medium">{leave.report.condition ?? "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Terlambat</span>
                    <span className="font-medium">{toYesNo(leave.report.is_late)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Hari Terlambat</span>
                    <span className="font-medium">{leave.report.late_days ?? "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Dilaporkan ke</span>
                    <span className="font-medium">{leave.report.reported_to?.name ?? "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Verifikasi</span>
                    <span className="font-medium">{formatDate(leave.report.verified_at)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Diverifikasi oleh</span>
                    <span className="font-medium">{leave.report.verified_by?.name ?? "-"}</span>
                  </div>

                  {/* Penalti dari laporan */}
                  <div className="mt-3">
                    <div className="text-sm text-muted-foreground mb-1">Penalti dari Laporan</div>
                    {Array.isArray(leave.report.penalties) && leave.report.penalties.length ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Jenis Penalti</TableHead>
                            <TableHead>Deskripsi</TableHead>
                            <TableHead>Poin</TableHead>
                            <TableHead>Sanksi</TableHead>
                            <TableHead>Ditugaskan Oleh</TableHead>
                            <TableHead>Tanggal</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {leave.report.penalties.map((p, idx) => (
                            <TableRow key={idx}>
                              <TableCell>{p.penalty_type ?? "-"}</TableCell>
                              <TableCell>{p.description ?? "-"}</TableCell>
                              <TableCell>{p.point_value ?? "-"}</TableCell>
                              <TableCell>
                                {p.sanction ? `${p.sanction.name} (${p.sanction.type})` : "-"}
                              </TableCell>
                              <TableCell>{p.assigned_by?.name ?? "-"}</TableCell>
                              <TableCell>{formatDate(p.assigned_at)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-sm">Tidak ada penalti dari laporan.</div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-sm">Belum ada laporan pengembalian.</div>
              )}
            </div>

            {/* Penalti dari perizinan */}
            <div className="rounded-md border p-3 mt-4">
              <div className="text-sm text-muted-foreground mb-2">Penalti Perizinan</div>
              {Array.isArray(leave?.penalties) && leave!.penalties.length ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Jenis Penalti</TableHead>
                      <TableHead>Deskripsi</TableHead>
                      <TableHead>Poin</TableHead>
                      <TableHead>Sanksi</TableHead>
                      <TableHead>Ditugaskan Oleh</TableHead>
                      <TableHead>Tanggal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leave!.penalties.map((p, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{p.penalty_type ?? "-"}</TableCell>
                        <TableCell>{p.description ?? "-"}</TableCell>
                        <TableCell>{p.point_value ?? "-"}</TableCell>
                        <TableCell>{p.sanction ? `${p.sanction.name} (${p.sanction.type})` : "-"}</TableCell>
                        <TableCell>{p.assigned_by?.name ?? "-"}</TableCell>
                        <TableCell>{formatDate(p.assigned_at)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-sm">Tidak ada penalti pada perizinan ini.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

const ButtonRow: React.FC = () => {
  return (
    <div className="flex items-center gap-2">
      <Link to="/dashboard/manajemen-kamtib/perizinan" className="text-sm text-muted-foreground hover:underline">
        Kembali ke Perizinan
      </Link>
    </div>
  );
};

export default PerizinanDetailPage;