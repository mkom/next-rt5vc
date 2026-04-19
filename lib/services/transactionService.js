import TransactionRepository from '../repositories/transactionRepository';

/**
 * Transaction Service
 * 
 * Business logic layer for transactions.
 * Handles data processing, calculations, and transformations.
 */
class TransactionService {
  constructor(token) {
    this.repository = new TransactionRepository(token);
  }

  /**
   * Get all transactions sorted by date
   * @returns {Promise<Array>} - Sorted transactions
   */
  async getAllTransactions() {
    const transactions = await this.repository.getAll();
    return this.sortByDate(transactions);
  }

  /**
   * Get transaction by ID
   * @param {string} id - Transaction ID
   * @returns {Promise<Object>}
   */
  async getTransactionById(id) {
    return await this.repository.getById(id);
  }

  /**
   * Create new transaction
   * @param {Object} data - Transaction data
   * @returns {Promise<Object>}
   */
  async createTransaction(data) {
    // Validate transaction data
    this.validateTransactionData(data);
    return await this.repository.create(data);
  }

  /**
   * Update transaction
   * @param {string} id - Transaction ID
   * @param {Object} data - Updated data
   * @returns {Promise<Object>}
   */
  async updateTransaction(id, data) {
    this.validateTransactionData(data);
    return await this.repository.update(id, data);
  }

  /**
   * Delete transaction
   * @param {string} id - Transaction ID
   * @returns {Promise<void>}
   */
  async deleteTransaction(id) {
    return await this.repository.delete(id);
  }

  /**
   * Calculate totals from transactions
   * @param {Array} transactions - List of transactions
   * @returns {Object} - Totals object
   */
  calculateTotals(transactions) {
    return transactions.reduce(
      (acc, transaction) => {
        const amount = transaction.amount || 0;
        const isSuccessful = transaction.status === 'berhasil';

        if (isSuccessful) {
          if (transaction.transaction_type === 'income' || transaction.transaction_type === 'ipl') {
            acc.income += amount;
            acc.balance += amount;
          } else if (transaction.transaction_type === 'expense') {
            acc.expense += amount;
            acc.balance -= amount;
          }
        }

        return acc;
      },
      { income: 0, expense: 0, balance: 0 }
    );
  }

  /**
   * Filter transactions by type
   * @param {Array} transactions - List of transactions
   * @param {string} type - Transaction type
   * @returns {Array} - Filtered transactions
   */
  filterByType(transactions, type) {
    if (!type) return transactions;
    return transactions.filter((t) => t.transaction_type === type);
  }

  /**
   * Search transactions by keyword
   * @param {Array} transactions - List of transactions
   * @param {string} keyword - Search keyword
   * @returns {Array} - Filtered transactions
   */
  searchTransactions(transactions, keyword) {
    if (!keyword) return transactions;
    const lowerKeyword = keyword.toLowerCase();
    return transactions.filter(
      (t) =>
        t.description?.toLowerCase().includes(lowerKeyword) ||
        t.transaction_id?.toLowerCase().includes(lowerKeyword)
    );
  }

  /**
   * Sort transactions by date (newest first)
   * @param {Array} transactions - List of transactions
   * @returns {Array} - Sorted transactions
   */
  sortByDate(transactions) {
    return [...transactions].sort((a, b) => new Date(b.created_at || b.date) - new Date(a.created_at || a.date));
  }

  /**
   * Validate transaction data
   * @param {Object} data - Transaction data
   * @throws {Error} - If validation fails
   */
  validateTransactionData(data) {
    if (!data.transaction_type) {
      throw new Error('Transaction type is required');
    }
    if (!data.amount || data.amount <= 0) {
      throw new Error('Valid amount is required');
    }
    if (!data.date) {
      throw new Error('Date is required');
    }
  }

  /**
   * Build WhatsApp notification message for IPL payment
   * @param {Object} txData - Transaction data
   * @param {string} baseUrl - Base URL for links
   * @returns {string} - WhatsApp message
   */
  buildIPLSuccessMessage(txData, baseUrl) {
    const houseId = txData.house?.house_id || '';
    const IPLUrl = `${baseUrl}/ipl/${houseId.toLowerCase()}`;
    
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
      }).format(amount);
    };

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    };

    return `*Konfirmasi Pembayaran IPL Berhasil!*\n\n` +
      `Setelah kami melakukan pengecekan, kami informasikan bahwa pembayaran IPL Bapak/Ibu telah berhasil masuk ke sistem kami.\n\n` +
      `*Detail:*\n*ID:* ${txData.transaction_id}\n*Deskripsi:*\n${txData.description}\n` +
      `*Jumlah:* ${formatCurrency(txData.amount)}\n` +
      `*Tanggal Pembayaran:* ${formatDate(txData.date)}\n` +
      (houseId ? `\n*Cek IPL:* ${houseId} ${IPLUrl}\n\n` : '') +
      `Terima kasih telah melakukan pembayaran IPL RT 05 RW 11, Villa Citayam.\n\n*Hormat Kami*\nRT 005 Villa Citayam.`;
  }
}

export default TransactionService;
