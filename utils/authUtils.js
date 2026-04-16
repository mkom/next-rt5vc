import { useAuth, useRequireRole, useSessionExpiry } from '../hooks/useAuth';

/**
 * @deprecated Gunakan useAuth dari 'hooks/useAuth' secara langsung
 * Auth utility hooks - maintained for backward compatibility
 * 
 * Migration guide:
 * - useRequireAuth().useAuthRedirect() -> useAuth() (AuthGuard handles redirect automatically)
 * - useRequireAuth().useAuthRedirectDashboard() -> useAuth() (AuthGuard handles redirect automatically)
 */
export const useRequireAuth = (allowedRoles = ['admin', 'user', 'editor', 'superadmin']) => {
  console.warn('useRequireAuth is deprecated. Use useAuth hook directly or AuthGuard component.');
  
  const { session, status, hasRole } = useAuth();

  // Legacy hook no-ops since AuthGuard now handles all redirects
  const useAuthRedirect = () => {
    // No-op - AuthGuard handles this automatically
  };

  const useAuthRedirectDashboard = () => {
    // No-op - AuthGuard handles this automatically
  };

  return { 
    useAuthRedirect, 
    useAuthRedirectDashboard,
    // Expose new auth data for migration
    session,
    status,
    hasRole,
  };
};

// Re-export new hooks for convenience
export { useAuth, useRequireRole, useSessionExpiry };

export default useAuth;