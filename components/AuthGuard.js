import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import SplashPage from './SplashPage';
import Spinner from './Spinner';

/**
 * AuthGuard - Centralized authentication wrapper
 * 
 * Features:
 * - Detects session expiry and redirects with ?expired=true
 * - Shows loading state while checking session
 * - Renders children when authenticated
 * - Supports role-based access control
 * 
 * Usage:
 * <AuthGuard allowedRoles={['admin', 'editor']}>
 *   <YourPageContent />
 * </AuthGuard>
 */
const AuthGuard = ({ 
  children, 
  allowedRoles = [],
  fallback: CustomFallback = null
}) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Show loading spinner while checking session
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  // Handle unauthenticated state
  if (status === 'unauthenticated' || !session) {
    // Check if user was trying to access a protected page (not home page)
    // This indicates likely session expiry
    const currentPath = router.asPath;
    const isHomePage = currentPath === '/' || currentPath === '/?expired=true';
    
    // If they're on a protected route (not home), redirect with expired flag
    if (!isHomePage && typeof window !== 'undefined') {
      // Use router.replace to avoid adding to history stack
      router.replace('/?expired=true');
      return (
        <div className="min-h-screen bg-white flex items-center justify-center">
          <Spinner />
        </div>
      );
    }
    
    // Show splash page (with expired param if present in URL)
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
      return <SplashPage />;
    }
  }

  // User is authenticated (and has required role if specified)
  return children;
};

export default AuthGuard;
