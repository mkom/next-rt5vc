import { getSession, useSession } from 'next-auth/react';
import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import Select from 'react-select';
import { selectStyles } from '../../utils/selectStyles';
import TransactionDrawer from '../../components/dashboard/TransactionDrawer';
import Spinner from '../../components/Spinner';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import SearchInput from '../../components/ui/SearchInput';
import Pagination from '../../components/ui/Pagination';
import ConfirmModal from '../../components/ui/ConfirmModal';
import Alert from '../../components/ui/Alert';
import ResponsiveTable from '../../components/ui/ResponsiveTable';
import { formatCurrency, formatDate } from '../../utils/format';
import { getTransactionStatusIcon } from '../../utils/statusIcons';
import { FaExchangeAlt, FaRegArrowAltCircleDown, FaRegArrowAltCircleUp, FaRegEdit, FaRegTrashAlt, FaEllipsisH } from 'react-icons/fa';
import { MdOutlineAccountBalanceWallet } from 'react-icons/md';
import FilterTransactions from '../../components/dashboard/FilterTransactions';
import { ITEMS_PER_PAGE } from '../../utils/constants';
import moment from 'moment';
import 'moment-timezone';

const buildIPLSuccessMessage = (txData, baseUrl) => {
  const houseId = txData.house?.house_id || '';
  const IPLUrl = `${baseUrl}/ipl/${houseId.toLowerCase()}`;
  return `*Konfirmasi Pembayaran IPL Berhasil!*\n\n`
    + `Setelah kami melakukan pengecekan, kami informasikan bahwa pembayaran IPL Bapak/Ibu telah berhasil masuk ke sistem kami.\n\n`
    + `*Detail:*\n*ID:* ${txData.transaction_id}\n*Deskripsi:*\n${txData.description}\n`
    + `*Jumlah:* ${formatCurrency(txData.amount)}\n`
    + `*Tanggal Pembayaran:* ${moment(txData.date).format('DD MMM YYYY')}\n`
    + (houseId ? `\n*Cek IPL:* ${houseId} ${IPLUrl}\n\n` : '')
    + `Terima kasih telah melakukan pembayaran IPL RT 05 RW 11, Villa Citayam.\n\n*Hormat Kami*\nRT 005 Villa Citayam.\n`;
};

const Transaction = ({ initialTransaction }) => {
  const [transactions, setTransactions] = useState(initialTransaction ?? []);
  const [reTransactions, setReTransactions] = useState(initialTransaction ?? []);
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
  const [lastUpdate, setLastUpdate] = useState('-');
  const [selectedType, setSelectedType] = useState('');
  const [baseUrl, setBaseUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') setBaseUrl(window.location.origin);
  }, []);

  const handleDeleteTransaction = (transactionId) => {
    setTransactionIdToDelete(transactionId);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/transactions/delete/${transactionIdToDelete}`,
        { headers: { Authorization: `Bearer ${session.accessToken}` } }
      );
      showNotification('success', 'Transaksi berhasil dihapus');
      fetchTransactions();
    } catch (error) {
      showNotification('error', 'Gagal menghapus transaksi');
      console.error('Error deleting transaction:', error);
    } finally {
      setShowDeleteModal(false);
    }
  };

  const handleEditTransaction = async (transactionId) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/transactions/${transactionId}`,
        { headers: { Authorization: `Bearer ${session.accessToken}` } }
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
        { headers: { Authorization: `Bearer ${session.accessToken}` } }
      );

      let bodyMessage, number;

      if (response.data.status === 'berhasil') {
        bodyMessage = buildIPLSuccessMessage(response.data, baseUrl);
        number = response.data.whatsapp_notification;
      } else if (response.data.status === 'gagal') {
        bodyMessage = `*Konfirmasi Pembayaran IPL Gagal!*\n\n`
          + `Setelah kami melakukan pengecekan, kami informasikan bahwa pembayaran IPL Bapak/Ibu Dibatalkan.\n\n`
          + `*Detail:*\n*ID:* ${response.data.transaction_id}\n*Deskripsi:*\n${response.data.description}\n`
          + `*Jumlah:* ${formatCurrency(response.data.amount)}\n`
          + `*Tanggal Pembayaran:* ${moment(response.data.date).format('DD MMM YYYY')}\n\n`
          + `*Alasan Pembatalan:*\n${response.data.additional_note}\n\n`
          + `Demikian informasi yang dapat kami sampaikan.\n\n*Hormat Kami*\nRT 005 Villa Citayam.\n`;
        number = response.data.whatsapp_notification;
      }

      if (number) {
        try {
          await axios.post(`${process.env.NEXT_PUBLIC_WABOTAPI_URL}notify`, { number, bodyMessage }, {
            headers: { 'Content-Type': 'application/json' },
          });
        } catch (_) {}
      }

      showNotification('success', 'Transaksi berhasil diupdate');
      fetchTransactions();
    } catch (error) {
      showNotification('error', 'Gagal mengupdate transaksi');
      console.error('Error updating transaction:', error);
    }
  };

  const fetchTransactions = useCallback(async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/transactions/all`, {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      });
      const sorted = res.data.data.transactions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setTransactions(sorted);
      setReTransactions(sorted);
      setLastUpdate(res.data.lastUpdate);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (session) fetchTransactions();
  }, [session, fetchTransactions]);

  const handleTypeChange = (selectedOption) => {
    setSelectedType(selectedOption.value);
    setCurrentPage(0);
  };

  const filteredTransactions = transactions.filter(t => {
    const matchesType = selectedType ? t.transaction_type === selectedType : true;
    const matchesSearch =
      t?.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t?.transaction_id?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const offset = currentPage * ITEMS_PER_PAGE;
  const currentPageData = filteredTransactions.slice(offset, offset + ITEMS_PER_PAGE);

  const showNotification = (type, message) => {
    setAlertType(type);
    setAlertMessage(message);
    setShowAlert(true);
  };

  const getTextColor = (type) => {
    if (type === 'income') return 'text-primary';
    if (type === 'expense') return 'text-error';
    if (type === 'ipl') return 'text-success';
    return '';
  };

  const totalAmount = filteredTransactions.reduce((acc, t) => {
    if ((t.transaction_type === 'ipl' || t.transaction_type === 'income') && t.status === 'berhasil') return acc + t.amount;
    if (t.transaction_type === 'expense' && t.status === 'berhasil') return acc - t.amount;
    return acc;
  }, 0);

  const totalIncome = filteredTransactions.reduce((acc, t) =>
    (t.transaction_type === 'ipl' || t.transaction_type === 'income') && t.status === 'berhasil' ? acc + t.amount : acc, 0);

  const totalExpense = filteredTransactions.reduce((acc, t) =>
    t.transaction_type === 'expense' && t.status === 'berhasil' ? acc + t.amount : acc, 0);

  const TrxType = [
    { value: '', label: 'Semua Type' },
    { value: 'ipl', label: 'IPL' },
    { value: 'income', label: 'Masuk' },
    { value: 'expense', label: 'Keluar' },
  ];

  if (loading) return <Spinner />;

  const columns = [
    { label: 'No', className: 'w-8' },
    { label: 'Keterangan' },
    { label: 'Tanggal' },
    { label: 'Nominal' },
    { label: 'Status', className: 'text-center' },
    { label: '' },
  ];

  const renderMobileCard = (transaction, index) => (
    <div className={`${getTextColor(transaction.transaction_type)}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="flex-shrink-0">{getTransactionStatusIcon(transaction.status)}</span>
          <span className="text-sm font-medium truncate">{transaction.description}</span>
        </div>
        <div className="dropdown dropdown-end">
          <label tabIndex={0} className="btn btn-ghost btn-xs">
            <FaEllipsisH className="h-3 w-3" />
          </label>
          <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-50 w-36 p-1 shadow border border-base-200">
            <li>
              <button onClick={() => { handleEditTransaction(transaction._id); setCurrentTransactionType(transaction.transaction_type); }}>
                <FaRegEdit /> Edit
              </button>
            </li>
            <li>
              <button className="text-error" onClick={() => handleDeleteTransaction(transaction._id)}>
                <FaRegTrashAlt /> Hapus
              </button>
            </li>
          </ul>
        </div>
      </div>
      <div className="flex items-center justify-between mt-1 text-xs text-base-content/60">
        <span>{formatDate(transaction.date)}</span>
        <span className={`font-medium ${getTextColor(transaction.transaction_type)}`}>{formatCurrency(transaction.amount)}</span>
      </div>
    </div>
  );

  const renderDesktopRow = (transaction, index) => (
    <tr key={index} className={getTextColor(transaction.transaction_type)}>
      <td className="text-xs">{offset + index + 1}</td>
      <td className="text-xs md:text-sm">{transaction.description}</td>
      <td className="text-xs whitespace-nowrap">{formatDate(transaction.date)}</td>
      <td className="text-xs whitespace-nowrap">{formatCurrency(transaction.amount)}</td>
      <td className="text-center">
        <span className="flex justify-center">{getTransactionStatusIcon(transaction.status)}</span>
      </td>
      <td>
        <div className="dropdown dropdown-end">
          <label tabIndex={0} className="btn btn-ghost btn-xs">
            <FaEllipsisH className="h-3 w-3" />
          </label>
          <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-50 w-36 p-1 shadow border border-base-200">
            <li>
              <button onClick={() => { handleEditTransaction(transaction._id); setCurrentTransactionType(transaction.transaction_type); }}>
                <FaRegEdit /> Edit
              </button>
            </li>
            <li>
              <button className="text-error" onClick={() => handleDeleteTransaction(transaction._id)}>
                <FaRegTrashAlt /> Hapus
              </button>
            </li>
          </ul>
        </div>
      </td>
    </tr>
  );

  return (
    <>
      <Alert
        show={showAlert}
        type={alertType}
        message={alertMessage}
        onClose={() => setShowAlert(false)}
      />

      <h1 className="text-xl font-bold mb-4">Data Transaksi</h1>

      {/* New transaction buttons */}
      <div className="card bg-base-100 shadow-sm border border-base-200 mb-6">
        <div className="card-body p-4">
          <h3 className="font-semibold mb-3">Buat Transaksi Baru</h3>
          <div className="flex flex-wrap gap-2">
            <button className="btn btn-success btn-sm gap-2" onClick={() => { setCurrentTransactionType('ipl'); setTransactionToEdit(null); setIsDrawerOpen(true); }}>
              <FaExchangeAlt className="h-4 w-4" /> IPL
            </button>
            <button className="btn btn-primary btn-sm gap-2" onClick={() => { setCurrentTransactionType('income'); setTransactionToEdit(null); setIsDrawerOpen(true); }}>
              <FaRegArrowAltCircleDown className="h-4 w-4" /> Masuk
            </button>
            <button className="btn btn-error btn-sm gap-2" onClick={() => { setCurrentTransactionType('expense'); setTransactionToEdit(null); setIsDrawerOpen(true); }}>
              <FaRegArrowAltCircleUp className="h-4 w-4" /> Keluar
            </button>
          </div>
        </div>
      </div>

      <TransactionDrawer
        isOpen={isDrawerOpen}
        onClose={() => { setIsDrawerOpen(false); setCurrentTransactionType(''); setTransactionToEdit(null); }}
        onSubmit={transactionToEdit ? handleUpdateTransaction : async (data) => {
          try {
            const response = await axios.post(
              `${process.env.NEXT_PUBLIC_API_URL}/transactions/create`,
              data,
              { headers: { Authorization: `Bearer ${session.accessToken}`, 'Content-Type': 'application/json' } }
            );
            const waNumber = response.data.whatsapp_notification || data.whatsapp_notification;
            if (data.transaction_type === 'ipl' && waNumber) {
              const bodyMessage = buildIPLSuccessMessage(response.data, baseUrl);
              try {
                await axios.post(`${process.env.NEXT_PUBLIC_WABOTAPI_URL}notify`, { number: waNumber, bodyMessage }, {
                  headers: { 'Content-Type': 'application/json' },
                });
              } catch (_) {}
            }
            showNotification('success', 'Transaksi berhasil ditambahkan');
            fetchTransactions();
          } catch (error) {
            showNotification('error', 'Gagal menambahkan transaksi');
            console.error('Error creating transaction:', error);
          }
        }}
        transactionType={currentTransactionType}
        transactionToEdit={transactionToEdit}
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="flex-1 min-w-[120px]">
          <SearchInput value={searchTerm} onChange={(val) => setSearchTerm(val)} />
        </div>
        <FilterTransactions className="flex-1 min-w-[120px]" setTransactions={setTransactions} initialTransaction={reTransactions} />
        <div className="flex-1 min-w-[120px]">
          <Select
            options={TrxType}
            value={TrxType.find(o => o.value === selectedType)}
            onChange={handleTypeChange}
            placeholder="Type"
            className="text-sm"
            styles={selectStyles}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-2 mb-4 justify-between items-center">
        <div className="join">
          <button className="join-item btn btn-ghost btn-xs gap-1">
            <MdOutlineAccountBalanceWallet className="text-primary h-4 w-4" />
            <span className="text-primary text-xs">{formatCurrency(totalAmount || 0)}</span>
          </button>
          <button className="join-item btn btn-ghost btn-xs gap-1">
            <FaRegArrowAltCircleDown className="text-success h-4 w-4" />
            <span className="text-success text-xs">{formatCurrency(totalIncome || 0)}</span>
          </button>
          <button className="join-item btn btn-ghost btn-xs gap-1">
            <FaRegArrowAltCircleUp className="text-error h-4 w-4" />
            <span className="text-error text-xs">{formatCurrency(totalExpense || 0)}</span>
          </button>
        </div>
        <span className="text-xs text-base-content/50">
          Last Update: {moment(lastUpdate).tz('Asia/Jakarta').format('DD/MM/YYYY, HH:mm')}
        </span>
      </div>

      {/* Table */}
      <ResponsiveTable
        data={currentPageData}
        columns={columns}
        renderMobileCard={renderMobileCard}
        renderDesktopRow={renderDesktopRow}
      />

      <Pagination
        pageCount={Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE)}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />

      <ConfirmModal
        isOpen={showDeleteModal}
        message="Apakah Anda yakin ingin menghapus transaksi ini?"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </>
  );
};

Transaction.getLayout = (page) => (
  <DashboardLayout title="Data Transaksi">{page}</DashboardLayout>
);

export const getServerSideProps = async (context) => {
  const session = await getSession(context);
  if (!session) return { redirect: { destination: '/', permanent: false } };
  try {
    const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/transactions/all`, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    });
    const transactions = res.data.data.transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    return { props: { initialTransaction: transactions } };
  } catch (error) {
    return { props: { initialTransaction: [] } };
  }
};

export default Transaction;
