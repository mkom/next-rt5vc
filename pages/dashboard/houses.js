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
import CustomThemeProviderSecond from '../../components/CustomThemeSecond';


const ITEMS_PER_PAGE = 20;

const Houses = ({ initialHouses }) => {
  const { useAuthRedirect } = useRequireAuth(['admin', 'editor', 'superadmin']);
  useAuthRedirect();
  const { data: session, status } = useSession();
  const [houses, setHouses] = useState([initialHouses]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState(moment().format('YYYY-MM')); // Format YYYY-MM moment().format('YYYY-MM')
  const [monthly ,setMonthly] = useState([]);
  const [editData, setEditData] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleMonthChange = (selectedOption) => {
    setSelectedPeriod(selectedOption.value);
    setCurrentPage(0);
   // console.log(Houses);

  };


  const fetchHouses = useCallback (async () => {
    if (session) {
        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/houses/all`, {
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

  const group = [
    { value: '', label: 'Semua Zona' },
    { value: 'E1 Ganjil', label: 'E1 Ganjil' },
    { value: 'E1 Genap - E2 Ganjil', label: 'E1 Genap - E2 Ganjil' },
    { value: 'E2 Genap - E3 Ganjil', label: 'E2 Genap - E3 Ganjil' },
    { value: 'E3 Genap - E5', label: 'E3 Genap - E3A Ganjil - E5' },
    { value: 'E3A Genap - E8', label: 'E3A Genap - E8' },
  ]

  const statusHouses = [
    { value: '', label: 'Semua Status' },
    { value: 'Isi', label: 'Isi' },
    { value: 'Kosong', label: 'Kosong' },
    { value: 'Weekend', label: 'Weekend' },
  ]

  const handleGroupChange = (selectedOption) => {
    setSelectedGroup(selectedOption.value);
    setCurrentPage(0);
   
  };

  const handleStatusChange = (selectedOption) => {
    setSelectedStatus(selectedOption.value);
    setCurrentPage(0);
  };

  const filteredHouses = Array.isArray(houses)
  ? houses.filter(house => {
      const searchTermLower = searchTerm.toLowerCase();
      const selectedGroupLower = selectedGroup.toLowerCase();

      return (
        (searchTermLower === '' || (
          house?.resident_name?.toLowerCase().includes(searchTermLower) ||
          house?.house_id?.toLowerCase().includes(searchTermLower)
        )) &&
        (selectedGroupLower === '' || house?.group?.toLowerCase() === selectedGroupLower) &&
        (selectedStatus === '' || house.monthly_status.find(status => status.month === selectedPeriod)?.status === selectedStatus)
      );
    })
  : [];

  const offset = currentPage * ITEMS_PER_PAGE;
  const currentPageData = filteredHouses.slice(offset, offset + ITEMS_PER_PAGE);

  const getTypeIcon = (status) => {
    switch (status) {
      case true:
        return <IoCheckmarkDoneCircleSharp  className="text-green-700 h-6 w-6 " />;
      case false:
        return <IoCloseCircle  className="text-red-700 h-6 w-6 " />;
      default:
        return null;
    }
  };

  const handleEditClick = (house) => {
    setEditData(house);
    setIsDrawerOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData({...editData, [name]: value });
   // console.log(editData)
    
  };
  
  const handleEditStatus = (month, newStatus, newMandatoryIpl, newMandatoryRt) => {
   // console.log(newStatus)
    const updatedMonthlyStatus = editData.monthly_status.map((status) => {
      if (status.month === month) {
        return { ...status, status: newStatus, mandatory_ipl: newMandatoryIpl, mandatory_rt: newMandatoryRt };
      }
      return status;
    });
    setEditData({ ...editData, monthly_status: updatedMonthlyStatus });

   // console.log(updatedMonthlyStatus)
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

  const monthlyStatusCount = houses.reduce((acc, house) => {
    const month = house.monthly_status?.find((status) => status.month === selectedPeriod)?.month;
    if (month) {
      acc[month] = acc[month] || { Isi: 0, Kosong: 0, Weekend: 0 };
      if (house.monthly_status?.find((status) => status.month === selectedPeriod)?.status === 'Isi') {
        acc[month].Isi++;
      } else if (house.monthly_status?.find((status) => status.month === selectedPeriod)?.status === 'Kosong') {
        acc[month].Kosong++;
      } else if (house.monthly_status?.find((status) => status.month === selectedPeriod)?.status === 'Weekend') {
        acc[month].Weekend++;
      }
    }
    return acc;
  }, {});

  


  if (loading) {
    return <Spinner />;
  }

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
              className='bg-gray-50 w-full'
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
                            <Table.Cell className='py-1 px-1 text-center  w-20'>{monthlyStatusCount[selectedPeriod]?.Isi || 0}</Table.Cell>
                            <Table.Cell className='py-1 px-1 w-24'>IPL + KAS</Table.Cell>
                        </Table.Row>
                        <Table.Row className="">
                            <Table.Cell className='py-1 px-1  w-28'>Weekend</Table.Cell>
                            <Table.Cell className='py-1 px-1 text-center  w-20'>{monthlyStatusCount[selectedPeriod]?.Weekend || 0}</Table.Cell>
                            <Table.Cell className='py-1 px-1 w-24'>KAS</Table.Cell>
                        </Table.Row>
                        <Table.Row className="">
                            <Table.Cell className='py-1 px-1  w-28'>Kosong</Table.Cell>
                            <Table.Cell className='py-1 px-1 text-center  w-20'>{monthlyStatusCount[selectedPeriod]?.Kosong || 0}</Table.Cell>
                            <Table.Cell className='py-1 px-1 w-24'>-</Table.Cell>
                        </Table.Row>
                    </Table.Body>
                </Table>

                
            </div>

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

            <Select
              id="group"
              options={group}
              value={group.find(option => option.value === selectedGroup)}
              onChange={handleGroupChange}
              placeholder="Zona"
              className='bg-gray-50  rounded-md w-full md:w-1/3'
              
            />

            <Select
              id="status"
              options={statusHouses}
              value={statusHouses.find(option => option.value === selectedStatus)}
              onChange={handleStatusChange}
              placeholder="Status"
              className='bg-gray-50  rounded-md w-full md:w-1/3'
              
            />
            
            </CustomThemeProviderSecond>

            </div>

            <div className='overflow-x-auto mt-5'>
                <table>
                    <thead className='bg-gray-50 border-b-2 group/head text-xs uppercase text-gray-700'>
                        <tr>
                            <th rowSpan={2}  className='py-1 px-2 text-left'>No</th>
                            <th rowSpan={2} className='py-1 px-2 text-left '>Rumah</th>
                            <th rowSpan={2} className='py-1 px-2 text-left w-1/4'>Nama</th>
                            <th rowSpan={2} className='py-1 px-2 text-left  w-1/6'>Status</th>
                            <th colSpan={2}  className='py-1 px-2 text-center w-1/3'>Iuran Wajib</th>
                            <th rowSpan={2} className='py-1 px-2 w-1/3 text-left'>Edit</th>
                        </tr>
                        <tr>
                            <th className='pt-0 pb-1 px-2 text-center '>IPL</th>
                            <th className='pt-0 pb-1 px-2  text-center '>Kas</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y border-b text-xs">
                    {currentPageData.map((house, index) => (  
                        <tr key={index} className="bg-white ">
                            <td className="py-2 px-2 ">{offset + index + 1}</td>
                            <td className="py-2 px-2">{house.house_id}</td>
                            <td className="py-2 px-2 ">{house.resident_name}</td>
                            <td className="py-2 px-2  ">
                              {house.monthly_status.find((status) => status.month === selectedPeriod)?.status}
                            </td>
                            <td className="py-2 px-2 ">
                              <div className='flex justify-center items-center content-center h-full'>
                                {getTypeIcon(house.monthly_status.find((status) => status.month === selectedPeriod)?.mandatory_ipl)}
                              </div>
                            </td>
                            <td className="py-2 px-2 ">
                            <div className='flex justify-center items-center content-center h-full'>
                                {getTypeIcon(house.monthly_status.find((status) => status.month === selectedPeriod)?.mandatory_rt)}
                              </div>
                            </td>
                            <td className="py-2 px-2 ">
                              <Button.Group className=''>
                              {/* <Button color="gray" size="xs" className=''>Detail</Button> */}
                              <Button color="gray" size="xs" className=' rounded-md' onClick={() => handleEditClick(house)}>Edit</Button>
                              {/* <Button color="gray" size="xs" className=''>Hapus</Button> */}
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
                    <label className="block mb-2 text-sm font-medium text-gray-700">Nominal IPL</label>
                      <TextInput
                          name="Ipl_fee"
                          value={editData?.Ipl_fee || ''}
                          onChange={handleInputChange}
                          className="mb-4"
                      />
                    <label className="block mb-2 text-sm font-medium text-gray-700">Nominal Kas</label>
                      <TextInput
                          name="Rt_fee"
                          value={editData?.Rt_fee || ''}
                          onChange={handleInputChange}
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

export default Houses;