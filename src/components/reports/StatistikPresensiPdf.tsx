"use client";

import React from 'react';
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import { pdfStyles, ReportKopSuratPdf, ReportFooterPdf } from './ReportPdfShared';
import { formatReportDate } from '@/utils/pdfExport';

const styles = StyleSheet.create({
  ...pdfStyles,
  colSubject: { flex: 1 },
  colCount: { width: 50, textAlign: 'right' },
  colTotal: { width: 60, textAlign: 'right' },
  colPercent: { width: 80, textAlign: 'right', fontWeight: 'bold' },
  
  percentHigh: { color: '#166534' },
  percentMedium: { color: '#ca8a04' },
  percentLow: { color: '#991b1b' },
  
  validationBox: {
    width: 260,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#e5e7eb',
    padding: 10,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  validationText: {
    fontSize: 7,
    color: '#9ca3af',
    fontStyle: 'italic',
  }
});

interface StatistikPresensiPdfProps {
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
  dateRange: { start_date: string; end_date: string };
  kopSuratUrl?: string;
}

export const StatistikPresensiDocument: React.FC<StatistikPresensiPdfProps> = ({ data, dateRange, kopSuratUrl }) => (
  <Document title={`Statistik_Presensi_${dateRange.start_date}_${dateRange.end_date}`}>
    <Page size="A4" style={styles.page}>
      <ReportKopSuratPdf kopSuratUrl={kopSuratUrl} />

      <View style={styles.reportHeader}>
        <Text style={styles.reportTitle}>Laporan Persentase Kehadiran Santri</Text>
        <Text style={styles.reportSubtitle}>Periode: {formatReportDate(dateRange.start_date)} s/d {formatReportDate(dateRange.end_date)}</Text>
        <Text style={styles.printDate}>Dicetak pada: {new Date().toLocaleString('id-ID')}</Text>
      </View>

      <View style={styles.tableContainer}>
        <View style={styles.tableHeader}>
          <Text style={[styles.colHeader, styles.colSubject]}>Mata Pelajaran / Bidang</Text>
          <Text style={[styles.colHeader, styles.colCount]}>Hadir</Text>
          <Text style={[styles.colHeader, styles.colCount]}>Izin</Text>
          <Text style={[styles.colHeader, styles.colCount]}>Sakit</Text>
          <Text style={[styles.colHeader, styles.colCount]}>Alfa</Text>
          <Text style={[styles.colHeader, styles.colTotal]}>Total Jam</Text>
          <Text style={[styles.colHeader, styles.colPercent]}>Presensi (%)</Text>
        </View>

        {data.attendance.map((row, i) => {
          const percentStyle = row.percentage >= 90 ? styles.percentHigh : row.percentage >= 75 ? styles.percentMedium : styles.percentLow;
          
          return (
            <View key={i} style={styles.tableRow} wrap={false}>
              <Text style={[styles.colSubject, { textTransform: 'uppercase' }]}>{row.study_name}</Text>
              <Text style={styles.colCount}>{row.present}</Text>
              <Text style={styles.colCount}>{row.permit}</Text>
              <Text style={styles.colCount}>{row.sick}</Text>
              <Text style={styles.colCount}>{row.absent}</Text>
              <Text style={styles.colTotal}>{row.total}</Text>
              <Text style={[styles.colPercent, percentStyle]}>{row.percentage}%</Text>
            </View>
          );
        })}

        {data.attendance.length === 0 && (
          <View style={{ padding: 20, textAlign: 'center' }}>
            <Text style={{ color: '#9ca3af', fontStyle: 'italic' }}>Tidak ada catatan presensi ditemukan.</Text>
          </View>
        )}
      </View>

      <View style={styles.signatureSection} wrap={false}>
        <View style={styles.validationBox}>
          <Text style={styles.validationText}>Area Validasi Digital Sistem Informasi Akademik</Text>
        </View>
        <View style={styles.signatureBox}>
          <Text>Kepala Bidang Akademik,</Text>
          <View style={styles.signatureSpace} />
          <Text style={styles.signatureName}>Ust. Dr. Khalili, M.Pd.I.</Text>
          <Text style={styles.signatureTitle}>NIY. 2012090123</Text>
        </View>
      </View>

      <ReportFooterPdf subtitle="Laporan Otomatis SIAP (Sistem Informasi Akademik Pesantren)" />
    </Page>
  </Document>
);

export async function generateStatistikPresensiPdf(data: any, dateRange: any, kopSuratUrl?: string) {
  const blob = await pdf(<StatistikPresensiDocument data={data} dateRange={dateRange} kopSuratUrl={kopSuratUrl} />).toBlob();
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank');
  if (!win) {
    const a = document.createElement('a');
    a.href = url;
    a.download = `Statistik_Presensi_${dateRange.start_date}.pdf`;
    a.click();
  }
}
