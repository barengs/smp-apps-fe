import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';
import { CalonSantri } from '@/types/calonSantri';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const KOP_SURAT_IMAGE_URL = "/images/KOP PESANTREN.png";

const styles = StyleSheet.create({
  page: {
    paddingHorizontal: 40,
    paddingVertical: 30,
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
  sectionWithBorder: {
    borderTopWidth: 1,
    borderTopColor: '#cccccc',
    paddingTop: 10,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#cccccc',
    paddingBottom: 3,
  },
  flexRow: {
    flexDirection: 'row',
  },
  photoContainer: {
    width: '113.38px', // 40mm
    height: '141.73px', // 50mm
    borderWidth: 1,
    borderColor: '#aaaaaa',
    marginRight: 20,
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0'
  },
  photo: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  infoContainer: {
    flex: 1,
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
    marginTop: 60,
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

interface RegistrationFormPdfProps {
  calonSantri: CalonSantri;
}

const RegistrationFormPdf: React.FC<RegistrationFormPdfProps> = ({ calonSantri }) => {
  const fullNameSantri = `${calonSantri.first_name} ${calonSantri.last_name || ''}`.trim();
  const genderSantri = calonSantri.gender === 'L' ? 'Laki-laki' : 'Perempuan';
  const formattedBornAt = calonSantri.born_at ? format(new Date(calonSantri.born_at), 'dd MMMM yyyy', { locale: id }) : '-';
  const formattedRegistrationDate = calonSantri.created_at ? format(new Date(calonSantri.created_at), 'dd MMMM yyyy', { locale: id }) : '-';
  const parentFullName = calonSantri.parent ? `${calonSantri.parent.first_name} ${calonSantri.parent.last_name || ''}`.trim() : '-';
  
  // Construct absolute URLs for images to work with the proxy
  const absoluteKopUrl = `${window.location.origin}${KOP_SURAT_IMAGE_URL}`;
  const santriPhotoUrl = calonSantri.photo ? `${window.location.origin}/storage/${calonSantri.photo}` : null;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Image style={styles.kopImage} src={absoluteKopUrl} />
          <Text style={styles.title}>FORMULIR PENDAFTARAN SANTRI BARU</Text>
        </View>

        <View style={[styles.section, styles.flexRow]}>
          <View style={styles.photoContainer}>
            {santriPhotoUrl ? <Image style={styles.photo} src={santriPhotoUrl} /> : <Text>Foto 3x4</Text>}
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.sectionTitle}>DATA PRIBADI CALON SANTRI</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>No. Pendaftaran</Text>
              <Text style={styles.detailValue}>: <Text style={{ fontFamily: 'Helvetica-Bold' }}>{calonSantri.registration_number}</Text></Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Tanggal Daftar</Text>
              <Text style={styles.detailValue}>: {formattedRegistrationDate}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Nama Lengkap</Text>
              <Text style={styles.detailValue}>: {fullNameSantri.toUpperCase()}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>NISN</Text>
              <Text style={styles.detailValue}>: {calonSantri.nisn || '-'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>NIK</Text>
              <Text style={styles.detailValue}>: {calonSantri.nik}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Jenis Kelamin</Text>
              <Text style={styles.detailValue}>: {genderSantri}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Tempat, Tgl Lahir</Text>
              <Text style={styles.detailValue}>: {`${calonSantri.born_in}, ${formattedBornAt}`}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Alamat</Text>
              <Text style={styles.detailValue}>: {calonSantri.address}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Telepon</Text>
              <Text style={styles.detailValue}>: {calonSantri.phone || '-'}</Text>
            </View>
          </View>
        </View>

        <View style={[styles.section, styles.sectionWithBorder]}>
          <Text style={styles.sectionTitle}>INFORMASI PENDIDIKAN</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Asal Sekolah</Text>
            <Text style={styles.detailValue}>: {calonSantri.previous_school}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Alamat Sekolah</Text>
            <Text style={styles.detailValue}>: {calonSantri.previous_school_address || '-'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>No. Ijazah</Text>
            <Text style={styles.detailValue}>: {calonSantri.certificate_number || '-'}</Text>
          </View>
        </View>

        {calonSantri.parent && (
          <View style={[styles.section, styles.sectionWithBorder]}>
            <Text style={styles.sectionTitle}>DATA ORANG TUA / WALI</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Nama Lengkap</Text>
              <Text style={styles.detailValue}>: {parentFullName}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Hubungan</Text>
              <Text style={styles.detailValue}>: {calonSantri.parent.parent_as}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>NIK</Text>
              <Text style={styles.detailValue}>: {calonSantri.parent.nik}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>No. KK</Text>
              <Text style={styles.detailValue}>: {calonSantri.parent.kk}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Telepon</Text>
              <Text style={styles.detailValue}>: {calonSantri.parent.phone || '-'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Email</Text>
              <Text style={styles.detailValue}>: {calonSantri.parent.email || '-'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Pekerjaan</Text>
              <Text style={styles.detailValue}>: {calonSantri.parent.occupation || '-'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Pendidikan</Text>
              <Text style={styles.detailValue}>: {calonSantri.parent.education || '-'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Alamat Domisili</Text>
              <Text style={styles.detailValue}>: {calonSantri.parent.domicile_address || '-'}</Text>
            </View>
          </View>
        )}

        <View style={styles.signatureContainer}>
          <View style={styles.signatureBox}>
            <Text>Orang Tua / Wali,</Text>
            <Text style={styles.signatureName}>( {parentFullName} )</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text>Hormat Kami,</Text>
            <Text style={styles.signatureName}>( Panitia Pendaftaran )</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default RegistrationFormPdf;