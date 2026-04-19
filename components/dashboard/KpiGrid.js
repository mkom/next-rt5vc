import KpiCard from './KpiCard';

/**
 * KpiGrid - Grid layout for KPI cards with responsive columns
 *
 * @param {Object} props
 * @param {Array} props.stats - Array of stat objects
 * @param {boolean} props.loading - Loading state for all cards
 * @param {string} props.className - Additional CSS classes
 */
const KpiGrid = ({ stats = [], loading = false, className = '' }) => {
  // Determine grid columns based on number of stats
  const gridCols = stats.length <= 4 
    ? 'grid-cols-2 lg:grid-cols-4' 
    : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6';

  return (
    <div className={`grid ${gridCols} gap-3 lg:gap-4 ${className}`}>
      {stats.map((stat, index) => (
        <KpiCard
          key={index}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          color={stat.color}
          trend={stat.trend}
          progress={stat.progress}
          subtitle={stat.subtitle}
          onClick={stat.onClick}
          loading={loading}
          animationDelay={index * 50} // Staggered animation
        />
      ))}
    </div>
  );
};

export default KpiGrid;
