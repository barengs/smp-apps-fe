"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { useGetRoomsQuery } from "@/store/slices/roomApi";
import { useGetTahunAjaranQuery, useGetActiveTahunAjaranQuery } from "@/store/slices/tahunAjaranApi";
import { useAssignStudentRoomMutation } from "@/store/slices/studentApi";
import { showSuccess, showError, showLoading, dismissToast } from "@/utils/toast";

type Props = {
  studentId: number;
  triggerLabel?: string;
  onAssigned?: () => void;
};

const formatDateTimeLocal = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const RoomAssignDialog: React.FC<Props> = ({ studentId, triggerLabel = "Tentukan Kamar", onAssigned }) => {
  const [open, setOpen] = React.useState(false);
  const [roomId, setRoomId] = React.useState<number | null>(null);
  const [academicYearId, setAcademicYearId] = React.useState<number | null>(null);
  const [startDateTime, setStartDateTime] = React.useState<string>(formatDateTimeLocal(new Date()));
  const [notes, setNotes] = React.useState<string>("");

  const { data: roomsResp } = useGetRoomsQuery({ per_page: 100 });
  const rooms = Array.isArray(roomsResp?.data) ? roomsResp.data : [];

  const { data: tahunAjaran } = useGetTahunAjaranQuery();
  const { data: activeAY } = useGetActiveTahunAjaranQuery();

  React.useEffect(() => {
    if (activeAY?.id && academicYearId == null) {
      setAcademicYearId(activeAY.id);
    }
  }, [activeAY, academicYearId]);

  const [assignStudentRoom, { isLoading }] = useAssignStudentRoomMutation();

  const handleSubmit = async () => {
    if (!roomId || !academicYearId || !startDateTime) {
      showError("Silakan lengkapi kamar, tahun ajaran, dan tanggal mulai.");
      return;
    }
    const toastId = showLoading("Menyimpan penentuan kamar...");
    try {
      const isoStart = new Date(startDateTime).toISOString();
      await assignStudentRoom({
        id: studentId,
        data: {
          room_id: Number(roomId),
          academic_year_id: Number(academicYearId),
          start_date: isoStart,
          notes: notes || "",
        },
      }).unwrap();
      showSuccess("Kamar santri berhasil ditentukan!");
      if (onAssigned) onAssigned();
      setOpen(false);
    } catch (_e) {
      showError("Gagal menyimpan penentuan kamar.");
    } finally {
      dismissToast(toastId);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        type="button"
        variant="outline-primary"
        size="sm"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
      >
        {triggerLabel}
      </Button>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Tentukan Kamar Santri</DialogTitle>
          <DialogDescription>Pilih kamar dan informasi terkait untuk santri ini.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="room">Kamar</Label>
            <Select onValueChange={(v) => setRoomId(Number(v))} value={roomId ? String(roomId) : undefined}>
              <SelectTrigger id="room">
                <SelectValue placeholder="Pilih kamar" />
              </SelectTrigger>
              <SelectContent>
                {rooms.map((r) => (
                  <SelectItem key={r.id} value={String(r.id)}>
                    {r.name} {r.hostel?.name ? `• ${r.hostel.name}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="academicYear">Tahun Ajaran</Label>
            <Select onValueChange={(v) => setAcademicYearId(Number(v))} value={academicYearId ? String(academicYearId) : undefined}>
              <SelectTrigger id="academicYear">
                <SelectValue placeholder="Pilih tahun ajaran" />
              </SelectTrigger>
              <SelectContent>
                {(tahunAjaran || []).map((ay) => (
                  <SelectItem key={ay.id} value={String(ay.id)}>
                    {ay.year} {ay.periode ? `(${ay.periode})` : ""} {ay.active ? "• Aktif" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="startDateTime">Tanggal Mulai</Label>
            <Input
              id="startDateTime"
              type="datetime-local"
              value={startDateTime}
              onChange={(e) => setStartDateTime(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes">Catatan</Label>
            <Textarea
              id="notes"
              placeholder="Opsional"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="mt-2">
          <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
          <Button onClick={handleSubmit} disabled={isLoading || !roomId || !academicYearId || !startDateTime}>
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RoomAssignDialog;