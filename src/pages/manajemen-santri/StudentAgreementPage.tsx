import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  useGetStudentAgreementQuery, 
  useUpdateStudentAgreementStepMutation 
} from '@/store/slices/studentApi';
import { useGetStudentCardSettingsQuery } from '@/store/slices/studentCardApi';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { 
  FileText, 
  ShieldCheck, 
  FlaskConical, 
  ChevronRight, 
  ChevronLeft, 
  Download,
  CheckCircle2
} from 'lucide-react';
import { pdf } from '@react-pdf/renderer';
import { AgreementPdf } from './AgreementPdf';

const STEPS = [
  { id: 'contract', title: 'Perjanjian Kontrak', icon: FileText },
  { id: 'compliance', title: 'Taat UU & Peraturan', icon: ShieldCheck },
  { id: 'urine_test', title: 'Pernyataan Tes Urin', icon: FlaskConical },
];

// Helper function to fetch image and convert to base64 to avoid CORS issues in PDF
// and convert WebP to PNG since @react-pdf/renderer doesn't support WebP
const fetchImageAsBase64 = async (url: string): Promise<string | undefined> => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(undefined);
          return;
        }
        ctx.drawImage(img, 0, 0);
        // Convert to PNG as it's widely supported by @react-pdf/renderer
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => resolve(undefined);
      img.src = URL.createObjectURL(blob);
    });
  } catch (error) {
    console.error('Failed to fetch image as base64:', error);
    return undefined;
  }
};

const StudentAgreementPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const studentId = parseInt(id || '0');

  const { data: agreementData, isLoading, isError } = useGetStudentAgreementQuery(studentId);
  const { data: settingsData } = useGetStudentCardSettingsQuery();
  const [updateStep, { isLoading: isUpdating }] = useUpdateStudentAgreementStepMutation();

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    contract_level: '',
    contract_agreed: false,
    compliance_agreed: false,
    urine_test_agreed: false,
  });

  useEffect(() => {
    if (agreementData?.data) {
      const { data } = agreementData;
      setFormData({
        contract_level: data.contract_level || '',
        contract_agreed: data.contract_agreed || false,
        compliance_agreed: data.compliance_agreed || false,
        urine_test_agreed: data.urine_test_agreed || false,
      });
    }
  }, [agreementData]);

  if (isLoading) return <div className="p-8 text-center">Memuat data perjanjian...</div>;
  if (isError) return <div className="p-8 text-center text-red-500">Gagal memuat data santri.</div>;

  const agreement = agreementData?.data;
  const student = agreementData?.student;

  const handleNext = async () => {
    const stepKey = STEPS[currentStep].id as 'contract' | 'compliance' | 'urine_test';
    const agreed = formData[`${stepKey}_agreed` as keyof typeof formData] as boolean;

    if (!agreed) {
      toast.error('Anda harus menyetujui pernyataan ini sebelum melanjutkan.');
      return;
    }

    if (stepKey === 'contract' && !formData.contract_level) {
      toast.error('Pilih tingkat pendidikan terlebih dahulu.');
      return;
    }

    try {
      await updateStep({
        id: studentId,
        data: {
          step: stepKey,
          agreed: true,
          contract_level: stepKey === 'contract' ? formData.contract_level : undefined,
        },
      }).unwrap();

      if (currentStep < STEPS.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        toast.success('Seluruh tahap perjanjian telah diselesaikan.');
      }
    } catch (err) {
      toast.error('Gagal menyimpan progres.');
    }
  };

  const handleDownloadPdf = async () => {
    if (!agreement || !student) return;

    const STORAGE_BASE_URL = import.meta.env.VITE_STORAGE_BASE_URL as string;
    const kopSurat = settingsData?.data?.kop_surat;
    
    // Use relative path to leverage Vite proxy and bypass CORS on local
    let kopSuratUrl = undefined;
    if (kopSurat) {
      const cleanKop = kopSurat.startsWith('/') ? kopSurat.substring(1) : kopSurat;
      // Use relative path starting with /storage to hit the Vite proxy
      kopSuratUrl = `/storage/${cleanKop.startsWith('storage/') ? cleanKop.substring(8) : cleanKop}`;
    }

    try {
      toast.loading('Menghasilkan dokumen PDF...', { id: 'pdf-gen' });
      
      // Fetch image as base64 to avoid CORS issues
      let finalKopUrl = kopSuratUrl;
      if (kopSuratUrl) {
        finalKopUrl = await fetchImageAsBase64(kopSuratUrl);
      }

      const blob = await pdf(
        <AgreementPdf 
          student={student} 
          agreement={agreement} 
          kopSuratUrl={finalKopUrl} 
        />
      ).toBlob();
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Perjanjian_${student.nis}_${new Date().getTime()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Dokumen berhasil diunduh.', { id: 'pdf-gen' });
    } catch (err) {
      console.error(err);
      toast.error('Gagal membuat PDF.', { id: 'pdf-gen' });
    }
  };

  const isCompleted = formData.contract_agreed && formData.compliance_agreed && formData.urine_test_agreed;

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ChevronLeft className="mr-2 h-4 w-4" /> Kembali
        </Button>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          Manajemen Perjanjian Santri
          {isCompleted && (
            <Badge variant="success" className="h-6 gap-1">
              <CheckCircle2 className="h-3 w-3" /> Selesai
            </Badge>
          )}
        </h1>
        <p className="text-muted-foreground mt-1">
          {student?.first_name} {student?.last_name} ({student?.nis})
        </p>
      </div>

      {/* Stepper Header */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          const isActive = currentStep === index;
          const isDone = (index === 0 && formData.contract_agreed) || 
                         (index === 1 && formData.compliance_agreed) || 
                         (index === 2 && formData.urine_test_agreed);

          return (
            <div 
              key={step.id}
              className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all cursor-pointer ${
                isActive ? 'border-primary bg-primary/5' : 'border-muted bg-muted/30'
              } ${isDone ? 'border-green-500/50' : ''}`}
              onClick={() => setCurrentStep(index)}
            >
              <div className={`p-2 rounded-full mb-2 ${
                isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              } ${isDone ? 'bg-green-500 text-white' : ''}`}>
                {isDone ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
              </div>
              <span className={`text-xs font-semibold text-center ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                {step.title}
              </span>
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <Card className="shadow-lg border-2">
        <CardHeader className="bg-muted/30 border-b">
          <CardTitle className="text-xl flex items-center">
            {React.createElement(STEPS[currentStep].icon, { className: "mr-2 h-5 w-5 text-primary" })}
            {STEPS[currentStep].title}
          </CardTitle>
          <CardDescription>
            Tinjau dan setujui pernyataan di bawah ini.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-6">
          {currentStep === 0 && (
            <div className="space-y-6">
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20 text-sm leading-relaxed italic">
                "Saya menyatakan dengan sebenarnya bahwa saya bersedia menetap dan belajar sebagai santri di Pondok Pesantren 'Miftahul Ulum' Panyeppen sampai tuntas menempuh pendidikan."
              </div>
              
              <div className="space-y-3">
                <Label className="text-base font-bold">Pilih Jenjang Penamatan:</Label>
                <RadioGroup 
                  value={formData.contract_level} 
                  onValueChange={(val) => setFormData(prev => ({ ...prev, contract_level: val }))}
                  className="grid grid-cols-2 gap-4"
                >
                  {['ULA', 'WUSTHO', 'ULYA', 'TUGAS'].map((lvl) => (
                    <div key={lvl} className="flex items-center space-x-3 p-3 rounded-md border hover:bg-muted/50 transition-colors">
                      <RadioGroupItem value={lvl} id={lvl} />
                      <Label htmlFor={lvl} className="font-medium cursor-pointer flex-1 py-1">{lvl}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="flex items-center space-x-3 p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                <Checkbox 
                  id="agree-1" 
                  checked={formData.contract_agreed}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, contract_agreed: checked === true }))}
                />
                <Label htmlFor="agree-1" className="text-sm font-medium leading-none cursor-pointer">
                  Saya setuju dengan pernyataan kontrak di atas.
                </Label>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="p-6 bg-muted/20 rounded-lg space-y-4 text-sm">
                <p className="font-semibold">Selama menjadi santri, saya berjanji:</p>
                <ul className="list-decimal list-inside space-y-2 opacity-80">
                  <li>Taat pada Undang-Undang & Peraturan Pesantren.</li>
                  <li>Melaksanakan seluruh kesepakatan yang ditandatangani.</li>
                  <li>Mematuhi kebijakan Alumni (IKBAS) setelah lulus.</li>
                  <li>Bersedia menerima sanksi sesuai ketentuan jika melanggar.</li>
                </ul>
              </div>

              <div className="flex items-center space-x-3 p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                <Checkbox 
                  id="agree-2" 
                  checked={formData.compliance_agreed}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, compliance_agreed: checked === true }))}
                />
                <Label htmlFor="agree-2" className="text-sm font-medium leading-none cursor-pointer">
                  Saya berjanji akan menaati seluruh peraturan yang berlaku.
                </Label>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="p-6 bg-red-50/30 rounded-lg border border-red-100 space-y-4 text-sm text-red-900/80">
                <p>
                  "Saya bersedia dan setuju untuk dilakukan pemeriksaan tes urin sebagai salah satu syarat administrasi dan kesehatan untuk menjadi santri baru."
                </p>
                <p>
                  "Apabila hasil tes menyatakan hal yang melanggar ketentuan, saya bersedia menerima sanksi atau bimbingan khusus."
                </p>
              </div>

              <div className="flex items-center space-x-3 p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                <Checkbox 
                  id="agree-3" 
                  checked={formData.urine_test_agreed}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, urine_test_agreed: checked === true }))}
                />
                <Label htmlFor="agree-3" className="text-sm font-medium leading-none cursor-pointer">
                  Saya bersedia dilakukan tes urin sewaktu-waktu.
                </Label>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between bg-muted/10 p-6 border-t">
          <Button 
            variant="outline" 
            onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> Sebelumnya
          </Button>
          
          <div className="flex gap-2">
            {isCompleted && (
              <Button variant="outline" className="text-green-600 border-green-200 hover:bg-green-50" onClick={handleDownloadPdf}>
                <Download className="mr-2 h-4 w-4" /> Unduh PDF
              </Button>
            )}
            
            <Button onClick={handleNext} disabled={isUpdating}>
              {isUpdating ? 'Menyimpan...' : currentStep === STEPS.length - 1 ? 'Selesai' : 'Simpan & Lanjut'} 
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>

      {isCompleted && (
        <div className="mt-8 p-6 bg-green-50 border border-green-100 rounded-xl flex items-center gap-4">
          <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-green-800">Proses Perjanjian Selesai</h3>
            <p className="text-green-700/70 text-sm">Anda sekarang dapat mengunduh dokumen lengkap dalam bentuk PDF.</p>
          </div>
          <Button className="ml-auto bg-green-600 hover:bg-green-700" onClick={handleDownloadPdf}>
            <Download className="mr-2 h-4 w-4" /> Unduh Dokumen
          </Button>
        </div>
      )}
    </div>
  );
};

export default StudentAgreementPage;
