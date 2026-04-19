import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import HouseService from '../services/houseService';

/**
 * useHouses Hook
 * 
 * Custom hook for managing house data.
 * 
 * @param {Object} options - Options object
 * @param {Array} options.initialData - Initial house data
 * @returns {Object} - House state and methods
 */
export const useHouses = ({ initialData = [] } = {}) => {
  const { data: session } = useSession();
  const [houses, setHouses] = useState(initialData);
  const [loading, setLoading] = useState(!initialData.length);
  const [error, setError] = useState(null);

  const service = session?.accessToken
    ? new HouseService(session.accessToken)
    : null;

  /**
   * Fetch all houses
   */
  const fetchHouses = useCallback(async () => {
    if (!service) return;

    setLoading(true);
    setError(null);

    try {
      const data = await service.getAllHouses();
      setHouses(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch houses');
      console.error('Error fetching houses:', err);
    } finally {
      setLoading(false);
    }
  }, [service]);

  /**
   * Update house
   * @param {string} id - House ID
   * @param {Object} data - Updated data
   * @param {Object} params - Query params
   */
  const updateHouse = useCallback(async (id, data, params = {}) => {
    if (!service) throw new Error('Not authenticated');

    try {
      const result = await service.updateHouse(id, data, params);
      await fetchHouses(); // Refresh list
      return result;
    } catch (err) {
      console.error('Error updating house:', err);
      throw err;
    }
  }, [service, fetchHouses]);

  /**
   * Get monthly status count
   * @param {string} period - Period (YYYY-MM)
   */
  const getMonthlyStatusCount = useCallback((period) => {
    if (!service || !period) return { Isi: 0, Kosong: 0, Weekend: 0 };
    return service.getMonthlyStatusCount(houses, period);
  }, [houses, service]);

  /**
   * Get monthly fee status count
   * @param {string} period - Period (YYYY-MM)
   */
  const getMonthlyFeeStatusCount = useCallback((period) => {
    if (!service || !period) {
      return { Lunas: 0, 'Belum Bayar': 0, TBD: 0, 'Bayar Sebagian': 0, totalFeeCollected: 0 };
    }
    return service.getMonthlyFeeStatusCount(houses, period);
  }, [houses, service]);

  /**
   * Filter houses
   * @param {Object} filters - Filter criteria
   */
  const filterHouses = useCallback((filters = {}) => {
    const { searchTerm, group, status, period } = filters;
    
    let filtered = [...houses];

    if (searchTerm && service) {
      filtered = service.filterBySearch(filtered, searchTerm);
    }

    if (group && service) {
      filtered = service.filterByGroup(filtered, group);
    }

    if (status && period && service) {
      filtered = service.filterByStatus(filtered, period, status);
    }

    return filtered;
  }, [houses, service]);

  // Initial fetch if no initial data
  useEffect(() => {
    if (!initialData.length && session) {
      fetchHouses();
    }
  }, [initialData.length, session, fetchHouses]);

  return {
    houses,
    loading,
    error,
    fetchHouses,
    updateHouse,
    getMonthlyStatusCount,
    getMonthlyFeeStatusCount,
    filterHouses,
  };
};

export default useHouses;
