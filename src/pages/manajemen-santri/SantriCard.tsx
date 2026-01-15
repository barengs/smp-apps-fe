import React from 'react';
import { BookOpenText, User } from 'lucide-react';
import { toDataURL } from 'qrcode';

// Tipe data untuk properti santri
export interface SantriData {
  photo?: string | null;
  first_name: string;
  last_name: string | null;
  nis: string;
  gender: 'L' | 'P';
  born_in?: string;
  born_at?: string;
  program: { name: string };
  status: string;
  address?: string; // Add address
  village?: string;  // Add village
  district?: string; // Add district
}

interface SantriCardProps {
  santri: SantriData;
}

const BASE_IMAGE_URL = "https://api-smp.umediatama.com/storage/";

// Helper to format date
const formatDate = (dateString?: string) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

// Background Pattern Component
const CardBackground = () => (
  <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
    {/* Geometric subtle pattern - simplified implementation */}
    <div className="absolute inset-0 bg-white" />
    <svg width="100%" height="100%" className="absolute inset-0 opacity-10">
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="black" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
    
    {/* Top Right Yellow Accent */}
    <div className="absolute top-0 right-0 w-[50px] h-[40px] bg-yellow-400 transform skew-x-[-20deg] translate-x-4 -translate-y-0" />
    
    {/* Left Green Curve Accent */}
    <div className="absolute top-0 left-0 w-[80px] h-[80px] bg-[#004d40] rounded-br-[40px] -translate-x-4 -translate-y-4" />
    <div className="absolute top-0 left-0 w-[75px] h-[75px] border-4 border-white rounded-br-[40px] -translate-x-4 -translate-y-4" />
  </div>
);

const SantriCard = React.forwardRef<HTMLDivElement, SantriCardProps>(({ santri }, ref) => {
  const [qrDataUrl, setQrDataUrl] = React.useState<string | null>(null);
  
  const fullName = `${santri.first_name} ${santri.last_name || ''}`.trim().toUpperCase();
  const dateOfBirth = santri.born_at ? new Date(santri.born_at).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-') : '-';
  const placeOfBirth = santri.born_in || '-';
  const addressLine = santri.district ? `${santri.district}, Pamekasan` : 'Pamekasan';
  
  const santriPhotoUrl = santri.photo ? `${BASE_IMAGE_URL}${santri.photo}` : null;

  React.useEffect(() => {
    const value = String(santri.nis || '').trim();
    if (!value) {
      setQrDataUrl(null);
      return;
    }
    let mounted = true;
    (async () => {
      try {
        const QRCode = await import('qrcode');
        const url = await QRCode.toDataURL(value, { 
          errorCorrectionLevel: 'M', 
          margin: 1, 
          scale: 4,
          color: { dark: '#000000', light: '#ffffff' }
        });
        if (mounted) setQrDataUrl(url);
      } catch (err) {
        console.error("QR Generation failed", err);
      }
    })();
    return () => { mounted = false; };
  }, [santri.nis]);

  return (
    // ID-1 Card Size: 85.60 × 53.98 mm
    <div 
      ref={ref} 
      className="relative w-[85.6mm] h-[53.98mm] bg-white overflow-hidden font-sans text-[#004d40]"
      style={{ printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact' }}
    >
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        {/* Top Left Green Curve - Fixed Shape */}
        <div className="absolute top-0 left-0 w-[28mm] h-[28mm] bg-[#01342f] rounded-br-[20mm] z-10"></div>
        {/* White Border for Curve */}
        <div className="absolute top-0 left-0 w-[29mm] h-[29mm] border-r-[1mm] border-b-[1mm] border-white rounded-br-[21mm] z-0"></div>
        
        {/* Right Yellow Sidebar */}
        <div className="absolute top-[8mm] right-0 h-[10mm] w-[8mm] bg-[#fbbf24] z-0" style={{ transform: 'skewX(-15deg) translateX(4mm)' }}></div>
        <div className="absolute top-0 right-0 h-[53.98mm] w-[6px] bg-[#01342f] z-20"></div>

        {/* Diagonal Watermark Lines (Faint) */}
        <div className="absolute inset-0 opacity-[0.03] z-0" 
             style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 0, transparent 50%)', backgroundSize: '10px 10px' }}></div>
      </div>

      <div className="relative z-30 flex flex-col h-full p-[3mm]">
        {/* Header */}
        <div className="flex items-start mb-1 h-[14mm]">
            {/* Logo Area (Left) */}
             <div className="absolute top-[-1mm] left-[-0.5mm] w-[18mm] h-[18mm] flex items-center justify-center z-40">
                 <div className="bg-white rounded-full p-1 shadow-md w-[14mm] h-[14mm] flex items-center justify-center border border-gray-200">
                    <BookOpenText className="w-8 h-8 text-[#01342f]" />
                 </div>
             </div>

            {/* Header Text (Right of Logo) */}
            <div className="flex-1 ml-[20mm] text-left">
                <h1 className="text-[11pt] font-black text-[#01342f] leading-[0.9] tracking-tight mb-[2px]">KARTU TANDA SANTRI</h1>
                <div className="flex flex-col text-[#01342f]">
                    <span className="text-[9pt] font-serif leading-none text-right mr-4" dir="rtl">معهد مفتاح العلوم بانييبين الإسلامية</span>
                    <span className="text-[7pt] font-bold text-black leading-[1.1]">Pondok Pesantren Miftahul Ulum</span>
                    <span className="text-[7pt] font-bold text-black leading-[1.1]">Panyeppen Palengaan Pamekasan</span>
                    <div className="mt-[2px] border-b-2 border-[#fbbf24] w-fit pb-[1px]">
                         <span className="text-[4.5pt] text-gray-700 font-medium block">Jl. Poto'an Laok Palengaan KM. 11 Pamekasan 69362</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Content Body */}
        <div className="flex flex-1 mt-1 gap-3 relative">
            {/* Photo Column */}
            <div className="flex flex-col items-center ml-1">
                <div className="w-[19mm] h-[25mm] bg-gray-200 shadow-sm overflow-hidden mb-1 border border-gray-300">
                    {santriPhotoUrl ? (
                         <img src={santriPhotoUrl} alt="Foto" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                             <User className="w-8 h-8" />
                        </div>
                    )}
                </div>
                <div className="text-[4pt] font-bold text-center leading-tight text-gray-600 uppercase">
                    BERLAKU SELAMA <br/> MENJADI SANTRI
                </div>
            </div>

            {/* Details Column */}
            <div className="flex-1 flex flex-col pt-0.5 relative z-10">
                <div className="text-[10pt] font-bold text-gray-800 leading-none mb-1">{santri.nis}</div>
                <div className="text-[11pt] font-black text-[#1a1a1a] leading-none mb-1.5 uppercase tracking-wide">{fullName}</div>
                
                <div className="text-[8pt] font-medium text-gray-700 leading-snug space-y-0.5">
                     <div className="flex"><span className="w-[18mm]">Pamekasan,</span> <span>{dateOfBirth}</span></div>
                     <div className="flex"><span className="w-[18mm]">{addressLine}</span></div>
                </div>

                {/* Footer Signature & Date */}
                <div className="mt-auto flex items-end justify-between w-full pr-2">
                    {/* Signature Area */}
                    <div className="flex flex-col items-center w-32 relative">
                         <div className="text-[5pt] text-gray-600 mb-[1px]">Pamekasan, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                         <div className="text-[5pt] font-bold text-gray-700 mb-2 relative z-10">Ketua Umum Pengurus;</div>
                         
                         {/* Stamp under signature */}
                         <div className="absolute top-[8px] left-[10px] w-8 h-8 rounded-full border-2 border-blue-600 opacity-20 z-0"></div>

                         <div className="relative h-4 w-12 mb-0.5 z-10">
                             {/* Mock Signature */}
                             <svg viewBox="0 0 100 40" className="opacity-90 w-full h-full">
                                <path d="M5,25 Q30,10 50,25 T95,25" fill="none" stroke="black" strokeWidth="3" />
                                <path d="M15,30 Q40,20 65,35" fill="none" stroke="black" strokeWidth="2" />
                             </svg>
                         </div>

                         <div className="text-[5.5pt] font-bold text-gray-900 border-t border-gray-400 pt-[1px] w-full text-center">
                             Drs. KH. Moh. Noer Hidayat, M.Si.
                         </div>
                    </div>

                     {/* QR Code */}
                     <div className="w-[13mm] h-[13mm] bg-white p-0.5 rounded-sm border border-gray-200 shrink-0 mb-0.5 mr-2">
                         {qrDataUrl && <img src={qrDataUrl} alt="QR" className="w-full h-full" />}
                     </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
});

SantriCard.displayName = 'SantriCard';

export default SantriCard;