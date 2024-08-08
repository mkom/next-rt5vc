import { useRouter } from 'next/router';
import { useEffect,useState } from 'react';
import Header from '../components/Header';
import SideMenu from '../components/Sidebar'
import AllCashflow from '@/components/Cashflow';

const Transactions = () => {
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