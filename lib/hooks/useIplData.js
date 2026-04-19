import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import axios from 'axios';
import moment from 'moment';
import { ITEMS_PER_PAGE } from '../../utils/constants';

/**
 * useIplData - Custom hook for managing IPL data and state
 *
 * Features:
 * - Centralized state management for houses
 * - Memoized filtering and stats calculations
 * - Period-based stats calculation
 * - Pagination management
 * - Loading and error states
 *
 * @param {Object} options
 * @param {Array} options.initialHouses - Initial houses data from SSR
 * @param {string} options.accessToken - Session access token for API calls
 * @returns {Object} IPL state and actions
 */
export const useIplData = ({ initialHouses = [], accessToken }) => {
  // Data state
  const [houses, setHouses] = useState(initialHouses);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Filter state - default period is current month
  const [filters, setFilters] = useState({
    search: '',
    group: '',
    status: '',
    period: moment().format('YYYY-MM'),
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);

  // Abort controller for cleanup
  const abortControllerRef = useRef(null);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(0);
  }, [filters.search, filters.group, filters.status]);

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  /**
   * Fetch houses data from API
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
        `${process.env.NEXT_PUBLIC_API_URL_V2}/ipl`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          signal: abortControllerRef.current.signal,
        }
      );
      setHouses(res.data.data);
      setLastUpdated(new Date().toISOString());
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Gagal memuat data IPL');
        console.error('Error fetching IPL data:', err);
      }
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  /**
   * Filter houses based on current filters
   */
  const filteredHouses = useMemo(() => {
    if (!Array.isArray(houses)) return [];

    return houses.filter((house) => {
      const searchLower = filters.search.toLowerCase();
      const groupLower = filters.group.toLowerCase();
      const selectedPeriod = filters.period;

      const monthlyStatus = house.monthly_status?.find(
        (status) => status.month === selectedPeriod
      );

      // Search filter
      const matchesSearch =
        filters.search === '' ||
        house?.resident_name?.toLowerCase().includes(searchLower) ||
        house?.house_id?.toLowerCase().includes(searchLower);

      // Group filter
      const matchesGroup =
        filters.group === '' ||
        house?.group?.toLowerCase() === groupLower;

      // Status filter
      const feeStatus = house.monthly_fees?.find(
        (status) => status.month === selectedPeriod
      )?.status;
      const matchesStatus =
        filters.status === '' || feeStatus === filters.status;

      // Only show houses that have monthly data and are occupied/weekend
      const hasMonthlyData =
        house.monthly_fees?.length > 0 &&
        house.monthly_status?.length > 0 &&
        monthlyStatus &&
        (monthlyStatus.status === 'Isi' || monthlyStatus.status === 'Weekend');

      return matchesSearch && matchesGroup && matchesStatus && hasMonthlyData;
    });
  }, [houses, filters]);

  /**
   * Calculate stats for selected period
   */
  const stats = useMemo(() => {
    const selectedPeriod = filters.period;
    
    const result = houses.reduce(
      (acc, house) => {
        const monthlyFee = house.monthly_fees?.find(
          (status) => status.month === selectedPeriod
        );

        if (monthlyFee) {
          const { status, fee } = monthlyFee;

          if (status === 'Lunas') {
            acc.lunas++;
            acc.totalCollected += fee || 0;
          } else if (status === 'Belum Bayar') {
            acc.belumBayar++;
          } else if (status === 'TBD') {
            acc.tbd++;
          } else if (status === 'Bayar Sebagian') {
            acc.bayarSebagian++;
            acc.totalCollected += fee || 0;
          }
        }

        return acc;
      },
      {
        lunas: 0,
        belumBayar: 0,
        tbd: 0,
        bayarSebagian: 0,
        totalCollected: 0,
      }
    );

    return result;
  }, [houses, filters.period]);

  /**
   * Paginated data
   */
  const paginatedData = useMemo(() => {
    const offset = currentPage * ITEMS_PER_PAGE;
    return filteredHouses.slice(offset, offset + ITEMS_PER_PAGE);
  }, [filteredHouses, currentPage]);

  const totalPages = Math.ceil(filteredHouses.length / ITEMS_PER_PAGE);

  /**
   * Update a single filter
   */
  const setFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  /**
   * Clear all filters except period
   */
  const clearFilters = useCallback(() => {
    setFilters((prev) => ({
      ...prev,
      search: '',
      group: '',
      status: '',
    }));
    setCurrentPage(0);
  }, []);

  /**
   * Set period filter
   */
  const setPeriod = useCallback((period) => {
    setFilters((prev) => ({ ...prev, period }));
    setCurrentPage(0);
  }, []);

  return {
    // Data
    houses,
    filteredHouses,
    paginatedData,

    // Filters
    filters,
    setFilter,
    setPeriod,
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
  };
};

export default useIplData;
