// pages/home.js
import { signIn, signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect,useState } from 'react';
import { useRequireAuth } from '../utils/authUtils'; // Import fungsi utilitas

import Header from '../components/Header';
import SideMenu from '../components/Sidebar'
const Home = () => {
  const { useAuthRedirect } = useRequireAuth(['admin', 'user', 'editor', 'superadmin']);
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
        <section className='mt-14 py-5 px-8 sm:ml-64'>
          <h1>Home</h1>
          <button onClick={() => signOut()}>Sign out</button>
        </section>
      </div>
      
      
    </main>
    </>
  );
}

export default Home;