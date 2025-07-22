import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { User } from 'lucide-react';

interface SelectedPhotoCardProps {
  photoFile?: File | null;
  photoUrl?: string | null;
  name?: string;
}

const SelectedPhotoCard: React.FC<SelectedPhotoCardProps> = ({ photoFile, photoUrl, name = "Foto Wali" }) => {
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);

  useEffect(() => {
    if (photoFile) {
      const objectUrl = URL.createObjectURL(photoFile);
      setPreviewSrc(objectUrl);
      return () => URL.revokeObjectURL(objectUrl); // Clean up on unmount or file change
    } else if (photoUrl) {
      setPreviewSrc(photoUrl);
    } else {
      setPreviewSrc(null);
    }
  }, [photoFile, photoUrl]);

  return (
    <Card className="overflow-hidden flex flex-col">
      <div className="w-[60px] h-[100px] bg-muted flex items-center justify-center overflow-hidden border rounded-sm">
        {previewSrc ? (
          <img
            src={previewSrc}
            alt={`Foto ${name}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <User className="h-10 w-10 text-muted-foreground" />
        )}
      </div>
      <CardContent className="p-2 text-center border-t flex-grow flex items-center justify-center">
        <p className="text-sm text-muted-foreground">
          {photoFile ? photoFile.name : (photoUrl ? 'Foto Tersedia' : 'Tidak ada foto')}
        </p>
      </CardContent>
    </Card>
  );
};

export default SelectedPhotoCard;