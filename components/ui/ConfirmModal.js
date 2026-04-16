import { HiOutlineExclamationCircle } from 'react-icons/hi';

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

  return (
    <div className="modal modal-open items-end lg:items-center">
      <div className="modal-box rounded-t-2xl rounded-b-none lg:rounded-xl max-w-sm w-full"
           style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="flex flex-col items-center gap-4 py-2">
          <HiOutlineExclamationCircle className="h-14 w-14 text-warning" />
          {title && <h3 className="font-semibold text-lg">{title}</h3>}
          <p className="text-center text-base-content/80">{message}</p>
        </div>
        <div className="modal-action justify-center gap-3">
          <button className={`btn btn-${variant}`} onClick={onConfirm}>
            {confirmLabel}
          </button>
          <button className="btn btn-ghost" onClick={onCancel}>
            Batal
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onCancel} />
    </div>
  );
};

export default ConfirmModal;
