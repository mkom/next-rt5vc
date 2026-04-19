import KpiGrid from './KpiGrid';
import {
  FaHome,
  FaCheckCircle,
  FaTimesCircle,
  FaBookmark,
} from 'react-icons/fa';

/**
 * HousesStats - KPI cards for houses summary
 *
 * Displays 4 key metrics:
 * - Total Rumah (primary)
 * - Isi (success) - IPL + Kas
 * - Weekend (info) - Kas only
 * - Kosong (error) - no iuran
 *
 * @param {Object} props
 * @param {Object} props.stats - Stats object { total, isi, kosong, weekend }
 * @param {boolean} props.loading - Loading state
 */
const HousesStats = ({ stats, loading = false }) => {
  const {
    total,
    isi,
    kosong,
    weekend,
  } = stats || {};

  const statItems = [
    {
      title: 'Total Rumah',
      value: total || 0,
      icon: FaHome,
      color: 'primary',
      subtitle: 'Total rumah terdata',
    },
    {
      title: 'Isi',
      value: isi || 0,
      icon: FaCheckCircle,
      color: 'success',
      subtitle: 'IPL + Kas',
    },
    {
      title: 'Weekend',
      value: weekend || 0,
      icon: FaBookmark,
      color: 'info',
      subtitle: 'Kas only',
    },
    {
      title: 'Kosong',
      value: kosong || 0,
      icon: FaTimesCircle,
      color: 'error',
      subtitle: 'Tidak ada iuran',
    },
  ];

  return (
    <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
      <KpiGrid stats={statItems} loading={loading} />
    </div>
  );
};

export default HousesStats;
