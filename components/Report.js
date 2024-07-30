// pages/home.js
import {useSession ,getSession} from 'next-auth/react';
import { useEffect,useState } from 'react';
import axios from 'axios';
import { useRequireAuth } from '../utils/authUtils'; 
import Spinner from './Spinner';
import CustomThemeProviderSecond from './CustomThemeSecond';
import CustomThemeProvider from './CustomTheme';
import { Card, Button, Table } from 'flowbite-react';
import { GrMoney } from "react-icons/gr";
import {FaRegArrowAltCircleDown, FaRegArrowAltCircleUp } from 'react-icons/fa';
import { GiReceiveMoney } from "react-icons/gi";
import { HiHome } from "react-icons/hi";

import Select from 'react-select';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment';
import 'moment/locale/id';
moment.locale('id');
import MonthOptions from './MonthOptions';

const Report = ({ initialTransaction }) =>  {
  const { useAuthRedirect } = useRequireAuth(['admin', 'editor', 'superadmin']);
  useAuthRedirect();
  const [loading, setLoading] = useState(true);
  const { data: session, status } = useSession();
  const [transactions, setTransactions] = useState([initialTransaction]);
  const [reTransactions, setReTransactions] = useState([initialTransaction]);
  const [totalBalance, setTotalBalance] = useState(null);
  const [totalIncome, setTotalIncome] = useState(null);
  const [totalExpense, setTotalExpense] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState(moment().format('YYYY-MM')); // Format YYYY-MM moment().format('YYYY-MM')
  const [monthlyBalances, setMonthlyBalances] = useState([]);
  const [totalIncomePeriod, setTotalIncomePeriod] = useState(0);
  const [totalExpensePeriod, setTotalExpensePeriod] = useState(0);
  const [totalHousesPaid, setTotalHousesPaid] = useState(0);
  const [totalHouses, setTotalHouses] = useState(0);
  const [lastUpdate, setLastUpdate] = useState();

  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount);
  };

  const fetchTransactions = async () => {
    try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/transactions/all`, {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
            },
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
        console.error('Error fetching houses data:', error);
        setLoading(false);
    }
  };

  const fetchTotalBalance = async () => {
    try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/transactions/balance`, {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
            },
        });
       // console.log(response.data)
        setTotalBalance(response.data.totalBalance);
        setTotalIncome(response.data.totalIncome);
        setTotalExpense(response.data.totalExpense);
        setLoading(false);
    } catch (error) {
        console.error('Error fetching total balance:', error);
        setLoading(false);
    }
  };

  const fetchMonthlyBalances = async () => {
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
  };

  const fetchMonthlyPaid = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/houses/fee`, {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
          params: {
            period: selectedPeriod
        }
      });
     // console.log(res.data)
      setTotalHousesPaid(res.data.total_houses_paid);
      setTotalHouses(res.data.total);
    } catch (error) {
        console.error('Error fetching houses data:', error);
        setLoading(false);
    }
  };


  const [relatedMonths, setRelatedMonths] = useState({
    value: moment().format('YYYY-MM'),
    label: moment().format('MMMM YYYY')
  });
  
  const handleMonthChange = (selectedOption) => {
    setSelectedPeriod(selectedOption.value);
  };


  useEffect(() => {
    // Set nilai bulan saat ini saat komponen pertama kali dimuat
    const currentMonthOption = MonthOptions().find(
      (option) => option.value === moment().format('YYYY-MM')
    );
    setRelatedMonths(currentMonthOption);
  }, []);

  useEffect(() => {
    if (session) {
        fetchTransactions();
        fetchTotalBalance();
        fetchMonthlyPaid();
        fetchMonthlyBalances();
    }

  }, [session, status,selectedPeriod]);
  


  const getTypeIcon = (type) => {
    switch (type) {
      case 'income':
        return <FaRegArrowAltCircleDown  className="text-green-500 h-4 w-4 md:h-5 md:w-5 " />;
      case 'expense':
        return <FaRegArrowAltCircleUp  className="text-red-500 h-4 w-4 md:h-5 md:w-5 " />;
      case 'ipl':
        return <FaRegArrowAltCircleDown  className="text-green-500  h-4 w-4 md:h-5 md:w-5 " />;
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
        return "text-green-500";
      default:
        return null;
    }
  };

  

  if (loading) {
    return <Spinner />;
  }

  return (
    <>
    <CustomThemeProvider>
          <Card className='mb-5'>
            <div className='flex flex-col lg:flex-row justify-between gap-3'>
              <div className='flex gap-3 border p-3'>
                <Button className='items-center'>
                  <GrMoney className="h-7 w-7" />
                </Button>
                <div>
                <h2 className='md:text-2xl text-lg font-bold '>{formatCurrency(totalBalance)}</h2>
                <h3 className="md:text-base text-sm font-light text-gray-500 dark:text-gray-400">Saldo Total</h3>
                </div>
              </div>
             <div className='flex lg:flex-row gap-4 justify-start'>
                <div className='flex gap-3 border p-3'>
                    <Button className='items-center hidden lg:block'>
                      <GrMoney className="h-7 w-7" />
                    </Button>
                    <div>
                    <h2 className='md:text-2xl text-lg font-bold text-green-500 '>{formatCurrency(totalIncome)}</h2>
                    <h3 className="md:text-base text-sm font-light text-gray-500 dark:text-gray-400">Total Pemasukan</h3>
                    </div>
                </div>
                <div className='flex gap-3 border p-3'>
                    <Button className='items-center hidden lg:block'>
                      <GrMoney className="h-7 w-7" />
                    </Button>
                    <div>
                    <h2 className='md:text-2xl text-lg font-bold text-red-500 '>{formatCurrency(totalExpense)}</h2>
                    <h3 className="md:text-base text-sm font-light text-gray-500 dark:text-gray-400">Total Pengaluaran</h3>
                    </div>
                </div>

             </div>
            </div>
          </Card>
    </CustomThemeProvider>
        
    <CustomThemeProviderSecond>
        <Card>
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
                <h3 className='font-bold text-sm md:text-xl flex items-start'><span><HiHome className="h-5 w-5  md:h-7 md:w-7 mr-2" /></span><span>IPL</span></h3>
                <span className='font-semibold text-sm md:text-lg'>{`${totalHousesPaid} / ${totalHouses} Rumah`}</span>
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
            <div className="overflow-x-auto">
                <Table striped>
                    <Table.Head className='' >
                        <Table.HeadCell className='py-2 px-2 md:py-3 md:px-3 bg-cyan-600 text-white'>Keterangan</Table.HeadCell>
                        <Table.HeadCell className='py-2 px-2 md:py-3 md:px-3 bg-cyan-600 text-white'>Tanggal</Table.HeadCell>
                        <Table.HeadCell className='py-2 px-2 md:py-3 md:px-3 bg-cyan-600 text-white '>Nominal</Table.HeadCell>
                    </Table.Head>
                    <Table.Body className="divide-y">
                    {transactions && transactions.length > 0 && transactions[0] !== undefined ? (
                        transactions.map((transaction, index) => (
                            <Table.Row key={index} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                               
                                <Table.Cell className={`${getTextColor(transaction.transaction_type)} py-2 px-2 md:py-3 md:px-3 text-xs md:text-base`}>
                                    <span className='flex items-start'>
                                    <span>{getTypeIcon(transaction.transaction_type)} </span>
                                    <span className="ml-2">{transaction.description}</span>
                                    </span>
                                </Table.Cell>
                                <Table.Cell className={`${getTextColor(transaction.transaction_type)} items-start content-start py-2 px-2 md:py-3 md:px-3 text-xs md:text-base`}>
                                    {moment(transaction.date, 'DD MMM YYYY').format('DD/MM/YY')}
                                </Table.Cell>
                                <Table.Cell className={`${getTextColor(transaction.transaction_type)} items-start content-start  py-2 px-2 md:py-3 md:px-3 text-xs md:text-base`}>
                                    {formatCurrency(transaction.amount)}
                                </Table.Cell>
                            </Table.Row>
                        ))
                        ) : (
                        <Table.Row>
                            <Table.Cell colSpan="3" className="text-center">Data tidak tersedia</Table.Cell>
                        </Table.Row>
                    )}

                    
                    
                    </Table.Body>
                </Table>
            </div>
        </Card>
    </CustomThemeProviderSecond>
    </>
  );
}

export const getServerSideProps = async (context) => {
    const session = await getSession(context);
    
    if (!session) {
        return {
            redirect: {
                destination: '/',
                permanent: false,
            },
        };
    }
  
    try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/transactions/all`, {
            headers: {
                Authorization: `Bearer ${session.accessToken}`,
            },
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