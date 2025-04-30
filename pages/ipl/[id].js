import { getSession, useSession } from 'next-auth/react';
import { useEffect,useState,useCallback } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { useRequireAuth } from '../../utils/authUtils.js'; 
import { IoPrism } from "react-icons/io5";
import {TextInput,Drawer,Dropdown } from "flowbite-react";
import { Card, Button, Table, Alert, Modal } from 'flowbite-react';
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
import 'moment-timezone';
moment.locale('id');
import YearOptions from '../../components/YearOptions.js';
import Link from 'next/link';
import { Breadcrumb } from "flowbite-react";
import { HiHome } from "react-icons/hi";
import Head from 'next/head';
import Image from "next/image";

const IplDetail = () => {
  const router = useRouter();
  const { query } = useRouter();
  const id = query.id;
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
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [loadingImg, setLoadingImg] = useState(false);
 
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const goBack = () => {
    router.back(); // Navigasi ke halaman sebelumnya
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount);
  };
  

  const formatDate = (dateString) => {
  // Gunakan timezone Asia/Jakarta
      const date = moment.tz(dateString, 'Asia/Jakarta');
      return date.format('DD/MM/YY'); // Format sesuai kebutuhan
  };


  const fetchHouses = useCallback (async () => {
 
    // if (!id || typeof id !== 'string') {
    //   console.error('Invalid ID:', id);
    //   setLoading(false);
    //   return; // Hentikan eksekusi jika ID tidak valid
    // }

    const ID = id.toUpperCase();
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL_V2}/ipl/${ID}`, {
         
      });
      
    
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
    if(id) {
      fetchHouses();
    }
   
  }, [id]);

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
        return { status: "-", transactionDate: "-", proofOfTransfer: "-", _id:"" }; // Bulan lebih kecil dari 2024-07
    } else if (periodMonth > currentMonth && feeData.status === "Belum Bayar") {
        return { status: "-", transactionDate: "-", proofOfTransfer: "-", _id:"" }; // Bulan lebih besar dari bulan sekarang dan status "Belum Bayar"
    } else {
        // Ambil status, tanggal transaksi, dan proof_of_transfer
        const status = feeData.status;
        const period =  moment(feeData.month, "YYYY-MM").format("MMMM YYYY");
        const transactionDate = feeData.transaction_id ? feeData.transaction_id.date : "-";
        const proofOfTransfer = feeData.transaction_id ? feeData.transaction_id.proof_of_transfer : "-";
        const paymentType = feeData.transaction_id ? feeData.transaction_id.payment_type : "-";
        return { status, transactionDate, proofOfTransfer,paymentType,period }; // Kembalikan data jika memenuhi syarat
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

  const openModal = (selectedPeriod,month) => {
    const feeStatus = findFeeStatus(selectedPeriod, month);
    //console.log(feeStatus); // Cetak hasil
    setSelectedDetail(feeStatus)
    setModalIsOpen(true);
    setLoadingImg(true);
  };

  const closeModal = () => {
      setModalIsOpen(false);
      setSelectedDetail(null);
      setLoadingImg(false);
  };

  const handleImageLoad = () => {
      setLoadingImg(false); 
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
     <main className='max-w-screen-md mx-auto min-h-dvh'>
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

                <div className='flex items-center content-center border w-full md:w-1/2 p-2'>
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

                <div className='flex items-center content-center border border-t-0 w-full md:w-1/2 p-2'>
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
                  <Table striped className=' w-full' >
                      <Table.Head className='w-full' >
                          <Table.HeadCell className='py-2 px-2 md:text-base md:py-3 md:px-3 bg-cyan-600 text-white '>Periode</Table.HeadCell>
                          <Table.HeadCell className='py-2 px-2 md:text-base md:py-3 md:px-3 bg-cyan-600 text-white text-center'>Status</Table.HeadCell>
                          <Table.HeadCell className='py-2 px-2 md:text-base md:py-3 md:px-3 bg-cyan-600 text-white'>Tanggal</Table.HeadCell>
                          <Table.HeadCell className='py-2 px-2 md:text-base md:py-3 md:px-3 bg-cyan-600 text-white '>Detail</Table.HeadCell>
                      </Table.Head>
                      <Table.Body className="divide-y border-b">
                      
                      {months.map((month, index) => {
                        const { status, transactionDate, proofOfTransfer,paymentType,selectedID } = findFeeStatus(selectedPeriod, month);
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
                            
                              {status === "Lunas" && transactionDate !== '-' ? (
                                <span className='flex items-center'>
                                  <Button color="gray" onClick={() => openModal(selectedPeriod, month)} size="xs" className=' rounded-md focus:ring-0'>View</Button>
                                </span>
                              ):(
                                <>-</>
                              )}
                              
                            </Table.Cell>
                          </Table.Row>
                        );
                      })}
                      </Table.Body>
                  </Table>
                </div>
                <Modal show={modalIsOpen} position="center" size="3xl" dismissible  onClose={closeModal}>
                  <Modal.Header className='p-3 items-center justify-start'>
                      <span className='block'>Detail</span>
                      {/* {selectedDetail && (
                          <span className='block text-xs gray-700'>ID: {selectedDetail.transaction_id}</span>
                      )} */}
                      
                  </Modal.Header>
                  <Modal.Body className='p-3'>
                    {selectedDetail && (
                      <>
                        <div className='flex items-start content-start pb-2 mb-2 border-b'>
                            <div className='w-1/3 md:w-1/6 flex justify-between pr-1'><span className='font-semibold'>Tanggal</span><span>:</span></div>
                            <div className='w-10/12'><span  className='capitalize'>{formatDate(selectedDetail.transactionDate)}</span></div>
                        </div>
                        <div className='flex items-start content-start pb-2 mb-2 border-b'>
                            <div className='w-1/3 md:w-1/6 flex justify-between pr-1'><span className='font-semibold'>Periode</span><span>:</span></div>
                            <div className='w-10/12'><span  className='capitalize'>{selectedDetail.period}</span></div>
                        </div>
                        {/* <div className='flex items-start content-start pb-2 mb-2 border-b'>
                            <div className='w-1/3 md:w-1/6 flex justify-between pr-1'><span className='font-semibold'>IPL RW</span><span>:</span></div>
                            <div className='w-10/12'><span  className='capitalize'>{formatCurrency(50000)}</span></div>
                        </div>
                        <div className='flex items-start content-start pb-2 mb-2 border-b'>
                            <div className='w-1/3 md:w-1/6 flex justify-between pr-1'><span className='font-semibold'>Kas RT</span><span>:</span></div>
                            <div className='w-10/12'><span  className='capitalize'>{formatCurrency(20000)}</span></div>
                        </div> */}

                        <div className='flex items-start content-start pb-2 mb-2 border-b'>
                            <div className='w-1/3 md:w-1/6 flex justify-between pr-1'><span className='font-semibold'>Total</span><span>:</span></div>
                            <div className='w-10/12'><span  className='capitalize'>{formatCurrency(70000)}</span></div>
                        </div>

                        <div className="mt-5">
                          {selectedDetail.proofOfTransfer !== '' ? (
                                  <div className='w-1/2 relative'>
                                  <div className="relative w-full h-auto">
                                    {loadingImg && (
                                        <div className="animate-pulse flex justify-center items-center">
                                        {/* Skeleton Loader */}
                                        <div className="w-full h-40 bg-gray-300 rounded-lg"></div>
                                        </div>
                                    )}
                                  <Image
                                  className='w-full h-auto relative'
                                  width={0} 
                                  height={0}
                                  sizes="100vw"
                                  onLoad={handleImageLoad}
                                  src={selectedDetail.proofOfTransfer}  
                                  alt="Lampiran" /> 
                                  </div>
                                  </div>
                          ) : (
                              <></>
                          )}
                          </div>
                        </>
                    )}
                  </Modal.Body>
                  <Modal.Footer>
                  </Modal.Footer>
                </Modal>


                <p className='pt-4 pb-1 text-sm font-medium'>Catatan:</p>
                <p className='text-sm'>IPL RT 005 tercatat dan terhitung mulai dari Juli 2024.</p>
            </section>
        </div>
     </main>
    </>
  );
};

export default IplDetail;
