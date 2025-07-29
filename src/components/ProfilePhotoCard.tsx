import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Edit } from 'lucide-react';

interface ProfilePhotoCardProps {
  photoUrl?: string | null;
  onEdit?: () => void;
}

const ProfilePhotoCard: React.FC<ProfilePhotoCardProps> = ({ photoUrl, onEdit }) => {
  return (
    <Card className="w-36 h-48 flex flex-col items-center justify-center relative overflow-hidden shadow-md"> {/* Ukuran sekitar 4x6 cm (144px x 192px) */}
      <CardContent className="p-0 w-full h-full flex items-center justify-center">
        <Avatar className="w-full h-full rounded-none"> {/* Avatar mengisi seluruh kartu */}
          {photoUrl ? (
            <AvatarImage src={photoUrl} alt="User Photo" className="object-cover" />
          ) : (
            <AvatarFallback className="w-full h-full rounded-none bg-gray-200 flex items-center justify-center">
              <User className="h-1/2 w-1/2 text-gray-500" />
            </AvatarFallback>
          )}
        </Avatar>
      </CardContent>
      {!photoUrl && onEdit && (
        <button
          onClick={onEdit}
          className="absolute bottom-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100 transition-colors z-10"
          aria-label="Edit photo"
        >
          <Edit className="h-5 w-5 text-gray-600" />
        </button>
      )}
    </Card>
  );
};

export default ProfilePhotoCard;