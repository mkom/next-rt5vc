// pages/home.js
import { signIn, signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect,useState } from 'react';
import { useRequireAuth } from '../utils/authUtils'; // Import fungsi utilitas

import Header from '../components/Header';
import SideMenu from '../components/Sidebar'
import IplReport from '../components/IplReport';

const Ipl = () => {
  const { useAuthRedirect } = useRequireAuth(['admin', 'user', 'editor', 'superadmin','visitor']);
  useAuthRedirect();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
          <h1 className='text-xl mb-4 font-bold text-gray-900 sm:text-2xl dark:text-white'>DATA IPL RT 05 VILLA CITAYAM</h1>
          <IplReport/>
        </section>
      </div>
      
      
    </main>
    </>
  );
}

export default Ipl;