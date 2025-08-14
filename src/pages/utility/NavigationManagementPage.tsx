import React, { useState, useEffect, useMemo } from 'react';
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

// Mengubah FlattenedItem agar tidak memiliki properti 'child'
type FlattenedItem = Omit<MenuItem, 'child'> & {
  parentId: number | null;
  depth: number;
  index: number;
};

// --- Tree Utility Functions ---
function flattenTree(items: MenuItem[], parentId: number | null = null, depth = 0): FlattenedItem[] {
  return items.reduce<FlattenedItem[]>((acc, item, index) => {
    const children = item.child ?? [];
    const { child, ...rest } = item; // Exclude 'child' property
    return [
      ...acc,
      { ...rest, parentId, depth, index }, // 'child' is now truly omitted
      ...flattenTree(children, item.id, depth + 1),
    ];
  }, []);
}

function buildTree(flattenedItems: FlattenedItem[]): MenuItem[] {
    const rootItems: MenuItem[] = [];
    const itemsById: Record<number, MenuItem> = {};

    // First pass: create nodes and map them by ID
    for (const item of flattenedItems) {
        // Explicitly pick properties that belong to MenuItem
        const newItem: MenuItem = {
            id: item.id,
            title: item.title,
            description: item.description,
            icon: item.icon,
            route: item.route,
            type: item.type,
            position: item.position,
            status: item.status,
            order: item.order,
            parent_id: item.parentId, // Use parentId from FlattenedItem as parent_id for MenuItem
            child: [], // Initialize children as empty array
        };
        itemsById[item.id] = newItem;
    }

    // Second pass: build the tree structure
    for (const item of flattenedItems) {
        const node = itemsById[item.id];
        if (item.parentId && itemsById[item.parentId]) {
            // Pastikan child array ada sebelum push
            if (!itemsById[item.parentId].child) {
                itemsById[item.parentId].child = [];
            }
            itemsById[item.parentId].child.push(node);
        } else {
            rootItems.push(node);
        }
    }
    
    // Sort children by order
    const sortChildren = (items: MenuItem[]) => {
        items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        items.forEach(item => sortChildren(item.child ?? [])); // Pastikan item.child selalu array
    };
    sortChildren(rootItems);

    return rootItems;
}

function getDescendantIds(items: FlattenedItem[], parentId: number): number[] {
    const children = items.filter(item => item.parentId === parentId);
    let descendantIds: number[] = [];
    for (const child of children) {
        descendantIds.push(child.id);
        descendantIds = [...descendantIds, ...getDescendantIds(items, child.id)];
    }
    return descendantIds;
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
        <div className="col-span-4 font-medium">{item.title}</div>
        <div className="col-span-2">{item.route}</div>
        <div className="col-span-1">{IconComponent ? <IconComponent className="h-4 w-4" /> : <span>-</span>}</div>
        <div className="col-span-1">{item.type}</div>
        <div className="col-span-1">{item.position}</div>
        <div className="col-span-1"><Badge variant={item.status === 'active' ? 'default' : 'secondary'}>{item.status}</Badge></div>
        <div className="col-span-2 flex space-x-1 justify-end">
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
      const sortedData = [...menuData.data].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      setItems(flattenTree(sortedData));
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
            const sortedData = [...menuData.data].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
            setItems(flattenTree(sortedData));
        }
    }
  };

  const handleIndent = (itemId: number) => {
    const itemIndex = items.findIndex(item => item.id === itemId);
    if (itemIndex > 0) {
        const newItems = [...items];
        const currentItem = newItems[itemIndex];
        const previousItem = newItems[itemIndex - 1];
        
        // Hanya indent jika item saat ini tidak lebih dalam dari item sebelumnya
        if (currentItem.depth <= previousItem.depth) {
            currentItem.depth += 1;
            currentItem.parentId = previousItem.id;
            currentItem.type = 'sub-menu'; // Set type to 'sub-menu' when indented
            updateStructure(newItems);
        }
    }
  };

  const handleOutdent = (itemId: number) => {
    const itemIndex = items.findIndex(item => item.id === itemId);
    const newItems = [...items];
    const currentItem = newItems[itemIndex];

    if (currentItem.depth > 0) {
        // Cari parent dari parent saat ini
        const oldParent = items.find(item => item.id === currentItem.parentId);
        currentItem.depth -= 1;
        currentItem.parentId = oldParent ? oldParent.parentId : null;
        
        if (currentItem.parentId === null) {
            currentItem.type = 'main'; // Set type to 'main' if it becomes a top-level item
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
        
        // Simply pass the reordered items to updateStructure.
        // The buildTree and flattenTree functions will correctly re-calculate depths and parentIds.
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
                  <div className="col-span-4">Judul</div>
                  <div className="col-span-2">Rute</div>
                  <div className="col-span-1">Ikon</div>
                  <div className="col-span-1">Tipe</div>
                  <div className="col-span-1">Posisi</div>
                  <div className="col-span-1">Status</div>
                  <div className="col-span-2 text-right">Aksi</div>
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