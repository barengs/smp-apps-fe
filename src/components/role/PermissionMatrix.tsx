import React, { useState, useMemo } from 'react';
import { PermissionMatrixItem } from '@/store/slices/roleApi';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, ChevronDown, ChevronRight, Check, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

// We now expect the hierarchical modules tree from backend
export interface ModuleNode {
  id: number;
  title: string;
  route: string | null;
  is_group: boolean;
  permissions: string[];
  custom_permissions: string[];
  children: ModuleNode[];
}

interface PermissionMatrixProps {
  menus?: unknown[]; // Legacy flat menus, kept for type compatibility but unused internally now
  modules?: ModuleNode[]; // New hierarchical data from backend
  value: PermissionMatrixItem[];
  onChange: (matrix: PermissionMatrixItem[]) => void;
  readOnly?: boolean;
}

const STANDARD_PERMISSIONS = ['VIEW', 'CREATE', 'EDIT', 'DELETE', 'APPROVE'] as const;
type StandardPermission = typeof STANDARD_PERMISSIONS[number];

export const PermissionMatrix: React.FC<PermissionMatrixProps> = ({
  modules = [],
  value,
  onChange,
  readOnly = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [customPermInput, setCustomPermInput] = useState<Record<number, string>>({});
  const [expandedGroups, setExpandedGroups] = useState<Record<number, boolean>>(() => {
    const state: Record<number, boolean> = {};
    modules.forEach(m => {
      state[m.id] = true; // Expand all by default
    });
    return state;
  });

  const toggleGroup = (id: number) => {
    setExpandedGroups(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    const state: Record<number, boolean> = {};
    modules.forEach(m => { state[m.id] = true; });
    setExpandedGroups(state);
  };

  const collapseAll = () => {
    const state: Record<number, boolean> = {};
    modules.forEach(m => { state[m.id] = false; });
    setExpandedGroups(state);
  };

  const getMenuPermissions = (menuId: number): PermissionMatrixItem | undefined => {
    return value.find(item => Number(item.menu_id) === Number(menuId));
  };

  const hasPermission = (menuId: number, permission: StandardPermission): boolean => {
    const menuPerms = getMenuPermissions(menuId);
    if (!menuPerms) return false;
    return menuPerms.permissions.some(p => p.toUpperCase() === permission.toUpperCase());
  };

  const hasAnyPermission = (menuId: number): boolean => {
    const menuPerms = getMenuPermissions(menuId);
    return !!menuPerms && (menuPerms.permissions.length > 0 || menuPerms.custom_permissions.length > 0);
  };

  const hasAllStandardPermissions = (menuId: number): boolean => {
    const menuPerms = getMenuPermissions(menuId);
    if (!menuPerms) return false;
    return STANDARD_PERMISSIONS.every(p => 
      menuPerms.permissions.some(mp => mp.toUpperCase() === p)
    );
  };

  const getCustomPermissions = (menuId: number): string[] => {
    const menuPerms = getMenuPermissions(menuId);
    return menuPerms?.custom_permissions || [];
  };

  // Update matrix for a single menu
  const updateMenuMatrix = (currentMatrix: PermissionMatrixItem[], menuId: number, permissions: string[], customPerms?: string[]) => {
    const newMatrix = [...currentMatrix];
    const existingIndex = newMatrix.findIndex(item => item.menu_id === menuId);
    
    // Auto dependency: If CREATE, EDIT, DELETE, or APPROVE is selected, ensure VIEW is selected
    const hasModifyingPerm = permissions.some(p => ['CREATE', 'EDIT', 'DELETE', 'APPROVE'].includes(p.toUpperCase()));
    if (hasModifyingPerm && !permissions.includes('VIEW')) {
      permissions.push('VIEW');
    }
    
    // Auto dependency: If VIEW is NOT selected, remove all modifying permissions
    if (!permissions.includes('VIEW')) {
      permissions = []; 
    }

    const uniquePerms = Array.from(new Set(permissions));
    const finalCustomPerms = customPerms !== undefined ? customPerms : (existingIndex >= 0 ? newMatrix[existingIndex].custom_permissions : []);
    
    if (uniquePerms.length === 0 && finalCustomPerms.length === 0) {
      if (existingIndex >= 0) newMatrix.splice(existingIndex, 1);
    } else {
      if (existingIndex >= 0) {
        newMatrix[existingIndex] = { menu_id: menuId, permissions: uniquePerms, custom_permissions: finalCustomPerms };
      } else {
        newMatrix.push({ menu_id: menuId, permissions: uniquePerms, custom_permissions: finalCustomPerms });
      }
    }
    return newMatrix;
  };

  const togglePermission = (menuId: number, permission: StandardPermission, checked: boolean) => {
    if (readOnly) return;
    const standardPermission = permission.toUpperCase();
    
    let currentPerms = getMenuPermissions(menuId)?.permissions || [];
    
    if (checked) {
      currentPerms = [...currentPerms, standardPermission];
    } else {
      currentPerms = currentPerms.filter(p => p.toUpperCase() !== standardPermission);
    }
    
    onChange(updateMenuMatrix(value, menuId, currentPerms));
  };

  const toggleAllRowPermissions = (menuId: number, checked: boolean) => {
    if (readOnly) return;
    const newPerms = checked ? [...STANDARD_PERMISSIONS] : [];
    onChange(updateMenuMatrix(value, menuId, newPerms));
  };

  // Group-level master toggle
  const toggleGroupPermissions = (group: ModuleNode, checked: boolean) => {
    if (readOnly) return;
    let newMatrix = [...value];
    
    const applyToChildren = (children: ModuleNode[]) => {
      children.forEach(child => {
        if (!child.is_group) {
          const newPerms = checked ? [...STANDARD_PERMISSIONS] : [];
          newMatrix = updateMenuMatrix(newMatrix, child.id, newPerms);
        }
        if (child.children && child.children.length > 0) {
          applyToChildren(child.children);
        }
      });
    };
    
    applyToChildren(group.children);
    onChange(newMatrix);
  };

  // Check if a group has any child with permissions
  const groupHasAnyPermission = (group: ModuleNode): boolean => {
    let hasPerm = false;
    const checkChildren = (children: ModuleNode[]) => {
      children.forEach(child => {
        if (!child.is_group && hasAnyPermission(child.id)) hasPerm = true;
        if (child.children) checkChildren(child.children);
      });
    };
    checkChildren(group.children);
    return hasPerm;
  };
  
  // Check if a group has all standard permissions across all children
  const groupHasAllPermissions = (group: ModuleNode): boolean => {
    let allLeafNodes = 0;
    let allCheckedNodes = 0;
    
    const countChildren = (children: ModuleNode[]) => {
      children.forEach(child => {
        if (!child.is_group) {
          allLeafNodes++;
          if (hasAllStandardPermissions(child.id)) allCheckedNodes++;
        }
        if (child.children) countChildren(child.children);
      });
    };
    countChildren(group.children);
    return allLeafNodes > 0 && allLeafNodes === allCheckedNodes;
  };

  // Bulk Actions
  const handleBulkFullAccess = () => {
    if (readOnly) return;
    let newMatrix = [...value];
    const applyToAll = (nodes: ModuleNode[]) => {
      nodes.forEach(node => {
        if (!node.is_group) {
          newMatrix = updateMenuMatrix(newMatrix, node.id, [...STANDARD_PERMISSIONS]);
        }
        if (node.children) applyToAll(node.children);
      });
    };
    applyToAll(modules);
    onChange(newMatrix);
  };

  const handleBulkViewOnly = () => {
    if (readOnly) return;
    let newMatrix = [...value];
    const applyToAll = (nodes: ModuleNode[]) => {
      nodes.forEach(node => {
        if (!node.is_group) {
          // Keep custom perms, but only set VIEW for standard
          const customPerms = getCustomPermissions(node.id);
          newMatrix = updateMenuMatrix(newMatrix, node.id, ['VIEW'], customPerms);
        }
        if (node.children) applyToAll(node.children);
      });
    };
    applyToAll(modules);
    onChange(newMatrix);
  };

  const handleBulkClearAll = () => {
    if (readOnly) return;
    onChange([]);
  };

  const addCustomPermission = (menuId: number, permissionName: string) => {
    if (readOnly || !permissionName.trim()) return;
    const currentPerms = getMenuPermissions(menuId)?.permissions || [];
    const currentCustom = getMenuPermissions(menuId)?.custom_permissions || [];
    
    if (!currentCustom.includes(permissionName.trim())) {
      const newCustom = [...currentCustom, permissionName.trim()];
      onChange(updateMenuMatrix(value, menuId, currentPerms, newCustom));
    }
    setCustomPermInput({ ...customPermInput, [menuId]: '' });
  };

  const removeCustomPermission = (menuId: number, permissionName: string) => {
    if (readOnly) return;
    const currentPerms = getMenuPermissions(menuId)?.permissions || [];
    const currentCustom = getMenuPermissions(menuId)?.custom_permissions || [];
    
    const newCustom = currentCustom.filter(p => p !== permissionName);
    onChange(updateMenuMatrix(value, menuId, currentPerms, newCustom));
  };

  // Filter modules based on search
  const filterNodes = (nodes: ModuleNode[], term: string): ModuleNode[] => {
    if (!term) return nodes;
    
    const lowerTerm = term.toLowerCase();
    return nodes.reduce<ModuleNode[]>((acc, node) => {
      const matchesTitle = node.title.toLowerCase().includes(lowerTerm);
      const filteredChildren = filterNodes(node.children || [], term);
      
      if (matchesTitle || filteredChildren.length > 0) {
        acc.push({ ...node, children: filteredChildren });
      }
      return acc;
    }, []);
  };

  const filteredModules = filterNodes(modules, searchTerm);

  // Render a single leaf node (menu with route)
  const renderLeafNode = (node: ModuleNode, depth: number) => {
    const isAllChecked = hasAllStandardPermissions(node.id);
    const hasAny = hasAnyPermission(node.id);
    
    return (
      <TableRow key={node.id} className={cn(hasAny && "bg-muted/10")}>
        <TableCell style={{ paddingLeft: `${depth * 24 + 16}px` }}>
          <div className="flex items-center gap-2">
            {!readOnly && (
              <Checkbox 
                checked={isAllChecked} 
                onCheckedChange={(c) => toggleAllRowPermissions(node.id, c as boolean)}
                className="mr-1 h-3.5 w-3.5"
                title="Pilih Semua Aksi"
              />
            )}
            <span className={cn("text-sm", hasAny ? "font-medium" : "")}>{node.title}</span>
          </div>
        </TableCell>
        
        {STANDARD_PERMISSIONS.map((permission) => (
          <TableCell key={permission} className="text-center p-2">
            {readOnly ? (
              <div className="flex justify-center">
                {hasPermission(node.id, permission) ? (
                  <Check className="h-4 w-4 text-emerald-600 font-bold" />
                ) : (
                  <Minus className="h-4 w-4 text-muted-foreground/30" />
                )}
              </div>
            ) : (
              <div className="flex justify-center">
                <Checkbox
                  checked={hasPermission(node.id, permission)}
                  onCheckedChange={(checked) => togglePermission(node.id, permission, checked as boolean)}
                />
              </div>
            )}
          </TableCell>
        ))}
        
        <TableCell>
          <div className="flex flex-wrap gap-1 items-center">
            {getCustomPermissions(node.id).map((perm) => (
              <Badge key={perm} variant="secondary" className="gap-1 text-xs">
                {perm}
                {!readOnly && (
                  <button onClick={() => removeCustomPermission(node.id, perm)} className="ml-1 hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                )}
              </Badge>
            ))}
            {!readOnly && (
              <Input
                placeholder="+"
                value={customPermInput[node.id] || ''}
                onChange={(e) => setCustomPermInput({ ...customPermInput, [node.id]: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCustomPermission(node.id, customPermInput[node.id] || '');
                  }
                }}
                onBlur={() => addCustomPermission(node.id, customPermInput[node.id] || '')}
                className="h-6 w-16 text-xs px-2"
              />
            )}
          </div>
        </TableCell>
      </TableRow>
    );
  };

  // Render a group node (menu without route, acts as folder)
  const renderGroupNode = (node: ModuleNode, depth: number) => {
    const isExpanded = expandedGroups[node.id];
    const isAllChecked = groupHasAllPermissions(node);
    const hasAny = groupHasAnyPermission(node);
    
    return (
      <React.Fragment key={node.id}>
        <TableRow className="bg-muted/40 hover:bg-muted/60">
          <TableCell colSpan={7} className="py-2">
            <div className="flex items-center gap-2" style={{ paddingLeft: `${depth * 24}px` }}>
              <button 
                onClick={(e) => { e.preventDefault(); toggleGroup(node.id); }}
                className="p-1 hover:bg-muted rounded-md focus:outline-none"
              >
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
              
              {!readOnly && (
                <Checkbox 
                  checked={isAllChecked}
                  onCheckedChange={(c) => toggleGroupPermissions(node, c as boolean)}
                  className={cn("mr-2", hasAny && !isAllChecked ? "data-[state=unchecked]:bg-primary/50" : "")}
                  title="Pilih Semua Modul"
                />
              )}
              
              <span className="font-semibold text-sm tracking-tight">{node.title}</span>
              {node.is_group && (
                <Badge variant="outline" className="ml-2 text-[10px] uppercase h-5 font-medium px-1.5">
                  Grup
                </Badge>
              )}
            </div>
          </TableCell>
        </TableRow>
        
        {isExpanded && node.children && node.children.map(child => (
          child.is_group ? renderGroupNode(child, depth + 1) : renderLeafNode(child, depth + 1)
        ))}
      </React.Fragment>
    );
  };

  return (
    <div className="space-y-4">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-background z-10 sticky top-0 py-2">
        <div className="flex-1 w-full sm:w-auto">
          <Input
            placeholder="Cari modul atau menu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md bg-background"
          />
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
          {!readOnly && (
            <>
              <Button type="button" variant="outline" size="sm" onClick={handleBulkFullAccess}>
                Akses Penuh
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={handleBulkViewOnly}>
                Hanya Lihat
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={handleBulkClearAll} className="text-destructive">
                Kosongkan
              </Button>
              <div className="w-px h-6 bg-border mx-1" />
            </>
          )}
          <Button type="button" variant="ghost" size="sm" onClick={expandAll} className="text-xs">
            Buka Semua
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={collapseAll} className="text-xs">
            Tutup Semua
          </Button>
        </div>
      </div>

      {/* Matrix Table */}
      <div className="border rounded-lg overflow-hidden bg-background">
        <div className="max-h-[600px] overflow-y-auto">
          <Table>
            <TableHeader className="bg-muted/80 sticky top-0 z-10 shadow-sm backdrop-blur-sm">
              <TableRow>
                <TableHead className="w-[300px] font-bold text-foreground">MODUL / MENU</TableHead>
                <TableHead className="text-center w-[80px] font-bold text-foreground">LIHAT</TableHead>
                <TableHead className="text-center w-[80px] font-bold text-foreground">TAMBAH</TableHead>
                <TableHead className="text-center w-[80px] font-bold text-foreground">UBAH</TableHead>
                <TableHead className="text-center w-[80px] font-bold text-foreground">HAPUS</TableHead>
                <TableHead className="text-center w-[80px] font-bold text-foreground">SETUJUI</TableHead>
                <TableHead className="min-w-[150px] font-bold text-foreground">AKSI LAINNYA</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredModules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    Tidak ada modul atau menu ditemukan
                  </TableCell>
                </TableRow>
              ) : (
                filteredModules.map(module => 
                  module.is_group ? renderGroupNode(module, 0) : renderLeafNode(module, 0)
                )
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      {/* Summary Footer */}
      {!readOnly && (
        <div className="flex justify-between items-center text-sm text-muted-foreground pt-2">
          <span>Modul Induk: {modules.length}</span>
          <span>Hak Akses Diberikan pada {value.length} Menu</span>
        </div>
      )}
    </div>
  );
};
