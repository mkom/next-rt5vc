import { getSession, useSession } from 'next-auth/react';
import { signIn, signOut } from 'next-auth/react';
import Spinner from './Spinner';
import { useState, useEffect} from 'react';
import Image from "next/image";
import { GrFormNextLink } from "react-icons/gr";
import { FaExternalLinkAlt, FaHistory, FaCheckCircle, FaTimesCircle, FaClock } from "react-icons/fa";
import { createAuthenticatedClient } from '../lib/api/client';
import moment from 'moment';
import Link from 'next/link';
import { formatCurrency, formatDate } from '../utils/format';
import { ITEMS_PER_PAGE } from '../utils/constants';
import Pagination from './ui/Pagination';

const History = () => {

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

    const truncateText = (text, maxLength) => {
        if (text && text.length > maxLength) {
            return text.substring(0, maxLength) + "...";
        }
        return text;
    };

    useEffect(() => {
      if (session) {
        const fetchUser = async () => {
          try {
            const client = createAuthenticatedClient(session.accessToken);
            const res = await client.get('/users/me');
            const dataRes = res.data.data;
            setUser(dataRes);
            setUserID(dataRes._id);
            setLoading(false);
          } catch (error) {
            signOut();
            setLoading(false);
            console.error('Error fetching user data:', error);
          }
        };
        fetchUser();
      }
    }, [session]);

    const fetchTransactions =  async (userID, session) => {
        if (userID) {
            try {
                const client = createAuthenticatedClient(session.accessToken);
                const res = await client.get(`/users/transaction/${userID}`);
                const dataRes = res.data;
                const transactionsData =  dataRes.data.sort((a, b) => new Date(b.date) - new Date(a.date));
                setTransactions(transactionsData);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching trasaction data:', error);
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        if (session && userID) {
            fetchTransactions(userID,session);
        }
    }, [session, status, userID]);

    const filteredTransactions = transactions.filter(transaction => {
        const matchesSearchTerm =
            (transaction?.description?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (transaction?.transaction_id?.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesSearchTerm;
    });

    const offset = currentPage * ITEMS_PER_PAGE;
    const currentPageData = filteredTransactions.slice(offset, offset + ITEMS_PER_PAGE);
    const pageCount = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);

    const handlePageClick = (selected) => {
        setCurrentPage(selected);
    };

    const openModal = (id) => {
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

    if (!session) return <></>;
    if (loading) return <Spinner />;

    const getStatusUI = (status) => {
        switch (status) {
            case 'berhasil':
                return { icon: <FaCheckCircle className="w-4 h-4" />, color: 'text-success', bg: 'bg-success/10', label: 'Sukses' };
            case 'sedang dicek':
                return { icon: <FaClock className="w-4 h-4" />, color: 'text-warning', bg: 'bg-warning/10', label: 'Menunggu' };
            default:
                return { icon: <FaTimesCircle className="w-4 h-4" />, color: 'text-error', bg: 'bg-error/10', label: 'Gagal' };
        }
    };

    return (
    <div className="flex flex-col gap-4">
        {/* Quick Actions */}
        <div className='flex gap-2 mb-2'>
            <Link href="/confirmation" className='flex-1 flex items-center justify-center gap-1 bg-primary text-primary-content font-bold text-xs rounded-xl px-3 py-3 active:scale-95 transition-transform'>
                <span>Form Konfirmasi</span>
            </Link>
            <Link href="/ipl" className='flex-1 flex items-center justify-center gap-1 bg-base-200 text-base-content font-bold text-xs rounded-xl px-3 py-3 active:scale-95 transition-transform'>
                <span>Lihat Data IPL</span>
            </Link>
        </div>

        {/* User Info */}
        <div className="app-card p-4">
            <p className="text-xs text-base-content/60 font-semibold uppercase mb-1">Riwayat Akun</p>
            <p className="text-sm font-bold text-base-content">{user.email}</p>
        </div>

        {/* Transaction List */}
        <div className="flex flex-col gap-3">
            {currentPageData.length > 0 ? (
                currentPageData.map((transaction, index) => {
                    const statusUI = getStatusUI(transaction.status);
                    return (
                        <div 
                            key={index} 
                            onClick={() => openModal(transaction._id)}
                            className="app-card p-4 flex flex-col gap-3 cursor-pointer active:scale-[0.98] transition-transform"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-bold text-base-content leading-tight mb-1">
                                        {transaction.transaction_id || "Transaksi"}
                                    </p>
                                    <p className="text-[11px] text-base-content/60">
                                        {formatDate(transaction.created_at)}
                                    </p>
                                </div>
                                <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md ${statusUI.bg} ${statusUI.color}`}>
                                    {statusUI.icon}
                                    <span className="text-[10px] font-bold uppercase tracking-wider">{statusUI.label}</span>
                                </div>
                            </div>
                            
                            <div className="flex justify-between items-end mt-1">
                                <p className="text-xs text-base-content/70 line-clamp-1 flex-1 pr-4">
                                    {transaction.description}
                                </p>
                                <p className="text-sm font-extrabold text-base-content shrink-0">
                                    {formatCurrency(transaction.amount)}
                                </p>
                            </div>
                        </div>
                    );
                })
            ) : (
                <div className="app-card p-8 flex flex-col items-center justify-center text-center">
                    <FaHistory className="w-8 h-8 text-base-content/20 mb-3" />
                    <p className="text-base-content/50 font-medium text-sm">Belum ada riwayat transaksi.</p>
                </div>
            )}
        </div>

        {/* Detail Modal */}
        {modalIsOpen && selectedTransaction && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity" onClick={closeModal}>
            <div 
                className="bg-base-100 w-full sm:w-[500px] max-h-[85vh] overflow-y-auto rounded-t-[24px] sm:rounded-[24px] p-6 shadow-2xl transition-transform transform translate-y-0"
                onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-base-200">
                <div>
                  <h3 className='font-extrabold text-lg text-base-content'>Detail Transaksi</h3>
                  <p className='text-xs text-base-content/50 font-mono mt-0.5'>{selectedTransaction.transaction_id}</p>
                </div>
                <button className="w-8 h-8 rounded-full bg-base-200 flex items-center justify-center text-base-content/60 hover:text-base-content active:scale-90 transition-all" onClick={closeModal}>✕</button>
              </div>
              
              <div className="flex flex-col gap-4">
                 {/* Status Big Badge */}
                 <div className="flex flex-col items-center justify-center py-4 bg-base-200/50 rounded-2xl mb-2">
                     <p className="text-[10px] uppercase font-bold text-base-content/50 tracking-wider mb-1">Nominal</p>
                     <p className="text-2xl font-extrabold text-base-content mb-3">{formatCurrency(selectedTransaction.amount)}</p>
                     <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${getStatusUI(selectedTransaction.status).bg} ${getStatusUI(selectedTransaction.status).color}`}>
                        {getStatusUI(selectedTransaction.status).icon}
                        <span className="text-xs font-bold uppercase tracking-wider">{getStatusUI(selectedTransaction.status).label}</span>
                    </div>
                 </div>

                 {/* Detail Items */}
                 <div className="grid grid-cols-3 gap-2 text-sm">
                    <p className="text-base-content/60 font-medium">Tanggal</p>
                    <p className="col-span-2 text-base-content font-semibold text-right">{moment(selectedTransaction.date).locale('id').format('D MMMM YYYY')}</p>
                 </div>
                 
                 <div className="grid grid-cols-3 gap-2 text-sm">
                    <p className="text-base-content/60 font-medium">Tipe</p>
                    <p className="col-span-2 text-base-content font-semibold capitalize text-right">{selectedTransaction.payment_type}</p>
                 </div>

                 <div className="grid grid-cols-1 gap-1 text-sm mt-2">
                    <p className="text-base-content/60 font-medium">Deskripsi</p>
                    <p className="text-base-content font-semibold bg-base-200/50 p-3 rounded-xl leading-relaxed">{selectedTransaction.description}</p>
                 </div>

                 {selectedTransaction.attachment?.attachment_url && (
                    <div className="mt-2">
                        <p className="text-base-content/60 font-medium text-sm mb-2">Dokumen Terlampir</p>
                        <Link href={selectedTransaction.attachment.attachment_url} target='_blank' className="flex items-center gap-2 p-3 bg-primary/10 text-primary rounded-xl font-bold text-sm hover:bg-primary/20 transition-colors">
                            <FaExternalLinkAlt className='w-4 h-4 shrink-0'/>
                            <span className="truncate">{selectedTransaction.attachment.attachment_title || "Lihat Dokumen"}</span>
                        </Link>
                    </div>
                 )}

                 {selectedTransaction.proof_of_transfer && (
                    <div className="mt-4">
                        <p className="text-base-content/60 font-medium text-sm mb-2">Bukti Transfer</p>
                        <div className="relative w-full aspect-[3/4] sm:aspect-video rounded-xl overflow-hidden border border-base-200 bg-base-200/50">
                            {loadingImg && <div className="absolute inset-0 animate-pulse bg-base-300"></div>}
                            <Image
                                className="object-contain"
                                fill
                                sizes="(max-width: 768px) 100vw, 500px"
                                onLoad={handleImageLoad}
                                src={selectedTransaction.proof_of_transfer}
                                alt="Bukti Transfer" 
                            />
                        </div>
                    </div>
                 )}

                 {selectedTransaction.additional_note_mutasi_bca &&  (
                     <div className="mt-4 bg-warning/10 border border-warning/20 p-3 rounded-xl">
                        <p className="text-[10px] uppercase font-bold text-warning tracking-wider mb-1">Catatan BCA</p>
                        <p className="text-xs text-warning-content leading-relaxed">{selectedTransaction.additional_note_mutasi_bca}</p>
                     </div>
                 )}
              </div>
            </div>
          </div>
        )}

        <Pagination pageCount={pageCount} currentPage={currentPage} onPageChange={handlePageClick} />
    </div>
    );
};

export default History;
