"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useGetInstitusiPendidikanQuery } from "@/store/slices/institusiPendidikanApi";
import { useGetClassroomsQuery } from "@/store/slices/classroomApi";
import { useGetClassGroupsQuery } from "@/store/slices/classGroupApi";
import { useUpdateStudentClassMutation } from "@/store/slices/studentClassApi";
import { showSuccess, showError, showLoading, dismissToast } from "@/utils/toast";

type PromotionData = {
  id: number;
  siswa: string;
  education_id: number;
  class_id: number;
  class_group_id?: number | null;
};

interface TransferClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  selected?: PromotionData;
  onSuccess?: () => void;
}

const TransferClassModal: React.FC<TransferClassModalProps> = ({ isOpen, onClose, selected, onSuccess }) => {
  const [educationId, setEducationId] = React.useState<string>(selected?.education_id ? String(selected.education_id) : "");
  const [classroomId, setClassroomId] = React.useState<string>(selected?.class_id ? String(selected.class_id) : "");
  const [classGroupId, setClassGroupId] = React.useState<string>(selected?.class_group_id ? String(selected.class_group_id) : "");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const { data: institusiPendidikan } = useGetInstitusiPendidikanQuery({});
  const { data: classroomsResponse } = useGetClassroomsQuery();
  const { data: classGroupsResponse } = useGetClassGroupsQuery();

  const [updateStudentClass] = useUpdateStudentClassMutation();

  React.useEffect(() => {
    // Reset nilai saat item berubah
    setEducationId(selected?.education_id ? String(selected.education_id) : "");
    setClassroomId(selected?.class_id ? String(selected.class_id) : "");
    setClassGroupId(selected?.class_group_id ? String(selected.class_group_id) : "");
  }, [selected]);

  const classroomOptions = React.useMemo(() => {
    const list = Array.isArray(classroomsResponse?.data) ? classroomsResponse.data : Array.isArray(classroomsResponse) ? classroomsResponse : [];
    return list.map((c: any) => ({ id: c.id, name: c.name }));
  }, [classroomsResponse]);

  const educationOptions = React.useMemo(() => {
    const list = Array.isArray(institusiPendidikan) ? institusiPendidikan : [];
    return list.map((e: any) => ({ id: e.id, name: e.institution_name }));
  }, [institusiPendidikan]);

  const classGroupOptions = React.useMemo(() => {
    const list = Array.isArray(classGroupsResponse?.data) ? classGroupsResponse.data : Array.isArray(classGroupsResponse) ? classGroupsResponse : [];
    // Filter berdasarkan pilihan pendidikan dan kelas jika tersedia
    return list
      .filter((g: any) => {
        const eduOk = educationId ? String(g?.educational_institution?.id ?? g?.education_id) === educationId : true;
        const clsOk = classroomId ? String(g?.classroom?.id ?? g?.classroom_id) === classroomId : true;
        return eduOk && clsOk;
      })
      .map((g: any) => ({
        id: g.id,
        name: g.name,
        educationName: g?.educational_institution?.institution_name,
        classroomName: g?.classroom?.name,
      }));
  }, [classGroupsResponse, educationId, classroomId]);

  const handleSubmit = async () => {
    const edu = Number(educationId);
    const cls = Number(classroomId);
    const grp = Number(classGroupId);

    if (!selected?.id) {
      showError("Data siswa tidak ditemukan.");
      return;
    }
    if (!edu || !cls || !grp) {
      showError("Silakan pilih jenjang pendidikan, kelas, dan rombel tujuan.");
      return;
    }

    const toastId = showLoading("Memindahkan kelas...");
    setIsSubmitting(true);
    try {
      await updateStudentClass({
        id: selected.id,
        data: {
          educational_institution_id: edu,
          classroom_id: cls,
          class_group_id: grp,
        },
      }).unwrap();
      dismissToast(toastId);
      showSuccess(`Siswa "${selected.siswa}" berhasil dipindahkan.`);
      setIsSubmitting(false);
      onSuccess?.();
      onClose();
    } catch (err) {
      dismissToast(toastId);
      setIsSubmitting(false);
      showError("Gagal memindahkan siswa.");
      console.error(err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Pindah Kelas</DialogTitle>
          <DialogDescription>
            Pilih tujuan jenjang pendidikan, kelas, dan rombel untuk memindahkan siswa{selected?.siswa ? ` "${selected.siswa}"` : ""}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="education" className="text-right">Jenjang Pendidikan</Label>
            <Select value={educationId} onValueChange={setEducationId}>
              <SelectTrigger id="education" className="col-span-3">
                <SelectValue placeholder="Pilih jenjang pendidikan" />
              </SelectTrigger>
              <SelectContent>
                {educationOptions.map((opt) => (
                  <SelectItem key={opt.id} value={String(opt.id)}>
                    {opt.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="classroom" className="text-right">Kelas</Label>
            <Select value={classroomId} onValueChange={setClassroomId}>
              <SelectTrigger id="classroom" className="col-span-3">
                <SelectValue placeholder="Pilih kelas" />
              </SelectTrigger>
              <SelectContent>
                {classroomOptions.map((opt) => (
                  <SelectItem key={opt.id} value={String(opt.id)}>
                    {opt.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="class_group" className="text-right">Rombel Tujuan</Label>
            <Select value={classGroupId} onValueChange={setClassGroupId}>
              <SelectTrigger id="class_group" className="col-span-3">
                <SelectValue placeholder="Pilih rombel tujuan" />
              </SelectTrigger>
              <SelectContent>
                {classGroupOptions.map((opt) => (
                  <SelectItem key={opt.id} value={String(opt.id)}>
                    {opt.name} {opt.classroomName || opt.educationName ? `(${opt.educationName ?? "-"} - ${opt.classroomName ?? "-"})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Batal</Button>
          <Button variant="success" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Memproses..." : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TransferClassModal;