import React from 'react';
import { BookOpenText, User } from 'lucide-react';

// Tipe data untuk properti santri
interface SantriData {
  photo?: string | null;
  first_name: string;
  last_name: string | null;
  nis: string;
  gender: 'L' | 'P';
  born_in?: string;
  born_at?: string;
  program: { name: string };
  status: string;
}

interface SantriCardProps {
  santri: SantriData;
}

const BASE_IMAGE_URL = "https://api.smp.barengsaya.com/storage/";

// Menggunakan React.forwardRef untuk meneruskan ref ke komponen
const SantriCard = React.forwardRef<HTMLDivElement, SantriCardProps>(({ santri }, ref) => {
  const fullName = `${santri.first_name} ${santri.last_name || ''}`.trim();
  const placeOfBirth = santri.born_in || '-';
  const dateOfBirth = santri.born_at ? new Date(santri.born_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '-';
  const gender = santri.gender === 'L' ? 'Laki-Laki' : 'Perempuan';

  const santriPhotoUrl = santri.photo ? `${BASE_IMAGE_URL}${santri.photo}` : null;

  return (
    // Ukuran kartu standar ID-1 (seperti kartu kredit)
    <div ref={ref} className="w-[85.6mm] h-[53.98mm] bg-white border border-gray-300 rounded-lg shadow-lg p-3 flex flex-col font-sans text-black">
      {/* Header Kartu */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-1 mb-2">
        <div className="flex items-center">
          <BookOpenText className="h-6 w-6 mr-2 text-blue-600" />
          <span className="text-xs font-bold text-blue-700">Pesantren Digital</span>
        </div>
        <h2 className="text-sm font-semibold text-gray-800">Kartu Tanda Santri</h2>
      </div>

      {/* Body Kartu */}
      <div className="flex flex-grow items-center space-x-3">
        {/* Foto Santri */}
        <div className="w-[25mm] h-[35mm] flex items-center justify-center border border-gray-200 rounded-sm p-0.5">
          {santriPhotoUrl ? (
            <img src={santriPhotoUrl} alt={fullName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-sm">
              <User className="h-10 w-10 text-gray-400" />
            </div>
          )}
        </div>

        {/* Detail Data Santri */}
        <div className="w-2/3 text-[9px] leading-snug space-y-1">
          <div className="grid grid-cols-[50px_auto]">
            <span className="font-semibold">Nama</span>
            <span className="truncate">: {fullName}</span>
          </div>
          <div className="grid grid-cols-[50px_auto]">
            <span className="font-semibold">NIS</span>
            <span>: {santri.nis}</span>
          </div>
          <div className="grid grid-cols-[50px_auto]">
            <span className="font-semibold">J. Kelamin</span>
            <span>: {gender}</span>
          </div>
          <div className="grid grid-cols-[50px_auto]">
            <span className="font-semibold">TTL</span>
            <span className="truncate">: {placeOfBirth}, {dateOfBirth}</span>
          </div>
          <div className="grid grid-cols-[50px_auto]">
            <span className="font-semibold">Program</span>
            <span className="truncate">: {santri.program?.name || '-'}</span>
          </div>
          <div className="grid grid-cols-[50px_auto]">
            <span className="font-semibold">Status</span>
            <span>: {santri.status}</span>
          </div>
        </div>
      </div>
    </div>
  );
});

export default SantriCard;