import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import axios from 'axios';
import { ITEMS_PER_PAGE } from '../../utils/constants';

/**
 * useTransactions - Custom hook for managing transaction data and state
 * 
 * Features:
 * - Centralized state management for transactions
 * - Memoized filtering and stats calculations
 * - Debounced search input
 * - Pagination management
 * - CRUD operations (create, read, update, delete)
 * - Loading and error states
 * 
 * @param {Object} options
 * @param {Array} options.initialTransactions - Initial transaction data from SSR
 * @param {string} options.accessToken - Session access token for API calls
 * @returns {Object} Transaction state and actions
 */
export const useTransactions = ({ initialTransactions = [], accessToken }) => {
  // Data state
  const [transactions, setTransactions] = useState(initialTransactions);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Filter state
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    paymentType: '',
    dateRange: [null, null],
  });
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);

  // Abort controller for cleanup
  const abortControllerRef = useRef(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search);
      setCurrentPage(0); // Reset page when search changes
    }, 300);
    return () => clearTimeout(timer);
  }, [filters.search]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(0);
  }, [filters.type, filters.paymentType, filters.dateRange]);

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  /**
   * Fetch transactions from API
   */
  const refresh = useCallback(async () => {
    if (!accessToken) return;

    setLoading(true);
    setError(null);

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/transactions/all`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          signal: abortControllerRef.current.signal,
        }
      );
      const sorted = res.data.data.transactions.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setTransactions(sorted);
      setLastUpdated(res.data.lastUpdate || new Date().toISOString());
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Gagal memuat data transaksi');
        console.error('Error fetching transactions:', err);
      }
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  /**
   * Filter transactions based on current filters
   */
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      // Type filter
      const matchesType = filters.type ? t.transaction_type === filters.type : true;

      // Payment type filter
      const matchesPaymentType = filters.paymentType
        ? t.payment_type === filters.paymentType
        : true;

      // Search filter (debounced)
      const searchLower = debouncedSearch.toLowerCase();
      const matchesSearch = debouncedSearch
        ? t?.description?.toLowerCase().includes(searchLower) ||
          t?.transaction_id?.toLowerCase().includes(searchLower)
        : true;

      // Date range filter
      let matchesDateRange = true;
      if (filters.dateRange[0] && filters.dateRange[1]) {
        const txDate = new Date(t.date);
        const startDate = new Date(filters.dateRange[0]);
        const endDate = new Date(filters.dateRange[1]);
        endDate.setDate(endDate.getDate() + 1); // Include end date
        matchesDateRange = txDate >= startDate && txDate <= endDate;
      }

      return matchesType && matchesPaymentType && matchesSearch && matchesDateRange;
    });
  }, [transactions, filters.type, filters.paymentType, debouncedSearch, filters.dateRange]);

  /**
   * Calculate stats from filtered transactions
   */
  const stats = useMemo(() => {
    const result = filteredTransactions.reduce(
      (acc, t) => {
        if (t.status === 'berhasil') {
          if (t.transaction_type === 'ipl' || t.transaction_type === 'income') {
            acc.totalIncome += t.amount;
            acc.netBalance += t.amount;
          } else if (t.transaction_type === 'expense') {
            acc.totalExpense += t.amount;
            acc.netBalance -= t.amount;
          }
        }
        // Calculate IPL Paguyuban total (transactions with #IPLPaguyuban in description)
        if (t.description?.toLowerCase().includes('#iplpaguyuban')) {
          acc.iplPaguyubanTotal += t.amount;
          acc.hasIplPaguyuban = true;
        }
        acc.count += 1;
        return acc;
      },
      { netBalance: 0, totalIncome: 0, totalExpense: 0, iplPaguyubanTotal: 0, hasIplPaguyuban: false, count: 0 }
    );
    // Calculate balance after Paguyuban deduction
    result.balanceAfterPaguyuban = result.netBalance - result.iplPaguyubanTotal;
    return result;
  }, [filteredTransactions]);

  /**
   * Paginated data
   */
  const paginatedData = useMemo(() => {
    const offset = currentPage * ITEMS_PER_PAGE;
    return filteredTransactions.slice(offset, offset + ITEMS_PER_PAGE);
  }, [filteredTransactions, currentPage]);

  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);

  /**
   * Update a single filter
   */
  const setFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  /**
   * Clear all filters
   */
  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      type: '',
      paymentType: '',
      dateRange: [null, null],
    });
    setCurrentPage(0);
  }, []);

  /**
   * Delete a transaction
   */
  const deleteTransaction = useCallback(
    async (transactionId) => {
      if (!accessToken) return { success: false, error: 'No access token' };

      try {
        await axios.delete(
          `${process.env.NEXT_PUBLIC_API_URL}/transactions/delete/${transactionId}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        // Refresh data after delete
        await refresh();
        return { success: true };
      } catch (err) {
        console.error('Error deleting transaction:', err);
        return { success: false, error: err.message || 'Gagal menghapus transaksi' };
      }
    },
    [accessToken, refresh]
  );

  /**
   * Get a single transaction by ID
   */
  const getTransaction = useCallback(
    async (transactionId) => {
      if (!accessToken) return null;

      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/transactions/${transactionId}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        return res.data;
      } catch (err) {
        console.error('Error fetching transaction:', err);
        return null;
      }
    },
    [accessToken]
  );

  /**
   * Create a new transaction
   */
  const createTransaction = useCallback(
    async (data) => {
      if (!accessToken) return { success: false, error: 'No access token' };

      try {
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/transactions/create`,
          data,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          }
        );
        await refresh();
        return { success: true, data: res.data };
      } catch (err) {
        console.error('Error creating transaction:', err);
        return { success: false, error: err.message || 'Gagal membuat transaksi' };
      }
    },
    [accessToken, refresh]
  );

  /**
   * Update an existing transaction
   */
  const updateTransaction = useCallback(
    async (transactionId, data) => {
      if (!accessToken) return { success: false, error: 'No access token' };

      try {
        const res = await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL}/transactions/update/${transactionId}`,
          data,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          }
        );
        await refresh();
        return { success: true, data: res.data };
      } catch (err) {
        console.error('Error updating transaction:', err);
        return { success: false, error: err.message || 'Gagal mengupdate transaksi' };
      }
    },
    [accessToken, refresh]
  );

  return {
    // Data
    transactions,
    filteredTransactions,
    paginatedData,
    
    // Filters
    filters,
    setFilter,
    clearFilters,
    
    // Pagination
    currentPage,
    setCurrentPage,
    totalPages,
    
    // Stats
    stats,
    
    // State
    loading,
    error,
    lastUpdated,
    
    // Actions
    refresh,
    deleteTransaction,
    getTransaction,
    createTransaction,
    updateTransaction,
  };
};

export default useTransactions;
