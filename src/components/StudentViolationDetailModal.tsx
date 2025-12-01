"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StudentViolation } from "@/store/slices/studentViolationApi";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: StudentViolation | null;
  studentLabel?: string;
  violationLabel?: string;
}

const formatDate = (iso?: string) => {
  if (!iso) return "-";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : d.toLocaleString("id-ID");
};

const StudentViolationDetailModal: React.FC<Props> = ({
  open,
  onOpenChange,
  report,
  studentLabel,
  violationLabel,
}) => {
  const rows = [
    { label: "Santri", value: studentLabel ?? "-" },
    { label: "Pelanggaran", value: violationLabel ?? "-" },
    { label: "Tanggal", value: formatDate(report?.violation_date) },
    { label: "Waktu", value: report?.violation_time ?? "-" },
    { label: "Lokasi", value: report?.location ?? "-" },
    { label: "Dilaporkan oleh", value: report?.reported_by ?? "-" },
    { label: "Tahun Ajaran", value: report?.academic_year_id ?? "-" },
    { label: "Dibuat", value: formatDate(report?.created_at) },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[1200px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detail Laporan Pelanggaran</DialogTitle>
          <DialogDescription>
            Informasi lengkap mengenai laporan yang dipilih.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
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

          <div className="grid grid-cols-1 gap-4">
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
        </div>

        <DialogFooter className="sm:justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StudentViolationDetailModal;