import React, { useState, useMemo, useEffect } from 'react';
import { useGetStudentsQuery } from '@/store/slices/studentApi';
import { useGetTahunAjaranQuery } from '@/store/slices/tahunAjaranApi';
import { useGetEducationLevelsQuery } from '@/store/slices/educationApi';
import { useGetProgramsQuery } from '@/store/slices/programApi';
import { useGetClassroomsQuery } from '@/store/slices/classroomApi';
import { useCreateStudentClassMutation, useGetStudentClassesQuery } from '@/store/slices/studentClassApi';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { showSuccess, showError, showLoading, dismissToast } from '@/utils/toast';
import { Label } from '@/components/ui/label';
import TableLoadingSkeleton from '@/components/TableLoadingSkeleton';

interface TambahKenaikanKelasFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const TambahKenaikanKelasForm: React.FC<TambahKenaikanKelasFormProps> = ({ isOpen, onClose }) => {
  // Data fetching
  const { data: studentsResponse, isLoading: isLoadingStudents } = useGetStudentsQuery();
  const { data: academicYears, isLoading: isLoadingAcademicYears } = useGetTahunAjaranQuery();
  const { data: levelsResponse, isLoading: isLoadingLevels } = useGetEducationLevelsQuery();
  const { data: programsResponse, isLoading: isLoadingPrograms } = useGetProgramsQuery();
  const { data: classroomsResponse, isLoading: isLoadingClassrooms } = useGetClassroomsQuery();
  const { data: studentClassesResponse, isLoading: isLoadingStudentClasses } = useGetStudentClassesQuery();
  const [createStudentClass, { isLoading: isCreating }] = useCreateStudentClassMutation();

  // Form state
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [selectedProgram, setSelectedProgram] = useState<string>('');
  const [selectedClassroom, setSelectedClassroom] = useState<string>('');
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);

  const isLoading = isLoadingStudents || isLoadingAcademicYears || isLoadingLevels || isLoadingPrograms || isLoadingClassrooms || isLoadingStudentClasses;

  useEffect(() => {
    if (selectedLevel && programsResponse) {
      const filtered = programsResponse.filter((p) => (p as any).education_level_id.toString() === selectedLevel);
      setSelectedProgram(''); // Reset program selection
    }
  }, [selectedLevel, programsResponse]);

  const unassignedStudents = useMemo(() => {
    if (!studentsResponse?.data || !studentClassesResponse?.data) {
      return [];
    }
    const assignedStudentIds = new Set(studentClassesResponse.data.map(sc => sc.student_id));
    return studentsResponse.data.filter(student => !assignedStudentIds.has(student.id));
  }, [studentsResponse, studentClassesResponse]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStudents(unassignedStudents.map(s => s.id));
    } else {
      setSelectedStudents([]);
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
    if (!selectedAcademicYear || !selectedLevel || !selectedProgram || !selectedClassroom || selectedStudents.length === 0) {
      showError('Harap lengkapi semua bidang dan pilih setidaknya satu siswa.');
      return;
    }

    const toastId = showLoading('Menambahkan siswa ke kelas...');
    try {
      await Promise.all(
        selectedStudents.map(studentId =>
          createStudentClass({
            academic_year_id: parseInt(selectedAcademicYear),
            education_id: parseInt(selectedProgram),
            student_id: studentId,
            class_id: parseInt(selectedClassroom),
            approval_status: 'pending',
          }).unwrap()
        )
      );
      dismissToast(toastId);
      showSuccess(`${selectedStudents.length} siswa berhasil ditambahkan ke kelas.`);
      onClose();
    } catch (error) {
      dismissToast(toastId);
      showError('Gagal menambahkan siswa. Silakan coba lagi.');
      console.error('Failed to create student class:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Tambah Data Kenaikan Kelas</DialogTitle>
          <DialogDescription>
            Pilih tahun ajaran, jenjang, dan kelas, lalu pilih siswa yang akan dimasukkan ke kelas tersebut.
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
                    {academicYears?.map(year => <SelectItem key={year.id} value={year.id.toString()}>{year.year}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="education-level">Jenjang Pendidikan</Label>
                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                  <SelectTrigger id="education-level"><SelectValue placeholder="Pilih Jenjang" /></SelectTrigger>
                  <SelectContent>
                    {levelsResponse?.data.map(level => <SelectItem key={level.id} value={level.id.toString()}>{level.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="program">Kelas/Program</Label>
                <Select value={selectedProgram} onValueChange={setSelectedProgram} disabled={!selectedLevel}>
                  <SelectTrigger id="program"><SelectValue placeholder="Pilih Kelas" /></SelectTrigger>
                  <SelectContent>
                    {programsResponse?.filter((p) => (p as any).education_level_id.toString() === selectedLevel).map(program => <SelectItem key={program.id} value={program.id.toString()}>{program.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="classroom">Rombel</Label>
                <Select value={selectedClassroom} onValueChange={setSelectedClassroom}>
                  <SelectTrigger id="classroom"><SelectValue placeholder="Pilih Rombel" /></SelectTrigger>
                  <SelectContent>
                    {classroomsResponse?.data.map(classroom => <SelectItem key={classroom.id} value={classroom.id.toString()}>{classroom.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <p className="text-sm font-medium mb-2">Pilih Siswa (Siswa yang belum memiliki kelas)</p>
            <ScrollArea className="h-72 border rounded-md">
              <Table>
                <TableHeader className="sticky top-0 bg-background">
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        onCheckedChange={handleSelectAll}
                        checked={selectedStudents.length > 0 && selectedStudents.length === unassignedStudents.length}
                        aria-label="Pilih semua"
                      />
                    </TableHead>
                    <TableHead>Nama Siswa</TableHead>
                    <TableHead>NIS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {unassignedStudents.length > 0 ? (
                    unassignedStudents.map(student => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedStudents.includes(student.id)}
                            onCheckedChange={(checked) => handleSelectSingle(student.id, !!checked)}
                          />
                        </TableCell>
                        <TableCell>{`${student.first_name} ${student.last_name || ''}`.trim()}</TableCell>
                        <TableCell>{student.nis}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center">Semua siswa sudah memiliki kelas.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Batal</Button>
          <Button onClick={handleSubmit} disabled={isCreating || isLoading}>
            {isCreating ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TambahKenaikanKelasForm;