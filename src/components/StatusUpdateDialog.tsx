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
import { useUpdateStudentViolationStatusMutation } from "@/store/slices/studentViolationApi";

interface StatusUpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  violationId: number;
  currentStatus?: string | null;
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

const StatusUpdateDialog: React.FC<StatusUpdateDialogProps> = ({
  open,
  onOpenChange,
  violationId,
  currentStatus,
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
    updateStatus({ id: violationId, status: selected })
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