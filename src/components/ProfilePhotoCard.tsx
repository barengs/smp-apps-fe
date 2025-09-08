import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { User, Camera } from 'lucide-react';
import WebcamCapture from './WebcamCapture';

interface ProfilePhotoCardProps {
  photoUrl: string | null;
  onCapture: (imageSrc: string) => void;
}

const ProfilePhotoCard: React.FC<ProfilePhotoCardProps> = ({ photoUrl, onCapture }) => {
  const [isWebcamOpen, setIsWebcamOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col items-center space-y-4">
        <Avatar className="h-32 w-32 border">
          <AvatarImage src={photoUrl || undefined} alt="Foto Profil" className="object-cover" />
          <AvatarFallback>
            <User className="h-16 w-16" />
          </AvatarFallback>
        </Avatar>
        <Button type="button" variant="outline" size="sm" onClick={() => setIsWebcamOpen(true)}>
          <Camera className="mr-2 h-4 w-4" />
          Ambil dari Kamera
        </Button>
      </div>
      <WebcamCapture
        open={isWebcamOpen}
        onOpenChange={setIsWebcamOpen}
        onCapture={onCapture}
      />
    </>
  );
};

export default ProfilePhotoCard;