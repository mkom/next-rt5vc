import { getSession, useSession } from 'next-auth/react';
import { useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import moment from 'moment';
import 'moment-timezone';

// Layout & Components
import DashboardLayout from '../../components/layouts/DashboardLayout';
import PageHeader from '../../components/dashboard/PageHeader';
import TransactionStats from '../../components/dashboard/TransactionStats';
import TransactionFilters from '../../components/dashboard/TransactionFilters';
import TransactionTable from '../../components/dashboard/TransactionTable';
import TransactionDrawer from '../../components/dashboard/TransactionDrawer';
import ConfirmModal from '../../components/ui/ConfirmModal';
import Alert from '../../components/ui/Alert';
import Pagination from '../../components/ui/Pagination';

// Hooks
import { useTransactions } from '../../lib/hooks/useTransactions';

// Utils
import { formatCurrency } from '../../utils/format';
import { ITEMS_PER_PAGE } from '../../utils/constants';

// Icons
import {
  FaExchangeAlt,
  FaRegArrowAltCircleDown,
  FaRegArrowAltCircleUp,
} from 'react-icons/fa';

/**
 * Build WhatsApp success message for IPL payment
 */
const buildIPLSuccessMessage = (txData, baseUrl) => {
  const houseId = txData.house?.house_id || '';
  const IPLUrl = `${baseUrl}/ipl/${houseId.toLowerCase()}`;
  return (
    `*Konfirmasi Pembayaran IPL Berhasil!*\n\n` +
    `Setelah kami melakukan pengecekan, kami informasikan bahwa pembayaran IPL Bapak/Ibu telah berhasil masuk ke sistem kami.\n\n` +
    `*Detail:*\n*ID:* ${txData.transaction_id}\n*Deskripsi:*\n${txData.description}\n` +
    `*Jumlah:* ${formatCurrency(txData.amount)}\n` +
    `*Tanggal Pembayaran:* ${moment(txData.date).format('DD MMM YYYY')}\n` +
    (houseId ? `\n*Cek IPL:* ${houseId} ${IPLUrl}\n\n` : '') +
    `Terima kasih telah melakukan pembayaran IPL RT 05 RW 11, Villa Citayam.\n\n*Hormat Kami*\nRT 005 Villa Citayam.\n`
  );
};

/**
 * Build WhatsApp failure message for IPL payment
 */
const buildIPLFailureMessage = (txData) => {
  return (
    `*Konfirmasi Pembayaran IPL Gagal!*\n\n` +
    `Setelah kami melakukan pengecekan, kami informasikan bahwa pembayaran IPL Bapak/Ibu Dibatalkan.\n\n` +
    `*Detail:*\n*ID:* ${txData.transaction_id}\n*Deskripsi:*\n${txData.description}\n` +
    `*Jumlah:* ${formatCurrency(txData.amount)}\n` +
    `*Tanggal Pembayaran:* ${moment(txData.date).format('DD MMM YYYY')}\n\n` +
    `*Alasan Pembatalan:*\n${txData.additional_note}\n\n` +
    `Demikian informasi yang dapat kami sampaikan.\n\n*Hormat Kami*\nRT 005 Villa Citayam.\n`
  );
};

/**
 * Transactions Page - Manage all financial transactions
 *
 * Features:
 * - KPI stats summary (net balance, income, expense, count)
 * - Advanced filtering (search, date range, type)
 * - CRUD operations with optimistic updates
 * - WhatsApp notifications for IPL transactions
 * - Responsive table with mobile card view
 * - Accessible UI with keyboard navigation
 *
 * @param {Object} props
 * @param {Array} props.initialTransactions - Initial data from SSR
 * @param {string} props.error - Error message from SSR (if any)
 */
const Transactions = ({ initialTransactions, error: serverError }) => {
  const { data: session } = useSession();
  const [baseUrl, setBaseUrl] = useState('');

  // Initialize base URL on client side
  useMemo(() => {
    if (typeof window !== 'undefined') {
      setBaseUrl(window.location.origin);
    }
  }, []);

  // Custom hook for transaction management
  const {
    transactions,
    filteredTransactions,
    paginatedData,
    filters,
    setFilter,
    clearFilters,
    currentPage,
    setCurrentPage,
    totalPages,
    stats,
    loading,
    error: fetchError,
    lastUpdated,
    refresh,
    deleteTransaction,
    getTransaction,
    createTransaction,
    updateTransaction,
  } = useTransactions({
    initialTransactions,
    accessToken: session?.accessToken,
  });

  // Local UI state
  const [notification, setNotification] = useState({
    show: false,
    type: 'success',
    message: '',
  });
  const [deleteModal, setDeleteModal] = useState({
    show: false,
    transactionId: null,
  });
  const [drawer, setDrawer] = useState({
    isOpen: false,
    transactionType: '',
    transactionToEdit: null,
  });

  // Check if any filter is active
  const hasActiveFilters = useMemo(() => {
    return (
      filters.search ||
      filters.type ||
      filters.paymentType ||
      (filters.dateRange[0] && filters.dateRange[1])
    );
  }, [filters]);

  // Show notification helper
  const showNotification = useCallback((type, message) => {
    setNotification({ show: true, type, message });
    // Auto-hide after 5 seconds
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, show: false }));
    }, 5000);
  }, []);

  // Handle delete click
  const handleDeleteClick = useCallback((transactionId) => {
    setDeleteModal({ show: true, transactionId });
  }, []);

  // Handle confirm delete
  const handleConfirmDelete = useCallback(async () => {
    if (!deleteModal.transactionId) return;

    const result = await deleteTransaction(deleteModal.transactionId);

    if (result.success) {
      showNotification('success', 'Transaksi berhasil dihapus');
    } else {
      showNotification('error', result.error || 'Gagal menghapus transaksi');
    }

    setDeleteModal({ show: false, transactionId: null });
  }, [deleteModal.transactionId, deleteTransaction, showNotification]);

  // Handle edit click
  const handleEditClick = useCallback(
    async (transactionId, transactionType) => {
      const data = await getTransaction(transactionId);
      if (data) {
        setDrawer({
          isOpen: true,
          transactionType,
          transactionToEdit: data,
        });
      }
    },
    [getTransaction]
  );

  // Handle create new transaction
  const handleCreate = useCallback(async (data) => {
    const result = await createTransaction(data);

    if (result.success) {
      // Send WhatsApp notification for IPL
      if (data.transaction_type === 'ipl' && data.whatsapp_notification) {
        try {
          const bodyMessage = buildIPLSuccessMessage(result.data, baseUrl);
          await axios.post(
            `${process.env.NEXT_PUBLIC_WABOTAPI_URL}notify`,
            { number: data.whatsapp_notification, bodyMessage },
            { headers: { 'Content-Type': 'application/json' } }
          );
        } catch (err) {
          // Silent fail for WhatsApp notification
          console.error('WhatsApp notification failed:', err);
        }
      }
      showNotification('success', 'Transaksi berhasil ditambahkan');
      setDrawer({ isOpen: false, transactionType: '', transactionToEdit: null });
      return true;
    } else {
      showNotification('error', result.error || 'Gagal menambahkan transaksi');
      return false;
    }
  }, [createTransaction, baseUrl, showNotification]);

  // Handle update transaction
  const handleUpdate = useCallback(async (data) => {
    if (!drawer.transactionToEdit?._id) return false;

    const result = await updateTransaction(drawer.transactionToEdit._id, data);

    if (result.success) {
      // Send WhatsApp notification based on status
      const waNumber = result.data.whatsapp_notification || data.whatsapp_notification;
      if (waNumber) {
        let bodyMessage;
        if (result.data.status === 'berhasil') {
          bodyMessage = buildIPLSuccessMessage(result.data, baseUrl);
        } else if (result.data.status === 'gagal') {
          bodyMessage = buildIPLFailureMessage(result.data);
        }

        if (bodyMessage) {
          try {
            await axios.post(
              `${process.env.NEXT_PUBLIC_WABOTAPI_URL}notify`,
              { number: waNumber, bodyMessage },
              { headers: { 'Content-Type': 'application/json' } }
            );
          } catch (err) {
            // Silent fail for WhatsApp notification
            console.error('WhatsApp notification failed:', err);
          }
        }
      }
      showNotification('success', 'Transaksi berhasil diupdate');
      setDrawer({ isOpen: false, transactionType: '', transactionToEdit: null });
      return true;
    } else {
      showNotification('error', result.error || 'Gagal mengupdate transaksi');
      return false;
    }
  }, [drawer.transactionToEdit, updateTransaction, baseUrl, showNotification]);

  // Handle date range change from FilterTransactions
  const handleDateRangeChange = useCallback(
    (newTransactions) => {
      // This is handled by the useTransactions hook now
      // Just need to make sure pagination resets
      setCurrentPage(0);
    },
    [setCurrentPage]
  );

  // Open drawer for new transaction
  const openNewTransactionDrawer = useCallback((type) => {
    setDrawer({
      isOpen: true,
      transactionType: type,
      transactionToEdit: null,
    });
  }, []);

  // Close drawer
  const closeDrawer = useCallback(() => {
    setDrawer({ isOpen: false, transactionType: '', transactionToEdit: null });
  }, []);

  // New transaction buttons
  const newTransactionButtons = (
    <div className="flex flex-wrap gap-2">
      <button
        className="btn btn-success btn-sm gap-2"
        onClick={() => openNewTransactionDrawer('ipl')}
        aria-label="Buat transaksi IPL baru"
      >
        <FaExchangeAlt className="h-4 w-4" /> IPL
      </button>
      <button
        className="btn btn-primary btn-sm gap-2"
        onClick={() => openNewTransactionDrawer('income')}
        aria-label="Buat transaksi masuk baru"
      >
        <FaRegArrowAltCircleDown className="h-4 w-4" /> Masuk
      </button>
      <button
        className="btn btn-error btn-sm gap-2"
        onClick={() => openNewTransactionDrawer('expense')}
        aria-label="Buat transaksi keluar baru"
      >
        <FaRegArrowAltCircleUp className="h-4 w-4" /> Keluar
      </button>
    </div>
  );

  // Combine server and client errors
  const error = serverError || fetchError;

  return (
    <section className="flex flex-col gap-6 animate-fade-in">
      {/* Alert Notification */}
      <Alert
        show={notification.show}
        type={notification.type}
        message={notification.message}
        onClose={() => setNotification((prev) => ({ ...prev, show: false }))}
      />

      {/* Page Header */}
      <PageHeader
        title="Data Transaksi"
        subtitle="Kelola dan monitor semua transaksi keuangan"
        actions={newTransactionButtons}
        onRefresh={refresh}
        refreshing={loading}
        lastUpdated={lastUpdated}
      />

      {/* Error State */}
      {error && (
        <div className="alert alert-error shadow-lg animate-fade-in">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>Gagal memuat data: {error}</span>
        </div>
      )}

      {/* Stats Summary */}
      <TransactionStats stats={stats} loading={loading && transactions.length === 0} />

      {/* Filters */}
      <TransactionFilters
        filters={filters}
        onChange={setFilter}
        onClear={clearFilters}
        onDateRangeChange={handleDateRangeChange}
        initialTransactions={transactions}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Transaction Table */}
      <TransactionTable
        transactions={paginatedData}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
        offset={currentPage * ITEMS_PER_PAGE}
        loading={loading}
      />

      {/* Pagination */}
      <Pagination
        pageCount={totalPages}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />

      {/* Transaction Drawer (Create/Edit) */}
      <TransactionDrawer
        isOpen={drawer.isOpen}
        onClose={closeDrawer}
        onSubmit={drawer.transactionToEdit ? handleUpdate : handleCreate}
        transactionType={drawer.transactionType}
        transactionToEdit={drawer.transactionToEdit}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.show}
        message="Apakah Anda yakin ingin menghapus transaksi ini?"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModal({ show: false, transactionId: null })}
      />
    </section>
  );
};

/**
 * Server-side protection - Hanya admin yang boleh akses
 */
export const getServerSideProps = async (context) => {
  const session = await getSession(context);

  // Check authentication
  if (!session) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  // Check authorization - HANYA admin yang boleh akses
  if (session.user?.role !== 'admin') {
    return {
      redirect: {
        destination: '/?access_denied=true',
        permanent: false,
      },
    };
  }

  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/transactions/all`,
      {
        headers: { Authorization: `Bearer ${session.accessToken}` },
      }
    );
    const transactions = res.data.data.transactions.sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
    return {
      props: {
        initialTransactions: transactions,
        error: null,
      },
    };
  } catch (error) {
    console.error('Error fetching initial transactions:', error);
    return {
      props: {
        initialTransactions: [],
        error: error.message || 'Failed to fetch transactions',
      },
    };
  }
};

Transactions.getLayout = (page) => (
  <DashboardLayout title="Data Transaksi">{page}</DashboardLayout>
);

export default Transactions;
