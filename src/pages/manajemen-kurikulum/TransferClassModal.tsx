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
  actionType?: 'transfer' | 'promote';
}

const TransferClassModal: React.FC<TransferClassModalProps> = ({ isOpen, onClose, selected, onSuccess, actionType = 'transfer' }) => {
  const isPromote = actionType === 'promote';
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

  // Set default education for promotion
  React.useEffect(() => {
    if (isPromote && selected?.education_id) {
      setEducationId(String(selected.education_id));
    }
  }, [isPromote, selected?.education_id]);

  const classroomOptions = React.useMemo(() => {
    const list = Array.isArray(classroomsResponse?.data) ? classroomsResponse.data : Array.isArray(classroomsResponse) ? classroomsResponse : [];
    return list.map((c: any) => ({ id: c.id, name: c.name }));
  }, [classroomsResponse]);

  const educationOptions = React.useMemo(() => {
    const list = Array.isArray(institusiPendidikan) ? institusiPendidikan : [];
    return list.map((e: any) => ({ id: e.id, name: e.institution_name }));
  }, [institusiPendidikan]);

  const targetClassGroups = React.useMemo(() => {
    const list = Array.isArray(classGroupsResponse?.data) ? classGroupsResponse.data : Array.isArray(classGroupsResponse) ? classGroupsResponse : [];
    return list
      .filter((g: any) => {
        const eduOk = educationId ? String(g?.educational_institution?.id ?? g?.education_id) === educationId : true;
        const clsOk = classroomId ? String(g?.classroom?.id ?? g?.classroom_id) === classroomId : true;
        return eduOk && clsOk;
      })
      .map((g: any) => ({
        id: g.id,
        name: g.name,
      }));
  }, [classGroupsResponse, educationId, classroomId]);

  const handleSubmit = async () => {
    const edu = isPromote ? Number(selected?.education_id) : Number(educationId);
    const cls = Number(classroomId);
    const grp = Number(classGroupId);

    if (!selected?.id) {
      showError('Data siswa tidak ditemukan.');
      return;
    }
    if (!cls || !grp || (!isPromote && !edu)) {
      showError('Silakan pilih kelas dan rombel tujuan' + (isPromote ? '' : ', serta jenjang pendidikan.'));
      return;
    }

    const actionText = isPromote ? 'Menaikkan kelas' : 'Memindahkan kelas';
    const actionPastText = isPromote ? 'dinaikkan kelas' : 'dipindahkan';
    
    const toastId = showLoading(`${actionText}...`);
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
      showSuccess(`Siswa "${selected.siswa}" berhasil ${actionPastText}.`);
      setIsSubmitting(false);
      onSuccess?.();
      onClose();
    } catch (err) {
      dismissToast(toastId);
      setIsSubmitting(false);
      showError(`Gagal ${actionText.toLowerCase()} siswa.`);
      console.error(err);
    }
  };

  const actionText = isPromote ? 'Naik Kelas' : 'Pindah Kelas';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isPromote ? 'Naik Kelas' : 'Pindah Kelas'}</DialogTitle>
          <DialogDescription>
            Pilih tujuan {isPromote ? 'kelas' : 'jenjang pendidikan, kelas'} dan rombel untuk {isPromote ? 'menaikkan kelas' : 'memindahkan'} siswa{selected?.siswa ? ` "${selected.siswa}"` : ''}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          {!isPromote && (
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
          )}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="classroom" className="text-right">Kelas</Label>
            <Select value={classroomId} onValueChange={setClassroomId}>
              <SelectTrigger id="classroom" className="col-span-3">
                <SelectValue placeholder="Pilih kelas" />
              </SelectTrigger>
              <SelectContent>
                {classroomOptions.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="classGroup" className="text-right">Rombel</Label>
            <Select value={classGroupId} onValueChange={setClassGroupId}>
              <SelectTrigger id="classGroup" className="col-span-3">
                <SelectValue placeholder="Pilih rombel" />
              </SelectTrigger>
              <SelectContent>
                {targetClassGroups.map((g) => (
                  <SelectItem key={g.id} value={String(g.id)}>
                    {g.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Batal</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Memproses...' : actionText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TransferClassModal;