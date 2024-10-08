// pages/home.js
import { signIn, signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect,useState } from 'react';
import { useRequireAuth } from '../../utils/authUtils.js'; 

import Header from '../../components/Header';
import SideMenu from '../../components/dashboard/Sidebar'
import Spinner from '../../components/Spinner';

import Report from '../../components/Report';


const Dashboard = () => {
  const { useAuthRedirect } = useRequireAuth(['admin', 'editor', 'superadmin']);
  useAuthRedirect();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);


  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
    
    <Header toggleSidebar={toggleSidebar}/>
    <main className='max-w-screen-xl mx-auto'>
      <div className='w-full'>
        <SideMenu isOpen={isSidebarOpen}/>
        <section className='mt-14 px-5 py-5 md:px-8 sm:ml-64'>
        <h1 className='text-xl mb-4 font-semibold text-gray-900 sm:text-2xl dark:text-white'>Dashboard</h1>
        <Report/>
        </section>
      </div>
      
      
    </main>
    </>
  );
}

export default Dashboard;