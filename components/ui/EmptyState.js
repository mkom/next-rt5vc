import { HiInbox } from 'react-icons/hi';

/**
 * EmptyState Component
 * Menampilkan state kosong dengan icon dan pesan
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.icon - Icon yang ditampilkan (default: HiInbox)
 * @param {string} props.title - Judul pesan
 * @param {string} props.description - Deskripsi tambahan
 * @param {React.ReactNode} props.action - Action button atau link (opsional)
 */
const EmptyState = ({ 
  icon = <HiInbox className="w-12 h-12" />, 
  title = 'Tidak ada data', 
  description = 'Data yang Anda cari tidak ditemukan.',
  action = null 
}) => (
  <div className="app-card p-8 flex flex-col items-center justify-center text-center">
    <div className="text-base-content/20 mb-4">
      {icon}
    </div>
    <p className="text-base-content font-bold text-lg mb-1">{title}</p>
    {description && (
      <p className="text-sm text-base-content/50 max-w-[240px]">{description}</p>
    )}
    {action && (
      <div className="mt-4">
        {action}
      </div>
    )}
  </div>
);

export default EmptyState;
