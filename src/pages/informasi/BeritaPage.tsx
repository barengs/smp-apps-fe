import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import CustomBreadcrumb from '@/components/CustomBreadcrumb';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Newspaper } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

const BeritaPage: React.FC = () => {
  const breadcrumbItems = [
    { label: 'Informasi', icon: <Newspaper className="h-4 w-4" /> },
    { label: 'Berita' },
  ];

  return (
    <DashboardLayout title="Manajemen Berita" role="administrasi">
      <CustomBreadcrumb items={breadcrumbItems} />
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Daftar Berita</CardTitle>
              <CardDescription>Kelola berita dan pengumuman yang ditampilkan di sistem.</CardDescription>
            </div>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Tambah Berita
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-10">
            <p className="text-muted-foreground">Fitur manajemen berita sedang dalam pengembangan.</p>
            <p className="text-muted-foreground">Tabel data berita akan ditampilkan di sini.</p>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default BeritaPage;