// pages/home.js
import { getSession, useSession } from 'next-auth/react';
import { useEffect,useState } from 'react';
import axios from 'axios';
import { useRequireAuth } from '../../utils/authUtils.js'; 
import ReactPaginate from 'react-paginate';

import { Table } from "flowbite-react";
import { Button } from "flowbite-react";
import {TextInput,Drawer,Select,Dropdown,Alert } from "flowbite-react";
import Header from '../../components/Header';
import SideMenu from '../../components/dashboard/Sidebar'
import Spinner from '../../components/Spinner';
import { HiHome } from "react-icons/hi";
import { HiOutlineSearch } from "react-icons/hi";
import {FaRegEdit,FaEye,FaRegTrashAlt } from 'react-icons/fa';
import { FaEllipsisH } from "react-icons/fa";
import { IoCloseCircle } from "react-icons/io5";
import { IoCheckmarkDoneCircleSharp } from "react-icons/io5";

const ITEMS_PER_PAGE = 10;

const Houses = ({ initialHouses }) => {
  const { useAuthRedirect } = useRequireAuth(['admin', 'editor', 'superadmin']);
  useAuthRedirect();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  const { data: session, status } = useSession();
  // /console.log(session)
  //const token = session.accessToken;
  const [houses, setHouses] = useState([initialHouses]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [filter, setFilter] = useState({ name: '', house_id: '' });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');

  

  useEffect(() => {
    if (session) {
        const fetchHouses = async () => {
            try {
                const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/houses/all`, {
                    headers: {
                      Authorization: `Bearer ${session.accessToken}`,
                    },
                });
                //setAlertType('success');
                //setAlertMessage('Data berhasil diupdate');
                //setShowAlert(true);
                handleAlertTimeout(3000);

                setHouses(res.data);
                setLoading(false);
            } catch (error) {
              //setAlertType('failure');
              //setAlertMessage('Gagal mengupdate rumah');
              //setShowAlert(true);
              handleAlertTimeout(3000);
              console.error('Error fetching houses data:', error);
              setLoading(false);
            }
        };

        fetchHouses();
    }
  }, [session, status]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount);
  };

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

  const filteredHouses = houses.filter(house => 
    (house.resident_name && house.resident_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (house.house_id && house.house_id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const offset = currentPage * ITEMS_PER_PAGE;
  const currentPageData = filteredHouses.slice(offset, offset + ITEMS_PER_PAGE);

  const handleEditClick = (house) => {
    setEditData(house);
    setIsDrawerOpen(true);
  };

  const handleSaveChanges = async () => {
    try {
        const res = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/houses/update/${editData._id}`, editData, {
            headers: {
                Authorization: `Bearer ${session.accessToken}`,
            },
        });
        setHouses(houses.map(house => house._id === editData._id ? {...house,...res.data}  : house));
        setIsDrawerOpen(false);
        setAlertType('success');
        setAlertMessage('Data berhasil diupdate');
        setShowAlert(true);
    } catch (error) {
        setAlertType('failure');
        setAlertMessage('Gagal mengupdate rumah');
        setShowAlert(true);
        console.error('Error updating house data:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData({...editData, [name]: value });
    //console.log(value)
    
  };

  // Calculate house status counts
  const statusCounts = houses.reduce((acc, house) => {
    const status = house.occupancy_status || 'Unknown';
    if (!acc[status]) {
        acc[status] = 0;
    }
    acc[status]++;
    return acc;
  }, {});

  const mandatoryFeeCounts = houses.reduce((acc, house) => {
    if (house.mandatory_fee) {
      acc.true++;
    } else {
      acc.false++;
    }
    return acc;
  }, { true: 0, false: 0 });

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

  const handleAlertDismiss = () => {
    handleAlertTimeout(0);
  };

  const handleAlertTimeout = (timeoutDuration) => {
    setTimeout(() => {
      setShowAlert(false);
    }, timeoutDuration);
  };


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
        {showAlert && (
            <Alert className='' color={alertType === 'success' ? 'success' : 'failure'} onDismiss={handleAlertDismiss}>
                <span className="font-medium">{alertMessage}</span>
            </Alert>
        )}
          <h1 className='text-xl mb-4 flex font-semibold text-gray-900 sm:text-2xl dark:text-white'>
            <HiHome  className="mr-2 h-8 w-8" /> 
            <span>Data Rumah</span>
          </h1>
          
          <div className="mb-1">
              <ul className='flex gap-4'>
                  {Object.entries(statusCounts).map(([status, count]) => (
                      <li key={count}>{`${status}: ${count} Rumah`}</li>
                  ))}
              </ul>
          </div>
          <div className="mb-4">
          <p>Wajib IPL: {`${mandatoryFeeCounts.true} Rumah`} </p>
          </div>

          <div className="max-w-sm mb-4">
            <TextInput 
              name="name"
              placeholder="Cari"
              value={searchTerm}
              onChange={handleSearchChange}
              className="mr-2"
              icon={HiOutlineSearch} 
               />
          </div>
          
          <div className='overflow-x-auto '>
            <Table hoverable>
                <Table.Head>
                    <Table.HeadCell className='py-2 px-4 md:py-3 md:px-3'>No</Table.HeadCell>
                    <Table.HeadCell className='py-2 px-4 md:py-3 md:px-3'>Rumah</Table.HeadCell>
                    <Table.HeadCell className='py-2 px-4 md:py-3 md:px-3'>Nama</Table.HeadCell>
                    <Table.HeadCell className='py-2 px-4 md:py-3 md:px-3'>No. WA</Table.HeadCell>
                    <Table.HeadCell className='py-2 px-4 md:py-3 md:px-3'>Status</Table.HeadCell>
                    <Table.HeadCell className='py-2 px-4 md:py-3 md:px-3'>IPL</Table.HeadCell>
                    <Table.HeadCell className='py-2 px-4 md:py-3 md:px-3'>
                        <span className="sr-only">Edit</span>
                    </Table.HeadCell>
                </Table.Head>
                <Table.Body className="divide-y">
                    {currentPageData.map((house, index) => (
                        <Table.Row key={index} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                            <Table.Cell  className="py-2 px-4 md:py-3 md:px- whitespace-nowrap font-medium text-gray-900 dark:text-white">
                                {offset + index + 1}
                            </Table.Cell>
                            <Table.Cell className='py-2 px-4 md:py-3 md:px-'>{house.house_id}</Table.Cell>
                            <Table.Cell  className='py-2 px-4 md:py-3 md:px-'>{house.resident_name}</Table.Cell>
                            <Table.Cell  className='py-2 px-4 md:py-3 md:px-'>{house.whatsapp_number}</Table.Cell>
                            <Table.Cell  className='py-2 px-4 md:py-3 md:px-'>{house.occupancy_status}</Table.Cell>
                            <Table.Cell  className='py-2 px-4 md:py-3 md:px-'>{getTypeIcon(house.mandatory_fee)}</Table.Cell>
                            <Table.Cell className='py-2 px-4 md:py-3 md:px-'>
                                {/* <Button size="sm" onClick={() => handleEditClick(house)}>
                                    <HiPencilAlt  className="md:mr-2 h-4 w-4" />
                                    <span className='hidden md:block'>Edit</span>
                                </Button> */}

                          <Dropdown  className="relative z-50 cursor-pointer" align="right" label="" renderTrigger={() => <span><FaEllipsisH  className="h-4 w-4 cursor-pointer" /></span>}>
                            <Dropdown.Item onClick={() => handleEditClick(house)}><FaRegEdit className='mr-1'/><span>Edit</span></Dropdown.Item>
                            <Dropdown.Item><FaEye className='mr-1'/><span>View</span></Dropdown.Item>
                            <Dropdown.Item  ><FaRegTrashAlt className='mr-1' /><span>Delete</span></Dropdown.Item>
                          </Dropdown>

                            </Table.Cell>
                        </Table.Row>
                    ))}
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
                containerClassName={'pagination flex justify-center -space-x-px text-sm'}
                pageClassName={'page-item'}
                pageLinkClassName={'flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'}
                previousClassName={'page-item'}
                previousLinkClassName={'flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'}
                nextClassName={'page-item'}
                nextLinkClassName={'flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'}
                breakClassName={'page-item'}
                breakLinkClassName={'flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'}
                activeClassName={'active bg-gray-300'}
                activeLinkClassName={'bg-green-300'}
            />
          </nav>
        </section>

        {editData && (
          <Drawer className='pt-16' open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} position="right">
          <Drawer.Header title="Edit Data Rumah" titleIcon={HiHome}/>
            <Drawer.Items>
                <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">Nama</label>
                    <TextInput
                        name="resident_name"
                        value={editData?.resident_name || ''}
                        onChange={handleInputChange}
                        className="mb-4"
                    />
                    <label className="block mb-2 text-sm font-medium text-gray-700">No. Whatsapp</label>
                    <TextInput
                        name="whatsapp_number"
                        type="number"
                        value={editData?.whatsapp_number || ''}
                        onChange={handleInputChange}
                        className="mb-4"
                    />
                    <label className="block mb-2 text-sm font-medium text-gray-700">Status</label>
                      <Select
                        id="occupancy_status"
                        name="occupancy_status"
                        value={editData?.occupancy_status || ''}
                        onChange={handleInputChange}
                        className="mb-4"
                      >
                          <option value="Kosong">Kosong</option>
                          <option value="Isi">Isi</option>
                          <option value="Weekend">Weekend</option>
                          <option value="Tidak ada kontak">Tidak ada kontak</option>
                      </Select>
                    <label className="block mb-2 text-sm font-medium text-gray-700">Wajib IPL</label>
                     <Select
                        id="mandatory_fee"
                        name="mandatory_fee"
                        value={editData.mandatory_fee.toString()}
                        onChange={handleInputChange}
                        className="mb-4"
                      >
                          <option value="true">Ya</option>
                          <option value="false">Tidak</option>
                      </Select>  
                    <label className="block mb-2 text-sm font-medium text-gray-700">Tarif IPL</label>
                    <TextInput
                        name="fee"
                        value={editData?.fee || ''}
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
  
  // if (!session) {
  //     return {
  //         redirect: {
  //             destination: '/',
  //             permanent: false,
  //         },
  //     };
  // }

  try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/houses/all`, {
          headers: {
              Authorization: `Bearer ${session.accessToken}`,
          },
      });
      return {
          props: {
              initialHouses: res.data,
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