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
import Link from 'next/link';

import Select from 'react-select';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment';
import 'moment/locale/id';
moment.locale('id');
import CustomThemeProviderSecond from '../../components/CustomThemeSecond';


const ITEMS_PER_PAGE = 20;

const Users = ({ initialUser }) => {
  const { useAuthRedirect } = useRequireAuth(['admin', 'editor', 'superadmin']);
  useAuthRedirect();
  const { data: session, status } = useSession();
  const [houses, setHouses] = useState([initialUser]);
  const [users, setUsers] = useState([initialUser]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editData, setEditData] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
 

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };


  const fetchUser = useCallback (async () => {
    if (session) {
        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users/list`, {
                headers: {
                  Authorization: `Bearer ${session.accessToken}`,
                },
            });
            
           // console.log(res.data)
            setUsers(res.data.data);
            setLoading(false);
        } catch (error) {
          console.error('Error fetching user data:', error);
          setLoading(false);
        }
    }
   
  },[session])

  useEffect(() => {
    if (session) {
        fetchUser();
    }
  }, [session,fetchUser ]);

  const handlePageClick = (data) => {
    setCurrentPage(data.selected);
  };

  const handleSearchChange = (event) => {
    setCurrentPage(0);
    setSearchTerm(event.target.value);
  };

  const filteredUsers = Array.isArray(users)
  ? users.filter(user => {
      const searchTermLower = searchTerm.toLowerCase();

      return (
        (searchTermLower === '' || (
            user?.username?.toLowerCase().includes(searchTermLower) ||
            user?.name?.toLowerCase().includes(searchTermLower) ||
            user?.email?.toLowerCase().includes(searchTermLower)
        ))
      );
    })
  : [];



  const offset = currentPage * ITEMS_PER_PAGE;
  const currentPageData = filteredUsers.slice(offset, offset + ITEMS_PER_PAGE);


  const handleEditClick = (house) => {
    setEditData(house);
    setIsDrawerOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData({...editData, [name]: value });
   // console.log(editData)
    
  };
  
  const handleSaveChanges = async () => {
    try {
     // console.log(editData); 
        const res = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/houses/update/${editData._id}`, editData, {
            headers: {
                Authorization: `Bearer ${session.accessToken}`,
            },
            params: {
              period: selectedPeriod,
              zona: selectedGroup
          }
        });
        //console.log(res.data)
        setHouses(houses.map(house => house._id === editData._id ? {...house,...res.data.data}  : house));
        setIsDrawerOpen(false);
      
    } catch (error) {
      
        console.error('Error updating house data:', error);
    }
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <>
    
    <Header toggleSidebar={toggleSidebar}/>
    <SideMenu isOpen={isSidebarOpen}/>
    <main className='max-w-screen-md mx-auto'>
      <div className='w-full'>
        <section className='mt-14 px-3 py-5  mb-11'>
            <h1 className='text-xl mb-4 flex font-semibold text-gray-900 sm:text-2xl dark:text-white'>
            <FaCalendarCheck  className="mr-2 h-7 w-7" /> 
            <span>User</span>
            </h1>

            <div className="mb-3 mt-5 flex justify-between content-center items-center gap-3 w-full">
            <CustomThemeProviderSecond>
              <TextInput 
                name="name"
                placeholder="Cari"
                value={searchTerm}
                onChange={handleSearchChange}
                className="mr-2 rounded-md w-full md:w-1/3"
                icon={HiOutlineSearch} 
              />
            
            </CustomThemeProviderSecond>

            </div>

            <div className='overflow-x-auto mt-5'>
                <table>
                    <thead className='bg-gray-50 border-b-2 group/head text-xs uppercase text-gray-700'>
                        <tr>
                            <th  className='py-1 px-2 text-left'>No</th>
                            <th className='py-1 px-2 text-left w-1/4'>Nama</th>
                            <th  className='py-1 px-2 text-left  w-1/4'>Whatsapp</th>
                            <th  className='py-1 px-2 text-left  w-1/3'>Email</th>
                            <th  className='py-1 px-2 w-1/3 text-left'>Edit</th>
                        </tr>
                       
                    </thead>
                    <tbody className="divide-y border-b text-xs">
                    {currentPageData.map((user, index) => (  
                        <tr key={index} className="bg-white ">
                            <td className="py-2 px-2 ">{offset + index + 1}</td>
                            <td className="py-2 px-2 ">
                                {user.name? user.name : user.username}
                            </td>
                            <td className="py-2 px-2  ">
                              {user.whatsapp_number}
                            </td>
                            <td className="py-2 px-2 ">
                                {user.email}
                            </td>
                            
                            <td className="py-2 px-2 ">
                              <Button.Group className=''>
                              {/* <Button color="gray" size="xs" className=''>Detail</Button> */}
                              <Button color="gray" size="xs"  onClick={() => handleEditClick(house)}>Edit</Button>
                              {/* <Button color="gray" size="xs" target='_blank' as={Link} href={`/ipl/${house.house_id.toLowerCase()}`}>History</Button> */}
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
                  pageCount={Math.ceil(filteredUsers.length / ITEMS_PER_PAGE)}
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

        </section>

        {editData && (
          <Drawer className='py-4 px-7 top-0 z-50 w-full md:w-2/4' open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} position="right">
          <Drawer.Header title="Edit Data Rumah" titleIcon={HiHome}/>
            <Drawer.Items>
                <div>
                  <span></span>
                    <label className="block mb-2 text-sm font-medium text-gray-700">Rumah</label>
                    <TextInput
                        name="house_id"
                        value={editData?.house_id || ''}
                        onChange={handleInputChange}
                        className="mb-4"
                    />

                    <label className="block mb-2 text-sm font-medium text-gray-700">Grup</label>
         
                      <select
                        id="group"
                        name="group"
                        value={editData?.group || ''}
                        onChange={handleInputChange}
                        className="mb-4 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      >
                          <option value="-">-</option>
                          <option value="E1 Ganjil">E1 Ganjil</option>
                          <option value="E1 Genap - E2 Ganjil">E1 Genap - E2 Ganjil</option>
                          <option value="E2 Genap - E3 Ganjil">E2 Genap - E3 Ganjil</option>
                          <option value="E3 Genap - E5">E3 Genap - E3A Ganjil - E5</option>
                          <option value="E3A Genap - E8">E3A Genap - E8</option>
                      </select>

                    <label className="block mb-2 text-sm font-medium text-gray-700">Nama</label>
                    <TextInput
                        name="resident_name"
                        value={editData?.resident_name || ''}
                        onChange={handleInputChange}
                        className="mb-4"
                    />
                    
                    <label className="block mb-2 text-sm font-medium text-gray-700">Status</label>
                      <select
                        id="monthly_status"
                        name="monthly_status"
                        value={Array.isArray(editData.monthly_status) ? editData.monthly_status.find((status) => status.month === selectedPeriod)?.status : ''}
                        onChange={(e) => handleEditStatus(selectedPeriod, e.target.value, editData.monthly_status.find((status) => status.month === selectedPeriod)?.mandatory_ipl, editData.monthly_status.find((status) => status.month === selectedPeriod)?.mandatory_rt)}
                        className="mb-4 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      >
                          <option value="Isi">Isi</option>
                          <option value="Kosong">Kosong</option>
                          <option value="Weekend">Weekend</option>
                          <option value="Monthly">Monthly</option>
                          <option value="Tidak ada kontak">Tidak ada kontak</option>
                      </select>
                    <label className="block mb-2 text-sm font-medium text-gray-700">Wajib IPL</label>
                     <select
                        id="mandatory_ipl"
                        name="mandatory_ipl"
                        value={Array.isArray(editData.monthly_status) ? editData.monthly_status.find((status) => status.month === selectedPeriod)?.mandatory_ipl : ''}
                        onChange={(e) => handleEditStatus(selectedPeriod, editData.monthly_status.find((status) => status.month === selectedPeriod)?.status, e.target.value, editData.monthly_status.find((status) => status.month === selectedPeriod)?.mandatory_rt)}
                        className="mb-4 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      >
                          <option value="true">Ya</option>
                          <option value="false">Tidak</option>
                      </select>  

                    <label className="block mb-2 text-sm font-medium text-gray-700">Wajib KAs</label>
                     <select
                        id="mandatory_rt"
                        name="mandatory_rt"
                        value={Array.isArray(editData.monthly_status) ? editData.monthly_status.find((status) => status.month === selectedPeriod)?.mandatory_rt : ''}
                        onChange={(e) => handleEditStatus(selectedPeriod, editData.monthly_status.find((status) => status.month === selectedPeriod)?.status, editData.monthly_status.find((status) => status.month === selectedPeriod)?.mandatory_ipl, e.target.value)}
                        className="mb-4 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      >
                          <option value="true">Ya</option>
                          <option value="false">Tidak</option>
                      </select>  

                    <label className="block mb-2 text-sm font-medium text-gray-700">Nominal Iuran</label>

                    <TextInput
                        name="fee"
                        value={editData.monthly_fees.find((status) => status.month === selectedPeriod)?.fee || ''}
                        onChange={handleFeeChange}
                        type="number"
                        className="mb-4"
                    />
                    
                   
                </div>
                <div className='flex'>
                <Button className='mr-4' size='md' onClick={handleSaveChanges}>Simpan</Button>
                <Button color="gray" size='md' onClick={() => setIsDrawerOpen(false)}>Batal</Button>
                </div>
            </Drawer.Items>
            
          </Drawer>
        )}
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
            initialUser: res.data.data,
          },
      };
  } catch (error) {
      console.error('Error fetching houses data:', error);
      return {
          props: {
              initialUser: [],
          },
      };
  }
};

export default Users;