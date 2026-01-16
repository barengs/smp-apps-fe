import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Search, Loader2 } from 'lucide-react';
import TableLoadingSkeleton from '@/components/TableLoadingSkeleton';
import { showSuccess, showError, showLoading, dismissToast } from '@/utils/toast';

import { useGetInstitusiPendidikanQuery } from '@/store/slices/institusiPendidikanApi';
import { useGetClassroomsQuery } from '@/store/slices/classroomApi';
import { useGetStudentClassesQuery, useUpdateStudentClassMutation } from '@/store/slices/studentClassApi';
import { useGetStudentsQuery } from '@/store/slices/studentApi';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

type ClassGroup = {
  id: number;
  name: string;
};

type Classroom = {
  id: number;
  name: string;
  educational_institution_id?: number | null;
  class_groups?: ClassGroup[];
};

type StudentClassItem = {
  id: number; // assignment id
  student_id: number;
  education_id?: number; // backend may use this for institution
  class_id?: number;
  classrooms?: { id: number; name: string };
  class_group?: { id: number; name: string };
  students?: { first_name: string; last_name?: string | null; nis?: string };
  academic_year_id?: number;
  approval_status?: string;
};

const KenaikanKelasModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  // Data backend
  const { data: institusiList, isLoading: isLoadingInstitusi } = useGetInstitusiPendidikanQuery({});
  const { data: classroomsResponse, isLoading: isLoadingClassrooms } = useGetClassroomsQuery();
  const { data: studentClassesResponse, isLoading: isLoadingStudentClasses } = useGetStudentClassesQuery({ page: 1, per_page: 9999 });
  const { data: studentsResponse, isLoading: isLoadingStudents } = useGetStudentsQuery({});

  const [updateStudentClass, { isLoading: isUpdating }] = useUpdateStudentClassMutation();

  // Pilihan sumber
  const [sourceInstitutionId, setSourceInstitutionId] = React.useState<string>('');
  const [sourceClassroomId, setSourceClassroomId] = React.useState<string>('');
  const [sourceClassGroupId, setSourceClassGroupId] = React.useState<string>('');

  // Pilihan tujuan
  const [targetClassroomId, setTargetClassroomId] = React.useState<string>('');
  const [targetClassGroupId, setTargetClassGroupId] = React.useState<string>('');

  // Siswa
  const [selectedIds, setSelectedIds] = React.useState<number[]>([]);
  const [searchTerm, setSearchTerm] = React.useState<string>('');

  const isBaseLoading = isLoadingInstitusi || isLoadingClassrooms || isLoadingStudentClasses || isLoadingStudents;

  // Reset dependent selections
  React.useEffect(() => {
    setSourceClassroomId('');
    setSourceClassGroupId('');
    setTargetClassroomId('');
    setTargetClassGroupId('');
    setSelectedIds([]);
  }, [sourceInstitutionId]);

  React.useEffect(() => {
    setSourceClassGroupId('');
    setSelectedIds([]);
  }, [sourceClassroomId]);

  React.useEffect(() => {
    setTargetClassGroupId('');
  }, [targetClassroomId]);

  // Filter classrooms berdasarkan institusi sumber
  const classroomOptions = React.useMemo(() => {
    const list = Array.isArray(classroomsResponse?.data) ? (classroomsResponse?.data as Classroom[]) : [];
    if (!sourceInstitutionId) return [];
    return list.filter((c) => String(c.educational_institution_id ?? '') === sourceInstitutionId);
  }, [classroomsResponse, sourceInstitutionId]);

  // Ambil class_groups berdasarkan classroom yang dipilih
  const sourceClassGroups = React.useMemo(() => {
    if (!sourceClassroomId) return [];
    const classroom = classroomOptions.find((c) => String(c.id) === sourceClassroomId);
    return classroom?.class_groups ?? [];
  }, [classroomOptions, sourceClassroomId]);

  const targetClassGroups = React.useMemo(() => {
    if (!targetClassroomId) return [];
    const classroom = classroomOptions.find((c) => String(c.id) === targetClassroomId);
    return classroom?.class_groups ?? [];
  }, [classroomOptions, targetClassroomId]);

  // Siapkan map students agar bisa fallback nama
  const studentMap = React.useMemo(() => {
    const arr = Array.isArray(studentsResponse) ? studentsResponse : [];
    return new Map(arr.map((s: any) => [s.id, s]));
  }, [studentsResponse]);

  // Ambil siswa berdasarkan sumber dari backend student-classes
  const sourceAssignments = React.useMemo(() => {
    const list = Array.isArray(studentClassesResponse?.data) ? (studentClassesResponse?.data as StudentClassItem[]) : [];
    if (!sourceInstitutionId || !sourceClassroomId || !sourceClassGroupId) return [];

    return list.filter((item) => {
      const institutionOk = String(item.education_id ?? '') === sourceInstitutionId;
      const classOk = String(item.classrooms?.id ?? item.class_id ?? '') === sourceClassroomId;
      const groupOk = String(item.class_group?.id ?? '') === sourceClassGroupId;
      return institutionOk && classOk && groupOk;
    });
  }, [studentClassesResponse, sourceInstitutionId, sourceClassroomId, sourceClassGroupId]);

  // Render siswa yang cocok dari sumber
  type StudentRow = {
    assignmentId: number;
    studentId: number;
    name: string;
    nis?: string;
    status?: string;
  };

  const studentRows: StudentRow[] = React.useMemo(() => {
    return sourceAssignments.map((a) => {
      const s = a.students || studentMap.get(a.student_id);
      const name = s ? `${s.first_name} ${s.last_name || ''}`.trim() : `ID ${a.student_id}`;
      const nis = s?.nis;
      return {
        assignmentId: a.id,
        studentId: a.student_id,
        name,
        nis,
        status: a.approval_status || 'diajukan',
      };
    });
  }, [sourceAssignments, studentMap]);

  // Pencarian
  const filteredRows = React.useMemo(() => {
    if (!searchTerm) return studentRows;
    const q = searchTerm.toLowerCase();
    return studentRows.filter((r) => {
      const name = r.name.toLowerCase();
      const nis = String(r.nis ?? '').toLowerCase();
      return name.includes(q) || nis.includes(q);
    });
  }, [studentRows, searchTerm]);

  // Pilih semua dari hasil filter tampilan
  const handleToggleAll = (checked: boolean) => {
    if (checked) {
      const ids = filteredRows.map((r) => r.assignmentId);
      const set = new Set([...selectedIds, ...ids]);
      setSelectedIds(Array.from(set));
    } else {
      const ids = new Set(filteredRows.map((r) => r.assignmentId));
      setSelectedIds((prev) => prev.filter((id) => !ids.has(id)));
    }
  };

  const handleToggleOne = (assignmentId: number, checked: boolean) => {
    setSelectedIds((prev) => (checked ? [...prev, assignmentId] : prev.filter((id) => id !== assignmentId)));
  };

  const canSubmit = !!sourceInstitutionId && !!sourceClassroomId && !!sourceClassGroupId && !!targetClassroomId && !!targetClassGroupId && selectedIds.length > 0;

  const handleSubmit = async () => {
    if (!canSubmit) {
      showError('Lengkapi sumber dan tujuan, lalu pilih siswa yang akan dinaikkan kelas.');
      return;
    }

    const toastId = showLoading('Memproses kenaikan kelas...');
    try {
      await Promise.all(
        selectedIds.map((assignmentId) =>
          updateStudentClass({
            id: assignmentId,
            data: {
              educational_institution_id: parseInt(sourceInstitutionId, 10), // tetap di institusi yang sama
              classroom_id: parseInt(targetClassroomId, 10),
              class_group_id: parseInt(targetClassGroupId, 10),
              approval_status: 'diajukan',
            },
          }).unwrap()
        )
      );
      dismissToast(toastId);
      showSuccess(`Berhasil memproses kenaikan kelas untuk ${selectedIds.length} siswa.`);
      setSelectedIds([]);
      onSuccess?.();
      onClose();
    } catch (err) {
      dismissToast(toastId);
      console.error(err);
      showError('Gagal memproses kenaikan kelas.');
    }
  };

  const renderInstitutionOptions = () => {
    const list = Array.isArray(institusiList) ? institusiList : [];
    return list.map((i) => (
      <SelectItem key={i.id} value={String(i.id)}>
        {i.institution_name}
      </SelectItem>
    ));
  };

  const renderClassroomOptions = (classrooms: Classroom[]) => {
    return classrooms.map((c) => (
      <SelectItem key={c.id} value={String(c.id)}>
        {c.name}
      </SelectItem>
    ));
  };

  const renderClassGroupOptions = (groups: ClassGroup[]) => {
    return groups.map((g) => (
      <SelectItem key={g.id} value={String(g.id)}>
        {g.name}
      </SelectItem>
    ));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Kenaikan Kelas</DialogTitle>
          <DialogDescription>
            Pilih sumber (pendidikan, kelas, rombel), lalu tujuan (kelas, rombel). Daftar siswa akan dimuat dari backend berdasarkan sumber yang dipilih.
          </DialogDescription>
        </DialogHeader>

        {isBaseLoading ? (
          <TableLoadingSkeleton />
        ) : (
          <>
            {/* Sumber */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-2">
              <div>
                <Label>Pendidikan (Asal)</Label>
                <Select value={sourceInstitutionId} onValueChange={setSourceInstitutionId}>
                  <SelectTrigger><SelectValue placeholder="Pilih Pendidikan" /></SelectTrigger>
                  <SelectContent>
                    {renderInstitutionOptions()}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Kelas (Asal)</Label>
                <Select value={sourceClassroomId} onValueChange={setSourceClassroomId} disabled={!sourceInstitutionId}>
                  <SelectTrigger><SelectValue placeholder="Pilih Kelas" /></SelectTrigger>
                  <SelectContent>
                    {renderClassroomOptions(classroomOptions)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Rombel (Asal)</Label>
                <Select value={sourceClassGroupId} onValueChange={setSourceClassGroupId} disabled={!sourceClassroomId}>
                  <SelectTrigger><SelectValue placeholder="Pilih Rombel" /></SelectTrigger>
                  <SelectContent>
                    {renderClassGroupOptions(sourceClassGroups)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tujuan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
              <div>
                <Label>Kelas (Tujuan)</Label>
                <Select value={targetClassroomId} onValueChange={setTargetClassroomId} disabled={!sourceInstitutionId}>
                  <SelectTrigger><SelectValue placeholder="Pilih Kelas Tujuan" /></SelectTrigger>
                  <SelectContent>
                    {renderClassroomOptions(classroomOptions)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Rombel (Tujuan)</Label>
                <Select value={targetClassGroupId} onValueChange={setTargetClassGroupId} disabled={!targetClassroomId}>
                  <SelectTrigger><SelectValue placeholder="Pilih Rombel Tujuan" /></SelectTrigger>
                  <SelectContent>
                    {renderClassGroupOptions(targetClassGroups)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Pencarian dan tabel siswa */}
            <div className="py-2">
              <p className="text-sm font-medium mb-2">Siswa di Sumber</p>
              <div className="flex items-center gap-2 mb-3">
                <div className="relative w-full max-w-md">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Cari nama atau NIS siswa..."
                    className="pl-8"
                  />
                </div>
                {searchTerm && (
                  <Button variant="outline" onClick={() => setSearchTerm('')}>
                    Bersihkan
                  </Button>
                )}
              </div>

              <ScrollArea className="h-64 border rounded-md">
                <Table>
                  <TableHeader className="sticky top-0 bg-background">
                    <TableRow>
                      <TableHead className="w-12 py-2">
                        <Checkbox
                          onCheckedChange={(checked) => handleToggleAll(!!checked)}
                          checked={filteredRows.length > 0 && filteredRows.every((r) => selectedIds.includes(r.assignmentId))}
                          aria-label="Pilih semua"
                        />
                      </TableHead>
                      <TableHead className="py-2">Nama Siswa</TableHead>
                      <TableHead className="py-2">NIS</TableHead>
                      <TableHead className="py-2">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRows.length > 0 ? (
                      filteredRows.map((r) => (
                        <TableRow key={r.assignmentId} className="h-10">
                          <TableCell className="py-1">
                            <Checkbox
                              checked={selectedIds.includes(r.assignmentId)}
                              onCheckedChange={(checked) => handleToggleOne(r.assignmentId, !!checked)}
                            />
                          </TableCell>
                          <TableCell className="py-1">{r.name}</TableCell>
                          <TableCell className="py-1">{r.nis || '-'}</TableCell>
                          <TableCell className="py-1">
                            <span className="text-xs text-gray-600">{r.status}</span>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4">
                          {sourceInstitutionId && sourceClassroomId && sourceClassGroupId
                            ? 'Tidak ada siswa pada sumber yang dipilih.'
                            : 'Pilih pendidikan, kelas, dan rombel sumber terlebih dahulu.'}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          </>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Batal</Button>
          <Button onClick={handleSubmit} disabled={!canSubmit || isUpdating || isBaseLoading}>
            {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isUpdating ? 'Memproses...' : 'Simpan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default KenaikanKelasModal;