import moment from 'moment';
import { FaRegEnvelope, FaWhatsapp } from 'react-icons/fa';
import { formatCurrency } from '../../utils/format';
import ResponsiveTable from '../ui/ResponsiveTable';

/**
 * BillsTable - Table component for displaying outstanding bills
 *
 * Features:
 * - Mobile card view
 * - Desktop table view
 * - Period badges with status colors (error for unpaid, secondary for weekend)
 * - Action buttons (Surat, WA)
 * - Loading skeleton state
 * - Accessible buttons
 *
 * @param {Object} props
 * @param {Array} props.houses - Array of houses with outstanding bills
 * @param {number} props.offset - Row number offset for pagination
 * @param {Function} props.onLetterClick - Handler for letter preview click
 * @param {Function} props.onWhatsAppClick - Handler for WhatsApp click
 * @param {boolean} props.loading - Loading state
 */
const BillsTable = ({
  houses = [],
  offset = 0,
  onLetterClick,
  onWhatsAppClick,
  loading = false,
}) => {
  // Render period badges with appropriate colors
  const renderPeriodBadges = (house) => (
    <span className="flex flex-wrap gap-1">
      {house.periods?.map((period, index) => {
        const status = house.monthly_status?.find((s) => s.month === period)?.status;
        const badgeClass = status === 'Weekend' ? 'badge-secondary' : 'badge-error';
        return (
          <span key={index} className={`badge badge-xs ${badgeClass}`}>
            {moment(period, 'YYYY-MM').format('MMMM YYYY')}
          </span>
        );
      })}
    </span>
  );

  // Loading skeleton for mobile cards
  const renderMobileSkeleton = () => (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="app-card p-4 animate-pulse">
          <div className="flex items-center justify-between gap-2">
            <div className="w-24 h-5 rounded bg-base-300" />
            <div className="w-20 h-6 rounded bg-base-300" />
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            <div className="w-16 h-4 rounded bg-base-300" />
            <div className="w-16 h-4 rounded bg-base-300" />
          </div>
          <div className="flex justify-between items-center mt-2">
            <div className="w-32 h-4 rounded bg-base-300" />
            <div className="w-24 h-8 rounded bg-base-300" />
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
            <th>Periode</th>
            <th>Total</th>
            <th className="text-right">Jumlah</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {[1, 2, 3, 4, 5].map((i) => (
            <tr key={i} className="animate-pulse">
              <td><div className="w-4 h-3 rounded bg-base-300" /></td>
              <td><div className="w-12 h-3 rounded bg-base-300" /></td>
              <td><div className="w-24 h-3 rounded bg-base-300" /></td>
              <td><div className="w-32 h-3 rounded bg-base-300" /></td>
              <td><div className="w-10 h-3 rounded bg-base-300" /></td>
              <td className="text-right"><div className="w-20 h-3 rounded bg-base-300 ml-auto" /></td>
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
    { label: 'Periode', className: 'w-1/3' },
    { label: 'Total', className: 'w-16' },
    { label: 'Jumlah', className: 'w-20 text-right' },
    { label: '', className: 'w-24' },
  ];

  const renderMobileCard = (house, index) => (
    <div className="space-y-2">
      <div className="flex justify-between items-start">
        <div>
          <span className="font-semibold">{house.house_id}</span>{' '}
          <span className="text-base-content/70">{house.resident_name}</span>
        </div>
      </div>
      <div>{renderPeriodBadges(house)}</div>
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">
          {house.periods?.length || 0} Bln {formatCurrency(house.total_fee || 0)}
        </span>
        <div className="flex gap-1">
          <button
            onClick={() => onLetterClick?.(house)}
            className="btn btn-ghost btn-xs gap-1 touch-target-sm"
            aria-label="Kirim surat"
            title="Kirim surat"
          >
            <FaRegEnvelope className="h-3 w-3" />
            <span className="hidden sm:inline">Surat</span>
          </button>
          <button
            onClick={() => onWhatsAppClick?.(house)}
            className="btn btn-ghost btn-xs gap-1 touch-target-sm"
            aria-label="Kirim WhatsApp"
            title="Kirim WhatsApp"
          >
            <FaWhatsapp className="h-3 w-3" />
            <span className="hidden sm:inline">WA</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderDesktopRow = (house, index) => (
    <tr key={house._id || index} className="hover:bg-base-200/50 transition-colors">
      <td className="text-xs">{offset + index + 1}</td>
      <td className="text-xs font-medium">{house.house_id}</td>
      <td className="text-xs md:text-sm max-w-[200px] truncate" title={house.resident_name}>
        {house.resident_name}
      </td>
      <td>{renderPeriodBadges(house)}</td>
      <td className="text-xs">{house.periods?.length || 0} Bulan</td>
      <td className="text-xs whitespace-nowrap font-medium text-right">
        {formatCurrency(house.total_fee || 0)}
      </td>
      <td>
        <div className="flex gap-1">
          <button
            onClick={() => onLetterClick?.(house)}
            className="btn btn-ghost btn-xs gap-1 touch-target-sm"
            aria-label="Kirim surat"
            title="Kirim surat"
          >
            <FaRegEnvelope className="h-3 w-3" />
            <span>Surat</span>
          </button>
          <button
            onClick={() => onWhatsAppClick?.(house)}
            className="btn btn-ghost btn-xs gap-1 touch-target-sm"
            aria-label="Kirim WhatsApp"
            title="Kirim WhatsApp"
          >
            <FaWhatsapp className="h-3 w-3" />
            <span>WA</span>
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
      <ResponsiveTable
        data={houses}
        columns={columns}
        renderMobileCard={renderMobileCard}
        renderDesktopRow={renderDesktopRow}
        emptyMessage="Tidak ada tagihan berjalan"
      />
    </div>
  );
};

export default BillsTable;
