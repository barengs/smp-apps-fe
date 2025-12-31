import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { santriFormSchema, SantriFormValues, step1Fields, step2Fields, step3Fields, step4Fields, step5Fields } from './form-schemas';
import DashboardLayout from '../../layouts/DashboardLayout';
import CustomBreadcrumb, { type BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { UserPlus, UserCheck, School, FileText, X, ArrowLeft, ArrowRight, Save, Loader2, BookOpenText, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import WaliSantriStep from './form-steps/WaliSantriStep';
import SantriProfileStep from './form-steps/SantriProfileStep';
import EducationStep from './form-steps/EducationStep';
import MadrasahStep from './form-steps/MadrasahStep';
import DocumentStep from './form-steps/DocumentStep';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetCalonSantriByIdQuery, useUpdateCalonSantriMutation } from '@/store/slices/calonSantriApi';
import { showError, showSuccess } from '@/utils/toast';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import TableLoadingSkeleton from '@/components/TableLoadingSkeleton';

const CalonSantriEditPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const santriId = Number(id);

  const { data: santriDataResponse, isLoading: isLoadingSantri, isError } = useGetCalonSantriByIdQuery(santriId, { skip: !santriId });
  const [updateSantri, { isLoading: isUpdating }] = useUpdateCalonSantriMutation();

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const form = useForm<SantriFormValues>({
    resolver: zodResolver(santriFormSchema),
    mode: 'onChange',
    defaultValues: {
      // Wali
      nik: '',
      kk: '',
      firstName: '',
      lastName: '',
      gender: undefined as unknown as 'L',
      parentAs: undefined as unknown as 'ayah',
      phone: '',
      email: '',
      pekerjaanValue: '',
      educationValue: '',
      alamatKtp: '',
      alamatDomisili: '',
      // Santri
      firstNameSantri: '',
      lastNameSantri: '',
      nisn: '',
      nikSantri: '',
      tempatLahir: '',
      tanggalLahir: undefined,
      jenisKelamin: undefined as unknown as 'L',
      alamatSantri: '',
      villageCode: '',
      // Pendidikan
      sekolahAsal: '',
      jenjangSebelumnya: '',
      alamatSekolah: '',
      certificateNumber: '',
      // Madrasah
      sekolahAsalMadrasah: '',
      jenjangSebelumnyaMadrasah: '',
      alamatSekolahMadrasah: '',
      certificateNumberMadrasah: '',
      // Program & Dokumen
      programId: '',
      fotoSantri: undefined as unknown as File,
      ijazahFile: undefined as unknown as File,
      optionalDocuments: [],
    },
  });

  useEffect(() => {
    if (santriDataResponse?.data) {
      const data = santriDataResponse.data;
      const parent = data.parent || {};
      
      form.reset({
        // Wali
        nik: parent.nik || '',
        kk: parent.kk || '',
        firstName: parent.first_name || '',
        lastName: parent.last_name || '',
        gender: parent.gender,
        parentAs: parent.parent_as,
        phone: parent.phone || '',
        email: parent.email || '',
        pekerjaanValue: parent.occupation_id?.toString() || '',
        educationValue: parent.education_id?.toString() || '',
        alamatKtp: parent.card_address || '',
        alamatDomisili: parent.domicile_address || '',

        // Santri
        firstNameSantri: data.first_name || '',
        lastNameSantri: data.last_name || '',
        nisn: data.nisn || '',
        nikSantri: data.nik || '',
        tempatLahir: data.born_in || '',
        tanggalLahir: data.born_at ? new Date(data.born_at) : undefined,
        jenisKelamin: data.gender as "L" | "P", // Type assertion
        alamatSantri: data.address || '',
        villageCode: data.village_id?.toString() || '',

        // Pendidikan
        sekolahAsal: data.previous_school || '',
        jenjangSebelumnya: data.education_level_id?.toString() || '',
        alamatSekolah: data.previous_school_address || '',
        certificateNumber: data.certificate_number || '',
        
        // Program
        programId: data.program_id?.toString() || '',

        // Dokumen tidak dapat diisi ulang, pengguna harus mengunggah ulang jika ingin mengubah.
        fotoSantri: undefined,
        ijazahFile: undefined,
        optionalDocuments: [],
      });
    }
  }, [santriDataResponse, form]);

  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: 'Pendaftaran Santri', href: '/dashboard/pendaftaran-santri', icon: <UserPlus className="h-4 w-4" /> },
    { label: 'Edit Formulir', icon: <Edit className="h-4 w-4" /> },
  ];

  const nextStep = async () => {
    let fieldsToValidate: (keyof SantriFormValues)[] = [];
    if (currentStep === 1) fieldsToValidate = step1Fields;
    if (currentStep === 2) fieldsToValidate = step2Fields;
    if (currentStep === 3) fieldsToValidate = step3Fields;
    if (currentStep === 4) fieldsToValidate = step4Fields;

    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
    } else {
      showError('Harap perbaiki semua kesalahan sebelum melanjutkan.');
    }
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleFormSubmit = async (data: SantriFormValues) => {
    const isValid = await form.trigger(step5Fields);
    if (!isValid) {
      showError('Harap perbaiki semua kesalahan sebelum menyimpan.');
      return;
    }

    const formData = new FormData();
    const appendIfExists = (key: string, value: any) => {
      if (value !== null && value !== undefined && value !== '') formData.append(key, value);
    };

    // Append all form data
    appendIfExists('wali_nik', data.nik);
    appendIfExists('wali_kk', data.kk);
    appendIfExists('wali_nama_depan', data.firstName);
    appendIfExists('wali_nama_belakang', data.lastName);
    appendIfExists('wali_jenis_kelamin', data.gender);
    appendIfExists('wali_sebagai', data.parentAs);
    appendIfExists('wali_telepon', data.phone);
    appendIfExists('wali_email', data.email);
    appendIfExists('wali_pekerjaan_id', data.pekerjaanValue);
    appendIfExists('wali_pendidikan_id', data.educationValue);
    appendIfExists('wali_alamat_ktp', data.alamatKtp);
    appendIfExists('wali_alamat_domisili', data.alamatDomisili);
    appendIfExists('santri_nama_depan', data.firstNameSantri);
    appendIfExists('santri_nama_belakang', data.lastNameSantri);
    appendIfExists('santri_nisn', data.nisn);
    appendIfExists('santri_nik', data.nikSantri);
    appendIfExists('santri_tempat_lahir', data.tempatLahir);
    if (data.tanggalLahir) appendIfExists('santri_tanggal_lahir', format(data.tanggalLahir, 'yyyy-MM-dd'));
    appendIfExists('santri_jenis_kelamin', data.jenisKelamin);
    appendIfExists('santri_alamat', data.alamatSantri);
    appendIfExists('santri_desa_code', data.villageCode);
    appendIfExists('pendidikan_sekolah_asal', data.sekolahAsal);
    appendIfExists('pendidikan_jenjang_sebelumnya', data.jenjangSebelumnya);
    appendIfExists('pendidikan_alamat_sekolah', data.alamatSekolah);
    appendIfExists('pendidikan_nomor_ijazah', data.certificateNumber);
    appendIfExists('madrasah_sekolah_asal', data.sekolahAsalMadrasah);
    appendIfExists('madrasah_jenjang_sebelumnya', data.jenjangSebelumnyaMadrasah);
    appendIfExists('madrasah_alamat_sekolah', data.alamatSekolahMadrasah);
    appendIfExists('madrasah_nomor_ijazah', data.certificateNumberMadrasah);
    appendIfExists('program_id', data.programId);
    if (data.fotoSantri instanceof File) appendIfExists('dokumen_foto_santri', data.fotoSantri);
    if (data.ijazahFile instanceof File) appendIfExists('dokumen_ijazah', data.ijazahFile);

    try {
      await updateSantri({ id: santriId, formData }).unwrap();
      showSuccess('Data calon santri berhasil diperbarui!');
      navigate('/dashboard/pendaftaran-santri');
    } catch (error: any) {
      const errorMessage = error?.data?.message || 'Terjadi kesalahan saat memperbarui data.';
      showError(errorMessage);
    } finally {
      setShowConfirmModal(false);
    }
  };

  const handleSaveClick = async () => {
    const isValid = await form.trigger(step5Fields);
    if (isValid) {
      setShowConfirmModal(true);
    } else {
      showError('Harap perbaiki semua kesalahan sebelum menyimpan.');
    }
  };

  const steps = [
    { number: 1, title: 'Data Wali', icon: <UserCheck className="h-5 w-5" /> },
    { number: 2, title: 'Profil Santri', icon: <UserPlus className="h-5 w-5" /> },
    { number: 3, title: 'Pendidikan Formal', icon: <School className="h-5 w-5" /> },
    { number: 4, title: 'Pendidikan Madrasah', icon: <BookOpenText className="h-5 w-5" /> },
    { number: 5, title: 'Dokumen & Program', icon: <FileText className="h-5 w-5" /> },
  ];

  if (isLoadingSantri) {
    return (
      <DashboardLayout title="Edit Pendaftaran Santri" role="administrasi">
        <div className="p-4"><TableLoadingSkeleton /></div>
      </DashboardLayout>
    );
  }

  if (isError || !santriDataResponse) {
    return (
      <DashboardLayout title="Edit Pendaftaran Santri" role="administrasi">
        <div className="p-4 text-red-500">Gagal memuat data calon santri.</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Edit Pendaftaran Santri" role="administrasi">
      <div className="container mx-auto pb-8 px-4">
        <CustomBreadcrumb items={breadcrumbItems} />
        <div className="mb-4">
          <div className="w-full max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <React.Fragment key={step.number}>
                  <div className="flex flex-col items-center text-center w-24">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors duration-300 ${currentStep >= step.number ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted border-border'}`}>
                      {step.icon}
                    </div>
                    <p className={`mt-2 text-xs sm:text-sm font-medium transition-colors duration-300 ${currentStep >= step.number ? 'text-primary' : 'text-muted-foreground'}`}>
                      {step.title}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-1 mx-2 rounded transition-colors duration-300 ${currentStep > step.number ? 'bg-primary' : 'bg-border'}`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
            <div className="max-w-6xl mx-auto">
              {currentStep === 1 && <WaliSantriStep />}
              {currentStep === 2 && <SantriProfileStep />}
              {currentStep === 3 && <EducationStep />}
              {currentStep === 4 && <MadrasahStep />}
              {currentStep === 5 && <DocumentStep />}
            </div>

            <div className="flex justify-between max-w-6xl mx-auto mt-8">
              <div className="flex space-x-2">
                <Button type="button" variant="danger" onClick={() => navigate('/dashboard/pendaftaran-santri')} disabled={isUpdating}>
                  <X className="mr-2 h-4 w-4" /> Batal
                </Button>
                <Button type="button" variant="outline" onClick={prevStep} disabled={currentStep === 1 || isUpdating}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
                </Button>
              </div>
              <div className="flex space-x-2">
                {currentStep < totalSteps ? (
                  <Button type="button" variant="primary" onClick={nextStep} disabled={isUpdating}>
                    Lanjutkan <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button type="button" variant="success" onClick={handleSaveClick} disabled={isUpdating}>
                    {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Simpan Perubahan
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Form>

        <AlertDialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Konfirmasi Perubahan Data</AlertDialogTitle>
              <AlertDialogDescription>
                Apakah Anda yakin ingin menyimpan perubahan pada data calon santri ini?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isUpdating}>Batal</AlertDialogCancel>
              <AlertDialogAction onClick={() => handleFormSubmit(form.getValues())} disabled={isUpdating}>
                {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Lanjutkan
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
};

export default CalonSantriEditPage;