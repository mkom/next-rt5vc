import { createAuthenticatedClient } from '../api/client';

/**
 * House Repository
 * 
 * Handles all API calls related to houses/residents.
 */
class HouseRepository {
  constructor(token) {
    this.client = createAuthenticatedClient(token);
  }

  /**
   * Get all houses
   * @returns {Promise<Array>} - List of houses
   */
  async getAll() {
    const response = await this.client.get('/houses/all');
    return response.data?.data || [];
  }

  /**
   * Get house by ID
   * @param {string} id - House ID
   * @returns {Promise<Object>} - House data
   */
  async getById(id) {
    const response = await this.client.get(`/houses/${id}`);
    return response.data?.data;
  }

  /**
   * Update house
   * @param {string} id - House ID
   * @param {Object} data - Updated house data
   * @param {Object} params - Query parameters (period, zona)
   * @returns {Promise<Object>} - Updated house
   */
  async update(id, data, params = {}) {
    const response = await this.client.put(`/houses/update/${id}`, data, { params });
    return response.data?.data;
  }

  /**
   * Get outstanding houses
   * @returns {Promise<Array>} - List of houses with outstanding payments
   */
  async getOutstanding() {
    const response = await this.client.get('/houses/outstanding');
    return response.data?.data || [];
  }

  /**
   * Get IPL data for a house
   * @param {string} houseId - House ID
   * @returns {Promise<Object>} - IPL data
   */
  async getIplData(houseId) {
    const response = await this.client.get(`/ipl/${houseId.toUpperCase()}`);
    return response.data;
  }
}

export default HouseRepository;
