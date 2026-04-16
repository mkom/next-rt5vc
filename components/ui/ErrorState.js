import { HiExclamationCircle, HiRefresh } from 'react-icons/hi';

/**
 * ErrorState Component
 * Menampilkan pesan error dengan tombol retry
 * 
 * @param {Object} props
 * @param {string} props.title - Judul error
 * @param {string} props.message - Pesan error detail
 * @param {Function} props.onRetry - Handler untuk retry
 * @param {number} props.retryCount - Jumlah percobaan retry
 * @param {number} props.maxRetries - Maksimum percobaan retry (default: 3)
 */
const ErrorState = ({ 
  title = 'Gagal Memuat Data',
  message = 'Terjadi kesalahan saat mengambil data. Silakan coba lagi.',
  onRetry,
  retryCount = 0,
  maxRetries = 3
}) => (
  <div className="app-card p-8 flex flex-col items-center justify-center text-center">
    <div className="w-16 h-16 rounded-full bg-error/10 text-error flex items-center justify-center mb-4">
      <HiExclamationCircle className="w-8 h-8" />
    </div>
    <p className="text-base-content font-extrabold text-lg mb-2">{title}</p>
    <p className="text-sm text-base-content/60 mb-6 max-w-[280px]">{message}</p>
    
    {onRetry && (
      <button 
        onClick={onRetry}
        disabled={retryCount >= maxRetries}
        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all
          ${retryCount >= maxRetries 
            ? 'bg-base-300 text-base-content/40 cursor-not-allowed' 
            : 'bg-primary text-primary-content hover:bg-primary/90 active:scale-95'}`}
      >
        <HiRefresh className="w-4 h-4" />
        {retryCount >= maxRetries ? 'Silakan refresh halaman' : 'Coba Lagi'}
      </button>
    )}
    
    {retryCount > 0 && retryCount < maxRetries && (
      <p className="text-[10px] text-base-content/40 mt-3">
        Percobaan ke-{retryCount} dari {maxRetries}
      </p>
    )}
  </div>
);

export default ErrorState;
