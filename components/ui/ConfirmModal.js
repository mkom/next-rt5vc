import { HiOutlineExclamationCircle } from 'react-icons/hi';
import { FaRegTrashAlt, FaTimes } from 'react-icons/fa';

/**
 * ConfirmModal - Standardized confirmation dialog
 *
 * Features:
 * - Consistent button styling
 * - Accessible focus management
 * - Responsive layout
 * - Configurable variant (error, primary, success)
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether modal is visible
 * @param {Function} props.onConfirm - Confirm handler
 * @param {Function} props.onCancel - Cancel handler
 * @param {string} props.title - Modal title (optional)
 * @param {string} props.message - Confirmation message
 * @param {string} props.confirmLabel - Confirm button text (default: 'Hapus')
 * @param {string} props.variant - Button variant: 'error' | 'primary' | 'success' (default: 'error')
 */
const ConfirmModal = ({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message,
  confirmLabel = 'Hapus',
  variant = 'error',
}) => {
  if (!isOpen) return null;

  // Map variant to button classes
  const variantClasses = {
    error: 'btn-error',
    primary: 'btn-primary',
    success: 'btn-success',
  };

  const buttonClass = variantClasses[variant] || variantClasses.error;

  return (
    <div className="fixed inset-0 z-[9999] flex items-end lg:items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onCancel}
      />
      
      {/* Modal Content */}
      <div
        className="relative bg-base-100 rounded-t-2xl lg:rounded-xl shadow-2xl max-w-sm w-full mx-4 overflow-hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        role="dialog"
        aria-modal="true"
      >
        {/* Header with icon */}
        <div className="flex flex-col items-center gap-4 pt-6 pb-4 px-6">
          <div className="w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center">
            <HiOutlineExclamationCircle className="h-10 w-10 text-warning" aria-hidden="true" />
          </div>
          {title && <h3 className="font-semibold text-lg text-center">{title}</h3>}
          <p className="text-center text-base-content/70 text-sm leading-relaxed">{message}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 p-4 pt-2 border-t border-base-200">
          <button
            type="button"
            className={`btn ${buttonClass} btn-sm flex-1 gap-2 touch-target-sm shadow-md hover:shadow-lg transition-all`}
            onClick={onConfirm}
          >
            <FaRegTrashAlt className="h-4 w-4" />
            {confirmLabel}
          </button>
          <button 
            type="button" 
            className="btn btn-ghost btn-sm touch-target-sm px-4 gap-2"
            onClick={onCancel}
          >
            <FaTimes className="h-4 w-4" />
            Batal
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
