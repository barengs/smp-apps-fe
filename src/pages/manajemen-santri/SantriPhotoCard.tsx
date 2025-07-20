import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from 'lucide-react';

interface SantriPhotoCardProps {
  photoUrl?: string | null;
  name: string;
}

const getInitials = (name: string) => {
  const names = name.split(' ');
  const initials = names.map(n => n[0]).join('');
  return initials.toUpperCase().slice(0, 2);
};

const SantriPhotoCard: React.FC<SantriPhotoCardProps> = ({ photoUrl, name }) => {
  return (
    <Card>
      <CardContent className="p-6 flex flex-col items-center justify-center">
        <Avatar className="h-40 w-40 mb-4">
          <AvatarImage src={photoUrl || undefined} alt={`Foto ${name}`} />
          <AvatarFallback className="text-4xl">
            {photoUrl ? <User className="h-16 w-16" /> : getInitials(name)}
          </AvatarFallback>
        </Avatar>
        <h3 className="text-xl font-bold text-center">{name}</h3>
      </CardContent>
    </Card>
  );
};

export default SantriPhotoCard;