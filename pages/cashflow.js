import {useState } from 'react';
import Header from '../components/Header';
import SideMenu from '../components/Sidebar'
import AllCashflow from '@/components/Cashflow';
import Head from 'next/head';
const Transactions = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
    <Head>
        <title>RT5VC - Laporan Arus Kas Rt 05 Villa Citayam</title>
        <meta name="description" content="Laporan Arus Kas RT05/RW11 Villa Citayam Susukan Bojong gede Bogor" />
        <meta property="og:title" content="RT5VC" />
        <meta property="og:description" content="Laporan Arus Kas RT05/RW11 Villa Citayam Susukan Bogor" />
        <meta property="og:image" content="" />
        <meta property="og:url" content="" />
    </Head>

    <Header toggleSidebar={toggleSidebar}/>
    <main className='max-w-screen-xl mx-auto'>
      <div className='w-full'>
        <SideMenu isOpen={isSidebarOpen}/>
        <section className='mt-14 px-3 py-5 md:px-8 sm:ml-64 mb-11'>
          <h1 className='text-xl mb-4 font-bold text-gray-900 sm:text-2xl dark:text-white'>Laporan Arus Kas</h1>
          <AllCashflow/>
        </section>
      </div>
      
      
    </main>
    </>
  );
}

export default Transactions;