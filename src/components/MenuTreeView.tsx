import React, { useState, useMemo } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { MinusSquare, PlusSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

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

interface MenuNodeProps {
  menuItem: MenuItem;
  isLast: boolean;
  isParentLast: boolean;
  selectedPermissions: string[];
  onSelectionChange: (newSelection: string[]) => void;
  getDescendantTitles: (menuItem: MenuItem) => string[];
  expandedNodes: Set<number>;
  toggleNode: (nodeId: number) => void;
}

const MenuNode: React.FC<MenuNodeProps> = ({
  menuItem,
  isLast,
  isParentLast,
  selectedPermissions,
  onSelectionChange,
  getDescendantTitles,
  expandedNodes,
  toggleNode,
}) => {
  const hasChildren = menuItem.child && menuItem.child.length > 0;
  const isExpanded = expandedNodes.has(menuItem.id);

  const getCheckedState = useMemo((): boolean | 'indeterminate' => {
    const descendantTitles = getDescendantTitles(menuItem);
    const isSelfSelected = selectedPermissions.includes(menuItem.title);

    if (!hasChildren) {
      return isSelfSelected;
    }

    if (isSelfSelected) {
      return true;
    }

    const selectedDescendantsCount = descendantTitles.filter(title =>
      selectedPermissions.includes(title)
    ).length;

    if (selectedDescendantsCount === 0) {
      return false;
    }

    if (selectedDescendantsCount > 0) {
      return 'indeterminate';
    }

    return false;
  }, [menuItem, selectedPermissions, getDescendantTitles, hasChildren]);

  const handleSelect = (isChecked: boolean) => {
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

  return (
    <div className="relative">
      <div className="flex items-center">
        {/* Tree lines */}
        <div
          className={cn(
            'absolute left-[9px] top-0 w-px bg-gray-300',
            isLast ? 'h-[18px]' : 'h-full',
            isParentLast && isLast && 'h-[18px]'
          )}
        ></div>
        <div className="absolute left-[10px] top-[18px] h-px w-4 bg-gray-300"></div>

        {/* Icon and Checkbox */}
        <div className="z-10 flex h-9 w-9 shrink-0 items-center justify-center bg-background">
          {hasChildren ? (
            <button type="button" onClick={() => toggleNode(menuItem.id)}>
              {isExpanded ? (
                <MinusSquare className="h-5 w-5 text-gray-600" />
              ) : (
                <PlusSquare className="h-5 w-5 text-gray-600" />
              )}
            </button>
          ) : (
            <div className="h-5 w-5 flex items-center justify-center">
              <div className="h-1.5 w-1.5 rounded-full bg-gray-400"></div>
            </div>
          )}
        </div>
        <Checkbox
          id={`menu-${menuItem.id}`}
          checked={getCheckedState}
          onCheckedChange={checked => handleSelect(!!checked)}
          className="mr-2"
        />
        <label
          htmlFor={`menu-${menuItem.id}`}
          className="flex-grow cursor-pointer select-none text-sm font-medium"
        >
          {menuItem.title}
        </label>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className={cn('pl-5', !isLast && 'border-l border-gray-300 ml-[9px]')}>
          {menuItem.child.map((child, index) => (
            <MenuNode
              key={child.id}
              menuItem={child}
              isLast={index === menuItem.child.length - 1}
              isParentLast={isLast}
              selectedPermissions={selectedPermissions}
              onSelectionChange={onSelectionChange}
              getDescendantTitles={getDescendantTitles}
              expandedNodes={expandedNodes}
              toggleNode={toggleNode}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const MenuTreeView: React.FC<MenuTreeViewProps> = ({ menus, selectedPermissions, onSelectionChange }) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());

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

  const toggleNode = (nodeId: number) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  return (
    <div className="border rounded-md p-4 h-96 overflow-y-auto">
      {menus.map((menu, index) => (
        <MenuNode
          key={menu.id}
          menuItem={menu}
          isLast={index === menus.length - 1}
          isParentLast={true} // Top-level items don't have a parent line
          selectedPermissions={selectedPermissions}
          onSelectionChange={onSelectionChange}
          getDescendantTitles={getDescendantTitles}
          expandedNodes={expandedNodes}
          toggleNode={toggleNode}
        />
      ))}
    </div>
  );
};

export default MenuTreeView;