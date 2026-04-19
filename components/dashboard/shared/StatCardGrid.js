import { FaArrowUp, FaArrowDown, FaMinus } from 'react-icons/fa';

/**
 * StatCardGrid - Grid of stat cards for dashboard
 * 
 * @param {Object} props
 * @param {Array} props.stats - Array of stat objects [{ title, value, icon, color, trend, onClick }]
 * @param {string} props.columns - Grid columns class (default: 'grid-cols-2 lg:grid-cols-4')
 */
const StatCardGrid = ({ stats = [], columns = 'grid-cols-2 lg:grid-cols-4' }) => {
  const getColorClass = (color) => {
    const colors = {
      primary: 'bg-primary/10 text-primary',
      success: 'bg-success/10 text-success',
      error: 'bg-error/10 text-error',
      warning: 'bg-warning/10 text-warning',
      info: 'bg-info/10 text-info',
    };
    return colors[color] || colors.primary;
  };

  const getTrendIcon = (trend) => {
    if (trend === 'up') return <FaArrowUp className="w-3 h-3" />;
    if (trend === 'down') return <FaArrowDown className="w-3 h-3" />;
    return <FaMinus className="w-3 h-3" />;
  };

  return (
    <div className={`grid ${columns} gap-3 lg:gap-4`}>
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const clickable = !!stat.onClick;

        return (
          <div
            key={index}
            className={`app-card p-4 flex flex-col justify-between h-full group ${
              clickable ? 'cursor-pointer hover:shadow-md transition-shadow' : ''
            }`}
            onClick={stat.onClick}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2.5 rounded-[14px] shrink-0 transition-transform group-hover:scale-110 ${getColorClass(stat.color)}`}>
                {Icon && <Icon className="w-5 h-5" />}
              </div>
              {stat.trend && (
                <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-base-200/50 ${
                  stat.trend === 'up' ? 'text-success' : stat.trend === 'down' ? 'text-error' : 'text-base-content/50'
                }`}>
                  {getTrendIcon(stat.trend)}
                  {stat.trendValue && <span>{stat.trendValue}</span>}
                </div>
              )}
            </div>
            <div>
              <p className="text-[10px] lg:text-xs font-bold text-base-content/50 uppercase tracking-wider mb-1 line-clamp-1">
                {stat.title}
              </p>
              <h3 className="text-base lg:text-xl font-extrabold text-base-content tracking-tight line-clamp-1">
                {stat.value}
              </h3>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatCardGrid;
