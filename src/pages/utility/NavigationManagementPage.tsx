import React, { useMemo, useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import CustomBreadcrumb, { type BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { Settings, Compass, Edit, PlusCircle } from 'lucide-react';
import { DataTable } from '@/components/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { useGetMenuQuery } from '@/store/slices/menuApi';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import TableLoadingSkeleton from '@/components/TableLoadingSkeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronDown } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import MenuForm from './MenuForm'; // Import the new form

interface MenuItem {
  id: number;
  title: string;
  description: string | null;
  icon: string;
  route: string;
  type: string;
  position: string;
  status: string;
  order: number | null;
  child: MenuItem[];
}

const NavigationManagementPage: React.FC = () => {
  const { data: menuData, error, isLoading } = useGetMenuQuery();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | undefined>(undefined);

  const menuItems: MenuItem[] = useMemo(() => {
    if (menuData?.data) {
      return menuData.data.map(item => ({
        ...item,
        description: item.description || 'Tidak ada deskripsi',
        icon: item.icon || '-',
        route: item.route || '-',
        order: item.order ?? null,
        child: item.child || [],
      }));
    }
    return [];
  }, [menuData]);

  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: 'Pengaturan', href: '/dashboard/settings/system', icon: <Settings className="h-4 w-4" /> },
    { label: 'Navigasi', icon: <Compass className="h-4 w-4" /> },
  ];

  const handleAddData = () => {
    setEditingMenuItem(undefined);
    setIsModalOpen(true);
  };

  const handleEditData = (item: MenuItem) => {
    setEditingMenuItem(item);
    setIsModalOpen(true);
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    setEditingMenuItem(undefined);
  };

  const handleFormCancel = () => {
    setIsModalOpen(false);
    setEditingMenuItem(undefined);
  };

  const columns: ColumnDef<MenuItem>[] = useMemo(
    () => [
      {
        accessorKey: 'title',
        header: 'Judul',
      },
      {
        accessorKey: 'route',
        header: 'Rute',
      },
      {
        accessorKey: 'type',
        header: 'Tipe',
      },
      {
        accessorKey: 'position',
        header: 'Posisi',
      },
      {
        accessorKey: 'status',
        header: 'Status',
      },
      {
        accessorKey: 'order',
        header: 'Urutan',
      },
      {
        accessorKey: 'child',
        header: 'Sub-Menu',
        cell: ({ row }) => {
          const children = row.original.child;
          if (!children || children.length === 0) {
            return <span className="text-muted-foreground">-</span>;
          }

          if (children.length === 1) {
            return <Badge variant="outline">{children[0].title}</Badge>;
          }

          return (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  {children.length} Sub-Menu
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-2">
                <div className="space-y-1">
                  {children.map((childItem) => (
                    <Badge key={childItem.id} variant="secondary" className="block w-full text-left font-normal whitespace-normal">
                      {childItem.title}
                    </Badge>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          );
        },
      },
      {
        id: 'actions',
        header: 'Aksi',
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex space-x-2">
              <Button
                variant="outline"
                className="h-8 px-2 text-xs"
                onClick={() => handleEditData(item)}
              >
                <Edit className="h-4 w-4 mr-1" /> Edit
              </Button>
            </div>
          );
        },
      },
    ],
    []
  );

  if (isLoading) return <TableLoadingSkeleton numCols={8} />;

  const isNotFound = error && (error as FetchBaseQueryError).status === 404;
  if (error && !isNotFound) {
    return <div>Error: Gagal memuat data navigasi. Silakan coba lagi nanti.</div>;
  }

  return (
    <DashboardLayout title="Manajemen Navigasi" role="administrasi">
      <div className="container mx-auto py-4 px-4">
        <CustomBreadcrumb items={breadcrumbItems} />
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Daftar Item Navigasi</CardTitle>
                <CardDescription>Kelola item-item navigasi yang muncul di sidebar dan menu lainnya.</CardDescription>
              </div>
              <Button onClick={handleAddData}>
                <PlusCircle className="mr-2 h-4 w-4" /> Tambah Data
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={menuItems}
              exportFileName="data_navigasi"
              exportTitle="Data Item Navigasi"
              onAddData={handleAddData}
            />
          </CardContent>
        </Card>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingMenuItem ? 'Edit Item Navigasi' : 'Tambah Item Navigasi Baru'}</DialogTitle>
            <DialogDescription>
              {editingMenuItem ? 'Ubah detail item navigasi ini.' : 'Isi detail untuk item navigasi baru.'}
            </DialogDescription>
          </DialogHeader>
          <MenuForm
            initialData={editingMenuItem}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default NavigationManagementPage;