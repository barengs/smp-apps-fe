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
    <Card className="overflow-hidden flex flex-col w-[76px] h-[113px] p-0 border rounded-sm"> {/* Apply dimensions, p-0, border, rounded-sm to Card */}
      <CardContent className="flex-grow bg-muted flex items-center justify-center p-0"> {/* Make CardContent fill and have no padding */}
        {previewSrc ? (
          <img
            src={previewSrc}
            alt={`Foto ${name}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <User className="h-10 w-10 text-muted-foreground" />
        )}
      </CardContent>
      <div className="p-2 text-center border-t"> {/* Separate div for text, with its own padding */}
        <p className="text-sm text-muted-foreground">
          {photoFile ? photoFile.name : (photoUrl ? 'Foto Tersedia' : 'Tidak ada foto')}
        </p>
      </div>
    </Card>
  );
};

export default SelectedPhotoCard;