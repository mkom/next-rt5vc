import { FaRegArrowAltCircleDown, FaRegArrowAltCircleUp } from 'react-icons/fa';
import moment from 'moment';

/**
 * Mendapatkan style berdasarkan tipe transaksi
 * @param {string} type - Tipe transaksi (income, expense, ipl)
 * @returns {Object} Style configuration
 */
export const getTransactionTypeStyle = (type) => {
  switch (type) {
    case 'income':
      return {
        icon: FaRegArrowAltCircleDown,
        color: 'text-success',
        bg: 'bg-success/10',
        borderColor: 'border-success/20',
        label: 'Pemasukan'
      };
    case 'expense':
      return {
        icon: FaRegArrowAltCircleUp,
        color: 'text-error',
        bg: 'bg-error/10',
        borderColor: 'border-error/20',
        label: 'Pengeluaran'
      };
    case 'ipl':
      return {
        icon: FaRegArrowAltCircleDown,
        color: 'text-success',
        bg: 'bg-success/10',
        borderColor: 'border-success/20',
        label: 'IPL'
      };
    default:
      return {
        icon: null,
        color: 'text-base-content',
        bg: 'bg-base-200',
        borderColor: 'border-base-200',
        label: '-'
      };
  }
};

/**
 * Mendapatkan label kategori transaksi
 * @param {Object} transaction - Object transaksi
 * @returns {string} Label kategori
 */
export const getCategoryLabel = (transaction) => {
  const { transaction_type, transaction_category } = transaction;
  
  if (transaction_type === 'ipl') return "Pemasukan Rutin";
  
  const prefix = transaction_type === 'income' ? 'Pemasukan' : 'Pengeluaran';
  
  switch (transaction_category) {
    case 'Rutin':
      return `${prefix} Rutin`;
    case 'Lain - Lain':
      return `${prefix} Lain-Lain`;
    case 'Fasilitas Sosial':
      return `${prefix} Sosial`;
    case 'Fasilitas Umum':
      return `${prefix} Fasilitas Umum`;
    default:
      return prefix;
  }
};

/**
 * Menghitung total pemasukan, pengeluaran, dan saldo
 * @param {Array} transactions - Array transaksi
 * @param {string} period - Periode filter (YYYY-MM), opsional
 * @returns {Object} Object berisi totalIncome, totalExpense, totalAmount
 */
export const calculateTotals = (transactions, period = null) => {
  const filtered = period 
    ? transactions.filter(t => {
        if (!t.date) return false;
        const tMonth = moment(t.date).format('YYYY-MM');
        return tMonth === period;
      })
    : transactions;

  return filtered.reduce((acc, t) => {
    if (t.status !== 'berhasil') return acc;
    
    if (t.transaction_type === 'expense') {
      acc.totalExpense += t.amount || 0;
      acc.totalAmount -= t.amount || 0;
    } else if (t.transaction_type === 'ipl') {
      acc.totalIpl += t.amount || 0;
      acc.totalIncome += t.amount || 0;
      acc.totalAmount += t.amount || 0;
    } else {
      // income (non-IPL)
      acc.totalIncome += t.amount || 0;
      acc.totalAmount += t.amount || 0;
    }
    
    return acc;
  }, { totalIncome: 0, totalExpense: 0, totalIpl: 0, totalAmount: 0 });
};

/**
 * Format URL untuk display (handle Google Drive proxy)
 * @param {string} url - URL asli
 * @returns {string} URL yang sudah diformat
 */
export const toDisplayUrl = (url) => {
  if (!url) return url;
  if (url.includes('drive.google.com') || url.includes('lh3.googleusercontent.com')) {
    return `/api/proxy-image?url=${encodeURIComponent(url)}`;
  }
  return url;
};

/**
 * Parse proof of transfer URLs
 * @param {string|Array} urls - URL atau array URL
 * @returns {Array} Array URL
 */
export const parseProofUrls = (urls) => {
  if (!urls) return [];
  if (Array.isArray(urls)) return urls;
  return urls.split(/,(?=https?:\/\/)/).map(u => u.trim()).filter(Boolean);
};
