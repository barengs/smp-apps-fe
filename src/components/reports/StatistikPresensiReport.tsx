import React from 'react';
import { ReportKopSurat } from '../ReportKopSurat';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface StatistikPresensiReportProps {
  data: {
    attendance: Array<{
      study_name: string;
      present: number;
      permit: number;
      sick: number;
      absent: number;
      total: number;
      percentage: number;
    }>;
  };
  dateRange: {
    start_date: string;
    end_date: string;
  };
}

export const StatistikPresensiReport = React.forwardRef<HTMLDivElement, StatistikPresensiReportProps>(({ data, dateRange }, ref) => {
  const getPercentageColorClass = (percent: number) => {
    if (percent >= 90) return 'text-green-700';
    if (percent >= 75) return 'text-orange-600';
    return 'text-red-600';
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
          <h1 className="text-2xl font-bold uppercase tracking-wide">Laporan Persentase Kehadiran Santri</h1>
          <p className="text-lg">Periode: {formatDate(dateRange.start_date)} s/d {formatDate(dateRange.end_date)}</p>
          <p className="text-sm text-gray-500">Dicetak pada: {new Date().toLocaleString('id-ID')}</p>
        </div>

        {/* Detailed Table */}
        <div className="border rounded-lg overflow-hidden mb-8 break-inside-avoid">
          <table className="w-full border-collapse text-[10px]">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="py-2 px-3 text-left font-bold uppercase">Mata Pelajaran / Bidang</th>
                <th className="py-2 px-3 text-right font-bold uppercase w-14">Hadir</th>
                <th className="py-2 px-3 text-right font-bold uppercase w-14">Izin</th>
                <th className="py-2 px-3 text-right font-bold uppercase w-14">Sakit</th>
                <th className="py-2 px-3 text-right font-bold uppercase w-14">Alfa</th>
                <th className="py-2 px-3 text-right font-bold uppercase w-16">Total Jam</th>
                <th className="py-2 px-3 text-right font-bold uppercase w-20">Presensi (%)</th>
              </tr>
            </thead>
            <tbody>
              {data.attendance.map((row, i) => (
                <tr key={i} className="border-b break-inside-avoid">
                  <td className="py-2 px-3 font-medium uppercase">{row.study_name}</td>
                  <td className="py-2 px-3 text-right">{row.present}</td>
                  <td className="py-2 px-3 text-right">{row.permit}</td>
                  <td className="py-2 px-3 text-right">{row.sick}</td>
                  <td className="py-2 px-3 text-right">{row.absent}</td>
                  <td className="py-2 px-3 text-right">{row.total}</td>
                  <td className={`py-2 px-3 text-right font-bold ${getPercentageColorClass(row.percentage)}`}>
                    {row.percentage}%
                  </td>
                </tr>
              ))}
              {data.attendance.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400 italic">
                    Tidak ada catatan presensi ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-12 flex justify-between break-inside-avoid">
          <div className="text-center w-64 border-2 border-dashed border-gray-200 p-4 rounded flex items-center justify-center italic text-gray-300 text-xs">
            Area Validasi Digital
          </div>
          <div className="text-center w-64">
            <p className="mb-16">Kepala Bidang Akademik,</p>
            <div className="border-b border-black w-full" />
            <p className="mt-2 text-sm font-bold uppercase">Ust. Dr. Khalili, M.Pd.I.</p>
            <p className="text-xs text-gray-500">NIY. 2012090123</p>
          </div>
        </div>

        <div className="mt-auto pt-10 text-[10px] text-gray-400 border-t flex justify-between print:fixed print:bottom-8 print:left-8 print:right-8">
          <span>Laporan Otomatis SIAP (Sistem Informasi Akademik Pesantren)</span>
          <span>Halaman 1 dari 1</span>
        </div>
      </div>
    </div>
  );
});

StatistikPresensiReport.displayName = 'StatistikPresensiReport';
