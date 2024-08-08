// pages/home.js
import {useState } from 'react';

import Header from '../../components/Header.js';
import SideMenu from '../../components/dashboard/Sidebar.js'
import Outstanding from '../../components/IplOutstanding.js';

const DataOutstanding = () => {
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
          <h1 className='text-xl mb-4 font-bold text-gray-900 sm:text-2xl dark:text-white'>OUTSTANDING IPL</h1>
          <Outstanding/>
        </section>
      </div>
      
      
    </main>
    </>
  );
}

export default DataOutstanding;