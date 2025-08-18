import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';

// Asumsi struktur MenuItem dari menuApi.ts
interface MenuItem {
  id: number;
  title: string;
  child: MenuItem[];
}

interface MenuTreeViewProps {
  menus: MenuItem[];
  selectedPermissions: string[];
  onSelectionChange: (newSelection: string[]) => void;
}

const MenuTreeView: React.FC<MenuTreeViewProps> = ({ menus, selectedPermissions, onSelectionChange }) => {
  const getDescendantTitles = (menuItem: MenuItem): string[] => {
    let titles: string[] = [];
    if (menuItem.child && menuItem.child.length > 0) {
      menuItem.child.forEach(child => {
        titles.push(child.title);
        titles = titles.concat(getDescendantTitles(child));
      });
    }
    return titles;
  };

  const handleSelect = (menuItem: MenuItem, isChecked: boolean) => {
    const currentSelection = new Set(selectedPermissions);
    const itemTitle = menuItem.title;
    const descendantTitles = getDescendantTitles(menuItem);

    const allTitles = [itemTitle, ...descendantTitles];

    if (isChecked) {
      allTitles.forEach(title => currentSelection.add(title));
    } else {
      allTitles.forEach(title => currentSelection.delete(title));
    }

    onSelectionChange(Array.from(currentSelection));
  };

  const renderMenuNode = (menuItem: MenuItem, level = 0) => {
    const isChecked = selectedPermissions.includes(menuItem.title);

    return (
      <div key={menuItem.id} style={{ paddingLeft: `${level * 20}px` }}>
        <div className="flex items-center space-x-2 py-1">
          <Checkbox
            id={`menu-${menuItem.id}`}
            checked={isChecked}
            onCheckedChange={(checked) => handleSelect(menuItem, !!checked)}
          />
          <label
            htmlFor={`menu-${menuItem.id}`}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {menuItem.title}
          </label>
        </div>
        {menuItem.child && menuItem.child.length > 0 && (
          <div>
            {menuItem.child.map(child => renderMenuNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="border rounded-md p-4 h-96 overflow-y-auto">
      {menus.map(menu => renderMenuNode(menu))}
    </div>
  );
};

export default MenuTreeView;