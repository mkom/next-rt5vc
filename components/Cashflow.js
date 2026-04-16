import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import moment from 'moment-timezone';
import { FaHistory } from 'react-icons/fa';

// Hooks
import { useCashflow } from '../hooks/useCashflow';

// Utils
import { formatCurrency } from '../utils/format';
import { ITEMS_PER_PAGE } from '../utils/constants';
import { calculateTotals } from '../utils/transactionHelpers';

// UI Components
import SearchInput from './ui/SearchInput';
import Pagination from './ui/Pagination';
import EmptyState from './ui/EmptyState';
import ErrorState from './ui/ErrorState';
import MonthOptions from './MonthOptions';
import { selectStyles } from '../utils/selectStyles';

// Cashflow Components
import CashflowStats from './Cashflow/CashflowStats';
import CashflowCard from './Cashflow/CashflowCard';
import CashflowSkeleton from './Cashflow/CashflowSkeleton';
import CashflowModal from './Cashflow/CashflowModal';

// Third-party
import Select from 'react-select';

/**
 * AllCashflow Component
 * Halaman laporan arus kas dengan UI/UX konsisten
 */
const AllCashflow = ({ initialTransaction }) => {
  const router = useRouter();
  const { period, s, page, type, category } = router.query;

  // Local state
  const [searchTerm, setSearchTerm] = useState(s || '');
  const [selectedPeriod, setSelectedPeriod] = useState(period || '');
  const [currentPage, setCurrentPage] = useState(parseInt(page) || 0);
  const [selectedTransactionType, setSelectedTransactionType] = useState(type || null);
  const [selectedCategory, setSelectedCategory] = useState(category || '');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  // Fetch data with hook
  const {
    transactions,
    loading,
    skeleton,
    lastUpdate,
    error,
    retryCount,
    refetch
  } = useCashflow({ period: selectedPeriod });

  // Sync with URL query params
  useEffect(() => {
    if (s !== undefined) setSearchTerm(s);
    if (period !== undefined) setSelectedPeriod(period);
    if (page !== undefined) setCurrentPage(parseInt(page) || 0);
    if (type !== undefined) {
      setSelectedTransactionType(type || null);
    } else {
      setSelectedTransactionType(null);
    }
    if (category !== undefined) {
      setSelectedCategory(category || '');
    } else {
      setSelectedCategory('');
    }
  }, [s, period, page, type, category]);

  // Calculate totals
  const { totalIncome, totalExpense, totalAmount, totalIpl } = useMemo(() => {
    const baseTotals = calculateTotals(transactions, selectedPeriod || null);
    
    // Calculate IPL total separately
    const iplTotal = transactions
      .filter(t => {
        if (selectedPeriod) {
          const tMonth = moment(t.date).format('YYYY-MM');
          return tMonth === selectedPeriod && t.transaction_type === 'ipl' && t.status === 'berhasil';
        }
        return t.transaction_type === 'ipl' && t.status === 'berhasil';
      })
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    
    return { ...baseTotals, totalIpl: iplTotal };
  }, [transactions, selectedPeriod]);

  // Transaction type filter options
  const transactionTypeOptions = [
    { value: '', label: 'Semua Tipe' },
    { value: 'income', label: 'Pemasukan' },
    { value: 'expense', label: 'Pengeluaran' },
    { value: 'ipl', label: 'IPL' },
  ];

  // Category filter options
  const categoryOptions = [
    { value: '', label: 'Semua Kategori' },
    { value: 'Rutin', label: 'Rutin' },
    { value: 'Lain - Lain', label: 'Lain-Lain' },
    { value: 'Fasilitas Sosial', label: 'Fasilitas Sosial' },
    { value: 'Fasilitas Umum', label: 'Fasilitas Umum' },
  ];

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      // Filter by period
      const transactionMonth = transaction.date ? moment(transaction.date).format('YYYY-MM') : null;
      const matchesPeriod = selectedPeriod ? transactionMonth === selectedPeriod : true;

      // Filter by search term
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = searchTerm === '' || (
        (transaction.description?.toLowerCase().includes(searchLower)) ||
        (transaction.transaction_id?.toLowerCase().includes(searchLower))
      );

      // Filter by transaction type
      const matchesType = selectedTransactionType
        ? (selectedTransactionType === 'income'
            ? transaction.transaction_type === 'income' || transaction.transaction_type === 'ipl'
            : transaction.transaction_type === selectedTransactionType)
        : true;

      // Filter by category
      const matchesCategory = selectedCategory
        ? transaction.transaction_category === selectedCategory
        : true;

      return matchesPeriod && matchesSearch && matchesType && matchesCategory;
    });
  }, [transactions, selectedPeriod, searchTerm, selectedTransactionType, selectedCategory]);

  // Pagination
  const pageCount = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
  const offset = currentPage * ITEMS_PER_PAGE;
  const currentPageData = filteredTransactions.slice(offset, offset + ITEMS_PER_PAGE);

  // Handlers
  const handleSearchChange = useCallback((query) => {
    setSelectedTransactionType(null);
    setCurrentPage(0);
    setSearchTerm(query);

    const queryObj = { ...router.query };
    delete queryObj.startDate;
    delete queryObj.endDate;

    if (query === '') {
      delete queryObj.s;
      delete queryObj.page;
    } else {
      queryObj.s = query;
      queryObj.page = undefined;
    }

    router.push({
      pathname: '/cashflow',
      query: queryObj,
    }, undefined, { shallow: true });
  }, [router]);

  const handleMonthChange = useCallback((selectedOption) => {
    setCurrentPage(0);
    const value = selectedOption?.value || '';
    setSelectedPeriod(value);

    const queryObj = { ...router.query };
    if (value === '') {
      delete queryObj.period;
    } else {
      queryObj.period = value;
    }
    delete queryObj.page;

    router.push({
      pathname: '/cashflow',
      query: queryObj,
    }, undefined, { shallow: true });
  }, [router]);

  const handleTransactionTypeToggle = useCallback((type) => {
    setCurrentPage(0);
    setSelectedTransactionType(prev => prev === type ? null : type);
  }, []);

  const handleTransactionTypeChange = useCallback((selectedOption) => {
    setCurrentPage(0);
    const value = selectedOption?.value || '';
    setSelectedTransactionType(value || null);

    const queryObj = { ...router.query };
    if (value === '') {
      delete queryObj.type;
    } else {
      queryObj.type = value;
    }
    delete queryObj.page;

    router.push({
      pathname: '/cashflow',
      query: queryObj,
    }, undefined, { shallow: true });
  }, [router]);

  const handleCategoryChange = useCallback((selectedOption) => {
    setCurrentPage(0);
    const value = selectedOption?.value || '';
    setSelectedCategory(value);

    const queryObj = { ...router.query };
    if (value === '') {
      delete queryObj.category;
    } else {
      queryObj.category = value;
    }
    delete queryObj.page;

    router.push({
      pathname: '/cashflow',
      query: queryObj,
    }, undefined, { shallow: true });
  }, [router]);

  const handlePageClick = useCallback((selected) => {
    setCurrentPage(selected);
    
    const queryObj = { ...router.query, page: selected };
    router.push({
      pathname: '/cashflow',
      query: queryObj,
    }, undefined, { shallow: true });

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [router]);

  const openModal = useCallback((transaction) => {
    setSelectedTransaction(transaction);
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setTimeout(() => setSelectedTransaction(null), 300);
  }, []);

  // Format last update
  const formattedLastUpdate = lastUpdate && lastUpdate !== '-'
    ? moment(lastUpdate).tz('Asia/Jakarta').format('DD/MM/YYYY, HH:mm')
    : '-';

  // Error state
  if (error && !skeleton) {
    return (
      <div className="flex flex-col gap-4">
        <ErrorState 
          title="Gagal Memuat Data"
          message={error}
          onRetry={refetch}
          retryCount={retryCount}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Stats Cards */}
      {skeleton ? (
        <div className="grid grid-cols-2 gap-2">
          {[1, 2].map(i => (
            <div key={i} className="bg-base-200/50 rounded-2xl p-3 border border-base-200 animate-pulse">
              <div className="h-3 w-16 bg-base-300 rounded mb-2"></div>
              <div className="h-5 w-24 bg-base-300 rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <CashflowStats
          totalIncome={totalIncome}
          totalExpense={totalExpense}
          totalIpl={totalIpl}
          selectedType={selectedTransactionType}
          selectedCategory={selectedCategory}
          onTypeToggle={handleTransactionTypeToggle}
        />
      )}

      {/* Filter Controls */}
      <div className="flex flex-col gap-3 mt-1">
        <SearchInput
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Cari transaksi..."
        />

        <div className="grid grid-cols-2 gap-2">
          <Select
            id="period"
            options={MonthOptions()}
            value={selectedPeriod ? MonthOptions().find(o => o.value === selectedPeriod) : null}
            onChange={handleMonthChange}
            isSearchable={false}
            isClearable={true}
            placeholder="Pilih Bulan"
            styles={selectStyles}
            className="rounded-xl text-sm font-medium"
          />

          <Select
            id="transactionType"
            options={transactionTypeOptions}
            value={transactionTypeOptions.find(o => o.value === (selectedTransactionType || ''))}
            onChange={handleTransactionTypeChange}
            isSearchable={false}
            isClearable={false}
            placeholder="Tipe Transaksi"
            styles={selectStyles}
            className="rounded-xl text-sm font-medium"
          />
        </div>

        <Select
          id="category"
          options={categoryOptions}
          value={categoryOptions.find(o => o.value === selectedCategory) || categoryOptions[0]}
          onChange={handleCategoryChange}
          isSearchable={false}
          isClearable={false}
          placeholder="Kategori"
          styles={selectStyles}
          className="rounded-xl text-sm font-medium"
        />
      </div>

      {/* Last Update */}
      <div className="flex justify-end">
        <span className="text-xs text-base-content/50">
          Last Update: {formattedLastUpdate}
        </span>
      </div>

      {/* Transaction List */}
      {skeleton ? (
        <CashflowSkeleton count={5} />
      ) : currentPageData.length > 0 ? (
        <div className="flex flex-col gap-2 mt-2">
          {currentPageData.map((transaction) => (
            <CashflowCard 
              key={transaction._id}
              transaction={transaction}
              onClick={() => openModal(transaction)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<FaHistory className="w-12 h-12" />}
          title="Tidak ada transaksi"
          description={(() => {
            const filters = [];
            if (searchTerm) filters.push(`kata kunci "${searchTerm}"`);
            if (selectedPeriod) filters.push(`periode ${selectedPeriod}`);
            if (selectedTransactionType) {
              const typeLabels = { income: 'Pemasukan', expense: 'Pengeluaran', ipl: 'IPL' };
              filters.push(`tipe "${typeLabels[selectedTransactionType] || selectedTransactionType}"`);
            }
            if (selectedCategory) filters.push(`kategori "${selectedCategory}"`);

            if (filters.length > 0) {
              return `Tidak ditemukan transaksi dengan filter: ${filters.join(', ')}`;
            }
            return "Belum ada transaksi tercatat";
          })()}
        />
      )}

      {/* Pagination */}
      {!skeleton && pageCount > 1 && (
        <Pagination
          pageCount={pageCount}
          currentPage={currentPage}
          onPageChange={handlePageClick}
        />
      )}

      {/* Results count */}
      {!skeleton && filteredTransactions.length > 0 && (
        <div className="text-center text-xs text-base-content/40">
          Menampilkan {offset + 1}-{Math.min(offset + ITEMS_PER_PAGE, filteredTransactions.length)} dari {filteredTransactions.length} transaksi
        </div>
      )}

      {/* Modal */}
      <CashflowModal 
        transaction={selectedTransaction}
        isOpen={modalOpen}
        onClose={closeModal}
      />
    </div>
  );
};

export default AllCashflow;
