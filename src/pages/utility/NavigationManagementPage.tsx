import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import CustomBreadcrumb, { type BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { Settings, Compass, Edit, GripVertical } from 'lucide-react';
import { useGetMenuQuery, useUpdateMenuMutation, useDeleteMenuMutation, type CreateUpdateMenuRequest } from '@/store/slices/menuApi';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import TableLoadingSkeleton from '@/components/TableLoadingSkeleton';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import MenuForm from './MenuForm';
import * as toast from '@/utils/toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import * as LucideIcons from 'lucide-react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent, DragStartEvent, DragOverEvent, DragOverlay } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronDown } from 'lucide-react';
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

type FlattenedItem = MenuItem & {
  parentId: number | null;
  depth: number;
  index: number;
};

// --- Tree Utility Functions ---
function getDragDepth(offset: number, indentationWidth: number) {
  return Math.round(offset / indentationWidth);
}

function getMaxDepth({ previousItem }: { previousItem: FlattenedItem }) {
  if (previousItem) {
    return previousItem.depth + 1;
  }
  return 0;
}

function getMinDepth({ nextItem }: { nextItem: FlattenedItem }) {
  if (nextItem) {
    return nextItem.depth;
  }
  return 0;
}

function flattenTree(items: MenuItem[], parentId: number | null = null, depth = 0): FlattenedItem[] {
  return items.reduce<FlattenedItem[]>((acc, item, index) => {
    return [
      ...acc,
      { ...item, parentId, depth, index },
      ...flattenTree(item.child, item.id, depth + 1),
    ];
  }, []);
}

function buildTree(flattenedItems: FlattenedItem[]): MenuItem[] {
    const rootItems: MenuItem[] = [];
    const itemsById: Record<number, MenuItem> = {};

    // First pass: create nodes and map them by ID
    for (const item of flattenedItems) {
        const newItem: MenuItem = { ...item, child: [] };
        itemsById[item.id] = newItem;
    }

    // Second pass: build the tree structure
    for (const item of flattenedItems) {
        const node = itemsById[item.id];
        if (item.parentId && itemsById[item.parentId]) {
            itemsById[item.parentId].child.push(node);
        } else {
            rootItems.push(node);
        }
    }
    
    // Sort children by order
    const sortChildren = (items: MenuItem[]) => {
        items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        items.forEach(item => sortChildren(item.child));
    };
    sortChildren(rootItems);

    return rootItems;
}

// --- Components ---
const INDENTATION_WIDTH = 24;

const SortableItem: React.FC<{
  item: FlattenedItem;
  onEdit: (item: MenuItem) => void;
  onDelete: (item: MenuItem) => void;
  isDragging?: boolean;
}> = ({ item, onEdit, onDelete, isDragging = false }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
  const IconComponent = item.icon ? (LucideIcons as any)[item.icon] : null;

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    marginLeft: `${item.depth * INDENTATION_WIDTH}px`,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center bg-background border-b last:border-b-0">
      <Button variant="ghost" size="icon" {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing flex-shrink-0">
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </Button>
      <div className="flex-grow grid grid-cols-8 gap-4 items-center p-2 text-sm">
        <div className="col-span-2 font-medium">{item.title}</div>
        <div>{item.route}</div>
        <div>{IconComponent ? <IconComponent className="h-4 w-4" /> : <span>-</span>}</div>
        <div>{item.type}</div>
        <div>{item.position}</div>
        <div><Badge variant={item.status === 'active' ? 'default' : 'secondary'}>{item.status}</Badge></div>
        <div className="flex space-x-2 justify-end">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onEdit(item)}>
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

const NavigationManagementPage: React.FC = () => {
  const { data: menuData, error, isLoading } = useGetMenuQuery();
  const [updateMenu] = useUpdateMenuMutation();
  const [deleteMenu, { isLoading: isDeleting }] = useDeleteMenuMutation();

  const [items, setItems] = useState<FlattenedItem[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [overId, setOverId] = useState<number | null>(null);
  const [offsetLeft, setOffsetLeft] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | undefined>(undefined);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null);

  useEffect(() => {
    if (menuData?.data) {
      const sortedData = [...menuData.data].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      setItems(flattenTree(sortedData));
    }
  }, [menuData]);

  const flattenedItems = useMemo(() => {
    const tree = buildTree(items);
    return flattenTree(tree);
  }, [items]);

  const activeItem = activeId ? flattenedItems.find(({ id }) => id === activeId) : null;

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

  function handleDragStart({ active }: DragStartEvent) {
    setActiveId(active.id as number);
    setOverId(active.id as number);
  }

  function handleDragOver({ over }: DragOverEvent) {
    setOverId(over?.id as number | null);
  }

  function handleDragMove(event: any) {
    setOffsetLeft(event.delta.x);
  }

  async function handleDragEnd({ active, over }: DragEndEvent) {
    if (!activeItem || !over || active.id === over.id) {
      resetState();
      return;
    }

    const overItem = flattenedItems.find(({ id }) => id === over.id);
    if (!overItem) {
      resetState();
      return;
    }

    const activeIndex = flattenedItems.findIndex(({ id }) => id === active.id);
    const overIndex = flattenedItems.findIndex(({ id }) => id === over.id);
    const activeItemData = flattenedItems[activeIndex];

    const dragDepth = getDragDepth(offsetLeft, INDENTATION_WIDTH);
    const newDepth = Math.max(0, Math.min(activeItemData.depth + dragDepth, getMaxDepth({ previousItem: flattenedItems[overIndex] })));

    const newItems = arrayMove(flattenedItems, activeIndex, overIndex);
    const movedItem = newItems[overIndex];
    movedItem.depth = newDepth;

    // Find new parent
    let newParentId: number | null = null;
    for (let i = overIndex - 1; i >= 0; i--) {
      if (newItems[i].depth < newDepth) {
        newParentId = newItems[i].id;
        break;
      }
    }
    movedItem.parentId = newParentId;

    // Rebuild tree and re-flatten to get correct order and structure
    const newTree = buildTree(newItems);
    const finalItems = flattenTree(newTree);
    setItems(finalItems);

    // --- API Update ---
    const itemsToUpdate = finalItems.map((item, index) => ({
        id: item.id,
        data: {
            ...item,
            order: index + 1,
            parent_id: item.parentId,
        } as CreateUpdateMenuRequest
    }));

    toast.showWarning('Menyimpan urutan baru...');
    try {
        await Promise.all(itemsToUpdate.map(item => updateMenu(item)));
        toast.showSuccess('Urutan navigasi berhasil diperbarui!');
    } catch (err) {
        toast.showError('Gagal memperbarui urutan.');
        // Revert on failure
        if (menuData?.data) {
            const sortedData = [...menuData.data].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
            setItems(flattenTree(sortedData));
        }
    }

    resetState();
  }

  function resetState() {
    setActiveId(null);
    setOverId(null);
    setOffsetLeft(0);
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
                <CardDescription>Seret dan lepas untuk mengubah urutan dan membuat sub-menu.</CardDescription>
              </div>
              <Button onClick={handleAddData}>Tambah Item</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <div className="flex items-center bg-muted/50 border-b font-medium text-sm">
                <div style={{ width: `${INDENTATION_WIDTH + 32}px` }} className="flex-shrink-0"></div>
                <div className="flex-grow grid grid-cols-8 gap-4 items-center p-2">
                  <div className="col-span-2">Judul</div>
                  <div>Rute</div>
                  <div>Ikon</div>
                  <div>Tipe</div>
                  <div>Posisi</div>
                  <div>Status</div>
                  <div className="text-right">Aksi</div>
                </div>
              </div>
              <DndContext
                sensors={sensors}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
                onDragCancel={resetState}
                onDragMove={handleDragMove}
              >
                <SortableContext items={flattenedItems.map(({ id }) => id)}>
                  {flattenedItems.map((item) => (
                    <SortableItem key={item.id} item={item} onEdit={handleEditData} onDelete={handleDeleteClick} />
                  ))}
                </SortableContext>
                {createPortal(
                  <DragOverlay dropAnimation={null}>
                    {activeId && activeItem ? (
                      <SortableItem item={activeItem} onEdit={() => {}} onDelete={() => {}} isDragging />
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