import Link from 'next/link';
import { formatCurrency, formatDate } from '../../utils/format';
import { getPaymentStatusIcon } from '../../utils/statusIcons';
import { FaEye } from 'react-icons/fa';
import ResponsiveTable from '../ui/ResponsiveTable';

/**
 * IplTable - Table component for displaying IPL data
 *
 * Features:
 * - Mobile card view
 * - Desktop table view
 * - Color-coded rows for weekend houses
 * - Loading skeleton state
 * - Accessible action buttons
 *
 * @param {Object} props
 * @param {Array} props.houses - Array of houses to display
 * @param {string} props.selectedPeriod - Selected period for fetching monthly data (YYYY-MM)
 * @param {number} props.offset - Row number offset for pagination
 * @param {boolean} props.loading - Loading state
 */
const IplTable = ({
  houses = [],
  selectedPeriod = '',
  offset = 0,
  loading = false,
}) => {
  // Get monthly fee for a house
  const getMonthlyFee = (house) =>
    house.monthly_fees?.find((s) => s.month === selectedPeriod);

  // Check if house is weekend status
  const isWeekend = (house) =>
    house.monthly_status?.find((s) => s.month === selectedPeriod)?.status ===
    'Weekend';

  // Loading skeleton for mobile cards
  const renderMobileSkeleton = () => (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="app-card p-4 animate-pulse">
          <div className="flex items-center justify-between gap-2">
            <div className="w-24 h-5 rounded bg-base-300" />
            <div className="w-8 h-8 rounded-full bg-base-300" />
          </div>
          <div className="flex justify-between items-center mt-2">
            <div className="w-32 h-4 rounded bg-base-300" />
            <div className="w-20 h-4 rounded bg-base-300" />
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
              <td><div className="w-16 h-3 rounded bg-base-300" /></td>
              <td><div className="w-32 h-3 rounded bg-base-300" /></td>
              <td><div className="w-20 h-3 rounded bg-base-300" /></td>
              <td><div className="w-24 h-3 rounded bg-base-300" /></td>
              <td className="text-center"><div className="w-6 h-6 rounded-full bg-base-300 mx-auto" /></td>
              <td><div className="w-10 h-6 rounded bg-base-300" /></td>
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
    { label: 'Nama', className: 'w-1/3' },
    { label: 'Tanggal', className: 'w-1/6' },
    { label: 'Nominal', className: 'w-1/6' },
    { label: 'Status', className: 'text-center w-1/6' },
    { label: '', className: 'w-10' },
  ];

  const renderMobileCard = (house, index) => {
    const fee = getMonthlyFee(house);
    const feeStatus = fee?.status;
    const showAmount = feeStatus === 'Lunas' || feeStatus === 'Bayar Sebagian';

    return (
      <div className={isWeekend(house) ? 'bg-secondary/20 rounded-lg p-1' : ''}>
        <div className="flex justify-between items-center">
          <span className="font-semibold">
            {house.house_id} {house.resident_name}
          </span>
          {getPaymentStatusIcon(feeStatus)}
        </div>
        <div className="flex justify-between items-center mt-1 text-sm text-base-content/70">
          <span>
            Tgl: {fee?.transaction_id?.date ? formatDate(fee.transaction_id.date) : '-'}
            {'  '}
            {showAmount ? formatCurrency(fee?.fee) : '-'}
          </span>
          <Link
            href={`/ipl/${house.house_id.toLowerCase()}`}
            target="_blank"
            className="btn btn-ghost btn-xs gap-1"
          >
            <FaEye className="h-3 w-3" /> Detail
          </Link>
        </div>
      </div>
    );
  };

  const renderDesktopRow = (house, index) => {
    const fee = getMonthlyFee(house);
    const feeStatus = fee?.status;
    const showAmount = feeStatus === 'Lunas' || feeStatus === 'Bayar Sebagian';

    return (
      <tr
        key={house._id || index}
        className={`${isWeekend(house) ? 'bg-secondary/20' : ''} hover:bg-base-200/50 transition-colors`}
      >
        <td className="text-xs">{offset + index + 1}</td>
        <td className="text-xs font-medium">{house.house_id}</td>
        <td className="text-xs md:text-sm max-w-[200px] truncate" title={house.resident_name}>
          {house.resident_name}
        </td>
        <td className="text-xs whitespace-nowrap">
          {fee?.transaction_id?.date ? formatDate(fee.transaction_id.date) : '-'}
        </td>
        <td className="text-xs whitespace-nowrap font-medium">
          {showAmount ? formatCurrency(fee?.fee) : '-'}
        </td>
        <td className="text-center">
          <span className="flex justify-center" title={`Status: ${feeStatus}`}>
            {getPaymentStatusIcon(feeStatus)}
          </span>
        </td>
        <td>
          <Link
            href={`/ipl/${house.house_id.toLowerCase()}`}
            target="_blank"
            className="btn btn-ghost btn-xs gap-1"
          >
            <FaEye className="h-3 w-3" /> Detail
          </Link>
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
        emptyMessage="Tidak ada data IPL untuk periode ini"
      />
    </div>
  );
};

export default IplTable;
