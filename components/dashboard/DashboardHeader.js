import { useState, useEffect } from 'react';
import Select from 'react-select';
import { HiRefresh } from 'react-icons/hi';
import { selectStyles } from '../../utils/selectStyles';
import MonthOptions from '../MonthOptions';
import moment from 'moment';

/**
 * DashboardHeader - Header component for dashboard with period selector
 *
 * Features:
 * - Period selector with z-index fixed portal
 * - Refresh button with loading state
 * - Last updated timestamp
 * - Responsive layout
 * - Accessible controls
 *
 * @param {Object} props
 * @param {string} props.title - Page title
 * @param {string} props.subtitle - Page subtitle
 * @param {string} props.selectedPeriod - Selected period (YYYY-MM)
 * @param {Function} props.onPeriodChange - Period change handler
 * @param {Function} props.onRefresh - Refresh button handler
 * @param {boolean} props.refreshing - Refresh loading state
 * @param {string} props.lastUpdated - Last updated timestamp (ISO)
 */
const DashboardHeader = ({
  title = 'Dashboard Admin',
  subtitle = 'Kelola data keuangan dan warga RT 005',
  selectedPeriod,
  onPeriodChange,
  onRefresh,
  refreshing = false,
  lastUpdated,
}) => {
  const [currentPeriod, setCurrentPeriod] = useState(selectedPeriod || moment().format('YYYY-MM'));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (selectedPeriod) {
      setCurrentPeriod(selectedPeriod);
    }
  }, [selectedPeriod]);

  const handlePeriodChange = (selectedOption) => {
    if (selectedOption && onPeriodChange) {
      onPeriodChange(selectedOption.value);
    }
  };

  const formattedLastUpdated = lastUpdated
    ? moment(lastUpdated).format('DD/MM/YY HH:mm')
    : null;

  const menuPortalTarget = mounted ? document.body : null;

  return (
    <div className="flex flex-col gap-4 mb-6 animate-fade-in">
      {/* Title Section */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-extrabold text-base-content tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-base-content/70 mt-1">
              {subtitle}
            </p>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Period Selector */}
          <div className="w-44 relative">
            <Select
              id="periodSelector"
              options={MonthOptions()}
              value={MonthOptions().find(option => option.value === currentPeriod)}
              onChange={handlePeriodChange}
              isSearchable={false}
              placeholder="Pilih periode"
              className="text-sm"
              classNamePrefix="select"
              styles={selectStyles}
              menuPortalTarget={menuPortalTarget}
              menuPosition="fixed"
            />
          </div>

          {/* Refresh Button */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={refreshing}
              className="btn btn-ghost btn-sm gap-2 hover:bg-primary/10 touch-target-sm"
              title="Refresh data"
              aria-label="Refresh data"
            >
              <HiRefresh className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          )}
        </div>
      </div>

      {/* Last Updated */}
      {formattedLastUpdated && (
        <div className="flex items-center gap-2 text-xs text-base-content/50">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span>Terakhir update: {formattedLastUpdated}</span>
        </div>
      )}
    </div>
  );
};

export default DashboardHeader;
