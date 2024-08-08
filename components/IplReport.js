// pages/home.js
import {useSession ,getSession} from 'next-auth/react';
import { useEffect,useState,useCallback } from 'react';
import axios from 'axios';

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
  const [loading, setLoading] = useState(true);
  const { data: session, status } = useSession();
  const [selectedPeriod, setSelectedPeriod] = useState(moment().format('YYYY-MM')); // Format YYYY-MM moment().format('YYYY-MM')
  const [monthlyPaid, setMonthlyPain] = useState([initialHousesPaid]);
  const [totalHousesPaid, setTotalHousesPaid] = useState(0);
  const [totalHouses, setTotalHouses] = useState(0);
  const [totalPaid, setTotalPaid] = useState(0);
  const [monthly ,setMonthly] = useState([]);
  const [percentage, setPercentage] = useState(0);

  const offset = 0;
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

  const fetchMonthlyPaid = useCallback( async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/houses/fee`, {
          
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
     setPercentage(res.data.percentage_paid);

     setLoading(false);
    } catch (error) {
        console.error('Error fetching houses data:', error);
        setLoading(false);
    }
  },[selectedPeriod]);

  const fetchMonthly = useCallback( async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/houses/fee`, {
          
      });
   // console.log(res.data.data)
     setMonthly(res.data.data);

     setLoading(false);
    } catch (error) {
        console.error('Error fetching houses data:', error);
        setLoading(false);
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
    fetchMonthlyPaid();
    fetchMonthly();

  }, [selectedPeriod,fetchMonthlyPaid,fetchMonthly]);


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

 // console.log(monthlyPaid)
  

  if (loading) {
    return <Spinner />;
  }

  return (
    <>
    <CustomThemeProviderSecond>
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
        <h3 className='font-bold text-sm md:text-xl flex flex-col lg:flex-row  items-start lg:items-center content-center'>
          <span className='flex '>
            <span><HiHome className="h-5 w-5  md:h-7 md:w-7 mr-1 lg:mr-2" /></span>
            <span>IPL</span>
            <span className='ml-1 text-xs lg:text-sm font-normal lg:ml-3 flex items-center'>{`${totalHousesPaid} / ${totalHouses} Rumah`}</span>
          </span>
          
          </h3>
        <span className='font-semibold text-sm md:text-lg'>{percentage}</span>
        </Card>
        <Card className='bg-blue-700 text-white w-1/2'>
        <h3 className='font-bold text-sm md:text-xl flex items-start'><span><GrMoney className="h-5 w-5  md:h-7 md:w-7 mr-2" /></span><span>Nominal</span></h3>
        <span className='font-semibold text-xs md:text-lg'>{formatCurrency(totalPaid)}</span>
        </Card>
        
      </div>
      
      <div className="overflow-x-auto">
        <Table striped>
            <Table.Head className='' >
                <Table.HeadCell className='py-2 px-2 md:py-3 md:px-3 bg-cyan-600 text-white w-2'>No</Table.HeadCell>
                <Table.HeadCell className='py-2 px-2 md:py-3 md:px-3 bg-cyan-600 text-white'>No Rumah</Table.HeadCell>
                <Table.HeadCell className='py-2 px-2 md:py-3 md:px-3 bg-cyan-600 text-white'>Status</Table.HeadCell>
                <Table.HeadCell className='py-2 px-2 md:py-3 md:px-3 bg-cyan-600 text-white'>Tanggal</Table.HeadCell>
                <Table.HeadCell className='py-2 px-2 md:py-3 md:px-3 bg-cyan-600 text-white'>Ket.</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
            {monthlyPaid && monthlyPaid.length > 0 && monthlyPaid[0] !== undefined ? (
                monthlyPaid.map((monthly, index) => (
                    <Table.Row key={index} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                        <Table.Cell className={`py-2 px-2 md:py-3 md:px-3 text-xs md:text-base`}>
                        {offset + index + 1}
                        </Table.Cell>

                        <Table.Cell className={` py-2 px-2 md:py-3 md:px-3 text-xs md:text-base`}>
                          <span className="">{monthly.house_id}</span>
                        </Table.Cell>
                        <Table.Cell className={` py-2 px-2 md:py-3 md:px-3 text-xs md:text-base`}>
                          <span>{getTypeIcon(monthly.monthly_fees[0].status)} </span>
                        </Table.Cell>

                        <Table.Cell className={` py-2 px-2 md:py-3 md:px-3 text-xs md:text-base`}>
                          {(monthly.monthly_fees[0].transaction_date ? formatDate(monthly.monthly_fees[0].transaction_date): '-')}
                        </Table.Cell>

                        <Table.Cell className={`py-2 px-2 md:py-3 md:px-3text-xs md:text-base`}>
                          {(monthly.monthly_fees[0].status === 'TBD' ? 'TBD': '')}
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
    </CustomThemeProviderSecond>
    </>
  );
}

export const getServerSideProps = async (context) => {
    const session = await getSession(context);
    
    // if (!session) {
    //     return {
    //         redirect: {
    //             destination: '/',
    //             permanent: false,
    //         },
    //     };
    // }
  
    try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/houses/fee`, {
            // headers: {
            //     Authorization: `Bearer ${session.accessToken}`,
            // },
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