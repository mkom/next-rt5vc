import Select from 'react-select';
import { selectStyles } from '../../utils/selectStyles';
import SearchInput from '../ui/SearchInput';
import FilterTransactions from './FilterTransactions';
import { FaTimes, FaFilter } from 'react-icons/fa';
import { useMemo } from 'react';

/**
 * TransactionFilters - Consolidated filter bar for transactions page
 *
 * Features:
 * - Search input (with debounce handled by parent)
 * - Date range picker
 * - Transaction type dropdown
 * - Payment type dropdown (NEW)
 * - Clear filters button
 * - Responsive grid layout
 * - Z-index fixed with menuPortal
 *
 * @param {Object} props
 * @param {Object} props.filters - Current filter values { search, type, paymentType, dateRange }
 * @param {Function} props.onChange - Filter change handler (key, value)
 * @param {Function} props.onClear - Clear all filters handler
 * @param {Function} props.onDateRangeChange - Special handler for date range changes
 * @param {Array} props.initialTransactions - Original unfiltered transactions for date filter reset
 * @param {boolean} props.hasActiveFilters - Whether any filter is active
 */
const TransactionFilters = ({
  filters,
  onChange,
  onClear,
  onDateRangeChange,
  initialTransactions,
  hasActiveFilters = false,
}) => {
  const transactionTypes = useMemo(
    () => [
      { value: '', label: 'Semua Tipe' },
      { value: 'ipl', label: 'IPL' },
      { value: 'income', label: 'Masuk' },
      { value: 'expense', label: 'Keluar' },
    ],
    []
  );

  const paymentTypes = useMemo(
    () => [
      { value: '', label: 'Semua Pembayaran' },
      { value: 'cash', label: 'Cash' },
      { value: 'transfer', label: 'Transfer' },
    ],
    []
  );

  const handleTypeChange = (selectedOption) => {
    onChange('type', selectedOption?.value || '');
  };

  const handlePaymentTypeChange = (selectedOption) => {
    onChange('paymentType', selectedOption?.value || '');
  };

  // Menu portal target for fixing z-index issues
  const menuPortalTarget =
    typeof window !== 'undefined' ? document.body : null;

  return (
    <div className="app-card p-4 animate-slide-up" style={{ animationDelay: '150ms' }}>
      <div className="flex flex-col gap-4">
        {/* Filter Grid - Responsive Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="min-w-0">
            <SearchInput
              value={filters.search}
              onChange={(value) => onChange('search', value)}
              placeholder="Cari keterangan atau ID..."
            />
          </div>

          {/* Date Range Picker */}
          <div className="min-w-0">
            <FilterTransactions
              dateRange={filters.dateRange}
              onChange={(range) => onChange('dateRange', range)}
              onDateRangeChange={onDateRangeChange}
              initialTransactions={initialTransactions}
            />
          </div>

          {/* Transaction Type Dropdown */}
          <div className="min-w-0">
            <Select
              options={transactionTypes}
              value={transactionTypes.find((o) => o.value === filters.type)}
              onChange={handleTypeChange}
              placeholder="Tipe Transaksi"
              className="text-sm"
              classNamePrefix="select"
              styles={selectStyles}
              isSearchable={false}
              aria-label="Filter by transaction type"
              menuPortalTarget={menuPortalTarget}
              menuPosition="fixed"
            />
          </div>

          {/* Payment Type Dropdown - NEW */}
          <div className="min-w-0">
            <Select
              options={paymentTypes}
              value={paymentTypes.find((o) => o.value === filters.paymentType)}
              onChange={handlePaymentTypeChange}
              placeholder="Metode Bayar"
              className="text-sm"
              classNamePrefix="select"
              styles={selectStyles}
              isSearchable={false}
              aria-label="Filter by payment method"
              menuPortalTarget={menuPortalTarget}
              menuPosition="fixed"
            />
          </div>
        </div>

        {/* Active Filters Summary & Clear Button */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-base-200">
            <div className="flex items-center gap-2 text-sm text-base-content/60">
              <FaFilter className="w-3 h-3" />
              <span>Filter aktif:</span>
              <div className="flex flex-wrap gap-2">
                {filters.search && (
                  <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs">
                    Pencarian: {filters.search}
                  </span>
                )}
                {filters.type && (
                  <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs">
                    Tipe: {transactionTypes.find((t) => t.value === filters.type)?.label}
                  </span>
                )}
                {filters.paymentType && (
                  <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs">
                    Bayar: {paymentTypes.find((t) => t.value === filters.paymentType)?.label}
                  </span>
                )}
                {filters.dateRange[0] && filters.dateRange[1] && (
                  <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs">
                    Periode: {filters.dateRange[0].toLocaleDateString('id-ID')} - {filters.dateRange[1].toLocaleDateString('id-ID')}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClear}
              className="btn btn-ghost btn-sm gap-2 text-error hover:bg-error/10 shrink-0"
              aria-label="Clear all filters"
            >
              <FaTimes className="w-3 h-3" />
              Hapus Filter
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionFilters;
