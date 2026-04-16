import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import moment from 'moment';

/**
 * Hook untuk fetching data cashflow
 * @param {Object} options - Konfigurasi hook
 * @param {string} options.period - Periode filter (YYYY-MM)
 * @returns {Object} State dan fungsi untuk cashflow
 */
export const useCashflow = ({ period } = {}) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [skeleton, setSkeleton] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchTransactions = useCallback(async () => {
    try {
      setSkeleton(true);
      setError(null);
      
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/cashflow`,
        { timeout: 15000 }
      );
      
      const data = res.data?.data?.transactions || [];
      const sorted = data.sort((a, b) => 
        new Date(b.date) - new Date(a.date)
      );
      
      setTransactions(sorted);
      setLastUpdate(res.data?.lastUpdate);
      setRetryCount(0);
    } catch (err) {
      console.error('[useCashflow] Error fetching data:', err);
      setError(err.message || 'Gagal memuat data cashflow. Silakan coba lagi.');
    } finally {
      setLoading(false);
      setSkeleton(false);
    }
  }, []);

  const refetch = useCallback(() => {
    setRetryCount(prev => prev + 1);
    fetchTransactions();
  }, [fetchTransactions]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Filter transaksi berdasarkan periode jika ada
  const filteredTransactions = period
    ? transactions.filter(t => {
        const tMonth = t.date ? moment(t.date).format('YYYY-MM') : null;
        return tMonth === period;
      })
    : transactions;

  return {
    transactions,
    filteredTransactions,
    loading,
    skeleton,
    lastUpdate,
    error,
    retryCount,
    fetchTransactions,
    refetch
  };
};

export default useCashflow;
