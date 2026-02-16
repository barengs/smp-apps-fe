import React from 'react';
import WaliSantriLayout from '@/layouts/WaliSantriLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const TagihanPage: React.FC = () => {
  return (
    <WaliSantriLayout title="Informasi Tagihan" role="wali-santri">
      <Card>
        <CardHeader>
          <CardTitle>Informasi Tagihan</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Halaman ini akan menampilkan informasi tagihan santri.</p>
        </CardContent>
      </Card>
    </WaliSantriLayout>
  );
};

export default TagihanPage;
