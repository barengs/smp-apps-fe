"use client";

import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { StudentLeave } from '@/store/slices/studentLeaveApi';
import { Image } from '@react-pdf/renderer';
// ADD: static import for pdf to avoid mixed dynamic+static warning
import { pdf } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    paddingVertical: 30,
    paddingHorizontal: 50,
    fontSize: 10,
    lineHeight: 1.5,
    fontFamily: 'Helvetica',
  },
  kopImage: {
    width: '100%',
    height: 'auto',
    marginBottom: 10,
  },
  titleContainer: {
    textAlign: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 12,
    fontWeight: 'bold',
    textDecoration: 'underline',
  },
  nomor: {
    fontSize: 10,
    marginTop: 2,
  },
  formContainer: {
    marginTop: 10,
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  label: {
    width: 140,
  },
  separator: {
    width: 15,
    textAlign: 'center',
  },
  value: {
    flex: 1,
  },
  signatureSection: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureBox: {
    width: '30%',
    alignItems: 'center',
  },
  dateLocation: {
    textAlign: 'right',
    marginBottom: 30,
  },
  signatureName: {
    marginTop: 50,
    textDecoration: 'underline',
  },
  keteranganBox: {
    marginTop: 40,
  },
  keteranganTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  keteranganItem: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  bullet: {
    width: 15,
  },
  keteranganText: {
    flex: 1,
  },
  keteranganRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  qrImage: {
    width: 80,
    height: 80,
    marginLeft: 10,
  },
  footer: {
    marginTop: 20,
    fontSize: 8,
    color: '#6b7280',
    textAlign: 'center',
  },
});

const getDayName = (dateString?: string) => {
  if (!dateString) return '-';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '-';
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  return days[d.getDay()];
};

const formatDate = (dateString?: string) => {
  if (!dateString) return '-';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

export const LeavePermitDocument: React.FC<{ leave: StudentLeave; qrDataUrl?: string; kopSuratUrl?: string }> = ({ leave, qrDataUrl, kopSuratUrl }) => {
  
  // Parse notes JSON
  let kelasDiniyah = '-';
  let kelasMiq = '-';
  let kelasAmmiyah = '-';
  let startTime = '-';
  let endTime = '-';
  
  if (leave.notes && leave.notes.startsWith('{')) {
    try {
      const parsed = JSON.parse(leave.notes);
      kelasDiniyah = parsed.kelasDiniyah || '-';
      kelasMiq = parsed.kelasMiq || '-';
      kelasAmmiyah = parsed.kelasAmmiyah || '-';
      startTime = parsed.startTime || '-';
      endTime = parsed.endTime || '-';
    } catch (e) {
      // Ignore
    }
  }

  // Helper render row
  const FormRow = ({ label, value }: { label: string, value: string | undefined }) => (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.separator}>:</Text>
      <Text style={styles.value}>{value || '-'}</Text>
    </View>
  );

  return (
    <Document>
      <Page size={[612, 935.43]} style={styles.page}>
        {kopSuratUrl && (
          <Image src={kopSuratUrl} style={styles.kopImage} />
        )}

        <View style={styles.titleContainer}>
          <Text style={styles.title}>SURAT PERMOHONAN IZIN PULANG</Text>
          <Text style={styles.nomor}>Nomor: {leave.leave_number || '..... C/KI.PPMUP /....../144...'}</Text>
        </View>

        <View style={styles.formContainer}>
          <FormRow label="Nama" value={leave.student?.name} />
          <FormRow label="NIS" value={leave.student?.nis} />
          <FormRow label="Te. Ta. La." value="-" />
          <FormRow label="Alamat" value="-" />
          <FormRow label="Asrama" value="-" />
          <FormRow label="Kelas Pend. Diniyah" value={kelasDiniyah} />
          <FormRow label="Kelas MIQ" value={kelasMiq} />
          <FormRow label="Kelas Pend. 'Ammiyah" value={kelasAmmiyah} />
          <FormRow label="Wali/Orang Tua" value="-" />
          <FormRow label="Penjemput" value={leave.contact_person} />
          <FormRow label="No. HP" value={leave.contact_phone} />
          <FormRow label="Alasan Izin" value={leave.reason} />
          <FormRow label="Lama Izin" value={`${leave.duration_days || '-'} Hari`} />
          <View style={styles.row}>
            <Text style={styles.label}>Dari hari</Text>
            <Text style={styles.separator}>:</Text>
            <Text style={styles.value}>{getDayName(leave.start_date)}     Tanggal: {formatDate(leave.start_date)}     Jam: {startTime} WIB</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Sampai hari</Text>
            <Text style={styles.separator}>:</Text>
            <Text style={styles.value}>{getDayName(leave.end_date)}     Tanggal: {formatDate(leave.end_date)}     Jam: {endTime} WIB</Text>
          </View>
        </View>

        <View style={styles.dateLocation}>
          <Text>Panyeppen, ........................ 202...</Text>
          <Text>........................ 144...</Text>
        </View>

        <View style={styles.signatureSection}>
          <View style={styles.signatureBox}>
            <Text>Keamanan Daerah</Text>
            <Text style={styles.signatureName}>(........................................)</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text>Kepala Daerah</Text>
            <Text style={styles.signatureName}>(........................................)</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text>Wali Kelas</Text>
            <Text style={styles.signatureName}>(........................................)</Text>
          </View>
        </View>

        <View style={styles.keteranganBox}>
          <Text style={styles.keteranganTitle}>Keterangan:</Text>
          <View style={styles.keteranganRow}>
            <View style={{ flex: 1 }}>
              <View style={styles.keteranganItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.keteranganText}>Santri harus menyelesaikan seluruh tanda tangan kepada pihak yang sudah ditentukan</Text>
              </View>
              <View style={styles.keteranganItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.keteranganText}>Santri harus menyetorkan kembali surat izin pulang kepada kepala daerahnya masing-masing</Text>
              </View>
              <View style={styles.keteranganItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.keteranganText}>Santri wajib melapor kepada kepala daerahnya masing-masing setelah Kembali</Text>
              </View>
            </View>
            {qrDataUrl && (
              <View style={{ alignItems: 'center' }}>
                <Image src={qrDataUrl} style={styles.qrImage} />
                <Text style={{ fontSize: 7, marginTop: 3, textAlign: 'center' }}>{leave.leave_number || ''}</Text>
              </View>
            )}
          </View>
        </View>
        
        <Text style={styles.footer}>
          Dicetak pada {new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} • Dokumen ini sah tanpa tanda tangan basah jika terverifikasi sistem
        </Text>
      </Page>
    </Document>
  );
};

async function imageUrlToPng(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas 2D context not available'));
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = reject;
    img.src = url;
  });
}

export async function openLeavePermitPdf(leave: StudentLeave, kopSuratUrl?: string) {
  // Generate QR
  let qrDataUrl: string | undefined;
  const rawNumber = leave.leave_number != null ? String(leave.leave_number) : '';
  const content = rawNumber.trim();
  if (content) {
    const { default: QRCode } = await import('qrcode');
    qrDataUrl = await QRCode.toDataURL(content, {
      errorCorrectionLevel: 'H',
      margin: 0,
      scale: 4,
    });
  }

  // Convert kop surat URL to base64 to avoid CORS issues in react-pdf
  let kopBase64: string | undefined;
  if (kopSuratUrl) {
    try {
      kopBase64 = await imageUrlToPng(kopSuratUrl);
    } catch (e) {
      console.warn('Gagal memuat kop surat:', e);
      kopBase64 = undefined;
    }
  }

  const blob = await pdf(<LeavePermitDocument leave={leave} qrDataUrl={qrDataUrl} kopSuratUrl={kopBase64} />).toBlob();
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank');
  if (!win) {
    const a = document.createElement('a');
    a.href = url;
    a.download = `kartu-izin-${leave.student?.nis || leave.id}.pdf`;
    a.click();
  }
}