import { useMemo } from 'react';
import Select from 'react-select';
import { selectStyles } from '../../utils/selectStyles';
import SearchInput from '../ui/SearchInput';
import MonthOptions from '../MonthOptions';
import { FaTimes, FaFilter } from 'react-icons/fa';

/**
 * HousesFilters - Consolidated filter bar for houses page
 *
 * Features:
 * - Period selector (month dropdown)
 * - Search input
 * - Zone dropdown
 * - Status dropdown (Isi/Kosong/Weekend)
 * - Clear filters button
 * - Responsive grid layout
 * - Z-index fixed with menuPortal
 *
 * @param {Object} props
 * @param {Object} props.filters - Current filter values { search, group, status, period }
 * @param {Function} props.onChange - Filter change handler (key, value)
 * @param {Function} props.onClear - Clear all filters handler
 * @param {boolean} props.hasActiveFilters - Whether any filter (except period) is active
 */
const HousesFilters = ({
  filters,
  onChange,
  onClear,
  hasActiveFilters = false,
}) => {
  const zoneOptions = useMemo(
    () => [
      { value: '', label: 'Semua Zona' },
      { value: 'Villa Citayam', label: 'Villa Citayam' },
      { value: 'Villa Citayam 2', label: 'Villa Citayam 2' },
      { value: 'Cluster A', label: 'Cluster A' },
      { value: 'Cluster B', label: 'Cluster B' },
    ],
    []
  );

  const statusOptions = useMemo(
    () => [
      { value: '', label: 'Semua Status' },
      { value: 'Isi', label: 'Isi' },
      { value: 'Kosong', label: 'Kosong' },
      { value: 'Weekend', label: 'Weekend' },
      { value: 'Monthly', label: 'Monthly' },
      { value: 'Tidak ada kontak', label: 'Tidak ada kontak' },
    ],
    []
  );

  const handlePeriodChange = (selectedOption) => {
    onChange('period', selectedOption?.value || '');
  };

  const handleZoneChange = (selectedOption) => {
    onChange('group', selectedOption?.value || '');
  };

  const handleStatusChange = (selectedOption) => {
    onChange('status', selectedOption?.value || '');
  };

  // Menu portal target for fixing z-index issues
  const menuPortalTarget =
    typeof window !== 'undefined' ? document.body : null;

  return (
    <div className="app-card p-4 animate-slide-up" style={{ animationDelay: '150ms' }}>
      <div className="flex flex-col gap-4">
        {/* Period Selector - Full width on mobile */}
        <div className="w-full md:w-1/2 lg:w-1/3">
          <Select
            options={MonthOptions()}
            value={MonthOptions().find((o) => o.value === filters.period)}
            onChange={handlePeriodChange}
            placeholder="Pilih Periode"
            className="text-sm"
            classNamePrefix="select"
            styles={selectStyles}
            isSearchable={false}
            aria-label="Pilih periode"
            menuPortalTarget={menuPortalTarget}
            menuPosition="fixed"
          />
        </div>

        {/* Filter Grid - Responsive Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search Input */}
          <div className="min-w-0">
            <SearchInput
              value={filters.search}
              onChange={(value) => onChange('search', value)}
              placeholder="Cari rumah atau nama..."
            />
          </div>

          {/* Zone Dropdown */}
          <div className="min-w-0">
            <Select
              options={zoneOptions}
              value={zoneOptions.find((o) => o.value === filters.group)}
              onChange={handleZoneChange}
              placeholder="Zona"
              className="text-sm"
              classNamePrefix="select"
              styles={selectStyles}
              isSearchable={false}
              aria-label="Filter by zone"
              menuPortalTarget={menuPortalTarget}
              menuPosition="fixed"
            />
          </div>

          {/* Status Dropdown */}
          <div className="min-w-0">
            <Select
              options={statusOptions}
              value={statusOptions.find((o) => o.value === filters.status)}
              onChange={handleStatusChange}
              placeholder="Status"
              className="text-sm"
              classNamePrefix="select"
              styles={selectStyles}
              isSearchable={false}
              aria-label="Filter by status"
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
                {filters.group && (
                  <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs">
                    Zona: {filters.group}
                  </span>
                )}
                {filters.status && (
                  <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs">
                    Status: {filters.status}
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

export default HousesFilters;
