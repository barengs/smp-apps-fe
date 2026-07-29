import React, { useState, useMemo, useRef, useEffect } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Combobox } from '@/components/ui/combobox';
import { useGetStudentsQuery, type Student } from '@/store/slices/studentApi';
import {
  useGetStudentResignationsQuery,
  useGetStudentResignationByIdQuery,
  useCreateStudentResignationMutation,
  useUpdateStudentResignationMutation,
  useDeleteStudentResignationMutation,
  type StudentResignation,
} from '@/store/slices/studentResignationApi';
import { useGetStudentCardSettingsQuery } from '@/store/slices/studentCardApi';
import { useGetControlPanelSettingsQuery } from '@/store/slices/controlPanelApi';
import { useReactToPrint } from 'react-to-print';
import {
  Plus,
  Search,
  Eye,
  Trash2,
  Printer,
  FileText,
  Check,
  X,
  RefreshCw,
  Download,
  AlertTriangle,
} from 'lucide-react';
import * as toast from '@/utils/toast';

const BoyongPage: React.FC = () => {
  const { t } = useTranslation();
  const STORAGE_BASE_URL = (import.meta.env.VITE_STORAGE_BASE_URL || '') as string;

  // Search & Filter States
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [page, setPage] = useState(1);

  // Queries
  const { data: studentsResponse } = useGetStudentsQuery({ page: 1, per_page: 10000 });
  const {
    data: resignationsResponse,
    isLoading: isLoadingResignations,
    refetch: refetchResignations,
  } = useGetStudentResignationsQuery({
    page,
    per_page: 25,
    search: search || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
    submission_type: typeFilter === 'all' ? undefined : typeFilter,
  });

  const { data: settingsResponse } = useGetStudentCardSettingsQuery();
  const cardSettings = settingsResponse?.data;

  const { data: appSettingsRes } = useGetControlPanelSettingsQuery();
  const appSettings = appSettingsRes?.data;

  // Mutations
  const [createResignation, { isLoading: isCreating }] = useCreateStudentResignationMutation();
  const [updateResignation] = useUpdateStudentResignationMutation();
  const [deleteResignation] = useDeleteStudentResignationMutation();

  // Dialog States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedResignationId, setSelectedResignationId] = useState<number | null>(null);

  // Form States
  const [formStudentId, setFormStudentId] = useState('');
  const [formType, setFormType] = useState<'biasa' | 'pasca_tugas'>('biasa');
  const [formNote, setFormNote] = useState('');
  const [formFile, setFormFile] = useState<File | null>(null);

  // Automatically determine formType based on selected student's status
  useEffect(() => {
    if (!formStudentId || !studentsResponse) return;
    const rawList = Array.isArray(studentsResponse)
      ? studentsResponse
      : (studentsResponse as { data?: Student[] })?.data || [];
    const selectedStudent = rawList.find((s) => String(s.id) === formStudentId);
    if (selectedStudent) {
      if (selectedStudent.status === 'Tugas') {
        setFormType('pasca_tugas');
      } else {
        setFormType('biasa');
      }
    }
  }, [formStudentId, studentsResponse]);

  // Active resignation detail
  const { data: activeResignationRes, isLoading: isLoadingDetail } = useGetStudentResignationByIdQuery(
    selectedResignationId!,
    { skip: !selectedResignationId }
  );
  const activeResignation = activeResignationRes?.data;

  // Print Refs and Hooks
  const boyongPrintRef = useRef<HTMLDivElement>(null);
  const violationsPrintRef = useRef<HTMLDivElement>(null);

  const handlePrintBoyong = useReactToPrint({
    contentRef: boyongPrintRef,
    documentTitle: `Surat_Permohonan_Boyong_${activeResignation?.student?.nis ?? ''}`,
    onAfterPrint: () => toast.showSuccess('Cetak surat permohonan boyong berhasil'),
  });

  const handlePrintViolations = useReactToPrint({
    contentRef: violationsPrintRef,
    documentTitle: `Riwayat_Pelanggaran_${activeResignation?.student?.nis ?? ''}`,
    onAfterPrint: () => toast.showSuccess('Cetak riwayat pelanggaran berhasil'),
  });

  // Students list mapping for Combobox
  const studentsList = useMemo(() => {
    if (!studentsResponse) return [];
    // Only show active or on duty students for eligibility
    const rawList = Array.isArray(studentsResponse)
      ? studentsResponse
      : (studentsResponse as { data?: Student[] })?.data || [];
    return rawList
      .filter((s: Student) => s.status === 'Aktif' || s.status === 'Tugas')
      .map((s: Student) => ({
        value: String(s.id),
        label: `${s.nis} — ${s.first_name} ${s.last_name || ''} (${s.status})`,
      }));
  }, [studentsResponse]);

  const handleOpenDetail = (id: number) => {
    setSelectedResignationId(id);
    setIsDetailOpen(true);
  };

  const handleResetForm = () => {
    setFormStudentId('');
    setFormType('biasa');
    setFormNote('');
    setFormFile(null);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formStudentId) {
      toast.showError('Silakan pilih santri terlebih dahulu.');
      return;
    }
    if (!formFile) {
      toast.showError('Silakan unggah dokumen persyaratan.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('student_id', formStudentId);
      formData.append('submission_type', formType);
      formData.append('note', formNote);
      formData.append('attachment', formFile);

      await createResignation(formData).unwrap();
      toast.showSuccess('Pengajuan keluar santri berhasil dibuat');
      setIsAddOpen(false);
      handleResetForm();
      refetchResignations();
    } catch (error: unknown) {
      console.error(error);
      const err = error as { data?: { message?: string } };
      toast.showError(err.data?.message || 'Gagal membuat pengajuan.');
    }
  };

  const handleUpdateStatus = async (status: 'proses' | 'disetujui' | 'ditolak') => {
    if (!selectedResignationId) return;

    try {
      const formData = new FormData();
      formData.append('_method', 'PUT');
      formData.append('status', status);
      formData.append('student_id', String(activeResignation?.student_id));
      formData.append('submission_type', activeResignation?.submission_type || 'biasa');

      await updateResignation({ id: selectedResignationId, data: formData }).unwrap();
      toast.showSuccess(`Status pengajuan berhasil diubah menjadi ${status}`);
      refetchResignations();
    } catch (error: unknown) {
      console.error(error);
      const err = error as { data?: { message?: string } };
      toast.showError(err.data?.message || 'Gagal memperbarui status pengajuan.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus pengajuan ini?')) return;

    try {
      await deleteResignation(id).unwrap();
      toast.showSuccess('Pengajuan keluar berhasil dihapus');
      refetchResignations();
    } catch (error: unknown) {
      console.error(error);
      const err = error as { data?: { message?: string } };
      toast.showError(err.data?.message || 'Gagal menghapus pengajuan.');
    }
  };

  // Status rendering helpers
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">Menunggu</Badge>;
      case 'proses':
        return <Badge className="bg-blue-600 hover:bg-blue-700 text-white">Diproses</Badge>;
      case 'disetujui':
        return <Badge variant="success">Disetujui</Badge>;
      case 'ditolak':
        return <Badge variant="destructive">Ditolak</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formattedDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <DashboardLayout title="Pengajuan Keluar (Boyong) Santri" role="administrasi">
      <div className="space-y-6">
        {/* Summary Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20 shadow-sm backdrop-blur-sm">
            <CardHeader className="p-4 pb-0">
              <CardTitle className="text-sm font-medium text-amber-600 dark:text-amber-400">Total Menunggu</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="text-3xl font-extrabold">
                {resignationsResponse?.data?.data?.filter((r) => r.status === 'pending').length ?? 0}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20 shadow-sm backdrop-blur-sm">
            <CardHeader className="p-4 pb-0">
              <CardTitle className="text-sm font-medium text-blue-600 dark:text-blue-400">Sedang Diproses</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="text-3xl font-extrabold">
                {resignationsResponse?.data?.data?.filter((r) => r.status === 'proses').length ?? 0}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20 shadow-sm backdrop-blur-sm">
            <CardHeader className="p-4 pb-0">
              <CardTitle className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Disetujui</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="text-3xl font-extrabold">
                {resignationsResponse?.data?.data?.filter((r) => r.status === 'disetujui').length ?? 0}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-zinc-500/10 to-zinc-600/5 border-zinc-500/20 shadow-sm backdrop-blur-sm">
            <CardHeader className="p-4 pb-0">
              <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Ditolak</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="text-3xl font-extrabold">
                {resignationsResponse?.data?.data?.filter((r) => r.status === 'ditolak').length ?? 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and List */}
        <Card className="shadow-md">
          <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" /> Daftar Pengajuan Keluar (Boyong)
            </CardTitle>
            <Button onClick={() => setIsAddOpen(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> Tambah Pengajuan
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari nama santri atau NIS..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 w-full"
                />
              </div>
              <div className="w-full md:w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="pending">Menunggu</SelectItem>
                    <SelectItem value="proses">Diproses</SelectItem>
                    <SelectItem value="disetujui">Disetujui</SelectItem>
                    <SelectItem value="ditolak">Ditolak</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full md:w-48">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Posisi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Posisi</SelectItem>
                    <SelectItem value="biasa">Santri Biasa (Belum Tugas)</SelectItem>
                    <SelectItem value="pasca_tugas">Santri Pasca Tugas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>NIS</TableHead>
                    <TableHead>Nama Santri</TableHead>
                    <TableHead>Posisi</TableHead>
                    <TableHead>Tanggal Pengajuan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingResignations ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        Memuat data...
                      </TableCell>
                    </TableRow>
                  ) : resignationsResponse?.data?.data?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Tidak ada pengajuan keluar santri.
                      </TableCell>
                    </TableRow>
                  ) : (
                    resignationsResponse?.data?.data?.map((res) => (
                      <TableRow key={res.id}>
                        <TableCell className="font-semibold">{res.student?.nis}</TableCell>
                        <TableCell>
                          {res.student?.first_name} {res.student?.last_name || ''}
                        </TableCell>
                        <TableCell>
                          {res.submission_type === 'biasa' ? (
                            <Badge variant="outline">Biasa (Belum Tugas)</Badge>
                          ) : (
                            <Badge variant="outline" className="border-purple-300 text-purple-700 bg-purple-50">
                              Pasca Tugas
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{formattedDate(res.created_at)}</TableCell>
                        <TableCell>{getStatusBadge(res.status)}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleOpenDetail(res.id)}>
                            <Eye className="h-4 w-4 mr-1" /> Detail
                          </Button>
                          {res.status !== 'disetujui' && (
                            <Button variant="outline" size="sm" onClick={() => handleDelete(res.id)} className="text-red-600 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* DIALOG: Tambah Pengajuan */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Buat Pengajuan Keluar (Boyong)</DialogTitle>
            <DialogDescription>Isi detail formulir di bawah ini untuk mengajukan pemberhentian santri.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div className="space-y-2">
              <div className="text-sm font-semibold mb-1">Pilih Santri</div>
              <Combobox
                options={studentsList}
                value={formStudentId}
                onChange={setFormStudentId}
                placeholder="Cari santri berdasarkan NIS atau Nama..."
              />
            </div>



            <div className="space-y-2 border-l-4 border-amber-500 bg-amber-500/10 p-3 rounded-r-md text-xs text-amber-700 dark:text-amber-400 space-y-1">
              <span className="font-bold flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5" /> Persyaratan Dokumen:
              </span>
              {formType === 'biasa' ? (
                <p>Silakan lampirkan Surat Pernyataan Keluar dari Orang Tua / Wali yang sudah ditandatangani.</p>
              ) : (
                <p>Silakan lampirkan Surat Keterangan Lulus Tugas Pengabdian.</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="text-sm font-semibold mb-1">Unggah Lampiran (PDF / Gambar maks 2MB)</div>
              <Input
                type="file"
                accept="application/pdf,image/*"
                onChange={(e) => setFormFile(e.target.files?.[0] ?? null)}
                required
              />
            </div>

            <div className="space-y-2">
              <div className="text-sm font-semibold mb-1">Catatan / Alasan Berhenti</div>
              <Textarea
                placeholder="Tuliskan alasan santri keluar atau catatan penting lainnya..."
                value={formNote}
                onChange={(e) => setFormNote(e.target.value)}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? 'Menyimpan...' : 'Ajukan Pengajuan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG: Detail & Proses Pengajuan */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" /> Detail Pengajuan Keluar
            </DialogTitle>
          </DialogHeader>
          {isLoadingDetail || !activeResignation ? (
            <div className="py-8 text-center">Memuat detail pengajuan...</div>
          ) : (
            <div className="space-y-6">
              {/* Grid detail */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-zinc-900 p-4 rounded-lg">
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase">Biodata Santri</h4>
                  <p className="text-sm">
                    <strong>Nama:</strong> {activeResignation.student?.first_name} {activeResignation.student?.last_name || ''}
                  </p>
                  <p className="text-sm">
                    <strong>NIS:</strong> {activeResignation.student?.nis}
                  </p>
                  <p className="text-sm">
                    <strong>Program / Asrama:</strong> {activeResignation.student?.program?.name ?? '-'} / {activeResignation.student?.hostel?.name ?? '-'}
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase">Pengajuan</h4>
                  <p className="text-sm flex items-center gap-2">
                    <strong>Status:</strong> {getStatusBadge(activeResignation.status)}
                  </p>
                  <p className="text-sm">
                    <strong>Posisi Pengajuan:</strong> {activeResignation.submission_type === 'biasa' ? 'Biasa (Belum Tugas)' : 'Pasca Tugas'}
                  </p>
                  <p className="text-sm">
                    <strong>Tanggal Pengajuan:</strong> {formattedDate(activeResignation.created_at)}
                  </p>
                </div>
              </div>

              {/* Dokumen lampiran */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Persyaratan / Lampiran Dokumen</h4>
                {activeResignation.attachment_path ? (
                  <Button asChild variant="outline" size="sm">
                    <a
                      href={`${STORAGE_BASE_URL}storage/${activeResignation.attachment_path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" /> Lihat Dokumen Lampiran
                    </a>
                  </Button>
                ) : (
                  <span className="text-sm text-red-500">Tidak ada lampiran dokumen</span>
                )}
              </div>

              {/* Note */}
              <div className="space-y-1">
                <h4 className="text-sm font-semibold">Alasan / Catatan</h4>
                <p className="text-sm text-muted-foreground bg-white dark:bg-zinc-800 p-3 border rounded-md min-h-[60px]">
                  {activeResignation.note || 'Tidak ada catatan.'}
                </p>
              </div>

              {/* Process Actions Panel */}
              {(activeResignation.status === 'pending' || activeResignation.status === 'proses') && (
                <div className="space-y-2 border-t pt-4">
                  <h4 className="text-sm font-semibold text-amber-600">Aksi Proses Administrasi</h4>
                  <div className="flex flex-wrap gap-2">
                    {activeResignation.status === 'pending' && (
                      <Button onClick={() => handleUpdateStatus('proses')} className="bg-blue-600 hover:bg-blue-700">
                        <RefreshCw className="h-4 w-4 mr-2" /> Tandai Diproses
                      </Button>
                    )}
                    <Button onClick={() => handleUpdateStatus('disetujui')} className="bg-emerald-600 hover:bg-emerald-700">
                      <Check className="h-4 w-4 mr-2" /> Setujui Boyong
                    </Button>
                    <Button onClick={() => handleUpdateStatus('ditolak')} variant="danger">
                      <X className="h-4 w-4 mr-2" /> Tolak Pengajuan
                    </Button>
                  </div>
                </div>
              )}

              {/* Printing Buttons Panel */}
              <div className="space-y-2 border-t pt-4 flex justify-between items-center">
                <div className="flex gap-2">
                  {activeResignation.submission_type === 'biasa' && (
                    <Button onClick={handlePrintViolations} variant="outline" className="flex items-center gap-2">
                      <Printer className="h-4 w-4" /> Cetak Riwayat Pelanggaran
                    </Button>
                  )}
                  {(activeResignation.status === 'disetujui' || activeResignation.status === 'proses') && (
                    <Button onClick={handlePrintBoyong} className="bg-primary text-secondary-foreground flex items-center gap-2">
                      <Printer className="h-4 w-4" /> Cetak Surat Boyong
                    </Button>
                  )}
                </div>
                <Button variant="ghost" onClick={() => setIsDetailOpen(false)}>
                  Tutup
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ====================================================================== */}
      {/* AREA CETAK 1: RIWAYAT PELANGGARAN (HIDDEN DI LAYAR, MUNCUL SAAT PRINT) */}
      {/* ====================================================================== */}
      <div style={{ display: 'none' }}>
        <div
          ref={violationsPrintRef}
          className="p-10 text-black bg-white w-full max-w-[210mm] mx-auto min-h-[297mm]"
          style={{ fontFamily: "'Times New Roman', Times, serif" }}
        >
          {/* Header */}
          <div className="text-center mb-6 border-b-4 border-black pb-4 flex items-center justify-center gap-4">
            {cardSettings?.kop_surat && (
              <img
                src={`${STORAGE_BASE_URL}${cardSettings.kop_surat}`}
                alt=""
                className="max-h-24 object-contain w-full"
              />
            )}
            {!cardSettings?.kop_surat && (
              <div className="w-full">
                <h1 className="text-xl font-bold uppercase">{appSettings?.app_name || 'PONDOK PESANTREN'}</h1>
                <p className="text-sm font-semibold">{appSettings?.app_address || 'Alamat Lengkap Pesantren'}</p>
                <p className="text-xs text-muted-foreground">Telepon: {appSettings?.app_phone || '-'} | Email: {appSettings?.app_email || '-'}</p>
              </div>
            )}
          </div>

          <div className="text-center mb-6">
            <h2 className="text-lg font-bold underline uppercase">RIWAYAT PELANGGARAN SANTRI</h2>
            <p className="text-sm">Dokumen Lampiran Pengajuan Keluar (Boyong)</p>
          </div>

          {/* Student Info */}
          <table className="w-full mb-6 text-sm font-semibold">
            <tbody>
              <tr>
                <td className="w-32 py-1">Nama Santri</td>
                <td className="w-4">:</td>
                <td>{activeResignation?.student?.first_name} {activeResignation?.student?.last_name || ''}</td>
                <td className="w-32">Program Studi</td>
                <td className="w-4">:</td>
                <td>{activeResignation?.student?.program?.name ?? '-'}</td>
              </tr>
              <tr>
                <td className="py-1">NIS</td>
                <td>:</td>
                <td>{activeResignation?.student?.nis}</td>
                <td>Kamar / Asrama</td>
                <td>:</td>
                <td>{activeResignation?.student?.hostel?.name ?? '-'}</td>
              </tr>
            </tbody>
          </table>

          {/* Violations Table */}
          <table className="w-full border-collapse border border-black mb-10 text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-black px-3 py-2 text-left w-12">No</th>
                <th className="border border-black px-3 py-2 text-left w-32">Tanggal</th>
                <th className="border border-black px-3 py-2 text-left">Nama Pelanggaran</th>
                <th className="border border-black px-3 py-2 text-left w-36">Kategori</th>
                <th className="border border-black px-3 py-2 text-left w-32">Sanksi / Poin</th>
              </tr>
            </thead>
            <tbody>
              {!activeResignation?.student?.violations || activeResignation.student.violations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="border border-black px-3 py-4 text-center text-gray-500">
                    Bersih / Tidak memiliki catatan pelanggaran.
                  </td>
                </tr>
              ) : (
                activeResignation.student.violations.map((violation, idx) => (
                  <TableRow key={violation.id}>
                    <td className="border border-black px-3 py-2">{idx + 1}</td>
                    <td className="border border-black px-3 py-2">{formattedDate(violation.violation_date)}</td>
                    <td className="border border-black px-3 py-2">{violation.violation?.name}</td>
                    <td className="border border-black px-3 py-2">{violation.violation?.category?.name ?? '-'}</td>
                    <td className="border border-black px-3 py-2">
                      {violation.sanctions?.map((s) => s.sanction?.name).join(', ') || '-'} 
                      {violation.sanctions?.some((s) => s.sanction?.point_value) && (
                        ` (${violation.sanctions.reduce((acc, curr) => acc + (curr.sanction?.point_value ?? 0), 0)} Poin)`
                      )}
                    </td>
                  </TableRow>
                ))
              )}
            </tbody>
          </table>

          {/* Footers / Signatures */}
          <div className="flex justify-between text-sm mt-12">
            <div>
              <p>Petugas Kamtib,</p>
              <br />
              <br />
              <br />
              <p className="font-bold underline">( ____________________ )</p>
            </div>
            <div className="text-right">
              <p>Pamekasan, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p>Kepala Bidang Kesantrian,</p>
              <br />
              <br />
              <br />
              <p className="font-bold underline">( ____________________ )</p>
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================================== */}
      {/* AREA CETAK 2: SURAT PERMOHONAN BERHENTI (BOYONG) (HIDDEN DI LAYAR) */}
      {/* ====================================================================== */}
      <div style={{ display: 'none' }}>
        <div
          ref={boyongPrintRef}
          className="p-10 text-black bg-white w-full max-w-[210mm] mx-auto min-h-[297mm]"
          style={{ fontFamily: "'Times New Roman', Times, serif", lineHeight: '1.6' }}
        >
          {/* Kop Surat */}
          <div className="text-center mb-6 border-b-4 border-black pb-4 flex items-center justify-center gap-4">
            {cardSettings?.kop_surat && (
              <img
                src={`${STORAGE_BASE_URL}${cardSettings.kop_surat}`}
                alt=""
                className="max-h-24 object-contain w-full"
              />
            )}
            {!cardSettings?.kop_surat && (
              <div className="w-full">
                <h1 className="text-xl font-bold uppercase">{appSettings?.app_name || 'PONDOK PESANTREN'}</h1>
                <p className="text-sm font-semibold">{appSettings?.app_address || 'Alamat Lengkap Pesantren'}</p>
                <p className="text-xs text-muted-foreground">Telepon: {appSettings?.app_phone || '-'} | Email: {appSettings?.app_email || '-'}</p>
              </div>
            )}
          </div>

          <div className="text-center mb-8">
            <h2 className="text-xl font-bold underline uppercase">SURAT KETERANGAN BERHENTI (BOYONG)</h2>
            <p className="text-sm">Nomor: {activeResignation?.id ?? '___'}/YYS/BYG/{new Date().getFullYear()}</p>
          </div>

          <p className="text-justify text-sm mb-4">
            Yang bertanda tangan di bawah ini Pengurus Pondok Pesantren menerangkan bahwa santri yang tersebut di bawah ini:
          </p>

          {/* Student details */}
          <table className="w-full mb-6 ml-6 text-sm">
            <tbody>
              <tr>
                <td className="w-36 py-1">Nama Santri</td>
                <td className="w-4">:</td>
                <td className="font-bold">{activeResignation?.student?.first_name} {activeResignation?.student?.last_name || ''}</td>
              </tr>
              <tr>
                <td className="py-1">NIS</td>
                <td>:</td>
                <td>{activeResignation?.student?.nis}</td>
              </tr>
              <tr>
                <td className="py-1">Program / Asrama</td>
                <td>:</td>
                <td>{activeResignation?.student?.program?.name ?? '-'} / {activeResignation?.student?.hostel?.name ?? '-'}</td>
              </tr>
              <tr>
                <td className="py-1">Kategori / Posisi</td>
                <td>:</td>
                <td>{activeResignation?.submission_type === 'biasa' ? 'Santri Biasa (Belum Tugas)' : 'Santri Pasca Tugas'}</td>
              </tr>
              <tr>
                <td className="py-1">Orang Tua / Wali</td>
                <td>:</td>
                <td>
                  {activeResignation?.student?.parents?.[0]
                    ? `${activeResignation.student.parents[0].first_name} ${activeResignation.student.parents[0].last_name || ''}`
                    : '-'}
                </td>
              </tr>
            </tbody>
          </table>

          <p className="text-justify text-sm mb-4">
            Telah secara resmi mengajukan permohonan berhenti (boyong) sebagai santri Pondok Pesantren karena alasan:{' '}
            <strong>{activeResignation?.note || 'Keperluan keluarga / mandiri'}</strong>.
          </p>

          <p className="text-justify text-sm mb-8">
            Demikian surat keterangan ini dibuat dengan sebenarnya untuk dapat dipergunakan sebagaimana mestinya. Semoga Allah SWT senantiasa memberikan taufiq, hidayah, serta kesuksesan di masa mendatang.
          </p>

          {/* Signatures */}
          <div className="grid grid-cols-3 text-center text-sm gap-4 mt-12">
            <div>
              <p>Wali Santri / Pemohon,</p>
              <br />
              <br />
              <br />
              <p className="font-bold underline">
                {activeResignation?.student?.parents?.[0]
                  ? `( ${activeResignation.student.parents[0].first_name} ${activeResignation.student.parents[0].last_name || ''} )`
                  : '( Wali Santri )'}
              </p>
            </div>
            <div>
              <p>Santri Bersangkutan,</p>
              <br />
              <br />
              <br />
              <p className="font-bold underline">
                ( {activeResignation?.student?.first_name} {activeResignation?.student?.last_name || ''} )
              </p>
            </div>
            <div>
              <p>Pamekasan, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p>Pengurus Kesantrian,</p>
              <br />
              <br />
              <br />
              <p className="font-bold underline">( ____________________ )</p>
            </div>
          </div>

          <div className="text-center text-sm mt-16">
            <p className="font-semibold">Mengetahui & Menyetujui,</p>
            <p className="font-bold">Ketua Yayasan</p>
            <br />
            <br />
            <br />
            <br />
            <p className="font-bold underline uppercase">( KH. ACHMAD MUSTAFA, M.Pd )</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BoyongPage;
