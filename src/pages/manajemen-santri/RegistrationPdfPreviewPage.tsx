import React, { useRef } from 'react';
import { useParams } from 'react-router-dom';
import RegistrationFormPdf from '@/components/RegistrationFormPdf';
import { useGetCalonSantriByIdQuery } from '@/store/slices/calonSantriApi';
import { useReactToPrint } from 'react-to-print';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

const RegistrationPdfPreviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const santriId = Number(id);

  const { data: apiResponse, isLoading, isError } = useGetCalonSantriByIdQuery(santriId);
  const calonSantri = apiResponse?.data;

  const printComponentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    content: () => printComponentRef.current,
    documentTitle: `Formulir Pendaftaran - ${calonSantri?.first_name || 'Santri'}`,
    // onBeforeGetContent dihapus karena ref sekarang langsung ke komponen
  } as any);

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
  }

  if (!calonSantri) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 text-gray-500">
        Data calon santri tidak ditemukan.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-4 bg-gray-100 min-h-screen">
      <div className="w-[210mm] flex justify-end mb-4">
        <Button onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" /> Cetak Formulir
        </Button>
      </div>
      {/* Meneruskan ref langsung ke komponen RegistrationFormPdf */}
      <RegistrationFormPdf ref={printComponentRef} calonSantri={calonSantri} />
    </div>
  );
};

export default RegistrationPdfPreviewPage;