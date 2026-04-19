import Link from 'next/link';
import { FaHome, FaExclamationTriangle } from 'react-icons/fa';
import { formatCurrency } from '../../utils/format';
import moment from 'moment';

/**
 * TopOutstanding - Widget showing top houses with outstanding payments
 *
 * @param {Object} props
 * @param {Array} props.houses - Array of outstanding houses
 * @param {boolean} props.loading - Loading state
 * @param {string} props.className - Additional CSS classes
 */
const TopOutstanding = ({ houses = [], loading = false, className = '' }) => {
  if (loading) {
    return (
      <div className={`app-card p-5 ${className} animate-pulse`}>
        <div className="h-5 w-40 bg-base-300 rounded mb-4" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-3 py-3">
            <div className="w-10 h-10 rounded-full bg-base-200" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-24 bg-base-200 rounded" />
              <div className="h-2 w-16 bg-base-200 rounded" />
            </div>
            <div className="h-4 w-20 bg-base-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`app-card p-5 animate-slide-up ${className}`} style={{ animationDelay: '550ms' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-base-content">Tagihan Tertinggi</h3>
        <Link
          href="/dashboard/bills"
          className="text-xs text-primary hover:text-primary/80 font-medium"
        >
          Lihat Semua
        </Link>
      </div>

      {houses.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-3">
            <FaExclamationTriangle className="w-6 h-6 text-success" />
          </div>
          <p className="text-sm text-base-content/70">Tidak ada tagihan</p>
          <p className="text-xs text-base-content/50 mt-1">Semua pembayaran sudah lunas</p>
        </div>
      ) : (
        <div className="space-y-1">
          {houses.map((house, index) => (
            <div
              key={house._id || house.house_id}
              className="flex items-center gap-3 py-3 hover:bg-base-200/50 rounded-lg px-2 -mx-2 transition-colors"
            >
              {/* Rank */}
              <div className={`
                w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                ${index < 3 ? 'bg-warning/10 text-warning' : 'bg-base-200 text-base-content/50'}
              `}>
                {index + 1}
              </div>

              {/* Icon */}
              <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center shrink-0">
                <FaHome className="w-4 h-4 text-error" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-base-content truncate">
                  {house.house_id} - {house.resident_name}
                </p>
                <p className="text-xs text-base-content/50">
                  {house.periods?.length || 0} bulan tunggakan
                </p>
              </div>

              {/* Amount */}
              <div className="text-sm font-bold text-error">
                {formatCurrency(house.total_fee)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TopOutstanding;
