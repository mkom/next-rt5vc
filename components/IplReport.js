// pages/home.js
import {useSession ,getSession} from 'next-auth/react';
import { useEffect,useState,useCallback } from 'react';
import axios from 'axios';

import Spinner from './Spinner';
import CustomThemeProviderSecond from './CustomThemeSecond';
import { Card, Button, Table,Alert,Badge } from 'flowbite-react';
import { IoCloseCircle } from "react-icons/io5";
import { IoCheckmarkDoneCircleSharp } from "react-icons/io5";
import { IoBookmark } from "react-icons/io5";
import { IoPrism } from "react-icons/io5";
import { HiHome } from "react-icons/hi";
import { GrMoney } from "react-icons/gr";
import { HiInformationCircle } from "react-icons/hi";

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
  const [monthlyPaid, setMonthlyPaid] = useState([initialHousesPaid]);
  const [totalHousesPaid, setTotalHousesPaid] = useState(0);
  const [totalHouses, setTotalHouses] = useState(0);
  const [totalPaid, setTotalPaid] = useState(0);
  const [monthly ,setMonthly] = useState([]);
  const [percentage, setPercentage] = useState(0);
  const [tbd, setTbd] = useState(0);
  const [lunas, setLunas] = useState(0);
  const [blm, setBlm] = useState(0);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [skeleten, setSkeleton] = useState(true);

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

  const fetchIpl = useCallback( async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/ipl/`, {
          
          params: {
            period: selectedPeriod,
            group: selectedGroup
        }
      });
      //console.log(res.data)
      setMonthlyPaid(res.data.data);
      setTotalHouses(res.data.data.length);
      setTotalHousesPaid(res.data.total_done)
      setTotalPaid(res.data.total_nominal);
      setPercentage(res.data.percentage_paid);
      setTbd(res.data.total_pgyb);
      setLunas(res.data.total_lunas);
      setBlm(res.data.total_belum_bayar);

      setLoading(false);
      setSkeleton(false);
    } catch (error) {
        console.error('Error fetching houses data:', error);
        setLoading(false);
        setSkeleton(false);
    }
  },[selectedPeriod,selectedGroup])


  const [relatedMonths, setRelatedMonths] = useState({
    value: moment().format('YYYY-MM'),
    label: moment().format('MMMM YYYY')
  });
  
  const handleMonthChange = (selectedOption) => {
    setSkeleton(true);
    setSelectedPeriod(selectedOption.value);
    setTotalHousesPaid(0);
    setPercentage(0);
  };

  const handleGroupChange = (selectedOption) => {
    setSkeleton(true);
    setSelectedGroup(selectedOption.value)
  };

 
  useEffect(() => {
    // Set nilai bulan saat ini saat komponen pertama kali dimuat
    const currentMonthOption = MonthOptions().find(
      (option) => option.value === moment().format('YYYY-MM')
    );
    setRelatedMonths(currentMonthOption);
  }, []);

  useEffect(() => {
    fetchIpl();
   // fetchMonthly();

  }, [selectedPeriod,selectedGroup,fetchIpl]);


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

  const group = [
    { value: '', label: 'Semua' },
    { value: 'E1 Ganjil', label: 'E1 Ganjil' },
    { value: 'E1 Genap - E2 Ganjil', label: 'E1 Genap - E2 Ganjil' },
    { value: 'E2 Genap - E3 Ganjil', label: 'E2 Genap - E3 Ganjil' },
    { value: 'E3 Genap - E5', label: 'E3 Genap - E3A Ganjil - E5' },
    { value: 'E3A Genap - E8', label: 'E3A Genap - E8' },
  ]
  

  if (loading) {
    return <Spinner />;
  }

  return (
    <>
    <CustomThemeProviderSecond>
      <div className='flex items-center justify-between gap-4 mb-2 mt-3 bg-cyan-700 rounded-md p-3 '>
          <div className='w-2/4'>
              <span className='font-semibold text-white'>PERIODE</span>
              <Select
              id="relatedMonths"
              options={MonthOptions(monthly)}
              value={MonthOptions(monthly).find(option => option.value === selectedPeriod)}
              onChange={handleMonthChange}
              placeholder="Pilih bulan"
              className='bg-gray-50 rounded w-full'
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
          <div  className='w-2/4'>
          <span className='font-semibold text-white'>Zona</span>
          <Select
              id="group"
              options={group}
              value={group.find(option => option.value === selectedGroup)}
              onChange={handleGroupChange}
              placeholder="Semua"
              className='bg-gray-50 rounded w-full '
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
          

      </div>

      {skeleten ? (
        <div className=' '>
          <div className='w-full animate-pulse flex gap-1 md:gap-4 justify-start flex-row mb-4'>
          <Card className='bg-gray-200 text-white w-1/2'>
            <h3 className='font-bold text-sm md:text-xl flex flex-col lg:flex-row  items-start lg:items-center content-center'>
              <span className='flex '>
                <span className='text-xs lg:text-sm font-normal flex items-center bg-gray-400 w-32 h-2'></span>
              </span>
              
            </h3>
            <span className='font-semibold text-sm md:text-lg bg-gray-400 w-8 h-2'></span>
          </Card>
          <Card className='bg-gray-200 text-white w-1/2'>
          <h3 className='font-bold text-sm md:text-xl flex items-start'>
            <span className='flex '>
              <span className='text-xs lg:text-sm font-normal flex items-center bg-gray-400 w-32 h-2'></span>
            </span>
          </h3>
          <span className='font-semibold text-sm md:text-lg bg-gray-400 w-8 h-2'></span>
          </Card>
          </div>

          <div className='animate-pulse'>
            <Button.Group className='mb-4'>
            <Button color="gray" size="xs" className='w-16'><IoCheckmarkDoneCircleSharp className="text-gray-400 mr-1 h-5 w-5" /></Button>
            <Button color="gray" size="xs" className='w-16'><IoBookmark className="text-gray-400 mr-1 h-5 w-5" /></Button>
            <Button color="gray" size="xs" className='w-16'><IoCloseCircle className="text-gray-400 mr-1 h-5 w-5" /></Button>
            </Button.Group>
          </div>   
          <div className="overflow-x-auto">
        <Table striped>
            <Table.Head className='' >
                <Table.HeadCell className='py-2 px-2 md:text-base md:py-3 md:px-3 bg-cyan-600 text-white w-2'>No</Table.HeadCell>
                <Table.HeadCell className='py-2 px-2 md:text-base md:py-3 md:px-3 bg-cyan-600 text-white'>No Rumah</Table.HeadCell>
                <Table.HeadCell className='py-2 px-2 md:text-base md:py-3 md:px-3 bg-cyan-600 text-white'>Status</Table.HeadCell>
                <Table.HeadCell className='py-2 px-2 md:text-base md:py-3 md:px-3 bg-cyan-600 text-white'>Tanggal</Table.HeadCell>
                <Table.HeadCell className='py-2 px-2 md:text-base md:py-3 md:px-3 bg-cyan-600 text-white'>Ket.</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
            <Table.Row>
                <Table.Cell colSpan="5" className="text-center w-full py-3 mt-2 animate-pulse bg-gray-200"></Table.Cell>
                </Table.Row>
            </Table.Body>
        </Table>
        </div>
        </div> 
      ): (
        <div>
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
  
          <div>
            <Button.Group className='mb-4'>
            <Button color="gray" size="xs" className='p-1 cst-btn'><IoCheckmarkDoneCircleSharp className="text-green-700 sm:mr-1 h-5 w-5" /> <span className='text-xs'>Lunas</span> <span color="info" className='sm:ml-1 text-xs'>/ {lunas}</span></Button>
            <Button color="gray" size="xs" className='p-1 cst-btn'><IoBookmark className="text-green-400 sm:mr-1 h-5 w-5" /><span className='text-xs' >PGYB</span> <span color="info" className='sm:ml-1 text-xs'>/ {tbd}</span></Button>
            <Button color="gray" size="xs" className='p-1 cst-btn'><IoCloseCircle className="text-red-700 sm:mr-1 h-5 w-5" /><span className='text-xs'>Belum Bayar</span> <span color="info" className='sm:ml-1 text-xs'>/ {blm}</span></Button>
            </Button.Group>
          </div>      
          <div className="overflow-x-auto">
            <Table striped >
                <Table.Head className='' >
                    <Table.HeadCell className='py-1 px-1 md:text-base md:py-2 md:px-2 bg-cyan-600 text-white w-2'>No</Table.HeadCell>
                    <Table.HeadCell className='py-1 px-1 md:text-base md:py-2 md:px-2 bg-cyan-600 text-white'>No Rumah</Table.HeadCell>
                    <Table.HeadCell className='py-1 px-1 md:text-base md:py-2 md:px-2 bg-cyan-600 text-white'>Status</Table.HeadCell>
                    <Table.HeadCell className='py-1 px-1 md:text-base md:py-2 md:px-2 bg-cyan-600 text-white'>Tanggal</Table.HeadCell>
                    <Table.HeadCell className='py-1 px-1 md:text-base md:py-2 md:px-2 bg-cyan-600 text-white'>Ket.</Table.HeadCell>
                </Table.Head>
                <Table.Body className="divide-y">
                {monthlyPaid && monthlyPaid.length > 0 && monthlyPaid[0] !== undefined ? (
                    monthlyPaid.map((monthly, index) => (
                        <Table.Row key={index} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                            <Table.Cell className={`py-1 px-1 md:py-2 md:px-2 text-xs md:text-base`}>
                            {offset + index + 1}
                            </Table.Cell>
  
                            <Table.Cell className={`py-1 px-1 md:py-2 md:px-2 text-xs md:text-base`}>
                              <span className=" flex flex-wrap gap-2 item-center align-center">
                                <span>{monthly.house_id}</span>
                               {/* {monthly.occupancy_status !== 'Isi' ? <Badge color="failure" >{monthly.occupancy_status}</Badge> :'' } */}
                               </span>
                            </Table.Cell>
                            <Table.Cell className={`py-1 px-1 md:py-2 md:px-2 text-xs md:text-base`}>
                              <span>{getTypeIcon(monthly.monthly_fees[0].status)} </span>
                            </Table.Cell>
  
                            <Table.Cell className={`py-1 px-1 md:py-2 md:px-2 text-xs md:text-base`}>
                              {(monthly.monthly_fees[0].transaction_date ? formatDate(monthly.monthly_fees[0].transaction_date): '-')}
                            </Table.Cell>
  
                            <Table.Cell className={`py-1 px-1 md:py-2 md:px-2 text-xs md:text-base`}>
                              {(monthly.monthly_fees[0].status === 'TBD' ? 'PGYB': '')}
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
        
          <Alert className='my-10' color='failure' icon={HiInformationCircle}>
            <span className="font-medium">Apabila terdapat atau ditemukan keliruan data bisa hubungi pengurus atau ketua RT 05</span>
          </Alert>
        </div>
      )}
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
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/ipl`, {
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