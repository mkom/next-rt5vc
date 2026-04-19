import { useEffect } from 'react';

/**
 * Alert - Standardized alert notification
 *
 * Features:
 * - Auto-dismiss after 3 seconds
 * - Multiple variants (success, error, warning, info)
 * - Accessible close button
 * - Consistent styling
 *
 * @param {Object} props
 * @param {boolean} props.show - Whether alert is visible
 * @param {string} props.type - Alert type: 'success' | 'error' | 'warning' | 'info'
 * @param {string} props.message - Alert message
 * @param {Function} props.onClose - Close handler (optional)
 */

const alertClassMap = {
  success: 'alert-success',
  error: 'alert-error',
  warning: 'alert-warning',
  info: 'alert-info',
};

const Alert = ({ show, type = 'success', message, onClose }) => {
  useEffect(() => {
    if (show && onClose) {
      const timer = setTimeout(onClose, 5000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div
      role="alert"
      className={`alert ${alertClassMap[type] || 'alert-info'} mb-4 shadow-sm animate-fade-in`}
    >
      <span className="text-sm">{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="btn btn-ghost btn-sm btn-square touch-target-sm ml-2"
          aria-label="Close alert"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default Alert;
