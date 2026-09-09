import React, { useRef, useCallback, useState } from 'react';
import Webcam from 'react-webcam';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Camera, RefreshCw } from 'lucide-react';

interface WebcamCaptureProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCapture: (imageSrc: string) => void;
}

const WebcamCapture: React.FC<WebcamCaptureProps> = ({ open, onOpenChange, onCapture }) => {
  const webcamRef = useRef<Webcam>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      onCapture(imageSrc);
      onOpenChange(false);
    }
  }, [webcamRef, onCapture, onOpenChange]);

  const toggleCamera = () => {
    setFacingMode((prevMode) => (prevMode === 'user' ? 'environment' : 'user'));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Ambil Foto via Kamera</DialogTitle>
          <DialogDescription>
            Posisikan dokumen di dalam bingkai dan klik tombol "Ambil Foto".
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4 relative">
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={{
              width: 1280,
              height: 720,
              facingMode: facingMode,
            }}
            className="rounded-md border w-full max-h-[60vh] object-cover"
          />
          <Button
            variant="secondary"
            size="icon"
            className="absolute top-6 right-6 rounded-full shadow-md"
            onClick={toggleCamera}
          >
            <RefreshCw className="h-5 w-5" />
          </Button>
        </div>
        <DialogFooter className="flex justify-between w-full sm:justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={capture}>
            <Camera className="mr-2 h-4 w-4" />
            Ambil Foto
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WebcamCapture;