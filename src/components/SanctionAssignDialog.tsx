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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/datepicker";
import { useGetSanctionsQuery } from "@/store/slices/sanctionApi";
import { useAssignSanctionToViolationMutation } from "@/store/slices/studentViolationApi";
import * as toast from "@/utils/toast";
import { Save, X } from "lucide-react";

interface SanctionAssignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  violationId: number;
}

const SanctionAssignDialog: React.FC<SanctionAssignDialogProps> = ({
  open,
  onOpenChange,
  violationId,
}) => {
  const { data: sanctions = [] } = useGetSanctionsQuery();
  const [assignSanction, { isLoading }] = useAssignSanctionToViolationMutation();

  const [sanctionId, setSanctionId] = React.useState<number | null>(null);
  const [startDate, setStartDate] = React.useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = React.useState<Date | undefined>(undefined);
  const [notes, setNotes] = React.useState<string>("");

  const handleSubmit = async () => {
    if (!sanctionId) {
      toast.showError("Pilih sanksi terlebih dahulu.");
      return;
    }
    if (!startDate || !endDate) {
      toast.showError("Lengkapi tanggal mulai dan tanggal selesai.");
      return;
    }
    // NEW: Validasi urutan tanggal
    if (endDate <= startDate) {
      toast.showError("Tanggal selesai harus setelah tanggal mulai.");
      return;
    }
    const loadingId = toast.showLoading("Mengirim penetapan sanksi...");
    try {
      await assignSanction({
        id: violationId,
        data: {
          sanction_id: sanctionId,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          notes,
        },
      }).unwrap();
      toast.showSuccess("Sanksi berhasil ditetapkan.");
      onOpenChange(false);
    } finally {
      toast.dismissToast(loadingId);
    }
  };

  const resetForm = () => {
    setSanctionId(null);
    setStartDate(undefined);
    setEndDate(undefined);
    setNotes("");
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) resetForm(); }}>
      <DialogContent className="max-w-2xl w-[95vw]">
        <DialogHeader>
          <DialogTitle>Beri Sanksi</DialogTitle>
          <DialogDescription>Tetapkan sanksi untuk laporan pelanggaran ini.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label>Sanksi</Label>
            <Select
              onValueChange={(v) => setSanctionId(Number(v))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih sanksi" />
              </SelectTrigger>
              <SelectContent>
                {sanctions.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tanggal Mulai</Label>
              <DatePicker value={startDate} onValueChange={setStartDate} placeholder="Pilih tanggal mulai" />
            </div>
            <div className="space-y-2">
              <Label>Tanggal Selesai</Label>
              <DatePicker value={endDate} onValueChange={setEndDate} placeholder="Pilih tanggal selesai" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Catatan</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Tambahkan catatan (opsional)"
              rows={4}
            />
          </div>
        </div>

        <DialogFooter className="sm:justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="mr-2 h-4 w-4" /> Batal
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? <span className="flex items-center"><Save className="mr-2 h-4 w-4 animate-spin" /> Menyimpan...</span> : <span className="flex items-center"><Save className="mr-2 h-4 w-4" /> Simpan</span>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SanctionAssignDialog;