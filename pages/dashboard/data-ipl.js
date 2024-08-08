// pages/home.js
import {useState } from 'react';

import Header from '../../components/Header.js';
import SideMenu from '../../components/dashboard/Sidebar.js'
import IplReport from '../../components/IplReport.js';

const Ipl = () => {
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
          <h1 className='text-xl mb-4 font-bold text-gray-900 sm:text-2xl dark:text-white'>DATA IPL</h1>
          <IplReport/>
        </section>
      </div>
      
      
    </main>
    </>
  );
}

export default Ipl;