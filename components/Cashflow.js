import { useCallback, useEffect,useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import ReactPaginate from 'react-paginate';
import Spinner from './Spinner';
import CustomThemeProviderSecond from './CustomThemeSecond';
import { TextInput,Table} from "flowbite-react";
import { HiOutlineSearch } from "react-icons/hi";
import { FaRegArrowAltCircleDown } from "react-icons/fa";
import { FaRegArrowAltCircleUp } from "react-icons/fa";
import { MdMotionPhotosPaused,MdNavigateNext } from "react-icons/md";
import FilterCashflow from './FilterCashflow';
import Select from 'react-select';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment';
import 'moment/locale/id';
moment.locale('id');
import MonthOptions from './MonthOptions';


const ITEMS_PER_PAGE = 20;
const AllCashflow = ({ initialTransaction }) =>  {
    const [transactions, setTransactions] = useState([initialTransaction]);
    const [selectedPeriod, setSelectedPeriod] = useState(''); 
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [lastUpdate, setLastUpdate] = useState('-');
    const router = useRouter();

    useEffect(() => {
        const { s,period } = router.query;
        if (s) {
            setSearchTerm(s);
        }
        if (period ) {
            setSelectedPeriod(period);
        }
    }, [router.query]);
    

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
            query: { ...queryObj, period: query,page: undefined },
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

    const currentPageNav = currentPage + 1;
    const pageCount = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);

  //console.log(pageCount)
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
        

            {/* <FilterCashflow 
                className="w-2/5 p-1" 
                setTransactions={setTransactions} 
                initialTransaction={reTransactions} 
                initialStartDate={pStartDate}
                initialEndDate={pEndDate}
                setCurrentPage={setCurrentPage}
            /> */}
        </div>
        
        <div className='mb-4 flex justify-between content-center items-center'> 
        <span className='font-semibold'>{formatCurrency(totalAmount)}</span>
        <span className='text-xs'>Last Update: {lastUpdate}</span>
        </div>

        <div className='overflow-x-auto'>
        <Table striped>
            <Table.Head>
            <Table.HeadCell className='py-2 pl-2 pr-0 md:text-base md:py-3 md:pl-2 md:pr-0 bg-cyan-600 text-white'>No</Table.HeadCell>
            <Table.HeadCell className='py-2 px-2 md:text-base md:py-3 md:px-3 bg-cyan-600 text-white w-3/4'>Keterangan</Table.HeadCell>
            <Table.HeadCell className='py-2 px-2 md:text-base md:py-3 md:px-3 bg-cyan-600 text-white'>Tanggal</Table.HeadCell>
            <Table.HeadCell className='py-2 px-2 md:text-base md:py-3 md:px-3 bg-cyan-600 text-white'>Nominal</Table.HeadCell>
            {/* <Table.HeadCell className='py-2 px-2 md:py-3 md:px-3 bg-cyan-600 text-white'>Tipe</Table.HeadCell> */}
            {/* <Table.HeadCell className='py-2 px-2 md:py-3 md:px-3 bg-cyan-600 text-white'>Status</Table.HeadCell> */}
            </Table.Head>
            <Table.Body className="divide-y">
            
            {currentPageData.map((transaction, index) => ( 
                <Table.Row key={index} className="py-2 px-2 md:py-3 md:px-3 text-xs md:text-base">
                    <Table.Cell className={`py-2 px-2 md:py-3 md:px-3 text-xs md:text-base flex items-start content-start`}>
                    {offset + index + 1}
                    </Table.Cell>

                    <Table.Cell className={`py-2 px-2 md:py-3 md:px-3 text-xs md:text-base ${getTextColor(transaction.transaction_type)}`}>
                        <span className='flex items-center content-center'>
                        <span>{getTypeIcon(transaction.transaction_type)} </span>
                        <span className="ml-2">{transaction.description}</span> 
                        {transaction.description.includes('#IPLPaguyuban') && <span className="ml-2 text-red-500"><MdMotionPhotosPaused className='text-red-600 h-4 w-4 md:h-5 md:w-5' /></span>}
                        </span>
                    </Table.Cell>
                    <Table.Cell className={`items-start content-start py-2 px-2 md:py-3 md:px-3 text-xs md:text-base ${getTextColor(transaction.transaction_type)}`}>{formatDate(transaction.date)}</Table.Cell>
                    <Table.Cell className={`flex items-start content-start py-2 px-2 md:py-3 md:px-3 text-xs md:text-base ${getTextColor(transaction.transaction_type)}`}>
                        <span className='pr-1' >{transaction.transaction_type === 'ipl' ? `+` : transaction.transaction_type  === 'income' ? '+' : transaction.transaction_type  === 'expense' ? '-' : ''}</span>
                        <span>{formatCurrency(transaction.amount)}</span>
                    </Table.Cell>
                
                {/* <Table.Cell className={`items-start content-start py-2 px-2 md:py-3 md:px-3 text-xs md:text-base ${getTextColor(transaction.transaction_type)}`}>
                    <span className='flex items-center'>
                    {transaction.payment_type} 
                    </span>
                </Table.Cell> */}
                {/* <Table.Cell className={`items-center flex justify-center content-center py-2 px-2 md:py-3 md:px-3 text-xs md:text-base ${getTextColor(transaction.transaction_type)}`}>
                    <span className='flex items-center'>
                    {getStatusIcon(transaction.status)} 
                    </span>
                </Table.Cell> */}
                
            </Table.Row>

            ))}
            </Table.Body>
        </Table>
        </div>
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