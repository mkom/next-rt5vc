import SearchInput from '../../ui/SearchInput';

/**
 * FilterBar - Reusable filter controls for dashboard pages
 * 
 * @param {Object} props
 * @param {string} props.searchTerm - Current search term
 * @param {Function} props.onSearchChange - Search change handler
 * @param {string} props.searchPlaceholder - Placeholder for search input
 * @param {React.ReactNode} props.filters - Additional filter components
 * @param {Function} props.onClearFilters - Clear filters handler
 * @param {boolean} props.hasActiveFilters - Whether any filter is active
 */
const FilterBar = ({
  searchTerm,
  onSearchChange,
  searchPlaceholder = 'Cari...',
  filters,
  onClearFilters,
  hasActiveFilters = false,
}) => {
  return (
    <div className="mb-4 space-y-3">
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex-1 min-w-[200px] max-w-md">
          <SearchInput
            value={searchTerm}
            onChange={onSearchChange}
            placeholder={searchPlaceholder}
          />
        </div>
        
        {filters && (
          <div className="flex flex-wrap gap-2 flex-1">
            {filters}
          </div>
        )}
        
        {hasActiveFilters && onClearFilters && (
          <button
            onClick={onClearFilters}
            className="btn btn-ghost btn-sm text-error"
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
};

export default FilterBar;
