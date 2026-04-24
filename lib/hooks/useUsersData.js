import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { createAuthenticatedClient } from '../api/client';
import { ITEMS_PER_PAGE } from '../../utils/constants';

/**
 * useUsersData - Custom hook for managing users data and state
 *
 * Features:
 * - Centralized state management for users
 * - Memoized filtering
 * - Search filter support
 * - Pagination management
 * - Loading and error states
 *
 * @param {Object} options
 * @param {Array} options.initialUsers - Initial users data from SSR
 * @param {string} options.accessToken - Session access token for API calls
 * @returns {Object} Users state and actions
 */
export const useUsersData = ({ initialUsers = [], accessToken }) => {
  // Data state
  const [users, setUsers] = useState(initialUsers);
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
   * Fetch users data from API
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
        '/users/list',
        {
          signal: abortControllerRef.current.signal,
        }
      );
      setUsers(res.data.data);
      setLastUpdated(new Date().toISOString());
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Gagal memuat data user');
        console.error('Error fetching users data:', err);
      }
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  /**
   * Filter users based on search
   */
  const filteredUsers = useMemo(() => {
    if (!Array.isArray(users)) return [];

    return users.filter((user) => {
      const searchLower = filters.search.toLowerCase();

      // Search filter
      const matchesSearch =
        filters.search === '' ||
        user?.username?.toLowerCase().includes(searchLower) ||
        user?.name?.toLowerCase().includes(searchLower) ||
        user?.email?.toLowerCase().includes(searchLower);

      return matchesSearch;
    });
  }, [users, filters.search]);

  /**
   * Calculate stats
   */
  const stats = useMemo(() => {
    return {
      totalUsers: filteredUsers.length,
    };
  }, [filteredUsers]);

  /**
   * Paginated data
   */
  const paginatedData = useMemo(() => {
    const offset = currentPage * ITEMS_PER_PAGE;
    return filteredUsers.slice(offset, offset + ITEMS_PER_PAGE);
  }, [filteredUsers, currentPage]);

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);

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
    users,
    filteredUsers,
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

export default useUsersData;
