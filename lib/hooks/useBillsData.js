import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { createAuthenticatedClient } from '../api/client';
import { ITEMS_PER_PAGE } from '../../utils/constants';

/**
 * useBillsData - Custom hook for managing bills/outstanding data and state
 *
 * Features:
 * - Centralized state management for outstanding houses
 * - Memoized filtering and stats calculations
 * - Search filter support
 * - Pagination management
 * - Loading and error states
 *
 * @param {Object} options
 * @param {Array} options.initialHouses - Initial houses data from SSR
 * @param {string} options.accessToken - Session access token for API calls
 * @returns {Object} Bills state and actions
 */
export const useBillsData = ({ initialHouses = [], accessToken }) => {
  // Data state
  const [houses, setHouses] = useState(initialHouses);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Filter state
  const [filters, setFilters] = useState({
    search: '',
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);

  // Abort controller for cleanup
  const abortControllerRef = useRef(null);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(0);
  }, [filters.search]);

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  /**
   * Fetch outstanding houses data from API
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
      const client = createAuthenticatedClient(accessToken);
      const res = await client.get(
        '/houses/outstanding',
        {
          signal: abortControllerRef.current.signal,
        }
      );
      const sorted = res.data.data.sort((a, b) => b.total_fee - a.total_fee);
      setHouses(sorted);
      setLastUpdated(new Date().toISOString());
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Gagal memuat data tagihan');
        console.error('Error fetching bills data:', err);
      }
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  /**
   * Filter houses based on search
   */
  const filteredHouses = useMemo(() => {
    if (!Array.isArray(houses)) return [];

    return houses.filter((house) => {
      const searchLower = filters.search.toLowerCase();
      
      // Search filter
      const matchesSearch =
        filters.search === '' ||
        house?.resident_name?.toLowerCase().includes(searchLower) ||
        house?.house_id?.toLowerCase().includes(searchLower);

      return matchesSearch;
    });
  }, [houses, filters.search]);

  /**
   * Calculate stats from filtered houses
   */
  const stats = useMemo(() => {
    const totalHouses = filteredHouses.length;
    const totalAmount = filteredHouses.reduce((sum, house) => sum + (house.total_fee || 0), 0);
    const averagePerHouse = totalHouses > 0 ? totalAmount / totalHouses : 0;

    return {
      totalHouses,
      totalAmount,
      averagePerHouse,
    };
  }, [filteredHouses]);

  /**
   * Paginated data
   */
  const paginatedData = useMemo(() => {
    const offset = currentPage * ITEMS_PER_PAGE;
    return filteredHouses.slice(offset, offset + ITEMS_PER_PAGE);
  }, [filteredHouses, currentPage]);

  const totalPages = Math.ceil(filteredHouses.length / ITEMS_PER_PAGE);

  /**
   * Update search filter
   */
  const setFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  /**
   * Clear search filter
   */
  const clearFilters = useCallback(() => {
    setFilters({ search: '' });
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

export default useBillsData;
