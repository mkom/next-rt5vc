import Link from 'next/link';
import { FaRegEdit, FaHome } from 'react-icons/fa';
import { getBooleanStatusIcon } from '../../utils/statusIcons';
import ResponsiveTable from '../ui/ResponsiveTable';

/**
 * HousesTable - Table component for displaying houses data
 *
 * Features:
 * - Mobile card view
 * - Desktop table view
 * - Shows status, IPL (boolean), Kas (boolean)
 * - Edit and IPL link buttons
 * - Loading skeleton state
 * - Accessible buttons
 *
 * @param {Object} props
 * @param {Array} props.houses - Array of houses to display
 * @param {string} props.selectedPeriod - Selected period for fetching monthly data (YYYY-MM)
 * @param {number} props.offset - Row number offset for pagination
 * @param {Function} props.onEditClick - Handler for edit button click
 * @param {boolean} props.loading - Loading state
 */
const HousesTable = ({
  houses = [],
  selectedPeriod = '',
  offset = 0,
  onEditClick,
  loading = false,
}) => {
  // Get monthly status for a house
  const getMonthStatus = (house) =>
    house.monthly_status?.find((s) => s.month === selectedPeriod);

  // Loading skeleton for mobile cards
  const renderMobileSkeleton = () => (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="app-card p-4 animate-pulse">
          <div className="flex items-center justify-between gap-2">
            <div className="w-32 h-5 rounded bg-base-300" />
            <div className="w-16 h-8 rounded bg-base-300" />
          </div>
          <div className="flex gap-4 mt-2">
            <div className="w-16 h-4 rounded bg-base-300" />
            <div className="w-16 h-4 rounded bg-base-300" />
            <div className="w-16 h-4 rounded bg-base-300" />
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
            <th>Rumah</th>
            <th>Nama</th>
            <th>Status</th>
            <th className="text-center">IPL</th>
            <th className="text-center">Kas</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {[1, 2, 3, 4, 5].map((i) => (
            <tr key={i} className="animate-pulse">
              <td><div className="w-4 h-3 rounded bg-base-300" /></td>
              <td><div className="w-16 h-3 rounded bg-base-300" /></td>
              <td><div className="w-32 h-3 rounded bg-base-300" /></td>
              <td><div className="w-20 h-3 rounded bg-base-300" /></td>
              <td className="text-center"><div className="w-6 h-6 rounded-full bg-base-300 mx-auto" /></td>
              <td className="text-center"><div className="w-6 h-6 rounded-full bg-base-300 mx-auto" /></td>
              <td><div className="w-20 h-6 rounded bg-base-300" /></td>
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
    { label: 'Rumah' },
    { label: 'Nama', className: 'w-1/4' },
    { label: 'Status', className: 'w-1/6' },
    { label: 'IPL', className: 'text-center' },
    { label: 'Kas', className: 'text-center' },
    { label: '', className: 'w-24' },
  ];

  const renderMobileCard = (house, index) => {
    const monthStatus = getMonthStatus(house);
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-sm">
            {house.house_id} {house.resident_name}
          </span>
          <button
            className="btn btn-ghost btn-xs gap-1 touch-target-sm"
            onClick={() => onEditClick?.(house)}
            aria-label="Edit rumah"
          >
            <FaRegEdit className="h-3 w-3" /> Edit
          </button>
        </div>
        <div className="flex items-center gap-3 text-xs text-base-content/70">
          <span>Status: {monthStatus?.status}</span>
          <span className="flex items-center gap-1">
            IPL:{getBooleanStatusIcon(monthStatus?.mandatory_ipl)}
          </span>
          <span className="flex items-center gap-1">
            Kas:{getBooleanStatusIcon(monthStatus?.mandatory_rt)}
          </span>
        </div>
      </div>
    );
  };

  const renderDesktopRow = (house, index) => {
    const monthStatus = getMonthStatus(house);
    return (
      <tr key={house._id || index} className="hover:bg-base-200/50 transition-colors">
        <td className="text-xs">{offset + index + 1}</td>
        <td className="text-xs font-medium">{house.house_id}</td>
        <td className="text-xs md:text-sm max-w-[200px] truncate" title={house.resident_name}>
          {house.resident_name}
        </td>
        <td className="text-xs">{monthStatus?.status}</td>
        <td className="text-xs">
          <div className="flex justify-center items-center h-full">
            {getBooleanStatusIcon(monthStatus?.mandatory_ipl)}
          </div>
        </td>
        <td className="text-xs">
          <div className="flex justify-center items-center h-full">
            {getBooleanStatusIcon(monthStatus?.mandatory_rt)}
          </div>
        </td>
        <td>
          <div className="flex gap-1">
            <button
              className="btn btn-ghost btn-xs gap-1 touch-target-sm"
              onClick={() => onEditClick?.(house)}
              aria-label="Edit rumah"
            >
              <FaRegEdit className="h-3 w-3" /> Edit
            </button>
            <Link
              href={`/ipl/${house.house_id.toLowerCase()}`}
              target="_blank"
              className="btn btn-ghost btn-xs gap-1 touch-target-sm"
              aria-label="Lihat IPL"
            >
              <FaHome className="h-3 w-3" /> IPL
            </Link>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
      <ResponsiveTable
        data={houses}
        columns={columns}
        renderMobileCard={renderMobileCard}
        renderDesktopRow={renderDesktopRow}
        emptyMessage="Tidak ada data rumah untuk periode ini"
      />
    </div>
  );
};

export default HousesTable;
