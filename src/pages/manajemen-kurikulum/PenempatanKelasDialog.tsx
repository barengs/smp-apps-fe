import React, { useState, useMemo, useEffect } from 'react';
import { useGetStudentsQuery } from '@/store/slices/studentApi';
import { useGetTahunAjaranQuery } from '@/store/slices/tahunAjaranApi';
import { useGetEducationLevelsQuery } from '@/store/slices/educationApi';
import { useGetClassroomsQuery } from '@/store/slices/classroomApi';
import { useCreateStudentClassMutation, useGetStudentClassesQuery, useUpdateStudentClassMutation } from '@/store/slices/studentClassApi';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { showSuccess, showError, showLoading, dismissToast } from '@/utils/toast';
import { Label } from '@/components/ui/label';
import TableLoadingSkeleton from '@/components/TableLoadingSkeleton';
import { useGetInstitusiPendidikanQuery } from '@/store/slices/institusiPendidikanApi';

interface PenempatanKelasDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAssignmentUpdate?: () => void;
}

interface ClassGroup {
  id: number;
  name: string;
  classroom_id: string;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

interface Classroom {
  id: number;
  name: string;
  parent_id: number | null;
  description: string;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  class_groups: ClassGroup[];
  educational_institution_id: number;
}

interface StudentClassAssignment {
  id: number;
  student_id: number;
  academic_year_id: number;
  educational_institution_id: number;
  classroom_id: number;
  class_group_id: number;
  approval_status: string;
}

const PenempatanKelasDialog: React.FC<PenempatanKelasDialogProps> = ({
  isOpen,
  onClose,
  onAssignmentUpdate
}) => {
  // Data fetching
  const { data: studentsResponse, isLoading: isLoadingStudents } = useGetStudentsQuery({ per_page: 9999 });
  const { data: academicYears, isLoading: isLoadingAcademicYears } = useGetTahunAjaranQuery();
  const { data: institusiPendidikan, isLoading: isLoadingInstitusiPendidikan } = useGetInstitusiPendidikanQuery({});
  const { data: classroomsResponse, isLoading: isLoadingClassrooms } = useGetClassroomsQuery();
  const { data: studentClassesResponse, isLoading: isLoadingStudentClasses } = useGetStudentClassesQuery({ per_page: 9999 });
  const [createStudentClass, { isLoading: isCreating }] = useCreateStudentClassMutation();
  const [updateStudentClass, { isLoading: isUpdating }] = useUpdateStudentClassMutation();

  // Form state
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [selectedClassroom, setSelectedClassroom] = useState<string>('');
  const [selectedClassGroup, setSelectedClassGroup] = useState<string>('');
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [studentAssignments, setStudentAssignments] = useState<Record<number, StudentClassAssignment>>({});
  const [searchTerm, setSearchTerm] = useState<string>('');

  const isLoading = isLoadingStudents || isLoadingAcademicYears || isLoadingInstitusiPendidikan || isLoadingClassrooms || isLoadingStudentClasses;

  useEffect(() => {
    if (selectedClassroom) {
      // Reset class group selection when classroom changes
      setSelectedClassGroup('');
    }
  }, [selectedClassroom]);

  useEffect(() => {
    if (selectedLevel) {
      // Reset classroom and class group when level changes
      setSelectedClassroom('');
      setSelectedClassGroup('');
    }
  }, [selectedLevel]);

  // Build student assignments map for quick lookup
  useEffect(() => {
    if (studentClassesResponse?.data && Array.isArray(studentClassesResponse.data)) {
      const assignmentsMap: Record<number, StudentClassAssignment> = {};
      studentClassesResponse.data.forEach((assignment: any) => {
        assignmentsMap[assignment.student_id] = assignment;
      });
      setStudentAssignments(assignmentsMap);
    }
  }, [studentClassesResponse]);

  // Auto-select students already in the target Classroom/Group
  useEffect(() => {
    if (selectedAcademicYear && selectedClassroom && selectedClassGroup && studentAssignments) {
      const alreadyInClass = Object.values(studentAssignments)
        .filter(a =>
          String(a.academic_year_id) === selectedAcademicYear &&
          String(a.classroom_id) === selectedClassroom &&
          String(a.class_group_id) === selectedClassGroup
        )
        .map(a => a.student_id);

      setSelectedStudents(prev => {
        // Keep manually selected ones, but ensure current class members are present
        const set = new Set([...prev, ...alreadyInClass]);
        return Array.from(set);
      });
    }
  }, [selectedAcademicYear, selectedClassroom, selectedClassGroup, studentAssignments]);

  const availableStudents = useMemo(() => {
    if (!studentsResponse || !Array.isArray(studentsResponse)) {
      return [];
    }

    // Hanya tampilkan santri yang BENAR-BENAR belum punya kelas di riwayat mana pun
    return studentsResponse.filter(student => {
      const existingAssignment = studentAssignments[student.id];
      return !existingAssignment;
    });
  }, [studentsResponse, studentAssignments]);

  // Filter hasil berdasarkan pencarian nama atau NIS
  const filteredStudents = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const baseList = term
      ? availableStudents.filter((student) => {
        const fullName = `${student.first_name} ${student.last_name || ''}`.trim().toLowerCase();
        const nis = String(student.nis || '').toLowerCase();
        return fullName.includes(term) || nis.includes(term);
      })
      : availableStudents;

    const getSortWeight = (studentId: number) => {
      const a = studentAssignments[studentId];
      if (!a || String(a.academic_year_id) !== selectedAcademicYear) return 0; // Top for unassigned

      // If in current classroom + group => bottom
      if (
        String(a.classroom_id) === selectedClassroom &&
        String(a.class_group_id) === selectedClassGroup
      ) return 2; // Bottom

      return 1; // Middle (in year but different class)
    };

    const normalizeName = (s: any) =>
      `${s.first_name} ${s.last_name || ''}`.trim().toLowerCase();

    // Urutkan: unassigned (0) -> other class in year (1) -> current class members (2)
    return [...baseList].sort((a, b) => {
      const weightA = getSortWeight(a.id);
      const weightB = getSortWeight(b.id);

      if (weightA !== weightB) {
        return weightA - weightB;
      }
      return normalizeName(a).localeCompare(normalizeName(b));
    });
  }, [availableStudents, searchTerm, selectedAcademicYear, studentAssignments, selectedClassroom, selectedClassGroup]);

  // Update: pilih semua/deselect hanya pada hasil filter yang sedang tampil
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStudents((prev) => {
        const idsToAdd = filteredStudents.map((s) => s.id);
        const set = new Set([...prev, ...idsToAdd]);
        return Array.from(set);
      });
    } else {
      setSelectedStudents((prev) =>
        prev.filter((id) => !filteredStudents.some((s) => s.id === id))
      );
    }
  };

  const handleSelectSingle = (studentId: number, checked: boolean) => {
    if (checked) {
      setSelectedStudents(prev => [...prev, studentId]);
    } else {
      setSelectedStudents(prev => prev.filter(id => id !== studentId));
    }
  };

  const handleSubmit = async () => {
    if (!selectedAcademicYear || !selectedLevel || !selectedClassroom || !selectedClassGroup || selectedStudents.length === 0) {
      showError('Harap lengkapi semua bidang dan pilih setidaknya satu siswa.');
      return;
    }

    const toastId = showLoading('Menyimpan data penempatan kelas...');

    try {
      // Create new assignments
      await Promise.all(
        selectedStudents.map(studentId =>
          createStudentClass({
            academic_year_id: parseInt(selectedAcademicYear),
            educational_institution_id: parseInt(selectedLevel),
            student_id: studentId,
            classroom_id: parseInt(selectedClassroom),
            class_group_id: parseInt(selectedClassGroup),
            approval_status: 'diajukan',
          }).unwrap()
        )
      );

      dismissToast(toastId);
      showSuccess(`${selectedStudents.length} data penempatan kelas berhasil disimpan.`);

      // Reset form
      setSelectedStudents([]);
      setSelectedAcademicYear('');
      setSelectedLevel('');
      setSelectedClassroom('');
      setSelectedClassGroup('');

      onClose();
      onAssignmentUpdate?.();
    } catch (error) {
      dismissToast(toastId);
      showError('Gagal menyimpan data penempatan kelas. Silakan coba lagi.');
      console.error('Error saving student class assignments:', error);
    }
  };

  // Safe rendering with proper validation
  const renderAcademicYears = () => {
    if (!academicYears || !Array.isArray(academicYears)) return null;
    return academicYears.map(year => (
      <SelectItem key={year.id} value={year.id.toString()}>{year.year}</SelectItem>
    ));
  };

  const renderLevels = () => {
    if (!institusiPendidikan || !Array.isArray(institusiPendidikan)) return null;
    return institusiPendidikan.map(level => (
      <SelectItem key={level.id} value={level.id.toString()}>{level.institution_name}</SelectItem>
    ));
  };

  const renderClassrooms = () => {
    if (!classroomsResponse?.data || !Array.isArray(classroomsResponse.data) || !selectedLevel) return null;
    const filtered = classroomsResponse.data.filter(
      (classroom: Classroom) => String(classroom.educational_institution_id) === selectedLevel
    );
    return filtered.map((classroom) => (
      <SelectItem key={classroom.id} value={classroom.id.toString()}>
        {classroom.name}
      </SelectItem>
    ));
  };

  const renderClassGroups = () => {
    if (!classroomsResponse?.data || !Array.isArray(classroomsResponse.data) || !selectedClassroom) return null;

    const selectedClassroomData = classroomsResponse.data.find(
      (classroom: Classroom) => classroom.id.toString() === selectedClassroom
    );

    if (!selectedClassroomData || !selectedClassroomData.class_groups || !Array.isArray(selectedClassroomData.class_groups)) {
      return null;
    }

    return selectedClassroomData.class_groups.map(classGroup => (
      <SelectItem key={classGroup.id} value={classGroup.id.toString()}>{classGroup.name}</SelectItem>
    ));
  };

  // Get student status for display
  const getStudentStatus = (studentId: number) => {
    const assignment = studentAssignments[studentId];
    if (!assignment) return { text: 'Belum ada kelas', className: 'text-gray-500' };

    if (assignment.academic_year_id.toString() === selectedAcademicYear) {
      return { text: 'Sudah ada kelas (bisa diubah)', className: 'text-blue-600' };
    }

    return { text: 'Sudah ada kelas di tahun ajaran lain', className: 'text-orange-600' };
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] w-full h-[95vh] flex flex-col p-6">
        <DialogHeader>
          <DialogTitle>Penempatan Kelas Santri Baru</DialogTitle>
          <DialogDescription>
            Pilih tahun ajaran, jenjang, dan kelas, lalu pilih santri baru yang akan ditempatkan.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <TableLoadingSkeleton />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 py-4">
              <div>
                <Label htmlFor="academic-year">Tahun Ajaran</Label>
                <Select value={selectedAcademicYear} onValueChange={setSelectedAcademicYear}>
                  <SelectTrigger id="academic-year"><SelectValue placeholder="Pilih Tahun Ajaran" /></SelectTrigger>
                  <SelectContent>
                    {renderAcademicYears()}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="education-level">Pendidikan</Label>
                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                  <SelectTrigger id="education-level"><SelectValue placeholder="Pilih Pendidikan" /></SelectTrigger>
                  <SelectContent>
                    {renderLevels()}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="classroom">Kelas</Label>
                <Select value={selectedClassroom} onValueChange={setSelectedClassroom} disabled={!selectedLevel}>
                  <SelectTrigger id="classroom"><SelectValue placeholder="Pilih Kelas" /></SelectTrigger>
                  <SelectContent>
                    {renderClassrooms()}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="class-group">Rombel</Label>
                <Select value={selectedClassGroup} onValueChange={setSelectedClassGroup} disabled={!selectedClassroom}>
                  <SelectTrigger id="class-group"><SelectValue placeholder="Pilih Rombel" /></SelectTrigger>
                  <SelectContent>
                    {renderClassGroups()}
                  </SelectContent>
                </Select>
              </div>
            </div>



            {/* Wrapper untuk konten siswa agar mengisi sisa ruang */}
            <div className="flex-1 flex flex-col min-h-0 py-2">
              <p className="text-sm font-medium mb-2">Pilih Siswa</p>
              <div className="text-xs text-gray-600 mb-2">
                • Siswa yang belum memiliki kelas: dapat dipilih
                <br />• Siswa yang sudah ada kelas di tahun ajaran ini: dapat diubah
                <br />• Siswa yang sudah ada kelas di tahun ajaran lain: tidak dapat dipilih
              </div>

              {/* Kolom pencarian siswa */}
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

              <ScrollArea className="flex-1 border rounded-md">
                <Table>
                  <TableHeader className="sticky top-0 bg-background">
                    <TableRow>
                      <TableHead className="w-12 py-2">
                        <Checkbox
                          onCheckedChange={handleSelectAll}
                          checked={filteredStudents.length > 0 && filteredStudents.every((s) => selectedStudents.includes(s.id))}
                          aria-label="Pilih semua"
                        />
                      </TableHead>
                      <TableHead className="py-2">Nama Siswa</TableHead>
                      <TableHead className="py-2">NIS</TableHead>
                      <TableHead className="py-2">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map(student => {
                        const status = getStudentStatus(student.id);
                        const isDisabled = status.text.includes('tahun ajaran lain');
                        return (
                          <TableRow key={student.id} className="h-10">
                            <TableCell className="py-1">
                              <Checkbox
                                checked={selectedStudents.includes(student.id)}
                                onCheckedChange={(checked) => handleSelectSingle(student.id, !!checked)}
                                disabled={isDisabled}
                              />
                            </TableCell>
                            <TableCell className="py-1">{`${student.first_name} ${student.last_name || ''}`.trim()}</TableCell>
                            <TableCell className="py-1">{student.nis}</TableCell>
                            <TableCell className="py-1">
                              <span className={`text-xs ${status.className}`}>{status.text}</span>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4">
                          {availableStudents.length > 0
                            ? 'Tidak ada siswa yang cocok dengan pencarian.'
                            : (studentsResponse && studentsResponse.length > 0
                              ? 'Tidak ada siswa yang tersedia untuk tahun ajaran ini.'
                              : 'Tidak ada data siswa yang tersedia.')}
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
          <Button onClick={handleSubmit} disabled={isCreating || isUpdating || isLoading}>
            {isCreating || isUpdating ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PenempatanKelasDialog;
