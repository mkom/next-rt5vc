import { Inter } from "next/font/google";
import {useState } from 'react';
import Header from '../components/Header';
import SideMenu from '../components/Sidebar';
import Report from '../components/Report';

export default function Home() {
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
        <section className='mt-14 px-3 py-5 md:px-8 sm:ml-64'>
          <h1 className='text-xl mb-4 font-bold text-gray-900 sm:text-2xl dark:text-white'>KAS RT 05 VILLA CITAYAM</h1>
          <Report/>
        </section>
      </div>
      
      
    </main>
    </>
  );
}
