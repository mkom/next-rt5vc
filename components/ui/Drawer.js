/**
 * Drawer - Responsive slide-out panel
 *
 * Features:
 * - Mobile: Bottom sheet style with fixed footer for actions
 * - Desktop: Side panel
 * - Standardized z-index
 * - Accessible close button
 * - Configurable widths
 * - Optional footer slot for action buttons
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether drawer is visible
 * @param {Function} props.onClose - Close handler
 * @param {string} props.title - Drawer title
 * @param {React.ReactNode} props.icon - Optional icon
 * @param {string} props.width - Width variant: 'sm' | 'md' | 'lg'
 * @param {React.ReactNode} props.children - Drawer content
 * @param {React.ReactNode} props.footer - Optional footer content (actions)
 */

import React from 'react';

const sizeClasses = {
  sm: 'lg:max-w-sm',
  md: 'lg:max-w-lg',
  lg: 'lg:max-w-2xl',
};

const Drawer = ({ isOpen, onClose, title, icon, width = 'md', children, footer }) => {
  // State untuk mengatur height drawer saat keyboard muncul
  const [drawerHeight, setDrawerHeight] = React.useState('80vh');
  
  React.useEffect(() => {
    const handleResize = () => {
      // Hitung height berdasarkan visual viewport
      const vh = window.visualViewport ? window.visualViewport.height : window.innerHeight;
      const viewportHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
      const windowHeight = window.innerHeight;
      
      // Jika viewport lebih kecil dari window height (keyboard muncul)
      if (viewportHeight < windowHeight * 0.9) {
        // Gunakan 100% dari viewport yang tersedia dikurangi sedikit ruang
        setDrawerHeight(`${Math.min(vh - 40, windowHeight * 0.6)}px`);
      } else {
        setDrawerHeight('80vh');
      }
    };

    if (typeof window !== 'undefined') {
      window.visualViewport?.addEventListener('resize', handleResize);
      window.addEventListener('resize', handleResize);
      handleResize(); // Initial call
      
      return () => {
        window.visualViewport?.removeEventListener('resize', handleResize);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, []);

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
        className={`lg:hidden fixed left-0 right-0 bg-base-100 rounded-t-2xl flex flex-col transition-transform duration-300 z-[60] ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{
          bottom: '64px', // Di atas BottomNav
          maxHeight: 'calc(100vh - 64px - 60px)', // 100vh - BottomNav - margin atas
        }}
      >
        {/* Handle bar */}
        <div className="w-10 h-1 bg-base-300 rounded-full mx-auto mt-2 flex-shrink-0" />
        
        {/* Header */}
        <div className="flex-shrink-0 bg-base-100 border-b border-base-300 px-4 py-3 flex items-center justify-between">
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
        
        {/* Content - Scrollable */}
        <div 
          className="flex-1 overflow-y-auto px-4 py-4"
          style={{ minHeight: 0 }}
        >
          {children}
          {/* Spacer untuk memastikan konten bisa di-scroll sampai atas footer */}
          {footer && <div style={{ height: '80px' }} />}
        </div>
        
        {/* Footer - Fixed at bottom */}
        {footer && (
          <div 
            className="flex-shrink-0 bg-base-100 border-t border-base-200 px-4 py-3"
            style={{
              boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
            }}
          >
            {footer}
          </div>
        )}
      </div>

      {/* Desktop: Side panel */}
      <div
        className={`hidden lg:flex lg:flex-col relative ml-auto w-full ${sizeClasses[width]} bg-base-100 h-full shadow-lg transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex-shrink-0 bg-base-100 border-b border-base-300 px-6 py-4 flex items-center justify-between">
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
        
        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0">
          {children}
        </div>
        
        {/* Footer */}
        {footer && (
          <div className="flex-shrink-0 bg-base-100 border-t border-base-200 px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Drawer;
