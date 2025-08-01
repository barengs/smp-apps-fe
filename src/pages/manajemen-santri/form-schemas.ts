import { z } from 'zod';

const fileSchema = z.any()
  .refine(file => file instanceof File && file.size > 0, { message: "File wajib diunggah." })
  .refine(file => file instanceof File && file.size <= 2 * 1024 * 1024, { message: "Ukuran file maksimal 2MB." });

// New schema for an individual optional document
const optionalDocumentItemSchema = z.object({
  name: z.string().min(1, "Nama dokumen wajib diisi."),
  file: fileSchema,
});

export const santriFormSchema = z.object({
  // Step 1: Wali Santri
  nik: z.string({ required_error: "NIK wajib diisi." }).length(16, "NIK harus 16 digit."),
  kk: z.string({ required_error: "Nomor KK wajib diisi." }).regex(/^\d{16}$/, "Nomor KK harus 16 digit angka."),
  firstName: z.string({ required_error: "Nama depan wali wajib diisi." }).min(1, "Nama depan wali wajib diisi."),
  lastName: z.string().optional(),
  gender: z.enum(['L', 'P'], { required_error: "Jenis kelamin wali wajib dipilih." }),
  parentAs: z.enum(['ayah', 'ibu', 'wali'], { required_error: "Peran sebagai wali wajib dipilih." }),
  phone: z.string({ required_error: "Nomor telepon wajib diisi." }).min(10, "Nomor telepon tidak valid."),
  email: z.string().email("Format email tidak valid.").optional().or(z.literal('')),
  pekerjaanValue: z.string({ required_error: "Pekerjaan wajib dipilih." }).min(1, "Pekerjaan wajib dipilih."),
  alamatKtp: z.string({ required_error: "Alamat KTP wajib diisi." }).min(1, "Alamat KTP wajib diisi."),
  alamatDomisili: z.string().optional(),

  // Step 2: Santri Profile
  firstNameSantri: z.string({ required_error: "Nama depan santri wajib diisi." }).min(1, "Nama depan santri wajib diisi."),
  lastNameSantri: z.string({ required_error: "Nama belakang santri wajib diisi." }).min(1, "Nama belakang santri wajib diisi."),
  nisn: z.string({ required_error: "NISN wajib diisi." }).min(1, "NISN wajib diisi."),
  nikSantri: z.string({ required_error: "NIK santri wajib diisi." }).length(16, "NIK santri harus 16 digit."),
  tempatLahir: z.string({ required_error: "Tempat lahir wajib diisi." }).min(1, "Tempat lahir wajib diisi."),
  tanggalLahir: z.date({ required_error: "Tanggal lahir wajib diisi." }),
  jenisKelamin: z.enum(['L', 'P'], { required_error: "Jenis kelamin santri wajib dipilih." }),
  alamatSantri: z.string({ required_error: "Alamat lengkap santri wajib diisi." }).min(1, "Alamat lengkap santri wajib diisi."),

  // Step 3: Education & Photo
  sekolahAsal: z.string({ required_error: "Nama sekolah wajib diisi." }).min(1, "Nama sekolah wajib diisi."),
  jenjangSebelumnya: z.string({ required_error: "Jenjang pendidikan wajib diisi." }).min(1, "Jenjang pendidikan wajib diisi."),
  alamatSekolah: z.string({ required_error: "Alamat sekolah wajib diisi." }).min(1, "Alamat sekolah wajib diisi."),
  fotoSantri: fileSchema,

  // Step 4: Documents
  ijazahFile: fileSchema,
  optionalDocuments: z.array(optionalDocumentItemSchema).optional(), // Add this for optional documents
});

export type SantriFormValues = z.infer<typeof santriFormSchema>;

// Define fields for each step to trigger validation correctly
export const step1Fields: (keyof SantriFormValues)[] = ['nik', 'kk', 'firstName', 'gender', 'parentAs', 'phone', 'pekerjaanValue', 'alamatKtp'];
export const step2Fields: (keyof SantriFormValues)[] = ['firstNameSantri', 'lastNameSantri', 'nisn', 'nikSantri', 'tempatLahir', 'tanggalLahir', 'jenisKelamin', 'alamatSantri'];
export const step3Fields: (keyof SantriFormValues)[] = ['sekolahAsal', 'jenjangSebelumnya', 'alamatSekolah', 'fotoSantri'];
export const step4Fields: (keyof SantriFormValues)[] = ['ijazahFile', 'optionalDocuments']; // Add optionalDocuments here