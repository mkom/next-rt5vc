import { useSession, signIn, signOut } from 'next-auth/react';
import { useCallback, useEffect, useState } from 'react';

/**
 * Enhanced authentication hook
 * 
 * Provides centralized session management with helper methods
 * 
 * @returns {Object} Authentication state and methods
 */
export const useAuth = () => {
  const { data: session, status, update } = useSession();

  const isAuthenticated = status === 'authenticated' && !!session;
  const isLoading = status === 'loading';
  const isUnauthenticated = status === 'unauthenticated';

  const user = session?.user || null;
  const userRole = user?.role || null;

  /**
   * Check if current user has specific role
   * @param {string|string[]} role - Role(s) to check
   * @returns {boolean}
   */
  const hasRole = useCallback((role) => {
    if (!userRole) return false;
    if (Array.isArray(role)) {
      return role.includes(userRole);
    }
    return userRole === role;
  }, [userRole]);

  /**
   * Login with Google
   * @param {string} callbackUrl - URL to redirect after login
   */
  const login = useCallback((callbackUrl = '/') => {
    signIn('google', { callbackUrl });
  }, []);

  /**
   * Logout current user
   * @param {string} callbackUrl - URL to redirect after logout
   */
  const logout = useCallback((callbackUrl = '/') => {
    signOut({ callbackUrl });
  }, []);

  return {
    // Session data
    session,
    status,
    user,
    userRole,
    
    // State booleans
    isAuthenticated,
    isLoading,
    isUnauthenticated,
    
    // Methods
    hasRole,
    login,
    logout,
    updateSession: update,
  };
};

/**
 * Hook to check if user has required role
 * Useful for conditional rendering based on role
 * 
 * @param {string|string[]} allowedRoles - Required role(s)
 * @returns {Object} Role check result
 */
export const useRequireRole = (allowedRoles = []) => {
  const { userRole, isLoading, isAuthenticated } = useAuth();
  
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  
  const hasAccess = isAuthenticated && roles.length > 0 
    ? roles.includes(userRole)
    : isAuthenticated;

  return {
    hasAccess,
    isLoading,
    isAuthenticated,
    userRole,
  };
};

/**
 * Hook to track session expiration
 * Shows warning before session expires
 * 
 * @param {Object} options - Configuration options
 * @param {number} options.warningThreshold - Minutes before expiry to show warning (default: 5)
 * @returns {Object} Expiration state
 */
export const useSessionExpiry = (options = {}) => {
  const { warningThreshold = 5 } = options;
  const { session, status } = useAuth();
  
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    if (status !== 'authenticated' || !session?.expires) {
      setTimeRemaining(null);
      setShowWarning(false);
      return;
    }

    const expiryTime = new Date(session.expires).getTime();
    const warningMs = warningThreshold * 60 * 1000;

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = expiryTime - now;
      
      setTimeRemaining(Math.max(0, remaining));
      setShowWarning(remaining > 0 && remaining <= warningMs);

      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [session, status, warningThreshold]);

  const formatTimeRemaining = useCallback(() => {
    if (timeRemaining === null) return '';
    const minutes = Math.floor(timeRemaining / 60000);
    const seconds = Math.floor((timeRemaining % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, [timeRemaining]);

  return {
    timeRemaining,
    showWarning,
    formattedTime: formatTimeRemaining(),
    isExpired: timeRemaining === 0,
  };
};

export default useAuth;