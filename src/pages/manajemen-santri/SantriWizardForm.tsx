import React, { useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import ParentFormStep, { parentFormSchema } from './ParentFormStep';
import StudentFormStep, { studentFormSchema } from './StudentFormStep';
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

  const handleStudentSubmit = async (data: StudentData) => {
    setStudentFormData(data);

    const loadingToast = toast.loading('Menyimpan data santri dan wali...');

    try {
      let parentPhotoUrl: string | null = null;
      if (parentFormData.photo instanceof File) {
        const fileToUpload = parentFormData.photo;
        // Simulate file upload and get a URL for parent photo
        parentPhotoUrl = await new Promise(resolve => setTimeout(() => {
          console.log(`Simulating upload of parent file: ${fileToUpload.name}`);
          resolve('https://via.placeholder.com/150/0000FF/FFFFFF?text=UploadedParent');
        }, 1500));
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
        photo: parentPhotoUrl, // Use the obtained URL for parent
      };
      const parentResponse = await createParent(parentPayload).unwrap();
      const newParentId = parentResponse.id; // Assuming API returns the ID of the new parent

      let studentPhotoUrl: string | null = null;
      if (data.photo instanceof File) {
        const fileToUpload = data.photo;
        // Simulate file upload and get a URL for student photo
        studentPhotoUrl = await new Promise(resolve => setTimeout(() => {
          console.log(`Simulating upload of student file: ${fileToUpload.name}`);
          resolve('https://via.placeholder.com/150/FF0000/FFFFFF?text=UploadedStudent');
        }, 1500));
      } else if (typeof data.photo === 'string') {
        studentPhotoUrl = data.photo;
      }

      // 2. Create Student, linking to the new parent
      const studentPayload: CreateUpdateStudentRequest = {
        first_name: data.first_name,
        last_name: data.last_name,
        nis: data.nis,
        nik: data.nik,
        period: data.period,
        gender: data.gender,
        status: data.status,
        program_id: data.program_id,
        born_in: data.born_in,
        born_at: data.born_at ? format(data.born_at, 'yyyy-MM-dd') : null,
        address: data.address,
        phone: data.phone,
        photo: studentPhotoUrl, // Use the processed URL for student
        // You might need to add a parent_id field to CreateUpdateStudentRequest
        // if the API expects it directly in the student creation payload.
        // For now, assuming a separate linking step or implicit linking.
        // If the API requires parent_id here, you'd add: parent_id: newParentId,
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
            errorMessage = `Error: ${JSON.stringify(fetchError)}`;
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

  const progressValue = (currentStep / 2) * 100;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          {currentStep === 1 ? 'Tambah Data Wali Santri' : 'Tambah Data Santri'}
        </CardTitle>
        <CardDescription>
          Langkah {currentStep} dari 2
        </CardDescription>
        <Progress value={progressValue} className="w-full mt-4" />
      </CardHeader>
      <CardContent>
        {currentStep === 1 && (
          <ParentFormStep
            initialData={parentFormData}
            onNext={handleParentSubmit}
            onCancel={onCancel}
            isSubmitting={isSubmitting}
          />
        )}
        {currentStep === 2 && (
          <StudentFormStep
            initialData={studentFormData}
            onBack={handleBack}
            onSubmit={handleStudentSubmit}
            isSubmitting={isSubmitting}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default SantriWizardForm;