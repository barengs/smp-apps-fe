import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import CustomBreadcrumb, { type BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { Settings, Compass, Edit, GripVertical, ArrowLeft, ArrowRight, Trash2 } from 'lucide-react';
import { useGetMenuQuery, useUpdateMenuMutation, useDeleteMenuMutation, type CreateUpdateMenuRequest } from '@/store/slices/menuApi';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import TableLoadingSkeleton from '@/components/TableLoadingSkeleton';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import MenuForm from './MenuForm';
import * as toast from '@/utils/toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import * as LucideIcons from 'lucide-react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent, DragStartEvent, DragOverlay } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Badge } from '@/components/ui/badge';
import { createPortal } from 'react-dom';

// --- Types ---
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
  parent_id: number | null;
  child: MenuItem[];
}

type FlattenedItem = Omit<MenuItem, 'child'> & {
  parentId: number | null;
  depth: number;
  index: number;
};

// --- Tree Utility Functions ---

/**
 * Membangun struktur pohon dari daftar item datar yang diterima dari API.
 * Ini memastikan item dengan parent_id ditempatkan di dalam array 'child' dari induknya.
 */
function buildTreeFromApi(items: MenuItem[]): MenuItem[] {
    const itemsById: { [key: number]: MenuItem } = {};
    const rootItems: MenuItem[] = [];

    // Pass 1: Buat map dari semua item berdasarkan ID dan inisialisasi array child.
    items.forEach(item => {
        itemsById[item.id] = { ...item, child: [] };
    });

    // Pass 2: Hubungkan anak ke induknya.
    items.forEach(item => {
        const node = itemsById[item.id];
        if (item.parent_id && itemsById[item.parent_id]) {
            itemsById[item.parent_id].child.push(node);
        } else {
            rootItems.push(node);
        }
    });

    return rootItems;
}

function flattenTree(items: MenuItem[], parentId: number | null = null, depth = 0): FlattenedItem[] {
  return items.reduce<FlattenedItem[]>((acc, item, index) => {
    const children = item.child ?? [];
    const { child, ...rest } = item;
    return [
      ...acc,
      { ...rest, parentId, depth, index },
      ...flattenTree(children, item.id, depth + 1),
    ];
  }, []);
}

function buildTree(flattenedItems: FlattenedItem[]): MenuItem[] {
    const rootItems: MenuItem[] = [];
    const itemsById: Record<number, MenuItem> = {};

    flattenedItems.forEach(item => {
        itemsById[item.id] = { ...item, parent_id: item.parentId, child: [] };
    });

    flattenedItems.forEach(item => {
        const node = itemsById[item.id];
        if (item.parentId && itemsById[item.parentId]) {
            itemsById[item.parentId].child.push(node);
        } else {
            rootItems.push(node);
        }
    });
    
    return rootItems;
}

// --- Components ---
const INDENTATION_WIDTH = 24;

const SortableItem: React.FC<{
  item: FlattenedItem;
  isDragging?: boolean;
  onEdit: (item: MenuItem) => void;
  onDelete: (item: MenuItem) => void;
  onIndent: (id: number) => void;
  onOutdent: (id: number) => void;
  canIndent: boolean;
  canOutdent: boolean;
}> = ({ item, isDragging, onEdit, onDelete, onIndent, onOutdent, canIndent, canOutdent }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
  const IconComponent = item.icon ? (LucideIcons as any)[item.icon] : null;

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    marginLeft: `${item.depth * INDENTATION_WIDTH}px`,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center bg-background border-b last:border-b-0 group">
      <div className="flex items-center flex-shrink-0">
        <Button variant="ghost" size="icon" {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </Button>
      </div>
      <div className="flex-grow grid grid-cols-12 gap-4 items-center p-2 text-sm">
        <div className="col-span-3 font-medium">{item.title}</div>
        <div className="col-span-2">{item.route}</div>
        <div className="col-span-1">{IconComponent ? <IconComponent className="h-4 w-4" /> : <span>-</span>}</div>
        <div className="col-span-1">{item.type}</div>
        <div className="col-span-1">{item.position}</div>
        <div className="col-span-1"><Badge variant={item.status === 'active' ? 'default' : 'secondary'}>{item.status}</Badge></div>
        <div className="col-span-3 flex space-x-1 justify-end">
           <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onIndent(item.id)} disabled={!canIndent}>
             <ArrowRight className="h-4 w-4" />
           </Button>
           <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onOutdent(item.id)} disabled={!canOutdent}>
             <ArrowLeft className="h-4 w-4" />
           </Button>
           <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit({ ...item, child: [] })}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => onDelete({ ...item, child: [] })}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

const NavigationManagementPage: React.FC = () => {
  const { data: menuData, error, isLoading, isFetching } = useGetMenuQuery();
  const [updateMenu] = useUpdateMenuMutation();
  const [deleteMenu, { isLoading: isDeleting }] = useDeleteMenuMutation();

  const [items, setItems] = useState<FlattenedItem[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | undefined>(undefined);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null);

  useEffect(() => {
    if (menuData?.data && !isFetching) {
      // 1. Bangun struktur pohon yang benar dari data API
      const treeData = buildTreeFromApi(menuData.data);

      // 2. Urutkan pohon secara rekursif berdasarkan 'order'
      const sortTree = (nodes: MenuItem[]) => {
        nodes.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        nodes.forEach(node => {
          if (node.child?.length) {
            sortTree(node.child);
          }
        });
      };
      sortTree(treeData);

      // 3. Ratakan (flatten) pohon yang sudah benar untuk ditampilkan di UI
      setItems(flattenTree(treeData));
    }
  }, [menuData, isFetching]);

  const activeItem = activeId ? items.find(({ id }) => id === activeId) : null;
  const sensors = useSensors(useSensor(PointerSensor));

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

  const updateStructure = async (updatedItems: FlattenedItem[]) => {
    const newTree = buildTree(updatedItems);
    const finalItems = flattenTree(newTree);
    setItems(finalItems);

    const itemsToUpdate = finalItems.map((item, index) => ({
        id: item.id,
        data: {
            title: item.title,
            route: item.route,
            icon: item.icon,
            type: item.type,
            position: item.position,
            status: item.status,
            description: item.description,
            order: index + 1,
            parent_id: item.parentId,
        } as CreateUpdateMenuRequest
    }));

    toast.showWarning('Menyimpan struktur baru...');
    try {
        await Promise.all(itemsToUpdate.map(item => updateMenu(item)));
        toast.showSuccess('Struktur navigasi berhasil diperbarui!');
    } catch (err) {
        toast.showError('Gagal memperbarui struktur.');
        if (menuData?.data) {
            const treeData = buildTreeFromApi(menuData.data);
            setItems(flattenTree(treeData));
        }
    }
  };

  const handleIndent = (itemId: number) => {
    const itemIndex = items.findIndex(item => item.id === itemId);
    if (itemIndex > 0) {
        const newItems = [...items];
        const currentItem = newItems[itemIndex];
        const previousItem = newItems[itemIndex - 1];
        
        if (currentItem.depth <= previousItem.depth) {
            currentItem.depth += 1;
            currentItem.parentId = previousItem.id;
            currentItem.type = 'sub-menu';
            updateStructure(newItems);
        }
    }
  };

  const handleOutdent = (itemId: number) => {
    const itemIndex = items.findIndex(item => item.id === itemId);
    const newItems = [...items];
    const currentItem = newItems[itemIndex];

    if (currentItem.depth > 0) {
        const oldParent = items.find(item => item.id === currentItem.parentId);
        currentItem.depth -= 1;
        currentItem.parentId = oldParent ? oldParent.parentId : null;
        
        if (currentItem.parentId === null) {
            currentItem.type = 'main';
        }
        updateStructure(newItems);
    }
  };

  function handleDragStart({ active }: DragStartEvent) {
    setActiveId(active.id as number);
  }

  async function handleDragEnd({ active, over }: DragEndEvent) {
    if (over && active.id !== over.id) {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const movedItems = arrayMove(items, oldIndex, newIndex);
        
        await updateStructure(movedItems);
    }
    setActiveId(null);
  }

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
                <CardDescription>Gunakan tombol panah untuk membuat sub-menu dan seret untuk mengubah urutan.</CardDescription>
              </div>
              <Button onClick={handleAddData}>Tambah Item</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <div className="flex items-center bg-muted/50 border-b font-medium text-sm">
                <div style={{ width: '48px' }} className="flex-shrink-0"></div>
                <div className="flex-grow grid grid-cols-12 gap-4 items-center p-2">
                  <div className="col-span-3">Judul</div>
                  <div className="col-span-2">Rute</div>
                  <div className="col-span-1">Ikon</div>
                  <div className="col-span-1">Tipe</div>
                  <div className="col-span-1">Posisi</div>
                  <div className="col-span-1">Status</div>
                  <div className="col-span-3 text-right">Aksi</div>
                </div>
              </div>
              <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
                <SortableContext items={items.map(({ id }) => id)}>
                  {items.map((item, index) => {
                      const canIndent = index > 0 && item.depth <= items[index - 1].depth;
                      const canOutdent = item.depth > 0;
                      return (
                        <SortableItem 
                            key={item.id} 
                            item={item} 
                            onEdit={handleEditData} 
                            onDelete={handleDeleteClick}
                            onIndent={handleIndent}
                            onOutdent={handleOutdent}
                            canIndent={canIndent}
                            canOutdent={canOutdent}
                        />
                      )
                  })}
                </SortableContext>
                {createPortal(
                  <DragOverlay dropAnimation={null}>
                    {activeId && activeItem ? (
                      <SortableItem 
                        item={activeItem} 
                        isDragging 
                        onEdit={() => {}} 
                        onDelete={() => {}}
                        onIndent={() => {}}
                        onOutdent={() => {}}
                        canIndent={false}
                        canOutdent={false}
                      />
                    ) : null}
                  </DragOverlay>,
                  document.body
                )}
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