import { getSession, useSession } from 'next-auth/react';
import { useEffect,useState,useCallback } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { useRequireAuth } from '../../utils/authUtils.js'; 
import { IoPrism } from "react-icons/io5";
import {TextInput,Drawer,Dropdown } from "flowbite-react";
import { Card, Button, Table,Alert } from 'flowbite-react';
import Header from '../../components/Header';
import SideMenu from '../../components/dashboard/Sidebar'
import Spinner from '../../components/Spinner';
import {FaCalendarCheck } from 'react-icons/fa';
import { IoCloseCircle } from "react-icons/io5";
import { IoCheckmarkDoneCircleSharp } from "react-icons/io5";
import { IoBookmark } from "react-icons/io5";


import Select from 'react-select';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment';
import 'moment/locale/id';
moment.locale('id');
import YearOptions from '../../components/YearOptions.js';
import Link from 'next/link';
import { Breadcrumb } from "flowbite-react";
import { HiHome } from "react-icons/hi";
import Head from 'next/head';

const IplDetail = () => {
  const router = useRouter();
  const { id } = router.query;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState(moment().format('YYYY'));
  const [yearOptions, setYearOptions] = useState([]);
  const { data: session, status } = useSession();
  const [houses, setHouses] = useState([]);
  const [housesStatus, setHousesStatus] = useState([]);
  const [housesFee, setHousesFee] = useState([]);
  const [outstandingCount, setOutstandingCount] = useState(0);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const goBack = () => {
    router.back(); // Navigasi ke halaman sebelumnya
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
  
    // Extract day, month, and year
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const year = String(date.getFullYear()).slice(-2); // Get last two digits of the year
  
    // Format the date as DD/MM/YY
    return `${day}/${month}/${year}`;
  };


  const fetchHouses = useCallback (async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL_V2}/ipl/${id.toUpperCase()}`, {
          // headers: {
          //   Authorization: `Bearer ${session.accessToken}`,
          // },
      });
      
      //
      //console.log(res.data.data)
      // setHouses(res.data.data);
      setHousesStatus(res.data.data.monthly_status)
      setHousesFee(res.data.data.monthly_fees)
      setOutstandingCount(res.data.data.outstanding_count)
      setLoading(false);
  } catch (error) {

    console.error('Error fetching houses data:', error);
    setLoading(false);
  }
   
  },[session, id])


  useEffect(() => {
    if (session) {
        fetchHouses();
    }
  }, [session,fetchHouses]);

  // Daftar bulan
  const months = [
    { name: "Januari", number: "01" },
    { name: "Februari", number: "02" },
    { name: "Maret", number: "03" },
    { name: "April", number: "04" },
    { name: "Mei", number: "05" },
    { name: "Juni", number: "06" },
    { name: "Juli", number: "07" },
    { name: "Agustus", number: "08" },
    { name: "September", number: "09" },
    { name: "Oktober", number: "10" },
    { name: "November", number: "11" },
    { name: "Desember", number: "12" }
  ];

  const handleYearChange = (selectedOption) => {
    setSelectedPeriod(selectedOption.value);
  };

  function findFee(periodMonth) {
    return housesFee.find(item => item.month === periodMonth) || {};
  }

  function findFeeStatus(year, month) {
    const currentMonth = new Date().toISOString().slice(0, 7); // Format: YYYY-MM
    const periodMonth = `${year}-${month.number}`; // Gabungan tahun dan bulan

    const feeData = findFee(periodMonth); // Cari data untuk periode bulan tertentu

    // Jika tidak ditemukan data
    if (!feeData.month) {
        return { status: "-", transactionDate: "-", proofOfTransfer: "-" };
    }

    // Logika output berdasarkan kondisi
    if (periodMonth < "2024-07") {
        return { status: "-", transactionDate: "-", proofOfTransfer: "-" }; // Bulan lebih kecil dari 2024-07
    } else if (periodMonth > currentMonth && feeData.status === "Belum Bayar") {
        return { status: "-", transactionDate: "-", proofOfTransfer: "-" }; // Bulan lebih besar dari bulan sekarang dan status "Belum Bayar"
    } else {
        // Ambil status, tanggal transaksi, dan proof_of_transfer
        const status = feeData.status;
        const transactionDate = feeData.transaction_id ? feeData.transaction_id.date : "-";
        const proofOfTransfer = feeData.transaction_id ? feeData.transaction_id.proof_of_transfer : "-";
        const paymentType = feeData.transaction_id ? feeData.transaction_id.payment_type : "-";
        return { status, transactionDate, proofOfTransfer,paymentType }; // Kembalikan data jika memenuhi syarat
    }
  }

  function findStatus(selectedPeriod, month, dataStatus) {
    const currentMonth = new Date().toISOString().slice(0, 7); // Format: YYYY-MM
    const periodMonth = `${selectedPeriod}-${month.number}`;
  
    // Cari data di dalam array 'dataKosong' berdasarkan bulan
    const feeDataKosong = dataStatus.find(data => data.month === periodMonth);
  
    if (!feeDataKosong) {
      return {
        statusHouse: '-',
        // transactionDate: '-',
        // proofOfTransfer: '-'
      };
    }
  
    // Logika coret jika status "Kosong"
    if (feeDataKosong.status === "Kosong") {
      return {
        statusHouse: "Kosong",
        // transactionDate: "-",
        // proofOfTransfer: "-"
      };
    }
  
    // Jika tidak "Kosong", anggap sebagai "Isi"
    return {
      status: "Isi",
      // transactionDate: "-",
      // proofOfTransfer: "-"
    };
  }

  const getTypeIcon = (status) => {
    switch (status) {
      case 'Lunas':
        return <IoCheckmarkDoneCircleSharp  className="text-green-700 h-6 w-6 " />;
      case 'Belum Bayar':
        return <IoCloseCircle  className="text-red-700 h-6 w-6 " />;
      case 'Bayar Sebagian':
      return <IoPrism  className="text-orange-700 h-6 w-6 " />;  
      case 'TBD':
        return <IoBookmark  className="text-green-400  h-6 w-6 " />;
      default:
        return null;
    }
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <>
    <Head>
        <title>RT5VC - Laporan IPL {id && id.toUpperCase()} Rt 05 Villa Citayam</title>
        <meta name="description" content={`Laporan IPL ${id && id.toUpperCase()} RT05/RW 11 Villa Citayam Susukan Bojong gede Bogor`} />
        <meta property="og:title" content={`Laporan IPL ${id && id.toUpperCase()}`} />
        <meta property="og:description" content={`Laporan IPL ${id && id.toUpperCase()} RT05/RW 11 Villa Citayam Susukan Bojong gede Bogor`}/>
        <meta property="og:image" content="" />
        <meta property="og:url" content="" />
    </Head>
     <Header toggleSidebar={toggleSidebar}/>
     <SideMenu isOpen={isSidebarOpen}/>
     <main className='max-w-screen-md mx-auto'>
      <div className='w-full'>
        <section className='mt-14 px-3 py-5  mb-11'>
            <Breadcrumb aria-label="Default breadcrumb" className='mb-4'>
              <Breadcrumb.Item href="/" icon={HiHome}>
                Home
              </Breadcrumb.Item>
              <Breadcrumb.Item href="/ipl">
                IPL
              </Breadcrumb.Item>
              <Breadcrumb.Item>IPL {id && id.toUpperCase()}</Breadcrumb.Item>
            </Breadcrumb>
                <h1 className='text-xl mb-4 flex font-semibold text-gray-900 sm:text-2xl dark:text-white'>
                <FaCalendarCheck  className="mr-2 h-7 w-7" /> 
                <span>IPL {id && id.toUpperCase()}</span>
                </h1>
                {/* <button onClick={goBack}>Go Back</button> */}

                <div className='flex items-center content-center border w-10/12 md:w-1/2 p-2'>
                  <div className='w-1/3 md:w-1/3'>Status IPL</div>
                  <div className='w-10/12'>
                    <span className='pr-2'>:</span>
                    <span>
                      {outstandingCount == 0 ? (
                        <>Tertib</>
                      ) :(
                        <>{outstandingCount} Tagihan</>
                      )
                      }
                    </span>
                    </div>
                </div>

                <div className='flex items-center content-center border border-t-0 w-10/12 md:w-1/2 p-2'>
                  <div className='w-1/3 md:w-1/3'>Tahun</div>
                  <div className='w-10/12 flex'>
                    <span className='pr-2'>:</span>
                    <span>
                      {isClient && (
                        <Select
                          options={YearOptions()}
                          value={YearOptions().find(option => option.label === selectedPeriod)}
                          onChange={handleYearChange}
                          isSearchable={false}
                          placeholder="Pilih Tahun"
                          className='bg-gray-50 w-full'
                          styles={{
                            control: (baseStyles, state) => ({
                              ...baseStyles,
                              minHeight: '20px',
                            }),
                            dropdownIndicator: (styles) => ({ ...styles, padding: '4px' }),
                            //input: (styles) => ({ ...styles, padding: '5px' }),
                          }}
                        />
                      )}
                    </span>
                  
                  </div>
                </div>

                

                <div className="overflow-x-auto mt-4">
                <Table striped className='block w-full' >
                    <Table.Head className='' >
                        <Table.HeadCell className='py-2 px-2 md:text-base md:py-3 md:px-3 bg-cyan-600 text-white '>Periode</Table.HeadCell>
                        <Table.HeadCell className='py-2 px-2 md:text-base md:py-3 md:px-3 bg-cyan-600 text-white'>Status</Table.HeadCell>
                        <Table.HeadCell className='py-2 px-2 md:text-base md:py-3 md:px-3 bg-cyan-600 text-white'>Tanggal</Table.HeadCell>
                        <Table.HeadCell className='py-2 px-2 md:text-base md:py-3 md:px-3 bg-cyan-600 text-white '>Lampiran</Table.HeadCell>
                    </Table.Head>
                    <Table.Body className="divide-y border-b">
                    
                    {months.map((month, index) => {
                      const { status, transactionDate, proofOfTransfer,paymentType } = findFeeStatus(selectedPeriod, month);
                      const { statusHouse} = findStatus(selectedPeriod, month, housesStatus);
                      return (
                        <Table.Row key={index}>
                          <Table.Cell className='text-left py-2 px-2  md:text-base font-medium text-black'>
                          {statusHouse === "Kosong" ? <s>{month.name}</s> : month.name}
                            </Table.Cell>
                          <Table.Cell className='text-left py-2 px-2  md:text-base'>
                            <span className='flex justify-center items-center content-center h-full'>
                              { status !== '-' && statusHouse !== "Kosong"  ?  getTypeIcon(status) :'-'}
                            </span>
                          </Table.Cell>
                          <Table.Cell className='text-left py-2 px-2  md:text-base'>
                          {
                             transactionDate !== '-'
                                ? formatDate(transactionDate)
                                : '-'
                            }
                          </Table.Cell>
                          <Table.Cell className='text-left py-2 px-2  md:text-base'>
                            {proofOfTransfer && proofOfTransfer !== '-' ? (
                              <span className='flex items-center'>
                              <Button  as={Link} href={proofOfTransfer} target='_blank' color="gray" size="xs" className=' rounded-md focus:ring-0'>View</Button>
                              </span>
                            ):(
                              <>{paymentType == 'cash' ? 'Cash' :'-' }</>
                            )}
                            
                          </Table.Cell>
                        </Table.Row>
                      );
                    })}
                    </Table.Body>
                </Table>
            </div>
            </section>
        </div>
     </main>
    </>
  );
};

export default IplDetail;
