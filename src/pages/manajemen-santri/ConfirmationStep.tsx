import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import type { parentFormSchema } from './ParentFormStep';
import type { studentFormSchema } from './StudentFormStep';
import * as z from 'zod';
import SelectedPhotoCard from '@/components/SelectedPhotoCard';

type ParentData = z.infer<typeof parentFormSchema>;
type StudentData = z.infer<typeof studentFormSchema>;

interface ConfirmationStepProps {
  parentData: Partial<ParentData>;
  studentData: Partial<StudentData>;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

const DetailRow: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) => (
  <div className="grid grid-cols-[120px_1fr] items-center gap-x-4 py-1 border-b last:border-b-0">
    <span className="font-semibold text-gray-700 text-sm">{label}:</span>
    <span className="text-gray-900 text-sm break-words">{value || '-'}</span>
  </div>
);

const ConfirmationStep: React.FC<ConfirmationStepProps> = ({ parentData, studentData, onBack, onSubmit, isSubmitting }) => {
  const parentPhotoFile = parentData.photo instanceof File ? parentData.photo : null;
  const parentPhotoUrl = typeof parentData.photo === 'string' ? parentData.photo : null;

  const studentPhotoFile = studentData.photo instanceof File ? studentData.photo : null;
  const studentPhotoUrl = typeof studentData.photo === 'string' ? studentData.photo : null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Data Wali Santri</CardTitle>
          <CardDescription>Pastikan semua informasi wali santri sudah benar.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 flex flex-col items-center">
            <SelectedPhotoCard photoFile={parentPhotoFile} photoUrl={parentPhotoUrl} name="Foto Wali" />
            <p className="mt-2 text-sm font-medium">{parentData.first_name} {parentData.last_name}</p>
          </div>
          <div className="lg:col-span-2 space-y-2">
            <DetailRow label="Nama Lengkap" value={`${parentData.first_name} ${parentData.last_name || ''}`.trim()} />
            <DetailRow label="Email" value={parentData.email} />
            <DetailRow label="No. KK" value={parentData.kk} />
            <DetailRow label="NIK" value={parentData.nik} />
            <DetailRow label="Jenis Kelamin" value={parentData.gender === 'L' ? 'Laki-Laki' : 'Perempuan'} />
            <DetailRow label="Status Wali" value={parentData.parent_as} />
            <DetailRow label="Telepon" value={parentData.phone} />
            <DetailRow label="Alamat KTP" value={parentData.card_address} />
            <DetailRow label="Alamat Domisili" value={parentData.domicile_address} />
            <DetailRow label="Pekerjaan" value={parentData.occupation} />
            <DetailRow label="Pendidikan" value={parentData.education} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Santri Baru</CardTitle>
          <CardDescription>Pastikan semua informasi santri baru sudah benar.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 flex flex-col items-center">
            <SelectedPhotoCard photoFile={studentPhotoFile} photoUrl={studentPhotoUrl} name="Foto Santri" />
            <p className="mt-2 text-sm font-medium">{studentData.first_name} {studentData.last_name}</p>
          </div>
          <div className="lg:col-span-2 space-y-2">
            <DetailRow label="Nama Lengkap" value={`${studentData.first_name} ${studentData.last_name || ''}`.trim()} />
            <DetailRow label="NIS" value={studentData.nis} />
            <DetailRow label="NIK" value={studentData.nik} />
            <DetailRow label="Jenis Kelamin" value={studentData.gender === 'L' ? 'Laki-Laki' : 'Perempuan'} />
            <DetailRow label="Status" value={studentData.status} />
            <DetailRow label="Program" value={studentData.program_id ? `ID: ${studentData.program_id}` : '-'} /> {/* Program name will be fetched on display */}
            <DetailRow label="Periode" value={studentData.period} />
            <DetailRow label="Tempat Lahir" value={studentData.born_in} />
            <DetailRow label="Tanggal Lahir" value={studentData.born_at ? format(studentData.born_at, 'PPP', { locale: localeId }) : '-'} />
            <DetailRow label="Alamat" value={studentData.address} />
            <DetailRow label="Telepon" value={studentData.phone} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>
          Kembali
        </Button>
        <Button type="button" onClick={onSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'Mengirim Data...' : 'Konfirmasi & Tambah Santri'}
        </Button>
      </div>
    </div>
  );
};

export default ConfirmationStep;