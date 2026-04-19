import { HiRefresh } from 'react-icons/hi';
import moment from 'moment';

/**
 * PageHeader - Consistent page header for dashboard pages
 *
 * Features:
 * - Title and subtitle
 * - Action buttons slot (for create buttons, etc.)
 * - Optional refresh button
 * - Last updated timestamp
 * - Consistent with DashboardHeader design
 *
 * @param {Object} props
 * @param {string} props.title - Page title
 * @param {string} props.subtitle - Page subtitle
 * @param {React.ReactNode} props.actions - Action buttons to display on the right
 * @param {Function} props.onRefresh - Refresh button handler (optional)
 * @param {boolean} props.refreshing - Refresh loading state
 * @param {string} props.lastUpdated - Last updated timestamp (ISO)
 */
const PageHeader = ({
  title = 'Page Title',
  subtitle = '',
  actions = null,
  onRefresh,
  refreshing = false,
  lastUpdated,
}) => {
  const formattedLastUpdated = lastUpdated
    ? moment(lastUpdated).format('DD/MM/YY HH:mm')
    : null;

  return (
    <div className="flex flex-col gap-4 animate-fade-in">
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

        {/* Actions and Refresh */}
        <div className="flex items-center gap-3 flex-wrap">
          {actions}

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

export default PageHeader;
