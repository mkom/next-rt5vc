import Head from 'next/head';
import Header from '../components/Header';
import SideMenu from '../components/Sidebar';
import Report from '../components/Report';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Button} from 'flowbite-react';
import Link from 'next/link';
import { GrFormNextLink } from "react-icons/gr";

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // useEffect(() => {
  //   router.push('/data-ipl');
  // }, []);

  return (
    <>
    <Head>
        <title>RT5VC - Laporan Keuangan Rt 05 Villa Citayam</title>
        <meta name="description" content="Platform pusat informasi kas RT05/RW11 Villa Citayam Susukan Bojong gede Bogor" />
        <meta property="og:title" content="RT5VC" />
        <meta property="og:description" content="Platform pusat informasi kas RT05/RW11 Villa Citayam Susukan Bogor" />
        <meta property="og:image" content="" />
        <meta property="og:url" content="" />
    </Head>

    <Header toggleSidebar={toggleSidebar}/>

    <main className='max-w-screen-xl mx-auto'>
      <div className='w-full'>
        <SideMenu isOpen={isSidebarOpen}/>
        <section className='mt-14 px-3 py-5 md:px-8 sm:ml-64'>
          <div className='flex items-start md:items-center flex-col md:flex-row content-start md:content-center mb-4 justify-between gap-2'>
          <h1 className='text-xl font-bold text-gray-900 sm:text-2xl dark:text-white'>KAS RT 05 VILLA CITAYAM</h1>
          <div className='flex flex-row md:flex-row justify-center gap-2'>
            <div className=' '>
              <a href="/data-ipl" className='flex items-center content-center bg-green-700 text-white font-medium text-xs rounded-xl px-2 py-1 '>
              <span className='text-center content-center'>Data IPL</span>
              <GrFormNextLink  className='w-5 h-5'/>
              </a>
            </div>
            <div className=''>
              <a href="/outstanding" className='flex items-center content-center bg-red-700 text-white font-medium text-xs rounded-xl px-2 py-1 '>
              <span className='text-center content-center'>Outstanding</span>
              <GrFormNextLink  className='w-5 h-5'/>
              </a>
            </div>
          </div>
          </div>
         
          <Report/>
        </section>
      </div>
      
      
    </main>
    </>
  );
}
