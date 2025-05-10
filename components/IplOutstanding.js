// pages/home.js
import {getSession} from 'next-auth/react';
import React, { useRef } from "react";
import { useEffect,useState,useCallback } from 'react';
import axios from 'axios';
import Spinner from './Spinner';
import CustomThemeProviderSecond from './CustomThemeSecond';
import { Button, Table,Badge } from 'flowbite-react';
import Link from 'next/link';
import { GrFormNextLink } from "react-icons/gr";
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment';
import 'moment/locale/id';
moment.locale('id');

import { HiHome } from "react-icons/hi";
import { GrMoney } from "react-icons/gr";

import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts'; // Import font PDFMake

// Ensure PDFMake uses the correct font
//pdfMake.vfs = pdfFonts.pdfMake.vfs;

const Tbd = ({ initialHousesPaid }) =>  {
  const [loading, setLoading] = useState(true);
  const [dataOutStanding, setDataOutStanding] = useState([initialHousesPaid]);
  const [totalHouses, setTotalHouses] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const printRef = useRef();

  // Mendapatkan tanggal dan jam saat ini
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = currentDate.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });
  
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
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/houses/outstanding`, {
      });
      //\console.log(res.data)
      const sorted = res.data.data.sort((a, b) => b.total_fee - a.total_fee);
     setDataOutStanding(sorted);
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

  
  const generatePDF = () => {
    const docDefinition = {
      content: [
        {
          text: 'Outstanding IPL RT 005 RW 011 Report ',
          style: 'header'
        },
        {
          text: `${formattedDate} ${formattedTime}`,
          style: 'content',
        },
        {
          columns: [
            {
              text: `Total Rumah: ${totalHouses}`,
              style: 'subheader'
            },
            {
              text: `Jumlah: ${formatCurrency(totalAmount)}`,
              style: 'subheader'
            }
          ]
        },
        {
          table: {
            widths: ['auto', 'auto', '*', 'auto', 'auto'],
            body: [
              ['No', 'No Rumah', 'Nama', 'Total','Jumlah'],
              ...dataOutStanding.map((data, index) => [
                offset + index + 1,
                data.house_id,
                data.resident_name,
                data.periods.length +' bulan',
                {
                  text: formatCurrency(data.total_fee),
                  alignment: 'right',  // Menambahkan alignment ke kanan
                },
              ]),
            ]
          },
          layout: 'lightHorizontalLines'
        }
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 5]
        },
        content: { 
          fontSize: 12 ,
          margin: [0, 0, 0, 10]
        },
        subheader: {
          fontSize: 14,
          italics: true,
          margin: [0, 0, 0, 10]
        }
      }
    };

    pdfMake.createPdf(docDefinition).download('Outstanding_IPL_Report.pdf');
  };
  
  
  
  //  <Button onClick={() => generatePDF("preview")} size='md' className='bg-green-700 '>Download</Button>

  return (
    <>
    <CustomThemeProviderSecond>
      <div ref={printRef}>
        <div className='flex my-6 items-center justify-between'>
          <h1 className='text-xl font-bold text-gray-900  dark:text-white'>OUTSTANDING IPL </h1>
          <Button onClick={generatePDF} size='md' className='bg-green-700 '>Download</Button>
        </div>
        <div className='flex gap-1 md:gap-4 justify-start flex-row mb-4'>
          <div className='bg-green-700 text-white w-1/2 py-2 px-4 flex flex-col gap-1 rounded-md shadow-md'>
            <h3 className='font-bold text-sm md:text-xl flex flex-col lg:flex-row  items-start lg:items-center content-center'>
              <span className='flex'>
                <span><HiHome className="h-5 w-5  md:h-7 md:w-7 mr-1 lg:mr-2" /></span>
                <span>Rumah</span>
              </span>
            </h3>
            <span className='font-semibold text-sm md:text-lg flex items-center'>{totalHouses} Unit</span>
          </div>
          <div className='bg-blue-700 text-white w-1/2 py-2 px-4 flex flex-col gap-1 rounded-md shadow-md'>
            <h3 className='font-bold text-sm md:text-xl flex items-start'>
              <span><GrMoney className="h-5 w-5  md:h-7 md:w-7 mr-2" /></span>
              <span>Jumlah</span>
            </h3>
            <span className='font-semibold text-xs md:text-lg'>{formatCurrency(totalAmount)}</span>
          </div>
        </div>
            
        <div className="overflow-x-auto">
            <Table striped className='block w-full'>
                <Table.Head className='' >
                    <Table.HeadCell className='p-2 md:text-base  bg-cyan-600 text-white '>No</Table.HeadCell>
                    <Table.HeadCell className='p-2 md:text-base  bg-cyan-600 text-white w-7 md:w-28'>No Rumah</Table.HeadCell>
                    <Table.HeadCell className='p-2 md:text-base  bg-cyan-600 text-white w-7 md:w-28'>Nama</Table.HeadCell>
                    <Table.HeadCell className='p-2 md:text-base  bg-cyan-600 text-white'>Periode</Table.HeadCell>
                    {/* <Table.HeadCell className='py-2 px-2 md:text-base md:py-3 md:px-3 bg-cyan-600 text-white'>Status</Table.HeadCell> */}
                    <Table.HeadCell className='p-2 md:text-base  bg-cyan-600 text-white'>Total</Table.HeadCell>
                </Table.Head>
                <Table.Body className="divide-y">
                {dataOutStanding && dataOutStanding.length > 0 && dataOutStanding[0] !== undefined ? (
                    dataOutStanding.map((data, index) => (
                        <Table.Row key={index} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                            <Table.Cell className={`p-2  text-xs md:text-base`}>
                            {offset + index + 1}
                            </Table.Cell>

                            <Table.Cell className={`p-2  text-xs md:text-base`}>
                              <span className="">{data.house_id}</span>
                            </Table.Cell>
                            <Table.Cell className={`p-2  text-xs md:text-base`}>
                              <span className="">{data.resident_name}</span>
                            </Table.Cell>
                            <Table.Cell className={`p-2  text-xs md:text-base`}>
                              <span className="flex flex-wrap gap-1">
                                {data.periods.map((period, subindex) => {
                                  const status = data.monthly_status.find((status) => status.month === period)?.status;
                                  const badgeColor = status === 'Weekend' ? 'pink' : 'failure';

                                  return (
                                    <Badge key={subindex} color={badgeColor} size="xs">
                                      {moment(period, 'YYYY-MM').format('MMMM YYYY')}
                                    </Badge>
                                  );
                                })}
                              </span>
                            </Table.Cell>
                            {/* <Table.Cell className={` py-2 px-2 md:py-3 md:px-3 text-xs md:text-base `}>
                              {data.occupancy_status}
                            </Table.Cell> */}

                            <Table.Cell className={`p-2  text-xs md:text-base`}>
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

      </div>
      
      <div className='flex items-center content-center justify-between mt-3'>
        <Button size='xs' as={Link} href="/ipl" className='bg-green-700 '>Data IPL<GrFormNextLink  className='w-4 h-4'/></Button>
      </div>
    </CustomThemeProviderSecond>
    </>
  );
}

export const getServerSideProps = async (context) => {
    const session = await getSession(context);
    try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/houses/outstanding`, {
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

export default Tbd;