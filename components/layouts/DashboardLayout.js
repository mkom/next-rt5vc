import Head from 'next/head';
import { useRouter } from 'next/router';
import Header from '../Header';
import BottomNav from '../BottomNav';

const DashboardLayout = ({ title, children }) => {
  const router = useRouter();

  // Show back button if not on a top-level dashboard page
  const topLevelPaths = ['/dashboard', '/dashboard/transactions', '/dashboard/ipl', '/dashboard/bills', '/dashboard/houses'];
  const showBack = !topLevelPaths.includes(router.pathname);

  return (
    <div className="min-h-screen bg-base-200 flex flex-col">
      <Head>
        <title>{title ? `${title} - RT5VC` : 'RT5VC Dashboard'}</title>
      </Head>
      
      <Header title={title} showBack={showBack} />
      
      <main className="flex-grow pt-14 pb-20 lg:pb-8">
        <div className="px-4 py-6 lg:max-w-7xl lg:mx-auto lg:px-8">
          {children}
        </div>
      </main>
      
      <BottomNav variant="dashboard" />
    </div>
  );
};

export default DashboardLayout;