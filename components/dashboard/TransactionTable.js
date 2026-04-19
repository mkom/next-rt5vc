import { formatCurrency, formatDate } from '../../utils/format';
import { getTransactionStatusIcon, getTransactionTypeIcon } from '../../utils/statusIcons';
import { FaRegEdit, FaRegTrashAlt, FaEllipsisH } from 'react-icons/fa';
import ResponsiveTable from '../ui/ResponsiveTable';

/**
 * TransactionTable - Table component for displaying transactions
 *
 * Features:
 * - Mobile card view
 * - Desktop table view
 * - Accessible action buttons with ARIA labels
 * - Loading skeleton state
 * - Color-coded transaction types
 *
 * @param {Object} props
 * @param {Array} props.transactions - Array of transactions to display
 * @param {Function} props.onEdit - Edit handler (transactionId, transactionType)
 * @param {Function} props.onDelete - Delete handler (transactionId)
 * @param {number} props.offset - Row number offset for pagination
 * @param {boolean} props.loading - Loading state
 */
const TransactionTable = ({
  transactions = [],
  onEdit,
  onDelete,
  offset = 0,
  loading = false,
}) => {
  // Get text color based on transaction type
  const getTextColor = (type) => {
    switch (type) {
      case 'income':
        return 'text-success';
      case 'expense':
        return 'text-error';
      case 'ipl':
        return 'text-primary';
      default:
        return '';
    }
  };

  // Get transaction type label
  const getTypeLabel = (type) => {
    switch (type) {
      case 'income':
        return 'Masuk';
      case 'expense':
        return 'Keluar';
      case 'ipl':
        return 'IPL';
      default:
        return type;
    }
  };

  // Loading skeleton for mobile cards
  const renderMobileSkeleton = () => (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="app-card p-4 animate-pulse">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-1">
              <div className="w-8 h-8 rounded-full bg-base-300" />
              <div className="w-32 h-4 rounded bg-base-300" />
            </div>
            <div className="w-6 h-6 rounded bg-base-300" />
          </div>
          <div className="flex items-center justify-between mt-3">
            <div className="w-20 h-3 rounded bg-base-300" />
            <div className="w-24 h-4 rounded bg-base-300" />
          </div>
        </div>
      ))}
    </div>
  );

  // Loading skeleton for desktop table
  const renderDesktopSkeleton = () => (
    <div className="hidden md:block overflow-x-auto rounded-lg border border-base-300 bg-base-100">
      <table className="table table-sm w-full">
        <thead>
          <tr className="bg-base-200">
            <th className="w-8">No</th>
            <th>Keterangan</th>
            <th>Tipe</th>
            <th>Tanggal</th>
            <th>Nominal</th>
            <th className="text-center">Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {[1, 2, 3, 4, 5].map((i) => (
            <tr key={i} className="animate-pulse">
              <td><div className="w-4 h-3 rounded bg-base-300" /></td>
              <td><div className="w-48 h-3 rounded bg-base-300" /></td>
              <td><div className="w-16 h-3 rounded bg-base-300" /></td>
              <td><div className="w-20 h-3 rounded bg-base-300" /></td>
              <td><div className="w-24 h-3 rounded bg-base-300" /></td>
              <td className="text-center"><div className="w-6 h-6 rounded-full bg-base-300 mx-auto" /></td>
              <td><div className="w-6 h-6 rounded bg-base-300" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  if (loading) {
    return (
      <>
        {renderMobileSkeleton()}
        {renderDesktopSkeleton()}
      </>
    );
  }

  const columns = [
    { label: 'No', className: 'w-8' },
    { label: 'Keterangan' },
    { label: 'Tipe', className: 'hidden sm:table-cell' },
    { label: 'Tanggal', className: 'whitespace-nowrap' },
    { label: 'Nominal', className: 'whitespace-nowrap' },
    { label: 'Status', className: 'text-center' },
    { label: '', className: 'w-10' },
  ];

  const renderMobileCard = (transaction, index) => (
    <div className={getTextColor(transaction.transaction_type)}>
      {/* Header: Icon, Description, Actions */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="flex-shrink-0" aria-hidden="true">
            {getTransactionStatusIcon(transaction.status)}
          </span>
          <span className="text-sm font-medium truncate" title={transaction.description}>
            {transaction.description}
          </span>
        </div>
        
        {/* Actions Dropdown */}
        <div className="dropdown dropdown-end">
          <label
            tabIndex={0}
            className="btn btn-ghost btn-sm btn-square touch-target-sm"
            aria-label="Actions"
            role="button"
          >
            <FaEllipsisH className="h-4 w-4" />
          </label>
          <ul
            tabIndex={0}
            className="dropdown-content menu bg-base-100 rounded-box z-dropdown w-40 p-1.5 shadow-lg border border-base-200"
            role="menu"
          >
            <li role="menuitem">
              <button
                onClick={() => onEdit?.(transaction._id, transaction.transaction_type)}
                className="btn btn-ghost btn-sm justify-start gap-2 text-sm hover:bg-primary/10"
              >
                <FaRegEdit className="w-4 h-4 text-primary" /> Edit
              </button>
            </li>
            <li role="menuitem">
              <button
                className="btn btn-ghost btn-sm justify-start gap-2 text-sm text-error hover:bg-error/10"
                onClick={() => onDelete?.(transaction._id)}
              >
                <FaRegTrashAlt className="w-4 h-4" /> Hapus
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Details Row */}
      <div className="flex items-center justify-between mt-2 text-xs text-base-content/60">
        <div className="flex items-center gap-2">
          <span>{formatDate(transaction.date)}</span>
          <span className="px-1.5 py-0.5 rounded-full bg-base-200 text-[10px] uppercase">
            {getTypeLabel(transaction.transaction_type)}
          </span>
        </div>
        <span className={`font-semibold ${getTextColor(transaction.transaction_type)}`}>
          {formatCurrency(transaction.amount)}
        </span>
      </div>
    </div>
  );

  const renderDesktopRow = (transaction, index) => (
    <tr 
      key={transaction._id || index} 
      className={`${getTextColor(transaction.transaction_type)} hover:bg-base-200/50 transition-colors`}
    >
      <td className="text-xs">{offset + index + 1}</td>
      <td className="text-xs md:text-sm max-w-[200px] truncate" title={transaction.description}>
        {transaction.description}
      </td>
      <td className="text-xs hidden sm:table-cell">
        <span className="flex items-center gap-1">
          {getTransactionTypeIcon(transaction.transaction_type)}
          <span className="capitalize">{getTypeLabel(transaction.transaction_type)}</span>
        </span>
      </td>
      <td className="text-xs whitespace-nowrap">{formatDate(transaction.date)}</td>
      <td className="text-xs whitespace-nowrap font-medium">
        {formatCurrency(transaction.amount)}
      </td>
      <td className="text-center">
        <span className="flex justify-center" title={`Status: ${transaction.status}`}>
          {getTransactionStatusIcon(transaction.status)}
        </span>
      </td>
      <td>
        <div className="dropdown dropdown-end">
          <label
            tabIndex={0}
            className="btn btn-ghost btn-sm btn-square touch-target-sm"
            aria-label="Actions"
            role="button"
          >
            <FaEllipsisH className="h-4 w-4" />
          </label>
          <ul
            tabIndex={0}
            className="dropdown-content menu bg-base-100 rounded-box z-dropdown w-40 p-1.5 shadow-lg border border-base-200"
            role="menu"
          >
            <li role="menuitem">
              <button
                onClick={() => onEdit?.(transaction._id, transaction.transaction_type)}
                className="btn btn-ghost btn-sm justify-start gap-2 text-sm hover:bg-primary/10"
              >
                <FaRegEdit className="w-4 h-4 text-primary" /> Edit
              </button>
            </li>
            <li role="menuitem">
              <button
                className="btn btn-ghost btn-sm justify-start gap-2 text-sm text-error hover:bg-error/10"
                onClick={() => onDelete?.(transaction._id)}
              >
                <FaRegTrashAlt className="w-4 h-4" /> Hapus
              </button>
            </li>
          </ul>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
      <ResponsiveTable
        data={transactions}
        columns={columns}
        renderMobileCard={renderMobileCard}
        renderDesktopRow={renderDesktopRow}
        emptyMessage="Tidak ada transaksi yang sesuai dengan filter"
      />
    </div>
  );
};

export default TransactionTable;
