import Head from 'next/head';
import {useState } from 'react';
import Header from '../components/Header.js';
import SideMenu from '../components/Sidebar.js'
import Outstanding from '../components/IplOutstanding.js';
import { Breadcrumb } from "flowbite-react";
import { HiHome } from "react-icons/hi";

const DataOutstanding = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
    <Head>
        <title>RT5VC - Outstanding IPL Rt 05 Villa Citayam</title>
        <meta name="description" content="Outstanding IPL RT05/RW11 Villa Citayam Susukan Bojong gede Bogor" />
        <meta property="og:title" content="RT5VC" />
        <meta property="og:description" content="Outstanding IPL RT05/RW11 Villa Citayam Susukan Bogor" />
        <meta property="og:image" content="" />
        <meta property="og:url" content="" />
    </Head>

    <Header toggleSidebar={toggleSidebar}/>
    <SideMenu isOpen={isSidebarOpen}/>
    <main className='max-w-screen-lg mx-auto min-h-dvh'>
      <div className='w-full'>
        <section className='mt-14 px-3 py-5  mb-11'>
          <Breadcrumb aria-label="Default breadcrumb" className='mb-3'>
            <Breadcrumb.Item href="/" icon={HiHome}>
              Home
            </Breadcrumb.Item>
            <Breadcrumb.Item>Outstanding</Breadcrumb.Item>
          </Breadcrumb>
         
          
          <Outstanding/>

          <p className='pt-4 pb-1 text-sm font-medium'>Catatan:</p>
          <p className='text-sm'>IPL RT 005 tercatat dan terhitung mulai dari Juli 2024.</p>
        </section>
      </div>
      
      
    </main>
    </>
  );
}

export default DataOutstanding;