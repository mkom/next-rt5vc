import Head from 'next/head';
import _ from 'lodash';
import axios from 'axios';
import Header from '@/components/Header';
import SideMenu from '@/components/Sidebar';
import { useEffect,useState, useCallback } from 'react';
import { FaWpforms } from "react-icons/fa";
import { FaRegNewspaper  } from "react-icons/fa";
import { FaTasks } from "react-icons/fa";
import Link from 'next/link';

import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment';
import 'moment/locale/id';
import 'moment-timezone';
moment.locale('id');
// moment.tz.setDefault('Asia/Jakarta');
import MonthOptions from '@/components/MonthOptions';
import { formatPeriod } from '@/components/FormatPeriod';

export default function SetorRw() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };
    // const [loading, setLoading] = useState(true);
    // const [selectedPeriod, setSelectedPeriod] = useState(moment().format('YYYY-MM'));

    // const fetchReport = useCallback( async () => {
    //   try {
    //       const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/report/setoranrw`, {
    //           params: {
    //             month: "2024-08"
    //         }
    //       });
    //       //console.log(res.data)
    //       const dataRes = res.data;
    //       console.log(dataRes)
          
    //       setLoading(false);
    //   } catch (error) {
    //       console.error('Error fetching Transaction data:', error);
    //       setLoading(false);
    //   }
    // },[selectedPeriod]);
  
    // useEffect(() => {
    //   fetchReport();
    // }, [selectedPeriod,fetchReport]);

   
    return (
        <>
        {/* <Head>
            <title>RT5VC - Laporan Keuangan Rt 05 Villa Citayam</title>
            <meta name="description" content="Laporan Keuangan RT05/RW11 Villa Citayam Susukan Bojong gede Bogor" />
            <meta property="og:title" content="RT5VC" />
            <meta property="og:description" content="Laporan Keuangan RT05/RW11 Villa Citayam Susukan Bogor" />
            <meta property="og:image" content="" />
            <meta property="og:url" content="" />
        </Head> */}
    
        <Header toggleSidebar={toggleSidebar}/>
        <SideMenu isOpen={isSidebarOpen}/>
        <main className='max-w-screen-md mx-auto min-h-dvh'>
          <div className='w-full'>
            <section className='mt-14 px-3 py-5'>
              <div className='flex items-start md:items-center flex-col md:flex-row content-start md:content-center mb-4 justify-between gap-2'>
                <h1 className='text-xl font-bold text-gray-900 sm:text-2xl dark:text-white order-last md:order-first'>Laporan Setor RW Semester 2 2025, RT 005 Villa Citayam</h1>
              </div>
             
              {/* <Report/> */}
    
             
            </section>
          </div>
          
          
        </main>
        </>
      );

}