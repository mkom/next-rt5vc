import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { formatCurrency } from '../../../utils/format';

/**
 * IplCollectionChart - Bar chart showing IPL payment status distribution
 *
 * @param {Object} props
 * @param {Object} props.data - IPL metrics data { paidCount, unpaidCount, partialCount, tbdCount, totalCollected }
 * @param {boolean} props.loading - Loading state
 */
const IplCollectionChart = ({ data = {}, loading = false }) => {
  const chartData = [
    { name: 'Lunas', value: data.paidCount || 0, color: '#2E7D32' },
    { name: 'Belum Bayar', value: data.unpaidCount || 0, color: '#DC2626' },
    { name: 'Sebagian', value: data.partialCount || 0, color: '#F9A825' },
    { name: 'PGYB', value: data.tbdCount || 0, color: '#00838F' },
  ];

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-xl shadow-lg border border-green-100">
          <p className="text-sm font-semibold text-base-content">{item.name}</p>
          <p className="text-xs text-base-content/70">
            Jumlah: <span className="font-medium">{item.value} rumah</span>
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

  const totalHouses = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="app-card p-5 animate-scale-in" style={{ animationDelay: '400ms' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-base-content">
          Status Pembayaran IPL
        </h3>
        <div className="text-right">
          <p className="text-xs text-base-content/50">Total Terkumpul</p>
          <p className="text-sm font-bold text-success">{formatCurrency(data.totalCollected || 0)}</p>
        </div>
      </div>

      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E8F5E9" vertical={false} />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#757575', fontSize: 11 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#757575', fontSize: 11 }}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" name="Jumlah Rumah" radius={[6, 6, 0, 0]} maxBarSize={60}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-2 mt-4">
        {chartData.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs text-base-content/70">{item.name}</span>
            <span className="text-xs font-semibold ml-auto">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IplCollectionChart;
