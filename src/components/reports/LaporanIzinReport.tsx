import React from 'react';
import { ReportKopSurat } from '../ReportKopSurat';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface LaporanIzinReportProps {
  data: {
    stats: Array<{ status: string; count: number }>;
    list: Array<{
      id: number;
      start_date: string;
      end_date: string;
      status: string;
      student: {
        first_name: string;
        last_name: string;
        nis: string;
      };
      leave_type: {
        name: string;
      };
    }>;
  };
  dateRange: {
    start_date: string;
    end_date: string;
  };
}

export const LaporanIzinReport = React.forwardRef<HTMLDivElement, LaporanIzinReportProps>(({ data, dateRange }, ref) => {
  const getStatusColor = (status?: any) => {
    const statusStr = String(status || '').toLowerCase();
    switch (statusStr) {
      case 'approved': return 'bg-green-50 text-green-700 border-green-200';
      case 'active': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'overdue': return 'bg-red-50 text-red-700 border-red-200';
      case 'completed': return 'bg-gray-50 text-gray-700 border-gray-200';
      default: return 'bg-white text-gray-600 border-gray-200';
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
          <h1 className="text-2xl font-bold uppercase tracking-wide">Laporan Perizinan Santri</h1>
          <p className="text-lg">Periode: {formatDate(dateRange.start_date)} s/d {formatDate(dateRange.end_date)}</p>
          <p className="text-sm text-gray-500">Dicetak pada: {new Date().toLocaleString('id-ID')}</p>
        </div>

        {/* Detailed Table */}
        <div className="border rounded-lg overflow-hidden mb-8 break-inside-avoid">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="py-2 px-3 text-left font-bold uppercase w-24">Mulai</th>
                <th className="py-2 px-3 text-left font-bold uppercase w-24">Sampai</th>
                <th className="py-2 px-3 text-left font-bold uppercase">Santri</th>
                <th className="py-2 px-3 text-left font-bold uppercase">Jenis Izin</th>
                <th className="py-2 px-3 text-left font-bold uppercase w-24">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.list.map((item, i) => (
                <tr key={i} className="border-b break-inside-avoid">
                  <td className="py-2 px-3 font-medium">
                    {formatDate(item.start_date)}
                  </td>
                  <td className="py-2 px-3 font-medium">
                    {formatDate(item.end_date)}
                  </td>
                  <td className="py-2 px-3">
                    <div className="font-bold">{item.student.first_name} {item.student.last_name}</div>
                    <div className="text-gray-500 italic">NIS: {item.student.nis}</div>
                  </td>
                  <td className="py-2 px-3">{item.leave_type.name}</td>
                  <td className="py-2 px-3">
                    <span className={`px-2 py-0.5 rounded border text-[9px] font-bold uppercase ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
              {data.list.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400 italic">
                    Tidak ada catatan perizinan ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-8 break-inside-avoid">
          <div className="text-center">
              {/* Signature Area Left */}
          </div>
          <div className="text-center">
            <p className="mb-16">Kepala Biro Kesantrian,</p>
            <div className="border-b border-black w-48 mx-auto" />
            <p className="mt-2 text-sm font-bold uppercase">Ust. H. Syaifullah, Lc.</p>
          </div>
        </div>

        <div className="mt-auto pt-10 text-[10px] text-gray-400 border-t flex justify-between print:fixed print:bottom-8 print:left-8 print:right-8">
          <span>Laporan Perizinan Santri v1.0</span>
          <span>SIAP | Sistem Informasi Akademik Pesantren</span>
        </div>
      </div>
    </div>
  );
});

LaporanIzinReport.displayName = 'LaporanIzinReport';
