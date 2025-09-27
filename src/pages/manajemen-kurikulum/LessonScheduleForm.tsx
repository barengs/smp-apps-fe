import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Trash2 } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';

// Import API hooks
import { useGetEducationLevelsQuery } from '@/store/slices/educationApi';
import { useGetClassroomsQuery } from '@/store/slices/classroomApi';
import { useGetClassGroupsQuery } from '@/store/slices/classGroupApi';
import { useGetTeacherAssignmentsQuery } from '@/store/slices/teacherAssignmentApi';
import { useGetLessonHoursQuery } from '@/store/slices/lessonHourApi';
import { useGetActiveTahunAjaranQuery } from '@/store/slices/tahunAjaranApi';
import { useCreateClassScheduleMutation, type CreateClassScheduleRequest } from '@/store/slices/classScheduleApi';

interface LessonScheduleDetail {
  day: string;
  classroomId: string;
  classGroupId: string;
  lessonHourId: string;
  teacherId: string;
  subjectId: string;
  meetingCount: number;
}

interface LessonScheduleFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const LessonScheduleForm: React.FC<LessonScheduleFormProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const [createClassSchedule, { isLoading: isCreating }] = useCreateClassScheduleMutation();

  // Form state
  const [educationLevelId, setEducationLevelId] = useState<string>('');
  const [session, setSession] = useState<string>('');
  const [details, setDetails] = useState<LessonScheduleDetail[]>([{ day: '', classroomId: '', classGroupId: '', lessonHourId: '', teacherId: '', subjectId: '', meetingCount: 16 }]);

  // Fetch data for selects
  const { data: educationLevelsData } = useGetEducationLevelsQuery();
  const { data: classroomsData } = useGetClassroomsQuery();
  const { data: classGroupsData } = useGetClassGroupsQuery();
  const { data: teacherAssignmentsData } = useGetTeacherAssignmentsQuery();
  const { data: lessonHoursData } = useGetLessonHoursQuery();
  const { data: activeAcademicYear } = useGetActiveTahunAjaranQuery();

  const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
  const sessions = ['Pagi', 'Siang', 'Sore', 'Malam'];

  const handleDetailChange = (index: number, field: keyof LessonScheduleDetail, value: string | number) => {
    const newDetails = [...details];
    (newDetails[index] as any)[field] = value;
    // Reset class group when class changes
    if (field === 'classroomId') {
      newDetails[index].classGroupId = '';
    }
    // Reset subject when teacher changes
    if (field === 'teacherId') {
      newDetails[index].subjectId = '';
    }
    setDetails(newDetails);
  };

  const addDetailRow = () => {
    setDetails([...details, { day: '', classroomId: '', classGroupId: '', lessonHourId: '', teacherId: '', subjectId: '', meetingCount: 16 }]);
  };

  const removeDetailRow = (index: number) => {
    if (details.length > 1) {
      const newDetails = details.filter((_, i) => i !== index);
      setDetails(newDetails);
    } else {
      showError(t('lessonScheduleForm.error.mustHaveOneDetail'));
    }
  };

  const handleSubmit = async () => {
    if (!activeAcademicYear?.id || !educationLevelId || !session) {
      showError('Harap isi semua bidang yang diperlukan di header.');
      return;
    }

    const isDetailsInvalid = details.some(
      (d) => !d.classroomId || !d.classGroupId || !d.day || !d.lessonHourId || !d.teacherId || !d.subjectId
    );

    if (isDetailsInvalid) {
      showError('Harap isi semua bidang untuk setiap detail jadwal.');
      return;
    }

    const payload: CreateClassScheduleRequest = {
      academic_year_id: activeAcademicYear.id,
      education_id: parseInt(educationLevelId),
      session: session.toLowerCase(),
      status: 'active',
      details: details.map((detail) => ({
        classroom_id: parseInt(detail.classroomId),
        class_group_id: parseInt(detail.classGroupId),
        day: detail.day.toLowerCase(),
        lesson_hour_id: parseInt(detail.lessonHourId),
        teacher_id: parseInt(detail.teacherId),
        study_id: parseInt(detail.subjectId),
        meeting_count: detail.meetingCount,
      })),
    };

    try {
      await createClassSchedule(payload).unwrap();
      showSuccess(t('lessonScheduleForm.success.scheduleSaved'));
      onClose();
    } catch (error: any) {
      console.error('Gagal menyimpan jadwal:', error);
      showError(error?.data?.message || 'Gagal menyimpan jadwal.');
    }
  };

  useEffect(() => {
    if (isOpen) {
      setEducationLevelId('');
      setSession('');
      setDetails([{ day: '', classroomId: '', classGroupId: '', lessonHourId: '', teacherId: '', subjectId: '', meetingCount: 16 }]);
    }
  }, [isOpen]);

  // Helper function to format academic year display
  const formatAcademicYearDisplay = (academicYear: any) => {
    if (!academicYear) return 'Loading...';
    if (academicYear.year) {
      return academicYear.year;
    }
    return 'Loading...';
  };

  // Handle dialog close with proper cleanup
  const handleClose = () => {
    // Reset form state before closing
    setEducationLevelId('');
    setSession('');
    setDetails([{ day: '', classroomId: '', classGroupId: '', lessonHourId: '', teacherId: '', subjectId: '', meetingCount: 16 }]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-screen-xl">
        <DialogHeader>
          <DialogTitle>{t('lessonScheduleForm.title')}</DialogTitle>
          <DialogDescription>{t('lessonScheduleForm.description')}</DialogDescription>
        </DialogHeader>
        <div className="max-h-[calc(100vh-150px)] overflow-y-auto">
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl">
              <div>
                <Label htmlFor="academicYear">{t('sidebar.academicYear')}</Label>
                <Select value={activeAcademicYear?.id ? String(activeAcademicYear.id) : ''} disabled>
                  <SelectTrigger id="academicYear" className="w-full">
                    <SelectValue placeholder={formatAcademicYearDisplay(activeAcademicYear)} />
                  </SelectTrigger>
                  <SelectContent>
                    {activeAcademicYear && (
                      <SelectItem value={String(activeAcademicYear.id)}>
                        {formatAcademicYearDisplay(activeAcademicYear)}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="educationLevel">{t('lessonScheduleForm.educationLevel')}</Label>
                <Select value={educationLevelId} onValueChange={setEducationLevelId}>
                  <SelectTrigger id="educationLevel" className="w-full">
                    <SelectValue placeholder={t('lessonScheduleForm.selectEducationLevel')} />
                  </SelectTrigger>
                  <SelectContent>
                    {educationLevelsData?.data.map(level => (
                      <SelectItem key={level.id} value={String(level.id)}>{level.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="session">{t('lessonScheduleForm.session')}</Label>
                <Select value={session} onValueChange={setSession}>
                  <SelectTrigger id="session" className="w-full">
                    <SelectValue placeholder={t('lessonScheduleForm.selectSession')} />
                  </SelectTrigger>
                  <SelectContent>
                    {sessions.map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-4">
              <Label className="text-lg font-semibold">{t('lessonScheduleForm.detailsTitle')}</Label>
              <Table className="mt-2">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">No.</TableHead>
                    <TableHead>{t('lessonScheduleForm.day')}</TableHead>
                    <TableHead>{t('lessonScheduleForm.class')}</TableHead>
                    <TableHead>{t('lessonScheduleForm.classGroup')}</TableHead>
                    <TableHead>{t('lessonScheduleForm.lessonHour')}</TableHead>
                    <TableHead>{t('lessonScheduleForm.teacher')}</TableHead>
                    <TableHead>{t('lessonScheduleForm.subject')}</TableHead>
                    <TableHead>Jumlah Pertemuan</TableHead>
                    <TableHead className="text-right"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {details.map((detail, index) => {
                    // Filter class groups: convert classroom_id (string) to integer for comparison
                    const filteredClassGroups = classGroupsData?.data?.filter(
                      cg => parseInt(cg.classroom_id.toString()) === parseInt(detail.classroomId)
                    ) || [];

                    // Find the selected teacher to get their assigned studies
                    const selectedTeacher = teacherAssignmentsData?.data.find(
                      (teacher) => String(teacher.id) === detail.teacherId
                    );
                    const teacherStudies = selectedTeacher?.studies || [];

                    return (
                      <TableRow key={index}>
                        <TableCell className="py-1">{index + 1}.</TableCell>
                        <TableCell className="py-1 min-w-[150px]">
                          <Select
                            value={detail.day}
                            onValueChange={(value) => handleDetailChange(index, 'day', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={t('lessonScheduleForm.selectDay')} />
                            </SelectTrigger>
                            <SelectContent>
                              {days.map(d => (
                                <SelectItem key={d} value={d}>{d}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="py-1 min-w-[150px]">
                          <Select
                            value={detail.classroomId}
                            onValueChange={(value) => handleDetailChange(index, 'classroomId', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={t('lessonScheduleForm.selectClass')} />
                            </SelectTrigger>
                            <SelectContent>
                              {classroomsData?.data.map(classroom => (
                                <SelectItem key={classroom.id} value={String(classroom.id)}>{classroom.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="py-1 min-w-[150px]">
                          <Select
                            value={detail.classGroupId}
                            onValueChange={(value) => handleDetailChange(index, 'classGroupId', value)}
                            disabled={!detail.classroomId}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={t('lessonScheduleForm.selectClassGroup')} />
                            </SelectTrigger>
                            <SelectContent>
                              {filteredClassGroups.length > 0 ? (
                                filteredClassGroups.map(group => (
                                  <SelectItem key={group.id} value={String(group.id)}>{group.name}</SelectItem>
                                ))
                              ) : (
                                <SelectItem value="placeholder" disabled>
                                  {detail.classroomId ? 'Tidak ada rombel untuk kelas ini' : 'Pilih kelas terlebih dahulu'}
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="py-1 min-w-[150px]">
                          <Select
                            value={detail.lessonHourId}
                            onValueChange={(value) => handleDetailChange(index, 'lessonHourId', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={t('lessonScheduleForm.selectLessonHour')} />
                            </SelectTrigger>
                            <SelectContent>
                              {lessonHoursData?.map(lh => (
                                <SelectItem key={lh.id} value={String(lh.id)}>
                                  {lh.name || `${lh.start_time} - ${lh.end_time}`}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="py-1 min-w-[150px]">
                          <Select
                            value={detail.teacherId}
                            onValueChange={(value) => handleDetailChange(index, 'teacherId', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={t('lessonScheduleForm.selectTeacher')} />
                            </SelectTrigger>
                            <SelectContent>
                              {teacherAssignmentsData?.data.map(teacher => (
                                <SelectItem key={teacher.id} value={String(teacher.id)}>
                                  {`${teacher.first_name} ${teacher.last_name}`.trim()}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="py-1 min-w-[150px]">
                          <Select
                            value={detail.subjectId}
                            onValueChange={(value) => handleDetailChange(index, 'subjectId', value)}
                            disabled={!detail.teacherId}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={t('lessonScheduleForm.selectSubject')} />
                            </SelectTrigger>
                            <SelectContent>
                              {teacherStudies.length > 0 ? (
                                teacherStudies.map(study => (
                                  <SelectItem key={study.id} value={String(study.id)}>{study.name}</SelectItem>
                                ))
                              ) : (
                                <SelectItem value="placeholder" disabled>
                                  {detail.teacherId ? 'Guru ini tidak punya mapel' : 'Pilih guru terlebih dahulu'}
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="py-1 min-w-[120px]">
                          <input
                            type="number"
                            value={detail.meetingCount}
                            onChange={(e) => handleDetailChange(index, 'meetingCount', parseInt(e.target.value) || 16)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="1"
                            max="50"
                          />
                        </TableCell>
                        <TableCell className="text-right py-1">
                          <Button variant="ghost" size="icon" onClick={() => removeDetailRow(index)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              <Button variant="outline" size="sm" className="mt-2" onClick={addDetailRow}>
                <PlusCircle className="mr-2 h-4 w-4" />
                {t('lessonScheduleForm.addDetail')}
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>{t('cancelButton')}</Button>
          <Button onClick={handleSubmit} disabled={isCreating}>
            {isCreating ? 'Menyimpan...' : t('saveChanges')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LessonScheduleForm;