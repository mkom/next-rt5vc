import Link from 'next/link';
import {
  FaRegArrowAltCircleDown,
  FaRegArrowAltCircleUp,
  FaExchangeAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
} from 'react-icons/fa';
import { formatCurrency, formatDate } from '../../utils/format';
import { getTransactionStatusIcon } from '../../utils/statusIcons';

/**
 * RecentActivity - Widget showing recent transactions
 *
 * @param {Object} props
 * @param {Array} props.transactions - Array of recent transactions
 * @param {boolean} props.loading - Loading state
 * @param {string} props.className - Additional CSS classes
 */
const RecentActivity = ({ transactions = [], loading = false, className = '' }) => {
  // Get icon based on transaction type
  const getTypeIcon = (type) => {
    switch (type) {
      case 'income':
        return <FaRegArrowAltCircleDown className="w-4 h-4 text-success" />;
      case 'expense':
        return <FaRegArrowAltCircleUp className="w-4 h-4 text-error" />;
      case 'ipl':
        return <FaExchangeAlt className="w-4 h-4 text-primary" />;
      default:
        return <FaExchangeAlt className="w-4 h-4 text-base-content/50" />;
    }
  };

  // Get color class based on transaction type
  const getTypeColor = (type) => {
    switch (type) {
      case 'income':
      case 'ipl':
        return 'text-success';
      case 'expense':
        return 'text-error';
      default:
        return 'text-base-content';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'berhasil':
        return <FaCheckCircle className="w-3.5 h-3.5 text-success" />;
      case 'gagal':
        return <FaTimesCircle className="w-3.5 h-3.5 text-error" />;
      default:
        return <FaClock className="w-3.5 h-3.5 text-warning" />;
    }
  };

  if (loading) {
    return (
      <div className={`app-card p-5 ${className} animate-pulse`}>
        <div className="h-5 w-32 bg-base-300 rounded mb-4" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-3 py-3">
            <div className="w-10 h-10 rounded-full bg-base-200" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-24 bg-base-200 rounded" />
              <div className="h-2 w-16 bg-base-200 rounded" />
            </div>
            <div className="h-4 w-20 bg-base-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`app-card p-5 animate-slide-up ${className}`} style={{ animationDelay: '500ms' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-base-content">Aktivitas Terbaru</h3>
        <Link
          href="/dashboard/transactions"
          className="text-xs text-primary hover:text-primary/80 font-medium"
        >
          Lihat Semua
        </Link>
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-8 text-base-content/50">
          <p className="text-sm">Belum ada aktivitas</p>
        </div>
      ) : (
        <div className="space-y-1">
          {transactions.map((transaction, index) => (
            <div
              key={transaction._id || index}
              className="flex items-center gap-3 py-3 hover:bg-base-200/50 rounded-lg px-2 -mx-2 transition-colors"
            >
              {/* Icon */}
              <div className="w-10 h-10 rounded-full bg-base-200 flex items-center justify-center shrink-0">
                {getTypeIcon(transaction.transaction_type)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-base-content truncate">
                  {transaction.description || 'Transaksi'}
                </p>
                <div className="flex items-center gap-2 text-xs text-base-content/50">
                  {getStatusIcon(transaction.status)}
                  <span>{formatDate(transaction.date || transaction.created_at)}</span>
                </div>
              </div>

              {/* Amount */}
              <div className={`text-sm font-bold ${getTypeColor(transaction.transaction_type)}`}>
                {transaction.transaction_type === 'expense' ? '-' : '+'}
                {formatCurrency(transaction.amount)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentActivity;
