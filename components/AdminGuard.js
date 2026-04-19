import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { canAccessDashboard } from '../constants/roles';
import Spinner from './Spinner';

/**
 * AdminGuard - Melindungi semua halaman dashboard
 * 
 * CRITICAL: Hanya role "admin" yang boleh mengakses dashboard.
 * User dengan role lain akan di-redirect ke halaman utama dengan pesan error.
 * 
 * Usage:
 * <AdminGuard>
 *   <DashboardContent />
 * </AdminGuard>
 */
const AdminGuard = ({ children }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const userRole = session?.user?.role;

  useEffect(() => {
    // Tunggu sampai session selesai loading
    if (status === 'loading') return;

    // Jika unauthenticated, biarkan AuthGuard yang handle
    if (status === 'unauthenticated') return;

    // Jika authenticated tapi bukan admin, redirect ke home dengan pesan error
    if (status === 'authenticated' && !canAccessDashboard(userRole)) {
      router.replace('/?access_denied=true');
    }
  }, [status, userRole, router]);

  // Loading state - tunggu session check
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  // Unauthenticated - AuthGuard akan handle redirect
  if (status === 'unauthenticated') {
    return null;
  }

  // Authenticated tapi bukan admin - show loading sementara redirect
  if (!canAccessDashboard(userRole)) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  // User adalah admin, render children
  return children;
};

export default AdminGuard;
