import React, { useEffect, useState } from 'react';
import { useGetStudentCardSettingsQuery } from '@/store/slices/studentCardApi';

// Interface data wali santri untuk kartu
export interface WaliSantriCardData {
    photo?: string | null;
    first_name: string;
    last_name: string | null;
    nik: string;
    parent_as: string; // 'Ayah' | 'Ibu' | 'Wali'
    phone?: string | null;
    students?: Array<{
        nis: string;
        first_name: string;
        last_name: string | null;
    }>;
}

interface WaliSantriCardProps {
    data: WaliSantriCardData;
    side?: 'front' | 'back';
}

const WaliSantriCard = React.forwardRef<HTMLDivElement, WaliSantriCardProps>(
    ({ data, side = 'front' }, ref) => {
        const STORAGE_BASE_URL = import.meta.env.VITE_STORAGE_BASE_URL as string;
        const [qrDataUrl, setQrDataUrl] = useState<string>('');

        // Ambil pengaturan kartu dari database (sama seperti SantriCard)
        const { data: settingsResponse } = useGetStudentCardSettingsQuery();
        const templates = settingsResponse?.data;

        const fullName = `${data.first_name} ${data.last_name || ''}`.trim().toUpperCase();

        const photoUrl = data.photo
            ? data.photo.startsWith('http')
                ? data.photo
                : `${STORAGE_BASE_URL}${data.photo}`
            : null;

        // Generate QR dari NIK wali santri
        useEffect(() => {
            const value = String(data.nik || '').trim();
            if (!value) return;
            (async () => {
                try {
                    const { default: QRCode } = await import('qrcode');
                    const url = await QRCode.toDataURL(value, {
                        errorCorrectionLevel: 'M',
                        margin: 0,
                        width: 200,
                    });
                    setQrDataUrl(url);
                } catch (err) {
                    console.error('QR Generation failed', err);
                }
            })();
        }, [data.nik]);

        const today = new Date();
        const months = [
            'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
        ];
        const printDate = `Pamekasan, ${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`;

        if (side === 'back') {
            return (
                <div
                    ref={ref}
                    className="w-[85.6mm] h-[53.98mm] relative overflow-hidden text-black font-sans bg-slate-100 shadow-lg mx-auto print:shadow-none print:break-inside-avoid"
                    style={{
                        backgroundImage: templates?.guardian_back_template
                            ? `url(${STORAGE_BASE_URL}${templates.guardian_back_template})`
                            : undefined,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        printColorAdjust: 'exact',
                        WebkitPrintColorAdjust: 'exact',
                    } as React.CSSProperties}
                >
                    {!templates?.guardian_back_template && <div className="absolute inset-0 bg-orange-50/10" />}
                    
                    {/* Dynamic QR for back side */}
                    <div className="absolute bottom-[10%] right-[8%] opacity-80">
                        {qrDataUrl && <img src={qrDataUrl} alt="QR Small" className="w-[35px] h-[35px]" />}
                    </div>
                </div>
            );
        }

        return (
            // ID-1 Card Size: 85.60 × 53.98 mm — identik dengan DebitStudentCard
            <div
                ref={ref}
                className="w-[85.6mm] h-[53.98mm] relative overflow-hidden text-black font-sans bg-slate-100 shadow-lg mx-auto print:shadow-none print:break-inside-avoid"
                style={{
                    backgroundImage: templates?.guardian_front_template
                        ? `url(${STORAGE_BASE_URL}${templates.guardian_front_template})`
                        : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    printColorAdjust: 'exact',
                    WebkitPrintColorAdjust: 'exact',
                } as React.CSSProperties}
            >
                {/* Container Content — layout identik dengan DebitStudentCard */}
                <div className="absolute top-[33%] left-[4.5%] w-[91%] h-[63%] flex">

                    {/* Left: Photo */}
                    <div className="w-[19%] h-auto flex flex-col items-center pt-0.5">
                        <div className="w-full aspect-[3/4] bg-gray-200 border-[1px] border-black overflow-hidden shadow-sm">
                            {photoUrl ? (
                                <img
                                    src={photoUrl}
                                    alt="Foto Wali"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-[5px] text-gray-400">
                                    No Photo
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Data Wali Santri */}
                    <div className="w-[81%] pl-3 flex flex-col justify-start">
                        {/* Data Rows */}
                        <div className="text-[7.5px] leading-[1.3] font-bold text-black space-y-[0.5px]">
                            <div className="flex items-start">
                                <span className="w-[35px] shrink-0">NIK</span>
                                <span className="mr-1 shrink-0">:</span>
                                <span className="uppercase">{data.nik}</span>
                            </div>
                            <div className="flex items-start">
                                <span className="w-[35px] shrink-0">NAMA</span>
                                <span className="mr-1 shrink-0">:</span>
                                <span className="uppercase font-black tracking-wide text-[8.5px]">{fullName}</span>
                            </div>
                            <div className="flex items-start">
                                <span className="w-[35px] shrink-0">STATUS</span>
                                <span className="mr-1 shrink-0">:</span>
                                <span className="uppercase">{data.parent_as || 'Wali Santri'}</span>
                            </div>
                            {data.phone && (
                                <div className="flex items-start">
                                    <span className="w-[35px] shrink-0">TELP</span>
                                    <span className="mr-1 shrink-0">:</span>
                                    <span>{data.phone}</span>
                                </div>
                            )}
                            {/* Daftar Santri */}
                            {data.students && data.students.length > 0 && (
                                <div className="flex items-start">
                                    <span className="w-[35px] shrink-0">SANTRI</span>
                                    <span className="mr-1 shrink-0">:</span>
                                    <span className="uppercase leading-[1.2] text-[6.5px]">
                                        {data.students.slice(0, 2).map((s, i) => (
                                            <span key={i}>
                                                {`${s.first_name} ${s.last_name || ''}`.trim()} ({s.nis})
                                                {i < Math.min(data.students!.length, 2) - 1 ? ', ' : ''}
                                            </span>
                                        ))}
                                        {data.students.length > 2 && (
                                            <span className="text-gray-600"> +{data.students.length - 2} lainnya</span>
                                        )}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Bottom Section: Tanggal, Tanda Tangan, Stempel, QR */}
                        <div className="mt-auto flex justify-between items-end pb-1 w-full relative">

                            {/* Signature Block */}
                            <div className="text-[8px] text-center relative ml-4">
                                <div className="mb-8 font-medium">{printDate}</div>
                                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-12 flex items-center justify-center pointer-events-none">
                                    {/* Stempel dari database settings */}
                                    {templates?.stamp && (
                                        <img
                                            src={`${STORAGE_BASE_URL}${templates.stamp}`}
                                            className="absolute w-12 h-12 opacity-80 mix-blend-multiply"
                                            alt="Stempel"
                                        />
                                    )}
                                    {/* Tanda tangan dari database settings */}
                                    {templates?.signature && (
                                        <img
                                            src={`${STORAGE_BASE_URL}${templates.signature}`}
                                            className="absolute w-28 h-14 z-10"
                                            alt="Tanda Tangan"
                                        />
                                    )}
                                </div>
                                <div className="relative z-20">
                                    <div className="font-semibold mb-[1px]">Ketua Umum Pengurus</div>
                                    <div className="font-bold underline decoration-1">
                                        {templates?.authorized_official 
                                            ? `${templates.authorized_official.first_name} ${templates.authorized_official.last_name || ''}`.trim()
                                            : 'Drs. KH. Moh. Noer Hidayat, M.Si.'}
                                    </div>
                                </div>
                            </div>

                            {/* QR Code dari NIK */}
                            <div className="bg-white p-[2px] rounded-sm ml-auto mr-1 shadow-sm">
                                {qrDataUrl ? (
                                    <img src={qrDataUrl} alt="QR NIK" className="w-[50px] h-[50px] block" />
                                ) : (
                                    <div className="w-[50px] h-[50px] bg-gray-200 text-[6px] flex items-center justify-center text-center">
                                        Loading...
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
);

WaliSantriCard.displayName = 'WaliSantriCard';

export default WaliSantriCard;
