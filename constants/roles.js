/**
 * Role Constants
 * 
 * Defines all user roles in the application.
 * Dashboard access is strictly limited to ADMIN role only.
 */

export const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
};

/**
 * Roles allowed to access dashboard
 * CRITICAL: Only admin can access dashboard
 */
export const DASHBOARD_ALLOWED_ROLES = [ROLES.ADMIN];

/**
 * Check if a user role can access dashboard
 * @param {string} userRole - The user's role
 * @returns {boolean} - True if user can access dashboard
 */
export const canAccessDashboard = (userRole) => {
  if (!userRole) return false;
  return DASHBOARD_ALLOWED_ROLES.includes(userRole);
};

/**
 * Check if user has admin role
 * @param {string} userRole - The user's role
 * @returns {boolean} - True if user is admin
 */
export const isAdmin = (userRole) => {
  return userRole === ROLES.ADMIN;
};

export default ROLES;
