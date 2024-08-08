// pages/home.js
import {getSession} from 'next-auth/react';
import { useEffect,useState,useCallback } from 'react';
import axios from 'axios';

import Spinner from './Spinner';
import CustomThemeProviderSecond from './CustomThemeSecond';
import { Card, Table,Badge } from 'flowbite-react';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment';
import 'moment/locale/id';
moment.locale('id');

import { IoBookmark } from "react-icons/io5";
import { IoPrism } from "react-icons/io5";
import { HiHome } from "react-icons/hi";
import { GrMoney } from "react-icons/gr";

const Outstanding = ({ initialHousesPaid }) =>  {
  const [loading, setLoading] = useState(true);
  const [dataOutStanding, setDataOutStanding] = useState([initialHousesPaid]);
  const [totalHouses, setTotalHouses] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  
  const offset = 0;
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount);
  };
  

  const fetchOutstanding = useCallback( async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/houses/tbd`, {
      });
      //console.log(res.data)
     setDataOutStanding(res.data.data);
     setTotalHouses(res.data.total);
     setTotalAmount(res.data.total_amount)
     setLoading(false);
    } catch (error) {
        console.error('Error fetching houses data:', error);
        setLoading(false);
    }
  },[]);

  useEffect(() => {
    fetchOutstanding();

  }, [fetchOutstanding]);


  if (loading) {
    return <Spinner />;
  }

  return (
    <>
    <CustomThemeProviderSecond>
      <div className='flex gap-1 md:gap-4 justify-start flex-row mb-4'>
        <div className='bg-green-700 text-white w-1/2 py-2 px-4 flex flex-col gap-1 rounded-md shadow-md'>
          <h3 className='font-bold text-sm md:text-xl flex flex-col lg:flex-row  items-start lg:items-center content-center'>
            <span className='flex'>
              <span><HiHome className="h-5 w-5  md:h-7 md:w-7 mr-1 lg:mr-2" /></span>
              <span>Rumah</span>
            </span>
          </h3>
          <span className='font-semibold text-sm md:text-lg'>{totalHouses} Unit</span>
        </div>
        <div className='bg-blue-700 text-white w-1/2 py-2 px-4 flex flex-col gap-1 rounded-md shadow-md'>
          <h3 className='font-bold text-sm md:text-xl flex items-start'>
            <span><GrMoney className="h-5 w-5  md:h-7 md:w-7 mr-2" /></span>
            <span>Nominal</span>
          </h3>
          <span className='font-semibold text-xs md:text-lg'>{formatCurrency(totalAmount)}</span>
        </div>
      </div>
           
      <div className="overflow-x-auto">
        <Table striped>
            <Table.Head className='' >
                <Table.HeadCell className='py-2 px-2 md:py-3 md:px-3 bg-cyan-600 text-white w-4'>No</Table.HeadCell>
                <Table.HeadCell className='py-2 px-2 md:py-3 md:px-3 bg-cyan-600 text-white w-7'>No Rumah</Table.HeadCell>
                <Table.HeadCell className='py-2 px-2 md:py-3 md:px-3 bg-cyan-600 text-white'>Periode</Table.HeadCell>
                <Table.HeadCell className='py-2 px-2 md:py-3 md:px-3 bg-cyan-600 text-white w-4'>Total</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
            {dataOutStanding && dataOutStanding.length > 0 && dataOutStanding[0] !== undefined ? (
                dataOutStanding.map((data, index) => (
                    <Table.Row key={index} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                        <Table.Cell className={`py-2 px-2 md:py-3 md:px-3 text-xs md:text-base`}>
                        {offset + index + 1}
                        </Table.Cell>

                        <Table.Cell className={` py-2 px-2 md:py-3 md:px-3 text-xs md:text-base`}>
                          <span className="">{data.house}</span>
                        </Table.Cell>
                        <Table.Cell className={`py-2 px-2 md:py-3 md:px-3 text-xs md:text-base`}>
                          <span className="flex flex-wrap gap-2">
                            {data.periods.map((period, subindex) => (
                            <Badge key={subindex} color="success">
                              {moment(period, 'YYYY-MM').format('MMMM YYYY')}
                              {/* {subindex < data.periods.length - 1 ? ', ' : ''} */}
                            </Badge>
                            ))}
                          </span>
                        </Table.Cell>

                        <Table.Cell className={` py-2 px-2 md:py-3 md:px-3 text-xs md:text-base `}>
                          {formatCurrency(data.total_fee)}
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
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/houses/outstanding`, {
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

export default Outstanding;