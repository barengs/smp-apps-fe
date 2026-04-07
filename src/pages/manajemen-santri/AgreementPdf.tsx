import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';
import type { Student, StudentAgreement } from '@/store/slices/studentApi';

// Register fonts if needed, or use defaults
const styles = StyleSheet.create({
  page: {
    padding: 50,
    paddingTop: 20,
    fontSize: 11,
    lineHeight: 1.6,
    fontFamily: 'Helvetica',
  },
  kopImage: {
    width: '100%',
    height: 'auto',
    marginBottom: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    textDecoration: 'underline',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  docNumber: {
    textAlign: 'center',
    fontSize: 10,
    marginTop: -5,
    marginBottom: 15,
  },
  text: {
    marginBottom: 10,
    textAlign: 'justify',
  },
  bold: {
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  label: {
    width: 120,
  },
  colon: {
    width: 10,
  },
  value: {
    flex: 1,
  },
  signatureContainer: {
    marginTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureBox: {
    width: 180,
    textAlign: 'center',
  },
  signatureSpace: {
    height: 60,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  checkbox: {
    width: 12,
    height: 12,
    borderWidth: 1,
    borderColor: '#000',
    marginRight: 8,
  },
  checked: {
    backgroundColor: '#000',
  }
});

interface AgreementPdfProps {
  student: Student;
  agreement: StudentAgreement;
  kopSuratUrl?: string;
}

const StudentDataSection = ({ student }: { student: Student }) => (
  <View style={{ marginBottom: 15, marginLeft: 20 }}>
    <View style={styles.row}>
      <Text style={styles.label}>Nama Lengkap</Text>
      <Text style={styles.colon}>:</Text>
      <Text style={styles.value}>{student.first_name} {student.last_name}</Text>
    </View>
    <View style={styles.row}>
      <Text style={styles.label}>Tempat, Tgl. Lahir</Text>
      <Text style={styles.colon}>:</Text>
      <Text style={styles.value}>{student.born_in}, {student.born_at ? new Date(student.born_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}</Text>
    </View>
    <View style={styles.row}>
      <Text style={styles.label}>Alamat Lengkap</Text>
      <Text style={styles.colon}>:</Text>
      <Text style={styles.value}>{student.address || '-'}</Text>
    </View>
    <View style={styles.row}>
      <Text style={styles.label}>Nama Orang Tua/Wali</Text>
      <Text style={styles.colon}>:</Text>
      <Text style={styles.value}>{student.parents?.name || student.parents?.[0]?.name || '-'}</Text>
    </View>
  </View>
);

const KopSurat = ({ url }: { url?: string }) => (
  url ? (
    <Image src={url} style={styles.kopImage} />
  ) : (
    <View style={{ height: 80, borderBottomWidth: 2, borderBottomColor: '#000', marginBottom: 10 }} />
  )
);

export const AgreementPdf: React.FC<AgreementPdfProps> = ({ student, agreement, kopSuratUrl }) => (
  <Document>
    {/* Page 1: Perjanjian Kontrak */}
    <Page size="A4" style={styles.page}>
      <KopSurat url={kopSuratUrl} />
      <Text style={styles.title}>Surat Perjanjian Kontrak</Text>
      <Text style={styles.docNumber}>Nomor: {agreement.doc_number}/PK/{new Date().getFullYear()}</Text>
      
      <Text style={styles.text}>Yang bertanda tangan di bawah ini, saya:</Text>
      <StudentDataSection student={student} />
      
      <Text style={styles.text}>
        Menyatakan dengan sebenarnya bahwa saya bersedia menetap dan belajar sebagai santri di Pondok Pesantren "Miftahul Ulum" Panyeppen sampai tuntas menempuh pendidikan pada tingkat:
      </Text>
      
      <View style={{ marginLeft: 30, marginBottom: 15 }}>
        {['ULA', 'WUSTHO', 'ULYA', 'TUGAS'].map((level) => (
          <View key={level} style={styles.checkboxRow}>
            <View style={[styles.checkbox, agreement.contract_level === level ? styles.checked : {}]} />
            <Text>{level}</Text>
          </View>
        ))}
      </View>
      
      <Text style={styles.text}>
        Demikian surat perjanjian ini saya buat dengan penuh kesadaran dan tanpa paksaan dari pihak manapun.
      </Text>
      
      <View style={styles.signatureContainer}>
        <View style={styles.signatureBox}>
          <Text>Mengetahui,</Text>
          <Text>Orang Tua / Wali</Text>
          <View style={styles.signatureSpace} />
          <Text>( ............................ )</Text>
        </View>
        <View style={styles.signatureBox}>
          <Text>Pamekasan, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</Text>
          <Text>Yang Menyatakan,</Text>
          <View style={styles.signatureSpace} />
          <Text style={{ fontWeight: 'bold' }}>{student.first_name} {student.last_name}</Text>
        </View>
      </View>
    </Page>

    {/* Page 2: Pernyataan Taat Undang-Undang */}
    <Page size="A4" style={styles.page}>
      <KopSurat url={kopSuratUrl} />
      <Text style={styles.title}>Surat Pernyataan Taat Undang-Undang</Text>
      <Text style={styles.docNumber}>Nomor: {agreement.doc_number}/PUU/{new Date().getFullYear()}</Text>
      
      <Text style={styles.text}>Saya yang bertanda tangan di bawah ini:</Text>
      <StudentDataSection student={student} />
      
      <Text style={styles.text}>Dengan ini menyatakan bahwa selama menjadi santri di Pondok Pesantren "Miftahul Ulum" Panyeppen, saya berjanji:</Text>
      
      <View style={{ marginLeft: 20, marginBottom: 15 }}>
        <Text style={styles.text}>1. Akan senantiasa taat dan patuh pada seluruh Undang-Undang, Peraturan, dan Kebijakan yang berlaku di Pondok Pesantren "Miftahul Ulum" Panyeppen.</Text>
        <Text style={styles.text}>2. Akan melaksanakan seluruh kesepakatan dan perjanjian yang telah ditandatangani.</Text>
        <Text style={styles.text}>3. Bersedia mengikuti dan mematuhi seluruh kebijakan Ikatan Alumni Banyuanyar Panyeppen (IKBAS) setelah menyelesaikan pendidikan.</Text>
        <Text style={styles.text}>4. Bersedia menerima sanksi sesuai dengan ketentuan yang berlaku apabila saya melanggar pernyataan ini.</Text>
      </View>
      
      <Text style={styles.text}>Demikian pernyataan ini saya buat dengan sebenarnya untuk dapat dipergunakan sebagaimana mestinya.</Text>
      
      <View style={styles.signatureContainer}>
        <View style={styles.signatureBox}>
          <Text>Mengetahui,</Text>
          <Text>Orang Tua / Wali</Text>
          <View style={styles.signatureSpace} />
          <Text>( ............................ )</Text>
        </View>
        <View style={styles.signatureBox}>
          <Text>Pamekasan, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</Text>
          <Text>Yang Menyatakan,</Text>
          <View style={styles.signatureSpace} />
          <Text style={{ fontWeight: 'bold' }}>{student.first_name} {student.last_name}</Text>
        </View>
      </View>
    </Page>

    {/* Page 3: Pernyataan Tes Urin */}
    <Page size="A4" style={styles.page}>
      <KopSurat url={kopSuratUrl} />
      <Text style={styles.title}>Surat Pernyataan Tes Urin</Text>
      <Text style={styles.docNumber}>Nomor: {agreement.doc_number}/PTU/{new Date().getFullYear()}</Text>
      
      <Text style={styles.text}>Saya yang bertanda tangan di bawah ini:</Text>
      <StudentDataSection student={student} />
      
      <Text style={styles.text}>
        Dengan ini menyatakan bersedia dan setuju untuk dilakukan pemeriksaan tes urin sebagai salah satu syarat administrasi dan kesehatan untuk menjadi santri di Pondok Pesantren "Miftahul Ulum" Panyeppen.
      </Text>
      
      <Text style={styles.text}>
        Apabila hasil tes menyatakan hal yang melanggar ketentuan pesantren, saya bersedia menerima sanksi hukum atau bimbingan khusus sesuai dengan keputusan pimpinan Pondok Pesantren.
      </Text>
      
      <Text style={styles.text}>Demikian pernyataan ini saya buat dengan penuh kesadaran.</Text>
      
      <View style={styles.signatureContainer}>
        <View style={styles.signatureBox}>
          <Text>Menyambung/Menyetujui,</Text>
          <Text>Orang Tua / Wali</Text>
          <View style={styles.signatureSpace} />
          <Text>( ............................ )</Text>
        </View>
        <View style={styles.signatureBox}>
          <Text>Pamekasan, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</Text>
          <Text>Yang Menyatakan,</Text>
          <View style={styles.signatureSpace} />
          <Text style={{ fontWeight: 'bold' }}>{student.first_name} {student.last_name}</Text>
        </View>
      </View>
    </Page>
  </Document>
);
