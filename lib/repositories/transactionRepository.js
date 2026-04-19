import { createAuthenticatedClient } from '../api/client';

/**
 * Transaction Repository
 * 
 * Handles all API calls related to transactions.
 * Abstracts the data access layer from the business logic.
 */
class TransactionRepository {
  constructor(token) {
    this.client = createAuthenticatedClient(token);
  }

  /**
   * Get all transactions
   * @returns {Promise<Array>} - List of transactions
   */
  async getAll() {
    const response = await this.client.get('/transactions/all');
    return response.data?.data?.transactions || [];
  }

  /**
   * Get transaction by ID
   * @param {string} id - Transaction ID
   * @returns {Promise<Object>} - Transaction data
   */
  async getById(id) {
    const response = await this.client.get(`/transactions/${id}`);
    return response.data;
  }

  /**
   * Create new transaction
   * @param {Object} data - Transaction data
   * @returns {Promise<Object>} - Created transaction
   */
  async create(data) {
    const response = await this.client.post('/transactions/create', data, {
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
  }

  /**
   * Update transaction
   * @param {string} id - Transaction ID
   * @param {Object} data - Updated transaction data
   * @returns {Promise<Object>} - Updated transaction
   */
  async update(id, data) {
    const response = await this.client.put(`/transactions/update/${id}`, data);
    return response.data;
  }

  /**
   * Delete transaction
   * @param {string} id - Transaction ID
   * @returns {Promise<void>}
   */
  async delete(id) {
    await this.client.delete(`/transactions/delete/${id}`);
  }

  /**
   * Filter transactions by date
   * @param {Object} params - Filter parameters
   * @returns {Promise<Array>} - Filtered transactions
   */
  async filter(params) {
    const response = await this.client.get('/transactions/filter', { params });
    return response.data?.data?.transactions || [];
  }
}

export default TransactionRepository;
