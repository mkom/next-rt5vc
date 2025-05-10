import { getSession, useSession } from 'next-auth/react';
import { useEffect,useState,useCallback } from 'react';
import axios from 'axios';
import { useRequireAuth } from '../../utils/authUtils.js'; 
import ReactPaginate from 'react-paginate';

import { Button, Badge } from "flowbite-react";
import {TextInput,Drawer} from "flowbite-react";
import Header from '../../components/Header';
import SideMenu from '../../components/dashboard/Sidebar'
import Spinner from '../../components/Spinner';
import { HiOutlineSearch } from "react-icons/hi";
import {FaCalendarCheck } from 'react-icons/fa';
import { FaRegEnvelope } from "react-icons/fa";
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment';
import 'moment/locale/id';
moment.locale('id');
import CustomThemeProviderSecond from '../../components/CustomThemeSecond';
import LetterPreview from '@/components/LetterPreview.js';


const ITEMS_PER_PAGE = 30;

const Bills = ({ initialHouses }) => {
  const { useAuthRedirectDashboard } = useRequireAuth(['admin', 'editor', 'superadmin']);
  useAuthRedirectDashboard();
  const { data: session, status } = useSession();
  const [houses, setHouses] = useState([initialHouses]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [totalHouses, setTotalHouses] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount);
  };

  const fetchHouses = useCallback (async () => {
    if (session) {
        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/houses/outstanding`, {
            });
            const sorted = res.data.data.sort((a, b) => b.total_fee - a.total_fee);
            setHouses(sorted);
            setTotalHouses(res.data.total);
            setTotalAmount(res.data.total_amount)
            setLoading(false);
        } catch (error) {
    
          console.error('Error fetching houses data:', error);
          setLoading(false);
        }
    }
   
  },[session])


  useEffect(() => {
    if (session) {
        fetchHouses();
    }
  }, [session,fetchHouses ]);

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
      return (
        (searchTermLower === '' || (
          house?.resident_name?.toLowerCase().includes(searchTermLower) ||
          house?.house_id?.toLowerCase().includes(searchTermLower)
        )) 
      );
    })
  : [];

  const offset = currentPage * ITEMS_PER_PAGE;
  const currentPageData = filteredHouses.slice(offset, offset + ITEMS_PER_PAGE);


  const handleEditClick = (data) => {
   // setEditData(house);
    setIsDrawerOpen(true);
    setDetailData(data);
  };
  //console.log(detailData);


  if (loading) {
    return <Spinner />;
  }

  return (
    <>
    
    <Header toggleSidebar={toggleSidebar}/>
    <SideMenu isOpen={isSidebarOpen}/>
    <main className='max-w-screen-lg mx-auto h-full'>
      <div className='w-full'>
        <section className='mt-14 px-3 py-5  mb-11'>
            <h1 className='text-xl mb-4 flex font-semibold text-gray-900 sm:text-2xl dark:text-white'>
            <FaCalendarCheck  className="mr-2 h-7 w-7" /> 
            <span>Tagihan Berjalan</span>
            </h1>

            <div className="mb-3 mt-5 flex justify-between content-center items-center gap-3 w-full">
            <CustomThemeProviderSecond>
              <TextInput 
                name="name"
                placeholder="Cari"
                value={searchTerm}
                onChange={handleSearchChange}
                className="mr-2 rounded-md w-full md:w-1/2"
                icon={HiOutlineSearch} 
              />

            
            </CustomThemeProviderSecond>

            </div>

            <div className='overflow-x-auto mt-5'>
                <table className='w-full'>
                    <thead className='bg-gray-50 border-b-2 group/head text-xs uppercase text-gray-700'>
                        <tr className='border-y-2 '>
                        <th colSpan={6} className='p-3 text-right text-base'>Jumlah Keseluruhan: {formatCurrency(totalAmount)}</th>
                        <th  className='py-1 px-2  text-left w-20'></th>
                        </tr>
                        <tr>
                            <th  className='py-1 px-2 text-left w-4'>No</th>
                            <th className='py-1 px-2 text-left w-14'>Rumah</th>
                            <th  className='py-1 px-2 text-left w-28 '>Nama</th> 
                            <th  className='py-1 px-2 text-left w-80'>Periode</th>
                            <th  className='py-1 px-2 text-left w-16 '>Total</th>
                            <th  className='py-1 px-2 text-right w-16 '>Jumlah</th>
                            <th  className='py-1 px-2  text-left w-20'></th>
                        </tr>
                       
                    </thead>
                    <tbody className="divide-y border-b text-xs">
                    {currentPageData.map((house, index) => (  
                        <tr key={index} className="bg-white ">
                            <td className="py-2 px-2 ">{offset + index + 1}</td>
                            <td className="py-2 px-2">{house.house_id}</td>
                            <td className="py-2 px-2 ">{house.resident_name}</td>
                            <td className="py-2 px-2  ">
                              <span className="flex flex-wrap gap-1">
                                {house.periods.map((period, subindex) => {
                                    const status = house.monthly_status.find((status) => status.month === period)?.status;
                                    const badgeColor = status === 'Weekend' ? 'pink' : 'failure';
    
                                    return (
                                    <Badge key={subindex} color={badgeColor} size="xs">
                                        {moment(period, 'YYYY-MM').format('MMMM YYYY')}
                                    </Badge>
                                    );
                                })}
                                </span>
                            </td>
                            <td className="py-2 px-2 ">
                             {house.periods.length} Bulan
                            </td>
                            <td className="py-2 px-2 text-right ">
                             {formatCurrency(house.total_fee)}
                            </td>
                           
                            <td className="py-2 px-2 ">
                              <Button.Group className=''>
                              {/* <Button color="gray" size="xs" className=''>Detail</Button> */}
                              <Button color="gray" size="xs" className='rounded-md' onClick={() => handleEditClick(house)}>Buat Surat</Button>
                              {/* <Button color="gray" size="xs" target='_blank' as={Link} href={`/ipl/${house.house_id.toLowerCase()}`}>Surat</Button> */}
                              </Button.Group>
                              </td>
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
                  forcePage={currentPage === 0 ? 0 : currentPage}
              />
            </nav>

            {detailData && (
            <Drawer className='py-4 px-7 top-0 z-50 w-full ' open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} position="right">
            <Drawer.Header title="Preview" titleIcon={FaRegEnvelope}/>
               <LetterPreview data={detailData}/>
            </Drawer>
            )}

        </section>

      
      </div>
      
      
    </main>
    </>
  );
}

export const getServerSideProps = async (context) => {
  const session = await getSession(context);
  try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/houses/all`, {
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

export default Bills;