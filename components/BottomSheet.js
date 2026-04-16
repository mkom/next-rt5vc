import { useEffect, useCallback, useState } from 'react';

const BottomSheet = ({ isOpen, onClose, title, children }) => {
  const [mounted, setMounted] = useState(false);
  const [show, setShow] = useState(false);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      // Small delay to trigger animation
      const timer = setTimeout(() => setShow(true), 10);
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      return () => clearTimeout(timer);
    } else {
      setShow(false);
      const timer = setTimeout(() => setMounted(false), 300);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      return () => clearTimeout(timer);
    }
  }, [isOpen, handleKeyDown]);

  if (!mounted) return null;

  return (
    <div className={`fixed inset-0 z-[100] transition-opacity duration-300 ${show ? 'opacity-100' : 'opacity-0'}`}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300" 
        onClick={onClose} 
      />
      
      {/* Sheet */}
      <div 
        className={`absolute bottom-0 inset-x-0 z-50 bg-white rounded-t-[32px] shadow-2xl transition-transform duration-300 ease-out flex flex-col max-h-[85vh]
          ${show ? 'translate-y-0' : 'translate-y-full'}`}
        style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}
      >
        {/* Handle bar */}
        <div className="w-full flex justify-center py-3 cursor-grab active:cursor-grabbing" onClick={onClose}>
          <div className="w-12 h-1.5 bg-base-300 rounded-full opacity-50" />
        </div>

        {title && (
          <div className="px-6 pb-4 pt-1 flex items-center justify-between border-b border-base-100 mb-2">
            <h3 className="text-lg font-bold text-base-content tracking-tight">{title}</h3>
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-base-100 flex items-center justify-center text-base-content/40 hover:text-base-content transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
        )}
        
        <div className="px-6 overflow-y-auto scrollbar-hide flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};

export default BottomSheet;
