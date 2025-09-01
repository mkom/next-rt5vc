// pages/home.js
import React, { useCallback } from 'react';
import { useEffect,useState } from 'react';
import _ from 'lodash';
import axios from 'axios';
import Spinner from './Spinner';
import CustomThemeProviderSecond from './CustomThemeSecond';
import { Card, Button, Table, TableRow } from 'flowbite-react';
import { GrMoney } from "react-icons/gr";
import {FaRegArrowAltCircleDown, FaRegArrowAltCircleUp } from 'react-icons/fa';
import { GrFormNextLink } from "react-icons/gr";
import { IoChevronDownSharp,IoChevronUpSharp } from "react-icons/io5";
import { MdOutlineAccountBalanceWallet } from "react-icons/md";

import Select from 'react-select';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment';
import 'moment/locale/id';
import 'moment-timezone';
moment.locale('id');
// moment.tz.setDefault('Asia/Jakarta');
import MonthOptions from './MonthOptions';
import Link from 'next/link';
import { formatPeriod } from './FormatPeriod';

const Report = ({ initialTransaction }) =>  {
  
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([initialTransaction]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [totalOutstandingOverall, setTotalOutstandingOverall] = useState(0)
  const [totalIplPaguyuban, setTotalIplPaguyuban] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState(moment().format('YYYY-MM')); // Format YYYY-MM moment().format('YYYY-MM')
  const [totalIncomePeriod, setTotalIncomePeriod] = useState(0);
  const [totalExpensePeriod, setTotalExpensePeriod] = useState(0);
  const [tatolOutstndingPeriod, setTotalOutstandingPeriod] = useState(0);
  const [opening_balance,setOpening_balance]= useState(0);
  const [expandedRows, setExpandedRows] = useState(null);
  const [skeleten, setSkeleton] = useState(true);
  
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

  const [relatedMonths, setRelatedMonths] = useState({
    value: moment().format('YYYY-MM'),
    label: moment().format('MMMM YYYY')
  });
  
  const handleMonthChange = (selectedOption) => {
    setSelectedPeriod(selectedOption.value);
    setSkeleton(true);
  };


  useEffect(() => {
    // Set nilai bulan saat ini saat komponen pertama kali dimuat
    const currentMonthOption = MonthOptions().find(
      (option) => option.value === moment().format('YYYY-MM')
    );
    setRelatedMonths(currentMonthOption);
  }, []);

  const fetchReport = useCallback( async () => {
    try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/report/`, {
            params: {
              period: selectedPeriod
          }
        });
        console.log(res.data)
        const dataRes = res.data.data;
        setTotalBalance(dataRes.balance.final_balance);
        setTotalIncome(dataRes.balance.total_income);
        setTotalExpense(dataRes.balance.total_expense);
        //setTotalOutstandingOverall(dataRes.balance.totalOutstandingOverall);

        setTotalIncomePeriod(dataRes.monthlyData[0][0].income || 0);
        setTotalExpensePeriod(dataRes.monthlyData[0][0].expense  || 0);
        setOpening_balance(dataRes.monthlyData[0][0].opening_balance  || 0)
        setTotalOutstandingPeriod(dataRes.monthlyData[0][0].total_outstanding || 0)

        setTransactions(dataRes.transactions);
        setSkeleton(false);
        setLoading(false);
    } catch (error) {
        console.error('Error fetching Transaction data:', error);
        setLoading(false);
        setSkeleton(false);
    }
  },[selectedPeriod]);

  useEffect(() => {
    fetchReport();
  }, [selectedPeriod,fetchReport]);

  const fetchOutstanding = useCallback( async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/houses/outstanding`, {
      });

     setTotalOutstandingOverall(res.data.total_amount)
     setLoading(false);
    } catch (error) {
        console.error('Error fetching houses data:', error);
        setLoading(false);
    }
  },[]);

  useEffect(() => {
    fetchOutstanding();

  }, [fetchOutstanding]);
  


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


  return (
    <>
    
    <CustomThemeProviderSecond>
          <Card className='mb-5 shadow-sm'>
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
                <h3 className="md:text-base text-sm font-bold text-gray-500 dark:text-gray-400">Saldo Akhir</h3>
                
              </div>
             <div className='flex  gap-2 lg:gap-4 '>
                <div className='flex flex-col items-start content-start  gap-2  md:gap-3 p-2 lg:p-3 border-green-500 border-2 rounded-md w-1/2'>
                    <div className='flex items-center content-center gap-2  md:gap-3 '>
                      <span className=''>
                        <FaRegArrowAltCircleDown className="h-6 w-6 lg:h-10 lg:w-10 text-green-500" />
                      </span>
                      <div>
                        <h2 className='md:text-2xl text-base font-bold tracking-[-.05em] text-green-500 '>{formatCurrency(totalIncome-totalIplPaguyuban)}</h2>
                        {/* <h3 className="md:text-base text-sm font-light text-gray-500 dark:text-gray-400">Total Pemasukan</h3> */}
                      </div>
                    </div>
                    <h3 className="md:text-base text-sm font-bold text-gray-500 dark:text-gray-400">Total Pemasukan</h3>
                </div>
                <div className='flex flex-col items-start content-start gap-2  md:gap-3 border-2 border-red-500 p-2 lg:p-3 rounded-md w-1/2'>
                  <div className='flex items-center content-center gap-2  md:gap-3 '>
                    <span className=''>
                      <FaRegArrowAltCircleUp className="h-6 w-6 lg:h-10 lg:w-10 text-red-500" />
                    </span>
                    <div>
                      <h2 className='md:text-2xl text-base font-bold tracking-[-.05em] text-red-500 '>{formatCurrency(totalExpense)}</h2>
                      {/* <h3 className="md:text-base text-sm font-light text-gray-500 dark:text-gray-400">Total Pengaluaran</h3> */}
                    </div>
                  </div>
                  <h3 className="md:text-base text-sm font-bold text-gray-500 dark:text-gray-400">Total Pengeluaran</h3> 
                   
                </div>

             </div>
             
            </div>
            <div className='flex pt-3 '>
                <div className='flex flex-col items-start content-start  gap-1  p-2  border-yellow-500 border-2 rounded-md w-full'>
                    <div className='flex items-center content-center gap-2 '>
                      <span className=''>
                        <MdOutlineAccountBalanceWallet className="h-6 w-6 lg:h-7 lg:w-7 text-yellow-500" />
                      </span>
                      <div>
                        <h2 className='md:text-xl text-sm font-bold tracking-[-.05em] text-yellow-500 '>{formatCurrency(totalOutstandingOverall)}</h2>
                        {/* <h3 className="md:text-base text-sm font-light text-gray-500 dark:text-gray-400">Total Pemasukan</h3> */}
                      </div>
                    </div>
                    <h3 className="md:text-base text-xs font-medium text-yellow-500 dark:text-gray-400">Total Saldo Tertunggak (Outstanding IPL)</h3>
                </div>
            </div>
          </Card>
         
         

    </CustomThemeProviderSecond>
        
    <CustomThemeProviderSecond>
        <Card className='mb-5 shadow-sm'>
            <div className='flex items-center justify-start gap-4 mb-4 mt-3 bg-cyan-700 rounded-md p-3 '>
                <div>
                    <span className='font-semibold text-white'>BULAN</span>
                </div>
                <Select
                    id="relatedMonths"
                    options={MonthOptions()}
                    value={MonthOptions().find(option => option.value === selectedPeriod)}
                    onChange={handleMonthChange}
                    isSearchable={false}
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

            { skeleten ? (
              <>
              <div className='animate-pulse flex gap-1 md:gap-4 justify-between flex-col md:flex-row mb-4'>
                <Card className='bg-gray-200 text-white w-full md:w-1/2 shadow-none rounded-none'>
                  <div className='h-3 bg-gray-400 rounded'></div>
                </Card>
                <div className='w-full  md:w-1/2 flex gap-1 md:gap-4 justify-between flex-row '>
                    <Card className='bg-gray-200 text-white w-full md:w-1/2 shadow-none rounded-none  '>
                      <div className='h-3 bg-gray-400'></div>
                    </Card>
                    <Card className='bg-gray-200 text-white w-full md:w-1/2 shadow-none rounded-none '>
                      <div className='h-3 bg-gray-400'></div>
                    </Card>
                </div>
              </div>

              <div className="overflow-x-auto animate-pulse">
                    <Table striped >
                        <Table.Head className='' >
                            <Table.HeadCell className='py-2 px-2 md:text-base md:py-3 md:px-3 bg-gray-200 text-white w-1/2'><div className='h-3 bg-gray-400'></div></Table.HeadCell>
                            <Table.HeadCell className='py-2 px-2 md:text-base md:py-3 md:px-3 bg-gray-200 text-white'><div className='h-3 bg-gray-400'></div></Table.HeadCell>
                            <Table.HeadCell className='py-2 px-2 md:text-base md:py-3 md:px-3 bg-gray-200 text-white '><div className='h-3 bg-gray-400'></div></Table.HeadCell>
                        </Table.Head>
                    </Table>
              </div>
              </>
            ) :(
              <>
              <div className='flex gap-1 md:gap-4 justify-between flex-col md:flex-row mb-1'>
                  <Card className='bg-green-500 text-white w-full md:w-1/2 '>
                    <h3 className='font-bold text-sm md:text-xl flex items-start'>
                      <span><MdOutlineAccountBalanceWallet className="h-5 w-5  md:h-7 md:w-7 mr-2" /></span>
                      <span className=''>Saldo Sebelumnya</span>
                    </h3>
                    <span className='font-semibold text-xs md:text-lg'>{formatCurrency(opening_balance)}</span>
                    
                  </Card>
                  <div className='w-full  md:w-1/2 flex gap-1 md:gap-4 justify-between flex-row '>
                    <Card className='bg-green-500 text-white w-1/2'>
                        <h3 className='font-bold text-sm md:text-xl flex items-start'><span><FaRegArrowAltCircleDown className="h-5 w-5  md:h-7 md:w-7 mr-2" /></span><span>Masuk</span></h3>
                        <span className='font-semibold text-xs md:text-lg'>{formatCurrency(totalIncomePeriod)}</span>
                        
                      </Card>
                      <Card className='bg-red-500 text-white w-1/2'>
                        <h3 className='font-bold text-sm md:text-xl flex items-start'><span><FaRegArrowAltCircleUp className="h-5 w-5  md:h-7 md:w-7 mr-2" /></span><span>Keluar</span></h3>
                        <span className='font-semibold text-xs md:text-lg'>{formatCurrency(totalExpensePeriod)}</span>
                      </Card>
                  </div>
              </div>
              {/* <div className='mb-4'>
                <Card className='bg-yellow-500 text-white w-full'>
                    <h3 className='font-bold text-sm md:text-xl flex items-start'>
                      <span><MdOutlineAccountBalanceWallet className="h-5 w-5  md:h-7 md:w-7 mr-2" /></span>
                      <span className=''>Saldo Tertunggak (Outstanding IPL)</span>
                    </h3>
                    <span className='font-semibold text-xs md:text-lg'>{formatCurrency(tatolOutstndingPeriod)}</span>
                    
                  </Card>
              </div> */}

              <div className="overflow-x-auto">
                    <Table  >
                        <Table.Head className='' >
                            <Table.HeadCell className='py-2 px-2 md:text-base md:py-3 md:px-3 bg-cyan-600 text-white w-2/3'>Keterangan</Table.HeadCell>
                            <Table.HeadCell className='py-2 px-2 md:text-base md:py-3 md:px-3 bg-cyan-600 text-white'>Tanggal</Table.HeadCell>
                            <Table.HeadCell className='py-2 px-2 md:text-base md:py-3 md:px-3 bg-cyan-600 text-white '>Nominal</Table.HeadCell>
                        </Table.Head>
                        <Table.Body className="divide-y">
                          {transactions ? (
                            <>
                            <Table.Row>
                              <Table.Cell colSpan="3" className='bg-gray-100 pt-2.5 pb-1.5 px-2'>
                              <span className='flex items-center content-center'>
                              <span>{getTypeIcon('ipl')} </span>
                              <span className='uppercase font-bold md:text-base text-green-700 ml-2'>Pemasukan:</span>
                              </span>
                               
                              </Table.Cell>
                            </Table.Row>
                              <React.Fragment key='trx'>
                                {transactions.ipl.length > 0 && (
                                  <>
                                  <Table.Row 
                                    className={`bg-white dark:border-gray-700 dark:bg-gray-800 cursor-pointer`}
                                    onClick={() => handleExpandRow('ipl')}>
                                      <Table.Cell colSpan="2" className={`${getTextColor('ipl')} pt-1 px-4  pb-2 md:px-5 text-xs md:text-base font-medium`}>
                                        Rutin (IPL)
                                      </Table.Cell>
                                      <Table.Cell className={`${getTextColor('ipl')} flex items-center content-center justify-end   py-1 px-3  text-xs md:text-base font-medium`}>
                                        <span className='pr-1' >+</span>
                                        <span>{formatCurrency(transactions.totalIpl)}</span>
                                        <span className='pl-1'>{expandedRows === 'ipl' ? <IoChevronUpSharp /> : <IoChevronDownSharp />}</span>
                                      </Table.Cell>
                                  </Table.Row>
                                  {
                                    expandedRows === 'ipl' && (
                                      <>
                                      {(() => {
                                        // Group transactions by period
                                        const groupedByPeriod = {};
                                        transactions.ipl.forEach(transaction => {
                                          const monthsCount = transaction.related_months.length;
                                          const amountPerMonth = transaction.amount / monthsCount;
                                          
                                          transaction.related_months.forEach(period => {
                                            if (!groupedByPeriod[period]) {
                                              groupedByPeriod[period] = {
                                                transactions: [],
                                                total: 0,
                                                latestDate: null,
                                                count: 0
                                              };
                                            }
                                            
                                            // Only add transaction to array if not already present (to avoid duplicates)
                                            const existingTransaction = groupedByPeriod[period].transactions.find(t => t._id === transaction._id);
                                            if (!existingTransaction) {
                                              groupedByPeriod[period].transactions.push(transaction);
                                              groupedByPeriod[period].count += 1;
                                            }
                                            
                                            groupedByPeriod[period].total += amountPerMonth;
                                            
                                            // Find latest transaction date for this period
                                            const transactionDate = new Date(transaction.date);
                                            if (!groupedByPeriod[period].latestDate || transactionDate > groupedByPeriod[period].latestDate) {
                                              groupedByPeriod[period].latestDate = transactionDate;
                                            }
                                          });
                                        });

                                        // Sort periods chronologically
                                        const sortedPeriods = Object.keys(groupedByPeriod).sort((a, b) => new Date(a + '-01') - new Date(b + '-01'));

                                        return sortedPeriods.map((period, index) => (
                                          <Table.Row key={`period-${period}-${index}`} className={`bg-white dark:border-gray-700 dark:bg-gray-800 transition-all duration-500 ease-in-out overflow-hidden ${expandedRows === 'ipl'? 'max-h-screen opacity-100': 'max-h-0 opacity-0'}`}>
                                            <Table.Cell className={`${getTextColor('ipl')} py-1 px-4 md:py-2 md:px-5 text-xs md:text-base`}>
                                              <span className='flex items-center content-center'>
                                                <span className="">
                                                  Pembayaran IPL {formatPeriod([period])} ({groupedByPeriod[period].count})
                                                </span>
                                              </span>
                                            </Table.Cell>
                                            <Table.Cell className={`${getTextColor('ipl')} items-center content-center py-1 px-4 md:py-2 md:px-3 text-xs md:text-base`}>
                                              {formatDate(groupedByPeriod[period].latestDate)}
                                            </Table.Cell>
                                            <Table.Cell className={`${getTextColor('ipl')} items-center content-center  justify-end py-1 px-4 md:py-2 md:px-3 text-xs md:text-base`}>
                                              <span className='flex items-center content-center justify-end pr-5'>
                                                {formatCurrency(groupedByPeriod[period].total)}
                                              </span>
                                            </Table.Cell>
                                          </Table.Row>
                                        ));
                                      })()}
                                        <TableRow  className={`bg-white dark:border-gray-700 dark:bg-gray-800 transition-all duration-500 ease-in-out overflow-hidden ${expandedRows === 'ipl'? 'max-h-screen opacity-100': 'max-h-0 opacity-0'}`}>
                                            <Table.Cell colSpan={3} className={`${getTextColor('ipl')} py-1 px-4  md:px-3 text-xs md:text-base`}>
                                            <span className='flex items-center content-center justify-end'>
                                              <span className="mb-2 font-semibold">
                                                <a href={`/cashflow?period=${selectedPeriod}`}>Lihat semua <GrFormNextLink className='inline'/></a>
                                                </span>
                                            </span>
                                              
                                            </Table.Cell>
                                        </TableRow>
                                      </>
                                    )
                                  }
                                  </>
                                  
                                )}

                                {transactions.inOther.length > 0 && (
                                  <>
                                    <Table.Row 
                                      className={`bg-white dark:border-gray-700 dark:bg-gray-800 cursor-pointer`}
                                      onClick={() => handleExpandRow('income')}>
                                        <Table.Cell colSpan="2" className={`${getTextColor('income')} pt-1 px-4  pb-2 md:px-5 text-xs md:text-base font-medium`}>
                                           Lain-Lain
                                        </Table.Cell>
                                        <Table.Cell className={`${getTextColor('income')} flex items-center content-center justify-end   py-1 px-3 text-xs md:text-base font-medium`}>
                                          <span className='pr-1' >+</span>
                                          <span>{formatCurrency(transactions.totalInOther)}</span>
                                          <span className='pl-1'>{expandedRows === 'income' ? <IoChevronUpSharp /> : <IoChevronDownSharp />}</span>
                                        </Table.Cell>
                                    </Table.Row>
                                    {
                                    expandedRows === 'income' && (
                                      <>
                                      {transactions.inOther.map((transaction, index) => (
                                          <Table.Row key={index} className={`bg-white dark:border-gray-700 dark:bg-gray-800 transition-all duration-500 ease-in-out overflow-hidden ${expandedRows === 'income'? 'max-h-screen opacity-100': 'max-h-0 opacity-0'}`}>
                                            <Table.Cell className={`${getTextColor('income')}  py-1 px-4 md:py-2  md:px-5 text-xs md:text-base`}>
                                            <span className='flex items-center content-center'>
                                              {/* <span>{getTypeIcon('income')} </span> */}
                                              <span className="">{transaction.description}</span>
                                            </span>
                                              
                                            </Table.Cell>
                                            <Table.Cell className={`${getTextColor('income')} items-center content-center  py-1 px-4 md:py-2 md:px-3 text-xs md:text-base`}>{formatDate(transaction.date)}</Table.Cell>
                                            <Table.Cell className={`${getTextColor('income')} items-center content-center justify-end  py-1 px-4 md:py-2 md:px-3 text-xs md:text-base`}><span className='flex items-center content-center justify-end pr-5'>{formatCurrency(transaction.amount)}</span></Table.Cell>
                                          </Table.Row>
                                        ))}
                                        <TableRow  className={`bg-white dark:border-gray-700 dark:bg-gray-800 transition-all duration-500 ease-in-out overflow-hidden ${expandedRows === 'income'? 'max-h-screen opacity-100': 'max-h-0 opacity-0'}`}>
                                            <Table.Cell colSpan={3} className={`${getTextColor('income')}  py-1 px-4  md:px-3 text-xs md:text-base`}>
                                            <span className='flex items-center content-center justify-end'>
                                              <span className="mb-2 font-semibold"><a href={`/cashflow?period=${selectedPeriod}`}>Lihat semua <GrFormNextLink className='inline'/></a></span>
                                            </span>
                                            </Table.Cell>
                                        </TableRow>
                                      </>
                                    )
                                    }
                                  </>
                                  
                                )}

                                

                              </React.Fragment>
                            {/* <Table.Row>
                            <Table.Cell colSpan="3" className='bg-white py-1.5 px-2 md:text-base md:py-1.5 md:px-3'>
                           
                            </Table.Cell>
                            </Table.Row> */}
                            
                            <Table.Row>
                            <Table.Cell colSpan="3" className='bg-gray-100 pt-2.5 pb-1.5 px-2 md:text-base md:pt-2.5 md:pb-1.5 md:px-3'>
                            <span className='flex items-center content-center'>
                              <span>{getTypeIcon('expense')} </span>
                              <span className='uppercase font-bold md:text-base text-red-500 ml-2'>Pengeluaran:</span>
                            </span>
                            </Table.Cell>
                            </Table.Row>
                            <React.Fragment key='trxOut'>
                                {transactions.OutRutin.length > 0 && (
                                  <>
                                  <Table.Row 
                                    className={`bg-white dark:border-gray-700 dark:bg-gray-800 cursor-pointer`}
                                    onClick={() => handleExpandRow('OutRutin')}>
                                      <Table.Cell colSpan="2" className={`text-red-500  pt-1 px-4  pb-2 md:px-5 text-xs md:text-base font-medium`}>
                                        Rutin
                                      </Table.Cell>
                                      <Table.Cell className={`text-red-500 flex items-center content-center justify-end  py-1 px-3 text-xs md:text-base font-medium`}>
                                        <span className='pr-1' >-</span>
                                        <span>{formatCurrency(transactions.totalOutRutin)}</span>
                                        <span className='pl-1'>{expandedRows === 'OutRutin' ? <IoChevronUpSharp /> : <IoChevronDownSharp />}</span>
                                      </Table.Cell>
                                  </Table.Row>
                                  {
                                    expandedRows === 'OutRutin' && (
                                      <>
                                      {transactions.OutRutin.map((transaction, index) => (
                                          <Table.Row key={index} className={`bg-white dark:border-gray-700 dark:bg-gray-800 transition-all duration-500 ease-in-out overflow-hidden ${expandedRows === 'OutRutin'? 'max-h-screen opacity-100': 'max-h-0 opacity-0'}`}>
                                          <Table.Cell className={`${getTextColor('expense')}  py-1 px-4 md:py-2  md:px-5 text-xs md:text-base`}>
                                          <span className='flex items-center content-center'>
                                            {/* <span>{getTypeIcon('expense')} </span> */}
                                            <span className="">{transaction.description}</span>
                                          </span>
                                            
                                          </Table.Cell>
                                          <Table.Cell className={`${getTextColor('expense')} items-center content-center py-1 md:py-2 px-3 text-xs md:text-base`}>{formatDate(transaction.date)}</Table.Cell>
                                          <Table.Cell className={`${getTextColor('expense')} items-center content-center py-1 md:py-2 px-3 justify-end text-xs md:text-base`}><span className='flex items-center content-center justify-end pr-5'>{formatCurrency(transaction.amount)}</span></Table.Cell>
                                        </Table.Row>
                                        ))}
                                        <TableRow  className={`bg-white dark:border-gray-700 dark:bg-gray-800 transition-all duration-500 ease-in-out overflow-hidden ${expandedRows === 'OutRutin'? 'max-h-screen opacity-100': 'max-h-0 opacity-0'}`}>
                                            <Table.Cell colSpan={3} className={`${getTextColor('expense')} py-1 px-4  md:px-3  text-xs md:text-base`}>
                                            <span className='flex items-center content-center justify-end'>
                                              <span className="mb-2 font-semibold">
                                                <a href={`/cashflow?period=${selectedPeriod}`}>Lihat semua <GrFormNextLink className='inline'/></a>
                                                </span>
                                            </span>
                                              
                                            </Table.Cell>
                                        </TableRow>
                                      </>
                                    )
                                  }
                                  </>
                                  
                                )}

                                {transactions.OutFasum.length > 0 && (
                                  <>
                                  <Table.Row 
                                    className={`bg-white dark:border-gray-700 dark:bg-gray-800 cursor-pointer`}
                                    onClick={() => handleExpandRow('OutFasum')}>
                                      <Table.Cell colSpan="2" className={`text-red-500  pt-1 px-4  pb-2 md:px-5 text-xs md:text-base font-medium`}>
                                        Fasilitas Umum
                                      </Table.Cell>
                                      <Table.Cell className={`text-red-500 flex items-center content-center justify-end  py-1 px-3 text-xs md:text-base font-medium`}>
                                        <span className='pr-1' >-</span>
                                        <span>{formatCurrency(transactions.totalOutFasum)}</span>
                                        <span className='pl-1'>{expandedRows === 'OutFasum' ? <IoChevronUpSharp /> : <IoChevronDownSharp />}</span>
                                      </Table.Cell>
                                  </Table.Row>
                                  {
                                    expandedRows === 'OutFasum' && (
                                      <>
                                      {transactions.OutFasum.map((transaction, index) => (
                                          <Table.Row key={index} className={`bg-white dark:border-gray-700 dark:bg-gray-800 transition-all duration-500 ease-in-out overflow-hidden ${expandedRows === 'OutFasum'? 'max-h-screen opacity-100': 'max-h-0 opacity-0'}`}>
                                          <Table.Cell className={`${getTextColor('expense')}  py-1 px-4 md:py-2  md:px-5 text-xs md:text-base`}>
                                          <span className='flex items-center content-center'>
                                            {/* <span>{getTypeIcon('expense')} </span> */}
                                            <span className="">{transaction.description}</span>
                                          </span>
                                            
                                          </Table.Cell>
                                          <Table.Cell className={`${getTextColor('expense')} items-center content-center py-1 px-3 text-xs md:text-base`}>{formatDate(transaction.date)}</Table.Cell>
                                          <Table.Cell className={`${getTextColor('expense')} items-center content-center py-1 px-3 justify-end text-xs md:text-base`}><span className='flex items-center content-center justify-end pr-5'>{formatCurrency(transaction.amount)}</span></Table.Cell>
                                        </Table.Row>
                                        ))}
                                        <TableRow  className={`bg-white dark:border-gray-700 dark:bg-gray-800 transition-all duration-500 ease-in-out overflow-hidden ${expandedRows === 'OutFasum'? 'max-h-screen opacity-100': 'max-h-0 opacity-0'}`}>
                                            <Table.Cell colSpan={3} className={`${getTextColor('expense')} py-1 px-4  md:px-3  text-xs md:text-base`}>
                                            <span className='flex items-center content-center justify-end'>
                                              <span className="mb-2 font-semibold">
                                                <a href={`/cashflow?period=${selectedPeriod}`}>Lihat semua <GrFormNextLink className='inline'/></a>
                                                </span>
                                            </span>
                                              
                                            </Table.Cell>
                                        </TableRow>
                                      </>
                                    )
                                  }
                                  </>
                                  
                                )}

                                {transactions.OutFasos.length > 0 && (
                                  <>
                                  <Table.Row 
                                    className={`bg-white dark:border-gray-700 dark:bg-gray-800 cursor-pointer`}
                                    onClick={() => handleExpandRow('OutFasos')}>
                                      <Table.Cell colSpan="2" className={`text-red-500  pt-1 px-4  pb-2 md:px-5 text-xs md:text-base font-medium`}>
                                        Fasilitas Sosial
                                      </Table.Cell>
                                      <Table.Cell className={`text-red-500 flex items-center content-center justify-end  py-1 px-3 text-xs md:text-base font-medium`}>
                                        <span className='pr-1' >-</span>
                                        <span>{formatCurrency(transactions.totalOutFasos)}</span>
                                        <span className='pl-1'>{expandedRows === 'OutFasos' ? <IoChevronUpSharp /> : <IoChevronDownSharp />}</span>
                                      </Table.Cell>
                                  </Table.Row>
                                  {
                                    expandedRows === 'OutFasos' && (
                                      <>
                                      {transactions.OutFasos.map((transaction, index) => (
                                          <Table.Row key={index} className={`bg-white dark:border-gray-700 dark:bg-gray-800 transition-all duration-500 ease-in-out overflow-hidden ${expandedRows === 'OutFasos'? 'max-h-screen opacity-100': 'max-h-0 opacity-0'}`}>
                                          <Table.Cell className={`${getTextColor('expense')}  py-1 px-4 md:py-2  md:px-5 text-xs md:text-base`}>
                                          <span className='flex items-center content-center'>
                                            {/* <span>{getTypeIcon('expense')} </span> */}
                                            <span className="">{transaction.description}</span>
                                          </span>
                                            
                                          </Table.Cell>
                                          <Table.Cell className={`${getTextColor('expense')} items-center content-center py-1 px-3 text-xs md:text-base`}>{formatDate(transaction.date)}</Table.Cell>
                                          <Table.Cell className={`${getTextColor('expense')} items-center content-center py-1 px-3 justify-end text-xs md:text-base`}><span className='flex items-center content-center justify-end pr-5'>{formatCurrency(transaction.amount)}</span></Table.Cell>
                                        </Table.Row>
                                        ))}
                                        <TableRow  className={`bg-white dark:border-gray-700 dark:bg-gray-800 transition-all duration-500 ease-in-out overflow-hidden ${expandedRows === 'OutFasos'? 'max-h-screen opacity-100': 'max-h-0 opacity-0'}`}>
                                            <Table.Cell colSpan={3} className={`${getTextColor('expense')} py-1 px-4  md:px-3  text-xs md:text-base`}>
                                            <span className='flex items-center content-center justify-end'>
                                              <span className="mb-2 font-semibold">
                                                <a href={`/cashflow?period=${selectedPeriod}`}>Lihat semua <GrFormNextLink className='inline'/></a>
                                                </span>
                                            </span>
                                              
                                            </Table.Cell>
                                        </TableRow>
                                      </>
                                    )
                                  }
                                  </>
                                  
                                )}

                                {transactions.OutOther.length > 0 && (
                                  <>
                                  <Table.Row 
                                    className={`bg-white dark:border-gray-700 dark:bg-gray-800 cursor-pointer`}
                                    onClick={() => handleExpandRow('OutOther')}>
                                      <Table.Cell colSpan="2" className={`text-red-500  pt-1 px-4  pb-2 md:px-5 text-xs md:text-base font-medium`}>
                                       Lain-Lain
                                      </Table.Cell>
                                      <Table.Cell className={`text-red-500 flex items-center content-center justify-end  py-1 px-3 text-xs md:text-base font-medium`}>
                                        <span className='pr-1' >-</span>
                                        <span>{formatCurrency(transactions.totalOutOther)}</span>
                                        <span className='pl-1'>{expandedRows === 'OutOther' ? <IoChevronUpSharp /> : <IoChevronDownSharp />}</span>
                                      </Table.Cell>
                                  </Table.Row>
                                  {
                                    expandedRows === 'OutOther' && (
                                      <>
                                      {transactions.OutOther.map((transaction, index) => (
                                          <Table.Row key={index} className={`bg-white dark:border-gray-700 dark:bg-gray-800 transition-all duration-500 ease-in-out overflow-hidden ${expandedRows === 'OutOther'? 'max-h-screen opacity-100': 'max-h-0 opacity-0'}`}>
                                          <Table.Cell className={`${getTextColor('expense')}  py-1 px-4 md:py-2  md:px-5 text-xs md:text-base`}>
                                          <span className='flex items-center content-center'>
                                            {/* <span>{getTypeIcon('expense')} </span> */}
                                            <span className="">{transaction.description}</span>
                                          </span>
                                            
                                          </Table.Cell>
                                          <Table.Cell className={`${getTextColor('expense')} items-center content-center py-1 px-3 text-xs md:text-base`}>{formatDate(transaction.date)}</Table.Cell>
                                          <Table.Cell className={`${getTextColor('expense')} items-center content-center py-1 px-3 justify-end text-xs md:text-base`}><span className='flex items-center content-center justify-end pr-5'>{formatCurrency(transaction.amount)}</span></Table.Cell>
                                        </Table.Row>
                                        ))}
                                        <TableRow  className={`bg-white dark:border-gray-700 dark:bg-gray-800 transition-all duration-500 ease-in-out overflow-hidden ${expandedRows === 'OutOther'? 'max-h-screen opacity-100': 'max-h-0 opacity-0'}`}>
                                            <Table.Cell colSpan={3} className={`${getTextColor('expense')} py-1 px-4  md:px-3  text-xs md:text-base`}>
                                            <span className='flex items-center content-center justify-end'>
                                              <span className="mb-2 font-semibold">
                                                <a href={`/cashflow?period=${selectedPeriod}`}>Lihat semua <GrFormNextLink className='inline'/></a>
                                                </span>
                                            </span>
                                              
                                            </Table.Cell>
                                        </TableRow>
                                      </>
                                    )
                                  }
                                  </>
                                  
                                )}

                                
                            </React.Fragment>
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
                <Button size='xs' as={Link}  href={`/cashflow?period=${selectedPeriod}`} className=''><span className='flex items-center content-center'>Lihat semua arus kas</span><GrFormNextLink  className='w-5 h-5'/></Button>
              </div>
              </>
            )}
        </Card>
    </CustomThemeProviderSecond>
    
    </>
  );
}

export const getServerSideProps = async (context) => {
    try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/transactions/all`, {
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