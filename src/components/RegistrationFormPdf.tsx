import React from 'react';
import { CalonSantri } from '@/types/calonSantri';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { BookOpenText, User, School, Home } from 'lucide-react';

interface RegistrationFormPdfProps {
  calonSantri: CalonSantri;
}

const BASE_IMAGE_URL = "https://api.smp.barengsaya.com/storage/";

const DetailRow: React.FC<{ label: string; value?: React.ReactNode; className?: string }> = ({ label, value, className }) => (
  <div className={`flex text-[10px] leading-tight ${className}`}>
    <span className="font-semibold w-[120px] shrink-0">{label}</span>
    <span className="flex-grow">: {value || '-'}</span>
  </div>
);

const RegistrationFormPdf = React.forwardRef<HTMLDivElement, RegistrationFormPdfProps>(({ calonSantri }, ref) => {
  const fullNameSantri = `${calonSantri.first_name} ${calonSantri.last_name || ''}`.trim();
  const genderSantri = calonSantri.gender === 'L' ? 'Laki-laki' : 'Perempuan';
  const formattedBornAt = calonSantri.born_at ? format(new Date(calonSantri.born_at), 'dd MMMM yyyy', { locale: id }) : '-';
  const formattedRegistrationDate = calonSantri.created_at ? format(new Date(calonSantri.created_at), 'dd MMMM yyyy', { locale: id }) : '-';

  const parentFullName = calonSantri.parent ? `${calonSantri.parent.first_name} ${calonSantri.parent.last_name || ''}`.trim() : '-';
  
  const santriPhotoUrl = calonSantri.photo ? `${BASE_IMAGE_URL}${calonSantri.photo}` : null;

  return (
    <div ref={ref} className="p-8 bg-white text-gray-900 font-sans" style={{ width: '210mm', minHeight: '297mm', margin: '0 auto' }}>
      {/* Header */}
      <div className="flex items-center justify-center mb-6 border-b-2 border-black pb-4">
        <BookOpenText className="h-12 w-12 mr-4 text-gray-800" />
        <div>
          <h1 className="text-2xl font-bold text-center">FORMULIR PENDAFTARAN</h1>
          <h2 className="text-xl font-semibold text-center">SANTRI BARU</h2>
        </div>
      </div>

      {/* Section 1: Santri Profile & Photo */}
      <div className="flex mb-6">
        <div className="w-[40mm] h-[50mm] flex-shrink-0 border-2 border-gray-400 rounded-md overflow-hidden mr-6 flex items-center justify-center bg-gray-100">
          {santriPhotoUrl ? (
            <img src={santriPhotoUrl} alt="Foto Santri" className="w-full h-full object-cover" />
          ) : (
            <User className="h-1/2 w-1/2 text-gray-400" />
          )}
        </div>
        <div className="flex-grow space-y-1.5">
          <h3 className="text-lg font-semibold mb-2 border-b border-gray-300 pb-1">DATA PRIBADI CALON SANTRI</h3>
          <DetailRow label="No. Pendaftaran" value={<span className="font-bold">{calonSantri.registration_number}</span>} />
          <DetailRow label="Tanggal Daftar" value={formattedRegistrationDate} />
          <DetailRow label="Nama Lengkap" value={fullNameSantri.toUpperCase()} />
          <DetailRow label="NISN" value={calonSantri.nisn || '-'} />
          <DetailRow label="NIK" value={calonSantri.nik} />
          <DetailRow label="Jenis Kelamin" value={genderSantri} />
          <DetailRow label="Tempat, Tgl Lahir" value={`${calonSantri.born_in}, ${formattedBornAt}`} />
          <DetailRow label="Alamat" value={calonSantri.address} />
          <DetailRow label="Telepon" value={calonSantri.phone || '-'} />
        </div>
      </div>

      {/* Section 2: Education Information */}
      <div className="mb-6 border-t pt-4">
        <h3 className="text-lg font-semibold mb-2 flex items-center border-b border-gray-300 pb-1">
          <School className="h-5 w-5 mr-2" /> INFORMASI PENDIDIKAN
        </h3>
        <div className="space-y-1.5">
          <DetailRow label="Asal Sekolah" value={calonSantri.previous_school} />
          <DetailRow label="Alamat Sekolah" value={calonSantri.previous_school_address || '-'} />
          <DetailRow label="No. Ijazah" value={calonSantri.certificate_number || '-'} />
        </div>
      </div>

      {/* Section 3: Parent Information */}
      {calonSantri.parent && (
        <div className="mb-6 border-t pt-4">
          <h3 className="text-lg font-semibold mb-2 flex items-center border-b border-gray-300 pb-1">
            <Home className="h-5 w-5 mr-2" /> DATA ORANG TUA / WALI
          </h3>
          <div className="space-y-1.5">
            <DetailRow label="Nama Lengkap" value={parentFullName} />
            <DetailRow label="Hubungan" value={calonSantri.parent.parent_as} />
            <DetailRow label="NIK" value={calonSantri.parent.nik} />
            <DetailRow label="No. KK" value={calonSantri.parent.kk} />
            <DetailRow label="Telepon" value={calonSantri.parent.phone || '-'} />
            <DetailRow label="Email" value={calonSantri.parent.email || '-'} />
            <DetailRow label="Pekerjaan" value={calonSantri.parent.occupation || '-'} />
            <DetailRow label="Pendidikan" value={calonSantri.parent.education || '-'} />
            <DetailRow label="Alamat Domisili" value={calonSantri.parent.domicile_address || '-'} />
          </div>
        </div>
      )}

      {/* Footer / Signature Area */}
      <div className="mt-16 text-sm">
        <div className="float-right w-1/3 text-center">
          <p>Hormat Kami,</p>
          <p className="mt-16">( Panitia Pendaftaran )</p>
        </div>
        <div className="float-left w-1/3 text-center">
          <p>Orang Tua / Wali,</p>
          <p className="mt-16">( {parentFullName} )</p>
        </div>
      </div>
    </div>
  );
});

export default RegistrationFormPdf;