import { FaRegEdit } from 'react-icons/fa';
import ResponsiveTable from '../ui/ResponsiveTable';

/**
 * UsersTable - Table component for displaying users data
 *
 * Features:
 * - Mobile card view
 * - Desktop table view
 * - Shows: No, Nama, WhatsApp, Email, Edit button
 * - Loading skeleton state
 * - Accessible buttons
 *
 * @param {Object} props
 * @param {Array} props.users - Array of users to display
 * @param {number} props.offset - Row number offset for pagination
 * @param {Function} props.onEditClick - Handler for edit button click
 * @param {boolean} props.loading - Loading state
 */
const UsersTable = ({
  users = [],
  offset = 0,
  onEditClick,
  loading = false,
}) => {
  // Loading skeleton for mobile cards
  const renderMobileSkeleton = () => (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="app-card p-4 animate-pulse">
          <div className="flex items-center justify-between gap-2">
            <div className="w-32 h-5 rounded bg-base-300" />
            <div className="w-16 h-8 rounded bg-base-300" />
          </div>
          <div className="flex flex-col gap-1 mt-2">
            <div className="w-48 h-4 rounded bg-base-300" />
            <div className="w-32 h-4 rounded bg-base-300" />
          </div>
        </div>
      ))}
    </div>
  );

  // Loading skeleton for desktop table
  const renderDesktopSkeleton = () => (
    <div className="hidden md:block overflow-x-auto rounded-lg border border-base-300 bg-base-100">
      <table className="table table-sm w-full">
        <thead>
          <tr className="bg-base-200">
            <th className="w-8">No</th>
            <th>Nama</th>
            <th>WhatsApp</th>
            <th>Email</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {[1, 2, 3, 4, 5].map((i) => (
            <tr key={i} className="animate-pulse">
              <td><div className="w-4 h-3 rounded bg-base-300" /></td>
              <td><div className="w-32 h-3 rounded bg-base-300" /></td>
              <td><div className="w-28 h-3 rounded bg-base-300" /></td>
              <td><div className="w-40 h-3 rounded bg-base-300" /></td>
              <td><div className="w-16 h-6 rounded bg-base-300" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  if (loading) {
    return (
      <>
        {renderMobileSkeleton()}
        {renderDesktopSkeleton()}
      </>
    );
  }

  const columns = [
    { label: 'No', className: 'w-8' },
    { label: 'Nama', className: 'w-1/4' },
    { label: 'WhatsApp', className: 'w-1/4' },
    { label: 'Email', className: 'w-1/3' },
    { label: '', className: 'w-16' },
  ];

  const renderMobileCard = (user, index) => (
    <div className="flex justify-between items-center">
      <div>
        <div className="font-semibold text-sm">
          {user.username} / {user.name || '-'}
        </div>
        <div className="text-xs text-base-content/70 mt-1">
          WhatsApp: {user.whatsapp_number || '-'} &nbsp; Email: {user.email || '-'}
        </div>
      </div>
      <button
        className="btn btn-ghost btn-xs gap-1 touch-target-sm"
        onClick={() => onEditClick?.(user)}
        aria-label="Edit user"
      >
        <FaRegEdit className="h-3 w-3" /> Edit
      </button>
    </div>
  );

  const renderDesktopRow = (user, index) => (
    <tr key={user._id || index} className="hover:bg-base-200/50 transition-colors">
      <td className="text-xs">{offset + index + 1}</td>
      <td className="text-xs md:text-sm">{user.name || user.username}</td>
      <td className="text-xs">{user.whatsapp_number || '-'}</td>
      <td className="text-xs">{user.email || '-'}</td>
      <td>
        <button
          className="btn btn-ghost btn-xs gap-1 touch-target-sm"
          onClick={() => onEditClick?.(user)}
          aria-label="Edit user"
        >
          <FaRegEdit className="h-3 w-3" /> Edit
        </button>
      </td>
    </tr>
  );

  return (
    <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
      <ResponsiveTable
        data={users}
        columns={columns}
        renderMobileCard={renderMobileCard}
        renderDesktopRow={renderDesktopRow}
        emptyMessage="Tidak ada data user"
      />
    </div>
  );
};

export default UsersTable;
