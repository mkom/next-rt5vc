import { useEffect } from 'react';

const alertClassMap = {
  success: 'alert-success',
  error: 'alert-error',
  warning: 'alert-warning',
};

const Alert = ({ show, type = 'success', message, onClose }) => {
  useEffect(() => {
    if (show && onClose) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div role="alert" className={`alert ${alertClassMap[type] || 'alert-info'} mb-4`}>
      <span>{message}</span>
      {onClose && (
        <button onClick={onClose} className="btn btn-ghost btn-xs">
          ✕
        </button>
      )}
    </div>
  );
};

export default Alert;
