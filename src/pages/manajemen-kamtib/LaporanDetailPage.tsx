"use client";

import React from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useParams, Link } from "react-router-dom";
import { StudentViolation, useGetStudentViolationByIdQuery } from "@/store/slices/studentViolationApi";
import SanctionAssignDialog from "@/components/SanctionAssignDialog";
import CustomBreadcrumb from "@/components/CustomBreadcrumb";
import { List, Info } from "lucide-react";

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
    { label: "Status", value: report?.status ?? "-" },
  ];

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

        <div className="mb-4">
          <Link to="/dashboard/manajemen-kamtib/laporan" className="text-sm text-muted-foreground hover:underline">
            ← Kembali ke Laporan
          </Link>
        </div>

        <Card>
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Detail Laporan Pelanggaran</CardTitle>
              <CardDescription>Informasi lengkap mengenai laporan yang dipilih.</CardDescription>
            </div>
            <Button onClick={() => setAssignOpen(true)}>Beri Sanksi</Button>
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
    </DashboardLayout>
  );
};

export default LaporanDetailPage;