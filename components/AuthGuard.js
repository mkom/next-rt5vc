import { useSession } from 'next-auth/react';
import SplashPage from './SplashPage';
import Spinner from './Spinner';

/**
 * AuthGuard - Centralized authentication wrapper
 * 
 * Usage:
 * <AuthGuard allowedRoles={['admin', 'editor']}>
 *   <YourPageContent />
 * </AuthGuard>
 * 
 * Props:
 * - children: Content to render when authenticated
 * - allowedRoles: Array of allowed roles (optional, default: all authenticated users)
 * - fallback: Custom fallback component when unauthenticated (optional, default: SplashPage)
 */
const AuthGuard = ({ 
  children, 
  allowedRoles = [],
  fallback: CustomFallback = null
}) => {
  const { data: session, status } = useSession();

  // Show loading spinner while checking session
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  // Show splash page when not authenticated
  if (status === 'unauthenticated' || !session) {
    if (CustomFallback) {
      return <CustomFallback />;
    }
    return <SplashPage />;
  }

  // Check role permissions if allowedRoles is specified
  if (allowedRoles.length > 0) {
    const userRole = session?.user?.role;
    if (!userRole || !allowedRoles.includes(userRole)) {
      // User doesn't have required role - show splash page
      // In the future, could show an "Access Denied" page instead
      return <SplashPage />;
    }
  }

  // User is authenticated (and has required role if specified)
  return children;
};

export default AuthGuard;