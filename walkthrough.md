# Walkthrough - Fitur Pengajuan Keluar (Boyong) Santri

Berhasil mengimplementasikan fitur Pengajuan Keluar (Boyong) Santri di frontend dan backend dengan validasi kriteria, pencetakan riwayat pelanggaran, serta pencetakan surat berhenti yang disetujui Ketua Yayasan.

## Perubahan yang Dilakukan

### 1. Database & Seeder (SMPT)
- **Migration**: Membuat tabel `student_resignations` untuk menyimpan data pengajuan keluar santri (tipe pengajuan, status, file lampiran, catatan/alasan, log pemroses, soft delete).
- **Seeder**: Menambahkan menu baru **"Pengajuan Boyong"** di `MenuSeeder.php` di bawah "Manajemen Santri" dan mengaktifkan izin untuk superadmin (`buat boyong`, `lihat boyong`, `ubah boyong`, `hapus boyong`).

### 2. Backend (SMPT)
- **Model**: Membuat `StudentResignation.php` dan mendefinisikan relasi `student` (ke santri) dan `processor` (ke pemroses admin). Menambahkan relasi `resignations` ke model `Student.php`.
- **Request Validator**: Membuat `StudentResignationRequest.php` untuk validasi input form (wajib student_id, tipe pengajuan, file lampiran, dll).
- **Controller**: Membuat `StudentResignationController.php` dengan endpoint:
  - `index`: Mendapatkan data pengajuan dengan paginasi, pencarian nama/NIS, filter status & tipe.
  - `store`: Melakukan pengecekan kelayakan posisi santri:
    - Santri Biasa (belum bertugas): Harus berstatus `Aktif`.
    - Santri Pasca Tugas: Harus berstatus `Tugas`.
    - Mencegah pengajuan ganda jika ada yang masih pending/proses.
    - Menyimpan file di folder `uploads/resignations`.
  - `update`: Melakukan proses persetujuan status. Jika status diubah ke `disetujui`, secara otomatis memperbarui status santri di database menjadi `Tidak Aktif`.
  - `destroy`: Menghapus data pengajuan (khusus yang belum disetujui).
- **Route**: Mendaftarkan resource route `student-resignations` di `routes/api.php`.

### 3. Frontend (smp-apps-fe)
- **API Slice**: Membuat `studentResignationApi.ts` untuk mengintegrasikan RTK Query query & mutations (`getStudentResignations`, `createStudentResignation`, `updateStudentResignation`, `deleteStudentResignation`).
- **Route Registry**: Mendaftarkan route `/dashboard/santri/boyong` di `App.tsx`.
- **Main View (`BoyongPage.tsx`)**:
  - Menyediakan ringkasan status pengajuan (Menunggu, Diproses, Disetujui, Ditolak).
  - Menyediakan filter pencarian nama/NIS, status, dan tipe posisi.
  - Menyediakan modal dialog form tambah pengajuan (memilih santri via Combobox pencarian, mengunggah berkas persyaratan, menulis alasan).
  - Menyediakan dialog detail pengajuan untuk menampilkan dokumen lampiran, riwayat pelanggaran santri (jika santri biasa), serta panel aksi proses (Tandai Diproses, Setujui, Tolak).
  - Menyediakan templat cetak tersembunyi untuk **Riwayat Pelanggaran Santri** dan **Surat Keterangan Berhenti (Boyong)** lengkap dengan tanda tangan wali santri, santri, pengurus, serta Ketua Yayasan.

## Pengujian

1. **Unit Test**: Membuat `StudentResignationTest.php` untuk memverifikasi fungsionalitas CRUD & alur persetujuan. Hasil tes:
   - `can get resignations list` -> PASS
   - `can create resignation for aktif student` -> PASS
   - `cannot create resignation with invalid student status` -> PASS
   - `can approve resignation and sets student inactive` -> PASS
   - `can delete pending resignation` -> PASS
2. **Type Check & Compilation**:
   - `npx tsc --noEmit` -> Berhasil (Tidak ada error type)
   - `npm run build` -> Berhasil (Produksi build sukses terkompilasi)
