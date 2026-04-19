/**
 * Drawer - Responsive slide-out panel
 *
 * Features:
 * - Mobile: Bottom sheet style
 * - Desktop: Side panel
 * - Standardized z-index
 * - Accessible close button
 * - Configurable widths
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether drawer is visible
 * @param {Function} props.onClose - Close handler
 * @param {string} props.title - Drawer title
 * @param {React.ReactNode} props.icon - Optional icon
 * @param {string} props.width - Width variant: 'sm' | 'md' | 'lg'
 * @param {React.ReactNode} props.children - Drawer content
 */

const sizeClasses = {
  sm: 'lg:max-w-sm',
  md: 'lg:max-w-lg',
  lg: 'lg:max-w-2xl',
};

const Drawer = ({ isOpen, onClose, title, icon, width = 'md', children }) => {
  return (
    <div
      className={`fixed inset-0 z-drawer flex transition-all duration-300 ${
        isOpen ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Mobile: Bottom sheet */}
      <div
        className={`lg:hidden fixed bottom-0 inset-x-0 bg-base-100 rounded-t-2xl max-h-[85vh] overflow-y-auto transition-transform duration-300 ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="w-10 h-1 bg-base-300 rounded-full mx-auto mt-2" />
        <div className="sticky top-0 z-sticky bg-base-100 border-b border-base-300 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <h2 className="text-base font-semibold">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-square touch-target-sm"
            aria-label="Close drawer"
          >
            ✕
          </button>
        </div>
        <div className="px-4 py-4">{children}</div>
      </div>

      {/* Desktop: Side panel */}
      <div
        className={`hidden lg:block relative ml-auto w-full ${sizeClasses[width]} bg-base-100 h-full shadow-lg overflow-y-auto transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="sticky top-0 z-sticky bg-base-100 border-b border-base-300 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <h2 className="text-lg font-semibold">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-square touch-target-sm"
            aria-label="Close drawer"
          >
            ✕
          </button>
        </div>
        <div className="px-6 py-4">{children}</div>
      </div>
    </div>
  );
};

export default Drawer;
