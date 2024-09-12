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
        <title>RT5VC - Laporan IPL outstanding Rt 05 Villa Citayam</title>
        <meta name="description" content="Laporan IPL outstanding RT05/RW11 Villa Citayam Susukan Bojong gede Bogor" />
        <meta property="og:title" content="RT5VC" />
        <meta property="og:description" content="Laporan IPL outstanding RT05/RW11 Villa Citayam Susukan Bogor" />
        <meta property="og:image" content="" />
        <meta property="og:url" content="" />
    </Head>

    <Header toggleSidebar={toggleSidebar}/>
    <main className='max-w-screen-xl mx-auto'>
      <div className='w-full'>
        <SideMenu isOpen={isSidebarOpen}/>
        <section className='mt-14 px-3 py-5 md:px-8 sm:ml-64 mb-11'>
          <Breadcrumb aria-label="Default breadcrumb" className='mb-3'>
            <Breadcrumb.Item href="/" icon={HiHome}>
              Home
            </Breadcrumb.Item>
            <Breadcrumb.Item>Outstanding</Breadcrumb.Item>
          </Breadcrumb>
          <h1 className='text-xl mb-4 font-bold text-gray-900 sm:text-2xl dark:text-white'>OUTSTANDING IPL</h1>
          <Outstanding/>
        </section>
      </div>
      
      
    </main>
    </>
  );
}

export default DataOutstanding;