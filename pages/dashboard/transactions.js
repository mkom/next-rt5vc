// pages/home.js
import { getSession, useSession } from 'next-auth/react';
import { useEffect,useState } from 'react';
import axios from 'axios';
import { useRequireAuth } from '../../utils/authUtils'; 
import ReactPaginate from 'react-paginate';

import Header from '../../components/Header';
import SideMenu from '../../components/dashboard/Sidebar';
import TransactionDrawer from '../../components/dashboard/TransactionDrawer';
import Spinner from '../../components/Spinner';
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { Card, Button,TextInput,Drawer,Select, Table,Dropdown, Alert,Modal } from "flowbite-react";
import { HiOutlineSearch } from "react-icons/hi";
import {  FaCheckCircle, FaTimesCircle, FaHourglassHalf,FaRegEdit,FaEye,FaRegTrashAlt } from 'react-icons/fa';
import { FaRegArrowAltCircleDown } from "react-icons/fa";
import { FaRegArrowAltCircleUp } from "react-icons/fa";
import { FaEllipsisH } from "react-icons/fa";
import { FaExchangeAlt } from "react-icons/fa";
import FilterTransactions from '../../components/FilterTransactions';
import moment from 'moment';
import 'moment/locale/id';
moment.locale('id');

const ITEMS_PER_PAGE = 15;


const Transaction = ({ initialTransaction }) =>  {
  const { useAuthRedirect } = useRequireAuth(['admin', 'editor', 'superadmin']);
  useAuthRedirect();
  const [transactions, setTransactions] = useState([initialTransaction]);
  const [reTransactions, setReTransactions] = useState([initialTransaction])
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { data: session, status } = useSession();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentTransactionType, setCurrentTransactionType] = useState('');

  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [transactionIdToDelete, setTransactionIdToDelete] = useState(null);
  const [transactionToEdit, setTransactionToEdit] = useState(null);

  const handleDeleteTransaction = async (transactionId) => {
    //console.log(transactionId)
    setTransactionIdToDelete(transactionId);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/transactions/delete/${transactionIdToDelete}`,
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );
      setAlertType('success');
      setAlertMessage('Transaksi berhasil dihapus');
      setShowAlert(true);
      handleAlertTimeout(3000);
      fetchTransactions();
    } catch (error) {
      setAlertType('failure');
      setAlertMessage('Gagal menghapus transaksi');
      setShowAlert(true);
      handleAlertTimeout(3000);
      console.error('Error deleting transaction:', error);
    } finally {
      setShowDeleteModal(false);
    }
  };

  const handleEditTransaction = async (transactionId) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/transactions/${transactionId}`,
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );
      setTransactionToEdit(response.data);
      setIsDrawerOpen(true);
    } catch (error) {
      console.error('Error fetching transaction data:', error);
    }
  };

  const handleUpdateTransaction = async (transactionData) => {
    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/transactions/update/${transactionToEdit._id}`,
        transactionData,
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );
      setAlertType('success');
      setAlertMessage('Transaksi berhasil diupdate');
      setShowAlert(true);
      handleAlertTimeout(3000);
      fetchTransactions();
    } catch (error) {
      setAlertType('failure');
      setAlertMessage('Gagal mengupdate transaksi');
      setShowAlert(true);
      handleAlertTimeout(3000);
      console.error('Error updating transaction:', error);
    }
  };

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

  const fetchTransactions = async () => {
    try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/transactions/all`, {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
            },
        });
        setTransactions(res.data.data);
        setReTransactions(res.data.data);
        setLoading(false);
    } catch (error) {
        console.error('Error fetching houses data:', error);
        setLoading(false);
    }
 };

  useEffect(() => {
    if (session) {
        fetchTransactions();
    }

  }, [session, status]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredTransactions = transactions.filter(transaction => 
    (transaction.description && transaction.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const offset = currentPage * ITEMS_PER_PAGE;
  const currentPageData = filteredTransactions.slice(offset, offset + ITEMS_PER_PAGE);

  const handlePageClick = (data) => {
    setCurrentPage(data.selected);
  };


  const getStatusIcon = (status) => {
    switch (status) {
      case 'berhasil':
        return <FaCheckCircle className="text-green-500" />;
      case 'gagal':
        return <FaTimesCircle className="text-red-500" />;
      case 'sedang dicek':
        return <FaHourglassHalf className="text-yellow-500" />;
      default:
        return null;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'income':
        return <FaRegArrowAltCircleDown  className="text-blue-700 h-4 w-4 md:h-5 md:w-5 " />;
      case 'expense':
        return <FaRegArrowAltCircleUp  className="text-red-700 h-4 w-4 md:h-5 md:w-5 " />;
      case 'ipl':
        return <FaExchangeAlt  className="text-green-700  h-3 w-3 md:h-4 md:w-4 " />;
      default:
        return null;
    }
  };

  const getTextColor = (type) => {
    switch (type) {
      case 'income':
        return "text-blue-700";
      case 'expense':
        return "text-red-700";
      case 'ipl':
        return "text-green-700";
      default:
        return null;
    }
  };

  const handlePaymentClick = () => {
    setCurrentTransactionType('ipl');
    setIsDrawerOpen(true);
  };

  const handleIncomeClick = () => {
    setCurrentTransactionType('income');
    setIsDrawerOpen(true);
  };

  const handleExpenseClick = () => {
    setCurrentTransactionType('expense');
    setIsDrawerOpen(true);
  };

  const handleDrawerSubmit = async (transactionData) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/transactions/create`, 
        transactionData, // Hanya data yang dikirim dalam body
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`, // Tempatkan headers di opsi konfigurasi
            'Content-Type': 'application/json',
          },
        }
      );
      setAlertType('success');
      setAlertMessage('Transaksi berhasil ditambahkan');
      setShowAlert(true);
     // alert('Transaksi berhasil ditambahkan');
      // Refresh data atau navigasi sesuai kebutuhan
      fetchTransactions();
    } catch (error) {
      setAlertType('failure');
      setAlertMessage('Gagal menambahkan transaksi');
      setShowAlert(true);
      console.error('Error creating transaction:', error);
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

 // console.log(transactions)

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
          <h1 className='text-xl mb-4 font-semibold text-gray-900 sm:text-2xl dark:text-white'>Data Transaksi</h1>

          <Card className='w-full mb-10'>
            <h3 className='font-semibold mb-3'>Buat Transaksi Baru</h3>
              <div className='flex flex-wrap gap-2'>
              <Button size="sm" color="success" onClick={handlePaymentClick}>
                <FaExchangeAlt  className="mr-2 h-5 w-5" />
                IPL
              </Button>

              <Button size="sm" color="blue" onClick={handleIncomeClick}>
                <FaRegArrowAltCircleDown  className="mr-2 h-5 w-5" />
                Masuk
              </Button>
              <Button size="sm" color="failure" onClick={handleExpenseClick}>
                Keluar
                <FaRegArrowAltCircleUp  className="ml-2 h-5 w-5" />
              </Button>
              </div>
          </Card>

          <TransactionDrawer
            isOpen={isDrawerOpen}
            onClose={() => setIsDrawerOpen(false)}
            onSubmit={transactionToEdit ? handleUpdateTransaction : handleDrawerSubmit}
            transactionType={currentTransactionType}
            transactionToEdit={transactionToEdit}
          />

          <div className="max-w-md mb-4 flex">

            <TextInput 
              name="name"
              placeholder="Cari"
              value={searchTerm}
              onChange={handleSearchChange}
              className="mr-2 w-3/5"
              icon={HiOutlineSearch} 
            />

            <FilterTransactions className="w-2/5" setTransactions={setTransactions} initialTransaction={reTransactions} />

          </div>

          <div className='overflow-x-auto'>
            <Table hoverable>
              <Table.Head>
                <Table.HeadCell className='py-2 px-2 md:py-3 md:px-3 w-3/4'>Keterangan</Table.HeadCell>
                <Table.HeadCell className='py-2 px-2 md:py-3 md:px-3'>Tanggal</Table.HeadCell>
                <Table.HeadCell className='py-2 px-2 md:py-3 md:px-3'>Nominal</Table.HeadCell>
                <Table.HeadCell className='py-2 px-2 md:py-3 md:px-3'>Tipe</Table.HeadCell>
                <Table.HeadCell className='py-2 px-2 md:py-3 md:px-3'>Status</Table.HeadCell>
                <Table.HeadCell className='py-2 px-2 md:py-3 md:px-3'>
                    <span className="sr-only">Edit</span>
                </Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y">
                
                {currentPageData.map((transaction, index) => ( 
                  <Table.Row key={index} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                    <Table.Cell className={`py-2 px-2 md:py-3 md:px-3 ${getTextColor(transaction.transaction_type)}`}>
                      <span className='flex items-start content-start'>
                        <span>{getTypeIcon(transaction.transaction_type)} </span>
                        <span className="ml-2">{transaction.description}</span> 
                      </span>
                    </Table.Cell>
                    <Table.Cell className={`items-start content-start py-2 px-2 md:py-3 md:px-3 text-xs md:text-base ${getTextColor(transaction.transaction_type)}`}>{moment(transaction.date, 'DD MMM YYYY').format('DD/MM/YY')}</Table.Cell>
                    <Table.Cell className={`items-start content-start py-2 px-2 md:py-3 md:px-3 text-xs md:text-base ${getTextColor(transaction.transaction_type)}`}>{formatCurrency(transaction.amount)}</Table.Cell>
                    
                    <Table.Cell className={`items-start content-start py-2 px-2 md:py-3 md:px-3 text-xs md:text-base ${getTextColor(transaction.transaction_type)}`}>
                      <span className='flex items-center'>
                        {transaction.payment_type} 
                      </span>
                    </Table.Cell>
                    <Table.Cell className={`items-center flex justify-center content-center py-2 px-2 md:py-3 md:px-3 text-xs md:text-base ${getTextColor(transaction.transaction_type)}`}>
                      <span className='flex items-center'>
                        {getStatusIcon(transaction.status)} 
                      </span>
                    </Table.Cell>
                    <Table.Cell className='py-2 px-2 md:py-3 md:px-3 text-xs md:text-base'>
                      <Dropdown  className="relative z-50 cursor-pointer" align="right" label="" renderTrigger={() => <span><FaEllipsisH  className="h-4 w-4 cursor-pointer" /></span>}>
                        <Dropdown.Item onClick={() => handleEditTransaction(transaction._id)}><FaRegEdit className='mr-1'/><span>Edit</span></Dropdown.Item>
                        <Dropdown.Item><FaEye className='mr-1'/><span>View</span></Dropdown.Item>
                        <Dropdown.Item onClick={() => handleDeleteTransaction(transaction._id)} ><FaRegTrashAlt className='mr-1' /><span>Delete</span></Dropdown.Item>
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
                pageCount={Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE)}
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
                activeClassName={'active'}
                activeLinkClassName={'bg-gray-300'}
            />
          </nav>

        </section>
        
        <Modal
          show={showDeleteModal}
          size="md"
          popup
          onClose={() => setShowDeleteModal(false)}
        >
          <Modal.Header />
          <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
            Apakah Anda yakin ingin menghapus transaksi ini?
            </h3>
            <div className="flex justify-center gap-4">
              <Button color="failure" onClick={handleConfirmDelete}>
                Hapus
              </Button>
              <Button color="gray" onClick={() => setShowDeleteModal(false)}>
                Batal
              </Button>
            </div>
          </div>
          </Modal.Body>
          
        </Modal>         

      </div>
      
      
    </main>
    </>
  );
}

export const getServerSideProps = async (context) => {
  const session = await getSession(context);
  
  if (!session) {
      return {
          redirect: {
              destination: '/',
              permanent: false,
          },
      };
  }

  try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/transactions/all`, {
          headers: {
              Authorization: `Bearer ${session.accessToken}`,
          },
      });
      return {
          props: {
            initialTransaction: res.data,
          },
      };
  } catch (error) {
      console.error('Error fetching houses data:', error);
      return {
          props: {
            initialTransaction: [],
          },
      };
  }
};

export default Transaction;
