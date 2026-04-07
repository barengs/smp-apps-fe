
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { santriFormSchema, SantriFormValues, step1Fields, step2Fields, step3Fields, step4Fields, step5Fields } from '@/pages/manajemen-santri/form-schemas';
import WaliSantriLayout from '@/layouts/WaliSantriLayout'; // Changed layout
import CustomBreadcrumb, { type BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { UserPlus, UserCheck, School, FileText, X, ArrowLeft, ArrowRight, Save, SaveAll, Loader2, BookOpenText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
// Reuse steps from admin module
import WaliSantriStep from '@/pages/manajemen-santri/form-steps/WaliSantriStep';
import SantriProfileStep from '@/pages/manajemen-santri/form-steps/SantriProfileStep';
import EducationStep from '@/pages/manajemen-santri/form-steps/EducationStep';
import MadrasahStep from '@/pages/manajemen-santri/form-steps/MadrasahStep';
import DocumentStep from '@/pages/manajemen-santri/form-steps/DocumentStep';
import { useNavigate } from 'react-router-dom';
import { useRegisterSantriMutation } from '@/store/slices/calonSantriApi';
import { showError, showSuccess, showWarning } from '@/utils/toast';
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
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/store/slices/authSlice';

const RegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const [registerSantri, { isLoading }] = useRegisterSantriMutation();
  const user = useSelector(selectCurrentUser);
  const [currentStep, setCurrentStep] = useState(1);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [actionType, setActionType] = useState<'save' | 'saveAndReset' | null>(null);

  const form = useForm<SantriFormValues>({
    resolver: zodResolver(santriFormSchema),
    mode: 'onChange',
    defaultValues: {
      nik: '',
      kk: '',
      firstName: '',
      lastName: '',
      gender: undefined,
      parentAs: undefined,
      phone: '',
      email: '',
      pekerjaanValue: '',
      educationValue: '',
      alamatKtp: '',
      alamatDomisili: '',
      firstNameSantri: '',
      lastNameSantri: '',
      nisn: '',
      nikSantri: '',
      tempatLahir: '',
      tanggalLahir: undefined,
      jenisKelamin: undefined,
      alamatSantri: '',
      villageCode: '',
      sekolahAsal: '',
      jenjangSebelumnya: '',
      alamatSekolah: '',
      certificateNumber: '',
      sekolahAsalMadrasah: '',
      jenjangSebelumnyaMadrasah: '',
      alamatSekolahMadrasah: '',
      certificateNumberMadrasah: '',
      programId: '',
      fotoSantri: undefined,
      ijazahFile: undefined,
      optionalDocuments: [],
    },
  });

  // Pre-fill Wali Santri data from logged in user
  useEffect(() => {
    if (user?.profile) {
        const p = user.profile;
        form.setValue('nik', p.nik || '');
        form.setValue('kk', p.kk || '');
        form.setValue('firstName', p.first_name);
        form.setValue('lastName', p.last_name || '');
        form.setValue('email', p.email);
        form.setValue('phone', p.phone || '');
        form.setValue('gender', (p.gender as 'L' | 'P') || 'L');
        form.setValue('parentAs', (p.parent_as as 'ayah' | 'ibu' | 'wali') || 'ayah');
        form.setValue('alamatKtp', p.card_address || '');
        form.setValue('alamatDomisili', p.domicile_address || '');
        if (p.occupation_id) {
          form.setValue('pekerjaanValue', p.occupation_id.toString());
        }
        if (p.education_id) {
          form.setValue('educationValue', p.education_id.toString());
        }
    }
  }, [user, form]);

  // Tentukan apakah user login (wali santri) atau tidak (admin/public, jika ada)
  // Di halaman ini (WaliSantri/RegistrationPage), user pasti ada karena diproteksi layout.
  // Tapi kita buat dinamis untuk keamanan/fleksibilitas.
  const isWaliLoggedIn = !!user;

  // Definisi semua steps mungkin
  const allSteps = [
    { id: 'wali', number: 1, title: 'Data Wali', icon: <UserCheck className="h-5 w-5" />, fields: step1Fields },
    { id: 'santri', number: 2, title: 'Profil Santri', icon: <UserPlus className="h-5 w-5" />, fields: step2Fields },
    { id: 'pendidikan', number: 3, title: 'Pendidikan Formal', icon: <School className="h-5 w-5" />, fields: step3Fields },
    { id: 'madrasah', number: 4, title: 'Pendidikan Madrasah', icon: <BookOpenText className="h-5 w-5" />, fields: step4Fields },
    { id: 'dokumen', number: 5, title: 'Dokumen & Program', icon: <FileText className="h-5 w-5" />, fields: step5Fields },
  ];

  // Filter steps: Jika wali login, hilangkan step 'wali'
  const visibleSteps = allSteps.filter(step => {
    if (isWaliLoggedIn && step.id === 'wali') return false;
    return true;
  }).map((step, index) => ({
    ...step,
    displayNumber: index + 1 // Renumber steps for UI
  }));

  const totalSteps = visibleSteps.length;
  // currentStep is 1-based index of visibleSteps
  const currentStepObj = visibleSteps[currentStep - 1];

  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: 'Pendaftaran Santri', href: '/dashboard/wali-santri/pendaftaran-santri', icon: <UserPlus className="h-4 w-4" /> },
    { label: 'Formulir Pendaftaran', icon: <FileText className="h-4 w-4" /> },
  ];

  const nextStep = async () => {
    const fieldsToValidate = currentStepObj?.fields || [];
    // @ts-ignore - dynamic fields validation
    const isValid = await form.trigger(fieldsToValidate);
    
    if (isValid) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
        window.scrollTo(0, 0);
      }
    } else {
      showError('Harap perbaiki semua kesalahan sebelum melanjutkan.');
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleFormSubmit = async (data: SantriFormValues, reset: boolean = false) => {
    // Validasi step terakhir (Dokumen) sebelum submit
    const lastStepFields = visibleSteps[visibleSteps.length - 1].fields;
    // @ts-ignore
    const isValid = await form.trigger(lastStepFields);
    
    if (!isValid) {
      showError('Harap perbaiki semua kesalahan sebelum menyimpan.');
      return;
    }

    const formData = new FormData();

    const appendIfExists = (key: string, value: any) => {
      if (value !== null && value !== undefined && value !== '') {
        formData.append(key, value);
      }
    };

    // Step 1: Data Wali - Hanya append jika user BELUM login (misal admin/public registration)
    if (!isWaliLoggedIn) {
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
    }

    // Step 2: Data Santri
    appendIfExists('santri_nama_depan', data.firstNameSantri);
    appendIfExists('santri_nama_belakang', data.lastNameSantri);
    appendIfExists('santri_nisn', data.nisn);
    appendIfExists('santri_nik', data.nikSantri);
    appendIfExists('santri_tempat_lahir', data.tempatLahir);
    if (data.tanggalLahir) {
      appendIfExists('santri_tanggal_lahir', format(data.tanggalLahir, 'yyyy-MM-dd'));
    }
    appendIfExists('santri_jenis_kelamin', data.jenisKelamin);
    appendIfExists('santri_alamat', data.alamatSantri);
    appendIfExists('santri_desa_code', data.villageCode);

    // Step 3: Pendidikan
    appendIfExists('pendidikan_sekolah_asal', data.sekolahAsal);
    appendIfExists('pendidikan_jenjang_sebelumnya', data.jenjangSebelumnya);
    appendIfExists('pendidikan_alamat_sekolah', data.alamatSekolah);
    appendIfExists('pendidikan_nomor_ijazah', data.certificateNumber);

    // Step 4: Madrasah
    appendIfExists('madrasah_sekolah_asal', data.sekolahAsalMadrasah);
    appendIfExists('madrasah_jenjang_sebelumnya', data.jenjangSebelumnyaMadrasah);
    appendIfExists('madrasah_alamat_sekolah', data.alamatSekolahMadrasah);
    appendIfExists('madrasah_nomor_ijazah', data.certificateNumberMadrasah);

    // Step 5: Dokumen & Program
    appendIfExists('program_id', data.programId);
    appendIfExists('dokumen_foto_santri', data.fotoSantri);
    appendIfExists('dokumen_ijazah', data.ijazahFile);

    if (data.optionalDocuments) {
      data.optionalDocuments.forEach((doc, index) => {
        if (doc.name && doc.file) {
          formData.append(`dokumen_opsional[${index}][nama]`, doc.name);
          formData.append(`dokumen_opsional[${index}][file]`, doc.file);
        }
      });
    }

    try {
      await registerSantri(formData).unwrap();
      showSuccess(`Pendaftaran santri baru berhasil! ${reset ? 'Formulir direset.' : ''}`);
      if (reset) {
        form.reset();
        setCurrentStep(1);
        window.scrollTo(0, 0);
      } else {
        // Redirect to Data Santri page instead of list, as they are a parent
        navigate('/dashboard/wali-santri/pendaftaran-santri');
      }
    } catch (error: any) {
      const errorMessage = error?.data?.message || 'Terjadi kesalahan saat menyimpan data.';
      showError(errorMessage);
    } finally {
      setShowConfirmModal(false);
    }
  };

  const onSubmit = (data: SantriFormValues) => handleFormSubmit(data, false);
  const onSubmitAndReset = () => handleFormSubmit(form.getValues(), true);

  const handleSaveClick = async () => {
    // Validasi step terakhir
    const lastStepFields = visibleSteps[visibleSteps.length - 1].fields;
    // @ts-ignore
    const isValid = await form.trigger(lastStepFields);
    if (isValid) {
      setActionType('save');
      setShowConfirmModal(true);
    } else {
      showError('Harap perbaiki semua kesalahan sebelum menyimpan.');
    }
  };

  const handleSaveAndResetClick = async () => {
    // Validasi step terakhir
    const lastStepFields = visibleSteps[visibleSteps.length - 1].fields;
    // @ts-ignore
    const isValid = await form.trigger(lastStepFields);
    if (isValid) {
      setActionType('saveAndReset');
      setShowConfirmModal(true);
    } else {
      showError('Harap perbaiki semua kesalahan sebelum menyimpan.');
    }
  };

  const handleConfirmSubmit = () => {
    if (actionType === 'save') {
      onSubmit(form.getValues());
    } else if (actionType === 'saveAndReset') {
      onSubmitAndReset();
    }
  };

  return (
    <WaliSantriLayout title="Pendaftaran Santri Baru" role="wali-santri">
      <div className="w-full max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <CustomBreadcrumb items={breadcrumbItems} />

        <div className="mb-4 mt-6">
          <div className="w-full max-w-6xl mx-auto">
            <div className="flex items-center justify-between overflow-x-auto pb-4 md:pb-0">
              {visibleSteps.map((step, index) => (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center text-center min-w-[80px]">
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors duration-300 ${
                        currentStep >= step.displayNumber ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted border-border'
                      }`}
                    >
                      {step.icon}
                    </div>
                    <p className={`mt-2 text-xs sm:text-sm font-medium transition-colors duration-300 ${currentStep >= step.displayNumber ? 'text-primary' : 'text-muted-foreground'}`}>
                      {step.title}
                    </p>
                  </div>
                  {index < visibleSteps.length - 1 && (
                    <div className={`hidden md:block flex-1 h-1 mx-2 rounded transition-colors duration-300 ${currentStep > (visibleSteps[index].displayNumber) ? 'bg-primary' : 'bg-border'}`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-sm border mt-6">
              {/* Render content based on step ID */}
              
              {!isWaliLoggedIn && currentStepObj.id === 'wali' && (
                  <div>
                    <div className="mb-6 bg-blue-50 border border-blue-200 rounded-md p-4 text-sm text-blue-700">
                        <strong>Info:</strong> Data wali telah diisi otomatis berdasarkan profil Anda. Silakan lengkapi jika ada yang kosong (seperti KK atau Pekerjaan).
                    </div>
                    <WaliSantriStep />
                  </div>
              )}

              {currentStepObj.id === 'santri' && <SantriProfileStep />}
              {currentStepObj.id === 'pendidikan' && <EducationStep />}
              {currentStepObj.id === 'madrasah' && <MadrasahStep />}
              {currentStepObj.id === 'dokumen' && <DocumentStep />}
            </div>

            <div className="flex justify-between max-w-6xl mx-auto mt-8">
              <div className="flex space-x-2">
                <Button type="button" variant="danger" onClick={() => navigate('/dashboard/wali-santri/pendaftaran-santri')} disabled={isLoading}>
                  <X className="mr-2 h-4 w-4" />
                  Batal
                </Button>
                <Button type="button" variant="outline" onClick={prevStep} disabled={currentStep === 1 || isLoading}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Kembali
                </Button>
              </div>
              <div className="flex space-x-2">
                {currentStep < totalSteps ? (
                  <Button type="button" className="bg-blue-600 hover:bg-blue-700" onClick={nextStep} disabled={isLoading}>
                    Lanjutkan
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <>
                    <Button type="button" variant="secondary" onClick={handleSaveAndResetClick} disabled={isLoading}>
                      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <SaveAll className="mr-2 h-4 w-4" />}
                      Simpan & Daftar Lagi
                    </Button>
                    <Button type="button" className="bg-green-600 hover:bg-green-700" onClick={handleSaveClick} disabled={isLoading}>
                      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                      Simpan Pendaftaran
                    </Button>
                  </>
                )}
              </div>
            </div>
          </form>
        </Form>

        <AlertDialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Konfirmasi Pendaftaran</AlertDialogTitle>
            <AlertDialogDescription>
                Apakah data santri baru yang diisi sudah benar?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isLoading}>Cek Lagi</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmSubmit} disabled={isLoading} className="bg-green-600">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Ya, Daftarkan
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </WaliSantriLayout>
  );
};

export default RegistrationPage;
