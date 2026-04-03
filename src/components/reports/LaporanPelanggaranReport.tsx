import React from 'react';
import { ReportKopSurat } from '../ReportKopSurat';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface LaporanPelanggaranReportProps {
  data: {
    stats: Array<{ name: string; count: number }>;
    list: Array<{
      id: number;
      violation_date: string;
      description: string;
      student: {
        first_name: string;
        last_name: string;
        nis: string;
        hostel?: { name: string };
      };
      violation: {
        name: string;
        category: {
          name: string;
          severity_level: string;
        };
      };
    }>;
  };
  dateRange: {
    start_date: string;
    end_date: string;
  };
}

export const LaporanPelanggaranReport = React.forwardRef<HTMLDivElement, LaporanPelanggaranReportProps>(({ data, dateRange }, ref) => {
  const getSeverityColor = (level?: any) => {
    const levelStr = String(level || '').toLowerCase();
    switch (levelStr) {
      case 'berat': return 'destructive';
      case 'sedang': return 'warning';
      case 'ringan': return 'secondary';
      default: return 'outline';
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div ref={ref} className="p-8 bg-white text-black min-h-screen printable-area print:p-0 font-serif">
      <div className="print:p-4 flex flex-col min-h-screen">
        <ReportKopSurat />
        
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold uppercase tracking-wide">Laporan Kedisiplinan Santri</h1>
          <p className="text-lg">Periode: {formatDate(dateRange.start_date)} s/d {formatDate(dateRange.end_date)}</p>
          <p className="text-sm text-gray-500">Dicetak pada: {new Date().toLocaleString('id-ID')}</p>
        </div>

        {/* Detailed Table */}
        <div className="border rounded-lg overflow-hidden mb-8 break-inside-avoid">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="py-2 px-3 text-left text-[10px] font-bold uppercase w-20">Tanggal</th>
                <th className="py-2 px-3 text-left text-[10px] font-bold uppercase">Santri</th>
                <th className="py-2 px-3 text-left text-[10px] font-bold uppercase w-24">Asrama</th>
                <th className="py-2 px-3 text-left text-[10px] font-bold uppercase">Pelanggaran</th>
                <th className="py-2 px-3 text-left text-[10px] font-bold uppercase w-28">Kategori</th>
              </tr>
            </thead>
            <tbody>
              {data.list.map((item, i) => (
                <tr key={i} className="border-b break-inside-avoid">
                  <td className="py-2 px-3 text-[10px] whitespace-nowrap">
                    {formatDate(item.violation_date)}
                  </td>
                  <td className="py-2 px-3 text-[10px]">
                    <div className="font-bold">{item.student.first_name} {item.student.last_name}</div>
                    <div className="text-gray-500 italic">NIS: {item.student.nis}</div>
                  </td>
                  <td className="py-2 px-3 text-[10px]">
                    {item.student.hostel?.name || '-'}
                  </td>
                  <td className="py-2 px-3 text-[10px]">
                    <div className="font-bold">{item.violation.name}</div>
                    <div className="text-gray-500 line-clamp-1">{item.description}</div>
                  </td>
                  <td className="py-2 px-3 text-[10px]">
                    <div className="flex flex-col gap-1">
                      <span>{item.violation.category.name}</span>
                      <span className={`text-[8px] font-bold px-1 py-0.5 rounded border w-fit uppercase ${
                        String(item.violation.category.severity_level || '').toLowerCase() === 'berat' ? 'bg-red-50 text-red-700 border-red-200' :
                        String(item.violation.category.severity_level || '').toLowerCase() === 'sedang' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                        'bg-gray-50 text-gray-700 border-gray-200'
                      }`}>
                        {String(item.violation.category.severity_level || '')}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
              {data.list.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400 italic text-sm">
                    Tidak ada catatan pelanggaran ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-12 flex justify-between break-inside-avoid">
          <div className="text-center w-48">
            {/* Empat area ttd jika diperlukan */}
          </div>
          <div className="text-center w-64">
            <p className="mb-16">Pamekasan, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p className="mb-16 italic text-gray-400 font-light text-xs">Tanda Tangan & Stempel</p>
            <div className="border-b border-black w-full" />
            <p className="mt-2 text-sm font-bold uppercase">Ust. Muhsin Al-Katiri</p>
            <p className="text-xs text-gray-500 text-center">Kepala Bagian Keamanan</p>
          </div>
        </div>

        <div className="mt-auto pt-10 text-[10px] text-gray-400 border-t flex justify-between print:fixed print:bottom-8 print:left-8 print:right-8">
          <span>Laporan Internal Pesantren - Bidang Keamanan & Ketertiban (KAMTIB)</span>
          <span>SIAP Versi 2.4.0</span>
        </div>
      </div>
    </div>
  );
});

LaporanPelanggaranReport.displayName = 'LaporanPelanggaranReport';
