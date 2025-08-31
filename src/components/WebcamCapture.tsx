import React, { useRef, useCallback } from 'react';
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
import { Camera } from 'lucide-react';

interface WebcamCaptureProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCapture: (imageSrc: string) => void;
}

const videoConstraints = {
  width: 540,
  height: 360,
  facingMode: 'user',
};

const WebcamCapture: React.FC<WebcamCaptureProps> = ({ open, onOpenChange, onCapture }) => {
  const webcamRef = useRef<Webcam>(null);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      onCapture(imageSrc);
      onOpenChange(false);
    }
  }, [webcamRef, onCapture, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Ambil Foto via Kamera</DialogTitle>
          <DialogDescription>
            Posisikan wajah Anda di dalam bingkai dan klik tombol "Ambil Foto".
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
            className="rounded-md border"
          />
        </div>
        <DialogFooter>
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