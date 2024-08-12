// pages/home.js
import React, { useCallback } from 'react';
import { useEffect,useState } from 'react';
import _ from 'lodash';
import axios from 'axios';
import Spinner from './Spinner';
import CustomThemeProviderSecond from './CustomThemeSecond';
import { Card, Button, Table, Accordion, Alert,List } from 'flowbite-react';
import { GrMoney } from "react-icons/gr";
import {FaRegArrowAltCircleDown, FaRegArrowAltCircleUp } from 'react-icons/fa';
import { GrFormNextLink } from "react-icons/gr";
import { MdMotionPhotosPaused } from "react-icons/md";
import { IoChevronDownSharp,IoChevronUpSharp } from "react-icons/io5";
import { HiEye, HiInformationCircle } from "react-icons/hi";

import { HiHome } from "react-icons/hi";

import Select from 'react-select';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment';
import 'moment/locale/id';
moment.locale('id');
import MonthOptions from './MonthOptions';
import Link from 'next/link';

const Report = ({ initialTransaction }) =>  {
  
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([initialTransaction]);
  const [reTransactions, setReTransactions] = useState([initialTransaction]);
  const [totalBalance, setTotalBalance] = useState(null);
  const [totalIncome, setTotalIncome] = useState(null);
  const [totalExpense, setTotalExpense] = useState(null);
  const [totalIplPaguyuban, setTotalIplPaguyuban] = useState(0);
  const [totalIplTbd, setTotalIplTbd] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState(moment().format('YYYY-MM')); // Format YYYY-MM moment().format('YYYY-MM')
  const [monthlyBalances, setMonthlyBalances] = useState([]);
  const [totalIncomePeriod, setTotalIncomePeriod] = useState(0);
  const [totalExpensePeriod, setTotalExpensePeriod] = useState(0);
  const [totalHousesPaid, setTotalHousesPaid] = useState(0);
  const [totalHouses, setTotalHouses] = useState(0);
  const [lastUpdate, setLastUpdate] = useState();
  const [percentage, setPercentage] = useState(0);
  const [expandedRows, setExpandedRows] = useState(null);
  const [showAlert, setShowAlert] = useState(true);
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount);
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

  const fetchTransactions = useCallback( async () => {
    try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/transactions/all`, {
            params: {
              period: selectedPeriod
          }
        });
        //console.log(res.data)
        setTransactions(res.data.data);
        setReTransactions(res.data.data);
        setLastUpdate(res.data.lastUpdate);
       
        
        setLoading(false);
    } catch (error) {
        console.error('Error fetching Transaction data:', error);
        setLoading(false);
    }
  },[selectedPeriod]);

  const fetchTotalBalance = useCallback( async () => {
    try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/transactions/balance`, {
           
        });
       // console.log(response.data)
        setTotalBalance(response.data.totalBalance);
        setTotalIncome(response.data.totalIncome);
        setTotalExpense(response.data.totalExpense);
        setTotalIplPaguyuban(response.data.totalIPlPaguyuban);
        setLoading(false);
    } catch (error) {
        console.error('Error fetching total balance:', error);
        setLoading(false);
    }
  },[]);

  const fetchMonthlyBalances = useCallback( async () => {
    //console.log(selectedPeriod)
    try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/transactions/balance-monthly`, {
            params: {
                period: selectedPeriod
            }
        });

        //console.log('Response data:', response.data);

        if (Array.isArray(response.data) && response.data.length > 0) {
            // Gunakan data yang ada jika valid
            setMonthlyBalances(response.data);
            setTotalIncomePeriod(response.data[0].totalIncome || 0);
            setTotalExpensePeriod(response.data[0].totalExpense || 0);
        } else {
            // Tangani kasus jika data tidak sesuai
            setMonthlyBalances([]);
            setTotalIncomePeriod(0);
            setTotalExpensePeriod(0);
        }
       
    } catch (error) {
        console.error('Error fetching monthly balances:', error);
        setMonthlyBalances([]);
        setTotalIncomePeriod(0);
        setTotalExpensePeriod(0);
    }
  },[selectedPeriod]);

  const fetchMonthlyPaid = useCallback( async () => {
    
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/houses/fee`, {
         
          params: {
            period: selectedPeriod
        }
      });
      //console.log(res.data)
      setTotalHousesPaid(res.data.total_houses_paid);
      setTotalHouses(res.data.total);
      setPercentage(res.data.percentage_paid);
    } catch (error) {
        console.error('Error fetching houses data:', error);
        setLoading(false);
    }
  },[selectedPeriod]);

  const fetchTbd = useCallback (async()=>{
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/houses/fee`, {
      });
      //console.log(res.data.total_tbd)
      setTotalIplTbd(res.data.total_tbd);
    } catch (error) {
        console.error('Error fetching houses data:', error);
    }
  },[]);


  const [relatedMonths, setRelatedMonths] = useState({
    value: moment().format('YYYY-MM'),
    label: moment().format('MMMM YYYY')
  });
  
  const handleMonthChange = (selectedOption) => {
    setSelectedPeriod(selectedOption.value);
    setTotalHousesPaid(0);
    setPercentage(0);
  };


  useEffect(() => {
    // Set nilai bulan saat ini saat komponen pertama kali dimuat
    const currentMonthOption = MonthOptions().find(
      (option) => option.value === moment().format('YYYY-MM')
    );
    setRelatedMonths(currentMonthOption);
  }, []);

  useEffect(() => {
    fetchTransactions();
    fetchTotalBalance();
    fetchMonthlyPaid();
    fetchMonthlyBalances();
    fetchTbd();

  }, [selectedPeriod,fetchTransactions,fetchTotalBalance,fetchMonthlyPaid,fetchMonthlyBalances,fetchTbd]);
  


  const getTypeIcon = (type) => {
    switch (type) {
      case 'income':
        return <FaRegArrowAltCircleDown  className="text-green-500 h-4 w-4 md:h-5 md:w-5 " />;
      case 'expense':
        return <FaRegArrowAltCircleUp  className="text-red-500 h-4 w-4 md:h-5 md:w-5 " />;
      case 'ipl':
        return <FaRegArrowAltCircleDown  className="text-green-700  h-4 w-4 md:h-5 md:w-5 " />;
      default:
        return null;
    }
  };

  const getTextColor = (type) => {
    switch (type) {
      case 'income':
        return "text-green-500";
      case 'expense':
        return "text-red-500";
      case 'ipl':
        return "text-green-700";
      default:
        return null;
    }
  };

  const groupedTransactions = _.groupBy(transactions, 'transaction_type');

   //console.log(groupedTransactions)
  // console.log()

  const handleExpandRow = (index) => {
    let currentExpandedRows = null;
    const isRowExpanded = currentExpandedRows === index ? index : null;
    const newExpandedRows = isRowExpanded
      ? null
      : (currentExpandedRows = index);
    if (expandedRows !== index) {
      setExpandedRows(newExpandedRows);
    } else {
      setExpandedRows(null);
    }
  };


  if (loading) {
    return <Spinner />;
  }

  //console.log(totalIplPaguyuban)

  function ExampleAdditionalContent() {
    return (
      <>
        <div className="mb-4 mt-2 text-md text-cyan-700 dark:text-cyan-800">
        <List>
          <List.Item><span className='font-medium'>Dana IPL Januari - Juni 2024 (IPL Paguyuban)</span> yang masuk ke rekening RT 05 (BCA 4210541557, a.n. Hamka) sebesar <span className='text-red-700 font-bold '>{formatCurrency(totalIplPaguyuban)}</span>. Selanjutnya statusnya dibekukan, detail <Link href='/cashflow?s=%23IPLPaguyuban' className='text-blue-700 font-bold bg-blue-300 px-2 py-1  rounded-md'>disini</Link>.</List.Item>
          <List.Item><span className='font-medium'>Dana IPL Juli - Desember 2024 (IPL RT 05)</span> yang masuk ke rekening Paguyuban (BCA 1671854662, a.n. Agus T.N.) sebesar <span className='text-red-700 font-bold'>{formatCurrency(totalIplTbd)}</span>. Dana masih belum bisa ditarik ke kas RT 05, detail <Link href='/tbd-ipl' className='text-blue-700 font-bold bg-blue-300 px-2 py-1  rounded-md'>disini</Link>.</List.Item>
        </List>
        
        </div>
        
      </>
    );
  }


  return (
    <>
     {showAlert && (
          <Alert
            className="mb-5"
            additionalContent={<ExampleAdditionalContent />}
            color="warning"
            icon={HiInformationCircle}
            onDismiss={() => setShowAlert(false)}
          >
            <span className="font-medium">Info !</span> Beberapa Penyesuaian.
          </Alert>
      )}
    <CustomThemeProviderSecond>
          <Card className='mb-5 shadow-none'>
            <div className='flex flex-col lg:flex-row justify-between gap-3'>
              <div className='flex flex-col border-cyan-700 gap-3 border-2 p-3 rounded-md lg:w-1/2'>
                <div className='flex items-center content-center gap-2  md:gap-3 '>
                  <span className='items-center content-center'>
                    <GrMoney className="h-7 w-7 lg:h-10 lg:w-10 text-cyan-700" />
                  </span>
                  <div>
                    <h2 className='md:text-2xl text-xl font-bold text-cyan-700 '>{formatCurrency(totalBalance-totalIplPaguyuban)}</h2>
                    
                  </div>
                </div>
                <h3 className="md:text-base text-sm font-light text-gray-500 dark:text-gray-400">Saldo Akhir</h3>
                
              </div>
             <div className='flex  gap-2 lg:gap-4 '>
                <div className='flex flex-col items-start content-start  gap-2  md:gap-3 p-2 lg:p-3 border-green-500 border-2 rounded-md w-1/2'>
                    <div className='flex items-center content-center gap-2  md:gap-3 '>
                      <span className=''>
                        <FaRegArrowAltCircleDown className="h-7 w-7 lg:h-10 lg:w-10 text-green-500" />
                      </span>
                      <div>
                        <h2 className='md:text-2xl text-md font-bold text-green-500 '>{formatCurrency(totalIncome-totalIplPaguyuban)}</h2>
                        {/* <h3 className="md:text-base text-sm font-light text-gray-500 dark:text-gray-400">Total Pemasukan</h3> */}
                      </div>
                    </div>
                    <h3 className="md:text-base text-sm font-light text-gray-500 dark:text-gray-400">Total Pemasukan</h3>
                </div>
                <div className='flex flex-col items-start content-start gap-2  md:gap-3 border-2 border-red-500 p-2 lg:p-3 rounded-md w-1/2'>
                  <div className='flex items-center content-center gap-2  md:gap-3 '>
                    <span className=''>
                      <FaRegArrowAltCircleUp className="h-7 w-7 lg:h-10 lg:w-10 text-red-500" />
                    </span>
                    <div>
                      <h2 className='md:text-2xl text-md font-bold text-red-500 '>{formatCurrency(totalExpense)}</h2>
                      {/* <h3 className="md:text-base text-sm font-light text-gray-500 dark:text-gray-400">Total Pengaluaran</h3> */}
                    </div>
                  </div>
                  <h3 className="md:text-base text-sm font-light text-gray-500 dark:text-gray-400">Total Pengeluaran</h3> 
                   
                </div>

             </div>
            </div>
          </Card>
         

    </CustomThemeProviderSecond>
        
    <CustomThemeProviderSecond>
        <Card className='mb-11'>
            <div className='flex items-center justify-start gap-4 mb-4 mt-3 bg-cyan-700 rounded-md p-3 '>
                <div>
                    <span className='font-semibold text-white'>PERIODE</span>
                </div>
                <Select
                    id="relatedMonths"
                    options={MonthOptions()}
                    value={MonthOptions().find(option => option.value === selectedPeriod)}
                    onChange={handleMonthChange}
                    placeholder="Pilih bulan"
                    className='bg-cyan-700 rounded w-full md:w-1/3'
                    styles={{
                      control: (baseStyles, state) => ({
                        ...baseStyles,
                        backgroundColor: '#0e7490',
                      }),
                      input: (styles) => ({ ...styles, color: '#fff' }),
                      placeholder: (styles) => ({ ...styles, color: '#fff' }),
                      singleValue: (styles, { data }) => ({ ...styles, color: '#fff' }),
                    }}
                />
            </div>
            <div className='flex gap-1 md:gap-4 justify-between flex-row mb-4'>
            
                <Card className='bg-green-700 text-white w-1/3'>
                <h3 className='font-bold text-sm md:text-xl flex flex-col lg:flex-row  items-start lg:items-center content-center'>
                  <span className='flex'>
                    <span><HiHome className="h-5 w-5  md:h-7 md:w-7 mr-1 lg:mr-2" /></span>
                    <span>IPL</span>
                  </span>
                  <span className='text-xs lg:text-sm font-normal lg:ml-3'>{`${totalHousesPaid} / ${totalHouses} Rumah`}</span>
                  </h3>
                <span className='font-semibold text-sm md:text-lg'>{percentage}</span>
                </Card>
                <Card className='bg-green-500 text-white w-1/3'>
                <h3 className='font-bold text-sm md:text-xl flex items-start'><span><FaRegArrowAltCircleDown className="h-5 w-5  md:h-7 md:w-7 mr-2" /></span><span>Masuk</span></h3>
                <span className='font-semibold text-xs md:text-lg'>{formatCurrency(totalIncomePeriod)}</span>
                </Card>
                <Card className='bg-red-500 text-white w-1/3'>
                <h3 className='font-bold text-sm md:text-xl flex items-start'><span><FaRegArrowAltCircleUp className="h-5 w-5  md:h-7 md:w-7 mr-2" /></span><span>Keluar</span></h3>
                <span className='font-semibold text-xs md:text-lg'>{formatCurrency(totalExpensePeriod)}</span>
                </Card>
            
            </div>
            {/* <div>{`Last Update: ${moment(lastUpdate).format('DD MMM yyyy')}`}</div> */}
            <CustomThemeProviderSecond>
              <div className="overflow-x-auto">
                  <Table striped>
                      <Table.Head className='' >
                          <Table.HeadCell className='py-2 px-2 md:text-base md:py-3 md:px-3 bg-cyan-600 text-white w-2/3'>Keterangan</Table.HeadCell>
                          <Table.HeadCell className='py-2 px-2 md:text-base md:py-3 md:px-3 bg-cyan-600 text-white'>Tanggal</Table.HeadCell>
                          <Table.HeadCell className='py-2 px-2 md:text-base md:py-3 md:px-3 bg-cyan-600 text-white '>Nominal</Table.HeadCell>
                          <Table.HeadCell className='py-2 px-2 md:text-base md:py-3 md:px-3 bg-cyan-600 text-white w-4 '></Table.HeadCell>
                      </Table.Head>
                      <Table.Body className="divide-y">
                        {transactions && transactions.length > 0 && transactions[0] !== undefined ? (
                          <>
                            {Object.keys(groupedTransactions).sort((a, b) => {
                              if (a === 'ipl') return -1;
                              if (b === 'ipl') return 1;
                              return 0;
                            }).map((transactionType, index) => (
                              <React.Fragment key={index}>
                                {groupedTransactions[transactionType].length > 0 && (
                                  <Table.Row 
                                  className={`bg-white dark:border-gray-700 dark:bg-gray-800 cursor-pointer`}
                                  onClick={() => handleExpandRow(index)}>
                                    <Table.Cell colSpan="2" className={`${getTextColor(transactionType)} py-2 px-2 md:py-3 md:px-3 text-xs md:text-base font-bold`}>
                                      {transactionType === 'ipl' ? `Pembayaran IPL` : transactionType === 'income' ? 'Pemasukan' : transactionType === 'expense' ? 'Pengeluaran' : ''}
                                      </Table.Cell>
                                    <Table.Cell className={`${getTextColor(transactionType)} flex items-start content-start  py-2 px-2 md:py-3 md:px-3 text-xs md:text-base font-bold`}>
                                       <span className='pr-1' >{transactionType === 'ipl' ? `+` : transactionType === 'income' ? '+' : transactionType === 'expense' ? '-' : ''}</span>
                                       <span>{formatCurrency(groupedTransactions[transactionType].reduce((acc, curr) => acc + curr.amount, 0))}</span>
                                    </Table.Cell>
                                    <Table.Cell className={`${getTextColor(transactionType)}items-start content-start  py-2 px-2 md:py-3 md:px-3 text-xs md:text-base font-bold`}>
                                      {expandedRows === index ? <IoChevronUpSharp /> : <IoChevronDownSharp />}
                                      </Table.Cell>
                                  </Table.Row>
                                )}

                                {expandedRows === index ? (
                                  <>
                                   {groupedTransactions[transactionType].map((transaction, subIndex) => (
                                    <Table.Row key={subIndex} className={`bg-white dark:border-gray-700 dark:bg-gray-800 transition-all duration-500 ease-in-out overflow-hidden ${expandedRows === index? 'max-h-screen opacity-100': 'max-h-0 opacity-0'}`}>
                                      <Table.Cell className={`${getTextColor(transaction.transaction_type)} py-2 px-2 md:py-3 md:px-3 text-xs md:text-base`}>
                                        <span className='flex items-start'>
                                          <span>{getTypeIcon(transaction.transaction_type)} </span>
                                          <span className="ml-2">{transaction.description}</span>
                                          {transaction.description.includes('#IPLPaguyuban') && <span className="ml-2 text-red-500"><MdMotionPhotosPaused className='text-red-600 h-4 w-4 md:h-5 md:w-5' /></span>}
                                        </span>
                                      </Table.Cell>
                                      <Table.Cell className={`${getTextColor(transaction.transaction_type)} items-start content-start py-2 px-2 md:py-3 md:px-3 text-xs md:text-base`}>
                                        {formatDate(transaction.date)}
                                      </Table.Cell>
                                      <Table.Cell className={`${getTextColor(transaction.transaction_type)} items-start content-start  py-2 px-2 md:py-3 md:px-3 text-xs md:text-base`}>
                                        {formatCurrency(transaction.amount)}
                                      </Table.Cell>
                                    </Table.Row>
                                  ))}
                                  </>
                                ) : null}
                              </React.Fragment>
                            ))}
                          </>
                        ) : (
                          <Table.Row>
                          <Table.Cell colSpan="3" className="text-center">Data tidak tersedia</Table.Cell>
                          </Table.Row>
                        ) }
                      
                      </Table.Body>
                  </Table>
                  
              </div>
              <div className='flex justify-end items-center content-center mt-4 mb-3'>
                <Button size='xs' as={Link} href="/cashflow" className=''>Lihat semua arus kas<GrFormNextLink  className='w-4 h-4'/></Button>
              </div>
            </CustomThemeProviderSecond>
        </Card>
        
       
    </CustomThemeProviderSecond>
    
    </>
  );
}

export const getServerSideProps = async (context) => {
   // const session = await getSession(context);
    
    // if (!session) {
    //     return {
    //         redirect: {
    //             destination: '/',
    //             permanent: false,
    //         },
    //     };
    // }
  
    try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/transactions/all`, {
            // headers: {
            //     Authorization: `Bearer ${session.accessToken}`,
            // },
        });
        return {
            props: {
              initialTransaction: res.data.data,
            },
        };
    } catch (error) {
        console.error('Error fetching tra data:', error);
        return {
            props: {
              initialTransaction: [],
            },
        };
    }
  };

export default Report;