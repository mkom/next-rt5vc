import { useEffect,useState,useCallback } from 'react';
import axios from 'axios';

import Spinner from './Spinner';
import CustomThemeProviderSecond from './CustomThemeSecond';
import { Card, Button, Table,Alert } from 'flowbite-react';
import { IoCloseCircle } from "react-icons/io5";
import { IoCheckmarkDoneCircleSharp } from "react-icons/io5";
import { IoBookmark } from "react-icons/io5";
import { IoPrism } from "react-icons/io5";
import { HiInformationCircle } from "react-icons/hi";
import { GrFormNextLink } from "react-icons/gr";
import Link from 'next/link';
import { HiHome } from "react-icons/hi";
import { TbCirclePercentage } from "react-icons/tb";
import { AiFillLike } from "react-icons/ai";

import Select from 'react-select';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment';
import 'moment/locale/id';
moment.locale('id');
import ReactPaginate from 'react-paginate';
import MonthOptions from './MonthOptions';
const ITEMS_PER_PAGE = 20;

const IplReport = ({ initialHouses }) =>  {
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState(moment().format('YYYY-MM'));
  const [houses, setHouses] = useState([initialHouses]);
  const [monthly ,setMonthly] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [skeleten, setSkeleton] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const formatDate = (dateString) => {
    const date = new Date(dateString);
  
    // Extract day, month, and year
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const year = String(date.getFullYear()).slice(-2); // Get last two digits of the year
  
    // Format the date as DD/MM/YY
    return `${day}/${month}/${year}`;
  };

  const handleMonthChange = (selectedOption) => {
    setSelectedPeriod(selectedOption.value);
    setCurrentPage(0);
  };

  const fetchHouses = useCallback (async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/ipl2`, {
      });
      
     //console.log(res.data)
      setHouses(res.data.data);
      setLoading(false);
      setSkeleton(false);
  } catch (error) {
    console.error('Error fetching houses data:', error);
    setLoading(false);
    setSkeleton(false);
  }
   
  },[])
  
  useEffect(() => {
    fetchHouses();
  }, [selectedPeriod,selectedGroup,fetchHouses]);

  const group = [
    { value: '', label: 'Semua' },
    { value: 'E1 Ganjil', label: 'E1 Ganjil' },
    { value: 'E1 Genap - E2 Ganjil', label: 'E1 Genap - E2 Ganjil' },
    { value: 'E2 Genap - E3 Ganjil', label: 'E2 Genap - E3 Ganjil' },
    { value: 'E3 Genap - E5', label: 'E3 Genap - E3A Ganjil - E5' },
    { value: 'E3A Genap - E8', label: 'E3A Genap - E8' },
  ]
  
  const statusHouses = [
    { value: '', label: 'Semua' },
    { value: 'Lunas', label: 'Lunas' },
    { value: 'Belum Bayar', label: 'Belum Bayar' },
    { value: 'TBD', label: 'PGYB' },
  ]

  const handleGroupChange = (selectedOption) => {
    //setSkeleton(true);
    setSelectedGroup(selectedOption.value);
    setCurrentPage(0);
   
  };

  const handleStatusChange = (selectedOption) => {
    //setSkeleton(true);
    setSelectedStatus(selectedOption.value);
    setCurrentPage(0);
  };

  const handlePageClick = (data) => {
    setCurrentPage(data.selected);
  };

  const handleSearchChange = (event) => {
    setCurrentPage(0);
    setSearchTerm(event.target.value);
  };

  const filteredHouses = Array.isArray(houses)
  ? houses.filter(house => {
      const searchTermLower = searchTerm.toLowerCase();
      const selectedGroupLower = selectedGroup.toLowerCase();
      const monthlyStatus =  house && house.monthly_status && house.monthly_status.find(status => status.month === selectedPeriod);

      return (
        (searchTermLower === '' || (
          house?.resident_name?.toLowerCase().includes(searchTermLower) ||
          house?.house_id?.toLowerCase().includes(searchTermLower)
        )) &&
        (selectedGroupLower === '' || house?.group?.toLowerCase() === selectedGroupLower) &&
        (selectedStatus === '' || house.monthly_fees.find(status => status.month === selectedPeriod)?.status === selectedStatus) &&
        ( house && house.monthly_fees?.length > 0 && house.monthly_status?.length > 0) &&
        monthlyStatus && monthlyStatus.status === 'Isi'
      );
    })
  : [];

  const offset = currentPage * ITEMS_PER_PAGE;
  const currentPageData = filteredHouses
  .slice(offset, offset + ITEMS_PER_PAGE);

  const CountHouses = Array.isArray(houses)
  ? houses.filter(house => {
      const searchTermLower = searchTerm.toLowerCase();
      const selectedGroupLower = selectedGroup.toLowerCase();
      const monthlyStatus =  house && house.monthly_status && house.monthly_status.find(status => status.month === selectedPeriod);

      return (
        (searchTermLower === '' || (
          house?.resident_name?.toLowerCase().includes(searchTermLower) ||
          house?.house_id?.toLowerCase().includes(searchTermLower)
        )) &&
        (selectedGroupLower === '' || house?.group?.toLowerCase() === selectedGroupLower) &&
        ( house && house.monthly_fees?.length > 0 && house.monthly_status?.length > 0) &&
        monthlyStatus && monthlyStatus.status === 'Isi'
      );
    })
  : [];

  const monthlyStatusCount = CountHouses.reduce((acc, house) => {
    if (!house || !house.monthly_fees) return acc; // Add this line to skip houses without monthly_fees
  
    const month = house.monthly_fees?.find((status) => status.month === selectedPeriod)?.month;
    if (month) {
      acc[month] = acc[month] || { Lunas: 0, BelumBayar: 0, Tbd: 0 };
      const status = house.monthly_fees.find((status) => status.month === selectedPeriod)?.status;
      if (status === 'Lunas') {
        acc[month].Lunas++;
      } else if (status === 'Belum Bayar') {
        acc[month].BelumBayar++;
      } else if (status === 'TBD') {
        acc[month].Tbd++;
      }
    }
    acc.total = acc.total || 0;
    acc.total++;
    acc.Tertib = acc[month].Lunas +  acc[month].Tbd;
    acc.TertibPercentage = (acc.Tertib / acc.total) * 100;
    return acc;
  }, {});

  
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

  const formatPercentage = (value) => (value || 0).toFixed(2) + '%';

  if (loading) {
    return <Spinner />;
  }

  return (
    <>
    <CustomThemeProviderSecond>
      <div className=' mb-4 mt-3 bg-cyan-700 rounded-md p-3 pb-5'>
          <div className='flex justify-between flex-col md:flex-row  md:items-center md:content-center gap-2'>
            <div className='md:w-1/3'>
                <span className='font-semibold text-white'>Periode</span>
                <Select
                id="relatedMonths"
                options={MonthOptions(monthly)}
                value={MonthOptions(monthly).find(option => option.value === selectedPeriod)}
                onChange={handleMonthChange}
                isSearchable={false}
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
            <div  className='md:w-1/3'>
              <span className='font-semibold text-white'>Zona</span>
              <Select
                id="group"
                options={group}
                value={group.find(option => option.value === selectedGroup)}
                onChange={handleGroupChange}
                isSearchable={false}
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
            <div  className='md:w-1/3'>
              <span className='font-semibold text-white'>Status</span>
              <Select
                id="status"
                options={statusHouses}
                value={statusHouses.find(option => option.value === selectedStatus)}
                onChange={handleStatusChange}
                isSearchable={false}
                placeholder="Status"
                className='bg-gray-50  rounded-md w-full '
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
         
      </div>

      {skeleten ? (
        <div className=' '>
          {/* <div className='w-full animate-pulse flex gap-1 md:gap-4 justify-start flex-row mb-4'>
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
          </div> */}

          <div className='animate-pulse'>
            <Button.Group className='mb-4'>
            <Button color="gray" size="xs" className='w-16'><IoCheckmarkDoneCircleSharp className="text-gray-400 mr-1 h-5 w-5" /></Button>
            <Button color="gray" size="xs" className='w-16'><IoBookmark className="text-gray-400 mr-1 h-5 w-5" /></Button>
            <Button color="gray" size="xs" className='w-16'><IoCloseCircle className="text-gray-400 mr-1 h-5 w-5" /></Button>
            </Button.Group>
          </div>   
          <div className="overflow-x-auto">
            <Table striped className='block' >
                <Table.Head className='' >
                    <Table.HeadCell className='py-2 px-2 md:text-base md:py-3 md:px-3 bg-cyan-600 text-white w-2'>No</Table.HeadCell>
                    <Table.HeadCell className='py-2 px-2 md:text-base md:py-3 md:px-3 bg-cyan-600 text-white w-28'>No Rumah</Table.HeadCell>
                    <Table.HeadCell className='py-2 px-2 md:text-base md:py-3 md:px-3 bg-cyan-600 text-white'>Status</Table.HeadCell>
                    <Table.HeadCell className='py-2 px-2 md:text-base md:py-3 md:px-3 bg-cyan-600 text-white'>Tanggal</Table.HeadCell>
                    <Table.HeadCell className='py-2 px-2 md:text-base md:py-3 md:px-3 bg-cyan-600 text-white  w-40'>Ket.</Table.HeadCell>
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
          
          {/* <div className='flex gap-1 md:gap-4 justify-start flex-row mb-4'>
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

          <div className='flex py-4 items-center content-center justify-between'>
          <Button size='sm' as={Link} href="/outstanding" className='bg-red-700 '>Outstanding<GrFormNextLink  className='w-5 h-5'/></Button>
          </div>
   */}

          
          <div>
            <Button.Group className='mb-2'>
            <Button color="gray" size="xs" className='p-1 cst-btn'><HiHome className="text-green-700 sm:mr-1 h-5 w-5" /> <span className='text-xs'>Wajib IPL</span> <span color="info" className='sm:ml-1 text-xs'>/ {monthlyStatusCount?.total || 0}</span></Button>
            <Button color="gray" size="xs" className='p-1 cst-btn'><AiFillLike  className="text-blue-700 sm:mr-1 h-5 w-5" /><span className='text-xs'>Tertib IPL</span> <span color="info" className='sm:ml-1 text-xs'>/ {monthlyStatusCount?.Tertib || 0}</span></Button>
            <Button color="gray" size="xs" className='p-1 cst-btn'><TbCirclePercentage className="text-blue-700 sm:mr-1 h-5 w-5" /><span className='text-xs' ></span> <span color="info" className='text-xs'>{formatPercentage(monthlyStatusCount?.TertibPercentage)}</span></Button>
            </Button.Group>
          </div>     
          <div>
            <Button.Group className='mb-4'>
            <Button color="gray" size="xs" className='p-1 cst-btn'><IoCheckmarkDoneCircleSharp className="text-green-700 sm:mr-1 h-5 w-5" /> <span className='text-xs'>Lunas</span> <span color="info" className='sm:ml-1 text-xs'>/ {monthlyStatusCount[selectedPeriod]?.Lunas || 0}</span></Button>
            <Button color="gray" size="xs" className='p-1 cst-btn'><IoCloseCircle className="text-red-700 sm:mr-1 h-5 w-5" /><span className='text-xs'>Belum Bayar</span> <span color="info" className='sm:ml-1 text-xs'>/ {monthlyStatusCount[selectedPeriod]?.BelumBayar || 0}</span></Button>
            <Button color="gray" size="xs" className='p-1 cst-btn'><IoBookmark className="text-green-400 sm:mr-1 h-5 w-5" /><span className='text-xs' >PGYB</span> <span color="info" className='sm:ml-1 text-xs'>/ {monthlyStatusCount[selectedPeriod]?.Tbd || 0}</span></Button>
            </Button.Group>
          </div>      
          <div className="overflow-x-auto">
            <Table striped className='block w-full'>
                <Table.Head className='' >
                    <Table.HeadCell className='p-2 md:text-base  bg-cyan-600 text-white w-2'>No</Table.HeadCell>
                    <Table.HeadCell className='p-2 md:text-base  bg-cyan-600 text-white w-32'>No Rumah</Table.HeadCell>
                    <Table.HeadCell className='p-2 md:text-base  bg-cyan-600 text-white text-center w-20'>Status</Table.HeadCell>
                    <Table.HeadCell className='p-2 md:text-base  bg-cyan-600 text-white  w-32'>Tanggal</Table.HeadCell>
                </Table.Head>
                <Table.Body className="divide-y border-b">
                {currentPageData && currentPageData.length > 0? (
                    currentPageData.map((house, index) => (
                        <Table.Row key={index} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                            <Table.Cell className={`p-2  text-xs md:text-base`}>
                            {offset + index + 1}
                            </Table.Cell>
  
                            <Table.Cell className={`p-2  text-xs md:text-base`}>
                              <span className=" flex flex-wrap gap-2 item-center align-center">
                                <span>{house.house_id}</span>
                               {/* {monthly.occupancy_status !== 'Isi' ? <Badge color="failure" >{monthly.occupancy_status}</Badge> :'' } */}
                               </span>
                            </Table.Cell>
                            <Table.Cell className={`p-2  text-xs md:text-base text-center`}>
                              <div className='flex justify-center items-center content-center h-full'>
                                {getTypeIcon(house.monthly_fees.find((status) => status.month === selectedPeriod)?.status)}
                              </div>
                            </Table.Cell>
  
                            <Table.Cell className={`p-2  text-xs md:text-base`}>
                            {
                              house.monthly_fees.find((status) => status.month === selectedPeriod)?.transaction_id?.date
                                ? formatDate(house.monthly_fees.find((status) => status.month === selectedPeriod)?.transaction_id?.date)
                                : '-'
                            }
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
          <nav className='py-6'>
            <ReactPaginate
                  previousLabel={'Previous'}
                  nextLabel={'Next'}
                  breakLabel={'...'}
                  pageCount={Math.ceil(filteredHouses.length / ITEMS_PER_PAGE)}
                  marginPagesDisplayed={2}
                  pageRangeDisplayed={5}
                  onPageChange={handlePageClick}
                  containerClassName={'pagination flex justify-start -space-x-px text-sm'}
                  pageClassName={'page-item'}
                  pageLinkClassName={'flex items-center justify-center px-3 h-8 leading-tight text-gray-500 border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'}
                  previousClassName={'page-item'}
                  previousLinkClassName={'flex items-center justify-center px-3 h-8 leading-tight text-gray-500 border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'}
                  nextClassName={'page-item'}
                  nextLinkClassName={'flex items-center justify-center px-3 h-8 leading-tight text-gray-500  border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'}
                  breakClassName={'page-item'}
                  breakLinkClassName={'flex items-center justify-center px-3 h-8 leading-tight text-gray-500  border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'}
                  activeClassName={'active bg-gray-100'}
                  activeLinkClassName={'bg-gray-100'}
                  forcePage={currentPage === 0 ? 0 : currentPage}
              />
            </nav>

          <div className='flex items-center content-center justify-between mb-3'>
            <Button size='xs' as={Link} href="/outstanding" className='bg-red-700 '>Outstanding<GrFormNextLink  className='w-5 h-5'/></Button>
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
    try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/ipl2`, {
        });
        return {
            props: {
              initialHouses: res.data.data,
            },
        };
    } catch (error) {
        console.error('Error fetching tra data:', error);
        return {
            props: {
              initialHouses: [],
            },
        };
    }
  };

export default IplReport;