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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Detail Laporan Pelanggaran</DialogTitle>
          <DialogDescription>
            Informasi lengkap mengenai laporan yang dipilih.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-muted-foreground">Santri</div>
            <div className="font-medium">{studentLabel ?? "-"}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Pelanggaran</div>
            <div className="font-medium">{violationLabel ?? "-"}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Tanggal</div>
            <div className="font-medium">{formatDate(report?.violation_date)}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Waktu</div>
            <div className="font-medium">{report?.violation_time ?? "-"}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Lokasi</div>
            <div className="font-medium">{report?.location ?? "-"}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Dilaporkan oleh</div>
            <div className="font-medium">{report?.reported_by ?? "-"}</div>
          </div>
          <div className="sm:col-span-2">
            <div className="text-muted-foreground">Deskripsi</div>
            <div className="font-medium whitespace-pre-wrap">
              {report?.description ?? "-"}
            </div>
          </div>
          <div className="sm:col-span-2">
            <div className="text-muted-foreground">Catatan</div>
            <div className="font-medium whitespace-pre-wrap">
              {report?.notes ?? "-"}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">Tahun Ajaran</div>
            <div className="font-medium">{report?.academic_year_id ?? "-"}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Dibuat</div>
            <div className="font-medium">{formatDate(report?.created_at)}</div>
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