"use client";

import React from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useParams, Link } from "react-router-dom";
import { StudentViolation, useGetStudentViolationByIdQuery } from "@/store/slices/studentViolationApi";
import SanctionAssignDialog from "@/components/SanctionAssignDialog";
import CustomBreadcrumb from "@/components/CustomBreadcrumb";
import { List, Info, Gavel, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/table";
import StatusUpdateDialog from "@/components/StatusUpdateDialog";

const formatDate = (iso?: string) => {
  if (!iso) return "-";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : d.toLocaleString("id-ID");
};

const LaporanDetailPage: React.FC = () => {
  const { id } = useParams();
  const violationId = Number(id);
  const { data: report } = useGetStudentViolationByIdQuery(violationId, { skip: isNaN(violationId) });

  const [assignOpen, setAssignOpen] = React.useState(false);
  const [statusOpen, setStatusOpen] = React.useState(false);

  const studentLabel =
    report?.student
      ? `${report.student.nis} — ${report.student.first_name}${report.student.last_name ? " " + report.student.last_name : ""}`
      : report?.student_id != null
      ? String(report.student_id)
      : "-";

  const violationLabel =
    report?.violation
      ? `${report.violation.name} (${typeof report.violation.point === "string" ? Number(report.violation.point) : report.violation.point} poin)`
      : report?.violation_id != null
      ? String(report.violation_id)
      : "-";

  // ADDED: Helper statusVariant dan toIndonesianStatus dipindah ke atas agar tidak digunakan sebelum deklarasi
  const statusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" | "success" | "warning" => {
    const s = String(status).toLowerCase();
    if (s === "active") return "success";
    if (s === "cancelled") return "destructive";
    if (s === "processed" || s === "completed") return "secondary";
    if (s === "verified") return "success";
    return "outline";
  };

  const toIndonesianStatus = (status?: string) => {
    const s = String(status || "").toLowerCase();
    switch (s) {
      case "pending":
        return "Menunggu";
      case "verified":
        return "Terverifikasi";
      case "processed":
        return "Diproses";
      case "cancelled":
        return "Dibatalkan";
      default:
        return "-";
    }
  };

  const rows = [
    { label: "Santri", value: studentLabel },
    { label: "Pelanggaran", value: violationLabel },
    { label: "Tanggal", value: formatDate(report?.violation_date) },
    { label: "Waktu", value: report?.violation_time ?? "-" },
    { label: "Lokasi", value: report?.location ?? "-" },
    { label: "Dilaporkan oleh", value: report?.reported_by ?? "-" },
    { label: "Tahun Ajaran", value: report?.academic_year?.year ?? report?.academic_year_id ?? "-" },
    { label: "Dibuat", value: formatDate(report?.created_at) },
    { label: "Diperbarui", value: formatDate(report?.updated_at) },
    {
      label: "Status",
      value: (
        <div className="flex items-center gap-2">
          <Badge variant={statusVariant(report?.status ?? "")} className="capitalize">
            {toIndonesianStatus(report?.status)}
          </Badge>
          <Button
            size="icon"
            variant="outline"
            onClick={() => setStatusOpen(true)}
            aria-label="Ganti Status"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="sr-only">Ganti Status</span>
          </Button>
        </div>
      ),
    },
  ];

  // Mapping data sanksi dari respons backend (aman meskipun tipe sanctions adalah unknown[])
  const sanctionsData = React.useMemo(() => {
    const raw = Array.isArray(report?.sanctions) ? (report!.sanctions as any[]) : [];
    return raw.map((s) => {
      const duration =
        typeof s?.sanction?.duration_days === "string"
          ? Number(s.sanction.duration_days)
          : s?.sanction?.duration_days;
      return {
        id: typeof s?.id === "string" ? Number(s.id) : s?.id ?? 0,
        name: s?.sanction?.name ?? "-",
        type: s?.sanction?.type ?? "-",
        duration_days: duration ?? null,
        start_date: s?.start_date as string | undefined,
        end_date: s?.end_date as string | undefined,
        status: s?.status ?? "-",
        notes: s?.notes ?? "-",
        assigned_by_name: s?.assigned_by
          ? `${s.assigned_by.first_name}${s.assigned_by.last_name ? " " + s.assigned_by.last_name : ""}`
          : "-",
      };
    });
  }, [report?.sanctions]);

  // Variant badge berdasarkan tipe sanksi
  const typeVariant = (type: string): "default" | "secondary" | "destructive" | "outline" | "success" | "warning" => {
    switch (String(type).toLowerCase()) {
      case "peringatan":
        return "warning";
      case "skorsing":
        return "destructive";
      case "pembinaan":
        return "success";
      case "denda":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <DashboardLayout title="Detail Laporan Pelanggaran" role="administrasi">
      <div className="container mx-auto pt-2 pb-4 px-4">
        {/* Breadcrumb */}
        <CustomBreadcrumb
          items={[
            {
              label: "Laporan Pelanggaran",
              href: "/dashboard/manajemen-kamtib/laporan",
              icon: <List className="h-4 w-4" />,
            },
            {
              label: "Detail Laporan",
              icon: <Info className="h-4 w-4" />,
            },
          ]}
        />

        <Card>
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Detail Laporan Pelanggaran</CardTitle>
              <CardDescription>Informasi lengkap mengenai laporan yang dipilih.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" asChild>
                <Link to="/dashboard/manajemen-kamtib/laporan">Kembali ke Laporan</Link>
              </Button>
              <Button onClick={() => setAssignOpen(true)}>
                <Gavel className="mr-2 h-4 w-4" />
                Beri Sanksi
              </Button>
            </div>
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

            <div className="grid grid-cols-1 gap-4 mt-4">
              <div className="rounded-md border p-3">
                <div className="text-sm text-muted-foreground mb-1">Deskripsi</div>
                <div className="font-medium whitespace-pre-wrap">
                  {report?.description ?? "-"}
                </div>
              </div>

              <div className="rounded-md border p-3">
                <div className="text-sm text-muted-foreground mb-1">Catatan</div>
                <div className="font-medium whitespace-pre-wrap">
                  {report?.notes ?? "-"}
                </div>
              </div>
            </div>

            {/* NEW: Bagian Sanksi */}
            <div className="rounded-md border p-3 mt-4">
              <div className="text-sm text-muted-foreground mb-2">Sanksi</div>
              {sanctionsData.length === 0 ? (
                <div className="text-sm">Belum ada sanksi untuk laporan ini.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama Sanksi</TableHead>
                      <TableHead>Jenis</TableHead>
                      <TableHead>Durasi</TableHead>
                      <TableHead>Periode</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Catatan</TableHead>
                      <TableHead>Ditetapkan Oleh</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sanctionsData.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium">{s.name}</TableCell>
                        <TableCell>
                          <Badge variant={typeVariant(s.type)} className="capitalize">
                            {s.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {s.duration_days != null ? `${s.duration_days} hari` : "-"}
                        </TableCell>
                        <TableCell>
                          {`${formatDate(s.start_date)} — ${formatDate(s.end_date)}`}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusVariant(s.status)} className="capitalize">
                            {s.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{s.notes}</TableCell>
                        <TableCell>{s.assigned_by_name}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal Beri Sanksi */}
      {!isNaN(violationId) && (
        <SanctionAssignDialog
          open={assignOpen}
          onOpenChange={setAssignOpen}
          violationId={violationId}
        />
      )}

      {/* Modal Ganti Status */}
      {!isNaN(violationId) && (
        <StatusUpdateDialog
          open={statusOpen}
          onOpenChange={setStatusOpen}
          violationId={violationId}
          currentStatus={report?.status}
          currentReport={report ?? null}
        />
      )}
    </DashboardLayout>
  );
};

export default LaporanDetailPage;