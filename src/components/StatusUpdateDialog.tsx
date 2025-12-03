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
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import ActionButton from "@/components/ActionButton";
import { Button } from "@/components/ui/button";
import { showSuccess, showError } from "@/utils/toast";
import { useUpdateStudentViolationStatusMutation, type StudentViolation, type UpdateStudentViolationRequest } from "@/store/slices/studentViolationApi";

interface StatusUpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  violationId: number;
  currentStatus?: string | null;
  currentReport?: StudentViolation | null;
}

const toIndonesian = (status: string) => {
  switch (status) {
    case "verified":
      return "Terverifikasi";
    case "cancelled":
      return "Dibatalkan";
    default:
      return status;
  }
};

// Helper: normalisasi waktu ke format HH:mm (sesuai H:i di Laravel)
const normalizeViolationTime = (timeRaw?: string): string => {
  const src = String(timeRaw || "").trim();

  // Jika sudah dalam bentuk HH:mm atau H:mm (dengan optional :ss), ambil hh:mm
  const m = src.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (m) {
    const hh = String(m[1]).padStart(2, "0");
    const mm = m[2];
    return `${hh}:${mm}`;
  }

  // Coba parse via Date (untuk ISO atau datetime string)
  const d = new Date(src);
  if (!isNaN(d.getTime())) {
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  }

  // Fallback aman: jika ada ":" tapi format tidak cocok, ambil dua segmen pertama
  if (src.includes(":")) {
    const [h, m2] = src.split(":");
    const hh = String(Number(h)).padStart(2, "0");
    const mm = String(Number(m2)).padStart(2, "0");
    return `${hh}:${mm}`;
  }

  // Default jika tidak bisa diparse
  return "00:00";
};

const StatusUpdateDialog: React.FC<StatusUpdateDialogProps> = ({
  open,
  onOpenChange,
  violationId,
  currentStatus,
  currentReport,
}) => {
  const [selected, setSelected] = React.useState<"verified" | "cancelled" | null>(null);
  const [updateStatus, { isLoading }] = useUpdateStudentViolationStatusMutation();

  React.useEffect(() => {
    const norm = (currentStatus || "").toLowerCase();
    if (norm === "verified" || norm === "cancelled") {
      setSelected(norm as "verified" | "cancelled");
    } else {
      setSelected("verified");
    }
  }, [currentStatus, open]);

  const handleSubmit = () => {
    if (!selected) return;
    if (!currentReport) {
      showError("Data laporan tidak tersedia. Muat ulang halaman lalu coba lagi.");
      return;
    }

    const payload: UpdateStudentViolationRequest = {
      student_id: currentReport.student_id,
      violation_id: currentReport.violation_id,
      academic_year_id: currentReport.academic_year_id,
      violation_date: currentReport.violation_date,
      violation_time: normalizeViolationTime(currentReport.violation_time),
      location: currentReport.location ?? undefined,
      description: currentReport.description ?? undefined,
      reported_by: currentReport.reported_by,
      notes: currentReport.notes ?? undefined,
      status: selected,
    };

    updateStatus({ id: violationId, data: payload })
      .unwrap()
      .then(() => {
        showSuccess(`Status berhasil diubah menjadi "${toIndonesian(selected)}"`);
        onOpenChange(false);
      })
      .catch(() => {
        showError("Gagal memperbarui status laporan.");
      });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ganti Status Laporan</DialogTitle>
          <DialogDescription>
            Pilih status baru untuk laporan ini. Status yang tersedia: Terverifikasi atau Dibatalkan.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Status baru</Label>
            <RadioGroup
              value={selected ?? undefined}
              onValueChange={(v) => setSelected(v as "verified" | "cancelled")}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3"
            >
              <div className="flex items-center space-x-2 rounded-md border p-3">
                <RadioGroupItem value="verified" id="status-verified" />
                <Label htmlFor="status-verified" className="cursor-pointer">
                  Terverifikasi
                </Label>
              </div>
              <div className="flex items-center space-x-2 rounded-md border p-3">
                <RadioGroupItem value="cancelled" id="status-cancelled" />
                <Label htmlFor="status-cancelled" className="cursor-pointer">
                  Dibatalkan
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <ActionButton
            onClick={handleSubmit}
            isLoading={isLoading}
            disabled={!selected}
          >
            Simpan
          </ActionButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StatusUpdateDialog;