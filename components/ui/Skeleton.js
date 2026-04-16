/**
 * Skeleton Components
 * Reusable skeleton loading components
 */

/**
 * SkeletonCard - Card-style skeleton loading
 * @param {number} count - Jumlah skeleton cards
 */
export const SkeletonCard = ({ count = 1 }) => (
  <div className="animate-pulse flex flex-col gap-3">
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

/**
 * SkeletonStats - Stats card skeleton loading
 * @param {number} count - Jumlah skeleton stat cards
 */
export const SkeletonStats = ({ count = 2 }) => (
  <div className="grid grid-cols-2 gap-2">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="bg-base-200/50 rounded-2xl p-3 border border-base-200 animate-pulse">
        <div className="h-3 w-16 bg-base-300 rounded mb-2"></div>
        <div className="h-5 w-24 bg-base-300 rounded"></div>
      </div>
    ))}
  </div>
);

/**
 * SkeletonText - Text skeleton loading
 * @param {number} lines - Jumlah baris
 * @param {string} className - Class tambahan
 */
export const SkeletonText = ({ lines = 1, className = '' }) => (
  <div className={`animate-pulse flex flex-col gap-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <div key={i} className="h-4 bg-base-300 rounded w-full"></div>
    ))}
  </div>
);

const Skeleton = { SkeletonCard, SkeletonStats, SkeletonText };

export default Skeleton;
