import KpiGrid from './KpiGrid';
import { formatCurrency } from '../../utils/format';
import {
  FaWallet,
  FaArrowDown,
  FaArrowUp,
  FaExchangeAlt,
  FaHandHoldingHeart,
  FaCalculator,
} from 'react-icons/fa';

/**
 * TransactionStats - KPI cards for transaction summary
 *
 * Displays 4-6 key metrics:
 * - Net Balance (income - expense)
 * - Total Income
 * - Total Expense
 * - Transaction Count
 * - IPL Paguyuban (ONLY if exists)
 * - Saldo Setelah Paguyuban (ONLY if exists)
 *
 * @param {Object} props
 * @param {Object} props.stats - Stats object { netBalance, totalIncome, totalExpense, count, iplPaguyubanTotal, balanceAfterPaguyuban, hasIplPaguyuban }
 * @param {boolean} props.loading - Loading state
 */
const TransactionStats = ({ stats, loading = false }) => {
  const {
    netBalance,
    totalIncome,
    totalExpense,
    count,
    iplPaguyubanTotal,
    balanceAfterPaguyuban,
    hasIplPaguyuban,
  } = stats || {};

  // Base stat items (always shown)
  const baseStatItems = [
    {
      title: 'Saldo Bersih',
      value: formatCurrency(netBalance || 0),
      icon: FaWallet,
      color: 'primary',
      subtitle: 'Pemasukan - Pengeluaran',
    },
    {
      title: 'Total Pemasukan',
      value: formatCurrency(totalIncome || 0),
      icon: FaArrowDown,
      color: 'success',
      subtitle: 'IPL + Pemasukan lain',
    },
    {
      title: 'Total Pengeluaran',
      value: formatCurrency(totalExpense || 0),
      icon: FaArrowUp,
      color: 'error',
      subtitle: 'Semua pengeluaran',
    },
    {
      title: 'Jumlah Transaksi',
      value: count || 0,
      icon: FaExchangeAlt,
      color: 'info',
      subtitle: 'Total record ditampilkan',
    },
  ];

  // Conditional IPL Paguyuban stats (only shown if transactions exist)
  const paguyubanStatItems = hasIplPaguyuban
    ? [
        {
          title: 'IPL Paguyuban',
          value: formatCurrency(iplPaguyubanTotal || 0),
          icon: FaHandHoldingHeart,
          color: 'info',
          subtitle: 'Total IPL Paguyuban',
        },
        {
          title: 'Saldo Setelah Paguyuban',
          value: formatCurrency(balanceAfterPaguyuban || 0),
          icon: FaCalculator,
          color: 'secondary',
          subtitle: 'Saldo bersih dikurangi IPL Paguyuban',
        },
      ]
    : [];

  // Combine all stats
  const statItems = [...baseStatItems, ...paguyubanStatItems];

  return (
    <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
      <KpiGrid stats={statItems} loading={loading} />
    </div>
  );
};

export default TransactionStats;
