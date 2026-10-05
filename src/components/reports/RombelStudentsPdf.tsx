"use client";

import React from 'react';
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import { pdfStyles, ReportKopSuratPdf, ReportFooterPdf } from './ReportPdfShared';
import type { Student } from '@/store/slices/studentApi';

const styles = StyleSheet.create({
  ...pdfStyles,
  metaContainer: {
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  metaLeft: {
    flexDirection: 'column',
    gap: 2,
  },
  metaRight: {
    textAlign: 'right',
  },
  badgeRombel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  badgeTotal: {
    fontSize: 8.5,
    color: '#4b5563',
  },
  colNo: {
    width: 25,
    textAlign: 'center',
  },
  colNis: {
    width: 70,
  },
  colName: {
    flex: 1.1,
  },
  colGender: {
    width: 75,
    textAlign: 'center',
  },
  colAddress: {
    flex: 1.4,
  },
  emptyRow: {
    padding: 20,
    textAlign: 'center',
  },
  emptyText: {
    color: '#9ca3af',
    fontStyle: 'italic',
    fontSize: 8.5,
  },
});

interface RombelStudentsPdfProps {
  classGroupName: string;
  students: Student[];
  kopSuratUrl?: string;
  headmasterName?: string;
  headmasterNip?: string;
  schoolName?: string;
  advisorName?: string;
  advisorNip?: string;
}

export const RombelStudentsDocument: React.FC<RombelStudentsPdfProps> = ({
  classGroupName,
  students,
  kopSuratUrl,
  headmasterName,
  headmasterNip,
  schoolName,
  advisorName,
  advisorNip,
}) => {
  const currentDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const firstStudent = students[0];
  const finalHeadmasterName = headmasterName || firstStudent?.headmaster_name || '';
  const finalHeadmasterNip = headmasterNip || firstStudent?.headmaster_nip || '';
  const finalSchoolName = schoolName || firstStudent?.school_name || '';
  const finalAdvisorName = advisorName || firstStudent?.advisor_name || '';
  const finalAdvisorNip = advisorNip || firstStudent?.advisor_nip || '';

  const getStudentAddress = (student: Student): string => {
    if (student.address && student.address.trim()) {
      return student.address.trim();
    }
    const region = [student.village, student.district].filter(Boolean).join(', ');
    return region || '-';
  };

  return (
    <Document title={`Daftar_Santri_Rombel_${classGroupName.replace(/\s+/g, '_')}`}>
      <Page size="A4" style={styles.page}>
        {/* Kop Surat Pesantren */}
        <ReportKopSuratPdf kopSuratUrl={kopSuratUrl} fallbackTitle="PONDOK PESANTREN" />

        {/* Judul Laporan */}
        <View style={styles.reportHeader}>
          <Text style={styles.reportTitle}>Daftar Santri Rombongan Belajar</Text>
          <Text style={styles.reportSubtitle}>Rombel: {classGroupName}</Text>
        </View>

        {/* Meta Info */}
        <View style={styles.metaContainer}>
          <View style={styles.metaLeft}>
            <Text style={styles.badgeRombel}>Nama Rombel: {classGroupName}</Text>
            <Text style={styles.badgeTotal}>Total: {students.length} Santri</Text>
          </View>
          <View style={styles.metaRight}>
            <Text style={styles.printDate}>Dicetak pada: {currentDate}</Text>
          </View>
        </View>

        {/* Tabel Data Santri */}
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={[styles.colHeader, styles.colNo]}>No</Text>
            <Text style={[styles.colHeader, styles.colNis]}>NIS</Text>
            <Text style={[styles.colHeader, styles.colName]}>Nama Lengkap</Text>
            <Text style={[styles.colHeader, styles.colGender]}>Jenis Kelamin</Text>
            <Text style={[styles.colHeader, styles.colAddress]}>Alamat</Text>
          </View>

          {students.map((student, index) => {
            const fullName = `${student.first_name || ''} ${student.last_name || ''}`.trim() || '-';
            const genderText = student.gender === 'L' ? 'Laki-laki' : student.gender === 'P' ? 'Perempuan' : '-';
            const addressText = getStudentAddress(student);

            return (
              <View key={student.id || index} style={styles.tableRow} wrap={false}>
                <Text style={styles.colNo}>{index + 1}</Text>
                <Text style={styles.colNis}>{student.nis || '-'}</Text>
                <Text style={[styles.colName, { fontWeight: 'bold' }]}>{fullName}</Text>
                <Text style={styles.colGender}>{genderText}</Text>
                <Text style={styles.colAddress}>{addressText}</Text>
              </View>
            );
          })}

          {students.length === 0 && (
            <View style={styles.emptyRow}>
              <Text style={styles.emptyText}>Tidak ada data santri pada rombel ini.</Text>
            </View>
          )}
        </View>

        {/* Bagian Tanda Tangan */}
        <View style={styles.signatureSection} wrap={false}>
          <View style={styles.signatureBox}>
            <Text>Mengetahui,</Text>
            <Text style={{ marginTop: 2 }}>{finalSchoolName ? `Kepala ${finalSchoolName},` : 'Kepala Sekolah,'}</Text>
            <View style={styles.signatureSpace} />
            <Text style={styles.signatureName}>
              {finalHeadmasterName || '__________________________'}
            </Text>
            <Text style={styles.signatureTitle}>
              {finalHeadmasterNip ? `NIP / NIY. ${finalHeadmasterNip}` : 'NIP / NIY.'}
            </Text>
          </View>
          <View style={styles.signatureBox}>
            <Text>Pamekasan, {currentDate}</Text>
            <Text style={{ marginTop: 2 }}>Wali Kelas / Pengelola Rombel,</Text>
            <View style={styles.signatureSpace} />
            <Text style={styles.signatureName}>
              {finalAdvisorName || '__________________________'}
            </Text>
            <Text style={styles.signatureTitle}>
              {finalAdvisorNip ? `NIP / NIY. ${finalAdvisorNip}` : 'NIP / NIY.'}
            </Text>
          </View>
        </View>

        {/* Footer */}
        <ReportFooterPdf subtitle={`Daftar Santri Rombel ${classGroupName} | SIAP`} />
      </Page>
    </Document>
  );
};

export async function generateRombelStudentsPdf(
  classGroupName: string,
  students: Student[],
  kopSuratUrl?: string,
  headmasterName?: string,
  headmasterNip?: string,
  schoolName?: string,
  advisorName?: string,
  advisorNip?: string
) {
  const blob = await pdf(
    <RombelStudentsDocument
      classGroupName={classGroupName}
      students={students}
      kopSuratUrl={kopSuratUrl}
      headmasterName={headmasterName}
      headmasterNip={headmasterNip}
      schoolName={schoolName}
      advisorName={advisorName}
      advisorNip={advisorNip}
    />
  ).toBlob();

  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank');
  if (!win) {
    const a = document.createElement('a');
    a.href = url;
    a.download = `Daftar_Santri_Rombel_${classGroupName.replace(/\s+/g, '_')}.pdf`;
    a.click();
  }
}
