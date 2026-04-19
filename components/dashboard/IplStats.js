import KpiGrid from './KpiGrid';
import { formatCurrency } from '../../utils/format';
import {
  FaWallet,
  FaCheckCircle,
  FaTimesCircle,
  FaBookmark,
  FaAdjust,
} from 'react-icons/fa';

/**
 * IplStats - KPI cards for IPL summary
 *
 * Displays 5 key metrics:
 * - Total Terkumpul (primary)
 * - Lunas (success)
 * - Belum Bayar (error)
 * - PGYB/TBD (info)
 * - Bayar Sebagian (warning)
 *
 * @param {Object} props
 * @param {Object} props.stats - Stats object { totalCollected, lunas, belumBayar, tbd, bayarSebagian }
 * @param {boolean} props.loading - Loading state
 */
const IplStats = ({ stats, loading = false }) => {
  const {
    totalCollected,
    lunas,
    belumBayar,
    tbd,
    bayarSebagian,
  } = stats || {};

  const statItems = [
    {
      title: 'Total Terkumpul',
      value: formatCurrency(totalCollected || 0),
      icon: FaWallet,
      color: 'primary',
      subtitle: 'Total iuran terkumpul',
    },
    {
      title: 'Lunas',
      value: lunas || 0,
      icon: FaCheckCircle,
      color: 'success',
      subtitle: 'Rumah sudah lunas',
    },
    {
      title: 'Belum Bayar',
      value: belumBayar || 0,
      icon: FaTimesCircle,
      color: 'error',
      subtitle: 'Rumah belum bayar',
    },
    {
      title: 'PGYB',
      value: tbd || 0,
      icon: FaBookmark,
      color: 'info',
      subtitle: 'Paguyuban',
    },
    {
      title: 'Bayar Sebagian',
      value: bayarSebagian || 0,
      icon: FaAdjust,
      color: 'warning',
      subtitle: 'Bayar sebagian',
    },
  ];

  return (
    <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
      <KpiGrid stats={statItems} loading={loading} />
    </div>
  );
};

export default IplStats;
