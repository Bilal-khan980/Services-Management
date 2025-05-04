/**
 * Utility functions for role-based access control in the frontend
 */

/**
 * Role hierarchy and permissions
 *
 * This defines what each role can access and the hierarchy of roles
 * Keep this in sync with the backend permissions.js file
 */
export const roleHierarchy = {
  user: {
    level: 1,
    description: 'Regular user with limited access',
    permissions: [
      'view_own_tickets',
      'create_tickets',
      'update_own_tickets',
      'view_own_changes',
      'create_changes',
      'update_own_changes',
      'view_knowledge',
      'comment_on_knowledge'
    ]
  },
  editor: {
    level: 2,
    description: 'Editor/Knowledge Manager',
    permissions: [
      'view_own_tickets',
      'create_tickets',
      'update_own_tickets',
      'view_own_changes',
      'create_changes',
      'update_own_changes',
      'view_knowledge',
      'create_knowledge',
      'update_knowledge',
      'view_solutions',
      'create_solutions',
      'update_solutions',
      'comment_on_knowledge',
      'assign_tickets'
    ]
  },
  admin: {
    level: 3,
    description: 'Administrator with access to all features except enterprise admin features',
    permissions: [
      'view_all_tickets',
      'create_tickets',
      'update_tickets',
      'delete_tickets',
      'view_all_changes',
      'create_changes',
      'update_changes',
      'delete_changes',
      'view_knowledge',
      // Removed: 'create_knowledge',
      // Removed: 'update_knowledge',
      // Removed: 'delete_knowledge',
      'view_solutions',
      // Removed: 'create_solutions',
      // Removed: 'update_solutions',
      // Removed: 'delete_solutions',
      'comment_on_knowledge',
      'assign_tickets',
      'manage_users',
      'manage_settings',
      'reset_user_passwords'
    ]
  },
  enterprise_admin: {
    level: 4,
    description: 'Enterprise Administrator with full access to all features',
    permissions: [
      'view_all_tickets',
      'create_tickets',
      'update_tickets',
      'delete_tickets',
      'view_all_changes',
      'create_changes',
      'update_changes',
      'delete_changes',
      'view_knowledge',
      'create_knowledge',
      'update_knowledge',
      'delete_knowledge',
      'view_solutions',
      'create_solutions',
      'update_solutions',
      'delete_solutions',
      'comment_on_knowledge',
      'assign_tickets',
      'manage_users',
      'manage_settings',
      'manage_admins',
      'reset_admin_passwords'
    ]
  }
};

/**
 * Check if a user has a specific permission
 * @param {Object} user - User object with role property
 * @param {String} permission - Permission to check
 * @returns {Boolean} - Whether the user has the permission
 */
export const hasPermission = (user, permission) => {
  if (!user || !user.role) {
    return false;
  }

  const userRole = roleHierarchy[user.role];
  if (!userRole) {
    return false;
  }

  return userRole.permissions.includes(permission);
};

/**
 * Check if a user has a specific role or higher
 * @param {Object} user - User object with role property
 * @param {String} role - Role to check
 * @returns {Boolean} - Whether the user has the role or higher
 */
export const hasRole = (user, role) => {
  if (!user || !user.role) {
    return false;
  }

  const userRoleLevel = roleHierarchy[user.role]?.level || 0;
  const requiredRoleLevel = roleHierarchy[role]?.level || 0;

  return userRoleLevel >= requiredRoleLevel;
};

/**
 * Get access denied message for a specific permission
 * @param {String} permission - Permission that was denied
 * @returns {String} - Access denied message
 */
export const getAccessDeniedMessage = (permission) => {
  const messages = {
    view_all_tickets: "You don't have permission to view all tickets",
    update_tickets: "You don't have permission to update this ticket",
    delete_tickets: "You don't have permission to delete tickets",
    view_all_changes: "You don't have permission to view all changes",
    update_changes: "You don't have permission to update this change",
    delete_changes: "You don't have permission to delete changes",
    create_knowledge: "You don't have permission to create knowledge articles",
    update_knowledge: "You don't have permission to update knowledge articles",
    delete_knowledge: "You don't have permission to delete knowledge articles",
    view_solutions: "You don't have permission to view solutions",
    create_solutions: "You don't have permission to create solutions",
    update_solutions: "You don't have permission to update solutions",
    delete_solutions: "You don't have permission to delete solutions",
    assign_tickets: "You don't have permission to assign tickets",
    manage_users: "You don't have permission to manage users",
    manage_settings: "You don't have permission to manage system settings",
    manage_admins: "You don't have permission to manage administrators",
    reset_admin_passwords: "You don't have permission to reset administrator passwords"
  };

  return messages[permission] || "You don't have permission to perform this action";
};

/**
 * Get all permissions for a specific role
 * @param {String} role - Role to get permissions for
 * @returns {Array} - Array of permissions
 */
export const getRolePermissions = (role) => {
  return roleHierarchy[role]?.permissions || [];
};

/**
 * Get role description
 * @param {String} role - Role to get description for
 * @returns {String} - Role description
 */
export const getRoleDescription = (role) => {
  return roleHierarchy[role]?.description || 'Unknown role';
};
