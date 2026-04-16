const StatCard = ({ title, value, icon: Icon, color = 'indigo', trend, trendValue }) => {
  const colorClasses = {
    indigo: 'bg-primary/10 text-primary',
    violet: 'bg-secondary/10 text-secondary',
    cyan: 'bg-accent/10 text-accent',
    emerald: 'bg-success/10 text-success',
    amber: 'bg-warning/10 text-warning',
    rose: 'bg-error/10 text-error',
  };

  return (
    <div className="app-card p-4 flex flex-col justify-between h-full group">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2.5 rounded-[18px] shrink-0 transition-transform group-hover:scale-110 ${colorClasses[color]}`}>
          {Icon && <Icon className="w-5 h-5 lg:w-6 lg:h-6" />}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-base-200/50 ${trend === 'up' ? 'text-success' : 'text-error'}`}>
            {trend === 'up' ? (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M7 11l5-5m0 0l5 5m-5-5v12" />
              </svg>
            ) : (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 13l-5 5m0 0l-5-5m5 5V6" />
              </svg>
            )}
            <span>{trendValue}</span>
          </div>
        )}
      </div>
      <div>
        <p className="text-[10px] lg:text-xs font-bold text-base-content/50 uppercase tracking-wider mb-1 line-clamp-1">{title}</p>
        <h3 className="text-base lg:text-xl font-extrabold text-base-content tracking-tight line-clamp-1">{value}</h3>
      </div>
    </div>
  );
};

export default StatCard;
