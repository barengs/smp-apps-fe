"use client";

import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { StudentLeave } from '@/store/slices/studentLeaveApi';

const styles = StyleSheet.create({
  page: {
    padding: 24,
    fontSize: 9,
    lineHeight: 1.35,
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 13,
    textAlign: 'center',
    fontWeight: 700,
  },
  subtitle: {
    fontSize: 8,
    textAlign: 'center',
    color: '#6b7280',
    marginTop: 4,
  },
  section: {
    marginTop: 10,
    padding: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  label: {
    width: '38%',
    color: '#374151',
  },
  value: {
    width: '60%',
    fontWeight: 700,
    color: '#111827',
  },
  footer: {
    marginTop: 16,
    fontSize: 8,
    color: '#6b7280',
    textAlign: 'center',
  },
  signRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  signBox: {
    width: '48%',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 4,
    padding: 8,
    minHeight: 80,
  },
  signTitle: {
    fontSize: 9,
    fontWeight: 700,
    marginBottom: 8,
    textAlign: 'center',
  },
});

const formatDate = (d?: string) => {
  if (!d) return '-';
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString();
};

const normalizeDate = (d?: string) => {
  if (!d) return '-';
  // If backend stores ISO string, show date only
  const onlyDate = d.split('T')[0];
  return formatDate(onlyDate);
};

const normalizeText = (v?: string) => (v && v.trim().length > 0 ? v : '-');

const prettyStatus = (s?: string) =>
  s ? s.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : '-';

export const LeavePermitDocument: React.FC<{ leave: StudentLeave }> = ({ leave }) => {
  return (
    <Document>
      <Page size="A5" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Kartu Izin Santri</Text>
          <Text style={styles.subtitle}>Dokumen perizinan resmi — mohon dibawa saat keluar/masuk pesantren</Text>
        </View>

        <View style={styles.section}>
          <Text style={{ fontSize: 10, fontWeight: 700, marginBottom: 6 }}>Identitas Santri</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Nomor Izin</Text>
            <Text style={styles.value}>
              {normalizeText(
                (leave.leave_number != null ? String(leave.leave_number) : '').trim()
              )}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Nama</Text>
            <Text style={styles.value}>{normalizeText(leave.student?.name)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>NIS</Text>
            <Text style={styles.value}>{normalizeText(leave.student?.nis)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Tahun Ajaran</Text>
            <Text style={styles.value}>{normalizeText(leave.academic_year?.name)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={{ fontSize: 10, fontWeight: 700, marginBottom: 6 }}>Detail Perizinan</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Jenis Izin</Text>
            <Text style={styles.value}>{normalizeText(leave.leave_type?.name)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Tanggal Mulai</Text>
            <Text style={styles.value}>{normalizeDate(leave.start_date)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Tanggal Selesai</Text>
            <Text style={styles.value}>{normalizeDate(leave.end_date)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Perkiraan Kembali</Text>
            <Text style={styles.value}>{normalizeDate(leave.expected_return_date)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Tujuan</Text>
            <Text style={styles.value}>{normalizeText(leave.destination)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Alasan</Text>
            <Text style={styles.value}>{normalizeText(leave.reason)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Kontak</Text>
            <Text style={styles.value}>
              {normalizeText(
                [leave.contact_person, leave.contact_phone].filter(Boolean).join(' · ')
              )}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Status</Text>
            <Text style={styles.value}>{prettyStatus(leave.status)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Disetujui Oleh</Text>
            <Text style={styles.value}>{normalizeText(leave.approved_by?.name)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Tanggal Persetujuan</Text>
            <Text style={styles.value}>{normalizeDate(leave.approved_at)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Catatan</Text>
            <Text style={styles.value}>{normalizeText(leave.notes)}</Text>
          </View>
        </View>

        <View style={styles.signRow}>
          <View style={styles.signBox}>
            <Text style={styles.signTitle}>Petugas</Text>
            <Text>Nama: ____________________________</Text>
            <Text>Tanda tangan:</Text>
          </View>
          <View style={styles.signBox}>
            <Text style={styles.signTitle}>Wali/Orang Tua</Text>
            <Text>Nama: ____________________________</Text>
            <Text>Tanda tangan:</Text>
          </View>
        </View>

        <Text style={styles.footer}>
          Dicetak pada {new Date().toLocaleString()} • Dokumen ini sah tanpa tanda tangan basah jika terverifikasi sistem
        </Text>
      </Page>
    </Document>
  );
};

// Utilitas untuk membuka PDF di tab baru
export async function openLeavePermitPdf(leave: StudentLeave) {
  const { pdf } = await import('@react-pdf/renderer');
  const blob = await pdf(<LeavePermitDocument leave={leave} />).toBlob();
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank');
  if (!win) {
    // Jika popup diblokir, fallback ke download
    const a = document.createElement('a');
    a.href = url;
    a.download = `kartu-izin-${leave.student?.nis || leave.id}.pdf`;
    a.click();
  }
}