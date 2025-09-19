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
import { useGetStudiesQuery } from '@/store/slices/studyApi';
import { useGetTeachersQuery } from '@/store/slices/teacherApi';
import { useGetLessonHoursQuery } from '@/store/slices/lessonHourApi';
import { useGetActiveTahunAjaranQuery } from '@/store/slices/tahunAjaranApi';

interface LessonScheduleDetail {
  day: string;
  classroomId: string;
  classGroupId: string;
  lessonHourId: string;
  teacherId: string;
  subjectId: string;
}

interface LessonScheduleFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const LessonScheduleForm: React.FC<LessonScheduleFormProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();

  // Form state
  const [educationLevelId, setEducationLevelId] = useState<string>('');
  const [session, setSession] = useState<string>('');
  const [details, setDetails] = useState<LessonScheduleDetail[]>([{ day: '', classroomId: '', classGroupId: '', lessonHourId: '', teacherId: '', subjectId: '' }]);

  // Fetch data for selects
  const { data: educationLevelsData } = useGetEducationLevelsQuery();
  const { data: classroomsData } = useGetClassroomsQuery();
  const { data: classGroupsData } = useGetClassGroupsQuery();
  const { data: studiesData } = useGetStudiesQuery();
  const { data: teachersData } = useGetTeachersQuery();
  const { data: lessonHoursData } = useGetLessonHoursQuery();
  const { data: activeAcademicYear } = useGetActiveTahunAjaranQuery();

  const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
  const sessions = ['Pagi', 'Siang', 'Sore', 'Malam'];

  const handleDetailChange = (index: number, field: keyof LessonScheduleDetail, value: string) => {
    const newDetails = [...details];
    newDetails[index][field] = value;
    // Reset class group when class changes
    if (field === 'classroomId') {
      newDetails[index].classGroupId = '';
    }
    setDetails(newDetails);
  };

  const addDetailRow = () => {
    setDetails([...details, { day: '', classroomId: '', classGroupId: '', lessonHourId: '', teacherId: '', subjectId: '' }]);
  };

  const removeDetailRow = (index: number) => {
    if (details.length > 1) {
      const newDetails = details.filter((_, i) => i !== index);
      setDetails(newDetails);
    } else {
      showError(t('lessonScheduleForm.error.mustHaveOneDetail'));
    }
  };

  const handleSubmit = () => {
    const formData = {
      educationLevelId,
      session,
      academicYearId: activeAcademicYear?.id,
      details,
    };
    console.log('Form Submitted:', formData);
    showSuccess(t('lessonScheduleForm.success.scheduleSaved'));
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      setEducationLevelId('');
      setSession('');
      setDetails([{ day: '', classroomId: '', classGroupId: '', lessonHourId: '', teacherId: '', subjectId: '' }]);
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
                    <TableHead className="text-right"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {details.map((detail, index) => {
                    // Debug: Log the data to check the structure and filtering
                    console.log('=== DEBUG Rombel ===');
                    console.log('Current classroomId (selected):', detail.classroomId, 'type:', typeof detail.classroomId);
                    console.log('All classGroupsData:', classGroupsData?.data);
                    
                    // Filter class groups based on classroom_id (number) vs classroomId (string)
                    const filteredClassGroups = classGroupsData?.data?.filter(
                      cg => {
                        const match = cg.classroom_id === parseInt(detail.classroomId);
                        console.log(`Checking cg.classroom_id: "${cg.classroom_id}" === "${detail.classroomId}" : ${match}`);
                        return match;
                      }
                    ) || [];

                    console.log('Filtered class groups result:', filteredClassGroups);

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
                              {teachersData?.data.map(teacher => (
                                <SelectItem key={teacher.id} value={String(teacher.id)}>{teacher.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="py-1 min-w-[150px]">
                          <Select
                            value={detail.subjectId}
                            onValueChange={(value) => handleDetailChange(index, 'subjectId', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={t('lessonScheduleForm.selectSubject')} />
                            </SelectTrigger>
                            <SelectContent>
                              {studiesData?.map(study => (
                                <SelectItem key={study.id} value={String(study.id)}>{study.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
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
          <Button variant="outline" onClick={onClose}>{t('cancelButton')}</Button>
          <Button onClick={handleSubmit}>{t('saveChanges')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LessonScheduleForm;