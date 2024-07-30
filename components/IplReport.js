// pages/home.js
import { signIn, signOut, useSession ,getSession} from 'next-auth/react';
import { useEffect,useState,useCallback } from 'react';
import axios from 'axios';
import { useRequireAuth } from '../utils/authUtils'; 
import Spinner from './Spinner';
import CustomThemeProviderSecond from './CustomThemeSecond';
import { Card, Button, Table } from 'flowbite-react';
import { IoCloseCircle } from "react-icons/io5";
import { IoCheckmarkDoneCircleSharp } from "react-icons/io5";
import { IoBookmark } from "react-icons/io5";
import { IoPrism } from "react-icons/io5";
import { HiHome } from "react-icons/hi";
import { GrMoney } from "react-icons/gr";

import Select from 'react-select';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment';
import 'moment/locale/id';
moment.locale('id');

import MonthOptions from './MonthOptions';

const IplReport = ({ initialHousesPaid }) =>  {
  const { useAuthRedirect } = useRequireAuth(['admin', 'editor', 'superadmin','user']);
  useAuthRedirect();
  const [loading, setLoading] = useState(true);
  const { data: session, status } = useSession();
  const [selectedPeriod, setSelectedPeriod] = useState(moment().format('YYYY-MM')); // Format YYYY-MM moment().format('YYYY-MM')
  const [monthlyPaid, setMonthlyPain] = useState([initialHousesPaid]);
  const [totalHousesPaid, setTotalHousesPaid] = useState(0);
  const [totalHouses, setTotalHouses] = useState(0);
  const [totalPaid, setTotalPaid] = useState(0);
  const [monthly ,setMonthly] = useState([]);

  const offset = 0;
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount);
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
     setMonthlyPain(res.data.data);
     setTotalPaid(res.data.total_paid);
     setTotalHousesPaid(res.data.total_houses_paid);
     setTotalHouses(res.data.total);
     setMonthly(res.data.data);

     setLoading(false);
    } catch (error) {
        console.error('Error fetching houses data:', error);
        setLoading(false);
    }
  };

  const fetchMonthly = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/houses/fee`, {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          }
      });
   // console.log(res.data.data)
     setMonthly(res.data.data);

     setLoading(false);
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
        fetchMonthlyPaid();
        fetchMonthly();
    }

  }, [session, status,selectedPeriod]);


  const getTypeIcon = (status) => {
    switch (status) {
      case 'Lunas':
        return <IoCheckmarkDoneCircleSharp  className="text-green-700 h-6 w-6 " />;
      case 'Belum Bayar':
        return <IoCloseCircle  className="text-red-700 h-6 w-6 " />;
      case 'Bayar Sebagian':
      return <IoPrism  className="text-orange-700 h-6 w-6 " />;  
      case 'TBD':
        return <IoBookmark  className="text-yellow-700  h-6 w-6 " />;
      default:
        return null;
    }
  };

 // console.log(monthlyPaid)
  

  if (loading) {
    return <Spinner />;
  }

  return (
    <>
    <CustomThemeProviderSecond>
        <Card>
            <div className='flex items-center justify-start gap-4 mb-2 mt-3 bg-cyan-700 rounded-md p-3 '>
                <div>
                    <span className='font-semibold text-white'>PERIODE</span>
                </div>
                <Select
                    id="relatedMonths"
                    options={MonthOptions(monthly)}
                    value={MonthOptions(monthly).find(option => option.value === selectedPeriod)}
                    onChange={handleMonthChange}
                    placeholder="Pilih bulan"
                    className='bg-gray-50 rounded w-full md:w-1/3'
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

            <div className='flex gap-1 md:gap-4 justify-start flex-row mb-4'>
            
                <Card className='bg-green-700 text-white w-1/2'>
                <h3 className='font-bold text-sm md:text-xl flex items-start'><span><HiHome className="h-5 w-5  md:h-7 md:w-7 mr-2" /></span><span>IPL</span></h3>
                <span className='font-semibold text-sm md:text-lg'>{`${totalHousesPaid} / ${totalHouses} Rumah`}</span>
                </Card>
                <Card className='bg-blue-700 text-white w-1/2'>
                <h3 className='font-bold text-sm md:text-xl flex items-start'><span><GrMoney className="h-5 w-5  md:h-7 md:w-7 mr-2" /></span><span>Nominal</span></h3>
                <span className='font-semibold text-xs md:text-lg'>{formatCurrency(totalPaid)}</span>
                </Card>
              
            </div>
           
            <div className="overflow-x-auto">
                <Table striped>
                    <Table.Head className='' >
                        <Table.HeadCell className='py-2 px-4 md:py-3 md:px-3 bg-cyan-600 text-white w-8'>No</Table.HeadCell>
                        <Table.HeadCell className='py-2 px-4 md:py-3 md:px-3 bg-cyan-600 text-white'>No Rumah</Table.HeadCell>
                        <Table.HeadCell className='py-2 px-4 md:py-3 md:px-3 bg-cyan-600 text-white'>Status</Table.HeadCell>
                        <Table.HeadCell className='py-2 px-4 md:py-3 md:px-3 bg-cyan-600 text-white'>Tanggal</Table.HeadCell>
                    </Table.Head>
                    <Table.Body className="divide-y">
                    {monthlyPaid && monthlyPaid.length > 0 && monthlyPaid[0] !== undefined ? (
                        monthlyPaid.map((monthly, index) => (
                            <Table.Row key={index} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                               <Table.Cell className={` py-2 px-4 md:py-3 md:px-3 text-xs md:text-base`}>
                               {offset + index + 1}
                                </Table.Cell>

                                <Table.Cell className={` py-2 px-4 md:py-3 md:px-3 text-xs md:text-base`}>
                                  <span className="">{monthly.house_id}</span>
                                </Table.Cell>
                                <Table.Cell className={` py-2 px-4 md:py-3 md:px-3 text-xs md:text-base`}>
                                  <span>{getTypeIcon(monthly.monthly_fees[0].status)} </span>
                                </Table.Cell>

                                <Table.Cell className={` py-2 px-4 md:py-3 md:px-3 text-xs md:text-base`}>
                                  {(monthly.monthly_fees[0].transaction_date ? moment(monthly.monthly_fees[0].transaction_date).format('DD/MM/YY') : '-')}
                                </Table.Cell>
                                
                            </Table.Row>
                        ))
                        ) : (
                        <Table.Row>
                            <Table.Cell colSpan="4" className="text-center">Data tidak tersedia</Table.Cell>
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
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/houses/fee`, {
            headers: {
                Authorization: `Bearer ${session.accessToken}`,
            },
        });
        return {
            props: {
              initialHousesPaid: res.data.data,
            },
        };
    } catch (error) {
        console.error('Error fetching tra data:', error);
        return {
            props: {
              initialHousesPaid: [],
            },
        };
    }
  };

export default IplReport;