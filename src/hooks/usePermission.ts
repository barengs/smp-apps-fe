import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/store/slices/authSlice';
import { useGetUserMenusQuery } from '@/store/slices/menuApi';
import { useLocation } from 'react-router-dom';

interface UsePermissionResult {
  can: (action: string, menuId?: number) => boolean;
  canAccessRoute: (path: string) => boolean;
  hasRole: (roleName: string) => boolean;
  getMenuByRoute: (path: string) => any;
}

export const usePermission = (): UsePermissionResult => {
  const user = useSelector(selectCurrentUser);
  const location = useLocation();
  const { data: userMenus } = useGetUserMenusQuery();

  /**
   * Check if user has a specific permission for a menu.
   * @param action The action to check (create, view, edit, delete, approve)
   * @param menuId Optional menu ID. If not provided, it tries to infer from current route (not implemented yet for complexity reasons, best to pass menuId)
   */
  const can = (action: string, menuId?: number): boolean => {
    if (!user || !user.permissions) return false;

    // Normalize action
    const normalizedAction = action.toLowerCase();

    // If menuId is provided, check straight away
    if (menuId) {
      const permissionName = `${normalizedAction}_menu_${menuId}`;
      return user.permissions.includes(permissionName);
    }

    // TODO: Infer menuId from current route if not provided?
    // This requires mapping routes to menu IDs which we have in userMenus.
    // For now, return false if no menuId.
    return false;
  };

  /**
   * Check if user has access to a specific route.
   * @param path The path to check
   */
  const canAccessRoute = (path: string): boolean => {
    if (!userMenus) return false;
    
    // Recursive check
    const checkMenu = (menus: any[]): boolean => {
      return menus.some(menu => {
        if (menu.route === path) return true;
        if (menu.children && menu.children.length > 0) {
          return checkMenu(menu.children);
        }
        return false;
      });
    };

    return checkMenu(userMenus);
  };

  const hasRole = (roleName: string): boolean => {
    if (!user || !user.roles) return false;
    return user.roles.some(role => role.name === roleName);
  };

  /**
   * Find a menu item by its route.
   */
  const getMenuByRoute = (path: string) => {
    if (!userMenus) return undefined;
    
    // Normalize path (remove trailing slash)
    const normalizedPath = path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path;

    const findMenu = (menus: any[]): any => {
      for (const menu of menus) {
        // Check exact match
        const menuRoute = menu.route?.endsWith('/') && menu.route.length > 1 ? menu.route.slice(0, -1) : menu.route;
        
        if (menuRoute === normalizedPath) return menu;
        
        if (menu.children && menu.children.length > 0) {
          const found = findMenu(menu.children);
          if (found) return found;
        }
      }
      return undefined;
    };

    return findMenu(userMenus);
  };

  return { can, canAccessRoute, hasRole, getMenuByRoute };
};
