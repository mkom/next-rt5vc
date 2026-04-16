import { FaRegArrowAltCircleDown, FaRegArrowAltCircleUp, FaFilter } from 'react-icons/fa';
import { formatCurrency } from '../../utils/format';

/**
 * CashflowStats Component
 * Menampilkan summary stats untuk pemasukan dan pengeluaran
 * 
 * @param {Object} props
 * @param {number} props.totalIncome - Total pemasukan
 * @param {number} props.totalExpense - Total pengeluaran
 * @param {number} props.totalIpl - Total IPL (opsional)
 * @param {string} props.selectedType - Tipe yang sedang dipilih (income/expense/ipl/null)
 * @param {string} props.selectedCategory - Kategori yang sedang dipilih
 * @param {Function} props.onTypeToggle - Handler untuk toggle tipe
 */
const CashflowStats = ({ 
  totalIncome, 
  totalExpense, 
  totalIpl = 0,
  selectedType, 
  selectedCategory,
  onTypeToggle 
}) => {
  // Cek apakah ada filter aktif
  const hasActiveTypeFilter = selectedType !== null && selectedType !== '';
  const hasActiveCategoryFilter = selectedCategory !== null && selectedCategory !== '';
  const hasActiveFilter = hasActiveTypeFilter || hasActiveCategoryFilter;

  return (
    <div className="flex flex-col gap-2">
      {/* Filter indicator */}
      {hasActiveFilter && (
        <div className="flex flex-wrap items-center gap-2 text-xs text-base-content/60 mb-1">
          <FaFilter className="w-3 h-3" />
          <span>Filter aktif:</span>
          {hasActiveTypeFilter && (
            <span className="font-bold text-primary capitalize">
              {selectedType === 'income' ? 'Pemasukan' : 
               selectedType === 'expense' ? 'Pengeluaran' : 
               selectedType === 'ipl' ? 'IPL' : selectedType}
            </span>
          )}
          {hasActiveTypeFilter && hasActiveCategoryFilter && (
            <span className="text-base-content/40">+</span>
          )}
          {hasActiveCategoryFilter && (
            <span className="font-bold text-accent">
              {selectedCategory}
            </span>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        {/* Income Button */}
        <button
          onClick={() => onTypeToggle('income')}
          className={`rounded-2xl p-3 border transition-all text-left ${
            selectedType === 'income'
              ? 'bg-success text-success-content border-success'
              : 'bg-success/5 border-success/10 hover:bg-success/10'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <FaRegArrowAltCircleDown className={`w-4 h-4 ${
              selectedType === 'income' ? 'text-success-content' : 'text-success'
            }`} />
            <span className={`text-[10px] font-bold uppercase ${
              selectedType === 'income' ? 'text-success-content' : 'text-base-content/60'
            }`}>
              Pemasukan
            </span>
          </div>
          <p className={`text-sm font-extrabold ${
            selectedType === 'income' ? 'text-success-content' : 'text-success'
          }`}>
            {totalIncome ? formatCurrency(totalIncome) : '-'}
          </p>
        </button>

        {/* Expense Button */}
        <button
          onClick={() => onTypeToggle('expense')}
          className={`rounded-2xl p-3 border transition-all text-left ${
            selectedType === 'expense'
              ? 'bg-error text-error-content border-error'
              : 'bg-error/5 border-error/10 hover:bg-error/10'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <FaRegArrowAltCircleUp className={`w-4 h-4 ${
              selectedType === 'expense' ? 'text-error-content' : 'text-error'
            }`} />
            <span className={`text-[10px] font-bold uppercase ${
              selectedType === 'expense' ? 'text-error-content' : 'text-base-content/60'
            }`}>
              Pengeluaran
            </span>
          </div>
          <p className={`text-sm font-extrabold ${
            selectedType === 'expense' ? 'text-error-content' : 'text-error'
          }`}>
            {totalExpense ? formatCurrency(totalExpense) : '-'}
          </p>
        </button>
      </div>

      {/* IPL Stats (optional, shows when IPL filter active) */}
      {selectedType === 'ipl' && (
        <div className="bg-success/5 border border-success/20 rounded-2xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <FaRegArrowAltCircleDown className="w-4 h-4 text-success" />
            <span className="text-[10px] font-bold uppercase text-base-content/60">
              Total IPL
            </span>
          </div>
          <p className="text-sm font-extrabold text-success">
            {totalIpl ? formatCurrency(totalIpl) : '-'}
          </p>
        </div>
      )}
    </div>
  );
};

export default CashflowStats;
