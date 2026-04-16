import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import 'moment/locale/id';
import id from "date-fns/locale/id";

moment.locale('id');

/**
 * FilterCashflow Component
 * Filter transaksi berdasarkan rentang tanggal
 * 
 * @param {Object} props
 * @param {Function} props.setTransactions - Setter untuk transactions
 * @param {Array} props.initialTransaction - Data transaksi awal
 * @param {Date} props.initialStartDate - Tanggal mulai awal
 * @param {Date} props.initialEndDate - Tanggal akhir awal
 * @param {Function} props.setCurrentPage - Setter untuk current page
 * @param {Function} props.onError - Handler error (opsional)
 */
const FilterCashflow = ({ 
  setTransactions, 
  initialTransaction,
  initialStartDate,
  initialEndDate,
  setCurrentPage,
  onError
}) => {
  const [dateRange, setDateRange] = useState([initialStartDate, initialEndDate]);
  const [startDate, endDate] = dateRange;
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleFilter = useCallback(async (startDate, endDate) => {
    if (!startDate || !endDate) return;
    
    setIsLoading(true);
    
    try {
      const startDateAdjusted = new Date(startDate);
      const endDateAdjusted = new Date(endDate);

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/transactions/filter`,
        {
          params: {
            startDate: startDateAdjusted,
            endDate: endDateAdjusted,
          },
          timeout: 10000
        }
      );
      
      const transactionsData = response.data?.data?.transactions || [];
      const sorted = transactionsData.sort((a, b) => 
        new Date(b.date) - new Date(a.date)
      );
      
      setCurrentPage(0);
      setTransactions(sorted);
    } catch (error) {
      console.error('[FilterCashflow] Error fetching filtered transactions:', error);
      if (onError) {
        onError('Gagal memfilter transaksi. Silakan coba lagi.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [setCurrentPage, setTransactions, onError]);

  const handleDataRange = useCallback((update) => {
    setDateRange(update);
    
    // Jika kedua tanggal null, reset ke data awal
    if (update[0] === null && update[1] === null) {
      setTransactions(initialTransaction);
      const query = { ...router.query };
      delete query.startDate;
      delete query.endDate;
      router.push({
        pathname: '/cashflow',
        query: query,
      });
    } else if (update[0] && update[1]) {
      // Hanya filter jika kedua tanggal terisi
      handleFilter(update[0], update[1]);
      const startStr = moment(update[0]).format('YYYY-MM-DD');
      const endStr = moment(update[1]).format('YYYY-MM-DD');
      
      router.push({
        pathname: '/cashflow',
        query: { 
          ...router.query, 
          startDate: startStr, 
          endDate: endStr,
          page: undefined 
        },
      });
    }
  }, [initialTransaction, router, setTransactions, handleFilter]);

  useEffect(() => {
    if (router.query.startDate && router.query.endDate && !dateRange[0]) {
      const start = moment(router.query.startDate, 'YYYY-MM-DD').toDate();
      const end = moment(router.query.endDate, 'YYYY-MM-DD').toDate();
      setDateRange([start, end]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query.startDate, router.query.endDate]);

  return (
    <div className="relative">
      <DatePicker
        locale={id}
        selectsRange={true}
        startDate={startDate}
        endDate={endDate}
        onChange={handleDataRange}
        placeholderText="Rentang Tanggal"
        dateFormat="dd/MM/yy"
        isClearable={true}
        disabled={isLoading}
        className="app-input w-full"
      />
      {isLoading && (
        <div className="absolute right-10 top-1/2 -translate-y-1/2">
          <span className="loading loading-spinner loading-xs text-primary"></span>
        </div>
      )}
    </div>
  );
};

export default FilterCashflow;
