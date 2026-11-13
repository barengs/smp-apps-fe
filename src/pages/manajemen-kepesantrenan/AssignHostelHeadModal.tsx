"use client";

import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { showError, showSuccess, showLoading, dismissToast } from "@/utils/toast";
import { useGetEmployeesQuery } from "@/store/slices/employeeApi";
import { useGetActiveTahunAjaranQuery, useGetTahunAjaranQuery } from "@/store/slices/tahunAjaranApi";
import { useAssignHostelHeadMutation, useGetHostelHeadsQuery } from '@/store/slices/hostelApi';

interface AssignHostelHeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  hostelId: number | null;
  hostelName?: string;
  onSuccess?: () => void;
}

const AssignHostelHeadModal: React.FC<AssignHostelHeadModalProps> = ({ isOpen, onClose, hostelId, hostelName, onSuccess }) => {
  const { data: staffList } = useGetEmployeesQuery();
  const { data: activeYear } = useGetActiveTahunAjaranQuery();
  const { data: years } = useGetTahunAjaranQuery();

  // UPDATED: Ambil kandidat kepala dari endpoint baru
  const { data: headCandidates = [], isLoading: headsLoading } = useGetHostelHeadsQuery();

  const [staffId, setStaffId] = React.useState<string>("");
  const [academicYearId, setAcademicYearId] = React.useState<string>("");
  const [startDate, setStartDate] = React.useState<string>("");
  const [endDate, setEndDate] = React.useState<string>("");
  const [notes, setNotes] = React.useState<string>("");
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);

  const [assignHead] = useAssignHostelHeadMutation();

  React.useEffect(() => {
    // Set default academic year ke active saat membuka modal
    if (activeYear?.id) {
      setAcademicYearId(String(activeYear.id));
    }
  }, [activeYear, isOpen]);

  // Jika sebelumnya ada sumber lain untuk staff, ganti ke headCandidates
  const staffOptions = React.useMemo(
    () =>
      (headCandidates || []).map((s: any) => ({
        label: s.name,
        value: String(s.id),
        extra: s.code ? ` • ${s.code}` : '',
      })),
    [headCandidates]
  );

  const yearOptions = React.useMemo(() => {
    return Array.isArray(years) ? years : [];
  }, [years]);

  const handleSubmit = async () => {
    if (!hostelId) {
      showError("ID Asrama tidak tersedia.");
      return;
    }
    const payload = {
      staff_id: Number(staffId),
      academic_year_id: Number(academicYearId),
      start_date: startDate,
      end_date: endDate || undefined,
      notes: notes || undefined,
    };

    if (!payload.staff_id || !payload.academic_year_id || !payload.start_date) {
      showError("Silakan lengkapi staf, tahun ajaran, dan tanggal mulai.");
      return;
    }

    const t = showLoading("Menyimpan penentuan kepala asrama...");
    setIsSubmitting(true);
    try {
      await assignHead({ id: hostelId, data: payload }).unwrap();
      dismissToast(t);
      showSuccess(`Kepala Asrama${hostelName ? ` untuk "${hostelName}"` : ""} berhasil ditentukan.`);
      setIsSubmitting(false);
      onSuccess?.();
      onClose();
    } catch (_e) {
      dismissToast(t);
      setIsSubmitting(false);
      showError("Gagal menyimpan penentuan kepala asrama.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Penentuan Kepala Asrama</DialogTitle>
          <DialogDescription>
            Pilih staf, posisi, dan tahun ajaran untuk menetapkan kepala asrama{hostelName ? ` "${hostelName}"` : ""}.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="staff" className="text-right">Staf</Label>
            <Select value={staffId} onValueChange={setStaffId}>
              <SelectTrigger id="staff" className="col-span-3">
                <SelectValue placeholder="Pilih staf" />
              </SelectTrigger>
              <SelectContent>
                {staffOptions.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}{s.extra}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* REMOVED: Field Posisi karena endpoint tidak lagi membutuhkan position_id */}
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="year" className="text-right">Tahun Ajaran</Label>
            <Select value={academicYearId} onValueChange={setAcademicYearId}>
              <SelectTrigger id="year" className="col-span-3">
                <SelectValue placeholder="Pilih tahun ajaran" />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((y) => (
                  <SelectItem key={y.id} value={String(y.id)}>{y.year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="start_date" className="text-right">Mulai</Label>
            <Input id="start_date" type="date" className="col-span-3" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="end_date" className="text-right">Selesai</Label>
            <Input id="end_date" type="date" className="col-span-3" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>

          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="notes" className="text-right">Catatan</Label>
            <Textarea id="notes" className="col-span-3" placeholder="Catatan (opsional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Batal</Button>
          <Button variant="success" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Menyimpan..." : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AssignHostelHeadModal;