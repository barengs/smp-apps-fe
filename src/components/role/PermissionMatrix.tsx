import React, { useState, useMemo } from 'react';
import { MenuItem } from '@/store/slices/menuApi';
import { PermissionMatrixItem } from '@/store/slices/roleApi';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface PermissionMatrixProps {
  menus: MenuItem[];
  value: PermissionMatrixItem[];
  onChange: (matrix: PermissionMatrixItem[]) => void;
  readOnly?: boolean;
}

const STANDARD_PERMISSIONS = ['VIEW', 'CREATE', 'EDIT', 'DELETE', 'APPROVE'];

// Flatten menu tree to list with depth information and unique keys
const flattenMenus = (menus: MenuItem[], depth = 0, parentPath = ''): Array<MenuItem & { depth: number; uniqueKey: string }> => {
  const result: Array<MenuItem & { depth: number; uniqueKey: string }> = [];
  
  for (const menu of menus) {
    const uniqueKey = parentPath ? `${parentPath}-${menu.id}` : `${menu.id}`;
    result.push({ ...menu, depth, uniqueKey });
    if (menu.child && menu.child.length > 0) {
      result.push(...flattenMenus(menu.child, depth + 1, uniqueKey));
    }
  }
  
  return result;
};

export const PermissionMatrix: React.FC<PermissionMatrixProps> = ({
  menus,
  value,
  onChange,
  readOnly = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [customPermInput, setCustomPermInput] = useState<Record<number, string>>({});

  const flatMenus = useMemo(() => flattenMenus(menus), [menus]);

  const filteredMenus = useMemo(() => {
    if (!searchTerm) return flatMenus;
    return flatMenus.filter(menu =>
      menu.id_title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [flatMenus, searchTerm]);

  const getMenuPermissions = (menuId: number): PermissionMatrixItem | undefined => {
    return value.find(item => item.menu_id === menuId);
  };

  const hasPermission = (menuId: number, permission: string): boolean => {
    const menuPerms = getMenuPermissions(menuId);
    return menuPerms?.permissions.includes(permission) || false;
  };

  const getCustomPermissions = (menuId: number): string[] => {
    const menuPerms = getMenuPermissions(menuId);
    return menuPerms?.custom_permissions || [];
  };

  const togglePermission = (menuId: number, permission: string, checked: boolean) => {
    if (readOnly) return;

    const newMatrix = [...value];
    const existingIndex = newMatrix.findIndex(item => item.menu_id === menuId);

    if (existingIndex >= 0) {
      const existing = newMatrix[existingIndex];
      if (checked) {
        // Add permission
        if (!existing.permissions.includes(permission)) {
          existing.permissions = [...existing.permissions, permission];
        }
      } else {
        // Remove permission
        existing.permissions = existing.permissions.filter(p => p !== permission);
      }

      // Remove menu from matrix if no permissions left
      if (existing.permissions.length === 0 && (!existing.custom_permissions || existing.custom_permissions.length === 0)) {
        newMatrix.splice(existingIndex, 1);
      }
    } else if (checked) {
      // Add new menu with permission
      newMatrix.push({
        menu_id: menuId,
        permissions: [permission],
        custom_permissions: [],
      });
    }

    onChange(newMatrix);
  };

  const addCustomPermission = (menuId: number, permissionName: string) => {
    if (readOnly || !permissionName.trim()) return;

    const newMatrix = [...value];
    const existingIndex = newMatrix.findIndex(item => item.menu_id === menuId);

    if (existingIndex >= 0) {
      const existing = newMatrix[existingIndex];
      if (!existing.custom_permissions) {
        existing.custom_permissions = [];
      }
      if (!existing.custom_permissions.includes(permissionName.trim())) {
        existing.custom_permissions = [...existing.custom_permissions, permissionName.trim()];
      }
    } else {
      newMatrix.push({
        menu_id: menuId,
        permissions: [],
        custom_permissions: [permissionName.trim()],
      });
    }

    onChange(newMatrix);
    setCustomPermInput({ ...customPermInput, [menuId]: '' });
  };

  const removeCustomPermission = (menuId: number, permissionName: string) => {
    if (readOnly) return;

    const newMatrix = [...value];
    const existingIndex = newMatrix.findIndex(item => item.menu_id === menuId);

    if (existingIndex >= 0) {
      const existing = newMatrix[existingIndex];
      existing.custom_permissions = (existing.custom_permissions || []).filter(p => p !== permissionName);

      // Remove menu from matrix if no permissions left
      if (existing.permissions.length === 0 && existing.custom_permissions.length === 0) {
        newMatrix.splice(existingIndex, 1);
      }
    }

    onChange(newMatrix);
  };

  const handleCustomPermInputKeyDown = (menuId: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const value = customPermInput[menuId] || '';
      addCustomPermission(menuId, value);
    }
  };

  // Check if menu has URL (not a parent/grouping menu)
  const hasUrl = (menu: MenuItem): boolean => {
    return menu.route !== null && menu.route !== '' && menu.route !== '#';
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex items-center gap-2">
        <Input
          placeholder="Cari menu..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">MODULE</TableHead>
              <TableHead className="text-center w-[80px]">VIEW</TableHead>
              <TableHead className="text-center w-[80px]">CREATE</TableHead>
              <TableHead className="text-center w-[80px]">EDIT</TableHead>
              <TableHead className="text-center w-[80px]">DELETE</TableHead>
              <TableHead className="text-center w-[80px]">APPROVE</TableHead>
              <TableHead className="min-w-[200px]">LAINNYA</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMenus.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  Tidak ada menu ditemukan
                </TableCell>
              </TableRow>
            ) : (
              filteredMenus.map((menu) => (
                <TableRow key={menu.uniqueKey}>
                  {/* Menu Title with indentation */}
                  <TableCell style={{ paddingLeft: `${menu.depth * 24 + 16}px` }}>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{menu.id_title}</span>
                      {!hasUrl(menu) && (
                        <Badge variant="outline" className="text-xs">
                          Group
                        </Badge>
                      )}
                    </div>
                  </TableCell>

                  {/* Standard Permissions - Only show if menu has URL */}
                  {STANDARD_PERMISSIONS.map((permission) => (
                    <TableCell key={permission} className="text-center">
                      {hasUrl(menu) ? (
                        <div className="flex justify-center">
                          <Checkbox
                            checked={hasPermission(menu.id, permission)}
                            onCheckedChange={(checked) =>
                              togglePermission(menu.id, permission, checked as boolean)
                            }
                            disabled={readOnly}
                          />
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">-</span>
                      )}
                    </TableCell>
                  ))}

                  {/* Custom Permissions - Only show if menu has URL */}
                  <TableCell>
                    {hasUrl(menu) ? (
                      <div className="flex flex-wrap gap-1 items-center">
                        {/* Display custom permissions as badges */}
                        {getCustomPermissions(menu.id).map((perm) => (
                          <Badge key={perm} variant="secondary" className="gap-1">
                            {perm}
                            {!readOnly && (
                              <button
                                onClick={() => removeCustomPermission(menu.id, perm)}
                                className="ml-1 hover:text-destructive"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            )}
                          </Badge>
                        ))}

                        {/* Input for adding custom permission */}
                        {!readOnly && (
                          <Input
                            placeholder="Tambah..."
                            value={customPermInput[menu.id] || ''}
                            onChange={(e) =>
                              setCustomPermInput({ ...customPermInput, [menu.id]: e.target.value })
                            }
                            onKeyDown={(e) => handleCustomPermInputKeyDown(menu.id, e)}
                            onBlur={() => {
                              const value = customPermInput[menu.id] || '';
                              if (value.trim()) {
                                addCustomPermission(menu.id, value);
                              }
                            }}
                            className="h-7 w-32 text-sm"
                          />
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-xs">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Summary */}
      <div className="text-sm text-muted-foreground">
        Total menu: {filteredMenus.length} | Menu dengan permission: {value.length}
      </div>
    </div>
  );
};
