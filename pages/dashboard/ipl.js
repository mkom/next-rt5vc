import { getSession, useSession } from 'next-auth/react';
import { useEffect,useState,useCallback } from 'react';
import axios from 'axios';
import { useRequireAuth } from '../../utils/authUtils.js'; 
import ReactPaginate from 'react-paginate';

import { Table } from "flowbite-react";
import { Button } from "flowbite-react";
import {TextInput,Drawer,Dropdown,Alert } from "flowbite-react";
import Header from '../../components/Header';
import SideMenu from '../../components/dashboard/Sidebar'
import Spinner from '../../components/Spinner';
import { HiHome } from "react-icons/hi";
import { HiOutlineSearch } from "react-icons/hi";
import {FaRegEdit,FaEye,FaRegTrashAlt,FaCalendarCheck } from 'react-icons/fa';
import { FaEllipsisH } from "react-icons/fa";
import { IoCloseCircle } from "react-icons/io5";
import { IoCheckmarkDoneCircleSharp } from "react-icons/io5";

import Select from 'react-select';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment';
import 'moment/locale/id';
moment.locale('id');
import MonthOptions from '../../components/MonthOptions.js';


const ITEMS_PER_PAGE = 20;

const Ipl = ({ initialHouses }) => {
  const { useAuthRedirect } = useRequireAuth(['admin', 'editor', 'superadmin']);
  useAuthRedirect();
  const { data: session, status } = useSession();
  const [houses, setHouses] = useState([initialHouses]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState(moment().format('YYYY-MM')); // Format YYYY-MM moment().format('YYYY-MM')
  const [relatedMonths, setRelatedMonths] = useState({
    value: moment().format('YYYY-MM'),
    label: moment().format('MMMM YYYY')
  });
  const [monthly ,setMonthly] = useState([]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

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


  const fetchHouses = useCallback (async () => {
    if (session) {
        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/houses/ipl`, {
                headers: {
                  Authorization: `Bearer ${session.accessToken}`,
                },
            });
            
           // console.log(res.data)
            setHouses(res.data.data);
            setLoading(false);
        } catch (error) {
    
          console.error('Error fetching houses data:', error);
          setLoading(false);
        }
    }
   
  },[selectedPeriod,session])


  useEffect(() => {
    if (session) {
        fetchHouses();
    }
  }, [selectedPeriod,session,fetchHouses ]);

  const handlePageClick = (data) => {
    setCurrentPage(data.selected);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter({ ...filter, [name]: value });
  };  
  
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };


  const filteredHouses = Array.isArray(houses) ? houses.filter(house => 
    (house?.resident_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (house?.house_id?.toLowerCase().includes(searchTerm.toLowerCase()))
  ) :[];

  const offset = currentPage * ITEMS_PER_PAGE;
  const currentPageData = filteredHouses.slice(offset, offset + ITEMS_PER_PAGE);


//   if (loading) {
//     return <Spinner />;
//   }

  return (
    <>
    
    <Header toggleSidebar={toggleSidebar}/>
    <main className='max-w-screen-xl mx-auto'>
      <div className='w-full'>
        <SideMenu isOpen={isSidebarOpen}/>
        <section className='mt-14 px-5 py-5 md:px-8 sm:ml-64'>
            <h1 className='text-xl mb-4 flex font-semibold text-gray-900 sm:text-2xl dark:text-white'>
            <FaCalendarCheck  className="mr-2 h-7 w-7" /> 
            <span>Data Rumah</span>
            </h1>

            <div className='w-2/4'>
              {/* <span className='font-semibol'>PERIODE</span> */}
              <Select
              id="relatedMonths"
              options={MonthOptions(monthly)}
              value={MonthOptions(monthly).find(option => option.value === selectedPeriod)}
              onChange={handleMonthChange}
              placeholder="Pilih bulan"
              className='bg-gray-50 rounded w-full'
            //   styles={{
            //     control: (baseStyles, state) => ({
            //       ...baseStyles,
            //       backgroundColor: '#0e7490',
            //     }),
            //     input: (styles) => ({ ...styles, color: '#fff' }),
            //     placeholder: (styles) => ({ ...styles, color: '#fff' }),
            //     singleValue: (styles, { data }) => ({ ...styles, color: '#fff' }),
            //   }}
            />

            </div>
            <div className="overflow-x-auto mt-5">
                <Table className='w-auto block'>
                    <Table.Head className='border'>
                        <Table.HeadCell className='bg-white py-1 px-1 w-28'>Status</Table.HeadCell>
                        <Table.HeadCell className='bg-white py-1 px-1  w-20'>Jumlah</Table.HeadCell>
                        <Table.HeadCell className='bg-white py-1 px-1 w-24'>Iuran</Table.HeadCell>
                    </Table.Head>
                    <Table.Body className="divide-y border border-t-0">
                        <Table.Row className="">
                            <Table.Cell className='py-1 px-1  w-28'>Isi</Table.Cell>
                            <Table.Cell className='py-1 px-1 text-center  w-20'>0</Table.Cell>
                            <Table.Cell className='py-1 px-1 w-24'>IPL + KAS</Table.Cell>
                        </Table.Row>
                        <Table.Row className="">
                            <Table.Cell className='py-1 px-1  w-28'>Weekend</Table.Cell>
                            <Table.Cell className='py-1 px-1 text-center  w-20'>0</Table.Cell>
                            <Table.Cell className='py-1 px-1 w-24'>KAS</Table.Cell>
                        </Table.Row>
                        <Table.Row className="">
                            <Table.Cell className='py-1 px-1  w-28'>Kosong</Table.Cell>
                            <Table.Cell className='py-1 px-1 text-center  w-20'>0</Table.Cell>
                            <Table.Cell className='py-1 px-1 w-24'>-</Table.Cell>
                        </Table.Row>
                    </Table.Body>
                </Table>
            </div>

            <div className='overflow-x-auto mt-5'>
                <table>
                    <thead className='bg-gray-50 border-b-2 group/head text-xs uppercase text-gray-700'>
                        <tr>
                            <th rowSpan={2}  className='py-1 px-2 text-left border-r'>No</th>
                            <th rowSpan={2} className='py-1 px-2 text-left border-r'>Rumah</th>
                            <th rowSpan={2} className='py-1 px-2 text-left border-r w-1/4'>Nama</th>
                            <th rowSpan={2} className='py-1 px-2 text-left border-r w-1/6'>Status</th>
                            <th colSpan={2}  className='py-1 px-2 border-r border-b text-center w-1/3'>Iuran</th>
                            <th rowSpan={2} className='py-1 px-2 w-1/3 text-left'>Detail</th>
                        </tr>
                        <tr>
                            <th className='pt-0 pb-1 px-2 text-center border-r'>IPL</th>
                            <th className='pt-0 pb-1 px-2  text-center border-r'>Kas</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y border-b text-xs">
                    {currentPageData.map((house, index) => (  
                        <tr key={index} class="bg-white border-b">
                            <td class="py-2 px-2 border-r">{offset + index + 1}</td>
                            <td class="py-2 px-2 border-r">{house.house_id}</td>
                            <td class="py-2 px-2 border-r">{house.resident_name}</td>
                            <td class="py-2 px-2  border-r"></td>
                            <td class="py-2 px-2  border-r"></td>
                            <td class="py-2 px-2  border-r"></td>
                            <td class="py-2 px-2 ">Detail</td>
                        </tr>
                    ))}
                   
                    </tbody>
                   
                </table>
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
                  containerClassName={'pagination flex justify-center -space-x-px text-sm'}
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
              />
            </nav>

        </section>
      </div>
      
      
    </main>
    </>
  );
}

export const getServerSideProps = async (context) => {
    const session = await getSession(context);
    try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/houses/ipl`, {
            headers: {
                Authorization: `Bearer ${session.accessToken}`,
            },
        });
        return {
            props: {
                initialHouses: res.data.data,
            },
        };
    } catch (error) {
        console.error('Error fetching houses data:', error);
        return {
            props: {
                initialHouses: [],
            },
        };
    }
  };

export default Ipl;