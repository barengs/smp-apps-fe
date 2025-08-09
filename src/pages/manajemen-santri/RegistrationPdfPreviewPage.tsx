import React from 'react';
import { useParams } from 'react-router-dom';
import RegistrationFormPdf from '@/components/RegistrationFormPdf';
import { useGetCalonSantriByIdQuery } from '@/store/slices/calonSantriApi';

const RegistrationPdfPreviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const santriId = Number(id);

  const { data: apiResponse, isLoading, isError } = useGetCalonSantriByIdQuery(santriId);
  const calonSantri = apiResponse?.data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 text-gray-700">
        Memuat pratinjau formulir...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 text-red-500">
        Terjadi kesalahan saat memuat data formulir.
      </div>
    );
  } // Syntax error fixed here

  if (!calonSantri) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 text-gray-500">
        Data calon santri tidak ditemukan.
      </div>
    );
  }

  return (
    <div className="flex justify-center p-4 bg-gray-100 min-h-screen">
      <RegistrationFormPdf calonSantri={calonSantri} />
    </div>
  );
};

export default RegistrationPdfPreviewPage;