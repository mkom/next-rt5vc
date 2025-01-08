import { getSession, useSession } from 'next-auth/react';
import { signIn, signOut } from 'next-auth/react';
import { useRequireAuth } from '../utils/authUtils.js'; 
import Spinner from './Spinner';
import { useState, useEffect} from 'react';
import {Table, Button, Modal, Badge} from "flowbite-react";
import ReactPaginate from 'react-paginate';
import { MdNavigateNext } from "react-icons/md";
import Image from "next/image";
import {  FaCheckCircle, FaTimesCircle, FaHourglassHalf } from 'react-icons/fa';
import { GrFormNextLink } from "react-icons/gr";
import axios from 'axios';
import moment from 'moment';
import 'moment/locale/id';
import 'moment-timezone';
moment.locale('id');
import Link from 'next/link';
import { FaExternalLinkAlt } from "react-icons/fa";

const ITEMS_PER_PAGE = 20;

const History = () => {
    const { useAuthRedirect } = useRequireAuth(['user','admin', 'editor', 'superadmin']);
    useAuthRedirect();

    const [status, setStatus] = useState('sedang dicek');
    const { data: session } = useSession();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState('');
    const [userID, setUserID] = useState('');
    const [transactions, setTransactions] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [loadingImg, setLoadingImg] = useState(false);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);

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

    const truncateText = (text, maxLength) => {
        if (text.length > maxLength) {
            return text.substring(0, maxLength) + "...";
        }
        return text;
    };

    useEffect(() => {
      if (session) {

        const fetchUser = async () => {
          try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
              headers: {
                Authorization: `Bearer ${session.accessToken}`,
              },
            });
            // console.log(res.data)
            const dataRes = res.data.data;
            setUser (dataRes);
            setUserID(dataRes._id);
            setLoading(false);
          } catch (error) {
           
            signOut();
            setLoading(false);
            console.error('Error fetching user data:', error);
          }
        };

        fetchUser();
      } else {
        
      }
    }, [session]);

    const fetchTransactions =  async (userID, session) => {
        
        if (userID) {
           
            try {
                const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users/transaction/${userID}`, {
                    headers: {
                        Authorization: `Bearer ${session.accessToken}`,
                    },
                });
                const dataRes = res.data;
                //console.log(dataRes)
                const transactionsData =  dataRes.data.sort((a, b) => {
                    return new Date(b.date) - new Date(a.date);
                });
        
                setTransactions(transactionsData);
            
                setLoading(false);
            } catch (error) {
                console.error('Error fetching trasaction data:', error);
                setLoading(false);
            }
        }
       
    };

    useEffect(() => {
        if (session) {
            fetchTransactions(userID,session);
        }

    }, [session, status,userID]);


    const filteredTransactions = transactions.filter(transaction => {
        const matchesSearchTerm = 
            (transaction && transaction.description && transaction.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (transaction && transaction.transaction_id && transaction.transaction_id.toLowerCase().includes(searchTerm.toLowerCase()));
        
        // Return true only if both the period and search term conditions are met
        return  matchesSearchTerm;
    });

    const offset = currentPage * ITEMS_PER_PAGE;
    const currentPageData = filteredTransactions.slice(offset, offset + ITEMS_PER_PAGE);

    const currentPageNav = currentPage + 1;
    const pageCount = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
  
    const handlePageClick = (data) => {
        setCurrentPage(data.selected);
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

    if (!session) {
      return <></>;
    }

    if (loading) {
       return <Spinner />;
    }

    const getStatusIcon = (status) => {
        switch (status) {
        case 'berhasil':
            return <FaCheckCircle className="text-green-500 h-4 w-4 md:h-5 md:w-5" />;
        case 'gagal':
            return <FaTimesCircle className="text-red-500 h-4 w-4 md:h-5 md:w-5" />;
        case 'sedang dicek':
            return <FaHourglassHalf className="text-yellow-500 h-4 w-4 md:h-5 md:w-5" />;
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

    const getBadgeProps = (status) => {
        switch (status) {
            case 'berhasil':
            return { color: 'info', text: 'Sukses' };
            case 'sedang dicek':
            return { color: 'warning', text: 'Menunggu' };
            default:
            return { color: 'failure', text: 'Gagal' };
        }
    };

    return (
    <>
        <div className='flex justify-start gap-2'>
            <Link href="/confirmation" className='flex items-center content-center bg-blue-700 text-white font-medium text-xs rounded-xl px-2 py-1 '>
            <span className='text-center content-center'>Konfirmasi Transfer</span>
            <GrFormNextLink  className='w-5 h-5'/>
            </Link>
            <Link href="/ipl" className='flex items-center content-center bg-green-700 text-white font-medium text-xs rounded-xl px-2 py-1 '>
            <span className='text-center content-center'>Data IPL</span>
            <GrFormNextLink  className='w-5 h-5'/>
            </Link>
        </div>
        <p className='pt-6 pb-3 text-md'>Riwayat konfirmasi transfer oleh email: <span className='underline'>{user.email}</span></p>

        <div className='overflow-x-auto'>
            <Table striped>
                <Table.Head>
                <Table.HeadCell className='py-2 px-2 md:text-base md:py-3 md:pl-2 md:pr-0 bg-cyan-600 text-white'>No</Table.HeadCell>
                <Table.HeadCell className='py-2 px-2 md:text-base md:py-3 md:px-3 bg-cyan-600 text-white w-3/4'>Keterangan</Table.HeadCell>
                <Table.HeadCell className='py-2 px-2 md:text-base md:py-3 md:px-3 bg-cyan-600 text-white'>Tanggal</Table.HeadCell>
                <Table.HeadCell className='py-2 px-2 md:text-base md:py-3 md:px-3 bg-cyan-600 text-white'>Status</Table.HeadCell>
                <Table.HeadCell className='py-2 px-2 md:text-base md:py-3 md:px-3 bg-cyan-600 text-white'>Detail</Table.HeadCell>
                </Table.Head>
                <Table.Body className="divide-y">
                    {currentPageData ? (
                        <>
                            {currentPageData.map((transaction, index) => ( 
                            <Table.Row key={index} className=" py-2 px-2 md:py-3 md:px-3 text-xs md:text-base">
                                <Table.Cell className={` items-center content-center  py-1 px-2 md:py-2 md:px-3 text-xs md:text-base`}>
                                    <span className='flex items-center content-center justify-center'>
                                    {offset + index + 1}
                                    </span>
                                </Table.Cell>
                                <Table.Cell className={`items-center content-center  py-1 px-2 md:py-2 md:px-3 text-xs md:text-base ${getTextColor(transaction.transaction_type)}`}>
                                    <span className='flex items-start content-start'>
                                        {/* {
                                            transaction.transaction_type === 'ipl' ? (
                                                <span>{`IPL ${transaction.house_id.house_id}, ${transaction.related_months.length} Periode.`}</span>  
                                            ) : (
                                                <span>{transaction.description}</span> 
                                            )
                                        } */}

                                    <span>{transaction.transaction_id? transaction.transaction_id : truncateText(transaction.description, 10)}</span> 

                                    </span>
                                </Table.Cell>
                                <Table.Cell className={`items-center content-center  py-1 px-2 md:py-2 md:px-3 text-xs md:text-base ${getTextColor(transaction.transaction_type)}`}>
                                    {formatDate(transaction.created_at)}
                                </Table.Cell>     
                                <Table.Cell className={`items-center content-center py-1 px-2 md:py-2 md:px-3 text-xs md:text-base ${getTextColor(transaction.transaction_type)}`}>
                                <span className='flex items-center justify-center'>
                                    {getStatusIcon(transaction.status)} 
                                </span>
                                </Table.Cell>
                                <Table.Cell className={`items-center content-center py-1 px-2 md:py-2 md:px-3 text-xs md:text-base ${getTextColor(transaction.transaction_type)}`}>
                                    <span className='flex items-center'>
                                    <Button color="gray" onClick={() => openModal(transaction._id)} size="xs" className=' rounded-md focus:ring-0'>View</Button>
                                    </span>
                                </Table.Cell>
                            </Table.Row>
                            ))}
                        </>
                    ):(
                        <Table.Row className=" py-2 px-2 md:py-3 md:px-3 text-xs md:text-base">
                            <Table.Cell colSpan={5} className=" items-center content-center  py-1 px-2 md:py-2 md:px-3 text-xs md:text-base">
                                <span className='flex items-center content-center justify-center'>
                                    Data tidak ditemukan
                                </span>
                            </Table.Cell>
                       
                        </Table.Row>
                    )}

                    
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
                        <div className='w-1/3 md:w-1/6 flex justify-between pr-1'><span className='font-semibold'>Status</span><span>:</span></div>
                        <div className='w-10/12'>
                            <span className='flex flex-wrap mt-1'>
                                <Badge color={getBadgeProps(selectedTransaction.status).color}> {getBadgeProps(selectedTransaction.status).text}</Badge>
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

        
        {currentPageData &&
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
        }

      
        
    </>
    );
  };
  
  export default History;