"use client";

import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import MultiSelect, { type Option } from '@/components/MultiSelect';
import type { MenuItem } from '@/store/slices/menuApi';

interface MenuPermissionTableProps {
  menus: MenuItem[];
  permissionOptions: Option[];
  value: Record<string, string[]>;
  onChange: (next: Record<string, string[]>) => void;
  isLoading?: boolean;
}

interface FlatMenuItem {
  id: number;
  title: string;
  depth: number;
}

const MenuPermissionTable: React.FC<MenuPermissionTableProps> = ({
  menus,
  permissionOptions,
  value,
  onChange,
  isLoading = false,
}) => {
  const { i18n } = useTranslation();
  const lang = i18n.language;

  const getTitle = (item: MenuItem): string => {
    if (lang === 'en' && item.en_title) return item.en_title;
    if (lang === 'ar' && item.ar_title) return item.ar_title;
    return item.id_title;
  };

  const flatMenus: FlatMenuItem[] = useMemo(() => {
    const result: FlatMenuItem[] = [];
    const traverse = (items: MenuItem[], depth = 0) => {
      items.forEach((item) => {
        result.push({ id: item.id, title: getTitle(item), depth });
        if (item.child && item.child.length > 0) {
          traverse(item.child, depth + 1);
        }
      });
    };
    traverse(menus, 0);
    return result;
  }, [menus, lang]);

  const toggleMenu = (menuId: number, checked: boolean) => {
    const idStr = String(menuId);
    const next = { ...value };
    if (checked) {
      if (!next[idStr]) next[idStr] = [];
    } else {
      delete next[idStr];
    }
    onChange(next);
  };

  const updateMenuPermissions = (menuId: number, permissions: string[]) => {
    const idStr = String(menuId);
    const next = { ...value, [idStr]: permissions };
    onChange(next);
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <div className="border rounded-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama Menu</TableHead>
            <TableHead>Permission</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {flatMenus.map((m) => {
            const selected = value.hasOwnProperty(String(m.id));
            const selectedPerms = value[String(m.id)] || [];
            return (
              <TableRow key={m.id}>
                <TableCell className="align-top">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={selected}
                      onCheckedChange={(c) => toggleMenu(m.id, !!c)}
                      className="mt-1"
                    />
                    <span className="text-sm" style={{ paddingLeft: m.depth * 16 }}>
                      {m.title}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <MultiSelect
                    options={permissionOptions}
                    selected={selectedPerms}
                    onChange={(vals) => updateMenuPermissions(m.id, vals)}
                    placeholder={selected ? "Pilih permission..." : "Pilih menu terlebih dahulu"}
                    disabled={!selected}
                    className="min-h-10"
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default MenuPermissionTable;