import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

/**
 * OccupancyChart - Doughnut chart showing house occupancy distribution
 *
 * @param {Object} props
 * @param {Object} props.data - Citizen metrics { totalHouses, occupiedCount, emptyCount, weekendCount }
 * @param {boolean} props.loading - Loading state
 */
const OccupancyChart = ({ data = {}, loading = false }) => {
  const chartData = [
    { name: 'Isi', value: data.occupiedCount || 0, color: '#2E7D32' },
    { name: 'Kosong', value: data.emptyCount || 0, color: '#DC2626' },
    { name: 'Weekend', value: data.weekendCount || 0, color: '#00838F' },
  ].filter(item => item.value > 0);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      const total = chartData.reduce((sum, d) => sum + d.value, 0);
      const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;

      return (
        <div className="bg-white p-3 rounded-xl shadow-lg border border-green-100">
          <p className="text-sm font-semibold text-base-content">{item.name}</p>
          <p className="text-xs text-base-content/70">
            {item.value} rumah ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="app-card p-5 h-80 animate-pulse">
        <div className="h-6 w-48 bg-base-300 rounded mb-4" />
        <div className="h-56 bg-base-200 rounded-xl" />
      </div>
    );
  }

  const total = data.totalHouses || 0;

  return (
    <div className="app-card p-5 animate-scale-in" style={{ animationDelay: '350ms' }}>
      <h3 className="text-base font-bold text-base-content mb-4">
        Distribusi Status Rumah
      </h3>

      <div className="h-48 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={70}
              paddingAngle={4}
              dataKey="value"
              stroke="none"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-bold text-base-content">{total}</span>
          <span className="text-xs text-base-content/50">Total Rumah</span>
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-3 gap-2 mt-4">
        {chartData.map((item) => (
          <div key={item.name} className="flex flex-col items-center">
            <div className="flex items-center gap-1.5 mb-1">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs text-base-content/70">{item.name}</span>
            </div>
            <span className="text-sm font-semibold">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OccupancyChart;
