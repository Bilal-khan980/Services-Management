import React from 'react';
import { Alert, Box } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { hasPermission, hasRole, getAccessDeniedMessage } from '../../utils/permissions';

/**
 * Component that conditionally renders children based on user permissions
 * 
 * @param {Object} props
 * @param {String} props.permission - Permission required to view the content
 * @param {String} props.role - Role required to view the content (alternative to permission)
 * @param {Boolean} props.showMessage - Whether to show an access denied message
 * @param {String} props.customMessage - Custom access denied message
 * @param {React.ReactNode} props.children - Content to render if user has permission
 * @param {React.ReactNode} props.fallback - Content to render if user doesn't have permission
 * @returns {React.ReactNode}
 */
const PermissionGuard = ({
  permission,
  role,
  showMessage = true,
  customMessage,
  children,
  fallback
}) => {
  const { user } = useAuth();
  
  // Check if user has permission or role
  const hasAccess = permission 
    ? hasPermission(user, permission)
    : role 
      ? hasRole(user, role)
      : false;
  
  if (hasAccess) {
    return children;
  }
  
  // If no fallback is provided and showMessage is true, show access denied message
  if (!fallback && showMessage) {
    const message = customMessage || 
      (permission ? getAccessDeniedMessage(permission) : `You need ${role} role or higher to access this content`);
    
    return (
      <Box sx={{ my: 2 }}>
        <Alert severity="warning">{message}</Alert>
      </Box>
    );
  }
  
  // Return fallback or null
  return fallback || null;
};

export default PermissionGuard;
