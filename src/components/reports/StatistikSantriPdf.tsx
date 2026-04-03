"use client";

import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, pdf } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    lineHeight: 1.5,
    fontFamily: 'Helvetica',
    backgroundColor: '#FFFFFF',
  },
  kopImage: {
    width: '100%',
    height: 'auto',
    marginBottom: 5,
  },
  divider: {
    borderBottomWidth: 2,
    borderBottomColor: '#000000',
    marginBottom: 20,
  },
  headerContent: {
    textAlign: 'center',
    marginBottom: 20,
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  reportSubtitle: {
    fontSize: 12,
    color: '#374151',
  },
  printDate: {
    fontSize: 8,
    color: '#6b7280',
    marginTop: 4,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    padding: 15,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 9,
    color: '#6b7280',
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  tableContainer: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 4,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  tableRowLast: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontWeight: 'bold',
  },
  colHeader: {
    fontWeight: 'bold',
    fontSize: 9,
    textTransform: 'uppercase',
  },
  colName: { flex: 3 },
  colCount: { flex: 1, textAlign: 'right' },
  colPercent: { flex: 1, textAlign: 'right' },
  
  signatureSection: {
    marginTop: 40,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  signatureBox: {
    width: 200,
    textAlign: 'center',
  },
  signatureSpace: {
    height: 60,
  },
  signatureName: {
    fontWeight: 'bold',
    fontSize: 11,
    textDecoration: 'underline',
  },
  signatureTitle: {
    fontSize: 9,
    color: '#4b5563',
    marginTop: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 8,
    color: '#9ca3af',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

interface StatistikSantriPdfProps {
  data: {
    academic_year: string;
    summary: {
      active: number;
      new: number;
      graduated: number;
    };
    by_hostel: Array<{ hostel_name: string; count: number }>;
  };
  kopSuratUrl?: string;
}

export const StatistikSantriDocument: React.FC<StatistikSantriPdfProps> = ({ data, kopSuratUrl }) => (
  <Document title={`Laporan_Statistik_Santri_${data.academic_year}`}>
    <Page size="A4" style={styles.page}>
      {/* Kop Surat */}
      {kopSuratUrl ? (
        <View>
          <Image src={kopSuratUrl} style={styles.kopImage} />
          <View style={styles.divider} />
        </View>
      ) : (
        <View style={styles.headerContent}>
          <Text style={styles.reportTitle}>PONDOK PESANTREN</Text>
          <View style={styles.divider} />
        </View>
      )}

      {/* Report Header */}
      <View style={styles.headerContent}>
        <Text style={styles.reportTitle}>Laporan Statistik Santri</Text>
        <Text style={styles.reportSubtitle}>Tahun Ajaran {data.academic_year}</Text>
        <Text style={styles.printDate}>
          Dicetak pada: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
        </Text>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Santri Aktif</Text>
          <Text style={styles.summaryValue}>{data.summary.active}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Santri Baru</Text>
          <Text style={styles.summaryValue}>{data.summary.new}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Tamat/Lulus</Text>
          <Text style={styles.summaryValue}>{data.summary.graduated}</Text>
        </View>
      </View>

      {/* Table Title */}
      <Text style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 8, borderBottomWidth: 1, paddingBottom: 4 }}>
        Distribusi Santri per Asrama
      </Text>

      {/* Data Table */}
      <View style={styles.tableContainer}>
        <View style={styles.tableHeader}>
          <Text style={[styles.colHeader, styles.colName]}>Nama Asrama</Text>
          <Text style={[styles.colHeader, styles.colCount]}>Jumlah</Text>
          <Text style={[styles.colHeader, styles.colPercent]}>Persentase</Text>
        </View>
        
        {data.by_hostel.map((h, i) => (
          <View key={i} style={styles.tableRow} wrap={false}>
            <Text style={styles.colName}>{h.hostel_name}</Text>
            <Text style={styles.colCount}>{h.count}</Text>
            <Text style={styles.colPercent}>
              {((h.count / data.summary.active) * 100).toFixed(1)}%
            </Text>
          </View>
        ))}

        <View style={styles.tableRowLast}>
          <Text style={[styles.colName, { fontWeight: 'bold' }]}>TOTAL SELURUHNYA</Text>
          <Text style={[styles.colCount, { fontWeight: 'bold' }]}>{data.summary.active}</Text>
          <Text style={[styles.colPercent, { fontWeight: 'bold' }]}>100%</Text>
        </View>
      </View>

      {/* Signature Section */}
      <View style={styles.signatureSection} wrap={false}>
        <View style={styles.signatureBox}>
          <Text>Kepala Bidang Kesantrian,</Text>
          <View style={styles.signatureSpace} />
          <Text style={styles.signatureName}>Ust. Ahmad Muzakki, M.Pd.</Text>
          <Text style={styles.signatureTitle}>NIP. 198801232015031001</Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer} fixed>
        <Text>Sistem Informasi Akademik Pesantren (SIAP)</Text>
        <Text render={({ pageNumber, totalPages }) => `Halaman ${pageNumber} dari ${totalPages}`} />
      </View>
    </Page>
  </Document>
);

/**
 * Utility to generate and open the PDF in a new tab
 */
export async function generateStatistikSantriPdf(data: any, kopSuratUrl?: string) {
  const blob = await pdf(<StatistikSantriDocument data={data} kopSuratUrl={kopSuratUrl} />).toBlob();
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank');
  
  if (!win) {
    // If popup blocked, fallback to download
    const a = document.createElement('a');
    a.href = url;
    a.download = `Laporan_Statistik_Santri_${data.academic_year.replace(/\//g, '-')}.pdf`;
    a.click();
  }
}
