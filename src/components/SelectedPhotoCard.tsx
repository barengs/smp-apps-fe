import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { User } from 'lucide-react';

interface SelectedPhotoCardProps {
  photoFile?: File | null;
  photoUrl?: string | null;
  name: string;
}

const SelectedPhotoCard: React.FC<SelectedPhotoCardProps> = ({ photoFile, photoUrl, name }) => {
  const displayUrl = photoFile ? URL.createObjectURL(photoFile) : photoUrl;

  return (
    <Card className="overflow-hidden w-24 h-32 flex-shrink-0">
      <div className="aspect-[3/4] w-full bg-muted flex items-center justify-center">
        {displayUrl ? (
          <img
            src={displayUrl}
            alt={`Foto ${name}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <User className="h-10 w-10 text-muted-foreground" />
        )}
      </div>
    </Card>
  );
};

export default SelectedPhotoCard;