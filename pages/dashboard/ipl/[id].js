
import { getSession, useSession } from 'next-auth/react';
import { useEffect,useState,useCallback } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { useRequireAuth } from '../../../utils/authUtils.js'; 
import ReactPaginate from 'react-paginate';
import { IoPrism } from "react-icons/io5";
import {TextInput,Drawer,Dropdown } from "flowbite-react";
import { Card, Button, Table,Alert } from 'flowbite-react';
import Header from '../../../components/Header';
import SideMenu from '../../../components/dashboard/Sidebar'
import Spinner from '../../../components/Spinner';
import { HiOutlineSearch } from "react-icons/hi";
import {FaCalendarCheck } from 'react-icons/fa';
import { IoCloseCircle } from "react-icons/io5";
import { IoCheckmarkDoneCircleSharp } from "react-icons/io5";
import { IoBookmark } from "react-icons/io5";
import Select from 'react-select';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment';
import 'moment/locale/id';
moment.locale('id');
import MonthOptions from '../../../components/MonthOptions.js';
import CustomThemeProviderSecond from '../../../components/CustomThemeSecond';
import Link from 'next/link';

const IplDetail = () => {
  const router = useRouter();
  const { id } = router.query;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { useAuthRedirect } = useRequireAuth(['admin', 'editor', 'superadmin']);
  useAuthRedirect();

  const { data: session, status } = useSession();
  const [houses, setHouses] = useState([]);
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const goBack = () => {
    router.back(); // Navigasi ke halaman sebelumnya
  };


  const fetchHouses = useCallback (async () => {
    if (session) {
        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL_V2}/ipl/${id.toUpperCase()}`, {
                headers: {
                  Authorization: `Bearer ${session.accessToken}`,
                },
            });
            
           console.log(res.data)
            // setHouses(res.data.data);
            setLoading(false);
        } catch (error) {
    
          console.error('Error fetching houses data:', error);
          setLoading(false);
        }
    }
   
  },[session, id])


  useEffect(() => {
    if (session) {
        fetchHouses();
    }
  }, [session,fetchHouses]);


  return (
    <>
     <Header toggleSidebar={toggleSidebar}/>
     <SideMenu isOpen={isSidebarOpen}/>
      <main className='max-w-screen-md mx-auto'>
        <div className='w-full'>
          <section className='mt-14 px-3 py-5  mb-11'>
                <h1 className='text-xl mb-4 flex font-semibold text-gray-900 sm:text-2xl dark:text-white'>
                <FaCalendarCheck  className="mr-2 h-7 w-7" /> 
                <span>Data IPL {id && id.toUpperCase()}</span>
                </h1>
                <button onClick={goBack}>Go Back</button>

                {/* <div className="overflow-x-auto mt-5">
                <Table striped className='' >
                    <Table.Head className='' >
                        <Table.HeadCell className='py-2 px-2 md:text-base md:py-3 md:px-3 bg-cyan-600 text-white '>Periode</Table.HeadCell>
                        <Table.HeadCell className='py-2 px-2 md:text-base md:py-3 md:px-3 bg-cyan-600 text-white'>Status</Table.HeadCell>
                        <Table.HeadCell className='py-2 px-2 md:text-base md:py-3 md:px-3 bg-cyan-600 text-white'>Tanggal</Table.HeadCell>
                        <Table.HeadCell className='py-2 px-2 md:text-base md:py-3 md:px-3 bg-cyan-600 text-white '>Lampiran</Table.HeadCell>
                    </Table.Head>
                    <Table.Body className="divide-y border-b">
                    <Table.Row>
                        <Table.Cell colSpan="5" className="text-center w-full py-3 mt-2 animate-pulse bg-gray-200"></Table.Cell>
                    </Table.Row>
                    </Table.Body>
                </Table>
                </div> */}
            </section>
        </div>
     </main>
    </>
  );
};

export default IplDetail;
