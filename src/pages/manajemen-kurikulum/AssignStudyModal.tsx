import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import MultiSelect, { Option } from '@/components/MultiSelect';
import { useGetStudiesQuery } from '@/store/slices/studyApi';
import { useAssignStudiesToStaffMutation } from '@/store/slices/teacherAssignmentApi';
import { Staff } from '@/types/teacherAssignment';
import * as toast from '@/utils/toast';
import { Loader2 } from 'lucide-react';

interface AssignStudyModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: Staff | null;
}

const FormSchema = z.object({
  studyIds: z.array(z.string()).min(1, 'Pilih setidaknya satu mata pelajaran.'),
});

const AssignStudyModal: React.FC<AssignStudyModalProps> = ({ isOpen, onClose, staff }) => {
  const { data: studiesData, isLoading: isLoadingStudies } = useGetStudiesQuery();
  const [assignStudies, { isLoading: isAssigning }] = useAssignStudiesToStaffMutation();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      studyIds: [],
    },
  });

  const studyOptions: Option[] = React.useMemo(() => {
    if (!studiesData) return [];
    return studiesData.map((study) => ({
      value: String(study.id),
      label: study.name,
    }));
  }, [studiesData]);

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    if (!staff) return;

    try {
      await assignStudies({ staffId: staff.id, studyIds: data.studyIds }).unwrap();
      toast.showSuccess('Mata pelajaran berhasil ditugaskan.');
      onClose();
      form.reset();
    } catch (error) {
      toast.showError('Gagal menugaskan mata pelajaran.');
      console.error('Failed to assign studies:', error);
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tugaskan Mata Pelajaran</DialogTitle>
          <DialogDescription>
            Pilih mata pelajaran yang akan diajarkan oleh {staff?.first_name} {staff?.last_name}.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="studyIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mata Pelajaran</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={studyOptions}
                      selected={field.value}
                      onChange={field.onChange}
                      placeholder="Pilih mata pelajaran..."
                      disabled={isLoadingStudies || isAssigning}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose} disabled={isAssigning}>
                Batal
              </Button>
              <Button type="submit" disabled={isAssigning}>
                {isAssigning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Simpan'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AssignStudyModal;