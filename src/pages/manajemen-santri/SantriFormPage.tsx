import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { santriFormSchema, SantriFormValues, step1Fields, step2Fields, step3Fields, step4Fields } from './form-schemas';
import DashboardLayout from '../../layouts/DashboardLayout';
import CustomBreadcrumb, { type BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { Users, UserPlus, UserCheck, School, FileText, X, ArrowLeft, ArrowRight, Save, SaveAll } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import WaliSantriStep from './form-steps/WaliSantriStep';
import SantriProfileStep from './form-steps/SantriProfileStep';
import EducationStep from './form-steps/EducationStep';
import DocumentStep from './form-steps/DocumentStep';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const SantriFormPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  const navigate = useNavigate();

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

  const onSubmit = async (data: SantriFormValues) => {
    const isValid = await form.trigger(step4Fields);
    if (!isValid) {
      toast.error('Harap perbaiki semua kesalahan sebelum menyimpan.');
      return;
    }
    console.log('Form Data Submitted:', data);
    toast.success('Proses submit data santri berhasil!');
  };

  const onSubmitAndReset = async () => {
    const isValid = await form.trigger(step4Fields);
    if (!isValid) {
      toast.error('Harap perbaiki semua kesalahan sebelum menyimpan.');
      return;
    }
    const data = form.getValues();
    console.log('Form Data Submitted (and reset):', data);
    toast.success('Proses submit data santri berhasil! Formulir direset.');
    form.reset();
    setCurrentStep(1);
  };

  const steps = [
    { number: 1, title: 'Data Wali', icon: <UserCheck className="h-5 w-5" /> },
    { number: 2, title: 'Profil Santri', icon: <UserPlus className="h-5 w-5" /> },
    { number: 3, title: 'Pendidikan & Foto', icon: <School className="h-5 w-5" /> },
    { number: 4, title: 'Kelengkapan Dokumen', icon: <FileText className="h-5 w-5" /> },
  ];

  return (
    <DashboardLayout title="Pendaftaran Santri Baru" role="administrasi">
      <div className="container mx-auto -mt-4 pb-8 px-4"> {/* Added -mt-4 here */}
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
              {currentStep === 1 && <WaliSantriStep form={form} />}
              {currentStep === 2 && <SantriProfileStep form={form} />}
              {currentStep === 3 && <EducationStep form={form} />}
              {currentStep === 4 && <DocumentStep form={form} />}
            </div>

            <div className="flex justify-between max-w-4xl mx-auto mt-8">
              <div className="flex space-x-2">
                <Button type="button" variant="outline" onClick={() => navigate('/dashboard/pendaftaran-santri')}>
                  <X className="mr-2 h-4 w-4" />
                  Batal
                </Button>
                <Button type="button" variant="outline" onClick={prevStep} disabled={currentStep === 1}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Kembali
                </Button>
              </div>
              <div className="flex space-x-2">
                {currentStep < totalSteps ? (
                  <Button type="button" onClick={nextStep}>
                    Lanjutkan
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <>
                    <Button type="button" variant="outline" onClick={onSubmitAndReset}>
                      <SaveAll className="mr-2 h-4 w-4" />
                      Simpan dan Entri Ulang
                    </Button>
                    <Button type="submit">
                      <Save className="mr-2 h-4 w-4" />
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