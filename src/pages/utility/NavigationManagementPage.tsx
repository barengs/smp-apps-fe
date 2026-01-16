import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import CustomBreadcrumb, { type BreadcrumbItemData } from '@/components/CustomBreadcrumb';
import { Settings, Compass, Edit, GripVertical, ArrowLeft, ArrowRight, Trash2 } from 'lucide-react';
import { useGetMenuQuery, useUpdateMenuMutation, useUpdateMenuPositionMutation, type CreateUpdateMenuRequest } from '@/store/slices/menuApi';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import TableLoadingSkeleton from '@/components/TableLoadingSkeleton';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import MenuForm from './MenuForm';
import * as toast from '@/utils/toast';

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
function buildTreeFromApi(items: import('@/store/slices/menuApi').MenuItem[]): MenuItem[] {
    const itemsById: { [key: number]: MenuItem } = {};
    const rootItems: MenuItem[] = [];

    // Pass 1: Buat map dari semua item berdasarkan ID dan inisialisasi array child.
    items.forEach(item => {
        itemsById[item.id] = { 
            ...item, 
            child: [], 
            title: item.id_title,
            order: typeof item.order === 'string' ? parseInt(item.order) : item.order,
            parent_id: item.parent_id ? (typeof item.parent_id === 'string' ? parseInt(item.parent_id) : item.parent_id) : null
        };
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
    const { child, title, ...rest } = item;
    return [
      ...acc,
      { ...rest, parentId, depth, index, title: title },
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
  style?: React.CSSProperties; // Add style prop
}> = ({ item, isDragging, onEdit, style }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
  const IconComponent = item.icon ? (LucideIcons as any)[item.icon] : null;

  const combinedStyle = {
    transform: CSS.Translate.toString(transform),
    transition,
    marginLeft: `${item.depth * INDENTATION_WIDTH}px`,
    opacity: isDragging ? 0.5 : 1,
    ...style, // Merge passed styles
  };

  return (
    <div ref={setNodeRef} style={combinedStyle} className="flex items-center bg-background border-b last:border-b-0 group">
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
           <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit({ ...item, child: [] })}>
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

const NavigationManagementPage: React.FC = () => {
  const { data: menuData, error, isLoading, isFetching, refetch } = useGetMenuQuery();
  const [updateMenu] = useUpdateMenuMutation();
  const [updateMenuPosition] = useUpdateMenuPositionMutation();

  const [items, setItems] = useState<FlattenedItem[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [offsetLeft, setOffsetLeft] = useState(0); // Track drag offset

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | undefined>(undefined);

  useEffect(() => {
    if (menuData?.data && !isFetching) {
      const treeData = buildTreeFromApi(menuData.data);
      const sortTree = (nodes: MenuItem[]) => {
        nodes.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        nodes.forEach(node => {
          if (node.child?.length) {
            sortTree(node.child);
          }
        });
      };
      sortTree(treeData);
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

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    setEditingMenuItem(undefined);
  };

  const updateStructure = async (updatedItems: FlattenedItem[]) => {
    const newTree = buildTree(updatedItems);
    const finalItems = flattenTree(newTree);
    
    // Optimistic UI update
    setItems(finalItems);

    // Prepare updates with type correction and diffing
    const itemsToUpdate = finalItems
      .map((item, index) => {
        // Determine correct type based on whether it has children in the new structure
        const hasChildren = finalItems.some((child) => child.parentId === item.id);
        let newType = item.type;
        if (hasChildren && item.type !== 'sub-menu') {
          newType = 'sub-menu';
        } else if (!hasChildren && item.type === 'sub-menu') {
          newType = 'main';
        }

        const newOrder = index + 1;
        
        // Find original item state to compare
        const originalItem = items.find(i => i.id === item.id);
        
        // Check if anything changed
        // Note: originalItem.order might be string from API, cast to number
        const isOrderChanged = originalItem ? Number(originalItem.order) !== newOrder : true;
        const isParentChanged = originalItem ? originalItem.parentId !== item.parentId : true;
        const isTypeChanged = originalItem ? originalItem.type !== newType : true;

        if (!isOrderChanged && !isParentChanged && !isTypeChanged) {
            return null; // No change, skip
        }

        return {
          id: item.id,
          data: {
            id_title: item.title,
            route: item.route,
            icon: item.icon,
            type: newType,
            position: item.position,
            status: item.status,
            description: item.description,
            order: newOrder,
            parent_id: item.parentId,
          } as CreateUpdateMenuRequest,
        };
      })
      .filter((update): update is { id: number; data: CreateUpdateMenuRequest } => update !== null);

    if (itemsToUpdate.length === 0) {
        setItems(finalItems);
        return;
    }

    toast.showWarning('Menyimpan struktur baru...');
    try {
        // Use sequential updates with NON-INVALIDATING mutation
        for (const item of itemsToUpdate) {
            await updateMenuPosition(item);
        }
        
        // Manually refetch once at the end to ensure synchronization data
        await refetch();
        toast.showSuccess('Struktur navigasi berhasil diperbarui!');
    } catch (err) {
        toast.showError('Gagal memperbarui struktur.');
        // If error, revert to server state
        // Refetch will handle this indirectly or we can force it
        refetch();
    }
  };

  // --- Projection Logic ---
  const getDragDepth = (offset: number, indentationWidth: number) => {
    const threshold = 10;
    if (Math.abs(offset) < threshold) return 0;
    return Math.round(offset / indentationWidth);
  };

  const getProjection = (items: FlattenedItem[], activeId: number, overId: number, dragOffset: number, indentationWidth: number) => {
    const overItemIndex = items.findIndex(({ id }) => id === overId);
    const activeItemIndex = items.findIndex(({ id }) => id === activeId);
    const activeItem = items[activeItemIndex];
    const newItems = arrayMove(items, activeItemIndex, overItemIndex);
    const previousItem = newItems[overItemIndex - 1];
    const nextItem = newItems[overItemIndex + 1];
    const dragDepth = getDragDepth(dragOffset, indentationWidth);
    const projectedDepth = activeItem.depth + dragDepth;
    const maxDepth = previousItem ? previousItem.depth + 1 : 0;
    const minDepth = 0;
    let depth = projectedDepth;

    if (depth >= maxDepth) {
      depth = maxDepth;
    } else if (depth < minDepth) {
      depth = minDepth;
    }

    return { depth, maxDepth, minDepth, parentId: getParentId() };

    function getParentId() {
      if (depth === 0 || !previousItem) {
        return null;
      }

      if (depth === previousItem.depth) {
        return previousItem.parentId;
      }

      if (depth > previousItem.depth) {
        return previousItem.id;
      }

      const newParent = newItems
        .slice(0, overItemIndex)
        .reverse()
        .find((item) => item.depth === depth)?.parentId;

      return newParent ?? null;
    }
  };

  // State for visual projection (snapping)
  const [projected, setProjected] = useState<{ depth: number; parentId: number | null } | null>(null);

  function handleDragStart({ active }: DragStartEvent) {
    setActiveId(active.id as number);
    setOffsetLeft(0);
    setProjected(null);
  }

  function handleDragMove({ delta, active, over }: any) {
    setOffsetLeft(delta.x);
    if (active && over && active.id !== over.id) {
        // Calculate projection in real-time for visual feedback
        const projection = getProjection(
            items,
            active.id,
            over.id,
            delta.x,
            INDENTATION_WIDTH
        );
        setProjected(projection);
    } else {
        setProjected(null);
    }
  }

  async function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null);
    setOffsetLeft(0);
    setProjected(null);

    const overId = over?.id;

    if (overId && active.id !== overId) {
        const activeItemIndex = items.findIndex(({ id }) => id === active.id);
        const overItemIndex = items.findIndex(({ id }) => id === overId);
        const activeItem = items[activeItemIndex];
        const newItems = arrayMove(items, activeItemIndex, overItemIndex);
        
        // Calculate final depth and parent
        const { depth, parentId } = getProjection(
            items,
            active.id as number,
            overId as number,
            offsetLeft,
            INDENTATION_WIDTH
        );

        // Update active item properties
        newItems[overItemIndex] = {
            ...activeItem, 
            depth, 
            parentId,
            type: parentId ? 'sub-menu' : 'main' 
        };

        await updateStructure(newItems);
    }
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
                <CardDescription>Drag dan drop urutan atau geser ke kanan untuk membuat sub-menu.</CardDescription>
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
              <DndContext sensors={sensors} onDragStart={handleDragStart} onDragMove={handleDragMove} onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
                <SortableContext items={items.map(({ id }) => id)}>
                  {items.map((item) => (
                        <SortableItem 
                            key={item.id} 
                            item={item} 
                            onEdit={handleEditData}
                            // Pass down projected depth if this is the active item
                            style={activeId === item.id ? { 
                                marginLeft: `${(projected?.depth ?? item.depth) * INDENTATION_WIDTH}px`,
                                opacity: 0.3 // Ghost appearance
                            } : undefined}
                        />
                  ))}
                </SortableContext>
                {createPortal(
                  <DragOverlay dropAnimation={null}>
                    {activeId && activeItem ? (
                      <SortableItem 
                        item={{...activeItem, depth: projected?.depth ?? activeItem.depth}} 
                        isDragging 
                        onEdit={() => {}}
                        // Use the projected depth for the overlay too!
                        style={{
                           marginLeft: `${(projected?.depth ?? activeItem.depth) * INDENTATION_WIDTH}px`
                        }}
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


    </DashboardLayout>
  );
};

export default NavigationManagementPage;