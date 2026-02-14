import React from 'react';
import { usePermission } from '@/hooks/usePermission';

interface PermissionGateProps {
  children: React.ReactNode;
  action: string;
  menuId: number;
  fallback?: React.ReactNode;
}

/**
 * A wrapper component that only renders its children if the user has the required permission.
 * 
 * Example:
 * <PermissionGate action="create" menuId={1}>
 *   <Button>Add User</Button>
 * </PermissionGate>
 */
const PermissionGate: React.FC<PermissionGateProps> = ({ 
  children, 
  action, 
  menuId, 
  fallback = null 
}) => {
  const { can } = usePermission();

  if (can(action, menuId)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};

export default PermissionGate;
