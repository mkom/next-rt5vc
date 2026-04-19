import KpiGrid from './KpiGrid';
import { FaUsers } from 'react-icons/fa';

/**
 * UsersStats - KPI card for users summary
 *
 * Displays 1 metric:
 * - Total Users (primary)
 *
 * @param {Object} props
 * @param {Object} props.stats - Stats object { totalUsers }
 * @param {boolean} props.loading - Loading state
 */
const UsersStats = ({ stats, loading = false }) => {
  const { totalUsers } = stats || {};

  const statItems = [
    {
      title: 'Total Users',
      value: totalUsers || 0,
      icon: FaUsers,
      color: 'primary',
      subtitle: 'Jumlah user terdaftar',
    },
  ];

  return (
    <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
      <KpiGrid stats={statItems} loading={loading} />
    </div>
  );
};

export default UsersStats;
