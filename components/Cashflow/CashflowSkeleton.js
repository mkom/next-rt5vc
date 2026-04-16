/**
 * CashflowSkeleton Component
 * Skeleton loading untuk daftar transaksi
 * 
 * @param {Object} props
 * @param {number} props.count - Jumlah skeleton cards (default: 5)
 */
const CashflowSkeleton = ({ count = 5 }) => (
  <div className="animate-pulse flex flex-col gap-2 mt-2">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="app-card p-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-base-300 rounded-full"></div>
        <div className="flex-1">
          <div className="h-4 w-32 bg-base-300 rounded mb-2"></div>
          <div className="h-3 w-20 bg-base-300 rounded"></div>
        </div>
        <div className="h-4 w-24 bg-base-300 rounded"></div>
      </div>
    ))}
  </div>
);

export default CashflowSkeleton;
