import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import axios from 'axios';
import moment from 'moment';
import { ITEMS_PER_PAGE } from '../../utils/constants';

/**
 * useHousesData - Custom hook for managing houses data and state
 *
 * Features:
 * - Centralized state management for houses
 * - Memoized filtering and stats calculations
 * - Filter state management (search, group, status, period)
 * - Stats calculation (Isi, Kosong, Weekend counts)
 * - Pagination management
 * - Loading and error states
 *
 * @param {Object} options
 * @param {Array} options.initialHouses - Initial houses data from SSR
 * @param {string} options.accessToken - Session access token for API calls
 * @returns {Object} Houses state and actions
 */
export const useHousesData = ({ initialHouses = [], accessToken }) => {
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
        `${process.env.NEXT_PUBLIC_API_URL}/houses/all`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          signal: abortControllerRef.current.signal,
        }
      );
      setHouses(res.data.data);
      setLastUpdated(new Date().toISOString());
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Gagal memuat data rumah');
        console.error('Error fetching houses data:', err);
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

      // Search filter
      const matchesSearch =
        filters.search === '' ||
        house?.resident_name?.toLowerCase().includes(searchLower) ||
        house?.house_id?.toLowerCase().includes(searchLower);

      // Group filter
      const matchesGroup =
        filters.group === '' ||
        house?.group?.toLowerCase() === groupLower;

      // Status filter (based on monthly_status for selected period)
      const monthStatus = house.monthly_status?.find(
        (status) => status.month === selectedPeriod
      )?.status;
      const matchesStatus =
        filters.status === '' || monthStatus === filters.status;

      return matchesSearch && matchesGroup && matchesStatus;
    });
  }, [houses, filters]);

  /**
   * Calculate stats for selected period
   */
  const stats = useMemo(() => {
    const selectedPeriod = filters.period;

    const result = houses.reduce(
      (acc, house) => {
        const monthStatus = house.monthly_status?.find(
          (status) => status.month === selectedPeriod
        )?.status;

        if (monthStatus) {
          acc.total++;
          if (monthStatus === 'Isi') {
            acc.isi++;
          } else if (monthStatus === 'Kosong') {
            acc.kosong++;
          } else if (monthStatus === 'Weekend') {
            acc.weekend++;
          }
        }

        return acc;
      },
      { total: 0, isi: 0, kosong: 0, weekend: 0 }
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
   * Set period filter
   */
  const setPeriod = useCallback((period) => {
    setFilters((prev) => ({ ...prev, period }));
    setCurrentPage(0);
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

export default useHousesData;
