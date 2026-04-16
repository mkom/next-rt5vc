import { FaRegArrowAltCircleDown, FaRegArrowAltCircleUp } from 'react-icons/fa';
import { MdMotionPhotosPaused } from 'react-icons/md';
import { formatCurrency } from '../../utils/format';
import { formatPeriod } from '../FormatPeriod';

/**
 * Get icon berdasarkan tipe transaksi
 */
const getTypeIcon = (type, className) => {
  switch (type) {
    case 'income':
      return <FaRegArrowAltCircleDown className={`${className} text-success`} />;
    case 'expense':
      return <FaRegArrowAltCircleUp className={`${className} text-error`} />;
    case 'ipl':
      return <FaRegArrowAltCircleDown className={`${className} text-success`} />;
    default:
      return null;
  }
};

/**
 * Get color class berdasarkan tipe transaksi
 */
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

/**
 * CashflowCard Component
 * Menampilkan item transaksi dalam bentuk card
 * 
 * @param {Object} props
 * @param {Object} props.transaction - Data transaksi
 * @param {Function} props.onClick - Handler ketika card diklik
 */
const CashflowCard = ({ transaction, onClick }) => {
  const isIpl = transaction.transaction_type === 'ipl';
  const isExpense = transaction.transaction_type === 'expense';
  const hasPauseFlag = transaction.description?.includes('#IPLPaguyuban');

  return (
    <div 
      onClick={onClick}
      className="app-card p-4 flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-transform hover:shadow-md"
    >
      {/* Icon */}
      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
        isExpense ? 'bg-error/10' : 'bg-success/10'
      }`}>
        {getTypeIcon(transaction.transaction_type, 'w-5 h-5')}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <p className="text-sm font-bold text-base-content line-clamp-1">
            {isIpl 
              ? `IPL ${transaction.house_id?.house_id || '-'}, ${formatPeriod(transaction.related_months)}`
              : transaction.description
            }
          </p>
          {hasPauseFlag && (
            <MdMotionPhotosPaused className="text-error w-4 h-4 shrink-0" />
          )}
        </div>
        <p className="text-[11px] text-base-content/50">
          {isExpense ? 'Pengeluaran' : 'Pemasukan'}
        </p>
      </div>

      {/* Amount */}
      <div className={`text-sm font-extrabold shrink-0 ${getTypeColor(transaction.transaction_type)}`}>
        {isExpense ? '-' : '+'}{formatCurrency(transaction.amount)}
      </div>
    </div>
  );
};

export default CashflowCard;
