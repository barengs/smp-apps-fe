"use client";

import React from 'react';
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import { pdfStyles, ReportKopSuratPdf, ReportFooterPdf } from './ReportPdfShared';
import { formatReportDate } from '@/utils/pdfExport';

const styles = StyleSheet.create({
  ...pdfStyles,
  colDate: { width: 65 },
  colStudent: { flex: 1 },
  colHostel: { width: 80 },
  colViolation: { flex: 1 },
  colCategory: { width: 90 },
  
  severityBadge: {
    fontSize: 7,
    paddingVertical: 1,
    paddingHorizontal: 4,
    borderRadius: 2,
    borderWidth: 0.5,
    marginTop: 2,
    textAlign: 'center',
    width: 50,
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
  severityBerat: { backgroundColor: '#fef2f2', color: '#991b1b', borderColor: '#f87171' },
  severitySedang: { backgroundColor: '#fff7ed', color: '#9a3412', borderColor: '#fb923c' },
  severityRingan: { backgroundColor: '#f8fafc', color: '#334155', borderColor: '#cbd5e1' },
});

interface LaporanPelanggaranPdfProps {
  data: {
    list: Array<{
      violation_date: string;
      description: string;
      student: { first_name: string; last_name: string; nis: string; hostel?: { name: string } };
      violation: { name: string; category: { name: string; severity_level: string } };
    }>;
  };
  dateRange: { start_date: string; end_date: string };
  kopSuratUrl?: string;
}

export const LaporanPelanggaranDocument: React.FC<LaporanPelanggaranPdfProps> = ({ data, dateRange, kopSuratUrl }) => (
  <Document title={`Laporan_Kedisiplinan_${dateRange.start_date}_${dateRange.end_date}`}>
    <Page size="A4" style={styles.page}>
      <ReportKopSuratPdf kopSuratUrl={kopSuratUrl} />

      <View style={styles.reportHeader}>
        <Text style={styles.reportTitle}>Laporan Kedisiplinan Santri</Text>
        <Text style={styles.reportSubtitle}>Periode: {formatReportDate(dateRange.start_date)} s/d {formatReportDate(dateRange.end_date)}</Text>
        <Text style={styles.printDate}>Dicetak pada: {new Date().toLocaleString('id-ID')}</Text>
      </View>

      <View style={styles.tableContainer}>
        <View style={styles.tableHeader}>
          <Text style={[styles.colHeader, styles.colDate]}>Tanggal</Text>
          <Text style={[styles.colHeader, styles.colStudent]}>Santri</Text>
          <Text style={[styles.colHeader, styles.colHostel]}>Asrama</Text>
          <Text style={[styles.colHeader, styles.colViolation]}>Pelanggaran</Text>
          <Text style={[styles.colHeader, styles.colCategory]}>Kategori</Text>
        </View>

        {data.list.map((item, i) => {
          const severity = String(item.violation.category.severity_level || '').toLowerCase();
          const severityStyle = severity === 'berat' ? styles.severityBerat : severity === 'sedang' ? styles.severitySedang : styles.severityRingan;
          
          return (
            <View key={i} style={styles.tableRow} wrap={false}>
              <Text style={styles.colDate}>{formatReportDate(item.violation_date)}</Text>
              <View style={styles.colStudent}>
                <Text style={{ fontWeight: 'bold' }}>{item.student.first_name} {item.student.last_name}</Text>
                <Text style={{ fontSize: 7, color: '#6b7280' }}>NIS: {item.student.nis}</Text>
              </View>
              <Text style={styles.colHostel}>{item.student.hostel?.name || '-'}</Text>
              <View style={styles.colViolation}>
                <Text style={{ fontWeight: 'bold' }}>{item.violation.name}</Text>
                <Text style={{ fontSize: 7, color: '#4b5563' }}>{item.description}</Text>
              </View>
              <View style={styles.colCategory}>
                <Text>{item.violation.category.name}</Text>
                <Text style={[styles.severityBadge, severityStyle]}>{item.violation.category.severity_level}</Text>
              </View>
            </View>
          );
        })}

        {data.list.length === 0 && (
          <View style={{ padding: 20, textAlign: 'center' }}>
            <Text style={{ color: '#9ca3af', fontStyle: 'italic' }}>Tidak ada catatan pelanggaran ditemukan.</Text>
          </View>
        )}
      </View>

      <View style={styles.signatureSection} wrap={false}>
        <View style={styles.signatureBox} />
        <View style={styles.signatureBox}>
          <Text>Pamekasan, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</Text>
          <Text style={{ marginTop: 2 }}>Kepala Bagian Keamanan,</Text>
          <View style={styles.signatureSpace} />
          <Text style={styles.signatureName}>Ust. Muhsin Al-Katiri</Text>
          <Text style={styles.signatureTitle}>Kepala Bagian Keamanan</Text>
        </View>
      </View>

      <ReportFooterPdf subtitle="Laporan Internal Pesantren - Bidang Keamanan & Ketertiban (KAMTIB)" />
    </Page>
  </Document>
);

export async function generateLaporanPelanggaranPdf(data: any, dateRange: any, kopSuratUrl?: string) {
  const blob = await pdf(<LaporanPelanggaranDocument data={data} dateRange={dateRange} kopSuratUrl={kopSuratUrl} />).toBlob();
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank');
  if (!win) {
    const a = document.createElement('a');
    a.href = url;
    a.download = `Laporan_Pelanggaran_${dateRange.start_date}.pdf`;
    a.click();
  }
}
