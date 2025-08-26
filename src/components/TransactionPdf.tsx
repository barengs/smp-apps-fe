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
  detailRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  detailLabel: {
    width: 120,
    fontFamily: 'Helvetica-Bold',
  },
  detailValue: {
    flex: 1,
    fontFamily: 'Helvetica',
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
}

const TransactionPdf: React.FC<TransactionPdfProps> = ({ transaction }) => {
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

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Image style={styles.kopImage} src={absoluteKopUrl} />
          <Text style={styles.title}>BUKTI TRANSAKSI</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INFORMASI TRANSAKSI</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>ID Transaksi</Text>
            <Text style={styles.detailValue}>: {transaction.id}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>No. Referensi</Text>
            <Text style={styles.detailValue}>: {transaction.reference_number || '-'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Tipe Transaksi</Text>
            <Text style={styles.detailValue}>: {transaction.transaction_type}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Deskripsi</Text>
            <Text style={styles.detailValue}>: {transaction.description}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Jumlah</Text>
            <Text style={styles.detailValue}>: {formatCurrency(transaction.amount)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status</Text>
            <Text style={styles.detailValue}>: {transaction.status}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Channel</Text>
            <Text style={styles.detailValue}>: {transaction.channel}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Rekening Sumber</Text>
            <Text style={styles.detailValue}>: {
              transaction.source_account
                ? (typeof transaction.source_account === 'object'
                  ? transaction.source_account.account_number
                  : transaction.source_account)
                : '-'
            }</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Rekening Tujuan</Text>
            <Text style={styles.detailValue}>: {
              transaction.destination_account
                ? (typeof transaction.destination_account === 'object'
                  ? transaction.destination_account.account_number
                  : transaction.destination_account)
                : '-'
            }</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Tanggal Dibuat</Text>
            <Text style={styles.detailValue}>: {format(new Date(transaction.created_at), 'dd MMMM yyyy HH:mm', { locale: id })}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Terakhir Diperbarui</Text>
            <Text style={styles.detailValue}>: {format(new Date(transaction.updated_at), 'dd MMMM yyyy HH:mm', { locale: id })}</Text>
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