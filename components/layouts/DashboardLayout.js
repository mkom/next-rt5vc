import Head from 'next/head';
import { useRouter } from 'next/router';
import Header from '../Header';
import BottomNav from '../BottomNav';
import Sidebar from '../dashboard/Sidebar';
import AdminGuard from '../AdminGuard';

/**
 * DashboardLayout - Layout wrapper untuk semua halaman dashboard
 * 
 * Includes AdminGuard untuk memastikan hanya admin yang boleh akses.
 * Desktop: Menampilkan sidebar di sebelah kiri
 * Mobile: Menggunakan bottom navigation
 * 
 * CRITICAL: Semua halaman dashboard menggunakan layout ini akan otomatis
 * dilindungi oleh AdminGuard. User non-admin akan di-redirect ke home.
 */
const DashboardLayout = ({ title, children }) => {
  const router = useRouter();

  // Show back button if not on a top-level dashboard page
  const topLevelPaths = ['/dashboard', '/dashboard/transactions', '/dashboard/ipl', '/dashboard/bills', '/dashboard/houses'];
  const showBack = !topLevelPaths.includes(router.pathname);

  return (
    <AdminGuard>
      <div className="min-h-screen bg-base-200 flex flex-col lg:flex-row">
        <Head>
          <title>{title ? `${title} - RT5VC Admin` : 'RT5VC Admin'}</title>
        </Head>
        
        {/* Sidebar - Desktop only */}
        <Sidebar />
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-screen lg:ml-72">
          <Header title={title} showBack={showBack} hasSidebar={true} />
          
          <main className="flex-grow pt-14 pb-20 lg:pb-8">
            <div className="px-4 py-6 lg:max-w-7xl lg:mx-auto lg:px-8">
              {children}
            </div>
          </main>
          
          {/* BottomNav - Mobile only (hidden on lg+) */}
          <BottomNav variant="dashboard" />
        </div>
      </div>
    </AdminGuard>
  );
};

export default DashboardLayout;
