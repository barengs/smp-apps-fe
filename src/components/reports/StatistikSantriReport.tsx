import React from 'react';
import { ReportKopSurat } from '../ReportKopSurat';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Users, UserPlus, GraduationCap } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

interface StatistikSantriReportProps {
  data: {
    academic_year: string;
    summary: {
      active: number;
      new: number;
      graduated: number;
    };
    by_hostel: Array<{ hostel_name: string; count: number }>;
    by_gender: Array<{ gender: string; count: number }>;
  };
}

export const StatistikSantriReport = React.forwardRef<HTMLDivElement, StatistikSantriReportProps>(({ data }, ref) => {
  const genderData = data.by_gender.map(g => ({
    name: g.gender === 'L' ? 'Laki-laki' : 'Perempuan',
    value: g.count
  }));

  return (
    <div ref={ref} className="p-10 bg-white text-black min-h-screen printable-area print:p-0">
      <div className="print:p-4 flex flex-col min-h-screen">
        <ReportKopSurat />
        
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold uppercase tracking-wide">Laporan Statistik Santri</h1>
          <p className="text-lg">Tahun Ajaran {data.academic_year}</p>
          <p className="text-sm text-gray-500">Dicetak pada: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>

        {/* Summary Cards - Simplified for Print */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="border p-4 rounded-lg flex flex-col items-center justify-center bg-gray-50">
            <Users className="h-6 w-6 mb-2 text-blue-600" />
            <span className="text-sm font-medium text-gray-600">Santri Aktif</span>
            <span className="text-2xl font-bold">{data.summary.active}</span>
          </div>
          <div className="border p-4 rounded-lg flex flex-col items-center justify-center bg-gray-50">
            <UserPlus className="h-6 w-6 mb-2 text-green-600" />
            <span className="text-sm font-medium text-gray-600">Santri Baru</span>
            <span className="text-2xl font-bold">{data.summary.new}</span>
          </div>
          <div className="border p-4 rounded-lg flex flex-col items-center justify-center bg-gray-50">
            <GraduationCap className="h-6 w-6 mb-2 text-orange-600" />
            <span className="text-sm font-medium text-gray-600">Tamat/Lulus</span>
            <span className="text-2xl font-bold">{data.summary.graduated}</span>
          </div>
        </div>

        {/* Detailed Table */}
        <div className="border rounded-lg overflow-hidden mb-8 break-inside-avoid">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="py-2 px-4 text-left text-xs font-bold uppercase">Nama Asrama</th>
                <th className="py-2 px-4 text-right text-xs font-bold uppercase">Jumlah Santri</th>
                <th className="py-2 px-4 text-right text-xs font-bold uppercase">Persentase</th>
              </tr>
            </thead>
            <tbody>
              {data.by_hostel.map((h, i) => (
                <tr key={i} className="border-b">
                  <td className="py-2 px-4 text-sm">{h.hostel_name}</td>
                  <td className="py-2 px-4 text-right text-sm">{h.count}</td>
                  <td className="py-2 px-4 text-right text-sm">
                    {((h.count / data.summary.active) * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
              <tr className="bg-gray-50 font-bold">
                <td className="py-2 px-4 text-sm">TOTAL SELURUHNYA</td>
                <td className="py-2 px-4 text-right text-sm">{data.summary.active}</td>
                <td className="py-2 px-4 text-right text-sm">100%</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-12 flex justify-end">
          <div className="text-center w-64">
            <p className="mb-16">Kepala Bidang Kesantrian,</p>
            <div className="border-b border-black w-full" />
            <p className="mt-2 text-sm font-bold">Ust. Ahmad Muzakki, M.Pd.</p>
            <p className="text-xs text-gray-500">NIP. 198801232015031001</p>
          </div>
        </div>

        <div className="mt-auto pt-10 text-[10px] text-gray-400 border-t flex justify-between print:fixed print:bottom-8 print:left-8 print:right-8">
          <span>Sistem Informasi Akademik Pesantren (SIAP)</span>
          <span>Halaman 1 dari 1</span>
        </div>
      </div>
    </div>
  );
});

StatistikSantriReport.displayName = 'StatistikSantriReport';
