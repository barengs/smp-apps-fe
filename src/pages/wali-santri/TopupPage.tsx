import React from 'react';
import WaliSantriLayout from '@/layouts/WaliSantriLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const TopupPage: React.FC = () => {
  return (
    <WaliSantriLayout title="Topup / Transfer Dana" role="wali-santri">
      <Card>
        <CardHeader>
          <CardTitle>Topup / Transfer Dana</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Halaman ini akan menampilkan fitur topup dan transfer dana.</p>
        </CardContent>
      </Card>
    </WaliSantriLayout>
  );
};

export default TopupPage;
