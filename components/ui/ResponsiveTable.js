const ResponsiveTable = ({
  data,
  columns,
  renderMobileCard,
  renderDesktopRow,
  emptyMessage = 'Data tidak tersedia',
}) => {
  if (!data || data.length === 0) {
    return <p className="text-center text-base-content/60 py-8">{emptyMessage}</p>;
  }

  return (
    <>
      {/* Mobile: Card layout */}
      <div className="md:hidden space-y-3">
        {data.map((item, idx) => (
          <div key={idx} className="card bg-base-100 border border-base-300 rounded-lg">
            <div className="card-body p-4">{renderMobileCard(item, idx)}</div>
          </div>
        ))}
      </div>

      {/* Desktop: Table layout */}
      <div className="hidden md:block overflow-x-auto rounded-lg border border-base-300 bg-base-100">
        <table className="table table-sm w-full">
          <thead>
            <tr className="bg-base-200 text-base-content">
              {columns.map((col, i) => (
                <th key={i} className={col.className || ''}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{data.map((item, idx) => renderDesktopRow(item, idx))}</tbody>
        </table>
      </div>
    </>
  );
};

export default ResponsiveTable;
