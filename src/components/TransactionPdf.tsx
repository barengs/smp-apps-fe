import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';
import { Transaksi } from '@/types/keuangan';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const KOP_SURAT_IMAGE_URL = "/images/KOP PESANTREN.png";

const styles = StyleSheet.create({
  page: {
    paddingHorizontal: 40,
    paddingVertical: 20,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
    fontSize: 10,
    lineHeight: 1.4,
  },
  header: {
    borderBottomWidth: 2,
    borderBottomColor: '#000000',
    paddingBottom: 10,
    marginBottom: 20,
    textAlign: 'center',
    alignItems: 'center',
  },
  kopImage: {
    width: '100%',
    height: 'auto',
    marginBottom: 10,
  },
  headerRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  qrBox: {
    width: 56,
    height: 56,
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 4,
    overflow: 'hidden',
  },
  title: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    marginTop: 10,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#cccccc',
    paddingBottom: 3,
  },
  
  // New styles for table
  table: {
    display: 'flex',
    flexDirection: 'column',
    width: 'auto',
    borderStyle: 'solid',
    borderColor: '#bfbfbf',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginBottom: 10,
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row',
  },
  tableRowEven: {
    backgroundColor: '#f9f9f9',
  },
  tableCell: {
    padding: 5,
    borderStyle: 'solid',
    borderColor: '#bfbfbf',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    fontSize: 9,
  },
  tableCellLabel: {
    width: '35%',
    fontFamily: 'Helvetica-Bold',
  },
  tableCellValue: {
    width: '65%',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#e0e0e0',
  },
  tableHeaderCell: {
    padding: 5,
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    borderStyle: 'solid',
    borderColor: '#bfbfbf',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },

  signatureContainer: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureBox: {
    width: '40%',
    textAlign: 'center',
  },
  signatureName: {
    marginTop: 60,
    fontFamily: 'Helvetica-Bold',
  },
});

interface TransactionPdfProps {
  transaction: Transaksi;
  qrDataUrl?: string;
}

const TransactionPdf: React.FC<TransactionPdfProps> = ({ transaction, qrDataUrl }) => {
  const absoluteKopUrl = `${window.location.origin}${KOP_SURAT_IMAGE_URL}`;

  const formatCurrency = (amount: string) => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount)) return 'N/A';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(numericAmount);
  };

  const transactionDetails = [
    { label: 'ID Transaksi', value: transaction.id },
    { label: 'No. Referensi', value: transaction.reference_number || '-' },
    {
      label: 'Tipe Transaksi',
      value: typeof transaction.transaction_type === 'object' && transaction.transaction_type !== null
        ? transaction.transaction_type.name || transaction.transaction_type.code || 'N/A'
        : typeof transaction.transaction_type === 'string'
          ? transaction.transaction_type
          : 'N/A'
    },
    { label: 'Deskripsi', value: transaction.description },
    { label: 'Jumlah', value: formatCurrency(transaction.amount) },
    { label: 'Status', value: transaction.status },
    { label: 'Channel', value: transaction.channel },
    {
      label: 'Rekening Sumber',
      value: transaction.source_account
        ? (typeof transaction.source_account === 'object'
          ? transaction.source_account.account_number
          : transaction.source_account)
        : '-'
    },
    {
      label: 'Rekening Tujuan',
      value: transaction.destination_account
        ? (typeof transaction.destination_account === 'object'
          ? transaction.destination_account.account_number
          : transaction.destination_account)
        : '-'
    },
    { label: 'Tanggal Dibuat', value: format(new Date(transaction.created_at), 'dd MMMM yyyy HH:mm', { locale: id }) },
    { label: 'Terakhir Diperbarui', value: format(new Date(transaction.updated_at), 'dd MMMM yyyy HH:mm', { locale: id }) },
  ];

  return (
    <Document>
      <Page size="A5" style={styles.page}>
        <View style={styles.header}>
          <Image style={styles.kopImage} src={absoluteKopUrl} />
          <View style={styles.headerRow}>
            <Text style={styles.title}>BUKTI TRANSAKSI</Text>
            {qrDataUrl ? (
              <View style={styles.qrBox}>
                <Image src={qrDataUrl} style={{ width: '100%', height: '100%' }} />
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INFORMASI TRANSAKSI</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, styles.tableCellLabel]}>Label</Text>
              <Text style={[styles.tableHeaderCell, styles.tableCellValue]}>Nilai</Text>
            </View>
            {transactionDetails.map((item, index) => (
              <View key={item.label} style={[styles.tableRow, index % 2 === 1 && styles.tableRowEven]}>
                <Text style={[styles.tableCell, styles.tableCellLabel]}>{item.label}</Text>
                <Text style={[styles.tableCell, styles.tableCellValue]}>{item.value}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.signatureContainer}>
          <View style={styles.signatureBox}>
            <Text>Penerima,</Text>
            <Text style={styles.signatureName}>( _________________________ )</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text>Hormat Kami,</Text>
            <Text style={styles.signatureName}>( Administrasi Keuangan )</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default TransactionPdf;