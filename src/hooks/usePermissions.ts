import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/store/slices/authSlice';
import { useGetUserMenusQuery, MenuItem } from '@/store/slices/menuApi';

interface Permissions {
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canApprove: boolean;
  hasCustomPermission: (permission: string) => boolean;
  isLoading: boolean;
}

export const usePermissions = (): Permissions => {
  const location = useLocation();
  const currentUser = useSelector(selectCurrentUser);
  const { data: userMenus, isLoading } = useGetUserMenusQuery();

  const userPermissions = currentUser?.permissions || [];

  // Flatten menus to easily search by route
  const flattenMenus = (menus: MenuItem[]): MenuItem[] => {
    const result: MenuItem[] = [];
    menus.forEach(menu => {
      result.push(menu);
      if (menu.children && menu.children.length > 0) {
        result.push(...flattenMenus(menu.children));
      }
    });
    return result;
  };

  const flatMenus = userMenus ? flattenMenus(userMenus) : [];
  
  // Find current menu by matching the route
  // Handle edge cases like trailing slashes or sub-routes
  const currentMenu = flatMenus.find(menu => {
    if (!menu.route) return false;
    const cleanRoute = menu.route.replace(/\/+$/, '');
    const cleanPath = location.pathname.replace(/\/+$/, '');
    return cleanPath === cleanRoute || cleanPath.startsWith(`${cleanRoute}/`);
  });

  const menuId = currentMenu?.id;

  const hasStandardPerm = (action: string) => {
    if (!menuId) return false;
    const standardName = `${action.toLowerCase()}_menu_${menuId}`;
    return userPermissions.includes(standardName);
  };

  return {
    canView: hasStandardPerm('VIEW'),
    canCreate: hasStandardPerm('CREATE'),
    canEdit: hasStandardPerm('EDIT'),
    canDelete: hasStandardPerm('DELETE'),
    canApprove: hasStandardPerm('APPROVE'),
    hasCustomPermission: (permission: string) => {
      if (!menuId) return false;
      return userPermissions.includes(`${permission.toLowerCase()}_menu_${menuId}`);
    },
    isLoading,
  };
};
