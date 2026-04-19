import HouseRepository from '../repositories/houseRepository';

/**
 * House Service
 * 
 * Business logic layer for houses/residents.
 */
class HouseService {
  constructor(token) {
    this.repository = new HouseRepository(token);
  }

  /**
   * Get all houses
   * @returns {Promise<Array>}
   */
  async getAllHouses() {
    return await this.repository.getAll();
  }

  /**
   * Get house by ID
   * @param {string} id - House ID
   * @returns {Promise<Object>}
   */
  async getHouseById(id) {
    return await this.repository.getById(id);
  }

  /**
   * Update house data
   * @param {string} id - House ID
   * @param {Object} data - Updated data
   * @param {Object} params - Query params
   * @returns {Promise<Object>}
   */
  async updateHouse(id, data, params = {}) {
    return await this.repository.update(id, data, params);
  }

  /**
   * Get outstanding houses (with unpaid bills)
   * @returns {Promise<Array>}
   */
  async getOutstandingHouses() {
    const houses = await this.repository.getOutstanding();
    // Sort by total fee descending
    return houses.sort((a, b) => b.total_fee - a.total_fee);
  }

  /**
   * Filter houses by search term
   * @param {Array} houses - List of houses
   * @param {string} searchTerm - Search term
   * @returns {Array} - Filtered houses
   */
  filterBySearch(houses, searchTerm) {
    if (!searchTerm) return houses;
    const lowerTerm = searchTerm.toLowerCase();
    return houses.filter(
      (h) =>
        h.resident_name?.toLowerCase().includes(lowerTerm) ||
        h.house_id?.toLowerCase().includes(lowerTerm)
    );
  }

  /**
   * Filter houses by group/zone
   * @param {Array} houses - List of houses
   * @param {string} group - Group name
   * @returns {Array} - Filtered houses
   */
  filterByGroup(houses, group) {
    if (!group) return houses;
    return houses.filter((h) => h.group?.toLowerCase() === group.toLowerCase());
  }

  /**
   * Filter houses by status for a specific period
   * @param {Array} houses - List of houses
   * @param {string} period - Period (YYYY-MM)
   * @param {string} status - Status to filter
   * @returns {Array} - Filtered houses
   */
  filterByStatus(houses, period, status) {
    if (!status || !period) return houses;
    return houses.filter((h) => {
      const monthStatus = h.monthly_status?.find((s) => s.month === period);
      return monthStatus?.status === status;
    });
  }

  /**
   * Get monthly status count for a period
   * @param {Array} houses - List of houses
   * @param {string} period - Period (YYYY-MM)
   * @returns {Object} - Counts by status
   */
  getMonthlyStatusCount(houses, period) {
    return houses.reduce(
      (acc, house) => {
        const monthStatus = house.monthly_status?.find((s) => s.month === period);
        if (monthStatus) {
          acc[monthStatus.status] = (acc[monthStatus.status] || 0) + 1;
        }
        return acc;
      },
      { Isi: 0, Kosong: 0, Weekend: 0 }
    );
  }

  /**
   * Get monthly fee status count for a period
   * @param {Array} houses - List of houses
   * @param {string} period - Period (YYYY-MM)
   * @returns {Object} - Counts by payment status
   */
  getMonthlyFeeStatusCount(houses, period) {
    return houses.reduce(
      (acc, house) => {
        const monthFee = house.monthly_fees?.find((f) => f.month === period);
        if (monthFee) {
          const { status, fee } = monthFee;
          acc[status] = (acc[status] || 0) + 1;
          if (status === 'Lunas' || status === 'Bayar Sebagian') {
            acc.totalFeeCollected += fee || 0;
          }
        }
        return acc;
      },
      { Lunas: 0, 'Belum Bayar': 0, TBD: 0, 'Bayar Sebagian': 0, totalFeeCollected: 0 }
    );
  }

  /**
   * Get houses eligible for IPL (status Isi or Weekend)
   * @param {Array} houses - List of houses
   * @param {string} period - Period (YYYY-MM)
   * @returns {Array} - Eligible houses
   */
  getIPLEligibleHouses(houses, period) {
    return houses.filter((h) => {
      const monthStatus = h.monthly_status?.find((s) => s.month === period);
      return monthStatus && (monthStatus.status === 'Isi' || monthStatus.status === 'Weekend');
    });
  }

  /**
   * Calculate total outstanding amount
   * @param {Array} houses - List of outstanding houses
   * @returns {number} - Total amount
   */
  calculateTotalOutstanding(houses) {
    return houses.reduce((sum, h) => sum + (h.total_fee || 0), 0);
  }
}

export default HouseService;
