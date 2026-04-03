"use client";

import React from 'react';
import { Text, View, StyleSheet, Image } from '@react-pdf/renderer';

/**
 * Common Styles for Pesantren PDF Reports
 */
export const pdfStyles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 9,
    lineHeight: 1.4,
    fontFamily: 'Helvetica',
    backgroundColor: '#FFFFFF',
    color: '#111827',
  },
  kopImage: {
    width: '100%',
    height: 'auto',
    marginBottom: 5,
  },
  divider: {
    borderBottomWidth: 2,
    borderBottomColor: '#000000',
    marginBottom: 15,
  },
  reportHeader: {
    textAlign: 'center',
    marginBottom: 20,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  reportSubtitle: {
    fontSize: 11,
    color: '#374151',
  },
  printDate: {
    fontSize: 8,
    color: '#6b7280',
    marginTop: 4,
  },
  tableContainer: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 2,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  colHeader: {
    fontWeight: 'bold',
    fontSize: 8.5,
    textTransform: 'uppercase',
  },
  signatureSection: {
    marginTop: 35,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  signatureBox: {
    width: 200,
    textAlign: 'center',
  },
  signatureSpace: {
    height: 55,
  },
  signatureName: {
    fontWeight: 'bold',
    fontSize: 10,
    textDecoration: 'underline',
  },
  signatureTitle: {
    fontSize: 8.5,
    color: '#4b5563',
    marginTop: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 7.5,
    color: '#9ca3af',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

/**
 * Shared Kop Surat (Letterhead) for PDFs
 */
interface ReportKopSuratPdfProps {
  kopSuratUrl?: string;
  fallbackTitle?: string;
}

export const ReportKopSuratPdf: React.FC<ReportKopSuratPdfProps> = ({ kopSuratUrl, fallbackTitle = "PONDOK PESANTREN" }) => (
  <View>
    {kopSuratUrl ? (
      <View>
        <Image src={kopSuratUrl} style={pdfStyles.kopImage} />
        <View style={pdfStyles.divider} />
      </View>
    ) : (
      <View style={pdfStyles.reportHeader}>
        <Text style={pdfStyles.reportTitle}>{fallbackTitle}</Text>
        <View style={pdfStyles.divider} />
      </View>
    )}
  </View>
);

/**
 * Standard PDF Page Footer
 */
export const ReportFooterPdf: React.FC<{ subtitle?: string }> = ({ 
  subtitle = "Sistem Informasi Akademik Pesantren (SIAP)" 
}) => (
  <View style={pdfStyles.footer} fixed>
    <Text>{subtitle}</Text>
    <Text render={({ pageNumber, totalPages }) => `Halaman ${pageNumber} dari ${totalPages}`} />
  </View>
);
