import { useCallback, useEffect,useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import ReactPaginate from 'react-paginate';
import Spinner from './Spinner';
import CustomThemeProviderSecond from './CustomThemeSecond';
import { TextInput,Table, Button, Modal, Badge} from "flowbite-react";
import { HiOutlineSearch } from "react-icons/hi";
import { FaRegArrowAltCircleDown } from "react-icons/fa";
import { FaRegArrowAltCircleUp } from "react-icons/fa";
import { MdMotionPhotosPaused,MdNavigateNext } from "react-icons/md";
import FilterCashflow from './FilterCashflow';
import Select from 'react-select';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment';
import 'moment/locale/id';
import 'moment-timezone';
moment.locale('id');
//import moment from 'moment-timezone';
import MonthOptions from './MonthOptions';
import Image from "next/image";
import Link from 'next/link';
import { FaExternalLinkAlt } from "react-icons/fa";


const ITEMS_PER_PAGE = 20;
const AllCashflow = ({ initialTransaction }) =>  {
    const [transactions, setTransactions] = useState([initialTransaction]);
    const [selectedPeriod, setSelectedPeriod] = useState(''); 
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [lastUpdate, setLastUpdate] = useState('-');
    const router = useRouter();
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [loadingImg, setLoadingImg] = useState(false);
    const { period, page,s, ...rest } = router.query;

    useEffect(() => {
        const { s,period } = router.query;
        if (s) {
            setSearchTerm(s);
        }
        if (period ) {
            setSelectedPeriod(period);
        }
    }, [s,period,router.query]);

    // useEffect(() => {
    //     const updatedQuery = { ...rest };
    
    //     // Hapus parameter period dan page jika kosong
    //     if (!period) {
    //       delete updatedQuery.period;
    //     }
    //     if (!page) {
    //       delete updatedQuery.page;
    //     }
    //     if (!s) {
    //         delete updatedQuery.s;
    //     }
    
    //     // Cek apakah URL perlu diupdate
    //     const currentQuery = new URLSearchParams(router.query).toString();
    //     const newQuery = new URLSearchParams(updatedQuery).toString();

    //     console.log(currentQuery);
    //     console.log(newQuery);
    //     if (currentQuery !== newQuery) {
    //       router.replace({
    //         pathname: router.pathname,
    //         query: updatedQuery,
    //       });
    //     }
    //   }, [period, page,s, router]);
    

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
  
    const fetchTransactions = useCallback( async () => {
      try {
          const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/transactions/all`, {
  
          });
          const dataRes = res.data;
        //  / console.log(dataRes)
          const transactionsData =  dataRes.data.transactions.sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
          });

          setTransactions(transactionsData);
          setLastUpdate(res.data.lastUpdate);
          setLoading(false);
      } catch (error) {
          console.error('Error fetching houses data:', error);
          setLoading(false);
      }
    },[]);
  
    useEffect(() => {
        fetchTransactions();
  
    }, [fetchTransactions]);
  
    const handleSearchChange = (event) => {
        setCurrentPage(0);
        const query = event.target.value;
        const queryObj = { ...router.query };
        delete queryObj.startDate;
        delete queryObj.endDate;
        // tambahkan kondisi untuk mereset currentPage jika search term kosong
        if (query === '') {
          queryObj.page = undefined;
        }

        router.push({
            pathname: '/cashflow',
            query: { ...queryObj, s: query,page: undefined },
        });
        setSearchTerm(query);
    };

    const handleMonthChange = (selectedOption) => {
        setCurrentPage(0);
        
        const query = selectedOption?.value || '';
        const queryObj = { ...router.query };
        if (query === '') {
            queryObj.page = undefined;
          }
  
        router.push({
            pathname: '/cashflow',
            query: { ...queryObj, period: query},
        });
        setSelectedPeriod(query);
    };
  
    
    const filteredTransactions = transactions.filter(transaction => {
        // Ensure the transaction has a 'date' before formatting it
        const transactionMonth = transaction && transaction.date ? moment(transaction.date).format('YYYY-MM') : null;
        
        // Check if the transaction matches the selected period (if it's set)
        const matchesPeriod = selectedPeriod ? transactionMonth === selectedPeriod : true;
        
        // Check if the transaction matches the search term in description or additional_note_mutasi_bca
        const matchesSearchTerm = 
            (transaction && transaction.description && transaction.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (transaction && transaction.additional_note_mutasi_bca && transaction.additional_note_mutasi_bca.toLowerCase().includes(searchTerm.toLowerCase()));
        
        // Return true only if both the period and search term conditions are met
        return matchesPeriod && matchesSearchTerm;
    });
    
  
    const offset = currentPage * ITEMS_PER_PAGE;
    const currentPageData = filteredTransactions.slice(offset, offset + ITEMS_PER_PAGE);
  
    const handlePageClick = (data) => {
        const page = data.selected;
        const queryObj = { ...router.query };
        // delete queryObj.startDate;
        // delete queryObj.endDate;
        router.push({
            pathname: '/cashflow',
            query: { ...queryObj, page: page },
        });
        setCurrentPage(data.selected);
    };
  
    const getTypeIcon = (type) => {
      switch (type) {
        case 'income':
          return <FaRegArrowAltCircleDown  className="text-blue-700 h-4 w-4 md:h-5 md:w-5 " />;
        case 'expense':
          return <FaRegArrowAltCircleUp  className="text-red-700 h-4 w-4 md:h-5 md:w-5 " />;
        case 'ipl':
          return <FaRegArrowAltCircleDown  className="text-green-700  h-4 w-4 md:h-5 md:w-5 " />;
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

    const openModal = (id) => {
        // Temukan transaksi berdasarkan id
        const transaction = currentPageData.find((trans) => trans._id === id);
        setSelectedTransaction(transaction);
        setModalIsOpen(true);
        setLoadingImg(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
        setSelectedTransaction(null);
        setLoadingImg(false);
    };

    const handleImageLoad = () => {
        setLoadingImg(false); 
    };
  
    if (loading) {
      return <Spinner />;
    }
  
    const totalAmount = filteredTransactions.reduce((acc, transaction) => {
        if (transaction.transaction_type === 'ipl' || transaction.transaction_type === 'income') {
        return acc + transaction.amount;
        } else if (transaction.transaction_type === 'expense') {
        return acc - transaction.amount;
        }
        return acc;
    }, 0);

    const totalIncome = filteredTransactions.reduce((acc, transaction) => {
        if (transaction.transaction_type === 'ipl' || transaction.transaction_type === 'income') {
        return acc + transaction.amount;
        } 
        return acc;
    }, 0);

    const totalexpense = filteredTransactions.reduce((acc, transaction) => {
        if (transaction.transaction_type === 'expense') {
        return acc + transaction.amount;
        } 
        return acc;
    }, 0);

    const currentPageNav = currentPage + 1;
    const pageCount = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);

 
    return (
        <>
        
        <div className="max-w-md mb-4 flex justify-between content-center items-center gap-3">
            <CustomThemeProviderSecond>
            <TextInput 
            id='searchtrx'
            name="searchtrx"
            placeholder="Cari"
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-3/5 bg-white"
            icon={HiOutlineSearch} 
            sizing="md"
            
            />

            <Select
                id="relatedMonths"
                options={MonthOptions()}
                defaultValue={router.query.period ? MonthOptions().find(option => option.value === router.query.period) : null}
                onChange={handleMonthChange}
                isSearchable={false}
                isClearable={true} 
                placeholder={<div>Pilih Bulan</div>}
                className=' rounded-md w-3/5'
            />
            </CustomThemeProviderSecond>
        </div>
        
        <div className='mb-2 flex justify-between content-start items-start md:content-center md:items-center flex-col md:flex-row'> 
            <div>
            <Button.Group className='mb-2'>
                <Button color="gray" size="xs" className='p-1 cst-btn'>
                    <FaRegArrowAltCircleDown  className="text-green-700 sm:mr-1 h-4 w-4 md:h-5 md:w-5 " /><span className='text-green-700 text-xs md:text-sm'>{formatCurrency( totalIncome?totalIncome: 0)}</span>
                </Button>
                <Button color="gray" size="xs" className='p-1 cst-btn'>
                    <FaRegArrowAltCircleUp className="text-red-700 sm:mr-1 h-4 w-4 md:h-5 md:w-5" /><span className='text-red-700 text-xs md:text-sm'>{formatCurrency( totalexpense?totalexpense: 0)}</span>
                </Button>
            </Button.Group>
            </div> 
            <span className='text-xs order'>Last Update: { moment(lastUpdate).tz('Asia/Jakarta').format('D/M/YYYY, HH:mm')}</span>
        </div>

        <div className='overflow-x-auto'>
        <Table striped>
            <Table.Head>
            <Table.HeadCell className='py-2 pl-2 pr-0 md:text-base md:py-3 md:pl-2 md:pr-0 bg-cyan-600 text-white'>No</Table.HeadCell>
            <Table.HeadCell className='py-2 px-2 md:text-base md:py-3 md:px-3 bg-cyan-600 text-white w-3/4'>Keterangan</Table.HeadCell>
            <Table.HeadCell className='py-2 px-2 md:text-base md:py-3 md:px-3 bg-cyan-600 text-white'>Tanggal</Table.HeadCell>
            {/* <Table.HeadCell className='py-2 px-2 md:text-base md:py-3 md:px-3 bg-cyan-600 text-white'>Nominal</Table.HeadCell> */}
            {/* <Table.HeadCell className='py-2 px-2 md:text-base md:py-3 md:px-3 bg-cyan-600 text-white'>Tipe</Table.HeadCell> */}
            <Table.HeadCell className='py-2 px-2 md:text-base md:py-3 md:px-3 bg-cyan-600 text-white'>Detail</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
            
            {currentPageData.map((transaction, index) => ( 
                <Table.Row key={index} className="py-2 px-2 md:py-3 md:px-3 text-xs md:text-base">
                    <Table.Cell className={`py-2 px-2 md:py-3 md:px-3 text-xs md:text-base flex items-start content-start`}>
                    {offset + index + 1}
                    </Table.Cell>

                    <Table.Cell className={`py-2 px-2 md:py-3 md:px-3 text-xs md:text-base ${getTextColor(transaction.transaction_type)}`}>
                        <span className='flex items-start content-start'>
                        <span className='pt-1'>{getTypeIcon(transaction.transaction_type)} </span>
                        <span className="ml-2">{transaction.description}</span> 
                        {transaction.description.includes('#IPLPaguyuban') && <span className="ml-2 text-red-500"><MdMotionPhotosPaused className='text-red-600 h-4 w-4 md:h-5 md:w-5' /></span>}
                        </span>
                    </Table.Cell>

                    <Table.Cell className={`items-start content-start py-2 px-2 md:py-3 md:px-3 text-xs md:text-base ${getTextColor(transaction.transaction_type)}`}>{formatDate(transaction.date)}</Table.Cell>
                    
                    {/* <Table.Cell className={`flex items-start content-start py-2 px-2 md:py-3 md:px-3 text-xs md:text-base ${getTextColor(transaction.transaction_type)}`}>
                        <span className='pr-1' >{transaction.transaction_type === 'ipl' ? `+` : transaction.transaction_type  === 'income' ? '+' : transaction.transaction_type  === 'expense' ? '-' : ''}</span>
                        <span>{formatCurrency(transaction.amount)}</span>
                    </Table.Cell> */}
                    
                    {/* <Table.Cell className={`items-start content-start py-2 px-2 md:py-3 md:px-3 text-xs md:text-base ${getTextColor(transaction.transaction_type)}`}>
                        <span className='capitalize'>{transaction.payment_type} </span>
                    </Table.Cell> */}
                    <Table.Cell className={`items-start content-start py-2 px-2 md:py-3 md:px-3 text-xs md:text-base ${getTextColor(transaction.transaction_type)}`}>
                        <span className='flex items-center'>
                        <Button color="gray" onClick={() => openModal(transaction._id)} size="xs" className=' rounded-md focus:ring-0'>View</Button>
                        </span>
                    </Table.Cell>
                
            </Table.Row>

            ))}
            </Table.Body>
        </Table>
        </div>

                <Modal show={modalIsOpen} position="center" size="3xl" dismissible  onClose={closeModal}>
                <Modal.Header>
                    <span className='block'>Detail</span>
                    {selectedTransaction && (
                        <span className='block text-xs gray-700'>ID: {selectedTransaction._id}</span>
                    )}
                    
                </Modal.Header>
                <Modal.Body>
                <div className="">
                    {selectedTransaction ? (
                    <>
                        <div className='flex items-start content-start pb-2 mb-2 border-b'>
                            <div className='w-1/3 md:w-1/6 flex justify-between pr-1'><span className='font-semibold'>Kategori</span><span>:</span></div>
                            <div className='w-10/12'>
                                <span className='flex flex-wrap mt-1'>
                                   <Badge color={selectedTransaction.transaction_type  === 'expense' ? 'failure' : 'info'}> {selectedTransaction.transaction_type  === 'expense' ? 'Keluar' : 'Masuk'}</Badge>
                                </span>
                            </div>
                        </div>
                        <div className='flex items-start content-start pb-2 mb-2 border-b'>
                            <div className='w-1/3 md:w-1/6 flex justify-between pr-1'><span className='font-semibold'>Deskripsi</span><span>:</span></div>
                            <div className='w-10/12'><span>{selectedTransaction.description}</span></div>
                        </div>
                        <div className='flex items-start content-start pb-2 mb-2 border-b'>
                            <div className='w-1/3 md:w-1/6 flex justify-between pr-1'><span className='font-semibold'>Nominal</span><span>:</span></div>
                            <div className='w-10/12'><span>{formatCurrency(selectedTransaction.amount)}</span></div>
                        </div>
                        <div className='flex items-start content-start pb-2 mb-2 border-b'>
                            <div className='w-1/3 md:w-1/6 flex justify-between pr-1'><span className='font-semibold'>Tipe</span><span>:</span></div>
                            <div className='w-10/12'><span  className='capitalize'>{selectedTransaction.payment_type}</span></div>
                        </div>
                        <div className='flex items-start content-start pb-2 mb-2 border-b'>
                            <div className='w-1/3 md:w-1/6 flex justify-between pr-1'><span className='font-semibold'>Tanggal</span><span>:</span></div>
                            <div className='w-10/12'><span  className='capitalize'>{moment(selectedTransaction.date).locale('id').format('D MMMM YYYY')}</span></div>
                        </div>
                        
                        {selectedTransaction.attachment && selectedTransaction.attachment.attachment_title && (

                            <div className='flex items-start content-start pb-2 mb-2 border-b'>
                            <div className='w-1/3 md:w-1/6 flex justify-between pr-1'><span className='font-semibold'>Dokumen</span><span>:</span></div>
                            <div className='w-10/12'>
                            <Link href={selectedTransaction.attachment.attachment_url} target='_blank' className='inline-block' > 
                                <span className='flex items-center content-center capitalize px-3 py-2 text-xs font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800'>
                                    <FaExternalLinkAlt className='w-3 h-3 mr-2 '/> 
                                    <span>  {selectedTransaction.attachment.attachment_title}</span>
                                </span>
                            
                            </Link>
                            </div>
                            </div>
                        )}
                       
                       
                      
                        <div className="mt-5">
                        {selectedTransaction.proof_of_transfer !== '' ? (
                             <div className='w-1/2 relative'>
                               <div className="relative w-full h-auto">
                               {loadingImg && (
                                    <div className="animate-pulse flex justify-center items-center">
                                    {/* Skeleton Loader */}
                                    <div className="w-full h-40 bg-gray-300 rounded-lg"></div>
                                    </div>
                                )}
                               <Image
                                className='w-full h-auto relative'
                                width={0} 
                                height={0}
                                sizes="100vw"
                                onLoad={handleImageLoad}
                                src={selectedTransaction.proof_of_transfer}  
                                alt="Lampiran" /> 
                               </div>
                             </div>
                        ) : (
                          <></>
                        )}
                        </div>

                        <div>
                            {selectedTransaction.additional_note_mutasi_bca &&  (
                                <div className='flex items-start content-start pb-2 mt-6 mb-3'>
                                    <div className='w-1/3 md:w-1/6 flex justify-between pr-1 text-xs'><span className='font-semibold'>Note</span><span>:</span></div>
                                    <div className='w-10/12 flex justify-between'><span className='text-xs'>{selectedTransaction.additional_note_mutasi_bca}</span></div>
                                </div>
                            )}
                        
                        </div>
                    </>
                    ) : (
                    <p>Transaksi tidak ditemukan</p>
                    )}
                </div>
                </Modal.Body>
                <Modal.Footer>
                {/* <Button color="gray" onClick={closeModal}>
                    Close
                </Button> */}
                </Modal.Footer>
            </Modal>

        <nav className="py-6">
        <div className="flex justify-end items-center content-center">
            <span className="text-sm mr-3">
            {currentPageNav * ITEMS_PER_PAGE - ITEMS_PER_PAGE + 1} - {Math.min(currentPageNav * ITEMS_PER_PAGE, filteredTransactions.length)} of {filteredTransactions.length}
            </span>
            <ReactPaginate
            previousLabel={
            currentPageNav === 1 ? (
                <span className="h-full" disabled>
                <MdNavigateNext className='h-6 w-6 rotate-180' />
                </span>
            ) : (
                <span><MdNavigateNext className='h-6 w-6 rotate-180' /></span>
            )}
            nextLabel={
            currentPageNav === pageCount ? (
                <span  disabled>
                <MdNavigateNext className='h-6 w-6' />
                </span>
            ) : (
                <span><MdNavigateNext className='h-6 w-6' /></span>
            )}
            breakLabel={''}
            pageCount={pageCount}
            marginPagesDisplayed={2}
            pageRangeDisplayed={5}
            onPageChange={handlePageClick}
            containerClassName={'pagination flex justify-center -space-x-px text-sm'}
            pageClassName={'hidden'}
            previousClassName={'px-2 py-1 leading-tight text-gray-500 border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'}
            nextClassName={'px-2 py-1 leading-tight text-gray-500 border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'}
            />
        </div>
        </nav>

        {/* <nav className='py-6'>
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
            pageLinkClassName={'flex items-center justify-center px-3 h-8 leading-tight text-gray-500  border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'}
            previousClassName={'page-item'}
            previousLinkClassName={'flex items-center justify-center px-3 h-8 leading-tight text-gray-500 border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'}
            nextClassName={'page-item'}
            nextLinkClassName={'flex items-center justify-center px-3 h-8 leading-tight text-gray-500  border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'}
            breakClassName={'page-item'}
            breakLinkClassName={'flex items-center justify-center px-3 h-8 leading-tight text-gray-500  border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'}
            activeClassName={'active bg-gray-300'}
            activeLinkClassName={'bg-red-300'}
        />
        </nav> */}

        </>
    );
}

export const getServerSideProps = async (context) => {
try {
    const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/transactions/all`, {
    });
    return {
        props: {
            initialTransaction: res.data.transactions,
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

export default AllCashflow;