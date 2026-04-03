"use client";

import React from 'react';
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import { pdfStyles, ReportKopSuratPdf, ReportFooterPdf } from './ReportPdfShared';
import { formatReportDate } from '@/utils/pdfExport';

const styles = StyleSheet.create({
  ...pdfStyles,
  colStart: { width: 70 },
  colEnd: { width: 70 },
  colStudent: { flex: 1 },
  colType: { flex: 1 },
  colStatus: { width: 80 },
  
  statusBadge: {
    fontSize: 7,
    paddingVertical: 1,
    paddingHorizontal: 4,
    borderRadius: 2,
    borderWidth: 0.5,
    marginTop: 2,
    textAlign: 'center',
    width: 60,
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
  statusApproved: { backgroundColor: '#f0fdf4', color: '#166534', borderColor: '#86efac' },
  statusActive: { backgroundColor: '#eff6ff', color: '#1e40af', borderColor: '#93c5fd' },
  statusOverdue: { backgroundColor: '#fef2f2', color: '#991b1b', borderColor: '#f87171' },
  statusCompleted: { backgroundColor: '#f8fafc', color: '#334155', borderColor: '#cbd5e1' },
});

interface LaporanIzinPdfProps {
  data: {
    list: Array<{
      start_date: string;
      end_date: string;
      status: string;
      student: { first_name: string; last_name: string; nis: string };
      leave_type: { name: string };
    }>;
  };
  dateRange: { start_date: string; end_date: string };
  kopSuratUrl?: string;
}

export const LaporanIzinDocument: React.FC<LaporanIzinPdfProps> = ({ data, dateRange, kopSuratUrl }) => (
  <Document title={`Laporan_Perizinan_${dateRange.start_date}_${dateRange.end_date}`}>
    <Page size="A4" style={styles.page}>
      <ReportKopSuratPdf kopSuratUrl={kopSuratUrl} />

      <View style={styles.reportHeader}>
        <Text style={styles.reportTitle}>Laporan Perizinan Santri</Text>
        <Text style={styles.reportSubtitle}>Periode: {formatReportDate(dateRange.start_date)} s/d {formatReportDate(dateRange.end_date)}</Text>
        <Text style={styles.printDate}>Dicetak pada: {new Date().toLocaleString('id-ID')}</Text>
      </View>

      <View style={styles.tableContainer}>
        <View style={styles.tableHeader}>
          <Text style={[styles.colHeader, styles.colStart]}>Mulai</Text>
          <Text style={[styles.colHeader, styles.colEnd]}>Sampai</Text>
          <Text style={[styles.colHeader, styles.colStudent]}>Santri</Text>
          <Text style={[styles.colHeader, styles.colType]}>Jenis Izin</Text>
          <Text style={[styles.colHeader, styles.colStatus]}>Status</Text>
        </View>

        {data.list.map((item, i) => {
          const status = String(item.status || '').toLowerCase();
          const statusStyle = 
            status === 'approved' ? styles.statusApproved : 
            status === 'active' ? styles.statusActive : 
            status === 'overdue' ? styles.statusOverdue : 
            status === 'completed' ? styles.statusCompleted : 
            styles.statusBadge;
          
          return (
            <View key={i} style={styles.tableRow} wrap={false}>
              <Text style={styles.colStart}>{formatReportDate(item.start_date)}</Text>
              <Text style={styles.colEnd}>{formatReportDate(item.end_date)}</Text>
              <View style={styles.colStudent}>
                <Text style={{ fontWeight: 'bold' }}>{item.student.first_name} {item.student.last_name}</Text>
                <Text style={{ fontSize: 7, color: '#6b7280' }}>NIS: {item.student.nis}</Text>
              </View>
              <Text style={styles.colType}>{item.leave_type.name}</Text>
              <View style={styles.colStatus}>
                <Text style={[styles.statusBadge, statusStyle]}>{item.status}</Text>
              </View>
            </View>
          );
        })}

        {data.list.length === 0 && (
          <View style={{ padding: 20, textAlign: 'center' }}>
            <Text style={{ color: '#9ca3af', fontStyle: 'italic' }}>Tidak ada catatan perizinan ditemukan.</Text>
          </View>
        )}
      </View>

      <View style={styles.signatureSection} wrap={false}>
        <View style={styles.signatureBox} />
        <View style={styles.signatureBox}>
          <Text>Kepala Biro Kesantrian,</Text>
          <View style={styles.signatureSpace} />
          <Text style={styles.signatureName}>Ust. H. Syaifullah, Lc.</Text>
          <Text style={styles.signatureTitle}>Kepala Biro Kesantrian</Text>
        </View>
      </View>

      <ReportFooterPdf subtitle="Laporan Perizinan Santri | SIAP (Sistem Informasi Akademik Pesantren)" />
    </Page>
  </Document>
);

export async function generateLaporanIzinPdf(data: any, dateRange: any, kopSuratUrl?: string) {
  const blob = await pdf(<LaporanIzinDocument data={data} dateRange={dateRange} kopSuratUrl={kopSuratUrl} />).toBlob();
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank');
  if (!win) {
    const a = document.createElement('a');
    a.href = url;
    a.download = `Laporan_Perizinan_${dateRange.start_date}.pdf`;
    a.click();
  }
}
