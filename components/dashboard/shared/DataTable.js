import { FaEllipsisH } from 'react-icons/fa';

/**
 * DataTable - Reusable table component with mobile card view
 * 
 * @param {Object} props
 * @param {Array} props.data - Array of data items
 * @param {Array} props.columns - Column definitions [{ key, label, width, align, render }]
 * @param {Function} props.renderMobileCard - Render function for mobile cards (item, index) => JSX
 * @param {Function} props.renderDesktopRow - Render function for desktop rows (item, index) => JSX
 * @param {boolean} props.loading - Loading state
 * @param {string} props.emptyMessage - Message when no data
 * @param {Function} props.onRowClick - Callback when row is clicked
 */
const DataTable = ({
  data = [],
  columns = [],
  renderMobileCard,
  renderDesktopRow,
  loading = false,
  emptyMessage = 'Tidak ada data',
  onRowClick,
}) => {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse bg-base-200 h-16 rounded-lg" />
        ))}
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="text-center py-12 text-base-content/50">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile View */}
      <div className="lg:hidden space-y-3">
        {data.map((item, index) => (
          <div
            key={index}
            className={`app-card p-4 ${onRowClick ? 'cursor-pointer active:scale-[0.98] transition-transform' : ''}`}
            onClick={() => onRowClick?.(item)}
          >
            {renderMobileCard ? renderMobileCard(item, index) : (
              <div className="flex justify-between items-center">
                <span className="font-medium">{item.name || item.id || `Item ${index + 1}`}</span>
                <FaEllipsisH className="text-base-content/30" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Desktop View */}
      <div className="hidden lg:block overflow-x-auto rounded-xl border border-base-200 bg-base-100 shadow-sm">
        <table className="table table-sm w-full">
          <thead>
            <tr className="bg-base-200">
              {columns.map((col, index) => (
                <th
                  key={index}
                  className={`py-2 px-3 text-left font-semibold text-sm text-base-content/70 ${
                    col.className || ''
                  }`}
                  style={{ width: col.width }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr
                key={index}
                className={`border-b border-base-200 hover:bg-base-100/50 ${
                  onRowClick ? 'cursor-pointer' : ''
                }`}
                onClick={() => onRowClick?.(item)}
              >
                {renderDesktopRow ? renderDesktopRow(item, index) : (
                  <td className="py-3 px-3">
                    {item.name || item.id || `Item ${index + 1}`}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default DataTable;
