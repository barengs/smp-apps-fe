import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Trash2 } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';

// Import API hooks
import { useGetEducationLevelsQuery } from '@/store/slices/educationApi';
import { useGetClassroomsQuery } from '@/store/slices/classroomApi';
import { useGetClassGroupsQuery } from '@/store/slices/classGroupApi';
import { useGetStudiesQuery } from '@/store/slices/studyApi';

interface LessonScheduleDetail {
  lessonHour: string;
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
  const [classroomId, setClassroomId] = useState<string>('');
  const [classGroupId, setClassGroupId] = useState<string>('');
  const [day, setDay] = useState<string>('');
  const [session, setSession] = useState<string>('');
  const [details, setDetails] = useState<LessonScheduleDetail[]>([{ lessonHour: '', subjectId: '' }]);

  // Fetch data for selects
  const { data: educationLevelsData } = useGetEducationLevelsQuery();
  const { data: classroomsData } = useGetClassroomsQuery();
  const { data: classGroupsData } = useGetClassGroupsQuery();
  const { data: studiesData } = useGetStudiesQuery();

  const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
  const sessions = ['Pagi', 'Siang', 'Sore', 'Malam'];

  // Filter options based on selection
  const filteredClassGroups = classGroupsData?.data.filter(cg => cg.classroom_id === parseInt(classroomId));

  const handleDetailChange = (index: number, field: keyof LessonScheduleDetail, value: string) => {
    const newDetails = [...details];
    newDetails[index][field] = value;
    setDetails(newDetails);
  };

  const addDetailRow = () => {
    setDetails([...details, { lessonHour: '', subjectId: '' }]);
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
      classroomId,
      classGroupId,
      day,
      session,
      details,
    };
    console.log('Form Submitted:', formData);
    showSuccess(t('lessonScheduleForm.success.scheduleSaved'));
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      setEducationLevelId('');
      setClassroomId('');
      setClassGroupId('');
      setDay('');
      setSession('');
      setDetails([{ lessonHour: '', subjectId: '' }]);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-screen-xl">
        <DialogHeader>
          <DialogTitle>{t('lessonScheduleForm.title')}</DialogTitle>
          <DialogDescription>{t('lessonScheduleForm.description')}</DialogDescription>
        </DialogHeader>
        <div className="max-h-[calc(100vh-150px)] overflow-y-auto">
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="educationLevel">{t('lessonScheduleForm.educationLevel')}</Label>
                <Select value={educationLevelId} onValueChange={setEducationLevelId}>
                  <SelectTrigger id="educationLevel">
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
                <Label htmlFor="class">{t('lessonScheduleForm.class')}</Label>
                <Select value={classroomId} onValueChange={setClassroomId} disabled={!educationLevelId}>
                  <SelectTrigger id="class">
                    <SelectValue placeholder={t('lessonScheduleForm.selectClass')} />
                  </SelectTrigger>
                  <SelectContent>
                    {classroomsData?.data.map(classroom => (
                      <SelectItem key={classroom.id} value={String(classroom.id)}>{classroom.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="classGroup">{t('lessonScheduleForm.classGroup')}</Label>
                <Select value={classGroupId} onValueChange={setClassGroupId} disabled={!classroomId}>
                  <SelectTrigger id="classGroup">
                    <SelectValue placeholder={t('lessonScheduleForm.selectClassGroup')} />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredClassGroups?.map(group => (
                      <SelectItem key={group.id} value={String(group.id)}>{group.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="day">{t('lessonScheduleForm.day')}</Label>
                <Select value={day} onValueChange={setDay}>
                  <SelectTrigger id="day">
                    <SelectValue placeholder={t('lessonScheduleForm.selectDay')} />
                  </SelectTrigger>
                  <SelectContent>
                    {days.map(d => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="session">{t('lessonScheduleForm.session')}</Label>
                <Select value={session} onValueChange={setSession}>
                  <SelectTrigger id="session">
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
                    <TableHead className="w-[150px]">{t('lessonScheduleForm.lessonHour')}</TableHead>
                    <TableHead>{t('lessonScheduleForm.subject')}</TableHead>
                    <TableHead className="w-[50px] text-right"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {details.map((detail, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Input
                          type="number"
                          placeholder={t('lessonScheduleForm.lessonHourPlaceholder')}
                          value={detail.lessonHour}
                          onChange={(e) => handleDetailChange(index, 'lessonHour', e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
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
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => removeDetailRow(index)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
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