import React, { useMemo, useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import CustomBreadcrumb, { type BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { Settings, Compass, Edit, GripVertical } from 'lucide-react';
import { useGetMenuQuery, useUpdateMenuMutation, useDeleteMenuMutation, type CreateUpdateMenuRequest } from '@/store/slices/menuApi';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import TableLoadingSkeleton from '@/components/TableLoadingSkeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronDown } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import MenuForm from './MenuForm';
import * as toast from '@/utils/toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import * as LucideIcons from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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

// --- Sortable Row Component ---
const SortableRow: React.FC<{ menuItem: MenuItem; onEdit: (item: MenuItem) => void; onDelete: (item: MenuItem) => void }> = ({ menuItem, onEdit, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: menuItem.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0,
    position: 'relative' as const,
  };

  const IconComponent = menuItem.icon ? (LucideIcons as any)[menuItem.icon] : null;
  const children = menuItem.child;

  return (
    <TableRow ref={setNodeRef} style={style}>
      <TableCell className="w-12">
        <Button variant="ghost" size="icon" {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </Button>
      </TableCell>
      <TableCell>{menuItem.title}</TableCell>
      <TableCell>{menuItem.route}</TableCell>
      <TableCell>{IconComponent ? <IconComponent className="h-4 w-4" /> : <span>-</span>}</TableCell>
      <TableCell>{menuItem.type}</TableCell>
      <TableCell>{menuItem.order}</TableCell>
      <TableCell>{menuItem.position}</TableCell>
      <TableCell>{menuItem.status}</TableCell>
      <TableCell>
        {children && children.length > 0 ? (
          children.length === 1 ? (
            <Badge variant="outline">{children[0].title}</Badge>
          ) : (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  {children.length} Sub-Menu <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-2">
                <div className="space-y-1">
                  {children.map((child) => (
                    <Badge key={child.id} variant="secondary" className="block w-full text-left font-normal whitespace-normal">
                      {child.title}
                    </Badge>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          )
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </TableCell>
      <TableCell>
        <div className="flex space-x-2">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onEdit(menuItem)}>
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

const NavigationManagementPage: React.FC = () => {
  const { data: menuData, error, isLoading } = useGetMenuQuery();
  const [updateMenu] = useUpdateMenuMutation();
  const [deleteMenu, { isLoading: isDeleting }] = useDeleteMenuMutation();

  const [activeMenuItems, setActiveMenuItems] = useState<MenuItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | undefined>(undefined);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null);

  useEffect(() => {
    if (menuData?.data) {
      const sortedData = [...menuData.data].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      setActiveMenuItems(sortedData);
    }
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

  const handleDeleteClick = (item: MenuItem) => {
    setItemToDelete(item);
    setIsConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (itemToDelete) {
      try {
        await deleteMenu(itemToDelete.id).unwrap();
        toast.showSuccess(`Item navigasi "${itemToDelete.title}" berhasil dihapus.`);
        setIsConfirmDeleteOpen(false);
        setItemToDelete(null);
      } catch (err) {
        toast.showError('Gagal menghapus item navigasi.');
      }
    }
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    setEditingMenuItem(undefined);
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = activeMenuItems.findIndex((item) => item.id === active.id);
      const newIndex = activeMenuItems.findIndex((item) => item.id === over.id);
      const reorderedItems = arrayMove(activeMenuItems, oldIndex, newIndex);
      setActiveMenuItems(reorderedItems);

      const updatePromises = reorderedItems.map((item, index) => {
        const newOrder = index + 1;
        if (item.order !== newOrder) {
          const { id, child, ...rest } = item;
          const updateData: CreateUpdateMenuRequest = { ...rest, order: newOrder };
          return updateMenu({ id, data: updateData }).unwrap();
        }
        return Promise.resolve();
      });

      toast.showWarning('Menyimpan urutan baru...');
      try {
        await Promise.all(updatePromises);
        toast.showSuccess('Urutan navigasi berhasil diperbarui!');
      } catch (err) {
        toast.showError('Gagal memperbarui urutan.');
        // Revert to original order on failure
        if (menuData?.data) {
            const sortedData = [...menuData.data].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
            setActiveMenuItems(sortedData);
        }
      }
    }
  };

  if (isLoading) return <TableLoadingSkeleton numCols={8} />;
  const isNotFound = error && (error as FetchBaseQueryError).status === 404;
  if (error && !isNotFound) return <div>Error: Gagal memuat data.</div>;

  return (
    <DashboardLayout title="Manajemen Navigasi" role="administrasi">
      <div className="container mx-auto py-4 px-4">
        <CustomBreadcrumb items={breadcrumbItems} />
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Daftar Item Navigasi</CardTitle>
                <CardDescription>Seret dan lepas untuk mengubah urutan item navigasi.</CardDescription>
              </div>
              <Button onClick={handleAddData}>Tambah Item</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={activeMenuItems.map(item => item.id)} strategy={verticalListSortingStrategy}>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12"></TableHead>
                        <TableHead>Judul</TableHead>
                        <TableHead>Rute</TableHead>
                        <TableHead>Ikon</TableHead>
                        <TableHead>Tipe</TableHead>
                        <TableHead>Urutan</TableHead>
                        <TableHead>Posisi</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Sub-Menu</TableHead>
                        <TableHead>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeMenuItems.length > 0 ? (
                        activeMenuItems.map((item) => (
                          <SortableRow key={item.id} menuItem={item} onEdit={handleEditData} onDelete={handleDeleteClick} />
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={10} className="h-24 text-center">
                            Tidak ada hasil.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </SortableContext>
              </DndContext>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingMenuItem ? 'Edit Item Navigasi' : 'Tambah Item Navigasi Baru'}</DialogTitle>
            <DialogDescription>{editingMenuItem ? 'Ubah detail item navigasi ini.' : 'Isi detail untuk item navigasi baru.'}</DialogDescription>
          </DialogHeader>
          <MenuForm initialData={editingMenuItem} onSuccess={handleFormSuccess} onCancel={() => setIsModalOpen(false)} />
        </DialogContent>
      </Dialog>

      <AlertDialog open={isConfirmDeleteOpen} onOpenChange={setIsConfirmDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Penghapusan</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus item navigasi "{itemToDelete?.title}"? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} disabled={isDeleting}>
              {isDeleting ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default NavigationManagementPage;