import React, { useEffect, useState } from 'react';

interface DebitStudentCardProps {
  student: {
    name: string;
    nis: string;
    birth_place: string;
    birth_date: string;
    address: string;
    village: string;
    photo: string | null;
  };
  cardData: {
    card_number: string;
  };
  templates: {
    front: string | null;
    back: string | null;
    stamp: string | null;
    signature: string | null;
  };
}

const DebitStudentCard: React.FC<DebitStudentCardProps> = ({ student, cardData, templates }) => {
  const STORAGE_BASE_URL = import.meta.env.VITE_STORAGE_BASE_URL;
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  useEffect(() => {
    const generateQr = async () => {
      if (!cardData.card_number) return;
      try {
        const { default: QRCode } = await import('qrcode');
        const url = await QRCode.toDataURL(cardData.card_number, {
          errorCorrectionLevel: 'M',
          margin: 0,
          width: 200, // Generate larger for high quality, display small
        });
        setQrCodeUrl(url);
      } catch (err) {
        console.error("Failed to generate QR", err);
      }
    };
    generateQr();
  }, [cardData.card_number]);

  // Format Date: DD MMMM YYYY
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    // Handle specific format if needed, but assuming ISO string or similar
    // Try native format or manual map
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Fallback
    
    // Indonesian months manually to ensure consistency if locale not available
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const today = new Date();
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const printDate = `Pamekasan, ${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`;

  // Card dimensions for ID-1 (Debit Card): 85.60mm x 53.98mm
  // We'll use CSS pixels. 1mm approx 3.78px @ 96dpi, but for print we might want higher res scale.
  // Standard print usually handles styles. 
  // Let's stick to standard aspect ratio. 
  // 323px x 204px is too small for screen preview, let's double it: 646x408 or so.
  // But for actual print, we rely on @media print.

  return (
    <div className="w-[85.6mm] h-[53.98mm] relative overflow-hidden text-black font-sans bg-white shadow-lg mx-auto print:shadow-none print:break-inside-avoid" style={{ backgroundImage: `url(${STORAGE_BASE_URL}${templates.front})`, backgroundSize: 'cover', backgroundPosition: 'center', printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact' }}>
      
      {/* Container Content */}
      <div className="absolute top-[33%] left-[4.5%] w-[91%] h-[63%] flex">
        
        {/* Left: Photo */}
        <div className="w-[19%] h-auto flex flex-col items-center pt-0.5">
            <div className="w-full aspect-[3/4] bg-gray-200 border-[1px] border-white overflow-hidden shadow-sm">
                 {student.photo ? (
                    <img 
                        src={`${STORAGE_BASE_URL}${student.photo}`} 
                        alt="Foto Santri" 
                        className="w-full h-full object-cover" 
                    />
                 ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-[5px] text-gray-400">No Photo</div>
                 )}
            </div>
        </div>

        {/* Right: Data */}
        <div className="w-[81%] pl-3 flex flex-col justify-start">
             {/* Data Rows - Compact */}
             <div className="text-[7.5px] leading-[1.3] font-bold text-gray-800 space-y-[0.5px]">
                <div className="flex items-start">
                    <span className="w-[35px] shrink-0">NIS</span>
                    <span className="mr-1 shrink-0">:</span>
                    <span className="uppercase">{student.nis}</span>
                </div>
                <div className="flex items-start">
                    <span className="w-[35px] shrink-0">NAMA</span>
                    <span className="mr-1 shrink-0">:</span>
                    <span className="uppercase font-black tracking-wide text-[8.5px]">{student.name}</span>
                </div>
                <div className="flex items-start">
                    <span className="w-[35px] shrink-0">TTL</span>
                    <span className="mr-1 shrink-0">:</span>
                    <span className="uppercase leading-[1.1]">{student.birth_place}, {formatDate(student.birth_date)}</span>
                </div>
                <div className="flex items-start">
                    <span className="w-[35px] shrink-0">ALAMAT</span>
                    <span className="mr-1 shrink-0">:</span>
                    <span className="uppercase leading-[1.1] text-[7px]">{student.address} {student.village ? `, ${student.village}` : ''}</span>
                </div>
             </div>

             {/* Bottom Section: Date, Signature, QR */}
             <div className="mt-auto flex justify-between items-end pb-1 w-full relative">
                
                {/* Signature Block */}
                <div className="text-[8px] text-center relative ml-4">
                    <div className="mb-8 font-medium">{printDate}</div>
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-12 flex items-center justify-center pointer-events-none">
                         {/* Stamp Layer */}
                         {templates.stamp && (
                             <img src={`${STORAGE_BASE_URL}${templates.stamp}`} className="absolute w-12 h-12 opacity-80 mix-blend-multiply" alt="Stamp" />
                         )}
                         {/* Signature Layer */}
                         {templates.signature && (
                             <img src={`${STORAGE_BASE_URL}${templates.signature}`} className="absolute w-28 h-14 z-10" alt="Sign" />
                         )}
                    </div>
                    <div className="relative z-20">
                        <div className="font-semibold mb-[1px]">Kepala Pesantren</div>
                        <div className="font-bold underline decoration-1">KH. ACHMAD HUSAINI</div>
                    </div>
                </div>

                {/* QR Code */}
                <div className="bg-white p-[2px] rounded-sm ml-auto mr-1 shadow-sm">
                     {qrCodeUrl ? (
                         <img src={qrCodeUrl} alt="QR Code" className="w-[50px] h-[50px] block" />
                     ) : (
                         <div className="w-[50px] h-[50px] bg-gray-200 text-[6px] flex items-center justify-center text-center">Loading...</div>
                     )}
                </div>
             </div>
        </div>
      </div>
    </div>
  );
};

export default DebitStudentCard;
