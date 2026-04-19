import KpiGrid from './KpiGrid';
import { formatCurrency } from '../../utils/format';
import {
  FaFileInvoiceDollar,
  FaHome,
  FaCalculator,
} from 'react-icons/fa';

/**
 * BillsStats - KPI cards for bills/outstanding summary
 *
 * Displays 3 key metrics:
 * - Total Tagihan (primary)
 * - Jumlah Rumah (info)
 * - Rata-rata per Rumah (secondary)
 *
 * @param {Object} props
 * @param {Object} props.stats - Stats object { totalAmount, totalHouses, averagePerHouse }
 * @param {boolean} props.loading - Loading state
 */
const BillsStats = ({ stats, loading = false }) => {
  const {
    totalAmount,
    totalHouses,
    averagePerHouse,
  } = stats || {};

  const statItems = [
    {
      title: 'Total Tagihan',
      value: formatCurrency(totalAmount || 0),
      icon: FaFileInvoiceDollar,
      color: 'primary',
      subtitle: 'Total tagihan berjalan',
    },
    {
      title: 'Jumlah Rumah',
      value: totalHouses || 0,
      icon: FaHome,
      color: 'info',
      subtitle: 'Rumah dengan tagihan',
    },
    {
      title: 'Rata-rata per Rumah',
      value: formatCurrency(averagePerHouse || 0),
      icon: FaCalculator,
      color: 'secondary',
      subtitle: 'Rata-rata tagihan',
    },
  ];

  return (
    <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
      <KpiGrid stats={statItems} loading={loading} />
    </div>
  );
};

export default BillsStats;
