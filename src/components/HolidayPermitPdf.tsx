"use client";

import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, pdf } from '@react-pdf/renderer';
import type { HolidayPeriod, StudentHolidayCheck } from '@/store/slices/holidayApi';

const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontSize: 10,
        lineHeight: 1.5,
    },
    header: {
        marginBottom: 20,
        borderBottomWidth: 2,
        borderBottomColor: '#000',
        paddingBottom: 10,
        textAlign: 'center',
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    subtitle: {
        fontSize: 12,
        marginTop: 4,
    },
    section: {
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        backgroundColor: '#f3f4f6',
        padding: 4,
        marginBottom: 8,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    label: {
        width: 120,
        color: '#4b5563',
    },
    value: {
        flex: 1,
        fontWeight: 'bold',
    },
    qrContainer: {
        position: 'absolute',
        top: 30,
        right: 30,
        width: 60,
        height: 60,
    },
    footer: {
        marginTop: 40,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    signatureBox: {
        width: 150,
        textAlign: 'center',
    },
    signatureSpace: {
        height: 50,
    },
    signatureName: {
        borderTopWidth: 1,
        borderTopColor: '#000',
        marginTop: 4,
        paddingTop: 2,
    },
    kopImage: {
        width: '100%',
        height: 'auto',
        marginBottom: 10,
    },
});

interface HolidayPermitProps {
    period: HolidayPeriod;
    student: StudentHolidayCheck;
    qrDataUrl?: string;
    kopSuratUrl?: string;
}

export const HolidayPermitDocument: React.FC<HolidayPermitProps> = ({ period, student, qrDataUrl, kopSuratUrl }) => (
    <Document>
        <Page size="A5" orientation="landscape" style={styles.page}>
            {kopSuratUrl && (
                <Image src={kopSuratUrl} style={styles.kopImage} />
            )}

            {qrDataUrl && (
                <View style={[styles.qrContainer, kopSuratUrl ? { top: 70 } : {}]}>
                    <Image src={qrDataUrl} />
                </View>
            )}

            {!kopSuratUrl && (
                <View style={styles.header}>
                    <Text style={styles.title}>Surat Izin Libur Santri</Text>
                    <Text style={styles.subtitle}>{period.name}</Text>
                </View>
            )}
            
            {kopSuratUrl && (
                <View style={{ alignItems: 'center', marginBottom: 15 }}>
                     <Text style={[styles.title, { fontSize: 13 }]}>Surat Izin Libur Santri</Text>
                     <Text style={[styles.subtitle, { marginTop: 2 }]}>{period.name}</Text>
                </View>
            )}

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Data Santri</Text>
                <View style={styles.row}>
                    <Text style={styles.label}>Nama Lengkap</Text>
                    <Text style={styles.value}>: {student.name}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>NIS</Text>
                    <Text style={styles.value}>: {student.nis}</Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Detail Waktu</Text>
                <View style={styles.row}>
                    <Text style={styles.label}>Tanggal Pulang</Text>
                    <Text style={styles.value}>: {new Date(period.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Tanggal Kembali</Text>
                    <Text style={styles.value}>: {new Date(period.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</Text>
                </View>
            </View>

            <View style={styles.footer}>
                <View style={styles.signatureBox}>
                    <Text>Petugas Keamanan</Text>
                    <View style={styles.signatureSpace} />
                    <Text style={styles.signatureName}>( ............................ )</Text>
                </View>
                <View style={styles.signatureBox}>
                    <Text>Pengasuh / Asatidzh</Text>
                    <View style={styles.signatureSpace} />
                    <Text style={styles.signatureName}>( ............................ )</Text>
                </View>
            </View>

            <Text style={{ fontSize: 8, color: '#9ca3af', marginTop: 20, textAlign: 'center' }}>
                Dicetak otomatis oleh sistem pada {new Date().toLocaleString('id-ID')}
            </Text>
        </Page>
    </Document>
);

export async function openHolidayPermitPdf(period: HolidayPeriod, student: StudentHolidayCheck, kopSuratUrl?: string) {
    let qrDataUrl: string | undefined;
    const content = `HOLIDAY-${period.id}-${student.nis}`;

    try {
        const { default: QRCode } = await import('qrcode');
        qrDataUrl = await QRCode.toDataURL(content, {
            errorCorrectionLevel: 'H',
            margin: 0,
            scale: 4,
        });
    } catch (err) {
        console.error('QR Generate error', err);
    }

    const blob = await pdf(<HolidayPermitDocument period={period} student={student} qrDataUrl={qrDataUrl} kopSuratUrl={kopSuratUrl} />).toBlob();
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
}
