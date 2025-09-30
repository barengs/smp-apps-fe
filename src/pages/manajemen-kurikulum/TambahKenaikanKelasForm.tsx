import React, { useState, useMemo, useEffect } from 'react';
import { useGetStudentsQuery } from '@/store/slices/studentApi';
import { useGetTahunAjaranQuery } from '@/store/slices/tahunAjaranApi';
import { useGetEducationLevelsQuery } from '@/store/slices/educationApi';
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
import { useGetInstitusiPendidikanQuery } from '@/store/slices/institusiPendidikanApi';

interface TambahKenaikanKelasFormProps {
  isOpen: boolean;
  onClose: () => void;
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
}

const TambahKenaikanKelasForm: React.FC<TambahKenaikanKelasFormProps> = ({ isOpen, onClose }) => {
  // Data fetching
  const { data: studentsResponse, isLoading: isLoadingStudents } = useGetStudentsQuery();
  const { data: academicYears, isLoading: isLoadingAcademicYears } = useGetTahunAjaranQuery();
  const { data: institusiPendidikan, isLoading: isLoadingInstitusiPendidikan } = useGetInstitusiPendidikanQuery();
  const { data: classroomsResponse, isLoading: isLoadingClassrooms } = useGetClassroomsQuery();
  const { data: studentClassesResponse, isLoading: isLoadingStudentClasses } = useGetStudentClassesQuery();
  const [createStudentClass, { isLoading: isCreating }] = useCreateStudentClassMutation();

  // Form state
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [selectedClassroom, setSelectedClassroom] = useState<string>('');
  const [selectedClassGroup, setSelectedClassGroup] = useState<string>('');
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);

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

  const unassignedStudents = useMemo(() => {
    // Jika tidak ada data students, return array kosong
    if (!studentsResponse?.data || !Array.isArray(studentsResponse.data)) {
      return [];
    }
    
    // Jika studentClassesResponse belum ada datanya (masih kosong), 
    // berarti semua siswa belum memiliki kelas, tampilkan semua siswa
    if (!studentClassesResponse?.data || !Array.isArray(studentClassesResponse.data) || studentClassesResponse.data.length === 0) {
      return studentsResponse.data;
    }
    
    try {
      // Filter siswa yang belum memiliki kelas
      const assignedStudentIds = new Set(studentClassesResponse.data.map(sc => sc.student_id));
      const unassigned = studentsResponse.data.filter(student => !assignedStudentIds.has(student.id));
      return unassigned;
    } catch (error) {
      return studentsResponse.data; // Tampilkan semua siswa jika terjadi error
    }
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
    if (!selectedAcademicYear || !selectedLevel || !selectedClassroom || !selectedClassGroup || selectedStudents.length === 0) {
      showError('Harap lengkapi semua bidang dan pilih setidaknya satu siswa.');
      return;
    }

    const toastId = showLoading('Menambahkan siswa ke kelas...');
    try {
      // Kirim data sebagai array student_id sesuai permintaan
      const payload = {
        academic_year_id: parseInt(selectedAcademicYear),
        education_id: parseInt(selectedLevel),
        student_id: selectedStudents, // Array of student IDs
        class_id: parseInt(selectedClassroom), // Using classroom ID instead of class group ID
        approval_status: 'diajukan', // Changed from 'pending' to 'diajukan'
      };

      // Note: You may need to update the API endpoint to handle array of student_ids
      // For now, we'll keep the individual calls as the mutation might not support bulk operations
      await Promise.all(
        selectedStudents.map(studentId =>
          createStudentClass({
            academic_year_id: parseInt(selectedAcademicYear),
            education_id: parseInt(selectedLevel),
            student_id: studentId,
            class_id: parseInt(selectedClassroom), // Using classroom ID instead of class group ID
            approval_status: 'diajukan', // Changed from 'pending' to 'diajukan'
          }).unwrap()
        )
      );
      dismissToast(toastId);
      showSuccess(`${selectedStudents.length} siswa berhasil ditambahkan ke kelas.`);
      onClose();
    } catch (error) {
      dismissToast(toastId);
      showError('Gagal menambahkan siswa. Silakan coba lagi.');
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
    if (!classroomsResponse?.data || !Array.isArray(classroomsResponse.data)) return null;
    return classroomsResponse.data.map(classroom => (
      <SelectItem key={classroom.id} value={classroom.id.toString()}>{classroom.name}</SelectItem>
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

            <div className="py-2">
              <p className="text-sm font-medium mb-2">Pilih Siswa (Siswa yang belum memiliki kelas)</p>
              <ScrollArea className="h-64 border rounded-md">
                <Table>
                  <TableHeader className="sticky top-0 bg-background">
                    <TableRow>
                      <TableHead className="w-12 py-2">
                        <Checkbox
                          onCheckedChange={handleSelectAll}
                          checked={selectedStudents.length > 0 && selectedStudents.length === unassignedStudents.length}
                          aria-label="Pilih semua"
                        />
                      </TableHead>
                      <TableHead className="py-2">Nama Siswa</TableHead>
                      <TableHead className="py-2">NIS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {unassignedStudents.length > 0 ? (
                      unassignedStudents.map(student => (
                        <TableRow key={student.id} className="h-10">
                          <TableCell className="py-1">
                            <Checkbox
                              checked={selectedStudents.includes(student.id)}
                              onCheckedChange={(checked) => handleSelectSingle(student.id, !!checked)}
                            />
                          </TableCell>
                          <TableCell className="py-1">{`${student.first_name} ${student.last_name || ''}`.trim()}</TableCell>
                          <TableCell className="py-1">{student.nis}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-4">
                          {studentsResponse?.data && studentsResponse.data.length > 0 
                            ? 'Semua siswa sudah memiliki kelas.' 
                            : 'Tidak ada data siswa yang tersedia.'
                          }
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
          <Button onClick={handleSubmit} disabled={isCreating || isLoading}>
            {isCreating ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TambahKenaikanKelasForm;