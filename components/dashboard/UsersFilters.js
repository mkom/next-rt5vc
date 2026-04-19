import SearchInput from '../ui/SearchInput';
import { FaTimes, FaFilter } from 'react-icons/fa';

/**
 * UsersFilters - Filter bar for users page
 *
 * Features:
 * - Wrapped in app-card
 * - Search input only
 * - Clear filters button
 *
 * @param {Object} props
 * @param {Object} props.filters - Current filter values { search }
 * @param {Function} props.onChange - Filter change handler (key, value)
 * @param {Function} props.onClear - Clear filters handler
 * @param {boolean} props.hasActiveFilters - Whether search filter is active
 */
const UsersFilters = ({
  filters,
  onChange,
  onClear,
  hasActiveFilters = false,
}) => {
  return (
    <div className="app-card p-4 animate-slide-up" style={{ animationDelay: '150ms' }}>
      <div className="flex flex-col gap-4">
        {/* Search Input */}
        <div className="w-full md:w-1/2 lg:w-1/3">
          <SearchInput
            value={filters.search}
            onChange={(value) => onChange('search', value)}
            placeholder="Cari username, nama, atau email..."
          />
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

export default UsersFilters;
