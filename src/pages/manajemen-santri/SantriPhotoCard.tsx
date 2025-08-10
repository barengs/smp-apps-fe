import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { User } from 'lucide-react';

interface SantriPhotoCardProps {
  photoUrl?: string | null;
  name: string;
}

// Gunakan variabel lingkungan untuk URL dasar penyimpanan gambar
const STORAGE_BASE_URL = import.meta.env.VITE_STORAGE_BASE_URL;

const SantriPhotoCard: React.FC<SantriPhotoCardProps> = ({ photoUrl, name }) => {
  const fullPhotoUrl = photoUrl ? `${STORAGE_BASE_URL}${photoUrl}` : null;

  return (
    <Card className="overflow-hidden">
      <div className="aspect-[3/4] w-full bg-muted flex items-center justify-center">
        {fullPhotoUrl ? (
          <img
            src={fullPhotoUrl}
            alt={`Foto ${name}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <User className="h-24 w-24 text-muted-foreground" />
        )}
      </div>
      <div className="p-4 text-center border-t">
        <h3 className="text-xl font-bold">{name}</h3>
      </div>
    </Card>
  );
};

export default SantriPhotoCard;