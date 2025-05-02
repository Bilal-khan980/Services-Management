import React from 'react';
import { Button, Tooltip } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { hasPermission, hasRole } from '../../utils/permissions';

/**
 * A button component that is only rendered if the user has the required permission or role
 * 
 * @param {Object} props
 * @param {String} props.permission - Permission required to see this button
 * @param {String} props.role - Role required to see this button (alternative to permission)
 * @param {String} props.tooltip - Tooltip text to show when hovering over the button
 * @param {Boolean} props.showTooltipOnDisabled - Whether to show the tooltip when the button is disabled
 * @param {React.ReactNode} props.children - Button content
 * @returns {React.ReactNode}
 */
const ActionButton = ({
  permission,
  role,
  tooltip,
  showTooltipOnDisabled = false,
  children,
  ...buttonProps
}) => {
  const { user } = useAuth();
  
  // Check if user has permission or role
  const hasAccess = permission 
    ? hasPermission(user, permission)
    : role 
      ? hasRole(user, role)
      : true;
  
  // If user doesn't have access, don't render the button at all
  if (!hasAccess) {
    return null;
  }
  
  // If there's a tooltip, wrap the button in a Tooltip component
  if (tooltip) {
    return (
      <Tooltip 
        title={tooltip}
        disableHoverListener={buttonProps.disabled && !showTooltipOnDisabled}
      >
        <span>
          <Button {...buttonProps}>
            {children}
          </Button>
        </span>
      </Tooltip>
    );
  }
  
  // Otherwise, just render the button
  return (
    <Button {...buttonProps}>
      {children}
    </Button>
  );
};

export default ActionButton;
