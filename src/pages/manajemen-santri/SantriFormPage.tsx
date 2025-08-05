import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { santriFormSchema, SantriFormValues, step1Fields, step2Fields, step3Fields, step4Fields } from './form-schemas';
import DashboardLayout from '../../layouts/DashboardLayout';
import CustomBreadcrumb, { type BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { UserPlus, UserCheck, School, FileText, X, ArrowLeft, ArrowRight, Save, SaveAll, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import WaliSantriStep from './form-steps/WaliSantriStep';
import SantriProfileStep from './form-steps/SantriProfileStep';
import EducationStep from './form-steps/EducationStep';
import DocumentStep from './form-steps/DocumentStep';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useRegisterSantriMutation } from '@/store/slices/calonSantriApi';
import { showError, showSuccess } from '@/utils/toast';
import { format } from 'date-fns';

const SantriFormPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  const navigate = useNavigate();
  const [registerSantri, { isLoading }] = useRegisterSantriMutation();

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
      sekolahAsal: '',
      jenjangSebelumnya: '',
      alamatSekolah: '',
      fotoSantri: undefined,
      ijazahFile: undefined,
      optionalDocuments: [],
    },
  });

  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: 'Pendaftaran Santri', href: '/dashboard/pendaftaran-santri', icon: <UserPlus className="h-4 w-4" /> },
    { label: 'Formulir Pendaftaran', icon: <FileText className="h-4 w-4" /> },
  ];

  const nextStep = async () => {
    let fieldsToValidate: (keyof SantriFormValues)[] = [];
    if (currentStep === 1) fieldsToValidate = step1Fields;
    if (currentStep === 2) fieldsToValidate = step2Fields;
    if (currentStep === 3) fieldsToValidate = step3Fields;

    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      }
    } else {
      toast.error('Harap perbaiki semua kesalahan sebelum melanjutkan.');
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFormSubmit = async (data: SantriFormValues, reset: boolean = false) => {
    const isValid = await form.trigger(step4Fields);
    if (!isValid) {
      showError('Harap perbaiki semua kesalahan sebelum menyimpan.');
      return;
    }

    const formData = new FormData();

    // Helper to append value if it exists
    const appendIfExists = (key: string, value: any) => {
      if (value !== null && value !== undefined && value !== '') {
        formData.append(key, value);
      }
    };

    // Append all fields from data
    appendIfExists('wali_nik', data.nik);
    appendIfExists('wali_kk', data.kk);
    appendIfExists('wali_nama_depan', data.firstName);
    appendIfExists('wali_nama_belakang', data.lastName);
    appendIfExists('wali_jenis_kelamin', data.gender);
    appendIfExists('wali_sebagai', data.parentAs);
    appendIfExists('wali_telepon', data.phone);
    appendIfExists('wali_email', data.email);
    appendIfExists('wali_pekerjaan_id', data.pekerjaanValue);
    appendIfExists('wali_alamat_ktp', data.alamatKtp);
    appendIfExists('wali_alamat_domisili', data.alamatDomisili);

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

    appendIfExists('pendidikan_sekolah_asal', data.sekolahAsal);
    appendIfExists('pendidikan_jenjang_sebelumnya', data.jenjangSebelumnya);
    appendIfExists('pendidikan_alamat_sekolah', data.alamatSekolah);

    appendIfExists('dokumen_foto_santri', data.fotoSantri);
    appendIfExists('dokumen_ijazah', data.ijazahFile);

    // Append optional documents
    if (data.optionalDocuments) {
      data.optionalDocuments.forEach((doc, index) => {
        if (doc.name && doc.file) {
          formData.append(`dokumen_opsional[${index}][nama]`, doc.name);
          formData.append(`dokumen_opsional[${index}][file]`, doc.file);
        }
      });
    }

    // Log FormData content for debugging
    console.log('Data FormData yang akan dikirim:');
    for (const pair of formData.entries()) {
      console.log(`${pair[0]}:`, pair[1]);
    }

    try {
      await registerSantri(formData).unwrap();
      showSuccess(`Proses submit data santri berhasil! ${reset ? 'Formulir direset.' : ''}`);
      if (reset) {
        form.reset();
        setCurrentStep(1);
      } else {
        navigate('/dashboard/pendaftaran-santri'); // Navigate to santri list page
      }
    } catch (error: any) {
      const errorMessage = error?.data?.message || 'Terjadi kesalahan saat menyimpan data.';
      showError(errorMessage);
      console.error('Form Data Submission Error:', error);
    }
  };

  const onSubmit = (data: SantriFormValues) => handleFormSubmit(data, false);
  const onSubmitAndReset = () => handleFormSubmit(form.getValues(), true);

  const steps = [
    { number: 1, title: 'Data Wali', icon: <UserCheck className="h-5 w-5" /> },
    { number: 2, title: 'Profil Santri', icon: <UserPlus className="h-5 w-5" /> },
    { number: 3, title: 'Pendidikan & Foto', icon: <School className="h-5 w-5" /> },
    { number: 4, title: 'Kelengkapan Dokumen', icon: <FileText className="h-5 w-5" /> },
  ];

  return (
    <DashboardLayout title="Pendaftaran Santri Baru" role="administrasi">
      <div className="container mx-auto pb-8 px-4">
        <CustomBreadcrumb items={breadcrumbItems} />

        <div className="mb-8">
          <div className="w-full max-w-3xl mx-auto">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <React.Fragment key={step.number}>
                  <div className="flex flex-col items-center text-center w-24">
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors duration-300 ${
                        currentStep >= step.number ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted border-border'
                      }`}
                    >
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="max-w-4xl mx-auto">
              {currentStep === 1 && <WaliSantriStep />}
              {currentStep === 2 && <SantriProfileStep />}
              {currentStep === 3 && <EducationStep />}
              {currentStep === 4 && <DocumentStep />}
            </div>

            <div className="flex justify-between max-w-4xl mx-auto mt-8">
              <div className="flex space-x-2">
                <Button type="button" variant="outline" onClick={() => navigate('/dashboard/pendaftaran-santri')} disabled={isLoading}>
                  <X className="mr-2 h-4 w-4" />
                  Batal
                </Button>
                <Button type="button" onClick={prevStep} disabled={currentStep === 1 || isLoading}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Kembali
                </Button>
              </div>
              <div className="flex space-x-2">
                {currentStep < totalSteps ? (
                  <Button type="button" onClick={nextStep} disabled={isLoading}>
                    Lanjutkan
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <>
                    <Button type="button" variant="outline" onClick={onSubmitAndReset} disabled={isLoading}>
                      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <SaveAll className="mr-2 h-4 w-4" />}
                      Simpan dan Entri Ulang
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                      Simpan
                    </Button>
                  </>
                )}
              </div>
            </div>
          </form>
        </Form>
      </div>
    </DashboardLayout>
  );
};

export default SantriFormPage;