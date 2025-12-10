"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import * as toast from "@/utils/toast";
import { useApproveStudentLeaveMutation, useRejectStudentLeaveMutation, useCancelStudentLeaveMutation } from "@/store/slices/studentLeaveApi";

type StatusChoice = "approved" | "rejected" | "cancelled";

interface LeaveStatusUpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leaveId: number | null;
  currentStatus?: string;
  onUpdated?: () => void;
}

const LeaveStatusUpdateDialog: React.FC<LeaveStatusUpdateDialogProps> = ({
  open,
  onOpenChange,
  leaveId,
  currentStatus,
  onUpdated,
}) => {
  const [selected, setSelected] = React.useState<StatusChoice>("approved");
  const [approve, { isLoading: isApproving }] = useApproveStudentLeaveMutation();
  const [reject, { isLoading: isRejecting }] = useRejectStudentLeaveMutation();
  const [cancel, { isLoading: isCancelling }] = useCancelStudentLeaveMutation();

  React.useEffect(() => {
    const s = String(currentStatus || "").toLowerCase();
    if (s === "approved" || s === "rejected" || s === "cancelled") {
      setSelected(s as StatusChoice);
    } else {
      setSelected("approved");
    }
  }, [currentStatus, open]);

  const handleSubmit = async () => {
    if (!leaveId) {
      toast.showError("Data izin tidak tersedia.");
      return;
    }
    const loadingId = toast.showLoading("Memproses status...");
    try {
      switch (selected) {
        case "approved":
          await approve({ id: leaveId }).unwrap();
          toast.showSuccess("Izin disetujui.");
          break;
        case "rejected":
          await reject({ id: leaveId }).unwrap();
          toast.showSuccess("Izin ditolak.");
          break;
        case "cancelled":
          await cancel({ id: leaveId }).unwrap();
          toast.showSuccess("Izin dibatalkan.");
          break;
      }
      onOpenChange(false);
      onUpdated?.();
    } finally {
      toast.dismissToast(loadingId);
    }
  };

  const isLoading = isApproving || isRejecting || isCancelling;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ubah Status Perizinan</DialogTitle>
          <DialogDescription>Pilih status baru untuk perizinan ini.</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Label className="text-sm">Status Baru</Label>
          <RadioGroup
            value={selected}
            onValueChange={(v) => setSelected(v as StatusChoice)}
            className="grid grid-cols-1 sm:grid-cols-3 gap-3"
          >
            <div className="flex items-center space-x-2 rounded-md border p-3">
              <RadioGroupItem value="approved" id="leave-status-approved" />
              <Label htmlFor="leave-status-approved" className="cursor-pointer">Disetujui</Label>
            </div>
            <div className="flex items-center space-x-2 rounded-md border p-3">
              <RadioGroupItem value="rejected" id="leave-status-rejected" />
              <Label htmlFor="leave-status-rejected" className="cursor-pointer">Ditolak</Label>
            </div>
            <div className="flex items-center space-x-2 rounded-md border p-3">
              <RadioGroupItem value="cancelled" id="leave-status-cancelled" />
              <Label htmlFor="leave-status-cancelled" className="cursor-pointer">Dibatalkan</Label>
            </div>
          </RadioGroup>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
          <Button onClick={handleSubmit} disabled={isLoading} className="gap-2">
            <Save className="h-4 w-4" /> Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LeaveStatusUpdateDialog;