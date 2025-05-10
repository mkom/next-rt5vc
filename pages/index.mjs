import Head from 'next/head';
import Header from '../components/Header';
import SideMenu from '../components/Sidebar';
import { useState } from 'react';
import { FaWpforms } from "react-icons/fa";
import { FaRegNewspaper  } from "react-icons/fa";
import { FaTasks } from "react-icons/fa";
import Report from '../components/Report';
export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };


  return (
    <>
    <Head>
        <title>RT5VC - Laporan Keuangan Rt 05 Villa Citayam</title>
        <meta name="description" content="Laporan Keuangan RT05/RW11 Villa Citayam Susukan Bojong gede Bogor" />
        <meta property="og:title" content="RT5VC" />
        <meta property="og:description" content="Laporan Keuangan RT05/RW11 Villa Citayam Susukan Bogor" />
        <meta property="og:image" content="" />
        <meta property="og:url" content="" />
    </Head>

    <Header toggleSidebar={toggleSidebar}/>
    <SideMenu isOpen={isSidebarOpen}/>
    <main className='max-w-screen-lg mx-auto -m-h-screen'>
      <div className='w-full'>
        <section className='mt-14 px-3 py-5'>
          <div className='flex items-start md:items-center flex-col md:flex-row content-start md:content-center mb-4 justify-between gap-2'>
            <h1 className='text-xl font-bold text-gray-900 sm:text-2xl dark:text-white order-last md:order-first'>RT 005 RW 011 VILLA CITAYAM</h1>
          </div>
          <Report/>
          <div className='flex flex-row justify-between md:justify-start gap-2 mb-14'>
            <a href="/confirmation" className='flex items-center content-center bg-blue-700 text-white font-medium text-xs rounded-md shadow-sm px-4 py-2'>
              <FaWpforms className='w-6 h-6 mr-1' />
              <span className='text-center content-center'>Form Konfirmasi</span>
              {/* <GrFormNextLink  className='w-5 h-5'/> */}
            </a>
            <a href="/ipl" className='flex items-center content-center bg-green-700 text-white font-medium  text-xs rounded-md shadow-sm px-4 py-2 '>
              <FaTasks  className='w-4 h-4 mr-1' />  
              <span className='text-center content-center'>IPL</span>
              {/* <GrFormNextLink  className='w-5 h-5'/> */}
            </a>
            <a href="/outstanding" className='flex items-center content-center bg-red-700 text-white font-medium  text-xs rounded-md shadow-sm px-4 py-2 '>
              <FaRegNewspaper  className='w-6 h-6 mr-1' />
              <span className='text-center content-center'>Outstanding</span>
              {/* <GrFormNextLink  className='w-5 h-5'/> */}
            </a>
            
          </div>
        </section>
      </div>
      
      
    </main>
    </>
  );
}
