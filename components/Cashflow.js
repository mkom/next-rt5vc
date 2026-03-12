import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
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
import Link from 'next/link';
import { FaExternalLinkAlt } from "react-icons/fa";
import { formatPeriod } from './FormatPeriod';


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
    const [zoomedFile, setZoomedFile] = useState(null);
    const { period, page,s, ...rest } = router.query;
    const [selectedTransactionType, setSelectedTransactionType] = useState(null);
    // const [selectedCat, setSelectedCat] = useState(null);
    // const [selectedType, setSelectedType] = useState(null);


    useEffect(() => {
        const { s,period } = router.query;
        if (s) {
            setSearchTerm(s);
        }
        if (period ) {
            setSelectedPeriod(period);
        }
    }, [s,period,router.query]);
    

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
          minimumFractionDigits: 0,
      }).format(amount);
    };
    const formatDate = (dateString) => {
      // Gunakan timezone Asia/Jakarta
          const date = moment.tz(dateString, 'Asia/Jakarta');
          return date.format('DD/MM/YY'); // Format sesuai kebutuhan
      };
  
    const fetchTransactions = useCallback( async () => {
      try {
          const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/cashflow`, {
  
          });
          const dataRes = res.data;
            // console.log(dataRes)
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
        setSelectedTransactionType(null)
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

    const optionsCategory = [
        { value: 'Rutin', label: 'Rutin' },
        { value: 'Lain - Lain', label: 'Lain-Lain' },
        { value: 'Fasilitas Sosial', label: 'Fasilitas Sosial' },
        { value: 'Fasilitas Umum', label: 'Fasilitas Umum' },
      ]

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

    const handleTransactionTypeToggle = (type) => {
        setCurrentPage(0);
        setSelectedTransactionType(prevType => (prevType === type ? null : type));
    };
  
  
    const filteredTransactions = transactions.filter(transaction => {
        const transactionMonth = transaction && transaction.date ? moment(transaction.date).format('YYYY-MM') : null;
        const matchesPeriod = selectedPeriod ? transactionMonth === selectedPeriod : true;

        const matchesSearchTerm = 
            (transaction && transaction.description && transaction.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (transaction && transaction.transaction_id && transaction.transaction_id.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesTransactionType = selectedTransactionType 
            ? (selectedTransactionType === 'incomeAndIpl'
                ? transaction.transaction_type === 'income' || transaction.transaction_type === 'ipl'   
                : transaction.transaction_type === selectedTransactionType)
            : true;

       

        // const matchesCategory = transaction?.transaction_category === 'Rutin' && transaction?.transaction_type === 'ipl'
        

       return matchesPeriod && matchesSearchTerm && matchesTransactionType;
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

    const CategoryLabel = (selectedTransaction) => {
     
        const { transaction_type, transaction_category } = selectedTransaction;
    
        if (transaction_type === 'ipl') {
            return "Pemasukan Rutin";
        }

        if (transaction_type === 'income' && transaction_category === 'Rutin') {
            return "Pemasukan Rutin";
        }


        if (transaction_type === 'income' && transaction_category === 'Lain - Lain') {
            return "Pemasukan Lain-Lain";
        }

        if (transaction_type === 'income' && transaction_category === 'Fasilitas Sosial') {
            return "Pemasukan Sosial";
        }

        if (transaction_type === 'income' && transaction_category === 'Fasilitas Umum') {
            return "Pemasukan Fasilitas Umum";
        }

        if (transaction_type === 'expense' && transaction_category === 'Rutin') {
            return "Pengeluaran Rutin";
        }

        if (transaction_type === 'expense' && transaction_category === 'Lain - Lain') {
            return "Pengeluaran Lain - Lain";
        }

        if (transaction_type === 'expense' && transaction_category === 'Fasilitas Sosial') {
            return "Pengeluaran Fasilitas Sosial";
        }

        if (transaction_type === 'expense' && transaction_category === 'Fasilitas Umum') {
            return "Pengeluaran Fasilitas Umum";
        }

        return ''; 
            
    }

    const openModal = (id) => {
        const transaction = currentPageData.find((trans) => trans._id === id);
        setSelectedTransaction(transaction);
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
        setSelectedTransaction(null);
    };

    const toDisplayUrl = (url) => {
        if (!url) return url;
        if (url.includes('drive.google.com') || url.includes('lh3.googleusercontent.com')) {
            return `/api/proxy-image?url=${encodeURIComponent(url)}`;
        }
        return url;
    };
  
    if (loading) {
      return <Spinner />;
    }

    const filteredTransactions2 = transactions.filter(transaction => {
        const transactionMonth = transaction && transaction.date ? moment(transaction.date).format('YYYY-MM') : null;
        const matchesPeriod = selectedPeriod ? transactionMonth === selectedPeriod : true;
        
       return matchesPeriod;
    });

    const getAmount = searchTerm ? filteredTransactions : filteredTransactions2;
  
    const totalAmount = getAmount.reduce((acc, transaction) => {
        if (transaction.transaction_type === 'ipl' && transaction.status === 'berhasil' || transaction.transaction_type === 'income'  && transaction.status === 'berhasil') {
        return acc + transaction.amount;
        } else if (transaction.transaction_type === 'expense'  && transaction.status === 'berhasil') {
        return acc - transaction.amount;
        }
        return acc;
    }, 0);

    const totalIncome = getAmount.reduce((acc, transaction) => {
        if (transaction.transaction_type === 'ipl' && transaction.status === 'berhasil' || transaction.transaction_type === 'income'  && transaction.status === 'berhasil') {
        return acc + transaction.amount;
        } 
        return acc;
    }, 0);

    const totalexpense = getAmount.reduce((acc, transaction) => {
        if (transaction.transaction_type === 'expense' && transaction.status === 'berhasil'  && transaction.status === 'berhasil') {
        return acc + transaction.amount;
        } 
        return acc;
    }, 0);

    const currentPageNav = currentPage + 1;
    const pageCount = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);

 
    return (
        <>
        
        <div className="max-w-md mb-4 flex flex-col content-start items-start gap-3">
            <CustomThemeProviderSecond>
                <div className='w-full'>
                    <TextInput 
                    id='searchtrx'
                    name="searchtrx"
                    placeholder="Cari"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="w-full bg-white"
                    icon={HiOutlineSearch} 
                    sizing="md"
                    />
                </div>

                <div className='w-full flex gap-2 '>
                    <Select
                        id="relatedMonths"
                        options={MonthOptions()}
                        defaultValue={router.query.period ? MonthOptions().find(option => option.value === router.query.period) : null}
                        onChange={handleMonthChange}
                        isSearchable={false}
                        isClearable={true} 
                        placeholder={<div>Pilih Bulan</div>}
                        className=' rounded-md w-full'
                    />

                    {/* <Select
                    id="category"
                    options={optionsCategory}
                    defaultValue={router.query.cat ?optionsCategory.find(option => option.value === router.query.cat) : null}
                    // onChange={handleMonthChange}
                    isSearchable={false}
                    isClearable={true} 
                    placeholder={<div>Pilih Kategori</div>}
                    className=' rounded-md w-2/4'
                    /> */}
                </div>
           

            
            </CustomThemeProviderSecond>
        </div>
        
        <div className='mb-2 flex justify-between content-start items-start md:content-center md:items-center flex-col md:flex-row'> 
            <div>
            <Button.Group 
            className={`mb-2`}>
                <Button 
                    onClick={() => handleTransactionTypeToggle('incomeAndIpl')}
                    color={`${selectedTransactionType === 'incomeAndIpl' ? 'success' : 'gray'}`} size="md" className='p-2 cst-btn min-w-32 justify-start'>
                    <FaRegArrowAltCircleDown  className={`${selectedTransactionType === 'incomeAndIpl' ? 'text-white' : 'text-green-700'} mr-1 h-5 w-5  `} /><span className={`${selectedTransactionType === 'incomeAndIpl' ? 'text-white' : 'text-green-700'} `}>{totalIncome ? formatCurrency( totalIncome) :'-'}</span>
                </Button>
                <Button
                    onClick={() => handleTransactionTypeToggle('expense')}
                    color={`${selectedTransactionType === 'expense' ? 'failure' : 'gray'}`} size="md" className='p-2 cst-btn  min-w-32 justify-start '>
                    <FaRegArrowAltCircleUp className={`${selectedTransactionType === 'expense' ? 'text-white' : 'text-red-700'} mr-1 h-5 w-5`} /><span className={`${selectedTransactionType === 'expense' ? 'text-white' : 'text-red-700'}`}>{totalexpense ? formatCurrency( totalexpense) :'-'}</span>
                </Button>
            </Button.Group>
            </div> 
            <span className='text-xs order'>Last Update: { moment(lastUpdate).tz('Asia/Jakarta').format('DD/MM/YYYY, HH:mm')}</span>
        </div>

        <div className='overflow-x-auto'>
        <Table striped>
            <Table.Head>
            <Table.HeadCell className='py-2 pl-2 pr-0 md:text-base md:py-3 md:pl-2 md:pr-0 bg-cyan-600 text-white'>No</Table.HeadCell>
            <Table.HeadCell className='py-2 px-2 md:text-base md:py-3 md:px-3 bg-cyan-600 text-white w-3/4'>Keterangan</Table.HeadCell>
            <Table.HeadCell className='py-2 px-2 md:text-base md:py-3 md:px-3 bg-cyan-600 text-white'>Nominal</Table.HeadCell>
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
                       
                        <span className="ml-2">
                           {
                                transaction.transaction_type === 'ipl' ? (
                                    <span>{`IPL ${transaction.house_id.house_id}, ${formatPeriod(transaction.related_months)}`}</span>  
                                ) : (
                                    <span>{transaction.description}</span> 
                                )
                            }
                        </span> 
                        {transaction.description.includes('#IPLPaguyuban') && <span className="ml-2 text-red-500"><MdMotionPhotosPaused className='text-red-600 h-4 w-4 md:h-5 md:w-5' /></span>}
                        </span>
                    </Table.Cell>

                    {/* <Table.Cell className={`items-start content-start py-2 px-2 md:py-3 md:px-3 text-xs md:text-base ${getTextColor(transaction.transaction_type)}`}>{formatDate(transaction.date)}</Table.Cell> */}
                    
                    <Table.Cell className={`flex items-start content-start py-2 px-2 md:py-3 md:px-3 text-xs md:text-base ${getTextColor(transaction.transaction_type)}`}>
                        <span className='pr-1' >{transaction.transaction_type === 'ipl' ? `+` : transaction.transaction_type  === 'income' ? '+' : transaction.transaction_type  === 'expense' ? '-' : ''}</span>
                        <span>{formatCurrency(transaction.amount)}</span>
                    </Table.Cell>
                    
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
                        <span className='block text-xs gray-700'>ID: {selectedTransaction.transaction_id}</span>
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
                                    <Badge color={selectedTransaction.transaction_type  === 'expense' ? 'failure' : 'info'}> 
                                        {CategoryLabel(selectedTransaction)}

                                        {/* {selectedTransaction.transaction_type  === 'expense' ? 'Keluar' : 'Masuk'} */}
                                    </Badge>
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
                        {selectedTransaction.proof_of_transfer && selectedTransaction.proof_of_transfer !== '' && (
                            <div className="flex flex-wrap gap-2">
                                {(Array.isArray(selectedTransaction.proof_of_transfer)
                                    ? selectedTransaction.proof_of_transfer
                                    : selectedTransaction.proof_of_transfer.split(/,(?=https?:\/\/)/).map(u => u.trim())
                                ).map((url, i) => {
                                    const isPdf = url.toLowerCase().includes('.pdf');
                                    const displayUrl = toDisplayUrl(url);
                                    return isPdf ? (
                                        <div key={i} onClick={() => setZoomedFile({ src: url, isPdf: true })}
                                            className="w-[120px] h-[120px] flex flex-col items-center justify-center border rounded cursor-pointer bg-gray-50 text-gray-500 text-xs gap-1">
                                            <span className="text-3xl">📄</span>
                                            <span className="text-center px-1">PDF</span>
                                        </div>
                                    ) : (
                                        <img key={i} src={displayUrl} alt={`Lampiran ${i + 1}`}
                                            className="w-[120px] h-[120px] object-cover rounded border cursor-zoom-in"
                                            onClick={() => setZoomedFile({ src: displayUrl, isPdf: false })} />
                                    );
                                })}
                            </div>
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

        {zoomedFile && createPortal(
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80">
                <button onClick={() => setZoomedFile(null)}
                    className="absolute top-4 right-4 text-white text-3xl leading-none font-bold hover:text-gray-300">×</button>
                {zoomedFile.isPdf ? (
                    <iframe src={zoomedFile.src} className="w-[90vw] h-[90vh] rounded shadow-lg bg-white" title="PDF Preview" />
                ) : (
                    <img src={zoomedFile.src} alt="Zoom" className="max-w-[90vw] max-h-[90vh] rounded shadow-lg"
                        onClick={() => setZoomedFile(null)} />
                )}
            </div>,
            document.body
        )}
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