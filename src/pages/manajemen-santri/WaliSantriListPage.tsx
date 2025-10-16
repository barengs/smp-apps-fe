import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import WaliSantriTable from './WaliSantriTable';

const WaliSantriListPage: React.FC = () => {
  const navigate = useNavigate();

  const handleAddWaliSantri = () => {
    // Navigate to add wali santri form or open modal
    navigate('/dashboard/wali-santri/tambah');
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Manajemen Wali Santri</h1>
          <p className="text-gray-600">Kelola data wali santri pesantren</p>
        </div>
        <Button onClick={handleAddWaliSantri}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Wali Santri
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <WaliSantriTable onAddData={handleAddWaliSantri} />
      </div>
    </div>
  );
};

export default WaliSantriListPage;