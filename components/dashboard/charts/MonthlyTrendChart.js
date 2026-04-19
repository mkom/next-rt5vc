import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { formatCurrency } from '../../../utils/format';

/**
 * MonthlyTrendChart - Line/Area chart showing income vs expense trends
 *
 * @param {Object} props
 * @param {Array} props.data - Array of monthly data { month, income, expense }
 * @param {boolean} props.loading - Loading state
 */
const MonthlyTrendChart = ({ data = [], loading = false }) => {
  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-xl shadow-lg border border-green-100">
          <p className="text-sm font-semibold text-base-content mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-xs" style={{ color: entry.color }}>
              <span className="font-medium">{entry.name}:</span>{' '}
              {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Format Y axis values (short format)
  const formatYAxis = (value) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
    return value;
  };

  if (loading) {
    return (
      <div className="app-card p-5 h-80 animate-pulse">
        <div className="h-72 bg-base-200 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="app-card p-5 animate-scale-in" style={{ animationDelay: '300ms' }}>
      <div className="h-72 lg:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2E7D32" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#2E7D32" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#DC2626" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#DC2626" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E8F5E9" vertical={false} />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#757575', fontSize: 11 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#757575', fontSize: 11 }}
              tickFormatter={formatYAxis}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              height={30}
              iconType="circle"
              wrapperStyle={{ fontSize: '12px', paddingBottom: '10px' }}
            />
            <Area
              type="monotone"
              dataKey="income"
              name="Pemasukan"
              stroke="#2E7D32"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorIncome)"
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
            <Area
              type="monotone"
              dataKey="expense"
              name="Pengeluaran"
              stroke="#DC2626"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorExpense)"
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MonthlyTrendChart;
