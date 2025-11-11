"use client";

import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import CustomBreadcrumb, { type BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { DataTable } from '@/components/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslation } from 'react-i18next';
import InstitusiTugasFormModal, { InstitusiTugas } from './InstitusiTugasFormModal';
import * as toast from '@/utils/toast';
import { Pencil, Trash2, PlusCircle, Briefcase, Building2 } from 'lucide-react';

const STORAGE_KEY = 'institusi_tugas_store';

const InstitusiTugasPage: React.FC = () => {
  const { t } = useTranslation();
  const [items, setItems] = React.useState<InstitusiTugas[]>([]);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<InstitusiTugas | null>(null);
  const breadcrumbItems: BreadcrumbItemData[] = [
    { label: t('sidebar.internshipManagement'), href: '/dashboard/guru-tugas', icon: <Briefcase className="h-4 w-4" /> },
    { label: t('sidebar.taskInstitution'), icon: <Building2 className="h-4 w-4" /> },
  ];

  // Load from localStorage
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setItems(parsed);
      }
    } catch (e) {
      console.warn('Failed to parse local storage institusi tugas.', e);
    }
  }, []);

  // Persist to localStorage
  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  const openAddModal = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: InstitusiTugas) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleSave = (data: InstitusiTugas) => {
    setItems((prev) => {
      const exists = prev.some((p) => p.id === data.id);
      const next = exists ? prev.map((p) => (p.id === data.id ? data : p)) : [data, ...prev];
      return next;
    });
  };

  const handleDelete = (id: number) => {
    if (!confirm('Yakin ingin menghapus institusi ini?')) return;
    setItems((prev) => prev.filter((p) => p.id !== id));
    toast.showSuccess('Institusi berhasil dihapus.');
  };

  const columns: ColumnDef<InstitusiTugas>[] = [
    {
      header: 'Nama Institusi',
      accessorKey: 'name',
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    },
    {
      header: 'Alamat',
      accessorKey: 'address',
      cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.address || '-'}</span>,
    },
    {
      header: 'PIC',
      accessorKey: 'contactPerson',
      cell: ({ row }) => <span className="text-sm">{row.original.contactPerson || '-'}</span>,
    },
    {
      header: 'Telepon',
      accessorKey: 'phone',
      cell: ({ row }) => <span className="text-sm">{row.original.phone || '-'}</span>,
    },
    {
      header: 'Email',
      accessorKey: 'email',
      cell: ({ row }) => <span className="text-sm">{row.original.email || '-'}</span>,
    },
    {
      id: 'actions',
      header: t('actions.title'),
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => openEditModal(item)}>
              <Pencil className="h-4 w-4 mr-2" />
              {t('actions.edit')}
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleDelete(item.id)}>
              <Trash2 className="h-4 w-4 mr-2" />
              {t('actions.delete')}
            </Button>
          </div>
        );
      },
    },
  ];

  const leftActions = (
    <div className="flex items-center gap-2">
      <Input className="hidden" />
    </div>
  );

  return (
    <DashboardLayout title={t('sidebar.taskInstitution')} role="administrasi">
      <div className="container mx-auto py-4 px-4">
        <CustomBreadcrumb items={breadcrumbItems} />
        <Card>
          <CardHeader>
            <CardTitle>{t('sidebar.taskInstitution')}</CardTitle>
            <CardDescription>Kelola institusi tujuan tugas santri (data lokal sementara).</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-end mb-4">
              <Button onClick={openAddModal}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Tambah Institusi
              </Button>
            </div>

            <DataTable
              columns={columns}
              data={items}
              leftActions={leftActions}
              exportFileName="institusi-tugas"
              exportTitle="Institusi Tugas"
            />

            <InstitusiTugasFormModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              initialData={editingItem}
              onSave={handleSave}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default InstitusiTugasPage;