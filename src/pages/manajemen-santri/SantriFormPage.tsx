import React, { useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import CustomBreadcrumb, { type BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { Users, UserPlus, UserCheck, School } from 'lucide-react';
import { Button } from '@/components/ui/button';
import WaliSantriStep from './form-steps/WaliSantriStep';
import SantriProfileStep from './form-steps/SantriProfileStep';
import EducationStep from './form-steps/EducationStep';

const SantriFormPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: 'Manajemen Santri', href: '/dashboard/santri', icon: <Users className="h-4 w-4" /> },
    { label: 'Tambah Santri', icon: <UserPlus className="h-4 w-4" /> },
  ];

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const steps = [
    { number: 1, title: 'Data Wali', icon: <UserCheck className="h-5 w-5" /> },
    { number: 2, title: 'Profil Santri', icon: <UserPlus className="h-5 w-5" /> },
    { number: 3, title: 'Pendidikan & Foto', icon: <School className="h-5 w-5" /> },
  ];

  return (
    <DashboardLayout title="Tambah Santri Baru" role="administrasi">
      <div className="container mx-auto pb-8 px-4">
        <CustomBreadcrumb items={breadcrumbItems} />

        {/* Stepper */}
        <div className="mb-8">
          <div className="w-full max-w-2xl mx-auto">
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

        {/* Form Content */}
        <div className="max-w-4xl mx-auto">
          {currentStep === 1 && <WaliSantriStep />}
          {currentStep === 2 && <SantriProfileStep />}
          {currentStep === 3 && <EducationStep />}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between max-w-4xl mx-auto mt-8">
          <Button variant="outline" onClick={prevStep} disabled={currentStep === 1}>
            Kembali
          </Button>
          {currentStep < totalSteps ? (
            <Button onClick={nextStep}>
              Lanjutkan
            </Button>
          ) : (
            <Button onClick={() => alert('Proses submit data santri!')}>
              Simpan Data Santri
            </Button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SantriFormPage;