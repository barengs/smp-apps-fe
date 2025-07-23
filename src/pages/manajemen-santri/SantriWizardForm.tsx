import React, { useState } from 'react';
import { toast } from '@/utils/toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import ParentFormStep, { parentFormSchema } from './ParentFormStep';
import StudentFormStep, { studentFormSchema } from './StudentFormStep';
import ConfirmationStep from './ConfirmationStep';
import { useCreateParentMutation, type CreateUpdateParentRequest } from '@/store/slices/parentApi';
import { useCreateStudentMutation, type CreateUpdateStudentRequest } from '@/store/slices/studentApi';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { SerializedError } from '@reduxjs/toolkit';
import * as z from 'zod';
import { format } from 'date-fns';

type ParentData = z.infer<typeof parentFormSchema>;
type StudentData = z.infer<typeof studentFormSchema>;

interface SantriWizardFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const SantriWizardForm: React.FC<SantriWizardFormProps> = ({ onSuccess, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [parentFormData, setParentFormData] = useState<Partial<ParentData>>({});
  const [studentFormData, setStudentFormData] = useState<Partial<StudentData>>({});

  const [createParent, { isLoading: isCreatingParent }] = useCreateParentMutation();
  const [createStudent, { isLoading: isCreatingStudent }] = useCreateStudentMutation();

  const isSubmitting = isCreatingParent || isCreatingStudent;

  const handleParentSubmit = (data: ParentData) => {
    setParentFormData(data);
    setCurrentStep(2);
  };

  const handleStudentSubmit = (data: StudentData) => {
    setStudentFormData(data);
    setCurrentStep(3);
  };

  const handleConfirmSubmit = async () => {
    const loadingToast = toast.loading('Menyimpan data santri dan wali...');

    try {
      // Simulate file upload for parent photo
      let parentPhotoUrl: string | null = null;
      if (parentFormData.photo instanceof File) {
        const fileToUpload = parentFormData.photo;
        // In a real application, you would upload this file to a storage service (e.g., S3, Cloudinary)
        // and get a URL back. For this simulation, we'll just use a placeholder.
        console.log(`Simulating upload of parent file: ${fileToUpload.name}`);
        parentPhotoUrl = 'https://via.placeholder.com/150/0000FF/FFFFFF?text=UploadedParent';
      } else if (typeof parentFormData.photo === 'string') {
        parentPhotoUrl = parentFormData.photo;
      }

      // 1. Create Parent
      const parentPayload: CreateUpdateParentRequest = {
        first_name: parentFormData.first_name!,
        last_name: parentFormData.last_name,
        email: parentFormData.email!,
        kk: parentFormData.kk!,
        nik: parentFormData.nik!,
        gender: parentFormData.gender!,
        parent_as: parentFormData.parent_as!,
        phone: parentFormData.phone,
        card_address: parentFormData.card_address,
        photo: parentPhotoUrl,
      };
      const parentResponse = await createParent(parentPayload).unwrap();
      const newParentId = parentResponse.id;

      // Simulate file upload for student photo
      let studentPhotoUrl: string | null = null;
      if (studentFormData.photo instanceof File) {
        const fileToUpload = studentFormData.photo;
        console.log(`Simulating upload of student file: ${fileToUpload.name}`);
        studentPhotoUrl = 'https://via.placeholder.com/150/FF0000/FFFFFF?text=UploadedStudent';
      } else if (typeof studentFormData.photo === 'string') {
        studentPhotoUrl = studentFormData.photo;
      }

      // 2. Create Student, linking to the new parent
      const studentPayload: CreateUpdateStudentRequest = {
        first_name: studentFormData.first_name!,
        last_name: studentFormData.last_name,
        nis: studentFormData.nis!,
        nik: studentFormData.nik,
        period: studentFormData.period!,
        gender: studentFormData.gender!,
        status: studentFormData.status!,
        program_id: studentFormData.program_id!,
        born_in: studentFormData.born_in,
        born_at: studentFormData.born_at ? format(studentFormData.born_at, 'yyyy-MM-dd') : null,
        address: studentFormData.address,
        phone: studentFormData.phone,
        photo: studentPhotoUrl,
        parent_id: newParentId, // Link student to the newly created parent
      };
      await createStudent(studentPayload).unwrap();

      toast.dismiss(loadingToast);
      toast.success('Data santri dan wali berhasil ditambahkan!');
      onSuccess();
    } catch (err: unknown) {
      toast.dismiss(loadingToast);
      let errorMessage = 'Terjadi kesalahan tidak dikenal.';

      if (typeof err === 'object' && err !== null) {
        if ('status' in err) {
          const fetchError = err as FetchBaseQueryError;
          if (typeof fetchError.status === 'number') {
            if (fetchError.data && typeof fetchError.data === 'object' && 'message' in fetchError.data) {
              errorMessage = (fetchError.data as { message: string }).message;
            } else {
              errorMessage = `Error ${fetchError.status}: ${JSON.stringify(fetchError.data || {})}`;
            }
          } else if (typeof fetchError.status === 'string' && 'error' in fetchError) {
            errorMessage = fetchError.error;
          } else {
            errorMessage = `Error: ${JSON.stringify(err)}`;
          }
        } else if ('message' in err && typeof (err as SerializedError).message === 'string') {
          errorMessage = (err as SerializedError).message;
        } else {
          errorMessage = `Terjadi kesalahan: ${JSON.stringify(err)}`;
        }
      } else if (typeof err === 'string') {
        errorMessage = err;
      }

      toast.error(`Gagal menyimpan data: ${errorMessage}`);
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const progressValue = (currentStep / 3) * 100;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          {currentStep === 1 && 'Tambah Data Wali Santri'}
          {currentStep === 2 && 'Tambah Data Santri'}
          {currentStep === 3 && 'Konfirmasi Data'}
        </CardTitle>
        <CardDescription>
          Langkah {currentStep} dari 3
        </CardDescription>
        <Progress value={progressValue} className="w-full mt-4" />
      </CardHeader>
      <CardContent>
        {currentStep === 1 && (
          <ParentFormStep
            key="parent-step"
            initialData={parentFormData}
            onNext={handleParentSubmit}
            onCancel={onCancel}
            isSubmitting={isSubmitting}
          />
        )}
        {currentStep === 2 && (
          <StudentFormStep
            key="student-step"
            initialData={studentFormData}
            onBack={handleBack}
            onNext={handleStudentSubmit}
            isSubmitting={isSubmitting}
          />
        )}
        {currentStep === 3 && (
          <ConfirmationStep
            key="confirmation-step"
            parentData={parentFormData}
            studentData={studentFormData}
            onBack={handleBack}
            onSubmit={handleConfirmSubmit}
            isSubmitting={isSubmitting}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default SantriWizardForm;