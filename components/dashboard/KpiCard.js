import { FaArrowUp, FaArrowDown, FaMinus } from 'react-icons/fa';

/**
 * KpiCard - Enhanced KPI card with trend indicators and loading state
 *
 * @param {Object} props
 * @param {string} props.title - Card title
 * @param {string|number} props.value - Main value to display
 * @param {React.Component} props.icon - Icon component
 * @param {string} props.color - Color theme (primary, success, error, warning, info)
 * @param {Object} props.trend - Trend data { direction: 'up'|'down'|'neutral', value: string, label: string }
 * @param {Object} props.progress - Progress bar data { current: number, max: number }
 * @param {string} props.subtitle - Subtitle text
 * @param {Function} props.onClick - Click handler
 * @param {boolean} props.loading - Loading skeleton state
 * @param {number} props.animationDelay - Animation delay in ms
 */
const KpiCard = ({
  title,
  value,
  icon: Icon,
  color = 'primary',
  trend,
  progress,
  subtitle,
  onClick,
  loading = false,
  animationDelay = 0,
}) => {
  const colorClasses = {
    primary: {
      bg: 'bg-primary/10',
      text: 'text-primary',
      border: 'border-primary/20',
      progress: 'bg-primary',
    },
    success: {
      bg: 'bg-success/10',
      text: 'text-success',
      border: 'border-success/20',
      progress: 'bg-success',
    },
    error: {
      bg: 'bg-error/10',
      text: 'text-error',
      border: 'border-error/20',
      progress: 'bg-error',
    },
    warning: {
      bg: 'bg-warning/10',
      text: 'text-warning',
      border: 'border-warning/20',
      progress: 'bg-warning',
    },
    info: {
      bg: 'bg-info/10',
      text: 'text-info',
      border: 'border-info/20',
      progress: 'bg-info',
    },
  };

  const theme = colorClasses[color] || colorClasses.primary;
  const clickable = !!onClick;

  // Get trend icon and color
  const getTrendIcon = () => {
    if (trend?.direction === 'up') return <FaArrowUp className="w-3 h-3" />;
    if (trend?.direction === 'down') return <FaArrowDown className="w-3 h-3" />;
    return <FaMinus className="w-3 h-3" />;
  };

  const getTrendColor = () => {
    // For financial metrics, up is usually good (green)
    // But for outstanding/unpaid, down is good
    if (trend?.direction === 'up') return trend.isPositive ? 'text-success' : 'text-error';
    if (trend?.direction === 'down') return trend.isPositive ? 'text-success' : 'text-error';
    return 'text-base-content/50';
  };

  // Progress percentage
  const progressPercent = progress && progress.max > 0
    ? Math.min(100, Math.round((progress.current / progress.max) * 100))
    : 0;

  // Loading skeleton
  if (loading) {
    return (
      <div className="app-card p-4 lg:p-5 h-full animate-pulse">
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 rounded-xl bg-base-300" />
          <div className="w-16 h-5 rounded-full bg-base-300" />
        </div>
        <div className="space-y-2">
          <div className="w-24 h-3 rounded bg-base-300" />
          <div className="w-32 h-6 rounded bg-base-300" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`
        app-card p-4 lg:p-5 h-full flex flex-col justify-between
        transition-all duration-300 ease-out
        hover:-translate-y-1 hover:shadow-lg hover:border-green-200
        ${clickable ? 'cursor-pointer' : ''}
        animate-slide-up
      `}
      style={{ animationDelay: `${animationDelay}ms` }}
      onClick={onClick}
    >
      {/* Top Row: Icon and Trend */}
      <div className="flex items-start justify-between mb-3">
        <div className={`
          p-2.5 lg:p-3 rounded-xl shrink-0
          transition-transform duration-200 group-hover:scale-110
          ${theme.bg} ${theme.text}
        `}>
          {Icon && <Icon className="w-5 h-5 lg:w-6 lg:h-6" />}
        </div>

        {trend && (
          <div className={`
            flex items-center gap-1 text-[10px] font-bold
            px-2 py-1 rounded-full bg-base-200/50
            ${getTrendColor()}
          `}>
            {getTrendIcon()}
            {trend.value && <span>{trend.value}</span>}
          </div>
        )}
      </div>

      {/* Middle: Title and Value */}
      <div className="flex-1">
        <p className="text-[10px] lg:text-xs font-bold text-base-content/50 uppercase tracking-wider mb-1 line-clamp-1">
          {title}
        </p>
        <h3 className="text-base lg:text-xl font-extrabold text-base-content tracking-tight line-clamp-1">
          {value}
        </h3>
      </div>

      {/* Bottom: Subtitle and Progress */}
      {(subtitle || progress) && (
        <div className="mt-3 space-y-2">
          {subtitle && (
            <p className="text-[10px] text-base-content/40 truncate">
              {subtitle}
            </p>
          )}

          {progress && (
            <div className="space-y-1">
              <div className="h-1.5 w-full bg-base-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${theme.progress}`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-[10px] text-base-content/40 text-right">
                {progressPercent}%
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default KpiCard;
